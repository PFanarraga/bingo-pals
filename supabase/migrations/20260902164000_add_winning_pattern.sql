-- Añadir columna para el patrón de victoria
ALTER TABLE public.games ADD COLUMN winning_pattern text NOT NULL DEFAULT 'LINE';
