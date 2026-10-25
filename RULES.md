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
8. **Los datos del entorno y los ids de Moodle viven en [`moodle.config.json`](moodle.config.json)** (campus, curso, sección Zhakyz, subsecciones, páginas y bases). Si cambia un id, se cambia ahí y se corre `node .skills/publicar-seccion/sincronizar_config.js`; nunca se edita el número a mano en una sección.

| Elemento en Moodle | Archivo en el repo |
|---|---|
| Resumen de la sección Zhakyz (logo, nombre, lema y script que quita el link de los títulos de subsección) | [`section/resumen_zhakyz/content.html`](section/resumen_zhakyz/content.html) + [`assets/LOGO_ZHAKYZ_ANIMADO.gif`](assets/LOGO_ZHAKYZ_ANIMADO.gif) |
| Subsección "Hub" (cmid 59510, sección 15706) → Área de texto y medios "Hub" (cmid 59511), visible sin entrar | [`section/menu_inicial/content.html`](section/menu_inicial/content.html) |
| Subsección "Encuestas y Preguntas" (cmid 59505, sección 15705) → Encuesta "Encuesta Inicial" (cmid 59710) | [`data/moodle/encuestas/ENCUESTA_INICIAL.xml`](data/moodle/encuestas/ENCUESTA_INICIAL.xml) (exportada el 2026-10-25). Su ítem "Área de texto y medios" (id 8254) es [`section/encuesta_inicial/content.html`](section/encuesta_inicial/content.html), una copia del cargador de Utils. Sus ítems 8772, 8771, 8770 y 8769 (uno al final de cada página; el 8769 depende de trabaja = Si) son [`section/copia_encuestas/content.html`](section/copia_encuestas/content.html), copias del cargador de tools. No editarlos desde el editor de Moodle, que muestra una versión sin el script y al guardar lo borra |
| Subsección "Encuestas y Preguntas" → Encuesta "Encuesta Cuatrimestral" (cmid 59712) | [`data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml`](data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml) (exportada el 2026-10-25). Sus ítems "Área de texto y medios" 8261 y 8270 son [`section/encuesta_cuatrimestral/creditos/content.html`](section/encuesta_cuatrimestral/creditos/content.html) y [`section/encuesta_cuatrimestral/materias/content.html`](section/encuesta_cuatrimestral/materias/content.html), copias del cargador de Utils. Su ítem 8773 (al final) es [`section/copia_encuestas/content.html`](section/copia_encuestas/content.html). No editarlos desde el editor de Moodle |
| Subsección "Utils" (cm 59931, sección 15749) → Página "Widgets" (cmid 59932) | [`section/utils/widgets/content.html`](section/utils/widgets/content.html) (grupo: [`seccion.json`](section/utils/seccion.json)) |
| Subsección "Utils" → Página "Tools" (cmid 59941) | [`section/utils/tools/content.html`](section/utils/tools/content.html) (grupo: [`seccion.json`](section/utils/seccion.json)) |
| Subsección "Hub" → Base de datos "Carga_Parciales_Primero" (cmid 59521, d=117) | [`data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json`](data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json) + [plantillas](data/moodle/plantillas/carga_parciales_primero/) |
| Subsección "Hub" → Base de datos "Carga_Materias_Primero" (cmid 59522, d=118) | [`data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json`](data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json) + [plantillas](data/moodle/plantillas/carga_materias_primero/) |
| Subsección "Plan de Estudios" (cmid 59719, sección 15721) → Página "Plan de Estudios" (cmid 59718) | [`section/plan_estudios/content.html`](section/plan_estudios/content.html) |
| Subsección "Hub" → Página "Listado_Criticidad_Primero" (cmid 59523) | [`section/listado_criticidad_primero/content.html`](section/listado_criticidad_primero/content.html) |
| Subsección "Database" (cmid 59497, sección 15700) → Base de datos "Materias" (cmid 59717, d=152) | [`data/moodle/BASE_MATERIAS.json`](data/moodle/BASE_MATERIAS.json) + [plantillas](data/moodle/plantillas/materias/) |
| Subsección "Database" → Base de datos "Respuestas" (cmid 59940, d=166) | [`data/moodle/BASE_RESPUESTAS.json`](data/moodle/BASE_RESPUESTAS.json) + [plantillas](data/moodle/plantillas/respuestas/) (lista e individual; la de añadir entrada es la de Moodle) |
| Subsección "Pruebas" (cmid 59499, sección 15701): BD_Prueba, Prueba_Cuestionario, Prueba_Encuesta, Prueba2, database testing | — (pruebas creadas por el equipo directamente en Moodle) |
| Encuesta "asdsad" (cmid 59541), en Zhakyz fuera de las subsecciones | — (parece una prueba creada directamente en Moodle) |

## Alcance

- **Solo el Plan 2024.** El Plan 2003 (el plan viejo) está fuera del alcance del proyecto. Las secciones, bases, encuestas, datos de prueba y modelos de cálculo trabajan solo con el Plan 2024.
- Lo que ya tiene datos del Plan 2003 (la base Materias, la página Plan de Estudios y el cuadro de créditos de la Encuesta Inicial) queda como está hasta que el equipo decida quitarlo: no se borra sin un pedido explícito.

## Arquitectura

- Todo el código de cada sección se entrega en un **único archivo `.html` autocontenido** (HTML + estilos inline + JS en un solo `<div>` raíz).
- **Sin archivos CSS, JS ni dependencias externas.** Todo vive dentro del `.html`.
- Solo se inyecta dinámicamente en `<head>` lo estrictamente necesario (ej. `@keyframes`).

## Estructura de Secciones

- `section/` tiene dos tipos de carpeta:
  - **Sección simple:** `section/<nombre>/content.html` (por ejemplo `menu_inicial`).
  - **Sección con ítems (grupo):** `section/<grupo>/<item>/content.html`, más un `section/<grupo>/seccion.json`. El grupo representa una **subsección de Moodle** dentro de Zhakyz, y cada ítem es una actividad (Página o Área de texto) de esa subsección.
    ```
    section/utils/
    ├── seccion.json            ← nombre del grupo y de sus ítems (los ids están en moodle.config.json)
    ├── widgets/content.html
    └── tools/content.html
    ```
- Nombres de carpeta en `snake_case`, sin tildes. Cada `content.html` (simple o ítem) sigue todas las reglas de esta guía.
- Los links locales entre secciones son relativos al archivo: desde un ítem, `../../<otra>/content.html`.

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

## Redacción

Vale para **todo texto visible** de la interfaz: títulos, subtítulos, botones, etiquetas, avisos, mensajes de error, ayudas y textos de las tablas. No aplica a los comentarios del código ni a la barra de vista previa local.

- **Registro formal.** Sin voseo ni tuteo ("Cargá", "Revisá", "te dice", "podés") y sin expresiones coloquiales ("acá", "frenar", "traer").
  - Acciones e instrucciones en **infinitivo**: "Seleccionar un archivo", "Descargar plantilla", "Verificar que las tildes se muestren correctamente".
  - Descripciones en forma **impersonal**: "Se valida cada fila", "Los datos no se guardan hasta confirmar la carga".
- **Sin metáforas ni giros.** Cada cosa se nombra por lo que es, con los términos del dominio (materia, plan, cuatrimestre, base, entrada vigente).
  - "Materias registradas", no "Lo que está cargado hoy".
  - "Errores y advertencias", no "Qué corregir".
  - "Las advertencias no impiden la carga", no "no frenan la carga".
- **Títulos como sustantivos o frases nominales:** "Formato del archivo", "Descripción de las columnas", "Revisión".
- **Verbos precisos:** "debe", no "tiene que"; "contiene" o "indica", no "lleva" o "dice".
- **Mensajes de error completos:** dónde está el problema (fila y campo), el valor recibido y lo que se esperaba. Por ejemplo: `Fila 5 · cuatrimestre: "11" debe ser un número de 1 a 10.`
- **Referencias explícitas:** nombrar el bloque o la sección ("en Materias registradas"), no "arriba", "abajo" ni "acá".

Referencia ya adaptada: `section/plan_estudios/content.html`. El resto de las secciones todavía usa voseo y se adapta cuando se modifique.

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
- **Constantes de configuración Moodle** (CMIDs, IDs de campo) como `var` al inicio del IIFE. Cada id que está en `moodle.config.json` se marca con `// @config <ruta>` al final de la línea (por ejemplo `var DATAID_MATERIAS = 152; // @config bases.materias.dataid`). `sincronizar_config.js` copia el valor y `publicar.js` no publica un archivo desactualizado.
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