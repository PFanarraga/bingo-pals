# Plan: Restricción de Salas Simultáneas por Código

Este plan implementa una restricción para asegurar que los códigos de creación normales solo puedan tener una sala activa (sin finalizar) a la vez. El Código Maestro permanecerá libre de esta restricción, permitiendo múltiples salas simultáneas.

## User Review Required

> [!IMPORTANT]
> - Un código normal no podrá usarse para crear una nueva sala si ya existe una sala en curso (`WAITING`, `PLAYING` o `PAUSED`) vinculada a él.
> - El anfitrión deberá finalizar la partida anterior para poder reutilizar su código (si aún tiene usos disponibles).
> - El Código Maestro podrá seguir abriendo salas ilimitadas simultáneamente.

## Pasos Propuestos

### 1. Base de Datos (Supabase)

#### [NEW] [20260902182000_link_rooms_to_codes.sql](file:///D:/bingo-pals/supabase/migrations/20260902182000_link_rooms_to_codes.sql)
Añadiremos una columna para vincular cada sala con el código que la autorizó.
```sql
ALTER TABLE public.rooms ADD COLUMN created_by_code_id uuid REFERENCES public.room_creation_codes(id);
CREATE INDEX idx_rooms_created_by_code_id ON public.rooms(created_by_code_id);
```

### 2. Lógica de Servidor (`src/lib/rooms.functions.ts`)

- **`createRoom`**:
  - Si se usa un código normal:
    - Realizar una búsqueda en la tabla `rooms` para ver si hay alguna sala con ese `created_by_code_id` cuyo estado no sea `FINISHED`.
    - Si se encuentra una, rechazar la creación con el mensaje: "Ya tienes una sala activa con este código. Finalízala antes de crear una nueva."
    - Al insertar la nueva sala, guardar el `id` del código utilizado.
  - Si se usa el Código Maestro:
    - Omitir la comprobación y no guardar vínculo (permitiendo salas infinitas).

## Plan de Verificación

### Pruebas de Restricción
1. Crear una sala con un código generado de 5 usos.
2. Sin finalizar esa sala, intentar crear otra con el mismo código -> Debe fallar.
3. Finalizar la sala inicial.
4. Intentar crear una sala nueva con el mismo código -> Debe permitirlo (porque el uso total es 5 y no hay salas activas).

### Pruebas de Código Maestro
1. Crear una sala con el Código Maestro.
2. Intentar crear una segunda sala con el Código Maestro en otra pestaña -> Debe permitirlo.
