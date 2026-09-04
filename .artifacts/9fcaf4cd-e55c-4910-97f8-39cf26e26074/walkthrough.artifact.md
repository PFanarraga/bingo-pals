# Enlaces de Invitación Directa

He implementado un sistema de invitación simplificado para que tus invitados puedan entrar a la sala con un solo clic y sin complicaciones.

## Cambios Realizados

### 1. Pantalla de Entrada Rápida ([unirse.$code.tsx](file:///D:/bingo-pals/src/routes/unirse.$code.tsx))
- He creado una nueva página optimizada para los invitados que acceden mediante un enlace.
- **Flujo Simplificado:** La pantalla muestra el código de la sala y solo pide el Nombre y la cantidad de cartones.
- **Validación Automática:** Si el nombre ya está en uso en esa sala, el sistema avisará al invitado para que elija otro.

### 2. Botón de Compartir Inteligente ([sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx))
- Al pulsar "**Compartir**", ahora se genera un mensaje profesional que incluye un enlace directo: `https://tu-bingo.com/unirse/CODIGO`.
- El botón "**Copiar**" ahora guarda en el portapapeles el enlace directo en lugar de solo el código, facilitando el pegado en WhatsApp.

### 3. Memoria de Sesión
- Si un jugador ya está dentro de la sala y pulsa el enlace de invitación por error, el sistema detectará su sesión y lo enviará directamente a la sala de espera sin pedirle el nombre de nuevo.

## Cómo verificarlo

1.  **Sube los cambios:**
    ```powershell
    git add .
    git commit -m "Mejora: Enlaces de invitación directa con entrada rápida"
    git push origin main
    ```
2.  **Prueba el link:** Crea una sala, pulsa "Compartir" y envía el link a otro dispositivo (o ábrelo en Incógnito).
3.  **Entrada:** Verás la nueva pantalla de "Unirse a Sala". Pon un nombre, elige cartones y pulsa "¡ENTRAR AHORA!". Entrarás directo a la sala de espera.

¡Ahora invitar gente a tu Bingo es mucho más rápido y profesional! 🚀🔗🎱✨
