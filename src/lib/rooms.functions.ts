import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const nameSchema = z.string().trim().min(2).max(20);
const authSchema = z.object({ playerId: z.string().uuid(), token: z.string().uuid() });

/** Crea la sala, el jugador anfitrión y la primera partida (en espera). */
export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string }) => z.object({ name: nameSchema }).parse(input))
  .handler(async ({ data }) => {
    const { db, uniqueRoomCode } = await import("@/lib/game.server");
    const code = await uniqueRoomCode();

    const { data: room, error: roomError } = await db
      .from("rooms")
      .insert({ code, status: "WAITING" })
      .select("id, code")
      .single();
    if (roomError || !room) throw new Error("No se pudo crear la sala");

    const { data: player, error: playerError } = await db
      .from("players")
      .insert({ room_id: room.id, name: data.name, is_host: true })
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
    if (game.status === "FINISHED") throw new Error("La partida ya terminó");
    if (data.status !== "FINISHED" && game.status === "WAITING")
      throw new Error("La partida no ha comenzado");

    const now = new Date().toISOString();
    await db
      .from("games")
      .update({
        status: data.status,
        finished_at: data.status === "FINISHED" ? now : null,
      })
      .eq("id", game.id);
    await db
      .from("rooms")
      .update({
        status: data.status,
        finished_at: data.status === "FINISHED" ? now : null,
      })
      .eq("id", host.room_id);
    return { ok: true };
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

    await db
      .from("rooms")
      .update({ status: "WAITING", started_at: null, finished_at: null })
      .eq("id", host.room_id);
    return { gameId: game.id };
  });
