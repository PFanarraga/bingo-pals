// Motor de audio profesional para Bingo 75 - Versión con Ducking para Voz
import { letterOf } from "./bingo";

const PAUSE_MS = 450;
const DUCK_VOLUME = 0.2;
const NORMAL_VOLUME = 1.0;

let enabled = true;
let unlocked = false;
let queue: string[] = [];
let isProcessing = false;
let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let resolveCurrentPlay: ((value: void | PromiseLike<void>) => void) | null = null;

// Control de volumen global para el locutor
let announcerVolume = NORMAL_VOLUME;

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
  if (resolveCurrentPlay) {
    resolveCurrentPlay();
    resolveCurrentPlay = null;
  }
}

function playFile(src: string, volume = announcerVolume): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !enabled) return resolve();

    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch(() => undefined);
    }

    const audio = new Audio(src);
    audio.volume = volume;
    currentAudio = audio;
    resolveCurrentPlay = resolve;

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
        // Usamos el volumen actual (puede estar "ducked")
        await playFile(task, announcerVolume);
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

/** Baja el volumen del locutor para escuchar un mensaje de voz. */
export async function playVoiceMessage(url: string) {
  if (!enabled) return;

  // 1. Ducking: Bajamos volumen del locutor si está hablando
  announcerVolume = DUCK_VOLUME;
  if (currentAudio) currentAudio.volume = DUCK_VOLUME;

  // 2. Reproducir el mensaje de voz (no bloquea la cola del locutor)
  const voice = new Audio(url);
  voice.volume = 1.0;

  return new Promise<void>((resolve) => {
    voice.onended = () => {
      // 3. Restaurar volumen al terminar
      announcerVolume = NORMAL_VOLUME;
      if (currentAudio) currentAudio.volume = NORMAL_VOLUME;
      resolve();
    };
    voice.onerror = () => {
      announcerVolume = NORMAL_VOLUME;
      if (currentAudio) currentAudio.volume = NORMAL_VOLUME;
      resolve();
    };
    voice.play().catch(() => {
      announcerVolume = NORMAL_VOLUME;
      if (currentAudio) currentAudio.volume = NORMAL_VOLUME;
      resolve();
    });
  });
}

export function announceBall(ball: number) {
  if (!enabled) return;
  stopAudio();
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

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void unlockAudio();
    }
  });
}
