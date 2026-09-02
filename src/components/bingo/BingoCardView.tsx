import { cn } from "@/lib/utils";
import { FREE_INDEX, LETTERS } from "@/lib/bingo";

type Props = {
  numbers: number[];
  marked: boolean[];
  drawn: Set<number>;
  onToggle: (index: number) => void;
  disabled?: boolean;
};

/** Cartón de 5x5. El marcado es siempre manual. */
export function BingoCardView({ numbers, marked, drawn, onToggle, disabled }: Props) {
  return (
    <div className="panel p-3">
      <div className="mb-2 grid grid-cols-5 gap-1.5">
        {LETTERS.map((letter) => (
          <div
            key={letter}
            className="font-display text-primary flex items-center justify-center text-2xl"
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {numbers.map((n, index) => {
          if (index === FREE_INDEX) {
            return (
              <div key={index} className="cell cell-free">
                FREE
              </div>
            );
          }
          const isMarked = marked[index];
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(index)}
              className={cn(
                "cell",
                isMarked && "cell-marked",
                !isMarked && drawn.has(n) && "cell-hint",
              )}
              aria-pressed={isMarked}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
