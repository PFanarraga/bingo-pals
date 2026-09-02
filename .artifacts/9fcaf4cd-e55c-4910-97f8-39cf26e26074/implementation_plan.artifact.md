# Plan: Despliegue en Producción 24/7 (Cloudflare)

Este plan detalla los pasos finales para dejar tu PWA de Bingo online permanentemente usando Cloudflare Pages y tu propio Supabase.

## User Review Required

> [!IMPORTANT]
> - Necesitas tener acceso a tu panel de **Cloudflare** y a tu repositorio de **GitHub**.
> - Asegúrate de haber realizado todos los `git commit` y `git push` de los cambios que hemos hecho hoy.

## Pasos Propuestos

### 1. Preparación del Código

#### [MODIFY] [client.server.ts](file:///D:/bingo-pals/src/integrations/supabase/client.server.ts)
Aseguraremos que los mensajes de error no mencionen a "Lovable Cloud" para que sea totalmente profesional.

### 2. Configuración en Cloudflare Pages

Debes seguir estos pasos en el panel de Cloudflare:

1.  **Conectar Repositorio:** Ve a *Workers & Pages > Create > Pages > Connect to Git*.
2.  **Configuración de Build:**
    - **Framework Preset:** `None` (TanStack Start usa Nitro, que Cloudflare detecta automáticamente).
    - **Build command:** `bun run build` (o `npm run build` si no detecta bun).
    - **Build output directory:** `.output/public`.
3.  **Variables de Entorno (CRÍTICO):**
    Añade estas variables en *Settings > Environment Variables* (tanto en "Production" como en "Preview"):
    - `VITE_SUPABASE_URL`: Tu URL de Supabase.
    - `VITE_SUPABASE_PUBLISHABLE_KEY`: Tu Anon Key.
    - `SUPABASE_SERVICE_ROLE_KEY`: Tu Service Role Key (necesaria para el servidor).
    - `SUPABASE_URL`: (Repetir la URL para el servidor).
    - `SUPABASE_PUBLISHABLE_KEY`: (Repetir la Anon Key para el servidor).

### 3. Configuración de PWA (Opcional pero Recomendado)

Para que el Bingo se sienta como una aplicación real en el móvil:
- Verificaremos el archivo `public/manifest.json`.
- Aseguraremos que los iconos estén presentes.

## Plan de Verificación

### Pruebas de Despliegue
1. Realizar un commit final con los cambios.
2. Verificar en el panel de Cloudflare que el build termine con éxito.
3. Abrir la URL proporcionada por Cloudflare (`https://tu-proyecto.pages.dev`).

### Pruebas de Funcionamiento
1. Crear una sala en la URL de producción.
2. Unirse desde un móvil y verificar que los audios y colores funcionan 24/7.
