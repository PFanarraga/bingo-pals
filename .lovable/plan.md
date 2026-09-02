# BINGO 75 ONLINE — Arquitectura propuesta (MVP v1.0)

Solo propuesta. No se implementa nada hasta tu confirmación.

## 1. Decisiones técnicas (y por qué)

- **Frontend**: React 19 + TypeScript + Vite, con **TanStack Start** (el router/SSR ya fijado en este entorno). Es React+TS+Vite como pediste; el único cambio es el router, que no es opcional aquí.
- **Backend / DB / Realtime**: Lovable Cloud (Postgres + Realtime + funciones de servidor). Cubre exactamente lo que pediste sin cuentas externas.
- **Lógica autoritativa en servidor**: toda acción sensible (crear sala, generar cartones, sacar bola, validar bingo, finalizar) se ejecuta en **funciones de servidor**, no en el cliente. El cliente solo pide y muestra.
- **Realtime**: suscripción Postgres Changes a `games`, `players`, `bingo_claims`, `rooms`. Simple y suficiente para el MVP; sin canales presencia personalizados.
- **Conexión/desconexión**: campo `connected` + `last_seen_at` en `players`, actualizado con un heartbeat ligero (~15 s). Más simple y robusto que Presence para 500 jugadores.
- **PWA**: manifest + service worker (Vite PWA). Cacheo de shell y audios; los datos de juego nunca se cachean.
- **Hosting**: publicación desde Lovable (equivalente a Pages, sin configuración manual).

## 2. Esquema de base de datos

Mantengo tu esquema con 3 ajustes mínimos (motivo indicado):

- `players.session_token` (uuid): sin login, hace falta algo que impida que un cliente actúe como otro jugador. Se guarda en `localStorage` y permite reconexión.
- `games.drawn_balls int[]` + `games.current_ball int`: array ordenado es suficiente y da gratis "últimas 3" y "las 75".
- `bingo_claims.marked_state jsonb` + `verified_at`: guarda lo que envió el cliente para auditoría, pero la validación usa los números reales del cartón y `drawn_balls`.

Tablas: `rooms`, `players`, `cards`, `games`, `bingo_claims`, `winners` (campos tal como los definiste, más los anteriores). `rooms.max_players` por defecto 500 y configurable.

**Seguridad de datos**: RLS activo en todas las tablas. Lectura pública acotada por sala (no se expone `session_token` ni cartones de otros jugadores); toda escritura pasa por funciones de servidor.

## 3. Estructura de carpetas

```text
src/
  routes/
    index.tsx           INICIO (crear/entrar)
    sala.$code.tsx      SALA DE ESPERA
    juego.$code.tsx     JUEGO
    resultado.$code.tsx RESULTADO
  components/
    bingo/   Card, CardCarousel, LastThreeBalls, AllBallsModal, BingoButton
    host/    HostControls, PlayersPanel, ClaimsPanel, PrizeField
    ui/      (shadcn)
  lib/
    bingo.ts            letras, rangos, patrones (puro, compartido)
    audio.ts            cola de audio secuencial + comentarios
    session.ts          identidad local del jugador
    rooms.functions.ts    crear/entrar/iniciar/pausar/finalizar/nueva partida
    cards.functions.ts    generar/elegir cartones
    balls.functions.ts    sacar bola
    claims.functions.ts   cantar bingo / verificar
  hooks/
    useRealtimeGame.ts  useHeartbeat.ts  useAudioQueue.ts
public/audio/           B.mp3 … O.mp3, 01.mp3 … 75.mp3, comentarios/
```

## 4. Dependencias

Ya presentes: React, TS, Vite, TanStack Router/Query, Tailwind v4, shadcn. A añadir: cliente de Lovable Cloud (automático al activarlo), `vite-plugin-pwa`, `zod` (validación de entradas), `sonner` (avisos). Nada más.

## 5. Variables de entorno

Las genera Lovable Cloud automáticamente al activarlo (URL y claves pública/privada). No necesitas crear ni pegar ninguna clave.

## 6. Herramientas que necesitas instalar

Ninguna. Se construye y prueba aquí; para probar en el móvil basta abrir la URL de vista previa. VS Code solo si quieres editar en local.

## 7. Riesgos técnicos principales

1. **Audio en móviles**: iOS bloquea el sonido hasta la primera interacción. Mitigación: botón de sonido que "desbloquea" el audio al entrar en el juego.
2. **Cola de audio**: letra → pausa → número sin depender de silencios internos. Requiere una cola secuencial propia; si sale otra bola antes, se corta y se encola.
3. **Concurrencia de bingos**: varias reclamaciones simultáneas. Mitigación: todas se registran; los ganadores se calculan sobre la misma jugada (número de bolas), no por velocidad.
4. **Realtime con muchos jugadores**: el estado de la partida va en una sola fila `games`, no un evento por jugador.
5. **Precarga de 80 audios**: carga diferida + cacheo por el service worker.

## 8. Fases (tareas pequeñas)

1. Sistema de diseño Mobile First + pantalla INICIO
2. Activar Lovable Cloud + esquema + RLS
3. Crear sala / entrar / sala de espera (realtime + heartbeat)
4. Generación de cartones en servidor (azar y elegir)
5. Pantalla de JUEGO: cartón, carrusel 1–3, marcado manual
6. Sacar bola (servidor), últimas 3, modal de las 75
7. Sincronización realtime completa + pausar/continuar
8. Audio (letra + número) y comentarios con control de frecuencia
9. Botón BINGO, reclamación y validación en servidor
10. Panel del anfitrión: jugadores, verificar bingo, finalizar
11. RESULTADO: varios ganadores + división del premio
12. Reconexión y recuperación de estado
13. PWA (manifest, service worker, instalable)
14. Pruebas móviles (360/375/390/414) y ajustes finales

## 9. Necesito de ti

- Los archivos de audio (`B.mp3`…`O.mp3`, `01.mp3`…`75.mp3` y comentarios). Si no los subes, dejo el sistema listo y silencioso hasta que los añadas.
- Confirmación del patrón de Bingo del MVP: propongo **cartón lleno** o **línea** — dime cuál, o lo dejo en **línea (horizontal, vertical o diagonal)** por defecto.
