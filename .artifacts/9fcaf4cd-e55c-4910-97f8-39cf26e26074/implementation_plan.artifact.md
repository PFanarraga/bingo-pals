# Plan: Chat de Voz Inteligente (10s Max y Rotación de 2 Audios)

Este plan implementa un sistema de mensajes de voz optimizado con rotación de archivos y "Ducking" de audio para una experiencia de juego interactiva.

## User Review Required

> [!IMPORTANT]
> - **Límite de tiempo:** La grabación se detendrá automáticamente a los **10 segundos**.
> - **Rotación de Audios:** Cada jugador podrá tener un máximo de **2 audios activos** en el servidor. Al enviar el tercero, el sistema borrará automáticamente el más antiguo de ese jugador.
> - **Borrado Final:** Al terminar la partida, se eliminarán todos los audios de la sala del Storage.
> - **Permisos:** Se solicitará acceso al micrófono en el primer uso.

## Pasos Propuestos

### 1. Motor de Audio con Ducking (`src/lib/audio.ts`)
- Implementar `announcerVolume` variable.
- Función `playVoiceMessage(url)`: baja el volumen del locutor al 20%, reproduce la voz y restaura el volumen al terminar.

### 2. Gestión de Almacenamiento y Voz (`src/lib/voice-chat.ts`)
- **Grabación**: Interfaz con `MediaRecorder` y límite de 10s.
- **Rotación (2 archivos)**: Antes de subir un audio nuevo, el sistema consultará cuántos audios tiene el jugador. Si ya tiene 2, borrará el más antiguo antes de subir el nuevo.
- **Broadcast**: Emitir la URL del audio vía Supabase Realtime.

### 3. Limpieza de Fin de Juego (`src/lib/rooms.functions.ts` y `src/lib/game.server.ts`)
- Implementar `cleanupRoomStorage(roomCode)` en el servidor.
- Ejecutar limpieza automática al cambiar estado a `FINISHED` o iniciar `newGame`.

### 4. Interfaz de Juego (`src/routes/juego.$code.tsx`)
- Añadir botón de **Micrófono** táctil.
- Visualización de estado: "Grabando (0:05 / 0:10)".
- Suscripción para reproducción automática de mensajes de otros jugadores.

## Plan de Verificación

### Pruebas de Funcionamiento
1. Enviar 3 audios seguidos -> Verificar en Supabase que solo quedan los 2 últimos.
2. Verificar que el audio del Bingo baja su volumen mientras suena la voz.
3. Finalizar partida y confirmar que el Storage se vacía completamente.
