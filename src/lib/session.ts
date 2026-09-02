// Identidad local del jugador (sin login). Se guarda en localStorage.

export type PlayerSession = {
  playerId: string;
  token: string;
  roomCode: string;
  name: string;
  isHost: boolean;
};

const KEY = "bingo75:session";

export function loadSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
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
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function sessionForRoom(code: string): PlayerSession | null {
  const session = loadSession();
  if (!session) return null;
  return session.roomCode.toUpperCase() === code.toUpperCase() ? session : null;
}
