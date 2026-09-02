// Helpers de servidor. Solo se importan dinámicamente dentro de handlers.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const db = supabaseAdmin;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export async function uniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const { data } = await db.from("rooms").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
  }
  throw new Error("No se pudo generar un código de sala");
}

export type PlayerRow = {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
};

/** Valida que el jugador existe y que el token de sesión es el suyo. */
export async function requirePlayer(playerId: string, token: string): Promise<PlayerRow> {
  const { data: session } = await db
    .from("player_sessions")
    .select("player_id")
    .eq("player_id", playerId)
    .eq("token", token)
    .maybeSingle();
  if (!session) throw new Error("Sesión no válida");

  const { data: player } = await db
    .from("players")
    .select("id, room_id, name, is_host")
    .eq("id", playerId)
    .maybeSingle();
  if (!player) throw new Error("Jugador no encontrado");
  return player as PlayerRow;
}

export async function requireHost(playerId: string, token: string): Promise<PlayerRow> {
  const player = await requirePlayer(playerId, token);
  if (!player.is_host) throw new Error("Solo el anfitrión puede realizar esta acción");
  return player;
}

export type GameRow = {
  id: string;
  room_id: string;
  status: string;
  drawn_balls: number[];
  current_ball: number | null;
  prize: number;
  game_number: number;
};

export async function getGame(gameId: string): Promise<GameRow> {
  const { data } = await db
    .from("games")
    .select("id, room_id, status, drawn_balls, current_ball, prize, game_number")
    .eq("id", gameId)
    .maybeSingle();
  if (!data) throw new Error("Partida no encontrada");
  return data as GameRow;
}
