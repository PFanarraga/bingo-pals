// Motor de audio profesional para Bingo 75 - Versión Blindada v2
// Soluciona el deadlock al interrumpir audios y mejora la persistencia.

import { letterOf } from "./bingo";

const PAUSE_MS = 450;

let enabled = true;
let unlocked = false;
let queue: string[] = [];
let isProcessing = false;
let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let resolveCurrentPlay: ((value: void | PromiseLike<void>) => void) | null = null;

export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopAudio();
}

export function isAudioEnabled() {
  return enabled;
}

/** Desbloquea el motor de audio. */
export async function unlockAudio() {
  if (typeof window === "undefined") return;

  if (!audioContext) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioContext = new Ctx();
  }

  if (audioContext?.state === 'suspended') {
    await audioContext.resume().catch(() => undefined);
  }

  // Activa el canal de audio con un micro-sonido
  try {
    const probe = new Audio();
    probe.muted = true;
    probe.src = "data:audio/wav;base64,UklGRigAAABXQVZFAmZtdCAQAAAAAQABAIAAABkAAcwAAAgAgAB0YW5hAAAA";
    await probe.play();
  } catch (e) {}

  unlocked = true;
}

/** Detiene el audio actual y DESBLOQUEA la cola. */
export function stopAudio() {
  queue = [];
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio.load();
    } catch (e) {}
    currentAudio = null;
  }
  // CRÍTICO: Forzamos la resolución de la promesa pendiente para evitar el deadlock
  if (resolveCurrentPlay) {
    resolveCurrentPlay();
    resolveCurrentPlay = null;
  }
}

function playFile(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !enabled) return resolve();

    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch(() => undefined);
    }

    const audio = new Audio(src);
    currentAudio = audio;
    resolveCurrentPlay = resolve; // Guardamos la forma de resolver esta promesa

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      if (currentAudio === audio) currentAudio = null;
      if (resolveCurrentPlay === resolve) resolveCurrentPlay = null;
      resolve();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;

    audio.play().catch((err) => {
      console.warn(`[Audio] Play bloqueado:`, err);
      cleanup();
    });
  });
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (queue.length > 0 && enabled) {
      const task = queue.shift()!;
      if (task === "__pause__") {
        await new Promise((r) => setTimeout(r, PAUSE_MS));
      } else {
        await playFile(task);
      }
    }
  } catch (e) {
    console.error("[Audio] Error:", e);
  } finally {
    isProcessing = false;
    if (queue.length > 0 && enabled) {
      void processQueue();
    }
  }
}

export function announceBall(ball: number) {
  if (!enabled) return;
  stopAudio(); // Detiene y desbloquea el motor

  const num = String(ball);
  queue = [`/audio/${letterOf(ball)}.mp3`, "__pause__", `/audio/${num}.mp3`];
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

// Escuchar cambios de visibilidad para re-despertar el motor si el usuario vuelve a la pestaña
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void unlockAudio();
    }
  });
}
