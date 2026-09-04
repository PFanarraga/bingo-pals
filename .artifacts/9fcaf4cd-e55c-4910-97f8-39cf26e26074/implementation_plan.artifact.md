# Plan de Prueba de Estrés: Simulación de 100 Jugadores

Este plan describe cómo realizaremos una prueba técnica para verificar si el Bingo Pals puede soportar 100 jugadores reales simultáneamente, analizando tiempos de respuesta, límites de base de datos y estabilidad de la conexión.

## User Review Required

> [!IMPORTANT]
> - La prueba se realizará mediante un **script de simulación** que actuará como 100 "bots" conectándose a la vez.
> - **Costo de Recursos:** Si estás en el plan Gratuito de Supabase, 100 conexiones de Realtime están permitidas (el límite es 200).
> - **Tiempo de Ejecución:** La simulación durará unos minutos para medir la estabilidad.

## Pasos de la Prueba

### 1. Creación de Script de Simulación (`scratch/stress_test.ts`) [NEW]
Crearemos un script que automatice el siguiente flujo para 100 identidades únicas:
- **Fase 1: Conexión**: Ejecutar 100 llamadas a `joinRoom` en ráfagas.
- **Fase 2: Cartones**: Asignar 3 cartones a cada uno de los 100 jugadores (300 cartones totales).
- **Fase 3: Heartbeat**: Mantener 100 heartbeats activos cada 15 segundos para simular presencia real.
- **Fase 4: Realtime**: Suscribirse a los cambios de la sala desde los 100 bots para medir el lag de red.

### 2. Análisis de Cuellos de Botella
Monitorizaremos:
- **Tiempos de Inserción**: ¿Cuánto tarda Supabase en meter los 300 cartones en una sola ráfaga?
- **CPU del Worker**: ¿Cloudflare Workers alcanza su límite de tiempo al procesar la unión masiva?
- **Lag de Sincronización**: ¿Cuánto tarda un cambio de bola en llegar a todos los bots?

### 3. Informe de Resultados
Tras la prueba, generaré un informe detallando si el sistema es "Apto para 100" o si requiere optimizaciones adicionales (como paginación de datos o índices extra).

## Plan de Verificación

### Métricas de Éxito
- 100% de los jugadores (100) logran unirse sin errores `500`.
- Los 300 cartones se generan y asignan en menos de 5 segundos.
- El servidor mantiene las 100 sesiones activas sin desconexiones masivas.
