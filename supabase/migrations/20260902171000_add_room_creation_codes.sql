-- Tabla para gestionar los códigos de creación de salas
CREATE TABLE public.room_creation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  use_limit integer, -- NULL = ilimitado
  use_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Marcar si un jugador es administrador autorizado (usó el código maestro)
ALTER TABLE public.players ADD COLUMN is_authorized_admin boolean NOT NULL DEFAULT false;

-- Permisos
GRANT SELECT ON public.room_creation_codes TO service_role;
GRANT INSERT, UPDATE ON public.room_creation_codes TO service_role;
