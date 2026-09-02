-- Crear tabla para el pool de cartones pre-generados
CREATE TABLE public.game_card_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  numbers integer[] NOT NULL,
  is_assigned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_card_pool_game_id ON public.game_card_pool(game_id);

-- Permisos
GRANT SELECT, INSERT, UPDATE ON public.game_card_pool TO service_role;
-- Permitir lectura pública para que el cliente pueda saber cuántos quedan si fuera necesario
GRANT SELECT ON public.game_card_pool TO anon, authenticated;

-- RLS
ALTER TABLE public.game_card_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pool_public_read" ON public.game_card_pool FOR SELECT TO anon, authenticated USING (true);
