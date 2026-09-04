# Plan: Mejoras de Gestión de Anfitrión y Estabilidad de Salas

Este plan detalla las modificaciones para mejorar la visibilidad del anfitrión, asegurar el estado de los jugadores y resolver el bloqueo de códigos de creación por salas inactivas.

## User Review Required

> [!IMPORTANT]
> - El botón "**MARCAR LISTO**" se volverá permanente una vez pulsado para evitar cambios constantes.
> - El sistema de creación de salas será más permisivo: si una sala asociada a un código no tiene jugadores conectados, se permitirá crear una nueva sala ignorando el bloqueo anterior.
> - Se añadirá información de contacto de WhatsApp en la pantalla principal.

## Pasos Propuestos

### 1. Visibilidad del Anfitrión

#### [MODIFY] [useGameState.ts](file:///D:/bingo-pals/src/hooks/useGameState.ts)
- Si el usuario es el anfitrión, el sistema descargará el conteo de cartones por cada jugador para mostrarlo en el panel.

#### [MODIFY] [PlayersPanel.tsx](file:///D:/bingo-pals/src/components/host/PlayersPanel.tsx)
- Mostrar junto al nombre de cada jugador el número de cartones que tiene asignados (ej: "Pedro (3 cartones)").

### 2. Control de Estado "Listo"

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Deshabilitar el botón de "**LISTO**" una vez que el jugador lo haya pulsado con éxito. El texto cambiará a "**¡YA ESTÁS LISTO!**".

### 3. Resolución de Bloqueo de Salas Inactivas

#### [MODIFY] [rooms.functions.ts](file:///D:/bingo-pals/src/lib/rooms.functions.ts)
- **`createRoom`**: Mejorar la validación de salas activas. Si el código ya tiene una sala pero esta tiene **0 jugadores conectados**, el sistema permitirá crear la nueva sala automáticamente (liberando el código).
- Implementar una limpieza de seguridad: si una sala no tiene actividad detectada (vía heartbeat), se considerará elegible para ser reemplazada.

### 4. Información en Pantalla Principal

#### [MODIFY] [index.tsx](file:///D:/bingo-pals/src/routes/index.tsx)
- Añadir un banner informativo o mensaje debajo del campo de "Código de Creación" con los números de WhatsApp indicados para soporte y adquisición de códigos.

## Plan de Verificación

### Pruebas de Gestión
1. Entrar como Host y verificar que en el panel de jugadores aparece el número de cartones de cada invitado.
2. Como jugador, pulsar "Listo" y verificar que el botón queda bloqueado.

### Pruebas de Estabilidad
1. Crear una sala con un código, cerrar el navegador de todos los participantes.
2. Intentar crear una nueva sala con el mismo código -> El sistema debe permitirlo al detectar la sala anterior vacía.
