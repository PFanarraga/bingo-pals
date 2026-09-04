import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, PlayCircle, ShieldCheck, Trophy } from "lucide-react";

const TUTORIAL_KEY = "bingo75:tutorial_completed";

const slides = [
  {
    title: "¡Bienvenido a Bingo 75!",
    description: "La forma más divertida y rápida de jugar bingo online con tus amigos en tiempo real.",
    icon: <PlayCircle className="h-12 w-12 text-primary" />,
    content: "Sin registros complicados. Solo elige un nombre y empieza a jugar."
  },
  {
    title: "Acceso y Creación",
    description: "Protegemos tus partidas con códigos de acceso de 4 dígitos.",
    icon: <ShieldCheck className="h-12 w-12 text-blue-500" />,
    content: "Si deseas ser anfitrión y crear tu propia sala, contáctanos por WhatsApp para obtener tu código exclusivo."
  },
  {
    title: "La Sala de Espera",
    description: "Coordina con tus amigos antes de empezar.",
    icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
    content: "Todos deben marcar 'ESTOY LISTO'. El anfitrión configura el pozo, el modo de victoria (Línea, X, Full...) y la velocidad del sorteo."
  },
  {
    title: "¡A jugar!",
    description: "Las bolillas salen automáticamente cada pocos segundos.",
    icon: <PlayCircle className="h-12 w-12 text-amber-500" />,
    content: "Marca tus números manualmente. En PC, usa las flechas laterales para navegar entre tus cartones rápidamente."
  },
  {
    title: "¡BINGO!",
    description: "SÉ EL PRIMERO EN COMPLETAR EL PATRÓN.",
    icon: <Trophy className="h-12 w-12 text-yellow-500" />,
    content: "Al pulsar BINGO, el juego se pausará para todos y el sistema verificará automáticamente tus números. ¡Mucha suerte!"
  }
];

export function TutorialModal() {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY);
    if (!completed) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-center text-primary">
            CÓMO JUGAR
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-secondary/20 rounded-full animate-in zoom-in duration-500">
            {slides[currentSlide].icon}
          </div>

          <div className="space-y-2 px-2">
            <h3 className="font-display text-2xl tracking-wide">{slides[currentSlide].title}</h3>
            <p className="text-sm font-medium text-muted-foreground">{slides[currentSlide].description}</p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed bg-secondary/10 p-3 rounded-lg italic">
              "{slides[currentSlide].content}"
            </p>
          </div>

          {/* Indicadores de progreso */}
          <div className="flex gap-1.5 pt-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-secondary"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          {currentSlide > 0 && (
            <Button variant="outline" className="flex-1" onClick={prev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> ATRÁS
            </Button>
          )}
          <Button className="flex-1 text-lg font-bold" onClick={next}>
            {currentSlide === slides.length - 1 ? "¡ENTENDIDO!" : "SIGUIENTE"}
            {currentSlide < slides.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
