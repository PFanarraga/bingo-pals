# Plan: Patrones de Victoria, Verificación Inteligente y Optimización de UI

Este plan implementa la selección de tipos de juego (patrones), la pausa automática al cantar bingo, la verificación inteligente de cartones y soluciona el lag en el control de velocidad.

## User Review Required

> [!IMPORTANT]
> - Se añadirá una nueva columna `winning_pattern` a la tabla `games`.
> - Los patrones soportados serán: **Línea**, **Cartón Lleno**, **Letra X**, **Cruz** y **4 Esquinas**.
> - Al pulsar "BINGO", el sorteo automático se detendrá inmediatamente para todos.
> - La verificación ahora será automática: el sistema comparará los números necesarios del patrón contra las bolas que realmente han salido.
> - Se optimizará el control de velocidad para que la App no se sature al mover el deslizador.

## Pasos Propuestos

### 1. Base de Datos (Supabase)

#### [NEW] [20260902164000_add_winning_pattern.sql](file:///D:/bingo-pals/supabase/migrations/20260902164000_add_winning_pattern.sql)
Añadir columna para el patrón de victoria y asegurar valores por defecto.

### 2. Lógica de Bingo (`src/lib/bingo.ts`)

- Definir los índices requeridos para cada patrón:
  - **LINE**: Cualquier fila, columna o diagonal.
  - **FULL**: Todos los 25 índices.
  - **X**: Diagonales principales.
  - **CROSS**: Fila y columna central.
  - **CORNERS**: Las 4 esquinas del cartón.
- Actualizar funciones de validación para soportar estos patrones dinámicamente.

### 3. Automatización y Pausa (`src/lib/balls.functions.ts` y `src/lib/claims.functions.ts`)

- **Pausa Automática**: `claimBingo` cambiará el estado del juego a `PAUSED` en cuanto reciba un reclamo potencialmente válido.
- **Verificación Inteligente**: `verifyBingos` validará el patrón exacto. Si el cartón es falso, el juego se reanudará (`PLAYING`) automáticamente sin intervención del anfitrión.

### 4. Interfaz de Usuario (UI)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- **Selector de Patrón**: Añadir un menú desplegable para elegir el tipo de bingo.
- **Optimización de Slider**: Cambiar la lógica del slider para que solo actualice la base de datos al soltar el ratón/dedo, eliminando el lag.

#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
- Mostrar el objetivo de la partida (ej: "Debes formar una CRUZ").
- El botón de Bingo solo se activará si el sistema local detecta que el patrón se ha cumplido.

## Plan de Verificación

### Pruebas Manuales
1. Cambiar la velocidad rápidamente y verificar que el slider se mueve con fluidez.
2. Iniciar un juego en modo "Cartón Lleno".
3. Verificar que el botón de Bingo permanece desactivado hasta que se marquen todos los números.
4. Cantar bingo y confirmar que el sorteo se detiene instantáneamente.
