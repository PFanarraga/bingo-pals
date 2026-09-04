# Plan: Reactivación y Gestión de Códigos Vencidos

Este plan añade la capacidad para que el administrador pueda ver los códigos vencidos o agotados y reactivarlos con nuevos límites de tiempo y uso.

## User Review Required

> [!IMPORTANT]
> - El administrador ahora podrá ver el historial completo de códigos generados, no solo los activos.
> - Se añadirá una opción de "Reactivar" para los códigos que ya no son válidos.
> - Al reactivar, se podrán configurar nuevos límites de días y partidas.

## Pasos Propuestos

### 1. Lógica de Servidor (`src/lib/rooms.functions.ts`)

- **`getCreationCodes` (Actualizado)**: Cambiaremos la función actual para que devuelva todos los códigos generados por el administrador, permitiendo ver los vencidos.
- **`reactivateCreationCode` [NEW]**:
  - Función protegida por `is_authorized_admin`.
  - Permite actualizar un código existente con nueva fecha de `expires_at` y nuevo `use_limit`.
  - Reiniciará el contador de usos (`use_count = 0`) para permitir que el código vuelva a ser funcional desde cero.

### 2. Interfaz de Usuario (Modal de Gestión)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- **Mejora de la Lista**:
  - Los códigos vencidos aparecerán con una etiqueta roja de "**VENCIDO**" o "**AGOTADO**".
  - Se añadirá un botón de "**Reactivar**" junto a los códigos no válidos.
- **Flujo de Reactivación**:
  - Al pulsar "Reactivar", se abrirá el formulario de configuración (el mismo que se usa para crear) pero aplicado al código seleccionado.
  - Al confirmar, el código volverá a estar activo instantáneamente.

## Plan de Verificación

### Pruebas de Gestión
1. Verificar que en la lista de códigos ahora aparecen los que ya han caducado.
2. Pulsar "Reactivar" en un código vencido, ponerle 1 día de vida y 1 uso.
3. Intentar crear una sala con ese código reactivado -> Debe funcionar.
