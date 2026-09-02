// Cola de audio secuencial: letra -> pausa controlada -> número.
// Los archivos viven en /audio (B.mp3 ... O.mp3, 01.mp3 ... 75.mp3).
// Si un archivo no existe, la cola continúa sin bloquear el juego.

import { letterOf } from "./bingo";

const PAUSE_MS = 450;

export type CommentKind = "start" | "bingo" | "fakeBingo" | "winner" | "end" | "random";

// Nombres de archivo de comentarios (sin ruta). Vacío = sin comentarios.
export const COMMENT_FILES: Record<CommentKind, string[]> = {
  start: [],
  bingo: [],
  fakeBingo: [],
  winner: [],
  end: [],
  random: [],
};

let enabled = true;
let unlocked = false;
let queue: string[] = [];
let playing = false;
let current: HTMLAudioElement | null = null;
let lastComment = "";
let ballsSinceComment = 0;

export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopAudio();
}

export function isAudioEnabled() {
  return enabled;
}

/** Debe llamarse desde un gesto del usuario (iOS bloquea el audio si no). */
export async function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;
  try {
    const el = new Audio();
    el.muted = true;
    await el.play().catch(() => undefined);
    el.pause();
  } catch {
    /* ignorado */
  }
  unlocked = true;
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

/** Reproduce letra + número de la bola. Corta lo anterior. */
export function announceBall(ball: number) {
  if (!enabled) return;
  stopAudio();
  const num = String(ball).padStart(2, "0");
  queue = [`/audio/${letterOf(ball)}.mp3`, "__pause__", `/audio/${num}.mp3`];
  ballsSinceComment += 1;
  void runQueue();
}

/**
 * Comentarios controlados: nunca tras cada bola y nunca dos veces el mismo
 * de forma consecutiva.
 */
export function playComment(kind: CommentKind, options?: { minBalls?: number }) {
  if (!enabled) return;
  const files = COMMENT_FILES[kind];
  if (!files.length) return;
  const minBalls = options?.minBalls ?? 0;
  if (kind === "random") {
    if (ballsSinceComment < Math.max(minBalls, 5)) return;
    if (Math.random() > 0.4) return;
  }
  const options2 = files.filter((f) => f !== lastComment);
  const pool = options2.length ? options2 : files;
  const file = pool[Math.floor(Math.random() * pool.length)]!;
  lastComment = file;
  ballsSinceComment = 0;
  queue.push(`/audio/comentarios/${file}`);
  void runQueue();
}
