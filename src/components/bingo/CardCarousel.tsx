import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Muestra los cartones en desplazamiento horizontal, con flechas de navegación para PC. */
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

  const scroll = (direction: "prev" | "next") => {
    const el = scroller.current;
    if (!el) return;
    const width = el.clientWidth;
    const target = direction === "next" ? el.scrollLeft + width : el.scrollLeft - width;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="group relative space-y-3">
      {/* Flechas laterales (visibles solo en hover en PC) */}
      {items.length > 1 && (
        <>
          <div className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
              onClick={() => scroll("prev")}
              disabled={active === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>
          <div className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
              onClick={() => scroll("next")}
              disabled={active === items.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </>
      )}

      <div
        ref={scroller}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className="w-full shrink-0 snap-center px-1">
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
                  "h-2 w-2 rounded-full transition-all duration-300",
                  i === active ? "bg-primary w-4" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
