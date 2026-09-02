import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { Player } from "@/hooks/useGameState";

/** Lista de jugadores con estado de conexión en tiempo real. */
export function PlayersPanel({ players }: { players: Player[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <Users className="mr-1 h-4 w-4" />
          {players.length}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-96">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Jugadores · {players.length}</SheetTitle>
        </SheetHeader>
        <ul className="mt-4 space-y-2 overflow-y-auto pb-8">
          {players.map((p) => (
            <li
              key={p.id}
              className="panel flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="truncate">
                {p.name}
                {p.is_host && <span className="text-primary ml-2 text-xs">ANFITRIÓN</span>}
              </span>
              <span className="shrink-0 text-xs">
                {p.connected ? "🟢 Conectado" : "🔴 Desconectado"}
              </span>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
