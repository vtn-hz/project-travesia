# Reglas de Desarrollo — Proyecto Travesía

## Arquitectura

- Todo el código de cada sección se entrega en un **único archivo `.html` autocontenido** (HTML + estilos inline + JS en un solo `<div>` raíz).
- **Sin archivos CSS, JS ni dependencias externas.** Todo vive dentro del `.html`.
- Solo se inyecta dinámicamente en `<head>` lo estrictamente necesario (ej. `@keyframes`).

## Estructura de Secciones

- El HTML se organiza en bloques delimitados por **comentarios de sección en mayúsculas**:
  ```html
  <!-- CONTENEDOR PRINCIPAL -->
  <!-- PANTALLA DE CARGA (OVERLAY CON RUEDITA) -->
  <!-- ENCABEZADO -->
  <!-- GRILLA DE TARJETAS -->
  <!-- TARJETA 1: NOMBRE -->
  <!-- MODAL: FORMULARIO DE NOMBRE -->
  <!-- SCRIPT DE MANEJO DE EVENTOS -->
  ```
- En JS, las secciones se demarcan con:
  ```js
  // ---------------------------------------------------------
  // NOMBRE DE LA SECCIÓN EN MAYÚSCULAS
  // ---------------------------------------------------------
  ```
  y comentarios simples `// DESCRIPCIÓN BREVE` para funciones individuales.

## Estilos

- **100% inline** en atributos `style=""`, cada propiedad con `!important` (para vencer el CSS de Moodle).
- **Paleta Tailwind (hex manual):**

  | Rol | Color |
  |-----|-------|
  | Primario (sky) | `#0284c7` |
  | Teal | `#0d9488` |
  | Purple | `#7e22ce` |
  | Verde éxito | `#16a34a` |
  | Gris bloqueado | `#94a3b8` |
  | Fondos | `#ffffff`, `#f8fafc`, `#f1f5f9` |
  | Bordes | `#e2e8f0`, `#cbd5e1` |
  | Texto principal | `#0f172a`, `#1e293b` |
  | Texto secundario | `#64748b`, `#475569` |
  | Rojo destructivo | `#ef4444` |

- **Border-radius:** 16px contenedor, 14px tarjetas, 12px iconos, 8px inputs/botones, 6px badges, 20px pill-badges.
- **Font:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- **Max-width contenedor:** `850px`, centrado con `margin: 20px auto`.

## Naming (IDs)

- Patrón: `{tipo}-{seccion}[-{variante}]`
  - Contenedores/modales: `modal-form-inicial`, `card-encuesta-cuatri`
  - Botones: `btn-submit-inicial`, `btn-close-notas`, `btn-agregar-materia`
  - Badges: `badge-encuesta-inicial`, `badge-cargar-notas`
  - Campos: `campo-mail-encuestado`, `campo-ano-ingreso`
  - Loader: `loader-travesia`
- Idioma de IDs: **español** (sin tildes).

## JavaScript

- Todo dentro de un **IIFE** `(function() { ... })()` — sin contaminación global.
- **Constantes de configuración Moodle** (CMIDs, IDs de campo) como `var` al inicio del IIFE.
- **Delegación de eventos**: un solo listener `click` en `document` con `e.target.closest()`, un solo listener `submit`.
- **Vanilla JS puro** — sin jQuery, sin frameworks, sin librerías externas.
- **Async/await** para operaciones con `fetch`.
- **Escritura a Moodle:** `POST` a `/mod/data/edit.php` con `FormData` (sesskey, field_{ID}, rid=0 para nuevo).
- **Lectura de Moodle:** `GET` a `/mod/data/view.php`, parseo con `DOMParser`, detección de registros existentes vía selectores de links de edición/perfil.
- **Loader overlay:** se muestra al cargar, se oculta con `ocultarCargando()` al finalizar las verificaciones iniciales.

## Componentes UI reutilizables

- **Tarjeta:** flex container con icono emoji, badge de estado, título `<h4>`, descripción `<p>`, botón CTA de color.
- **Modal:** overlay fixed con backdrop semi-opaco, contenedor centrado con header (título + botón ✕), body con form, footer con Cancelar + Submit.
- **Loader:** overlay absoluto dentro del contenedor principal, spinner CSS con `border-top` coloreado, texto descriptivo.
- **Fila dinámica:** patrón de inputs flex con botón eliminar (`🗑️`), creación vía `document.createElement`.