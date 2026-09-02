import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BingoCardView } from "@/components/bingo/BingoCardView";
import { CardCarousel } from "@/components/bingo/CardCarousel";
import { LastBalls } from "@/components/bingo/LastBalls";
import { AllBallsModal } from "@/components/bingo/AllBallsModal";
import { PlayersPanel } from "@/components/host/PlayersPanel";
import { HostControls } from "@/components/host/HostControls";
import { useGameState } from "@/hooks/useGameState";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { useMarks } from "@/hooks/useMarks";
import { claimBingo } from "@/lib/claims.functions";
import { sessionForRoom, type PlayerSession } from "@/lib/session";
import { hasMarkedLine } from "@/lib/bingo";
import { announceBall, isAudioEnabled, playComment, setAudioEnabled, unlockAudio } from "@/lib/audio";
import { Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/juego/$code")({
  head: () => ({
    meta: [
      { title: "Partida en curso — Bingo 75 Online" },
      {
        name: "description",
        content:
          "Marca manualmente tus números, consulta las 75 bolas y canta bingo cuando completes una línea.",
      },
      { property: "og:title", content: "Partida en curso — Bingo 75 Online" },
      { property: "og:description", content: "Bingo de 75 bolas en tiempo real." },
    ],
  }),
  component: GameScreen,
});

function GameScreen() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sound, setSound] = useState(true);
  const [activeCard, setActiveCard] = useState(0);
  const [busy, setBusy] = useState(false);
  const lastBallRef = useRef<number | null>(null);
  const lastClaimRef = useRef<string | null>(null);

  useEffect(() => {
    const found = sessionForRoom(code);
    if (!found) {
      navigate({ to: "/" });
      return;
    }
    setSession(found);
    void unlockAudio();
  }, [code, navigate]);

  const state = useGameState(code, session?.playerId);
  const online = useHeartbeat(session?.playerId, session?.token);
  const { getMarks, toggle } = useMarks(state.game?.id ?? null);
  const isHost = Boolean(session?.isHost);

  useEffect(() => {
    if (!state.game) return;
    if (state.game.status === "WAITING") navigate({ to: "/sala/$code", params: { code } });
    if (state.game.status === "FINISHED") navigate({ to: "/resultado/$code", params: { code } });
  }, [state.game, code, navigate]);

  // Audio de la bola nueva (letra + pausa + número) y comentarios controlados.
  useEffect(() => {
    const ball = state.game?.current_ball ?? null;
    if (!ball) return;
    if (lastBallRef.current === null) {
      lastBallRef.current = ball;
      return;
    }
    if (lastBallRef.current === ball) return;
    lastBallRef.current = ball;
    if (isAudioEnabled()) {
      announceBall(ball);
      playComment("random", { minBalls: 6 });
    }
  }, [state.game?.current_ball]);

  // Aviso de bingos cantados por otros jugadores.
  useEffect(() => {
    const last = state.claims[state.claims.length - 1];
    if (!last) return;
    if (lastClaimRef.current === last.id) return;
    lastClaimRef.current = last.id;
    const player = state.players.find((p) => p.id === last.player_id);
    if (!player || last.player_id === session?.playerId) return;
    if (last.status === "INVALID") {
      toast.error(`BINGO NO VÁLIDO · ${player.name}`);
      playComment("fakeBingo");
    } else {
      toast.success(`${player.name.toUpperCase()} HA CANTADO BINGO`);
      playComment("bingo");
    }
  }, [state.claims, state.players, session?.playerId]);

  const drawn = state.game?.drawn_balls ?? [];
  const drawnSet = new Set(drawn);
  const current = state.cards[activeCard];
  const canCallBingo = Boolean(current) && hasMarkedLine(getMarks(current!.id));

  const callBingo = async () => {
    if (!session || !state.game || !current) return;
    setBusy(true);
    try {
      const marks = getMarks(current.id);
      const result = await claimBingo({
        data: {
          playerId: session.playerId,
          token: session.token,
          gameId: state.game.id,
          cardId: current.id,
          marked: marks.map((m, i) => (m ? i : -1)).filter((i) => i >= 0),
        },
      });
      if (result.status === "VALID") {
        toast.success("¡BINGO! Esperando la verificación del anfitrión");
        playComment("bingo");
      } else {
        toast.error("BINGO NO VÁLIDO");
        playComment("fakeBingo");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cantar bingo");
    } finally {
      setBusy(false);
    }
  };

  if (state.error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <p>{state.error}</p>
        <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-3 px-3 pt-3 pb-28">
      <header className="panel space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Sala</p>
            <p className="font-display truncate text-2xl tracking-widest">{code.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{online ? "🟢" : "🔴"}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const next = !sound;
                setSound(next);
                setAudioEnabled(next);
                if (next) void unlockAudio();
              }}
              aria-label={sound ? "Silenciar" : "Activar sonido"}
            >
              {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <AllBallsModal drawn={drawn} />
            <PlayersPanel players={state.players} />
          </div>
        </div>

        <LastBalls drawn={drawn} />
        <p className="text-muted-foreground text-center text-xs">
          {drawn.length} / 75 bolas
          {state.game?.status === "PAUSED" && " · PARTIDA EN PAUSA"}
        </p>
      </header>

      {isHost && session && state.game && (
        <HostControls
          game={state.game}
          playerId={session.playerId}
          token={session.token}
          claims={state.claims}
        />
      )}

      {state.cards.length > 0 ? (
        <CardCarousel
          onActiveChange={setActiveCard}
          items={state.cards.map((card) => (
            <BingoCardView
              key={card.id}
              numbers={card.numbers}
              marked={getMarks(card.id)}
              drawn={drawnSet}
              onToggle={(index) => toggle(card.id, index)}
            />
          ))}
        />
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No tienes cartones en esta partida.
        </p>
      )}

      <div className="bg-background/90 fixed inset-x-0 bottom-0 border-t px-3 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <Button
            className="h-16 w-full text-2xl"
            disabled={!canCallBingo || busy || state.game?.status === "FINISHED"}
            onClick={callBingo}
          >
            ¡BINGO!
          </Button>
        </div>
      </div>
    </main>
  );
}
