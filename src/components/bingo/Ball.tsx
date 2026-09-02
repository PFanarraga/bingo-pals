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
  return (
    <span
      className={cn(
        "ball",
        sizes[size],
        variant === "drawn" && "ball-drawn",
        variant === "current" && "ball-current",
        variant === "idle" && "ball-idle",
      )}
      aria-label={`${letterOf(number)} ${number}`}
    >
      {showLetter && <span className="text-[0.6em] opacity-80">{letterOf(number)}</span>}
      <span>{number}</span>
    </span>
  );
}
