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
    const { generateCard } = await import("@/lib/bingo");
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

    await db.from("cards").delete().eq("player_id", player.id).eq("game_id", game.id);

    const rows = Array.from({ length: data.count }, (_, i) => ({
      player_id: player.id,
      game_id: game.id,
      card_number: i + 1,
      numbers: generateCard(),
    }));
    const { data: cards, error } = await db.from("cards").insert(rows).select("id, card_number, numbers");
    if (error) throw new Error("No se pudieron generar los cartones");
    return { gameId: game.id, cards };
  });

/** Cambia un cartón concreto por otro generado en el servidor (elegir cartón). */
export const rerollCard = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; cardNumber: number }) =>
    authSchema.extend({ cardNumber: z.number().int().min(1).max(3) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    const { generateCard } = await import("@/lib/bingo");
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

    const { error } = await db
      .from("cards")
      .update({ numbers: generateCard() })
      .eq("player_id", player.id)
      .eq("game_id", game.id)
      .eq("card_number", data.cardNumber);
    if (error) throw new Error("No se pudo cambiar el cartón");
    return { ok: true };
  });
