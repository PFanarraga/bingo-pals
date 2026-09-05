-- Función para sorteo de bola atómico (evita duplicados y desincronización de audio)
CREATE OR REPLACE FUNCTION public.draw_next_ball(p_game_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_status TEXT;
  v_drawn_balls INTEGER[];
  v_ball_interval INTEGER;
  v_last_ball_at TIMESTAMPTZ;
  v_pending_claims INTEGER;
  v_new_ball INTEGER;
  v_remaining_balls INTEGER[];
BEGIN
  -- 1. Bloquear la fila de la partida para esta transacción
  SELECT status, drawn_balls, ball_interval, last_ball_at
  INTO v_status, v_drawn_balls, v_ball_interval, v_last_ball_at
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  -- 2. Validaciones básicas
  IF v_status <> 'PLAYING' THEN
    RETURN NULL;
  END IF;

  IF array_length(v_drawn_balls, 1) >= 75 THEN
    RETURN NULL;
  END IF;

  -- 3. Verificar si ha pasado el tiempo (Margen de 100ms para evitar fluctuaciones)
  IF v_last_ball_at IS NOT NULL AND (now() < v_last_ball_at + (v_ball_interval * INTERVAL '1 second') - INTERVAL '100 milliseconds') THEN
    RETURN NULL;
  END IF;

  -- 4. Verificar si hay bingos pendientes de validar
  SELECT count(*) INTO v_pending_claims
  FROM public.bingo_claims
  WHERE game_id = p_game_id AND status = 'VALID';

  IF v_pending_claims > 0 THEN
    RETURN NULL;
  END IF;

  -- 5. Calcular bolas restantes y elegir una al azar
  SELECT array_agg(s.i) INTO v_remaining_balls
  FROM generate_series(1, 75) s(i)
  WHERE NOT (s.i = ANY(v_drawn_balls));

  IF v_remaining_balls IS NULL OR array_length(v_remaining_balls, 1) = 0 THEN
    RETURN NULL;
  END IF;

  v_new_ball := v_remaining_balls[floor(random() * array_length(v_remaining_balls, 1) + 1)];

  -- 6. Actualizar partida
  UPDATE public.games
  SET
    drawn_balls = array_append(v_drawn_balls, v_new_ball),
    current_ball = v_new_ball,
    last_ball_at = now()
  WHERE id = p_game_id;

  RETURN v_new_ball;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
