# Plan: Corrección de Errores de Importación y Estabilidad Multi-sala

Este plan soluciona los problemas reportados al usar múltiples salas simultáneamente, corrigiendo las funciones de gestión de cartones y mejorando la estabilidad del audio y sesiones.

## User Review Required

> [!IMPORTANT]
> - Se restaurarán las funciones `assignCards` y `rerollCard` que se eliminaron accidentalmente de la pantalla de sala.
> - Se mejorará la aislamiento de sesiones para evitar conflictos cuando se abren varias salas en el mismo navegador.

## Pasos Propuestos

### 1. Corrección de Funcionalidad de Cartones

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Restaurar las importaciones de `assignCards` y `rerollCard` desde `@/lib/cards.functions`. Esto solucionará el problema donde no se podían cambiar cartones en el móvil.

### 2. Estabilidad de Sesiones Multi-pestaña

#### [MODIFY] [session.ts](file:///D:/bingo-pals/src/lib/session.ts)
- Eliminar el guardado de la "última sesión" genérica (`bingo75:session`) cuando se trabaja con salas específicas. Esto evitará que una pestaña "ensucie" la identidad de otra al crear salas nuevas rápidamente.

### 3. Mejora de Audio y Rendimiento

#### [MODIFY] [audio.ts](file:///D:/bingo-pals/src/lib/audio.ts)
- Añadir un control para evitar que la cola de audio se sature si hay múltiples instancias intentando reproducir sonidos al mismo tiempo.

## Plan de Verificación

### Pruebas Manuales
1. Abrir la sala en el móvil y verificar que los botones de "1, 2, 3 cartones" y "Cambiar al azar" vuelven a funcionar.
2. Crear dos salas diferentes en dos pestañas del mismo PC y verificar que cada una mantiene sus propios cartones y sonidos.
3. Confirmar que el juego no se queda mudo tras una sesión larga de juego.
