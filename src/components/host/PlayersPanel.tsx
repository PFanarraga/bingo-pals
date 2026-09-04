import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, CreditCard } from "lucide-react";
import type { Player, Card } from "@/hooks/useGameState";

/** Lista de jugadores con estado de conexión y preparación. */
export function PlayersPanel({ players, allCards = [] }: { players: Player[], allCards?: Card[] }) {
  const getCardCount = (playerId: string) => {
    return allCards.filter(c => c.player_id === playerId).length;
  };

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
          {players.map((p) => {
            const cardCount = getCardCount(p.id);
            return (
              <li
                key={p.id}
                className="panel flex flex-col gap-1 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    {p.is_ready && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                    <span className="truncate font-bold">
                      {p.name}
                      {p.is_host && <span className="text-primary ml-2 text-[10px] border border-primary px-1 rounded">HOST</span>}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase font-medium">
                    {p.connected ? "🟢 En línea" : "🔴 Fuera"}
                  </span>
                </div>

                {cardCount > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs bg-secondary/20 px-2 py-0.5 rounded-md w-fit">
                    <CreditCard className="h-3 w-3" />
                    <span>{cardCount} {cardCount === 1 ? 'cartón' : 'cartones'}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
