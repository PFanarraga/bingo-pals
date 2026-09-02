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
    // Usamos sessionStorage para que cada pestaña sea un jugador independiente
    if (!roomCode) {
      const legacy = window.sessionStorage.getItem("bingo75:session") || window.localStorage.getItem("bingo75:session");
      if (legacy) return JSON.parse(legacy) as PlayerSession;
      return null;
    }

    const raw = window.sessionStorage.getItem(`${KEY_PREFIX}${roomCode.toUpperCase()}`);
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
  window.sessionStorage.setItem(key, JSON.stringify(session));
}

export function clearSession(roomCode?: string) {
  if (typeof window === "undefined") return;
  if (roomCode) {
    window.sessionStorage.removeItem(`${KEY_PREFIX}${roomCode.toUpperCase()}`);
  }
}

export function sessionForRoom(code: string): PlayerSession | null {
  return loadSession(code);
}
