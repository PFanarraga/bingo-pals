import { Ball } from "./Ball";

/** Solo las últimas 3 bolas; la más antigua desaparece. */
export function LastBalls({ drawn }: { drawn: number[] }) {
  const last = drawn.slice(-3);
  const slots = [0, 1, 2];
  return (
    <div className="flex items-center justify-center gap-2">
      {slots.map((i) => {
        const number = last[last.length - 3 + i];
        if (!number) {
          return (
            <span
              key={i}
              className="ball ball-idle h-14 w-14 text-xl opacity-40"
              aria-hidden="true"
            >
              –
            </span>
          );
        }
        const isCurrent = i === 2 || last.length - 3 + i === last.length - 1;
        return (
          <Ball
            key={`${number}-${i}`}
            number={number}
            size={isCurrent ? "lg" : "md"}
            variant={isCurrent ? "current" : "drawn"}
          />
        );
      })}
    </div>
  );
}
