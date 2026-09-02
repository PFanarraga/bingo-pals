-- Función para asignar cartones del pool de forma atómica
CREATE OR REPLACE FUNCTION public.assign_cards_from_pool(
  p_player_id uuid,
  p_game_id uuid,
  p_count integer
) RETURNS void AS $$
DECLARE
  v_pool_id uuid;
  v_numbers integer[];
  i integer;
BEGIN
  -- 1. Liberar cartones actuales del jugador en el pool si los tiene
  UPDATE public.game_card_pool
  SET is_assigned = false
  WHERE game_id = p_game_id
  AND numbers IN (
    SELECT numbers FROM public.cards
    WHERE player_id = p_player_id AND game_id = p_game_id
  );

  -- 2. Borrar cartones actuales del jugador para esta partida
  DELETE FROM public.cards
  WHERE player_id = p_player_id AND game_id = p_game_id;

  -- 3. Asignar nuevos cartones del pool uno por uno para asegurar unicidad
  FOR i IN 1..p_count LOOP
    -- Buscar un cartón no asignado y marcarlo (FOR UPDATE para bloquear la fila)
    SELECT id, numbers INTO v_pool_id, v_numbers
    FROM public.game_card_pool
    WHERE game_id = p_game_id AND is_assigned = false
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_pool_id IS NULL THEN
      RAISE EXCEPTION 'No hay suficientes cartones disponibles en el pool';
    END IF;

    -- Marcar como asignado
    UPDATE public.game_card_pool SET is_assigned = true WHERE id = v_pool_id;

    -- Insertar en la tabla de cartones del jugador
    INSERT INTO public.cards (player_id, game_id, card_number, numbers)
    VALUES (p_player_id, p_game_id, i, v_numbers);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cambiar un cartón específico de forma atómica
CREATE OR REPLACE FUNCTION public.reroll_single_card(
  p_player_id uuid,
  p_game_id uuid,
  p_card_number integer
) RETURNS void AS $$
DECLARE
  v_old_numbers integer[];
  v_pool_id uuid;
  v_new_numbers integer[];
BEGIN
  -- 1. Obtener los números del cartón viejo
  SELECT numbers INTO v_old_numbers
  FROM public.cards
  WHERE player_id = p_player_id AND game_id = p_game_id AND card_number = p_card_number;

  IF v_old_numbers IS NULL THEN
    RAISE EXCEPTION 'Cartón no encontrado';
  END IF;

  -- 2. Buscar un nuevo cartón en el pool
  SELECT id, numbers INTO v_pool_id, v_new_numbers
  FROM public.game_card_pool
  WHERE game_id = p_game_id AND is_assigned = false
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_pool_id IS NULL THEN
    RAISE EXCEPTION 'No hay más cartones disponibles en el pool';
  END IF;

  -- 3. Marcar el nuevo como asignado
  UPDATE public.game_card_pool SET is_assigned = true WHERE id = v_pool_id;

  -- 4. Actualizar el cartón del jugador
  UPDATE public.cards
  SET numbers = v_new_numbers
  WHERE player_id = p_player_id AND game_id = p_game_id AND card_number = p_card_number;

  -- 5. Liberar el cartón viejo en el pool
  UPDATE public.game_card_pool
  SET is_assigned = false
  WHERE game_id = p_game_id AND numbers = v_old_numbers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
