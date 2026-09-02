import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import { newGame } from "@/lib/rooms.functions";
import { clearSession, sessionForRoom, type PlayerSession } from "@/lib/session";

export const Route = createFileRoute("/resultado/$code")({
  head: () => ({
    meta: [
      { title: "Resultado de la partida — Bingo 75 Online" },
      {
        name: "description",
        content: "Ganadores del bingo y reparto del premio entre todos los cartones válidos.",
      },
      { property: "og:title", content: "Resultado — Bingo 75 Online" },
      { property: "og:description", content: "Ganadores y división del premio." },
    ],
  }),
  component: ResultScreen,
});

function ResultScreen() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const found = sessionForRoom(code);
    if (!found) {
      navigate({ to: "/" });
      return;
    }
    setSession(found);
  }, [code, navigate]);

  const state = useGameState(code, session?.playerId);
  const isHost = Boolean(session?.isHost);

  useEffect(() => {
    if (state.game && state.game.status === "WAITING") {
      navigate({ to: "/sala/$code", params: { code } });
    }
  }, [state.game, code, navigate]);

  const nameOf = (playerId: string) =>
    state.players.find((p) => p.id === playerId)?.name ?? "Jugador";

  const start = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await newGame({ data: { playerId: session.playerId, token: session.token } });
      navigate({ to: "/sala/$code", params: { code } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la nueva partida");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
      <header className="text-center">
        <h1 className="font-display text-primary text-4xl">PARTIDA FINALIZADA</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sala {code.toUpperCase()} · Partida {state.game?.game_number ?? 1}
        </p>
      </header>

      <section className="panel space-y-3 p-4">
        <h2 className="font-display text-2xl">
          {state.winners.length > 0 ? "BINGO CONFIRMADO" : "Sin ganadores"}
        </h2>
        {state.winners.length > 0 && (
          <p className="text-muted-foreground text-sm">
            Premio: {Number(state.game?.prize ?? 0).toFixed(2)} · {state.winners.length} ganador(es)
          </p>
        )}
        <ul className="space-y-2">
          {state.winners.map((w) => (
            <li key={w.id} className="flex items-center justify-between text-sm">
              <span className="truncate">🏆 {nameOf(w.player_id)}</span>
              <span className="font-display text-primary text-xl">
                {Number(w.prize_share).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4">
        <h2 className="font-display text-xl">Bolas sorteadas</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {(state.game?.drawn_balls ?? []).length} de 75
        </p>
      </section>

      {isHost ? (
        <Button className="h-14 w-full text-lg" disabled={busy} onClick={start}>
          NUEVA PARTIDA
        </Button>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          Esperando al anfitrión para una nueva partida…
        </p>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          clearSession();
          navigate({ to: "/" });
        }}
      >
        SALIR DE LA SALA
      </Button>
    </main>
  );
}
