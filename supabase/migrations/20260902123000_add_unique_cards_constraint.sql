-- Añade una restricción de unicidad para que no se repitan cartones en la misma partida
ALTER TABLE public.cards
ADD CONSTRAINT unique_card_numbers_per_game UNIQUE (game_id, numbers);
