# Plan: Continuidad de Partida, Recuperación de Sesión y Memoria de Cartones

Este plan resuelve los problemas de persistencia del estado entre partidas, añade la capacidad de recuperar una partida en curso y asegura que los jugadores conserven sus cartones al pasar a una nueva ronda.

## User Review Required

> [!IMPORTANT]
> - **Reseteo de Estado:** Al iniciar una nueva partida, todos los jugadores volverán a "No Listo".
> - **Memoria de Cartones:** El sistema copiará automáticamente tus cartones de la partida anterior a la nueva. Podrás verlos en la sala de espera y decidir si quedártelos o cambiarlos.
> - **Persistencia de Sesión:** Cambiaremos a `localStorage` para que el celular te recuerde siempre.
> - **Recuperación:** La pantalla de inicio te permitirá volver a tu partida activa con un solo clic.

## Pasos Propuestos

### 1. Mejorar el inicio de "Nueva Partida"

#### [MODIFY] [rooms.functions.ts](file:///D:/bingo-pals/src/lib/rooms.functions.ts)
- **`newGame`**:
  1. Poner `is_ready = false` a todos los jugadores de la sala.
  2. Identificar los cartones que cada jugador tenía en la partida que acaba de terminar.
  3. Insertar esos mismos cartones (mismos números) en la nueva partida automáticamente.
  4. Esto permitirá que la sala de espera ya muestre los cartones previos del jugador.

### 2. Identidad Permanente

#### [MODIFY] [session.ts](file:///D:/bingo-pals/src/lib/session.ts)
- Cambiar el uso de `sessionStorage` a `localStorage` de forma definitiva.

### 3. Interfaz de Recuperación

#### [MODIFY] [index.tsx](file:///D:/bingo-pals/src/routes/index.tsx)
- Al cargar la página principal, buscar si hay una sesión guardada.
- Si existe, verificar en la base de datos si la sala sigue activa.
- Mostrar un banner o botón destacado: `"Tienes una partida activa en la sala [CODIGO]. [BOTÓN: VOLVER A JUGAR]"`.

## Plan de Verificación

### Pruebas de Memoria
1. Jugar una partida con cartones específicos.
2. Finalizar la partida y dar a "Continuar".
3. Verificar que en la sala de espera **ya tienes tus cartones anteriores** y que apareces como "**No Listo**".

### Pruebas de Cierre
1. Estar en una sala y cerrar la pestaña.
2. Abrir el Bingo de nuevo.
3. Verificar que aparece la opción de volver a entrar y que al hacerlo mantienes tu nombre y posición.
