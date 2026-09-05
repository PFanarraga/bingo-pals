import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Sorteo automático. Se llama desde el cliente de forma periódica,
 * pero el servidor solo ejecuta el sorteo si se cumplen las condiciones:
 * 1. Todos los jugadores conectados están LISTOS.
 * 2. Ha pasado el tiempo necesario (ball_interval).
 * 3. El juego está en status PLAYING.
 */
export const autoDrawBall = createServerFn({ method: "POST" })
  .inputValidator((input: { playerId: string; token: string; gameId: string }) =>
    z
      .object({
        playerId: z.string().uuid(),
        token: z.string().uuid(),
        gameId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { db, requirePlayer } = await import("@/lib/game.server");
    await requirePlayer(data.playerId, data.token);

    // Ejecutar el sorteo de forma atómica en el servidor de base de datos
    const { data: ball, error } = await db.rpc("draw_next_ball", {
      p_game_id: data.gameId
    });

    if (error) {
      console.error("[Draw] Error RPC:", error);
      return { ok: false, reason: "SERVER_ERROR" };
    }

    if (ball === null) {
      return { ok: false, reason: "NOT_READY_OR_COMPLETED" };
    }

    return { ok: true, ball };
  });
