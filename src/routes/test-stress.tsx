import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRoom, joinRoom } from "@/lib/rooms.functions";
import { assignCards } from "@/lib/cards.functions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, Users, CreditCard, Zap } from "lucide-react";

export const Route = createFileRoute("/test-stress")({
  component: StressTestPage,
});

function StressTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    roomCode: string;
    joinTimes: number[];
    cardTimes: number[];
    errors: string[];
    totalTime: number;
  } | null>(null);

  const runTest = async () => {
    setLoading(true);
    setResults(null);
    const errors: string[] = [];
    const joinTimes: number[] = [];
    const cardTimes: number[] = [];
    const startTime = Date.now();

    try {
      // 1. Crear sala Maestra para la prueba
      toast.info("Iniciando: Creando sala de prueba...");
      const master = await createRoom({ data: { name: "TEST_HOST", creationCode: "PMFF2309" } });
      const roomCode = master.roomCode;

      // 2. Simular 100 jugadores uniéndose
      toast.info("Fase 1: Uniéndose 100 jugadores...");

      // Vamos a unirlos en ráfagas de 10 para no saturar el navegador local,
      // pero el servidor recibirá carga constante.
      for (let i = 0; i < 10; i++) {
        const batch = Array.from({ length: 10 }).map(async (_, j) => {
          const playerNum = i * 10 + j + 1;
          const pStart = Date.now();
          try {
            const res = await joinRoom({ data: { name: `Bot_${playerNum}`, code: roomCode } });
            joinTimes.push(Date.now() - pStart);

            const cStart = Date.now();
            await assignCards({ data: { playerId: res.playerId, token: res.token, count: 3 } });
            cardTimes.push(Date.now() - cStart);
          } catch (e: any) {
            errors.push(`Bot_${playerNum}: ${e.message}`);
          }
        });
        await Promise.all(batch);
        toast.info(`Progreso: ${((i + 1) * 10)}/100 jugadores listos`);
      }

      const totalTime = Date.now() - startTime;
      setResults({ roomCode, joinTimes, cardTimes, errors, totalTime });
      toast.success("¡Prueba de estrés completada!");

    } catch (e: any) {
      toast.error("Error crítico en la prueba: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-display text-primary uppercase tracking-tighter">Panel de Stress Test</h1>
        <p className="text-muted-foreground italic">Simulación de carga real: 100 Jugadores / 300 Cartones</p>
      </header>

      <section className="panel p-6 border-primary/20 bg-secondary/5 text-center space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg border border-white/5">
            <Users className="mx-auto h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">100</p>
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Jugadores</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-white/5">
            <CreditCard className="mx-auto h-6 w-6 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">300</p>
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Cartones</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-white/5">
            <Zap className="mx-auto h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">Realtime</p>
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Latencia</p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-16 text-xl font-bold"
          disabled={loading}
          onClick={runTest}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              EJECUTANDO SIMULACIÓN...
            </>
          ) : "LANZAR TEST DE 100 JUGADORES"}
        </Button>
      </section>

      {results && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="panel p-6 border-green-500/30 bg-green-500/5 space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
              <h2 className="text-2xl font-display uppercase">Resultado del Reporte</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold">Sala Creada</p>
                <p className="font-mono text-xl">{results.roomCode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold">Tiempo Total</p>
                <p className="text-xl font-bold">{(results.totalTime / 1000).toFixed(2)} segundos</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold">Promedio Unión (Ping)</p>
                <p className="text-xl font-bold">
                  {(results.joinTimes.reduce((a, b) => a + b, 0) / results.joinTimes.length).toFixed(0)} ms
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase text-[10px] font-bold">Promedio Cartones</p>
                <p className="text-xl font-bold">
                  {(results.cardTimes.reduce((a, b) => a + b, 0) / results.cardTimes.length).toFixed(0)} ms
                </p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase">Errores detectados ({results.errors.length})</p>
                </div>
                <ul className="text-[10px] font-mono text-red-400/80 max-h-32 overflow-y-auto">
                  {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-white/5">
              <p className="text-[11px] text-muted-foreground leading-relaxed italic text-center">
                * Nota: Esta prueba simula la carga del servidor y base de datos.
                Los tiempos de respuesta medidos son desde la infraestructura de Cloudflare.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
