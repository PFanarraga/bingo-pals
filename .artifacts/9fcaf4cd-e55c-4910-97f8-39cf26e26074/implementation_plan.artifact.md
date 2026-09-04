# Plan: Ajuste de Parámetros por Defecto y Optimización de Audio

Este plan establece los nuevos valores iniciales solicitados para las partidas y ajusta el motor de audio para que las locuciones se sincronicen correctamente con velocidades de juego rápidas.

## User Review Required

> [!IMPORTANT]
> - **Nuevos Valores por Defecto:**
>   - Pozo inicial: **S/. 10.00**
>   - Modo de victoria: **Cartón Lleno (FULL)**
>   - Velocidad: **4 segundos por bola**
> - **Optimización de Audio:** El sistema acelerará automáticamente la velocidad de reproducción de la voz cuando el intervalo sea bajo (3-4s) para asegurar que la locución termine antes de que salga la siguiente bola.

## Pasos Propuestos

### 1. Lógica de Creación de Sala

#### [MODIFY] [rooms.functions.ts](file:///D:/bingo-pals/src/lib/rooms.functions.ts)
- Actualizar el comando `insert` en la función `createRoom` para incluir los nuevos valores predeterminados:
  - `prize: 10`
  - `winning_pattern: 'FULL'`
  - `ball_interval: 4`

### 2. Motor de Audio Dinámico

#### [MODIFY] [audio.ts](file:///D:/bingo-pals/src/lib/audio.ts)
- Añadir una variable global `announcerSpeed` para controlar la tasa de reproducción.
- Implementar la función `setAnnouncerSpeed(speed)` para actualizar este valor.
- Aplicar `audio.playbackRate` en la función interna `playFile`.

### 3. Sincronización en el Juego

#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
- Al cargar el estado del juego, calcular la velocidad necesaria según el `ball_interval`:
  - Si interval <= 3s → Velocidad 1.4x
  - Si interval <= 4s → Velocidad 1.2x
  - En otros casos → Velocidad 1.0x (normal)
- Llamar a `setAnnouncerSpeed` con el valor calculado.

## Plan de Verificación

### Pruebas de Configuración
1. Crear una sala nueva y verificar que el pozo dice 10, el modo es "Cartón Lleno" y la velocidad es 4s sin tocar nada.

### Pruebas de Audio
1. Iniciar el juego con velocidad 4s.
2. Verificar que la voz del locutor suena ligeramente más rápida y "encaja" bien antes de que aparezca el siguiente número.
3. Cambiar la velocidad a 10s y verificar que la voz vuelve a su ritmo normal.
