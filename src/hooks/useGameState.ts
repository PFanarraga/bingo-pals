import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Room = {
  id: string;
  code: string;
  status: string;
  host_player_id: string | null;
  max_players: number;
};
export type Player = {
  id: string;
  name: string;
  is_host: boolean;
  connected: boolean;
  is_ready: boolean;
  created_at: string;
};
export type Game = {
  id: string;
  status: string;
  drawn_balls: number[];
  current_ball: number | null;
  prize: number;
  game_number: number;
  pause_requested_by: string | null;
};
export type Card = { id: string; card_number: number; numbers: number[]; player_id: string };
export type Claim = {
  id: string;
  player_id: string;
  card_id: string;
  status: string;
  created_at: string;
};
export type Winner = { id: string; player_id: string; card_id: string; prize_share: number };

export type GameState = {
  room: Room | null;
  players: Player[];
  game: Game | null;
  cards: Card[];
  claims: Claim[];
  winners: Winner[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/** Estado completo de la sala, sincronizado en tiempo real. */
export function useGameState(code: string, playerId?: string): GameState {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    try {
      const { data: roomRow } = await supabase
        .from("rooms")
        .select("id, code, status, host_player_id, max_players")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      if (!roomRow) {
        setError("La sala no existe");
        setRoom(null);
        return;
      }
      setError(null);
      setRoom(roomRow as Room);

      const [playersRes, gameRes] = await Promise.all([
        supabase
          .from("players")
          .select("id, name, is_host, connected, is_ready, created_at")
          .eq("room_id", roomRow.id)
          .order("created_at"),
        supabase
          .from("games")
          .select("id, status, drawn_balls, current_ball, prize, game_number, pause_requested_by")
          .eq("room_id", roomRow.id)
          .order("game_number", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setPlayers((playersRes.data ?? []) as Player[]);
      const currentGame = (gameRes.data ?? null) as Game | null;
      setGame(currentGame);

      if (currentGame) {
        const [cardsRes, claimsRes, winnersRes] = await Promise.all([
          playerId
            ? supabase
                .from("cards")
                .select("id, card_number, numbers, player_id")
                .eq("game_id", currentGame.id)
                .eq("player_id", playerId)
                .order("card_number")
            : Promise.resolve({ data: [] as Card[] }),
          supabase
            .from("bingo_claims")
            .select("id, player_id, card_id, status, created_at")
            .eq("game_id", currentGame.id)
            .order("created_at"),
          supabase
            .from("winners")
            .select("id, player_id, card_id, prize_share")
            .eq("game_id", currentGame.id),
        ]);
        setCards((cardsRes.data ?? []) as Card[]);
        setClaims((claimsRes.data ?? []) as Claim[]);
        setWinners((winnersRes.data ?? []) as Winner[]);
      } else {
        setCards([]);
        setClaims([]);
        setWinners([]);
      }
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }, [code, playerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!code) return;
    const channel = supabase
      .channel(`room-${code.toUpperCase()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "cards" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bingo_claims" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "winners" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [code, load]);

  // Respaldo por si se pierde el canal en tiempo real.
  useEffect(() => {
    const id = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(id);
  }, [load]);

  return { room, players, game, cards, claims, winners, loading, error, refresh: () => void load() };
}
