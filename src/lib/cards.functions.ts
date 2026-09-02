import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authSchema = z.object({ playerId: z.string().uuid(), token: z.string().uuid() });

/** Genera en el servidor los cartones del jugador (1-3) para la partida en espera. */
export const assignCards = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; count: number }) =>
    authSchema.extend({ count: z.number().int().min(1).max(3) }).parse(input),
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
    if (game.status !== "WAITING") throw new Error("La partida ya comenzó");

    // Usar la función RPC para asignar cartones de forma atómica y evitar duplicados
    const { error } = await db.rpc("assign_cards_from_pool", {
      p_player_id: player.id,
      p_game_id: game.id,
      p_count: data.count,
    });

    if (error) {
      console.error("[Cards] Error en assign_cards_from_pool:", error);
      throw new Error(error.message || "No se pudieron asignar los cartones");
    }

    const { data: inserted } = await db
      .from("cards")
      .select("id, card_number, numbers")
      .eq("player_id", player.id)
      .eq("game_id", game.id)
      .order("card_number");

    return { gameId: game.id, cards: inserted ?? [] };
  });

/** Cambia un cartón concreto por otro generado en el servidor (elegir cartón). */
export const rerollCard = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; cardNumber: number }) =>
    authSchema.extend({ cardNumber: z.number().int().min(1).max(3) }).parse(input),
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
    if (game.status !== "WAITING") throw new Error("La partida ya comenzó");

    // Usar la función RPC para cambiar el cartón de forma atómica
    const { error } = await db.rpc("reroll_single_card", {
      p_player_id: player.id,
      p_game_id: game.id,
      p_card_number: data.cardNumber,
    });

    if (error) {
      console.error("[Cards] Error en reroll_single_card:", error);
      throw new Error(error.message || "No se pudo cambiar el cartón");
    }

    return { ok: true };
  });
