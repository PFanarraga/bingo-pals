import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ChevronRight, X } from "lucide-react";

export type TourStep = {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

type Props = {
  steps: TourStep[];
  onComplete?: () => void;
  tourKey: string;
};

export function GuidedTour({ steps, onComplete, tourKey }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const requestRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem(`tour_completed:${tourKey}`);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tourKey]);

  const updatePosition = useCallback(() => {
    const targetId = steps[currentStep]?.targetId;
    if (!targetId) return;

    const el = document.getElementById(targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    requestRef.current = requestAnimationFrame(updatePosition);
  }, [currentStep, steps]);

  useEffect(() => {
    if (isVisible) {
      const targetId = steps[currentStep]?.targetId;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      requestRef.current = requestAnimationFrame(updatePosition);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }
  }, [isVisible, currentStep, updatePosition, steps]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      complete();
    }
  };

  const complete = () => {
    setIsVisible(false);
    localStorage.setItem(`tour_completed:${tourKey}`, "true");
    onComplete?.();
  };

  if (!mounted || !isVisible) return null;

  const step = steps[currentStep];

  // Posicionamiento de la viñeta relativo al viewport
  const isTooHigh = coords.top < 200;
  const showBelow = step.position === "bottom" || isTooHigh;

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    top: showBelow ? coords.top + coords.height + 15 : coords.top - 180,
    left: Math.max(15, Math.min(window.innerWidth - 295, coords.left + (coords.width / 2) - 140)),
    zIndex: 10001,
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {/* Fondo oscurecido con hueco (Spotlight) */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-[1px] transition-all duration-300"
        style={{
          clipPath: `polygon(0% 0%, 0% 100%, ${coords.left - 4}px 100%, ${coords.left - 4}px ${coords.top - 4}px, ${coords.left + coords.width + 4}px ${coords.top - 4}px, ${coords.left + coords.width + 4}px ${coords.top + coords.height + 4}px, ${coords.left - 4}px ${coords.top + coords.height + 4}px, ${coords.left - 4}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* Viñeta flotante */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto w-[280px] animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="panel bg-card border-primary/40 p-4 shadow-2xl relative">
          <button
            onClick={complete}
            className="absolute right-2 top-2 p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                {currentStep + 1}
              </span>
              <h4 className="font-display text-xl tracking-tight leading-none text-primary">{step?.title}</h4>
            </div>
            <p className="text-[13px] text-foreground leading-snug">
              {step?.content}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === currentStep ? "w-4 bg-primary" : "w-1 bg-secondary"
                  )}
                />
              ))}
            </div>
            <Button size="sm" onClick={next} className="h-8 px-4 text-xs font-bold shadow-md">
              {currentStep === steps.length - 1 ? "¡LISTO!" : "CONTINUAR"}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-3 w-3" />}
            </Button>
          </div>

          {/* Flecha indicadora */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent",
              showBelow
                ? "border-b-[10px] border-b-primary/40 -top-2.5"
                : "border-t-[10px] border-t-primary/40 -bottom-2.5"
            )}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
