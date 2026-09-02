import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const nameSchema = z.string().trim().min(2).max(20);
const authSchema = z.object({ playerId: z.string().uuid(), token: z.string().uuid() });

function getEnv(key: string): string | undefined {
  let val: string | undefined;
  try {
    val = (globalThis as any)[key] || (import.meta as any).env?.[key];
    if (!val && typeof process !== 'undefined') {
      val = (process as any).env?.[key];
    }
  } catch (e) {
    console.warn(`[Env Rooms] Error al leer ${key}:`, e);
  }
  return val;
}

/** Crea la sala, el jugador anfitrión y la primera partida (en espera). */
export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; creationCode: string }) =>
    z.object({
      name: nameSchema,
      creationCode: z.string().trim().min(4, "El código debe tener al menos 4 caracteres")
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { db, uniqueRoomCode } = await import("@/lib/game.server");

    // 1. Validar código de creación
    const inputCode = data.creationCode.trim().toUpperCase();
    const MASTER_CODE = (getEnv('MASTER_CREATION_CODE') || 'PMFF2309').trim().toUpperCase();

    let isMaster = inputCode === MASTER_CODE;
    let isAuthorizedAdmin = isMaster;
    let usedCodeId = null;

    if (!isMaster) {
      // Validar contra códigos normales en la base de datos
      const { data: codeRow, error: codeError } = await db
        .from("room_creation_codes")
        .select("*")
        .eq("code", inputCode)
        .eq("is_active", true)
        .maybeSingle();

      if (codeError || !codeRow) {
        throw new Error("Código de creación no válido o inactivo");
      }

      // Verificar si ya tiene una sala activa (exclusivo para códigos normales)
      const { count: activeRooms } = await db
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("created_by_code_id", codeRow.id)
        .neq("status", "FINISHED");

      if ((activeRooms ?? 0) > 0) {
        throw new Error("Este código ya tiene una sala activa. Finalízala para crear una nueva.");
      }

      // Verificar vencimiento
      if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
        throw new Error("El código de creación ha vencido");
      }

      // Verificar límite de uso
      if (codeRow.use_limit !== null && codeRow.use_count >= codeRow.use_limit) {
        throw new Error("El código de creación ha agotado sus usos permitidos");
      }

      usedCodeId = codeRow.id;

      // Incrementar contador de uso
      await db
        .from("room_creation_codes")
        .update({ use_count: codeRow.use_count + 1 })
        .eq("id", codeRow.id);
    }

    // 2. Proceder con la creación de la sala
    const code = await uniqueRoomCode();

    const { data: room, error: roomError } = await db
      .from("rooms")
      .insert({
        code,
        status: "WAITING",
        created_by_code_id: usedCodeId
      })
      .select("id, code")
      .single();
    if (roomError || !room) throw new Error("No se pudo crear la sala");

    const { data: player, error: playerError } = await db
      .from("players")
      .insert({
        room_id: room.id,
        name: data.name,
        is_host: true,
        is_authorized_admin: isAuthorizedAdmin
      })
      .select("id")
      .single();
    if (playerError || !player) throw new Error("No se pudo crear el anfitrión");

    const { data: session } = await db
      .from("player_sessions")
      .insert({ player_id: player.id })
      .select("token")
      .single();

    await db.from("rooms").update({ host_player_id: player.id }).eq("id", room.id);
    const { data: game } = await db
      .from("games")
      .insert({ room_id: room.id, status: "WAITING", game_number: 1 })
      .select("id")
      .single();

    const { initializeCardPool } = await import("@/lib/game.server");
    await initializeCardPool(game!.id);

    return {
      roomCode: room.code,
      playerId: player.id,
      token: session!.token as string,
      gameId: game!.id as string,
      isHost: true,
    };
  });

/** Un jugador entra a una sala existente con nombre + código. */
export const joinRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; code: string }) =>
    z.object({ name: nameSchema, code: z.string().trim().min(4).max(8) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db } = await import("@/lib/game.server");
    const code = data.code.toUpperCase();

    const { data: room } = await db
      .from("rooms")
      .select("id, code, status, max_players")
      .eq("code", code)
      .maybeSingle();
    if (!room) throw new Error("La sala no existe");
    if (room.status === "FINISHED") throw new Error("La partida de esta sala ya terminó");
    if (room.status !== "WAITING") throw new Error("La partida ya comenzó");

    const { count } = await db
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if ((count ?? 0) >= room.max_players) throw new Error("La sala está llena");

    // Evitar nombres duplicados en la misma sala (case-insensitive)
    const { data: same } = await db
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .ilike("name", data.name)
      .limit(1)
      .maybeSingle();
    if (same) throw new Error("El nombre ya está en uso en esta sala");

    const { data: player, error } = await db
      .from("players")
      .insert({ room_id: room.id, name: data.name, is_host: false })
      .select("id")
      .single();
    if (error || !player) throw new Error("No se pudo entrar a la sala");

    const { data: session } = await db
      .from("player_sessions")
      .insert({ player_id: player.id })
      .select("token")
      .single();

    return {
      roomCode: room.code,
      playerId: player.id,
      token: session!.token as string,
      isHost: false,
    };
  });

/** Mantiene el estado de conexión del jugador. */
export const heartbeat = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string }) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    await requirePlayer(data.playerId, data.token);
    await db
      .from("players")
      .update({ connected: true, last_seen_at: new Date().toISOString() })
      .eq("id", data.playerId);

    // Marca como desconectados a los jugadores sin señal reciente.
    const { data: player } = await db
      .from("players")
      .select("room_id")
      .eq("id", data.playerId)
      .single();
    if (player) {
      await db
        .from("players")
        .update({ connected: false })
        .eq("room_id", player.room_id)
        .eq("connected", true)
        .lt("last_seen_at", new Date(Date.now() - 45_000).toISOString());
    }
    return { ok: true };
  });

/** El anfitrión inicia la partida (WAITING -> PLAYING). */
export const startGame = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; prize: number }) =>
    authSchema.extend({ prize: z.number().min(0).max(1_000_000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requireHost } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id, status")
      .eq("room_id", host.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!game) throw new Error("No hay partida en la sala");
    if (game.status !== "WAITING") throw new Error("La partida ya está en curso");

    const { count } = await db
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("game_id", game.id);
    if ((count ?? 0) === 0) throw new Error("Ningún jugador tiene cartones todavía");

    const now = new Date().toISOString();
    await db
      .from("games")
      .update({ status: "PLAYING", started_at: now, prize: data.prize })
      .eq("id", game.id);
    await db.from("rooms").update({ status: "PLAYING", started_at: now }).eq("id", host.room_id);
    return { gameId: game.id };
  });

/** Pausar / continuar / finalizar. */
export const setGameStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; status: string }) =>
    authSchema.extend({ status: z.enum(["PAUSED", "PLAYING", "FINISHED"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    const player = await requirePlayer(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id, status")
      .eq("room_id", player.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!game) throw new Error("No hay partida en la sala");
    if (game.status === "FINISHED") throw new Error("La partida ya terminó");

    // Solo el host puede finalizar o reanudar después de una pausa si él lo decidió,
    // pero permitimos que CUALQUIERA pause para verificar.
    if (data.status === "FINISHED" && !player.is_host) {
      throw new Error("Solo el anfitrión puede finalizar la partida");
    }

    if (data.status === "PLAYING" && game.status === "WAITING" && !player.is_host) {
      throw new Error("Solo el anfitrión puede iniciar la partida");
    }

    const now = new Date().toISOString();

    // Si pasamos a PLAYING (continuar), reseteamos el tiempo de la última bola
    // para dar un respiro antes de que salga la siguiente automática.
    const updates: any = {
      status: data.status,
      finished_at: data.status === "FINISHED" ? now : null,
    };
    if (data.status === "PLAYING") {
      updates.last_ball_at = now;
    }

    await db
      .from("games")
      .update(updates)
      .eq("id", game.id);

    await db
      .from("rooms")
      .update({
        status: data.status,
        finished_at: data.status === "FINISHED" ? now : null,
      })
      .eq("id", player.room_id);
    return { ok: true };
  });

/** Solicita una pausa al anfitrión. */
export const requestPause = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string }) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    const player = await requirePlayer(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id, status")
      .eq("room_id", player.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!game || game.status !== "PLAYING") throw new Error("La partida no está en curso");

    await db
      .from("games")
      .update({ pause_requested_by: player.id })
      .eq("id", game.id);

    return { ok: true };
  });

/** El anfitrión maneja una solicitud de pausa (aceptar/ignorar). */
export const handlePauseRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; accept: boolean }) =>
    authSchema.extend({ accept: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requireHost } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id, status")
      .eq("room_id", host.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!game) throw new Error("No hay partida");

    const updates: any = { pause_requested_by: null };
    if (data.accept) {
      updates.status = "PAUSED";
    }

    await db.from("games").update(updates).eq("id", game.id);

    if (data.accept) {
      await db.from("rooms").update({ status: "PAUSED" }).eq("id", host.room_id);
    }

    return { ok: true };
  });

/** Cambia el estado de "Listo" del jugador. */
export const toggleReady = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; ready: boolean }) =>
    authSchema.extend({ ready: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    await requirePlayer(data.playerId, data.token);

    const { error } = await db
      .from("players")
      .update({ is_ready: data.ready })
      .eq("id", data.playerId);

    if (error) throw new Error("No se pudo actualizar el estado");
    return { ok: true };
  });

/** Actualiza el intervalo entre bolas (velocidad). */
export const updateBallInterval = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; interval: number }) =>
    authSchema.extend({ interval: z.number().int().min(1).max(10) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requireHost } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id")
      .eq("room_id", host.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!game) throw new Error("No hay partida");

    const { error } = await db
      .from("games")
      .update({ ball_interval: data.interval })
      .eq("id", game.id);

    if (error) throw new Error("No se pudo actualizar la velocidad");
    return { ok: true };
  });

/** Actualiza el patrón de victoria. */
export const updateWinningPattern = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; pattern: string }) =>
    authSchema.extend({ pattern: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requireHost } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);

    const { data: game } = await db
      .from("games")
      .select("id")
      .eq("room_id", host.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!game) throw new Error("No hay partida");

    const { error } = await db
      .from("games")
      .update({ winning_pattern: data.pattern })
      .eq("id", game.id);

    if (error) throw new Error("No se pudo actualizar el modo de juego");
    return { ok: true };
  });

/** Genera un nuevo código de creación (Solo administradores autorizados). */
export const generateCreationCode = createServerFn({ method: "POST" })
  .inputValidator((input: {
    playerId: string;
    token: string;
    days: number | null;
    limit: number | null
  }) => authSchema.extend({
    days: z.number().nullable(),
    limit: z.number().nullable()
  }).parse(input))
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    const player = await requirePlayer(data.playerId, data.token);

    if (!player.is_authorized_admin) {
      throw new Error("No tienes autorización para generar códigos");
    }

    // Generar código de 4 dígitos alfanumérico aleatorio
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newCode = "";
    for (let i = 0; i < 4; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let expiresAt = null;
    if (data.days !== null) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (data.days * 24));
    }

    const { data: inserted, error } = await db
      .from("room_creation_codes")
      .insert({
        code: newCode,
        use_limit: data.limit,
        expires_at: expiresAt?.toISOString()
      })
      .select("code, expires_at, use_limit")
      .single();

    if (error) {
      console.error("[Codes] Error insertando código:", error);
      throw new Error("Error al generar el código en la base de datos");
    }
    return inserted;
  });

/** Obtiene los códigos de creación activos para el administrador. */
export const getActiveCreationCodes = createServerFn({ method: "GET" })
  .inputValidator((input: { playerId: string; token: string }) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    const player = await requirePlayer(data.playerId, data.token);

    if (!player.is_authorized_admin) {
      throw new Error("No autorizado");
    }

    const now = new Date().toISOString();
    const { data: codes, error } = await db
      .from("room_creation_codes")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Error al obtener códigos");

    // Filtrar los que ya superaron el límite de uso
    return (codes ?? []).filter(c => c.use_limit === null || c.use_count < c.use_limit);
  });

/** Nueva partida en la misma sala: bolas y cartones se reinician. */
export const newGame = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string }) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { db, requireHost } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);

    const { data: last } = await db
      .from("games")
      .select("id, game_number, status")
      .eq("room_id", host.room_id)
      .order("game_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (last && last.status !== "FINISHED") throw new Error("La partida actual no ha terminado");

    const { data: game, error } = await db
      .from("games")
      .insert({
        room_id: host.room_id,
        status: "WAITING",
        game_number: (last?.game_number ?? 0) + 1,
      })
      .select("id")
      .single();
    if (error || !game) throw new Error("No se pudo crear la nueva partida");

    const { initializeCardPool } = await import("@/lib/game.server");
    await initializeCardPool(game.id);

    await db
      .from("rooms")
      .update({ status: "WAITING", started_at: null, finished_at: null })
      .eq("id", host.room_id);
    return { gameId: game.id };
  });
