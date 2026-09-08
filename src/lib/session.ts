// Identidad local del jugador (sin login). Se guarda en localStorage.

export type PlayerSession = {
  playerId: string;
  token: string;
  roomCode: string;
  name: string;
  isHost: boolean;
};

const KEY_PREFIX = "bingo75:session:";

export function loadSession(roomCode?: string): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    // Usamos localStorage para que la identidad persista al cerrar el navegador
    if (!roomCode) {
      const legacy = window.localStorage.getItem("bingo75:session");
      if (legacy) return JSON.parse(legacy) as PlayerSession;
      return null;
    }

    const raw = window.localStorage.getItem(`${KEY_PREFIX}${roomCode.toUpperCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerSession;
    if (!parsed?.playerId || !parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: PlayerSession) {
  if (typeof window === "undefined") return;
  const key = `${KEY_PREFIX}${session.roomCode.toUpperCase()}`;
  window.localStorage.setItem(key, JSON.stringify(session));
  // También guardamos una referencia global de la última sesión para recuperación rápida
  window.localStorage.setItem("bingo75:session", JSON.stringify(session));
}

export function clearSession(roomCode?: string) {
  if (typeof window === "undefined") return;
  if (roomCode) {
    window.localStorage.removeItem(`${KEY_PREFIX}${roomCode.toUpperCase()}`);
  }
  window.localStorage.removeItem("bingo75:session");
}

export function sessionForRoom(code: string): PlayerSession | null {
  return loadSession(code);
}
