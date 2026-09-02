# Plan: Gestión Avanzada de Códigos de Creación

Este plan detalla las mejoras al sistema de códigos: personalización de límites y visibilidad del estado de los códigos activos para el administrador.

## User Review Required

> [!IMPORTANT]
> - Añadiremos opciones de "Personalizado" para días y usos.
> - El administrador podrá ver una lista de los códigos que ha generado y que aún están vigentes.
> - Se mostrará el tiempo restante (ej: "Faltan 3 horas" o "Vence en 5 días") de forma legible.

## Pasos Propuestos

### 1. Lógica de Servidor (`src/lib/rooms.functions.ts`)

- **`getActiveCreationCodes` [NEW]**:
  - Función protegida por `is_authorized_admin`.
  - Devuelve la lista de códigos que no han vencido, no han agotado sus usos y están activos.

### 2. Interfaz de Usuario (Modal de Códigos)

#### [MODIFY] [sala.$code.tsx](file:///D:/bingo-pals/src/routes/sala.$code.tsx)
- **Campos Personalizados**:
  - Si se elige "Personalizado" en el vencimiento, aparecerá un campo numérico para escribir los días exactos.
  - Si se elige "Personalizado" en el límite, aparecerá un campo numérico para los usos.
- **Lista de Códigos Activos**:
  - Añadir una sección dentro del modal (o debajo) que cargue la lista de códigos generados.
  - Mostrar para cada uno: `Código`, `Usos restantes` (ej: 2/5) y `Tiempo restante`.
  - Incluir botón para copiar rápidamente cualquiera de ellos.

### 3. Utilidades de Tiempo

- Usaremos `date-fns` (ya incluido en el proyecto) para calcular "Vence en X días/horas" de forma automática y amigable.

## Plan de Verificación

### Pruebas de Personalización
1. Generar un código de exactamente 3 usos -> Verificar que se registra así.
2. Generar un código que venza en 2 horas (0.08 días) -> Verificar el cálculo del tiempo restante.

### Pruebas de Visibilidad
1. Entrar como Administrador Maestro.
2. Abrir el modal y verificar que los códigos generados anteriormente aparecen en la lista con su cuenta regresiva.
