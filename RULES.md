# Reglas de Desarrollo — Proyecto Travesía

## ⛔ Moodle: qué se puede modificar

Estas reglas están por encima de todas las demás.

1. **La única sección que se puede modificar es `Zhakyz`** (`course/section.php?id=15647`, curso `1732`).
2. **NUNCA se modifican otras secciones.** Las secciones, actividades, bases de datos, archivos y configuraciones de los demás equipos y del curso no se editan, borran, mueven ni se escriben: solo se leen. Si un cambio requiere tocar algo fuera de Zhakyz, no se hace.
3. **Todo cambio en Moodle requiere confirmación explícita** antes de ejecutarse, aunque sea dentro de Zhakyz. La confirmación vale solo para ese cambio puntual.
   - **"Desarrollar" siempre significa trabajar en local**, en este repo. Desarrollar una sección no incluye publicarla.
   - **Subir o publicar algo en Moodle requiere confirmación absoluta**: un pedido explícito de publicar ese elemento, en ese momento. No alcanza con un "desarrollalo", "armalo" o "dejalo listo".
4. **Relación 1 a 1 con el repositorio.** Cada elemento que publicamos en Moodle tiene su archivo fuente en este repo, y viceversa:
   - Lo que está en Moodle es una copia de lo que está en el repo, nunca al revés. Primero se cambia el repo y después se publica.
   - Cada archivo publicado indica en un comentario inicial **dónde vive en Moodle** (sección, actividad o campo, y su `id`).
   - Si algo se cambia directamente en Moodle, se trae al repo en el mismo momento.
5. **Datos de prueba = integrantes de Zhakyz.** Toda información de prueba usa a los 6 integrantes del equipo (ver `docs/context/EQUIPO_ZHAKYZ.md`) con datos académicos ficticios. No se inventan personas y no se usan datos de estudiantes reales.
6. **No se reutilizan bases de datos de otros equipos.** Nuestras actividades leen y escriben solo bases creadas en la sección Zhakyz.
7. Toda automatización (por ejemplo, Playwright) bloquea por defecto cualquier petición que no sea `GET` y cualquier URL con `sesskey`. Solo se habilita la escritura puntual que se confirmó, limitada a la sección 15647.

| Elemento en Moodle | Archivo en el repo |
|---|---|
| Resumen de la sección Zhakyz (logo, nombre y lema) | [`section/resumen_zhakyz/content.html`](section/resumen_zhakyz/content.html) + [`assets/LOGO_ZHAKYZ_ANIMADO.gif`](assets/LOGO_ZHAKYZ_ANIMADO.gif) |

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

Sistema de diseño oficial: **skill [`diseno-ui`](.skills/diseno-ui/SKILL.md)**, basada en la plantilla Dashboard de Material UI ([ADR-004](docs/decisions/004-sistema-de-diseno-mui.md)). Todos los valores están en [`.skills/diseno-ui/referencia/tokens.md`](.skills/diseno-ui/referencia/tokens.md) y la referencia visual en `.skills/diseno-ui/muestrario.html`.

- **100% inline** en atributos `style=""`, cada propiedad con `!important` (para vencer el CSS de Moodle). Las únicas excepciones son las propiedades que se animan.
- **Sin emojis** en la interfaz. Se usan íconos SVG inline de Material Icons Outlined (`.skills/diseno-ui/iconos.js`).
- **Paleta base:**

  | Rol | Color |
  |-----|-------|
  | Texto principal | `#0b0e14` |
  | Texto secundario | `#47536b` |
  | Bordes / divisores | `rgba(194, 201, 214, 0.4)`, `#dadee7` |
  | Fondo de contenedor | `#fcfcfc` |
  | Tarjetas | `#ffffff` |
  | Fondo de apoyo (encabezados de tabla, íconos) | `#f5f6fa` |
  | Acción principal | gradiente `#333c4d` → `#0b0e14` |
  | Acción de color / foco | `#026bd4` / `#027af2` |
  | Semáforo alto · medio · bajo · neutro | punto `#c20a0a` · `#c2940a` · `#52bc52` · `#94a0b8` (fondos y textos en los tokens) |

- **Estados:** siempre **punto + texto**, nunca solo color.
- **Border-radius:** 8px tarjetas, botones e inputs; 10px contenedor, alertas y modales; 999px chips.
- **Sombras:** ninguna en tarjetas (borde de 1px); la sombra base solo en elementos flotantes.
- **Botones:** 40px de alto y texto en minúscula (sin `text-transform`). Una sola acción principal por pantalla.
- **Font:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` (no se carga Inter desde afuera).
- **Tipografía:** título 24/600, subtítulo de bloque 18/600, título de tarjeta 16/600 o 14/500, texto 14/400 y ayudas 12/400.
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

- **Tarjeta:** fondo blanco, borde 1px, radio 8, ícono SVG en recuadro de 36px, chips de rol, título `<h4>`, descripción `<p>` y botón (principal oscuro u *outlined*). Fragmentos listos en la skill `diseno-ui`.
- **Modal:** overlay fixed con backdrop semi-opaco, contenedor centrado con header (título + botón ✕), body con form, footer con Cancelar + Submit.
- **Loader:** overlay absoluto dentro del contenedor principal, spinner CSS con `border-top` coloreado, texto descriptivo.
- **Fila dinámica:** patrón de inputs flex con botón eliminar (`🗑️`), creación vía `document.createElement`.
- **Pie Zhakyz (obligatorio):** toda sección termina con el bloque `<!-- PIE DE PÁGINA ZHAKYZ -->` (`id="footer-zhakyz"`) dentro del contenedor principal, después del contenido y antes de los modales o el script. A la izquierda va "Zhakyz & Asociados" (sin emoji, en mayúsculas) y a la derecha "Proyecto Travesía · SBIRE · Dpto. de Ingeniería Industrial — FI-UNMdP". La única excepción es `resumen_zhakyz`, que ya es la presentación del equipo.