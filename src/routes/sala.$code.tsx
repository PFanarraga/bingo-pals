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
import { startGame, toggleReady, updateBallInterval, updateWinningPattern, generateCreationCode, getActiveCreationCodes } from "@/lib/rooms.functions";
import { sessionForRoom, type PlayerSession } from "@/lib/session";
import { FREE_INDEX, PATTERNS, type WinningPattern } from "@/lib/bingo";
import { Copy, RefreshCw, Share2, Timer, Target, KeyRound, CheckCircle, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { playIntro, unlockAudio } from "@/lib/audio";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

function CreationCodeModal({ playerId, token }: { playerId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<string>("0");
  const [customDays, setCustomDays] = useState<string>("1");
  const [limit, setLimit] = useState<string>("0");
  const [customLimit, setCustomLimit] = useState<string>("1");
  const [generated, setGenerated] = useState<{ code: string; expires_at: string | null; use_limit: number | null } | null>(null);
  const [activeCodes, setActiveCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"form" | "result" | "list">("form");

  const loadActive = async () => {
    try {
      const res = await getActiveCreationCodes({ data: { playerId, token } });
      setActiveCodes(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateCreationCode({
        data: {
          playerId,
          token,
          days: days === "custom" ? Number(customDays) : (days === "0" ? null : Number(days)),
          limit: limit === "custom" ? Number(customLimit) : (limit === "0" ? null : Number(limit))
        }
      });
      setGenerated(res);
      setView("result");
      void loadActive();
    } catch (e) {
      toast.error("Error al generar código");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setGenerated(null);
    setDays("0");
    setLimit("0");
    setView("form");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); if (val) void loadActive(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
          <KeyRound className="mr-2 h-4 w-4" />
          GENERAR CÓDIGO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="font-display text-2xl">Gestión de Códigos</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => setView(view === "list" ? "form" : "list")}>
            {view === "list" ? <Clock className="h-4 w-4" /> : <History className="h-4 w-4" />}
          </Button>
        </DialogHeader>

        {view === "form" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vencimiento (Días)</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin vencimiento</SelectItem>
                  <SelectItem value="1">1 día</SelectItem>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="custom">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
              {days === "custom" && (
                <Input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={e => setCustomDays(e.target.value)}
                  placeholder="Ej: 100"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Límite de uso (Partidas)</Label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ilimitado</SelectItem>
                  <SelectItem value="1">1 uso</SelectItem>
                  <SelectItem value="5">5 usos</SelectItem>
                  <SelectItem value="10">10 usos</SelectItem>
                  <SelectItem value="custom">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
              {limit === "custom" && (
                <Input
                  type="number"
                  min="1"
                  value={customLimit}
                  onChange={e => setCustomLimit(e.target.value)}
                  placeholder="Ej: 3"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleGenerate} disabled={loading}>
                {loading ? "GENERANDO..." : "GENERAR CÓDIGO"}
              </Button>
            </div>
            {activeCodes.length > 0 && (
              <Button variant="link" className="w-full text-xs" onClick={() => setView("list")}>
                Ver {activeCodes.length} códigos activos
              </Button>
            )}
          </div>
        )}

        {view === "result" && generated && (
          <div className="space-y-6 py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="font-display text-2xl text-green-500">Código generado</h3>
            </div>

            <div className="space-y-1">
              <p className="text-4xl font-mono font-bold tracking-[0.5em] text-primary uppercase">{generated.code}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {generated.expires_at ? `Vence: ${new Date(generated.expires_at).toLocaleDateString()}` : "Sin vencimiento"}
                {" · "}
                {generated.use_limit ? `${generated.use_limit} usos` : "Usos ilimitados"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 h-12 text-lg"
                onClick={async () => {
                  await navigator.clipboard.writeText(generated.code);
                  toast.success("Código copiado");
                }}
              >
                COPIAR
              </Button>
              <Button variant="outline" className="h-12" onClick={() => setView("form")}>
                NUEVO
              </Button>
            </div>
          </div>
        )}

        {view === "list" && (
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto pr-2">
            {activeCodes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic">No hay códigos activos</p>
            ) : (
              activeCodes.map(c => (
                <div key={c.id} className="panel p-3 flex items-center justify-between gap-3 border-white/5">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-primary text-lg uppercase tracking-widest">{c.code}</p>
                    <p className="text-[10px] text-muted-foreground uppercase truncate">
                      {c.expires_at ? (
                        <>Vence {formatDistanceToNow(new Date(c.expires_at), { addSuffix: true, locale: es })}</>
                      ) : "Sin vencimiento"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {c.use_limit ? `Usos: ${c.use_count} / ${c.use_limit}` : "Usos: Ilimitados"}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(c.code);
                    toast.success("Copiado");
                  }}>
                    COPIAR
                  </Button>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => setView("form")}>
              VOLVER ATRÁS
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WaitingRoom() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [prize, setPrize] = useState("0");
  const [busy, setBusy] = useState(false);
  const [localInterval, setLocalInterval] = useState<number | null>(null);

  useEffect(() => {
    const found = sessionForRoom(code);
    if (!found) {
      navigate({ to: "/" });
      return;
    }
    setSession(found);
  }, [code, navigate]);

  const state = useGameState(code, session?.playerId);

  const me = state.players.find(p => p.id === session?.playerId);
  const isAuthorizedAdmin = Boolean(me?.is_authorized_admin);

  // Sincronizar intervalo local con la DB si no estamos arrastrando
  useEffect(() => {
    if (state.game?.ball_interval !== undefined && localInterval === null) {
      setLocalInterval(state.game.ball_interval);
    }
  }, [state.game?.ball_interval, localInterval]);

  useHeartbeat(session?.playerId, session?.token);
  const isHost = Boolean(session?.isHost);

  const connectedPlayers = state.players.filter(p => p.connected);
  const unreadyPlayers = connectedPlayers.filter(p => !p.is_ready);
  const allReady = connectedPlayers.length > 0 && unreadyPlayers.length === 0;

  // Inicio automático cuando todos están listos y el host tiene cartones
  useEffect(() => {
    if (isHost && allReady && state.game?.status === "WAITING" && state.cards.length > 0 && !busy) {
      void start();
    }
  }, [isHost, allReady, state.game?.status, state.cards.length, busy]);

  useEffect(() => {
    if (!state.game) return;
    if (state.game.status === "PLAYING" || state.game.status === "PAUSED") {
      playIntro();
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
    void unlockAudio();
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
    void unlockAudio();
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
        {isHost && (
          <>
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
          </>
        )}
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
        <section className="panel space-y-4 p-4">
          {isAuthorizedAdmin && (
            <div className="border-b border-white/10 pb-4 mb-2">
              <CreationCodeModal playerId={session!.playerId} token={session!.token} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="prize">Premio de la partida (opcional)</Label>
            <Input
              id="prize"
              inputMode="decimal"
              value={prize}
              onChange={(e) => setPrize(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>

          <div className="space-y-3 pt-2">
            {/* Selector de Modo de Juego */}
            <div className="space-y-1.5 rounded-lg border bg-secondary/20 p-3">
              <Label className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                Modo de victoria
              </Label>
              <Select
                value={state.game?.winning_pattern || "LINE"}
                onValueChange={async (val) => {
                  if (!session) return;
                  try {
                    await updateWinningPattern({
                      data: { playerId: session.playerId, token: session.token, pattern: val }
                    });
                  } catch (e) {
                    toast.error("No se pudo cambiar el modo de juego");
                  }
                }}
              >
                <SelectTrigger className="w-full bg-background/50 border-white/10">
                  <SelectValue placeholder="Elige un modo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PATTERNS).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <span className="font-bold">{info.label}</span>
                      <p className="text-[10px] opacity-60 leading-none">{info.description}</p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Velocidad Optimizado */}
            <div className="space-y-2.5 rounded-lg border bg-secondary/20 p-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  Velocidad de juego
                </Label>
                <span className="font-display text-primary text-xl">
                  {localInterval ?? state.game?.ball_interval ?? 10}s
                </span>
              </div>
              <Slider
                value={[localInterval ?? state.game?.ball_interval ?? 10]}
                min={1}
                max={10}
                step={1}
                onValueChange={(vals) => setLocalInterval(vals[0]!)}
                onValueCommit={async (vals) => {
                  if (!session || !vals[0]) return;
                  try {
                    await updateBallInterval({
                      data: {
                        playerId: session.playerId,
                        token: session.token,
                        interval: vals[0]
                      }
                    });
                  } catch (e) {
                    toast.error("No se pudo guardar la velocidad");
                  }
                }}
              />
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter">
                Arrastra y suelta para ajustar
              </p>
            </div>

            <Button
              variant={state.players.find(p => p.id === session?.playerId)?.is_ready ? "default" : "outline"}
              className={cn("h-14 w-full text-lg", state.players.find(p => p.id === session?.playerId)?.is_ready && "bg-green-600 hover:bg-green-700")}
              disabled={busy}
              onClick={async () => {
                const me = state.players.find(p => p.id === session?.playerId);
                if (!session || !me) return;
                setBusy(true);
                try {
                  await toggleReady({ data: { playerId: session.playerId, token: session.token, ready: !me.is_ready } });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {state.players.find(p => p.id === session?.playerId)?.is_ready ? "¡ESTOY LISTO!" : "MARCAR LISTO (HOST)"}
            </Button>

            {!allReady && (
              <p className="text-amber-500 text-center text-sm font-medium animate-pulse">
                Faltan {unreadyPlayers.length} {unreadyPlayers.length === 1 ? 'jugador' : 'jugadores'} por marcar LISTO
              </p>
            )}

            {allReady && (
              <p className="text-green-500 text-center text-sm font-bold animate-bounce">
                ¡INICIANDO PARTIDA EN AUTOMÁTICO!
              </p>
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          <Button
            variant={state.players.find(p => p.id === session?.playerId)?.is_ready ? "default" : "outline"}
            className={cn("h-14 w-full text-lg", state.players.find(p => p.id === session?.playerId)?.is_ready && "bg-green-600 hover:bg-green-700")}
            disabled={busy}
            onClick={async () => {
              const me = state.players.find(p => p.id === session?.playerId);
              if (!session || !me) return;
              void unlockAudio();
              setBusy(true);
              try {
                await toggleReady({ data: { playerId: session.playerId, token: session.token, ready: !me.is_ready } });
              } finally {
                setBusy(false);
              }
            }}
          >
            {state.players.find(p => p.id === session?.playerId)?.is_ready ? "¡ESTOY LISTO!" : "MARCAR LISTO"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {allReady ? "¡Todos listos! El anfitrión ya puede iniciar." : `Esperando a ${unreadyPlayers.length} jugadores...`}
          </p>
        </div>
      )}
    </main>
  );
}
