# Especificación: Preguntas (banco de preguntas)

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/encuestas_preguntas/preguntas/content.html` (ítem del grupo [`encuestas_preguntas`](../../section/encuestas_preguntas/seccion.json))
- **Acceso:** tarjeta "Preguntas" del [menú inicial](../../section/menu_inicial/content.html)
- **Roles:** **ADM** crea, edita y elimina (Req 3). **GES** solo consulta.
- **Datos:** base **"Encuestas"** de la sección Zhakyz → subsección Database (cmid 59498, d=114), definida en [`data/moodle/BASE_ENCUESTAS.json`](../../data/moodle/BASE_ENCUESTAS.json)
- **Estado:** **publicado** en Zhakyz → subsección "Encuestas y Preguntas" → Página (cmid 59506) el 2026-10-17, con el nombre anterior "Encuestas y Preguntas". El repo ya usa el título "Preguntas": falta republicar y renombrar la actividad.

## Qué hace

1. **Listado** de preguntas ordenado por `id`, con su tipo, rango de criticidad y cantidad de opciones. Tiene búsqueda y filtro por tipo.
2. **Resumen:** total de preguntas, cuántas tienen opciones, cuántas son de texto libre y cuántas tienen la **criticidad incompleta** (marcadas para revisar).
3. **Alta y edición** en un modal:
   - `id` automático (el mayor + 1) y de solo lectura.
   - Tipo: texto libre, número, selección única (también sirve para Verdadero / Falso) o selección múltiple.
   - Opciones dinámicas (agregar y quitar), cada una con su **criticidad de 0 (sin riesgo) a 10 (máximo riesgo)**.
   - **Vista del estudiante** en vivo: cómo se ve la pregunta con radios, casillas o campo de texto.
   - **Validaciones:** pregunta obligatoria; en los tipos con opciones, al menos 2 opciones, todas con criticidad entre 0 y 10 y sin repetidas.
4. **Eliminación** con confirmación.

## Cómo se guarda en la base

| Campo de la base | Contenido |
|---|---|
| `id` | Número de la pregunta |
| `pregunta` | Texto de la pregunta |
| `tipo` | `texto`, `numero`, `seleccion unica` o `seleccion multiple` |
| `respuestas` | Una opción por línea (se guarda separada con `<br>` porque el campo tiene editor HTML) |
| `criticidad` | Un número por línea, **alineado** con `respuestas` (línea 1 ↔ opción 1) |

Las preguntas de texto libre se guardan sin opciones ni criticidad.

**Tipo número:** el estudiante escribe un número, no elige opciones. En `respuestas` se guardan **rangos de criticidad** con el formato `desde-hasta`, uno por línea, y se ocultan al estudiante. Por ejemplo, `0-0`, `1-2` y `3-` (sin "hasta" significa "3 o más"). El editor los carga con los campos *Desde*, *hasta* y *criticidad*, y valida que no se superpongan y que solo el último quede sin tope. Los formatos anteriores (`0`, `3 o más`) se siguen leyendo.

## Conexión con Moodle (sin cambiar plantillas)

- **Lectura:** `GET mod/data/view.php?id=59498&perpage=1000`. Primero busca una plantilla propia (`.zk-registro` con atributos `data-*`); si no la hay, interpreta la **plantilla por defecto de Moodle** (`.defaulttemplate-listentry` → filas etiqueta / valor) y toma el `rid` del link de edición.
- **Alta y edición:** baja el formulario nativo `edit.php?d=114[&rid=…]` y ubica cada campo **por su etiqueta**. Las áreas de texto tienen nombres con un sufijo aleatorio (`field_565_xZx…`), así que no se pueden escribir con ids fijos. Fija `rid` (0 para alta) y envía con el `sesskey` del formulario.
- **Borrado:** `POST mod/data/view.php` con `d`, `delete=<rid>`, `confirm=1` y `sesskey`.
- Después de cada escritura **vuelve a leer** la base, así la pantalla siempre muestra lo que quedó en Moodle.

**Prueba de conexión:** se probó contra un Moodle simulado que usa el **HTML real** del formulario de la base Encuestas y la estructura real de la plantilla por defecto. Lectura, alta, edición y borrado funcionaron. La prueba encontró y corrigió un bug: la edición mandaba `rid=0`, lo que habría duplicado la pregunta.

En vista local (`file://` o `localhost`) usa **5 preguntas de ejemplo** y avisa que los cambios no se guardan.

## Pendientes

- Probar el alta real de una pregunta desde Moodle (hoy la base está vacía).
- **Encuesta a la que pertenece cada pregunta** (inicial o cuatrimestral). La base de LuminaTech que copiamos no lo distingue: decidir si se agrega un campo `encuesta` o se usan dos bases.
- **Períodos de la encuesta y alerta por omisión** (Req 2): va en otra pantalla o en otra etapa.
- **Detección del rol** en Moodle, por grupos.
- **Permisos en Moodle:** que GES solo pueda leer la base se garantiza con los permisos de la base, no con la interfaz.
