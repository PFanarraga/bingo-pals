# Mensajes de Voz con Ducking y Limpieza Inteligente

He implementado el sistema de mensajes de voz ("Push-to-Talk") para que los jugadores puedan interactuar de forma divertida durante el Bingo, con un sistema de sonido inteligente y limpieza automática de archivos.

## Cambios Realizados

### 1. Sistema de "Ducking" de Audio ([audio.ts](file:///D:/bingo-pals/src/lib/audio.ts))
- He mejorado el motor de sonido para que sea "respetuoso": cuando suena un mensaje de voz de un jugador, el locutor que canta las bolas **baja su volumen al 15%** automáticamente.
- Una vez termina el mensaje de voz, el locutor vuelve a su volumen normal sin detenerse.

### 2. Grabación y Rotación Inteligente ([voice-chat.ts](file:///D:/bingo-pals/src/lib/voice-chat.ts))
- **Límite de 10s:** La grabación se corta automáticamente a los 10 segundos para no saturar.
- **Rotación de 2 Audios:** Cada jugador puede tener un máximo de 2 mensajes de voz en el servidor. Al enviar el tercero, el sistema **borra automáticamente el más antiguo** de ese jugador.
- **Transmisión en Vivo:** Los audios suenan instantáneamente en los dispositivos de todos los participantes de la sala.

### 3. Limpieza Automática de Seguridad
- El servidor ahora ejecuta una orden de "**borrado total**" del almacenamiento de la sala en dos momentos:
  - Cuando el anfitrión finaliza la partida.
  - Cuando se inicia una nueva partida en la misma sala.
- Esto garantiza que no quede ningún rastro de audios grabados después de jugar.

### 4. Nueva Interfaz de Micrófono ([juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx))
- He añadido el botón "**Hablar**" en la barra inferior (icono de micrófono).
- **Cómo usar:** Mantén pulsado para grabar (verás un contador y un aviso de "Grabando...") y suelta para enviar.
- El diseño es totalmente responsive y funciona tanto con ratón como con el dedo en el móvil.

## Pasos para Activar (Manual)

1.  **Sube los cambios a tu nube:**
    ```powershell
    git add .
    git commit -m "Implementado Chat de Voz con Ducking y rotación de 2 audios"
    git push origin main
    ```

2.  **RECUERDA EL STORAGE:**
    Asegúrate de haber creado el bucket `voice_messages` en tu panel de **Supabase > Storage** con permisos de **SELECT** e **INSERT** públicos (como configuramos antes).

¡Ya puedes disfrutar de la partida hablando con tus amigos! 🎤🔊🎱✨
