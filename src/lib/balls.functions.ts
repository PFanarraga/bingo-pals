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
    const player = await requirePlayer(data.playerId, data.token);

    // 1. Obtener estado actual del juego y jugadores
    const { data: game } = await db
      .from("games")
      .select("id, status, drawn_balls, last_ball_at, ball_interval, room_id")
      .eq("id", data.gameId)
      .single();

    if (!game || game.status !== "PLAYING") return { ok: false, reason: "NOT_PLAYING" };

    const drawn = game.drawn_balls ?? [];
    if (drawn.length >= 75) return { ok: false, reason: "COMPLETED" };

    // 2. Verificar si ha pasado el tiempo
    const lastBall = new Date(game.last_ball_at || 0).getTime();
    const now = Date.now();
    const elapsed = (now - lastBall) / 1000;

    if (elapsed < game.ball_interval) {
      return { ok: false, reason: "WAITING_TIME", remaining: Math.round(game.ball_interval - elapsed) };
    }

    // 3. Todo OK -> Sacar bola
    const remaining: number[] = [];
    const used = new Set(drawn);
    for (let n = 1; n <= 75; n++) if (!used.has(n)) remaining.push(n);
    const ball = remaining[Math.floor(Math.random() * remaining.length)]!;

    const { error } = await db
      .from("games")
      .update({
        drawn_balls: [...drawn, ball],
        current_ball: ball,
        last_ball_at: new Date().toISOString()
      })
      .eq("id", game.id)
      .eq("status", "PLAYING");

    if (error) throw new Error("No se pudo sacar la bola");

    return { ok: true, ball };
  });
