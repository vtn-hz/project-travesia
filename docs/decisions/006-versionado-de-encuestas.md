# ADR-006: Versionado de las respuestas de las encuestas (vista del estudiante)

- **Estado:** Aceptada (2026-10-24): Encuesta de Moodle + copia de cada envío en la base Respuestas. Desarrollada en local, sin publicar
- **Fecha:** 2026-10-24
- **Refs:** [spec Copia de respuestas](../specs/copia-encuestas.md), [puntaje de criticidad](../models/MODELO_CRITICIDAD_ENCUESTAS.md), [DER v2 · módulo Cualitativo](../models/MODELO_DE_DATOS_V2.md#módulo-cualitativo), [modelo simplificado · base 8](../models/MODELO_SIMPLIFICADO_MOODLE.md#8-respuestas), [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json), [`ENCUESTA_INICIAL.xml`](../../data/moodle/encuestas/ENCUESTA_INICIAL.xml), [`ENCUESTA_CUATRIMESTRAL.xml`](../../data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml)

## Contexto

El estudiante responde la encuesta inicial y la cuatrimestral, y puede corregir sus respuestas. Los requerimientos piden conservar el historial de las encuestas a largo plazo, y el DER lo expresa así: un `Envio_Encuesta` completado no se modifica y `Encuesta.version` permite cambiar preguntas sin perder las respuestas viejas.

Hoy las dos encuestas son **Encuestas de Moodle** (`mod_feedback`) que armó el equipo: "Encuesta Inicial" (cmid 59710) y "Encuesta Cuatrimestral" (cmid 59712).

**Alcance:** solo el estudiante y el módulo Cualitativo del DER (`Encuesta`, `Pregunta`, `Envio_Encuesta`, `Respuesta`), y solo el Plan 2024 ([`RULES.md`](../../RULES.md) → *Alcance*). Se dejan afuera las alertas, las cursadas, los períodos y las tutorías.

## Qué se verificó

El código de Moodle se revisó en el Moodle local (4.4.2). La configuración y el HTML de las encuestas se leyeron del campus (5.0.2) en modo lectura.

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | Las dos encuestas ya tienen **nombres visibles y "Permitir múltiples envíos = Sí"**. Al volver a entrar, Moodle **precarga la última respuesta** | Configuración leída el 2026-10-24. `process_page()` llama a `create_completed_tmp_from_last_completed()` |
| 2 | Moodle **guarda solo la última respuesta**: al reenviar, borra los valores anteriores | Ayuda del campus: *"sólo quedará almacenada su última respuesta"*. En el código: `feedback_save_tmp_values()` |
| 3 | Un ítem "Área de texto y medios" **ejecuta su script** al responder. La "Página después de enviar" **no**: Moodle limpia ese texto | Ya funciona con el cuadro de créditos (ítem 8254). En el código, `page_after_submit()` usa `format_text` sin `noclean` |
| 4 | Cada pregunta se envía como `<tipo>_<id>`. Las opciones mandan su **número de orden**, no el texto | `item/multichoice/lib.php`: `['radio', $inputname, '', $label, $idx]` |
| 5 | Las obligatorias se validan en el navegador y en el servidor. **El rango de los numéricos, solo en el servidor** | `addRule(..., 'client')`. El rango, con `add_validation_rule` |
| 6 | Moodle muestra **"Página siguiente" aunque las páginas que siguen queden vacías por una dependencia, y en ese caso guarda al pasar de página**. Pasa en la Inicial si el estudiante no trabaja: la página 4 queda vacía | `complete_form.php`: `$hasnextpage = $gopage < count($pages) - 1`. `process_page()` llama a `save_response()` si no hay página siguiente |
| 7 | Un ítem dependiente **se muestra mientras no se respondió** el ítem del que depende. En la Cuatrimestral, "¿desde cuándo trabaja?" está en la misma página que "¿Trabaja?", así que se muestra siempre y es obligatoria | `get_pages()`: *"Items that are dependent on something that has not yet been answered are still present"* |
| 8 | La página conoce al usuario (`M.cfg.userId`) y su nombre de usuario es el **DNI**, que se lee en `/login/change_password.php` | Verificado en el campus con una cuenta del equipo. `M.cfg.userId` no existe en Moodle 4.4 |
| 9 | Una cuenta con rol Profesor **no puede responder** la encuesta: Moodle muestra un error. El HTML se tomó de la vista previa (`print.php`), que arma el mismo formulario | Lectura del 2026-10-24 |

## Opciones

| | A. Encuesta de Moodle sola | **B. Encuesta de Moodle + copia en una base** | C. Cuestionario | D. Página propia + base |
|---|---|---|---|---|
| Conserva cada edición | No: la pisa | **Sí**, salvo que el script falle (queda pendiente y se reintenta) | Sí: un intento por edición | Sí |
| Validación | Moodle | **Moodle** (servidor) en las preguntas nativas | Moodle | Solo el navegador |
| Interfaz y reportes de Moodle | Sí | **Sí** | Sí, pero de calificación | No |
| Fuentes de datos | 1 | **2** (Moodle: la última; la base: todas) | 1 | 1 |
| Preguntas por materia | No | Con un script, como el cuadro de créditos | No | Sí |

D llegó a desarrollarse en local y se descartó: **el equipo prefiere conservar la encuesta nativa y sus validaciones**.

## Decisión

**B: las Encuestas de Moodle quedan como están y un script copia cada envío a la base Respuestas**, que solo agrega entradas. El script está en [`section/copia_encuestas/content.html`](../../section/copia_encuestas/content.html) y va en un ítem "Área de texto y medios" en cada página de cada encuesta.

- **Cada envío es una entrada nueva** (`rid=0`). El script nunca edita ni borra. La versión vigente es la de `created_at` más reciente para el mismo `id_usuario`, `encuesta` y `periodo`.
- **Cuándo copia:** con "Enviar respuestas", o con "Página siguiente" cuando no quedan páginas con preguntas visibles (hallazgo 6).
  - Antes de copiar repite los controles de Moodle (obligatorias y rango). Si fallan, no copia y deja que Moodle muestre el error.
  - Después deja seguir el envío. La copia espera como mucho 8 segundos.
- **Respuestas de varias páginas:** cada página se guarda en el navegador al pasar a la siguiente. Si falta alguna, por ejemplo porque la encuesta se empezó en otra pestaña, se lee su HTML, que Moodle muestra con lo ya respondido.
- **Si la copia falla**, queda pendiente en el navegador y se reintenta al volver a abrir la encuesta. Antes de reintentar se verifica que no haya llegado (mismo `created_at`).
- **Criticidad:** cada respuesta lleva sus puntos y la entrada guarda el total en `puntaje_criticidad` ([modelo](../models/MODELO_CRITICIDAD_ENCUESTAS.md), valores provisorios). El estudiante no lo ve.
- **Privacidad:** la base va con "Requiere aprobación" y sin aprobar entradas.

### Del DER a Moodle

| DER | En la alternativa |
|---|---|
| `Estudiante` | Usuario de Moodle (`id_usuario` = `M.cfg.userId`, `dni` = nombre de usuario) |
| `Encuesta` | La Encuesta de Moodle (`encuesta` = `inicial` o `cuatrimestral`, `version_encuesta` en el script) |
| `Pregunta` | El ítem de la Encuesta, identificado por su etiqueta (`variable`) |
| `Envio_Encuesta` | Una entrada de la base Respuestas (inmutable) |
| `Respuesta` | Un elemento de `json_pregunta_respuesta` |

## Consecuencias

**A favor**
- Se conservan la validación del servidor, la precarga y los reportes de Moodle.
- El historial completo queda en la base, con la criticidad de cada versión.
- El equipo sigue editando las preguntas en Moodle.

**En contra**
- **Hay dos fuentes de datos.** Si el script no corre, la base no se entera y nadie recibe un aviso. Pasa si se cierra la pestaña durante la copia, si hay un error, o si se responde desde la **app móvil**, donde probablemente los scripts no corren (a verificar).
- **El script depende de la estructura de la encuesta.** Si el equipo agrega preguntas o saltos de página, hay que actualizar la lista del script. "Editar preguntas" y la vista previa avisan si la estructura de páginas no coincide.
- **No se pueden editar desde Moodle los ítems con script**, porque el editor borra el script al guardar. Ya pasa con el cuadro de créditos.
- **Lo que no es nativo no tiene validación de Moodle:** materias aprobadas por código (cuadro de créditos), preguntas por materia y puntaje de criticidad.
- **Un administrador puede borrar entradas:** hay que exportar la base a CSV al cierre de cada cuatrimestre.

**Pendientes antes de publicar:** ver la [spec](../specs/copia-encuestas.md#pendientes).
