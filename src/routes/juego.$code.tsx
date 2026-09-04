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
import { isPatternAchieved, PATTERNS, type WinningPattern } from "@/lib/bingo";
import { announceBall, isAudioEnabled, setAudioEnabled, unlockAudio, playBingoPressed, playWinnerConfirmed, playAllBallsDrawn } from "@/lib/audio";
import { Volume2, VolumeX, Pause, Play, CheckCircle2, Loader2, Target } from "lucide-react";
import { autoDrawBall } from "@/lib/balls.functions";
import { setGameStatus, toggleReady, requestPause, handlePauseRequest } from "@/lib/rooms.functions";
import { cn } from "@/lib/utils";

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

    // Escuchar cualquier clic en la ventana para mantener el audio "vivo"
    const wake = () => void unlockAudio();
    window.addEventListener("click", wake);
    return () => window.removeEventListener("click", wake);
  }, [code, navigate]);

  const state = useGameState(code, session?.playerId);
  const online = useHeartbeat(session?.playerId, session?.token);
  const { getMarks, toggle } = useMarks(state.game?.id ?? null);
  const isHost = Boolean(session?.isHost);
  const me = state.players.find(p => p.id === session?.playerId);

  // Sistema de sorteo automático
  useEffect(() => {
    if (!session || !state.game || state.game.status !== "PLAYING") return;

    const interval = setInterval(async () => {
      try {
        await autoDrawBall({
          data: {
            playerId: session.playerId,
            token: session.token,
            gameId: state.game!.id
          }
        });
      } catch (err) {
        // Silenciamos errores del auto-draw para no molestar al usuario
        console.error("Auto-draw error:", err);
      }
    }, 3000); // Reintentar cada 3s (el servidor controla el intervalo real de 10s)

    return () => clearInterval(interval);
  }, [session, state.game?.id, state.game?.status]);

  useEffect(() => {
    if (!state.game) return;
    if (state.game.status === "WAITING") navigate({ to: "/sala/$code", params: { code } });
    if (state.game.status === "FINISHED") navigate({ to: "/resultado/$code", params: { code } });
  }, [state.game, code, navigate]);

  // Audio de la bola nueva (letra + pausa + número).
  useEffect(() => {
    const ball = state.game?.current_ball ?? null;
    if (!ball) return;

    // Si la bola es diferente a la última que procesamos, la cantamos
    if (lastBallRef.current !== ball) {
      lastBallRef.current = ball;
      if (isAudioEnabled()) {
        announceBall(ball);
      }
    }
  }, [state.game?.current_ball]);

  // Aviso de bingos cantados.
  useEffect(() => {
    const last = state.claims[state.claims.length - 1];
    if (!last) return;
    if (lastClaimRef.current === last.id) return;
    lastClaimRef.current = last.id;

    // Suena para todos cuando alguien presiona Bingo
    playBingoPressed();

    const player = state.players.find((p) => p.id === last.player_id);
    if (!player || last.player_id === session?.playerId) return;
    if (last.status === "INVALID") {
      toast.error(`BINGO NO VÁLIDO · ${player.name}`);
    } else {
      toast.success(`${player.name.toUpperCase()} HA CANTADO BINGO`);
    }
  }, [state.claims, state.players, session?.playerId]);

  // Audio final del juego (Ganador o Fin de bolas)
  const lastStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (!state.game) return;
    if (lastStatusRef.current === state.game.status) return;

    if (state.game.status === "FINISHED") {
      if (state.winners.length > 0) {
        playWinnerConfirmed();
      } else if (state.game.drawn_balls.length >= 75) {
        playAllBallsDrawn();
      }
    }

    lastStatusRef.current = state.game.status;
  }, [state.game?.status, state.winners.length, state.game?.drawn_balls.length]);

  const drawn = state.game?.drawn_balls ?? [];
  const drawnSet = new Set(drawn);
  const current = state.cards[activeCard];
  const currentPattern = (state.game?.winning_pattern || "LINE") as WinningPattern;
  const canCallBingo = Boolean(current) && isPatternAchieved(getMarks(current!.id), currentPattern);

  const handleToggleReady = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await toggleReady({
        data: {
          playerId: session.playerId,
          token: session.token,
          ready: !me?.is_ready
        }
      });
    } catch (error) {
      toast.error("No se pudo cambiar el estado de listo");
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePause = async () => {
    if (!session || !state.game) return;
    void unlockAudio();
    setBusy(true);
    try {
      if (isHost) {
        const nextStatus = state.game.status === "PLAYING" ? "PAUSED" : "PLAYING";
        await setGameStatus({
          data: {
            playerId: session.playerId,
            token: session.token,
            status: nextStatus
          }
        });
        toast.success(nextStatus === "PAUSED" ? "Partida pausada" : "Partida reanudada");
      } else {
        if (state.game.status === "PAUSED") {
          toast.error("Solo el anfitrión puede reanudar la partida");
          return;
        }
        await requestPause({
          data: {
            playerId: session.playerId,
            token: session.token
          }
        });
        toast.info("Solicitud de pausa enviada al anfitrión");
      }
    } catch (error) {
      toast.error("No se pudo procesar la solicitud");
    } finally {
      setBusy(false);
    }
  };

  const handlePauseDecision = async (accept: boolean) => {
    if (!session || !isHost) return;
    setBusy(true);
    try {
      await handlePauseRequest({
        data: {
          playerId: session.playerId,
          token: session.token,
          accept
        }
      });
      toast.success(accept ? "Pausa aceptada" : "Pausa rechazada");
    } catch (error) {
      toast.error("No se pudo procesar la acción");
    } finally {
      setBusy(false);
    }
  };

  const callBingo = async () => {
    if (!session || !state.game || !current) return;
    void unlockAudio();
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
            <PlayersPanel players={state.players} allCards={state.allCards} />
          </div>
        </div>

        <div className="flex justify-between items-center bg-secondary/30 rounded-lg px-3 py-2 border border-secondary/50">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Jugador</p>
            <p className="font-display text-sm truncate max-w-[120px]">{session?.name.toUpperCase()}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[9px] text-amber-500 uppercase font-bold tracking-tighter leading-none mb-1">Objetivo</p>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              <Target className="h-3 w-3 text-amber-500" />
              <span className="font-display text-[11px] text-amber-500">{PATTERNS[currentPattern]?.label.toUpperCase()}</span>
            </div>
          </div>
          {state.game && state.game.prize > 0 && (
            <div className="text-right space-y-0.5">
              <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">Pozo</p>
              <p className="font-display text-lg text-primary leading-none">S/.{state.game.prize}</p>
            </div>
          )}
        </div>

        <LastBalls drawn={drawn} />
        <p className="text-muted-foreground text-center text-xs">
          {drawn.length} / 75 bolas
          {state.game?.status === "PAUSED" && " · PARTIDA EN PAUSA"}
        </p>
      </header>

      {isHost && session && state.game && (
        <div className="space-y-3 mb-3">
          {state.game.pause_requested_by && (
            <div className="panel border-amber-500/50 border-2 p-3 space-y-3 animate-in fade-in zoom-in duration-300">
              <p className="text-center text-sm font-bold">
                {state.players.find(p => p.id === state.game?.pause_requested_by)?.name.toUpperCase()} SOLICITA PAUSA
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={() => handlePauseDecision(true)} disabled={busy}>
                  ACEPTAR
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePauseDecision(false)} disabled={busy}>
                  IGNORAR
                </Button>
              </div>
            </div>
          )}

          {state.claims.some(c => c.status === "VALID") && (
            <div className="panel p-3 border-primary/50 border-2">
               <Button
                className="w-full h-12"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const { verifyBingos } = await import("@/lib/claims.functions");
                    const result = await verifyBingos({ data: { playerId: session.playerId, token: session.token, gameId: state.game!.id } });
                    toast.success(result.winners > 0 ? "¡BINGO CONFIRMADO!" : "BINGO NO VÁLIDO");
                  } catch (e) {
                    toast.error("Error al verificar");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                VERIFICAR BINGO PENDIENTE
              </Button>
            </div>
          )}
        </div>
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

      <div className="bg-background/90 fixed inset-x-0 bottom-0 border-t px-3 py-4 backdrop-blur shadow-2xl">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-5 gap-3 items-stretch">
            <Button
              className="h-16 text-2xl font-bold col-span-3 shadow-lg transition-all active:scale-95"
              disabled={!canCallBingo || busy || state.game?.status === "FINISHED"}
              onClick={callBingo}
            >
              ¡BINGO!
            </Button>

            <Button
              variant="secondary"
              className={cn(
                "h-16 flex-col gap-1 col-span-2 shadow-md transition-all active:scale-95",
                !isHost && state.game?.status === "PAUSED" && "opacity-50"
              )}
              disabled={busy || state.game?.status === "FINISHED" || (!isHost && state.game?.status === "PAUSED")}
              onClick={handleTogglePause}
            >
              {state.game?.status === "PAUSED" ? (
                <>
                  <Play className={cn("h-6 w-6", !isHost && "opacity-50")} />
                  <span className="text-[10px] font-bold uppercase">{isHost ? "Reanudar" : "Pausado"}</span>
                </>
              ) : (
                <>
                  <Pause className="h-6 w-6" />
                  <span className="text-[10px] font-bold uppercase">{isHost ? "Pausar" : "Pausa"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
