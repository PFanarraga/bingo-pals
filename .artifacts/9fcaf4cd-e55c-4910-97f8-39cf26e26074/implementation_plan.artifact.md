# Plan: Corrección de Sincronización y Audio en Sorteo Automático

Este plan resuelve el problema de inconsistencia donde el número cantado por el audio a veces no coincide con la lista de números que aparecen en pantalla.

## Análisis del Problema
El error ocurre debido a una "condición de carrera" (race condition). Cuando varios jugadores están conectados, sus navegadores intentan solicitar el sorteo automático casi al mismo tiempo.

Actualmente, el servidor lee la lista de números, elige uno nuevo y sobrescribe la lista completa. Si dos jugadores lo hacen a la vez, uno puede sobrescribir el trabajo del otro, haciendo que un número que se llegó a anunciar desaparezca de la lista oficial de la base de datos.

## User Review Required

> [!IMPORTANT]
> - Implementaremos una función interna en la base de datos (RPC) para que el sorteo sea "atómico". Esto significa que aunque 100 personas pidan una bola a la vez, el servidor las procesará una por una y solo aceptará una cada X segundos.
> - Esto garantiza que el número cantado siempre sea el que se guarda permanentemente.

## Pasos Propuestos

### 1. Base de Datos (Supabase)

#### [NEW] [20260905142000_atomic_draw_ball.sql](file:///D:/bingo-pals/supabase/migrations/20260905142000_atomic_draw_ball.sql)
Crearemos una función SQL `draw_next_ball` que realice todo el proceso de forma segura en el servidor:
- Bloquear la fila de la partida para evitar interferencias.
- Verificar que el juego esté en curso y haya pasado el tiempo (intervalo).
- Comprobar que no haya reclamos de Bingo pendientes.
- Elegir un número aleatorio de los restantes.
- Actualizar la lista (añadiendo el número) y marcar el tiempo actual.

### 2. Lógica de Servidor

#### [MODIFY] [balls.functions.ts](file:///D:/bingo-pals/src/lib/balls.functions.ts)
- Refactorizar `autoDrawBall` para que simplemente llame a la nueva función RPC de la base de datos en lugar de hacer los cálculos manualmente en el código de la App.

### 3. Refuerzo de Audio (Frontend)

#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
- Asegurar que el audio solo se dispare cuando la bola actual realmente esté presente en la lista oficial de bolas sorteadas, evitando cantar "fantasmas" que desaparecen por lag de red.

## Plan de Verificación

### Pruebas de Estrés
1. Abrir el juego en 3 pestañas diferentes.
2. Iniciar la partida.
3. Verificar que, aunque todas las pestañas intenten disparar el sorteo, solo sale una bola al ritmo configurado (ej: cada 4s) y el audio coincide 100% con lo que se ve en la lista de "Bolas Cantadas".
