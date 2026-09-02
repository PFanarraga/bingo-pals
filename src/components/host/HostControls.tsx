import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pause, Play, Flag, CheckCircle2, Dices } from "lucide-react";
import { drawBall } from "@/lib/balls.functions";
import { setGameStatus } from "@/lib/rooms.functions";
import { verifyBingos } from "@/lib/claims.functions";
import type { Claim, Game } from "@/hooks/useGameState";

type Props = {
  game: Game;
  playerId: string;
  token: string;
  claims: Claim[];
  onBall?: (ball: number) => void;
};

/** Controles exclusivos del anfitrión. El servidor decide siempre el resultado. */
export function HostControls({ game, playerId, token, claims, onBall }: Props) {
  const [busy, setBusy] = useState(false);
  const pendingValid = claims.filter((c) => c.status === "VALID");


  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Acción no permitida");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {pendingValid.length > 0 && (
        <Button
          className="w-full"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const result = await verifyBingos({ data: { playerId, token, gameId: game.id } });
              toast.success(
                result.winners > 0
                  ? `BINGO CONFIRMADO · ${result.winners} ganador(es)`
                  : "BINGO NO VÁLIDO",
              );
            })
          }
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          VERIFICAR BINGO ({pendingValid.length})
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="col-span-2 h-14 text-lg"
          disabled={busy || game.status !== "PLAYING" || game.drawn_balls.length >= 75}
          onClick={() =>
            run(async () => {
              const result = await drawBall({ data: { playerId, token, gameId: game.id } });
              onBall?.(result.ball);
            })
          }
        >
          <Dices className="mr-2 h-5 w-5" />
          SACAR BOLA
        </Button>

        {game.status === "PLAYING" ? (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => setGameStatus({ data: { playerId, token, status: "PAUSED" } }))}
          >
            <Pause className="mr-2 h-4 w-4" />
            PAUSAR
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={busy || game.status === "FINISHED"}
            onClick={() =>
              run(() => setGameStatus({ data: { playerId, token, status: "PLAYING" } }))
            }
          >
            <Play className="mr-2 h-4 w-4" />
            CONTINUAR
          </Button>
        )}

        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run(() => setGameStatus({ data: { playerId, token, status: "FINISHED" } }))}
        >
          <Flag className="mr-2 h-4 w-4" />
          FINALIZAR
        </Button>
      </div>
    </div>
  );
}
