# Plan: Configuración de Velocidad de Cantado

Este plan añade un control deslizante (slider) en la sala de espera para que el anfitrión pueda configurar la velocidad a la que el sistema cantará las bolillas automáticamente.

## User Review Required

> [!IMPORTANT]
> - El rango de velocidad será de **3 a 30 segundos** por bola.
> - Solo el anfitrión podrá ver y ajustar este control.
> - La configuración se guardará en la partida actual y afectará al sorteo automático.

## Pasos Propuestos

### 1. Estado del Juego

#### [MODIFY] [useGameState.ts](file:///D:/bingo-pals/src/hooks/useGameState.ts)
- Añadir `ball_interval` al tipo `Game`.
- Incluir `ball_interval` en la consulta a la tabla `games`.

### 2. Lógica de Servidor

#### [MODIFY] [rooms.functions.ts](file:///D:/bingo-pals/src/lib/rooms.functions.ts)
- Implementar la función `setBallInterval` para actualizar el tiempo entre bolas en la base de datos.

### 3. Interfaz de Usuario (Lobby)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Importar el componente `Slider` de `@/components/ui/slider`.
- Añadir una sección de "Configuración de Partida" visible solo para el host.
- Incluir el slider de velocidad con la visualización del tiempo seleccionado (ej: "Velocidad: 10s / bola").

## Plan de Verificación

### Pruebas Manuales
1. Crear una sala como anfitrión y verificar que aparece el slider.
2. Mover el slider y confirmar que el valor se actualiza (puedes verificarlo refrescando la página o viendo el panel de Supabase).
3. Iniciar el juego y verificar que las bolas salen al ritmo configurado.
