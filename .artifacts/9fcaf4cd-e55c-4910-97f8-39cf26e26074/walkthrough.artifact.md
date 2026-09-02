# Protección de Salas y Gestión de Códigos (4 Dígitos)

He implementado el sistema de seguridad para restringir la creación de salas mediante códigos de acceso, manteniendo la simplicidad y la independencia de la arquitectura actual.

## Cambios Realizados

### 1. Sistema de Autorización Doble
- **Código Maestro:** Se introdujo un código privado (configurable por variable de entorno) que otorga poderes de "Administrador Autorizado".
- **Códigos Normales:** Se implementó una nueva tabla `room_creation_codes` para gestionar permisos de un solo uso o temporales para otros anfitriones.

### 2. Creación Protegida ([index.tsx](file:///D:/bingo-pals/src/routes/index.tsx))
- La sección de "Crear Sala" ahora incluye un campo obligatorio para el **Código de Creación de 4 dígitos**.
- El servidor valida este código antes de permitir la creación de cualquier sala.

### 3. Generador de Códigos ([sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx))
- **Exclusividad:** Solo el anfitrión que entró con el Código Maestro verá el botón "**GENERAR CÓDIGO**".
- **Modal Inteligente:** Permite crear nuevos códigos con:
  - Vencimiento (1, 7, 30 días o ilimitado).
  - Límite de usos (1, 5, 10 usos o ilimitado).
- **Copia Rápida:** Una vez generado, se puede copiar al portapapeles con un solo clic.

### 4. Seguridad de Backend
- Las funciones de validación y generación se ejecutan exclusivamente en el servidor.
- El Código Maestro nunca se envía al cliente; la validación ocurre de forma interna en Supabase/Cloudflare.

## Pasos para Activar (Manual)

Como hemos modificado la estructura de datos, por favor ejecuta:

1.  **Actualizar Base de Datos:**
    ```powershell
    npx supabase db push --include-all
    ```

2.  **Configurar Código Maestro:**
    Debes añadir la variable `MASTER_CREATION_CODE` en el panel de **Cloudflare (Runtime y Builds)** y en el de **Supabase**.
    Ejemplo: `MASTER_CREATION_CODE=1234`.

3.  **Sube los cambios:**
    ```powershell
    git add .
    git commit -m "Protección de creación de salas con códigos de 4 dígitos"
    git push origin main
    ```

¡Tu Bingo ahora está protegido! Solo tú (con el código maestro) puedes generar llaves para que otros amigos creen sus propias salas. 🔒🎲
