import { cn } from "@/lib/utils";
import { letterOf } from "@/lib/bingo";

type BallProps = {
  number: number;
  size?: "sm" | "md" | "lg";
  variant?: "drawn" | "current" | "idle";
  showLetter?: boolean;
};

const sizes = {
  sm: "h-9 w-9 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
};

export function Ball({ number, size = "md", variant = "drawn", showLetter = true }: BallProps) {
  const letter = letterOf(number).toLowerCase();

  return (
    <span
      className={cn(
        "ball transition-all duration-300",
        sizes[size],
        variant === "drawn" && `ball-${letter}`,
        variant === "current" && `ball-${letter} ring-4 ring-white ring-offset-2 ring-offset-background`,
        variant === "idle" && "ball-idle",
      )}
      aria-label={`${letterOf(number)} ${number}`}
    >
      {showLetter && <span className="text-[0.6em] font-bold opacity-90">{letterOf(number)}</span>}
      <span className="font-bold">{number}</span>
    </span>
  );
}
