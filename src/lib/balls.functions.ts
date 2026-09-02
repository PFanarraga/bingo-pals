import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Solo el anfitrión saca bolas; el servidor decide qué bola sale. */
export const drawBall = createServerFn({ method: "POST" })
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
    const { db, requireHost, getGame } = await import("@/lib/game.server");
    const host = await requireHost(data.playerId, data.token);
    const game = await getGame(data.gameId);
    if (game.room_id !== host.room_id) throw new Error("La partida no pertenece a tu sala");
    if (game.status !== "PLAYING") throw new Error("La partida no está en curso");

    const drawn = game.drawn_balls ?? [];
    if (drawn.length >= 75) throw new Error("Ya salieron las 75 bolas");

    const remaining: number[] = [];
    const used = new Set(drawn);
    for (let n = 1; n <= 75; n++) if (!used.has(n)) remaining.push(n);
    const ball = remaining[Math.floor(Math.random() * remaining.length)]!;

    const { error } = await db
      .from("games")
      .update({ drawn_balls: [...drawn, ball], current_ball: ball })
      .eq("id", game.id)
      .eq("status", "PLAYING");
    if (error) throw new Error("No se pudo sacar la bola");

    return { ball, total: drawn.length + 1 };
  });
