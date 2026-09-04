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

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem(`tour_completed:${tourKey}`);
    if (!completed) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => setIsVisible(true), 1000);
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
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isVisible, updatePosition]);

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

  // Calcular posición de la viñeta
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: coords.top + coords.height + 12,
    left: Math.max(10, Math.min(window.innerWidth - 290, coords.left + (coords.width / 2) - 140)),
    zIndex: 100,
  };

  if (step?.position === "top") {
    tooltipStyle.top = coords.top - 160; // Ajuste aproximado
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Fondo oscurecido con hueco (Spotlight) */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* Viñeta flotante */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto w-[280px] animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        <div className="panel bg-card border-primary/30 p-4 shadow-2xl relative">
          <button
            onClick={complete}
            className="absolute right-2 top-2 p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {currentStep + 1}
              </span>
              <h4 className="font-display text-lg leading-none">{step?.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step?.content}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <Button size="sm" onClick={next} className="h-8 px-3 text-xs font-bold">
              {currentStep === steps.length - 1 ? "¡ENTENDIDO!" : "SIGUIENTE"}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-3 w-3" />}
            </Button>
          </div>

          {/* Flecha indicadora (opcional) */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary/30"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
