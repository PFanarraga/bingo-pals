-- Sistema de solicitud de pausa
ALTER TABLE public.games ADD COLUMN pause_requested_by uuid REFERENCES public.players(id);

-- Asegurar que las columnas de automatización existen (por si acaso)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='is_ready') THEN
        ALTER TABLE public.players ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='last_ball_at') THEN
        ALTER TABLE public.games ADD COLUMN last_ball_at timestamptz DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='ball_interval') THEN
        ALTER TABLE public.games ADD COLUMN ball_interval integer NOT NULL DEFAULT 10;
    END IF;
END $$;
