# Configuración de Velocidad (1-10s)

He añadido un control de velocidad deslizante en la sala de espera para que el anfitrión pueda ajustar el ritmo del juego.

## Cambios Realizados

### 1. Control Deslizante (Slider)
- Se añadió una nueva sección de "**Velocidad de juego**" en la sala de espera, visible únicamente para el anfitrión.
- El rango configurado es de **1 a 10 segundos** por bolilla.
- Se utiliza un componente visual moderno con un icono de cronómetro (`Timer`).

### 2. Sincronización en Tiempo Real
- La velocidad elegida se guarda instantáneamente en la base de datos de Supabase.
- Todos los cambios se reflejan en tiempo real para el anfitrión mientras ajusta la barra.

### 3. Lógica de Servidor
- Se implementó la función `updateBallInterval` para gestionar el cambio de tiempo de forma segura desde el servidor.

## Cómo usarlo:
1. Entra en la Sala de Espera como anfitrión.
2. Verás un panel llamado "**Velocidad de juego**".
3. Mueve la barra para elegir entre 1 y 10 segundos.
4. Al iniciar la partida, el sorteo automático respetará ese tiempo exacto.

¡El anfitrión ahora tiene el control total del ritmo de la partida! 🚀
