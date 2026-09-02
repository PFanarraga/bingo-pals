-- Estado de preparación del jugador
ALTER TABLE public.players ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT FALSE;

-- Control de tiempo para el sorteo automático
ALTER TABLE public.games ADD COLUMN last_ball_at timestamptz DEFAULT now();
ALTER TABLE public.games ADD COLUMN ball_interval integer NOT NULL DEFAULT 10; -- segundos (configurable)
