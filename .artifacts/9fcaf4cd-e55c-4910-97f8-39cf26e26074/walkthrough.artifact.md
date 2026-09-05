# Sistema de Instalación Directa (PWA)

He implementado un sistema inteligente que detecta si el usuario está usando el navegador y le sugiere instalar la App del Bingo directamente en su pantalla de inicio para una mejor experiencia.

## Cambios Realizados

### 1. Detector de Instalación ([usePWAInstall.ts](file:///D:/bingo-pals/src/hooks/usePWAInstall.ts))
- He creado un "cerebro" central que escucha al navegador para saber cuándo el celular está listo para instalar la App.
- **Detección Automática:** Sabe si ya estás usando la App instalada (Modo Standalone) para no molestarte con avisos innecesarios.

### 2. Banner para Invitados ([unirse.$code.tsx](file:///D:/bingo-pals/src/routes/unirse.$code.tsx))
- **Primera Impresión:** Cuando un invitado abre tu link compartido, lo primero que verá es un elegante recuadro azul que le invita a "**Instalar la App**" para que el Bingo sea más rápido y ocupe menos espacio.
- **Acceso Directo:** Al pulsar "INSTALAR", el celular abrirá automáticamente el cuadro oficial de descarga.

### 3. Acceso en Pantalla Principal ([index.tsx](file:///D:/bingo-pals/src/routes/index.tsx))
- He añadido un icono de **Smartphone con movimiento** (animación bounce) en la parte superior derecha de la pantalla de inicio.
- Si el usuario no tiene la App instalada, este icono aparecerá para permitirle descargarla en cualquier momento.

## Cómo funciona para tus usuarios

1.  **Enlace de Invitación:** Tu invitado hace clic en el link de WhatsApp.
2.  **Sugerencia:** Se le muestra el aviso: *"Juega con la App instalada"*.
3.  **Instalación:** Pulsa "Instalar", acepta el cuadro del sistema y ¡listo! Ya tiene el icono de Bingo Pals en su escritorio como una App de la Play Store.

## Cómo activarlo

Ejecuta el push para que las mejoras suban a tu servidor:

```powershell
git add .
git commit -m "Mejora: Sistema de invitación a instalación de PWA"
git push origin main
```

> [!TIP]
> **Nota técnica:** Por seguridad de los navegadores (Chrome/Safari), el botón de instalar solo aparecerá después de unos segundos de navegación o después de que el usuario haga su primer clic en la pantalla. ¡Es automático y muy seguro! 🚀📲🎱✨🏁
