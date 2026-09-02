# Plan: Navegación de Cartones, Moneda Local y Fix de Generador

Este plan aborda la navegación en PC, cambia la moneda a Soles Peruanos y soluciona los fallos reportados en el generador de códigos.

## User Review Required

> [!IMPORTANT]
> - Cambiaremos el símbolo `$` por `S/.` en toda la aplicación.
> - Se investigará el fallo del generador de códigos (posible problema de permisos o de sincronización de estado).

## Pasos Propuestos

### 1. Navegación de Cartones (PC)

#### [MODIFY] [CardCarousel.tsx](file:///D:/bingo-pals/src/components/bingo/CardCarousel.tsx)
- Añadir botones de flecha laterales que aparecen al pasar el ratón.
- Implementar desplazamiento por clic.

### 2. Cambio de Moneda (S/. Soles)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
#### [MODIFY] [juego.$code.tsx](file:///D:/bingo-pals/src/routes/juego.$code.tsx)
#### [MODIFY] [resultado.$code.tsx](file:///D:/bingo-pals/src/routes/resultado.$code.tsx)
- Reemplazar el prefijo `$` por `S/.` en la visualización del pozo/premios.

### 3. Solución al Generador de Códigos

#### [INVESTIGAR]
- Verificar si la función `generateCreationCode` en `rooms.functions.ts` está recibiendo correctamente el `is_authorized_admin`.
- Revisar si el modal en `sala.$code.tsx` está manejando bien el estado de carga y la respuesta.
- Asegurar que la tabla `room_creation_codes` tiene los permisos correctos en Supabase.

## Plan de Verificación

### Pruebas Manuales
1. Probar flechas de cartones en PC.
2. Verificar que el pozo ahora muestra `S/.`.
3. Intentar generar un código y copiarlo al portapapeles.
