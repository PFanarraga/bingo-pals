// Motor de audio profesional para Bingo 75.
// Maneja una cola secuencial y asegura que no se pierdan audios por re-renders.

import { letterOf } from "./bingo";

const PAUSE_MS = 450;

let enabled = true;
let unlocked = false;
let queue: string[] = [];
let isProcessing = false;
let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopAudio();
}

export function isAudioEnabled() {
  return enabled;
}

/**
 * Inicializa el contexto de audio global.
 * Debe llamarse tras una interacción del usuario.
 */
export async function unlockAudio() {
  if (typeof window === "undefined") return;

  if (!audioContext) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioContext = new Ctx();
  }

  if (audioContext?.state === 'suspended') {
    await audioContext.resume();
  }

  // Pequeño sonido silencioso para activar el motor en iOS/Chrome
  try {
    const probe = new Audio();
    probe.muted = true;
    probe.src = "data:audio/wav;base64,UklGRigAAABXQVZFAmZtdCAQAAAAAQABAIAAABkAAcwAAAgAgAB0YW5hAAAA";
    await probe.play();
  } catch (e) {
    console.warn("[Audio] Re-activación fallida:", e);
  }

  unlocked = true;
  console.log("[Audio] Motor listo y desbloqueado");
}

function playFile(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !enabled) return resolve();

    // Si el contexto está dormido, intentamos despertarlo antes de cada play
    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch(() => undefined);
    }

    const audio = new Audio(src);
    currentAudio = audio;

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };

    audio.onended = cleanup;
    audio.onerror = (e) => {
      console.warn(`[Audio] Error cargando ${src}:`, e);
      cleanup();
    };

    audio.play().catch((err) => {
      console.warn(`[Audio] Play bloqueado para ${src}:`, err);
      cleanup();
    });
  });
}

/** Procesa la cola de audios de forma atómica. */
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Si el contexto existe pero está suspendido, intentamos despertarlo antes de empezar
    if (audioContext?.state === 'suspended') {
      await audioContext.resume().catch(() => undefined);
    }

    while (queue.length > 0 && enabled) {
      const task = queue.shift()!;

      if (task === "__pause__") {
        await new Promise((r) => setTimeout(r, PAUSE_MS));
      } else {
        await playFile(task);
      }
    }
  } catch (e) {
    console.error("[Audio] Error en processQueue:", e);
  } finally {
    isProcessing = false;
    // Si llegaron nuevos elementos mientras terminábamos, relanzamos
    if (queue.length > 0 && enabled) {
      void processQueue();
    }
  }
}

export function stopAudio() {
  queue = [];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/** Canta la bola: Letra + Pausa + Número. */
export function announceBall(ball: number) {
  if (!enabled) return;

  // Limpiamos lo que se esté cantando para priorizar la nueva bola
  stopAudio();

  const num = String(ball);
  queue = [
    `/audio/${letterOf(ball)}.mp3`,
    "__pause__",
    `/audio/${num}.mp3`
  ];

  void processQueue();
}

export function playIntro() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/intro.mp3"];
  void processQueue();
}

export function playBingoPressed() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/fin de la partida.mp3"];
  void processQueue();
}

export function playWinnerConfirmed() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/ganador.mp3"];
  void processQueue();
}

export function playAllBallsDrawn() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/se han cantado todas las bolas.mp3"];
  void processQueue();
}
