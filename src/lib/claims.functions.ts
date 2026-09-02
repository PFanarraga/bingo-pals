import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authSchema = z.object({ playerId: z.string().uuid(), token: z.string().uuid() });

/**
 * El jugador canta BINGO. El servidor valida contra las bolas realmente sorteadas;
 * el estado de marcado del cliente solo se guarda como registro.
 */
export const claimBingo = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      playerId: string;
      token: string;
      gameId: string;
      cardId: string;
      marked: number[];
    }) =>
      authSchema
        .extend({
          gameId: z.string().uuid(),
          cardId: z.string().uuid(),
          marked: z.array(z.number().int().min(0).max(24)).max(25),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requirePlayer, getGame } = await import("@/lib/game.server");
    const { hasLineWithDrawn } = await import("@/lib/bingo");
    const player = await requirePlayer(data.playerId, data.token);
    const game = await getGame(data.gameId);

    if (game.room_id !== player.room_id) throw new Error("La partida no pertenece a tu sala");
    if (game.status !== "PLAYING" && game.status !== "PAUSED")
      throw new Error("La partida no está activa");

    const { data: card } = await db
      .from("cards")
      .select("id, player_id, game_id, numbers")
      .eq("id", data.cardId)
      .maybeSingle();
    if (!card) throw new Error("Cartón no encontrado");
    if (card.player_id !== player.id) throw new Error("El cartón no es tuyo");
    if (card.game_id !== game.id) throw new Error("El cartón no pertenece a esta partida");

    const drawn = game.drawn_balls ?? [];
    const valid = hasLineWithDrawn(card.numbers as number[], drawn);

    const { data: claim, error } = await db
      .from("bingo_claims")
      .insert({
        game_id: game.id,
        player_id: player.id,
        card_id: card.id,
        status: valid ? "VALID" : "INVALID",
        marked_state: { marked: data.marked },
        ball_count: drawn.length,
        verified_at: new Date().toISOString(),
      })
      .select("id, status")
      .single();
    if (error || !claim) throw new Error("No se pudo registrar el bingo");

    return { status: claim.status as "VALID" | "INVALID", claimId: claim.id as string };
  });

/**
 * El anfitrión verifica los bingos. Todos los bingos válidos cuentan como
 * ganadores y el premio se divide entre ellos. La partida termina.
 */
export const verifyBingos = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; gameId: string }) =>
    authSchema.extend({ gameId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requireHost, getGame } = await import("@/lib/game.server");
    const { hasLineWithDrawn } = await import("@/lib/bingo");
    const host = await requireHost(data.playerId, data.token);
    const game = await getGame(data.gameId);
    if (game.room_id !== host.room_id) throw new Error("La partida no pertenece a tu sala");
    if (game.status === "FINISHED") throw new Error("La partida ya terminó");

    const { data: claims } = await db
      .from("bingo_claims")
      .select("id, player_id, card_id, status")
      .eq("game_id", game.id)
      .in("status", ["VALID", "CONFIRMED"]);

    const drawn = game.drawn_balls ?? [];
    const winners: { player_id: string; card_id: string }[] = [];
    const seen = new Set<string>();

    for (const claim of claims ?? []) {
      if (seen.has(claim.card_id)) continue;
      const { data: card } = await db
        .from("cards")
        .select("numbers")
        .eq("id", claim.card_id)
        .maybeSingle();
      if (!card) continue;
      // Revalidación definitiva en el servidor.
      if (!hasLineWithDrawn(card.numbers as number[], drawn)) continue;
      seen.add(claim.card_id);
      winners.push({ player_id: claim.player_id, card_id: claim.card_id });
    }

    if (winners.length === 0) {
      return { winners: 0, message: "No hay bingos válidos" };
    }

    const share = Number((Number(game.prize) / winners.length).toFixed(2));
    await db.from("winners").upsert(
      winners.map((w) => ({
        game_id: game.id,
        player_id: w.player_id,
        card_id: w.card_id,
        prize_share: share,
      })),
      { onConflict: "game_id,card_id" },
    );

    const validIds = (claims ?? []).filter((c) => seen.has(c.card_id)).map((c) => c.id);
    if (validIds.length) {
      await db.from("bingo_claims").update({ status: "CONFIRMED" }).in("id", validIds);
    }

    const now = new Date().toISOString();
    await db.from("games").update({ status: "FINISHED", finished_at: now }).eq("id", game.id);
    await db.from("rooms").update({ status: "FINISHED", finished_at: now }).eq("id", game.room_id);

    return { winners: winners.length, share };
  });
