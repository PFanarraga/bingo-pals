import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BingoCardView } from "@/components/bingo/BingoCardView";
import { CardCarousel } from "@/components/bingo/CardCarousel";
import { useGameState } from "@/hooks/useGameState";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { assignCards, rerollCard } from "@/lib/cards.functions";
import { startGame } from "@/lib/rooms.functions";
import { sessionForRoom, type PlayerSession } from "@/lib/session";
import { FREE_INDEX } from "@/lib/bingo";
import { Copy, RefreshCw, Share2 } from "lucide-react";

export const Route = createFileRoute("/sala/$code")({
  head: () => ({
    meta: [
      { title: "Sala de espera — Bingo 75 Online" },
      {
        name: "description",
        content: "Comparte el código, elige tus cartones y espera a que el anfitrión inicie el bingo.",
      },
      { property: "og:title", content: "Sala de espera — Bingo 75 Online" },
      { property: "og:description", content: "Jugadores conectados y selección de cartones." },
    ],
  }),
  component: WaitingRoom,
});

const freeMarks = (() => {
  const arr = new Array<boolean>(25).fill(false);
  arr[FREE_INDEX] = true;
  return arr;
})();

function WaitingRoom() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [prize, setPrize] = useState("0");
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
  useHeartbeat(session?.playerId, session?.token);
  const isHost = Boolean(session?.isHost);

  useEffect(() => {
    if (!state.game) return;
    if (state.game.status === "PLAYING" || state.game.status === "PAUSED") {
      navigate({ to: "/juego/$code", params: { code } });
    } else if (state.game.status === "FINISHED") {
      navigate({ to: "/resultado/$code", params: { code } });
    }
  }, [state.game, code, navigate]);

  if (state.error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-5">
        <p>{state.error}</p>
        <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
      </main>
    );
  }

  const share = async () => {
    const text = `Únete a mi Bingo 75 con el código ${code.toUpperCase()}`;
    if (navigator.share) {
      await navigator.share({ title: "Bingo 75", text }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(text).catch(() => undefined);
      toast.success("Código copiado");
    }
  };

  const changeCount = async (count: number) => {
    if (!session) return;
    setBusy(true);
    try {
      await assignCards({ data: { playerId: session.playerId, token: session.token, count } });
      state.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar los cartones");
    } finally {
      setBusy(false);
    }
  };

  const reroll = async (cardNumber: number) => {
    if (!session) return;
    setBusy(true);
    try {
      await rerollCard({ data: { playerId: session.playerId, token: session.token, cardNumber } });
      state.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar el cartón");
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await startGame({
        data: { playerId: session.playerId, token: session.token, prize: Number(prize) || 0 },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-6">
      <header className="text-center">
        <h1 className="font-display text-primary text-4xl">🎱 BINGO 75</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sala</p>
        <p className="font-display text-5xl tracking-[0.2em]">{code.toUpperCase()}</p>
        <div className="mt-3 flex justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={share}>
            <Share2 className="mr-1 h-4 w-4" /> Compartir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(code.toUpperCase()).catch(() => undefined);
              toast.success("Código copiado");
            }}
          >
            <Copy className="mr-1 h-4 w-4" /> Copiar
          </Button>
        </div>
      </header>

      <section className="panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Jugadores</h2>
          <span className="font-display text-primary text-2xl">{state.players.length}</span>
        </div>
        <ul className="mt-3 max-h-44 space-y-1.5 overflow-y-auto">
          {state.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {p.name}
                {p.is_host && <span className="text-primary ml-2 text-xs">ANFITRIÓN</span>}
              </span>
              <span className="text-xs">{p.connected ? "🟢" : "🔴"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Tus cartones</h2>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                size="sm"
                variant={state.cards.length === n ? "default" : "secondary"}
                disabled={busy}
                onClick={() => changeCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {state.cards.length > 0 && (
          <CardCarousel
            items={state.cards.map((card) => (
              <div key={card.id} className="space-y-2">
                <BingoCardView
                  numbers={card.numbers}
                  marked={freeMarks}
                  drawn={new Set<number>()}
                  onToggle={() => undefined}
                  disabled
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={busy}
                  onClick={() => reroll(card.card_number)}
                >
                  <RefreshCw className="mr-1 h-4 w-4" /> CAMBIAR CARTÓN {card.card_number}
                </Button>
              </div>
            ))}
          />
        )}
        <Button
          variant="secondary"
          className="w-full"
          disabled={busy}
          onClick={() => changeCount(state.cards.length || 1)}
        >
          CARTONES AL AZAR
        </Button>
      </section>

      {isHost ? (
        <section className="panel space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="prize">Premio de la partida (opcional)</Label>
            <Input
              id="prize"
              inputMode="decimal"
              value={prize}
              onChange={(e) => setPrize(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <Button className="h-14 w-full text-lg" disabled={busy} onClick={start}>
            INICIAR JUEGO
          </Button>
        </section>
      ) : (
        <p className="text-muted-foreground py-4 text-center text-sm">Esperando al anfitrión…</p>
      )}
    </main>
  );
}
