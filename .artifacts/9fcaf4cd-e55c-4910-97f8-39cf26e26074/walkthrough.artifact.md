# Visibilidad Global de Cartones

He implementado la transparencia total en el conteo de cartones para que tanto el anfitrión como los jugadores puedan supervisar la partida en todo momento.

## Cambios Realizados

### 1. Datos Compartidos
- Se actualizó el sistema central (`useGameState.ts`) para que todos los participantes descarguen el conteo de cartones activos en la sala. Anteriormente, esta información estaba restringida únicamente al anfitrión.

### 2. Sala de Espera Mejorada ([sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx))
- La lista de jugadores ahora muestra una etiqueta con el número de cartones (ej: "**3 CARTONES**") junto al nombre de cada persona.
- **Resaltado de "Listo":** Cuando un jugador marca "Listo", su fila se ilumina en verde y el conteo de cartones resalta, permitiendo al anfitrión confirmar la configuración de un vistazo antes de iniciar.

### 3. Panel de Jugadores en Juego
- El panel lateral (icono de grupo) ahora es informativo para todos. Cualquier jugador puede abrirlo para ver quién está conectado y con cuántos cartones está participando cada compañero.

## Cómo verificarlo

1.  **Sube los cambios:**
    ```powershell
    git add .
    git commit -m "Mejora: Visibilidad global de cartones en sala y juego"
    git push origin main
    ```
2.  **Lobby:** Entra con dos dispositivos y verifica que ambos ven el número de cartones del otro.
3.  **Partida:** Durante el juego, abre el panel de jugadores y confirma que el conteo de cartones es visible para todos.

¡Con esto el juego es mucho más transparente y fácil de coordinar! 📊🎱✨
