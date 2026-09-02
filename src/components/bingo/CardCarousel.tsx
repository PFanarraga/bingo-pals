import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Muestra los cartones en desplazamiento horizontal, nunca uno debajo de otro. */
export function CardCarousel({
  items,
  onActiveChange,
}: {
  items: ReactNode[];
  onActiveChange?: (index: number) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) {
      setActive(index);
      onActiveChange?.(index);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={scroller}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            {item}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <span className="font-display text-muted-foreground text-lg">
            CARTÓN {active + 1} / {items.length}
          </span>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i === active ? "bg-primary" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
