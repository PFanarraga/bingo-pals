# Plan: Enlaces de Invitación Directa

Este plan implementa un sistema de invitaciones mediante enlaces directos. Al compartir el Bingo, se generará una URL que lleva al invitado a una pantalla simplificada donde solo debe ingresar su nombre para entrar a la sala.

## User Review Required

> [!IMPORTANT]
> - El nuevo enlace tendrá el formato: `https://tu-bingo.com/unirse/CODIGO`.
> - Si el usuario ya está en la sala (tiene sesión activa), el enlace lo llevará directamente a la sala de espera sin pedirle el nombre de nuevo.
> - Se valida automáticamente que el nombre no esté repetido en la sala.

## Pasos Propuestos

### 1. Nueva Ruta de Invitación

#### [NEW] [unirse.$code.tsx](file:///D:/bingo-pals/src/routes/unirse.$code.tsx)
Crearemos una página dedicada a los invitados que:
- Muestre el código de la sala a la que se están uniendo.
- Tenga un campo de texto para el nombre.
- Permita elegir el número de cartones (por defecto 1).
- Al pulsar "Entrar", ejecute la lógica de unión y redirija a `/sala/CODIGO`.

### 2. Mejora del Botón Compartir

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- Actualizar la función `share` para que genere el enlace completo:
  ```typescript
  const url = window.location.origin + "/unirse/" + code.toUpperCase();
  const text = `¡Únete a mi Bingo 75 en vivo!\nEntra aquí: ${url}`;
  ```
- Hacer lo mismo para el botón de "Copiar Código", permitiendo copiar el enlace directo opcionalmente o incluirlo en el portapapeles.

### 3. Lógica de Redirección Inteligente

- En `unirse.$code.tsx`, si se detecta que ya existe una sesión para esa sala en el navegador, se redirigirá al usuario a `/sala/CODIGO` automáticamente para ahorrarle pasos.

## Plan de Verificación

### Pruebas de Flujo
1. Crear una sala y pulsar "Compartir".
2. Abrir el enlace generado en una ventana de Incógnito.
3. Verificar que aparece la pantalla de "Unirse a la sala [CODIGO]".
4. Ingresar un nombre y confirmar.
5. Verificar que entra correctamente a la sala de espera con sus cartones.

### Pruebas de Validación
1. Intentar unirse con un nombre que ya existe en la sala -> Debe mostrar error.
2. Abrir el enlace en una pestaña donde ya eres el Host -> Debe llevarte directo a la sala sin pedir nombre.
