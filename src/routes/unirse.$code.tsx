import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinRoom } from "@/lib/rooms.functions";
import { assignCards } from "@/lib/cards.functions";
import { saveSession, sessionForRoom } from "@/lib/session";
import { cn } from "@/lib/utils";
import { unlockAudio } from "@/lib/audio";

export const Route = createFileRoute("/unirse/$code")({
  head: () => ({
    meta: [
      { title: "Unirse al Bingo — Bingo 75 Online" },
      {
        name: "description",
        content: "Introduce tu nombre para entrar a la sala de Bingo.",
      },
    ],
  }),
  component: QuickJoin,
});

function QuickJoin() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Si ya tiene sesión activa para esta sala, entrar directo
    const existing = sessionForRoom(code);
    if (existing) {
      navigate({ to: "/sala/$code", params: { code } });
    }
  }, [code, navigate]);

  const enter = async () => {
    if (name.trim().length < 2) {
      toast.error("Escribe tu nombre");
      return;
    }
    setBusy(true);
    void unlockAudio();
    try {
      const result = await joinRoom({ data: { name: name.trim(), code: code.toUpperCase() } });
      saveSession({
        playerId: result.playerId,
        token: result.token,
        roomCode: result.roomCode,
        name: name.trim(),
        isHost: false,
      });
      await assignCards({ data: { playerId: result.playerId, token: result.token, count } });
      navigate({ to: "/sala/$code", params: { code: result.roomCode } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo entrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header className="text-center">
        <p className="text-5xl">🎟️</p>
        <h1 className="font-display text-primary mt-2 text-4xl uppercase tracking-widest">Unirse a Sala</h1>
        <p className="font-display text-3xl mt-1 tracking-[0.2em]">{code.toUpperCase()}</p>
      </header>

      <section className="panel space-y-5 p-6 border-primary/20">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Tu nombre para jugar</Label>
          <Input
            id="name"
            value={name}
            autoFocus
            maxLength={20}
            placeholder="Ej: Pedro"
            className="h-12 text-lg"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm uppercase tracking-widest font-bold text-muted-foreground text-center block">¿Con cuántos cartones jugarás?</Label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                type="button"
                variant={count === n ? "default" : "secondary"}
                className={cn("h-14 font-display text-2xl shadow-sm transition-all active:scale-95")}
                onClick={() => setCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="h-16 w-full text-xl font-bold shadow-lg mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          disabled={busy}
          onClick={() => void enter()}
        >
          {busy ? "ENTRANDO..." : "¡ENTRAR AHORA!"}
        </Button>
      </section>

      <footer className="text-center">
        <Button
          variant="link"
          className="text-muted-foreground text-xs uppercase tracking-widest"
          onClick={() => navigate({ to: "/" })}
        >
          Ir al inicio
        </Button>
      </footer>
    </main>
  );
}
