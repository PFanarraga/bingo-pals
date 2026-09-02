-- ROOMS
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_player_id uuid,
  status text NOT NULL DEFAULT 'WAITING',
  max_players integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_host boolean NOT NULL DEFAULT false,
  connected boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX players_room_idx ON public.players(room_id);

CREATE TABLE public.player_sessions (
  player_id uuid PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'WAITING',
  drawn_balls integer[] NOT NULL DEFAULT '{}',
  current_ball integer,
  prize numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
CREATE INDEX games_room_idx ON public.games(room_id);

CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  card_number integer NOT NULL,
  numbers integer[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, game_id, card_number)
);
CREATE INDEX cards_game_idx ON public.cards(game_id);

CREATE TABLE public.bingo_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING',
  marked_state jsonb,
  ball_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);
CREATE INDEX bingo_claims_game_idx ON public.bingo_claims(game_id);

CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  prize_share numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, card_id)
);
CREATE INDEX winners_game_idx ON public.winners(game_id);

-- GRANTS: lectura pública (juego sin registro), escritura solo desde el servidor
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.players TO anon, authenticated;
GRANT SELECT ON public.games TO anon, authenticated;
GRANT SELECT ON public.cards TO anon, authenticated;
GRANT SELECT ON public.bingo_claims TO anon, authenticated;
GRANT SELECT ON public.winners TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.players TO service_role;
GRANT ALL ON public.player_sessions TO service_role;
GRANT ALL ON public.games TO service_role;
GRANT ALL ON public.cards TO service_role;
GRANT ALL ON public.bingo_claims TO service_role;
GRANT ALL ON public.winners TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_public_read" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "players_public_read" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "games_public_read" ON public.games FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cards_public_read" ON public.cards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "claims_public_read" ON public.bingo_claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "winners_public_read" ON public.winners FOR SELECT TO anon, authenticated USING (true);
-- player_sessions: sin politicas => sin acceso desde la app

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.cards REPLICA IDENTITY FULL;
ALTER TABLE public.bingo_claims REPLICA IDENTITY FULL;
ALTER TABLE public.winners REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bingo_claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;