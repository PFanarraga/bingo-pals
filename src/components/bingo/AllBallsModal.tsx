import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { allBallsByLetter } from "@/lib/bingo";

/** Modal con las 75 bolas. No cambia de página ni cierra el cartón. */
export function AllBallsModal({ drawn }: { drawn: number[] }) {
  const drawnSet = new Set(drawn);
  const groups = allBallsByLetter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="font-display text-lg">
          75
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Bolas · {drawn.length} / 75
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {groups.map((group) => {
            const letterClass = `ball-${group.letter.toLowerCase()}`;
            return (
              <div key={group.letter} className="flex gap-3">
                <div className={cn(
                  "font-display w-8 h-8 shrink-0 text-xl flex items-center justify-center rounded-full border border-white/20",
                  letterClass
                )}>
                  {group.letter}
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 flex-1">
                  {group.numbers.map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md font-display text-lg border transition-all duration-200",
                        drawnSet.has(n)
                          ? `${letterClass} border-transparent shadow-sm scale-105`
                          : "bg-secondary/50 text-muted-foreground border-white/5",
                      )}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
