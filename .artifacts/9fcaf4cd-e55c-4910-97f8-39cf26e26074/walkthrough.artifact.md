# Expansión a 100 Jugadores y Tour Interactivo

He implementado el aumento de capacidad del servidor y un sistema de tutorial dinámico mediante viñetas flotantes que señalan los elementos reales de la interfaz.

## Cambios Realizados

### 1. Capacidad para 100 Jugadores
- Se actualizó el motor de servidor (`game.server.ts`) para generar un pool de **300 cartones únicos** al crear una partida.
- Esto permite que hasta 100 jugadores participen simultáneamente con el máximo de 3 cartones cada uno sin riesgo de duplicados.

### 2. Tour Interactivo con Viñetas ([GuidedTour.tsx](file:///D:/bingo-pals/src/components/ui/GuidedTour.tsx))
- He creado un sistema de "**Spotlight**" (foco) que oscurece la pantalla e ilumina el elemento que se está explicando.
- Las explicaciones aparecen en viñetas flotantes con botones de "Siguiente" y "Atrás".

### 3. Tutoriales Configurados
- **En Inicio:** Explica el nombre, código de sala, selección de cartones y código de creación.
- **En Sala de Espera:** Explica la lista de jugadores, la gestión de cartones y la importancia del botón de "**Listo**".
- **Botón de Ayuda:** El icono `?` en la pantalla principal ahora reinicia ambos tutoriales para que el usuario pueda volver a verlos.

## Cómo verificarlo

1.  **Sube los cambios:**
    ```powershell
    git add .
    git commit -m "Mejora: Capacidad 100 jugadores y Tutorial interactivo con viñetas"
    git push origin main
    ```
2.  **Primera Visita:** Entra al sitio (preferiblemente en Incógnito o tras pulsar el botón `?`). Verás cómo el sistema te va llevando de la mano por cada campo del formulario.
3.  **Sala de Espera:** Crea una sala y verás el segundo tour explicando los controles de anfitrión y la lista de jugadores.

¡Tu Bingo ahora es una plataforma profesional lista para grandes grupos! 🚀🎯🎱✨
