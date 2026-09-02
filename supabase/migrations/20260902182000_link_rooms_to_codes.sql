-- Vincular cada sala con el código que la autorizó para controlar salas simultáneas
ALTER TABLE public.rooms ADD COLUMN created_by_code_id uuid REFERENCES public.room_creation_codes(id);
CREATE INDEX idx_rooms_created_by_code_id ON public.rooms(created_by_code_id);
