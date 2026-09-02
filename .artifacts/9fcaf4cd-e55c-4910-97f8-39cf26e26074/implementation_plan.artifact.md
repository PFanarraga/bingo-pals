# Plan: Protección de Creación de Salas y Gestión de Códigos

Este plan implementa un sistema de seguridad para restringir quién puede crear salas de bingo mediante códigos de 4 dígitos. Se introduce un "Código Maestro" para el administrador principal y un sistema de "Códigos Normales" generados dinámicamente.

## User Review Required

> [!IMPORTANT]
> - Se requiere añadir la variable de entorno `MASTER_CREATION_CODE` (ej: `1234`) tanto en Supabase como en Cloudflare.
> - La creación de salas ahora solicitará obligatoriamente un código.
> - Solo el anfitrión que use el Código Maestro podrá ver el botón "Generar código".

## Pasos Propuestos

### 1. Base de Datos (Supabase)

#### [NEW] [20260902171000_add_room_creation_codes.sql](file:///D:/bingo-pals/supabase/migrations/20260902171000_add_room_creation_codes.sql)
Crearemos una tabla mínima para gestionar los códigos de acceso.
```sql
CREATE TABLE public.room_creation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  use_limit integer, -- NULL = ilimitado
  use_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Marcar si un jugador es administrador autorizado
ALTER TABLE public.players ADD COLUMN is_authorized_admin boolean NOT NULL DEFAULT false;

GRANT SELECT ON public.room_creation_codes TO service_role;
GRANT INSERT, UPDATE ON public.room_creation_codes TO service_role;
```

### 2. Lógica de Servidor (`src/lib/rooms.functions.ts`)

- **`createRoom`**:
  - Validar el código recibido contra el `MASTER_CREATION_CODE` (del entorno).
  - Si no coincide, buscar en `room_creation_codes` (verificando `is_active`, `expires_at` y `use_limit`).
  - Incrementar el contador de uso si el código es normal.
  - Marcar al jugador como `is_authorized_admin` solo si usó el Código Maestro.
- **`generateCreationCode` [NEW]**:
  - Función protegida: solo ejecutable por un jugador con `is_authorized_admin = true`.
  - Generar código aleatorio de 4 dígitos único.
  - Recibir y guardar configuración de vencimiento y límite de usos.

### 3. Interfaz de Usuario (UI)

#### [MODIFY] [index.tsx](file:///D:/bingo-pals/src/routes/index.tsx)
- Añadir campo de entrada para el "Código de Creación" (4 dígitos) en la sección de crear sala.

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Mostrar el botón "**Generar código**" solo si `is_authorized_admin` es verdadero.
- Implementar el modal flotante responsive con las opciones:
  - Generación automática de 4 dígitos.
  - Opciones de vencimiento (1, 7, 30 días, personalizado).
  - Opciones de límite (1, 5, 10 usos, personalizado).
  - Vista de confirmación con opción de copiar al portapapeles.

## Plan de Verificación

### Pruebas de Seguridad
1. Intentar crear sala con código inventado -> Debe fallar.
2. Crear sala con Código Maestro -> Botón "Generar código" debe ser visible.
3. Crear sala con código normal generado -> Botón "Generar código" debe estar oculto.
4. Intentar llamar a la función de generación desde un cliente no autorizado -> Debe fallar en el servidor.

### Pruebas de Límites
1. Generar código con 1 solo uso -> Usarlo y verificar que el segundo intento falle.
2. Generar código con vencimiento pasado -> Verificar que falle al intentar usarlo.
