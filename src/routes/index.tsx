import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom, joinRoom } from "@/lib/rooms.functions";
import { assignCards } from "@/lib/cards.functions";
import { saveSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { unlockAudio } from "@/lib/audio";
import { TutorialModal } from "@/components/ui/TutorialModal";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bingo 75 Online — Juega con tus amigos en tiempo real" },
      {
        name: "description",
        content:
          "Crea una sala, comparte el código y juega al Bingo clásico de 75 bolas con hasta 3 cartones, marcado manual y sorteo en tiempo real.",
      },
      { property: "og:title", content: "Bingo 75 Online" },
      {
        property: "og:description",
        content: "Bingo de 75 bolas para jugar online entre amigos, sin registro.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creationCode, setCreationCode] = useState("");
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    if (name.trim().length < 2) {
      toast.error("Escribe tu nombre");
      return;
    }
    if (code.trim().length < 4) {
      toast.error("Escribe el código de sala");
      return;
    }
    setBusy(true);
    void unlockAudio();
    try {
      const result = await joinRoom({ data: { name: name.trim(), code: code.trim() } });
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

  const create = async () => {
    if (name.trim().length < 2) {
      toast.error("Escribe tu nombre");
      return;
    }
    if (creationCode.length < 4) {
      toast.error("Escribe un código de creación válido");
      return;
    }
    setBusy(true);
    void unlockAudio();
    try {
      const result = await createRoom({ data: { name: name.trim(), creationCode } });
      saveSession({
        playerId: result.playerId,
        token: result.token,
        roomCode: result.roomCode,
        name: name.trim(),
        isHost: true,
      });
      await assignCards({ data: { playerId: result.playerId, token: result.token, count } });
      navigate({ to: "/sala/$code", params: { code: result.roomCode } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la sala");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <TutorialModal />
      <header className="text-center relative">
        <div className="absolute right-0 -top-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10"
            onClick={() => {
              localStorage.removeItem("bingo75:tutorial_completed");
              window.location.reload();
            }}
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-5xl">🎱</p>
        <h1 className="font-display text-primary mt-1 text-5xl">BINGO 75</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Bingo clásico de 75 bolas para jugar con tus amigos
        </p>
      </header>

      <section className="panel space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Tu nombre</Label>
          <Input
            id="name"
            value={name}
            maxLength={20}
            placeholder="Pedro"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="code">Código de sala</Label>
          <Input
            id="code"
            value={code}
            maxLength={8}
            placeholder="A7K92"
            className="font-display text-2xl tracking-[0.3em] uppercase"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cartones</Label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                type="button"
                variant={count === n ? "default" : "secondary"}
                className={cn("font-display text-xl")}
                onClick={() => setCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Button className="h-12" disabled={busy} onClick={() => void enter()}>
            UNIRSE A LA PARTIDA
          </Button>
        </div>
      </section>

      <section className="panel space-y-3 p-5 text-center">
        <p className="text-muted-foreground text-sm font-medium">¿Vas a organizar la partida?</p>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="creationCode">Código de Creación</Label>
          <Input
            id="creationCode"
            type="password"
            value={creationCode}
            maxLength={20}
            placeholder="Introduce tu código"
            className="text-center font-mono tracking-widest uppercase border-primary/30"
            onChange={(e) => setCreationCode(e.target.value.toUpperCase())}
          />
        </div>

        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Adquiere tu código</p>
          <p className="text-xs text-primary font-medium leading-relaxed">
            Para obtener un código de creación de sala, contáctanos vía WhatsApp:
          </p>
          <div className="flex flex-col gap-1 mt-2">
            <a
              href="https://wa.me/51969841802"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-display tracking-wider hover:underline"
            >
              +51 969 841 802
            </a>
            <a
              href="https://wa.me/51935149666"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-display tracking-wider hover:underline"
            >
              +51 935 149 666
            </a>
          </div>
        </div>

        <Button variant="outline" className="h-12 w-full mt-2" disabled={busy} onClick={create}>
          CREAR SALA
        </Button>
      </section>
    </main>
  );
}
