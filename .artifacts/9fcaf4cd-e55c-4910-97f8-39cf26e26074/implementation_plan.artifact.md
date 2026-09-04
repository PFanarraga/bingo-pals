# Plan: Visibilidad Global de Cartones

Este plan permite que todos los jugadores vean cuántos cartones tiene cada participante y mejora la vista del anfitrión en la sala de espera para supervisar los cartones antes de iniciar.

## User Review Required

> [!NOTE]
> - El conteo de cartones será público para todos los participantes de la sala.
> - Se actualizará tanto la sala de espera como el panel lateral del juego.

## Pasos Propuestos

### 1. Estado Global del Juego

#### [MODIFY] [useGameState.ts](file:///D:/bingo-pals/src/hooks/useGameState.ts)
- Eliminar la restricción que solo permitía al anfitrión descargar la lista de todos los cartones (`allCards`). Ahora todos los jugadores descargarán esta información mínima (ID de cartón y ID de jugador) para poder realizar el conteo localmente.

### 2. Sala de Espera (Lobby)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Actualizar la lista de jugadores para mostrar el número de cartones junto al nombre.
- Resaltar el conteo de cartones especialmente cuando un jugador marca "Listo", para que el anfitrión pueda confirmar rápidamente la configuración de la partida.

### 3. Panel de Jugadores (Juego)

#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
- Pasar la información de `allCards` al componente `PlayersPanel` para todos los usuarios, no solo para el host.

## Plan de Verificación

### Pruebas Visuales
1. Entrar como jugador y verificar que puedes ver cuántos cartones tienen tus compañeros en la lista.
2. Como anfitrión, verificar que al ponerse alguien "Listo", el número de cartones es claramente visible en la sala de espera.
