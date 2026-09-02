# Restricción de Salas Simultáneas por Código

He implementado una nueva capa de seguridad que impide que un código de creación normal sea utilizado para abrir múltiples salas al mismo tiempo.

## Cambios Realizados

### 1. Vínculo Sala-Código
- Se añadió una columna `created_by_code_id` a la tabla `rooms`.
- Esto permite al sistema saber exactamente qué código "pagó" por la creación de cada sala.

### 2. Validación de Sala Activa
- **Códigos Normales:** Al intentar crear una sala, el servidor ahora revisa si existe alguna otra sala abierta (`WAITING`, `PLAYING`, `PAUSED`) vinculada a ese código.
- **Bloqueo:** Si hay una sala activa, la creación se rechaza con el mensaje: *"Este código ya tiene una sala activa. Finalízala para crear una nueva."*
- **Código Maestro:** El código maestro (`PMFF2309`) está exento de esta regla y puede seguir creando infinitas salas simultáneas.

## Pasos para Activar (Manual)

Como hemos modificado la base de datos para rastrear los códigos, por favor ejecuta:

1.  **Actualizar DB:**
    ```powershell
    npx supabase db push --include-all
    ```

2.  **Sube los cambios:**
    ```powershell
    git add .
    git commit -m "Implementada restricción de sala única por código normal"
    git push origin main
    ```

## Cómo Probarlo:
1. Genera un código normal.
2. Úsalo para crear una sala.
3. Intenta usar **ese mismo código** en otra pestaña para abrir una segunda sala -> El sistema te dará el error de "Sala activa".
4. Finaliza la primera partida (como Host).
5. Vuelve a intentar crear la sala con el mismo código -> Ahora te dejará pasar.

¡Ahora tienes un control mucho más estricto y profesional sobre el uso de tus códigos! 🔒🎱✅
