# Plan: Creación de Entorno de Laboratorio (Bingo Pals Lab)

Este plan establece un entorno de desarrollo aislado en la carpeta `D:/bingo-pals-lab` para desarrollar y probar la función de Chat de Voz sin poner en riesgo la versión de producción.

## User Review Required

> [!IMPORTANT]
> - **Proyecto Independiente:** Necesitarás crear un **nuevo proyecto en Supabase** (ej: "Bingo-Pals-Lab") para evitar mezclar datos.
> - **Configuración .env:** Tendrás que actualizar las claves de Supabase (`URL` y `ANON_KEY`) en el archivo `.env` de la carpeta de laboratorio.
> - **Cloudflare:** Si decides subirlo a la nube para probar con amigos, usaremos un nombre de worker diferente (ej: `bingo-pals-lab`).

## Pasos Propuestos

### 1. Duplicación Local
- Ejecutar un comando de copia recursiva para duplicar todos los archivos de `D:/bingo-pals` a `D:/bingo-pals-lab`, excluyendo carpetas pesadas como `node_modules` y `.git`.

### 2. Aislamiento de Configuración
- Limpiar el archivo `wrangler.toml` en el laboratorio para que apunte a un nuevo entorno.
- Resetear la vinculación de Supabase local (`supabase/.temp`) para que pida un nuevo `link`.

### 3. Preparación del Chat de Voz
- Una vez creado el laboratorio, reiniciaremos la implementación del chat de voz paso a paso, basándonos en los aprendizajes anteriores para evitar el error "Try again".

## Plan de Verificación

1.  Verificar que `D:/bingo-pals-lab` existe y tiene los archivos correctos.
2.  Instalar dependencias en la nueva carpeta.
3.  Vincular al nuevo Supabase de pruebas.
4.  Lanzar el proyecto localmente (`npm run dev`) y confirmar que funciona independientemente del original.
