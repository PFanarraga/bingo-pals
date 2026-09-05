# Plan: Mejoras de Validación, Moderación y Navegación

Este plan implementa un sistema de feedback detallado para bingos inválidos, una navegación más fluida al finalizar partidas y herramientas de moderación (expulsar) para el anfitrión.

## User Review Required

> [!IMPORTANT]
> - Al cantar un Bingo inválido, el jugador verá exactamente qué números le faltaban según las bolas sorteadas.
> - El anfitrión podrá expulsar jugadores de la sala pulsando una 'X' en la lista.
> - Se simplifica la pantalla de resultados con un único botón de "Continuar".

## Pasos Propuestos

### 1. Lógica de Validación Detallada

#### [MODIFY] [bingo.ts](file:///D:/bingo-pals/src/lib/bingo.ts)
- Implementar `getMissingNumbers(numbers, drawn, pattern)`: Devuelve la lista de números que faltan para completar el patrón seleccionado.

#### [MODIFY] [claims.functions.ts](file:///D:/bingo-pals/src/lib/claims.functions.ts)
- Actualizar `claimBingo` para que devuelva los números faltantes en caso de que el bingo sea inválido.

### 2. Interfaz de Juego (Feedback)

#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
- Añadir un modal informativo que se dispare cuando el servidor responda con un Bingo inválido.
- El modal mostrará: "Bingo Inválido", la lista de números faltantes y una breve explicación.

### 3. Moderación y Salida en Lobby

#### [NEW] [rooms.functions.ts#kickPlayer](file:///D:/bingo-pals/src/lib/rooms.functions.ts)
- Crear una función de servidor para eliminar a un jugador de la sala (protegida para el Host).

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- **Botón Salir:** Añadir un icono de "puerta" en la parte superior para abandonar la sala voluntariamente.
- **Botón Expulsar:** Si el usuario es Host, mostrar una 'X' roja junto a cada jugador en la lista para expulsarlos.

### 4. Navegación Post-Partida

#### [MODIFY] [resultado.$code.tsx](file:///D:/bingo-pals/src/routes/resultado.$code.tsx)
- Eliminar los botones actuales y sustituirlos por un botón principal de "**CONTINUAR**" que redirige al lobby (`/sala/$code`).

## Plan de Verificación

### Pruebas de Feedback
1. Intentar cantar bingo sin tener los números -> Verificar que aparece el modal con los números faltantes exactos.

### Pruebas de Moderación
1. Como Host, expulsar a un jugador -> Verificar que el jugador es redirigido al inicio y desaparece de la lista.
2. Como jugador, pulsar el botón de salir -> Verificar salida correcta.

### Pruebas de Navegación
1. Finalizar partida y pulsar "Continuar" -> Verificar que se vuelve al lobby y todo está listo para la siguiente ronda.
