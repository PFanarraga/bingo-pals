// Cola de audio secuencial para el Bingo 75.
import { letterOf } from "./bingo";

const PAUSE_MS = 450;

let enabled = true;
let unlocked = false;
let queue: string[] = [];
let playing = false;
let current: HTMLAudioElement | null = null;

export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopAudio();
}

export function isAudioEnabled() {
  return enabled;
}

/** Desbloquea el audio para navegadores móviles y desktop. */
export async function unlockAudio() {
  if (typeof window === "undefined") return;

  const ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (ctx) {
    const audioCtx = new ctx();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  }

  try {
    const el = new Audio();
    el.muted = true;
    el.src = "data:audio/wav;base64,UklGRigAAABXQVZFAmZtdCAQAAAAAQABAIAAABkAAcwAAAgAgAB0YW5hAAAA"; // 1ms silent wav
    await el.play().catch(() => undefined);
    el.pause();
  } catch { /* ignorado */ }

  unlocked = true;
  console.log("[Audio] Desbloqueado correctamente");
}

function play(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const el = new Audio(src);
    current = el;
    const done = () => {
      el.onended = null;
      el.onerror = null;
      if (current === el) current = null;
      resolve();
    };
    el.onended = done;
    el.onerror = done;
    el.play().catch(done);
  });
}

async function runQueue() {
  if (playing) return;
  playing = true;
  while (queue.length && enabled) {
    const src = queue.shift()!;
    if (src === "__pause__") {
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    } else {
      await play(src);
    }
  }
  playing = false;
}

export function stopAudio() {
  queue = [];
  if (current) {
    current.pause();
    current = null;
  }
}

/** Canta la bola: Letra + Pausa + Número. */
export function announceBall(ball: number) {
  if (!enabled) return;
  stopAudio();
  const num = String(ball); // Archivos son 1.mp3, 2.mp3...
  // Intentamos cargar la letra. Si no existe, el sistema de play() maneja el error y sigue.
  queue = [`/audio/${letterOf(ball)}.mp3`, "__pause__", `/audio/${num}.mp3`];
  void runQueue();
}

/** Sonidos especiales del juego */

export function playIntro() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/intro.mp3"];
  void runQueue();
}

export function playBingoPressed() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/fin de la partida.mp3"];
  void runQueue();
}

export function playWinnerConfirmed() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/ganador.mp3"];
  void runQueue();
}

export function playAllBallsDrawn() {
  if (!enabled) return;
  stopAudio();
  queue = ["/audio/se han cantado todas las bolas.mp3"];
  void runQueue();
}
