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
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.letter} className="flex gap-2">
              <div className="font-display text-primary w-6 shrink-0 text-2xl">{group.letter}</div>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                {group.numbers.map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md font-display text-lg",
                      drawnSet.has(n)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
