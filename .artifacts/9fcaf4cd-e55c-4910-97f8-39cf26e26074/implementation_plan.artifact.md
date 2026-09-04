# Plan: Expansión a 100 Jugadores y Tutorial Interactivo

Este plan aumenta la capacidad de la sala a 100 jugadores (generando un pool de 300 cartones únicos) e implementa un nuevo sistema de tutorial interactivo mediante viñetas flotantes (tooltips) que señalan elementos reales de la interfaz.

## User Review Required

> [!IMPORTANT]
> - **Capacidad:** El pool de cartones pre-generados pasará de 30 a **300**. Esto permitirá hasta 100 jugadores por sala (3 cartones cada uno).
> - **Tutorial:** Se sustituirá el modal de diapositivas por un sistema de "Tour Guiado" que resaltará los botones y campos de entrada reales.
> - **Alcance del Tutorial:** Cubrirá la Pantalla de Inicio y la Sala de Espera.

## Pasos Propuestos

### 1. Escalabilidad de Servidor

#### [MODIFY] [game.server.ts](file:///D:/bingo-pals/src/lib/game.server.ts)
- Actualizar `initializeCardPool` para generar **300 cartones** únicos por defecto al crear una partida.

### 2. Tutorial Interactivo (Tour)

#### [NEW] [GuidedTour.tsx](file:///D:/bingo-pals/src/components/ui/GuidedTour.tsx)
Crearemos un componente que maneje una secuencia de pasos. Cada paso tendrá:
- Un selector CSS para identificar el elemento a resaltar.
- Un texto explicativo.
- Posicionamiento automático (arriba/abajo del elemento).

**Pasos en Pantalla de Inicio:**
1. Input de nombre: "Selecciona tu nombre de usuario".
2. Input de código: "Aquí puedes colocar el número de sala para unirte".
3. Botones de cartones: "Elige con cuántos cartones quieres jugar".
4. Código de creación: "Si tienes un código maestro o adquirido, ponlo aquí".

**Pasos en Sala de Espera:**
1. Lista de jugadores: "Aquí ves quién está conectado y sus cartones".
2. Botón Listo: "Pulsa aquí cuando estés preparado para empezar".
3. Selectores de Host (si aplica): "Configura el modo y velocidad aquí".

### 3. Integración de Componentes

#### [MODIFY] [index.tsx](file:///D:/bingo-pals/src/routes/index.tsx)
- Añadir IDs o clases específicas a los elementos de la interfaz para que el tutorial pueda localizarlos.
- Integrar el componente `GuidedTour` específico para la Home.

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Añadir identificadores a la lista de jugadores y controles.
- Integrar el componente `GuidedTour` específico para la Sala.

## Plan de Verificación

### Pruebas de Carga
1. Crear una sala y verificar en el Table Editor de Supabase que se han insertado 300 cartones en `game_card_pool`.

### Pruebas de UX
1. Entrar por primera vez y verificar que las viñetas flotantes aparecen señalando los campos correctos.
2. Completar el tour y verificar que no vuelve a aparecer tras refrescar.
