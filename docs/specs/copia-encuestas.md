# Especificación: Copia de respuestas de las encuestas

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** [`section/copia_encuestas/content.html`](../../section/copia_encuestas/content.html)
- **Dónde va en Moodle:** un ítem "Área de texto y medios" con este archivo **en cada página** de cada encuesta (ver [Publicación](#publicación)):
  - Encuesta Inicial (cmid 59710): 4 páginas, 4 ítems;
  - Encuesta Cuatrimestral (cmid 59712): 1 página, 1 ítem.
- **Rol:** EST (corre mientras el estudiante responde). En "Editar preguntas" y en la vista previa solo muestra un aviso para el equipo.
- **Decisión:** [ADR-006](../decisions/006-versionado-de-encuestas.md).
- **Estado:** desarrollado y probado en local, adaptado a los widgets de [Utils](../../section/utils/README.md) que se publicaron el 2026-10-25. **No publicado.** Hace falta crear antes la base Respuestas.
- **Última actualización:** 2026-10-25

## Qué hace

La Encuesta de Moodle valida, guarda y precarga como siempre, pero guarda solo la última respuesta. Este script agrega **cada envío** como una versión nueva en la base Respuestas, con su puntaje de criticidad.

1. **Al pasar de página**, guarda en el navegador (`sessionStorage`) lo respondido en esa página. Si en la página está el cuadro de créditos, guarda también el plan elegido y las casillas marcadas.
2. **Al hacer el envío final:**
   - repite los controles de Moodle (obligatorias y rango de los numéricos). Si algo falla, no copia y deja que Moodle muestre el error;
   - arma el registro con todas las páginas. Si falta alguna, lee su HTML con `fetch` (Moodle la muestra con lo ya respondido);
   - convierte el JSON del selector de materias en una entrada por materia;
   - calcula la criticidad y agrega la entrada a la base Respuestas (`rid=0`);
   - deja seguir el envío a Moodle. La copia espera como mucho 8 segundos.
3. **Si la copia falla**, la respuesta igual se guarda en Moodle:
   - el registro queda pendiente en el navegador (`localStorage`) y se reintenta la próxima vez que se abre la encuesta;
   - antes de reintentar, se verifica que no haya llegado (mismo `created_at`);
   - el estudiante ve un aviso.
4. **Si un widget frena el envío**, la copia tampoco copia. Pasa, por ejemplo, con el selector cuando falta responder una materia.

### Cuándo es el envío final

| Botón | Envío final |
|---|---|
| Enviar respuestas | Siempre |
| Página siguiente | Solo si **no queda ninguna página con preguntas visibles**. Moodle muestra este botón aunque las páginas que siguen queden vacías por una dependencia, y en ese caso guarda sin pasar por "Enviar respuestas" (en la Inicial, si el estudiante no trabaja) |
| Página anterior y Cancelar | Nunca |

Para saberlo, el script tiene la lista de ítems de cada página (`paginas` en `ENCUESTAS`) y las dependencias. Si la página actual no coincide con esa lista, no adivina: solo copia con "Enviar respuestas". Los ítems de copia no cuentan en esa lista.

## Ítems y variables

Copiados de [`ENCUESTA_INICIAL.xml`](../../data/moodle/encuestas/ENCUESTA_INICIAL.xml) y [`ENCUESTA_CUATRIMESTRAL.xml`](../../data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml). La variable es la etiqueta del ítem en Moodle. Si un ítem no tiene etiqueta, la define el script.

| Encuesta | Página | Ítem | Variable | Criticidad |
|---|---|---|---|---|
| Inicial (versión 1) | 1 | 8254 (cuadro de créditos) | `plan`, `materias_aprobadas` | — |
| | 1 | 8253 | `creditos_aprobados` | Avance curricular (máx. 70) |
| | 2 | 8257 | `año_cohorte` | — (se usa para el avance) |
| | 2 | 8258 | `cuatri_cohorte` | — (se usa para el avance) |
| | 3 | 8259 | `trabaja` | Sí → 10 |
| | 4 | 8260 (depende de `trabaja` = Si) | `inicio_laboral` | 20 |
| Cuatrimestral (versión 2) | 1 | 8261 (cuadro de créditos) | `plan`, `materias_aprobadas` | — |
| | 1 | 8262 | `creditos_aprobados` | Avance curricular (máx. 30). El ingreso sale de la Encuesta inicial vigente en la base |
| | 1 | 8264 | `progreso_proyecto_final` | 0 · 10 · 7 · 3 · 0 |
| | 1 | 8265 | `trabaja` | Sí → 5 |
| | 1 | 8266 (depende de `trabaja` = Si) | `inicio_laboral` | 10 · 10 · 10 · 7 · 7 · 4 · 4 |
| | 1 | 8270 (selector de materias) → 8768 | `materias_cursadas`, `primera_vez` y `dificultad` por materia | Bloque de cursada (máx. 35) |
| | 1 | 8273 | — | Se ignora: es la respuesta corta anterior al selector y se va a borrar |
| | 1 | 8271 | `avance_percibido` | 0 · 5 · 10 |

- **Puntos:** van por número de opción, en el orden de Moodle. Los valores son los provisorios de [`MODELO_CRITICIDAD_ENCUESTAS.md`](../models/MODELO_CRITICIDAD_ENCUESTAS.md).
- **Bloque de cursada:** sale del JSON que el selector escribe en la 8768.
  - Cantidad: ninguna (inactividad) 35, salvo con el PFG en desarrollo o finalizado; 1 materia 10; 2 materias 5; 3 o más 0.
  - Recursado: 8 por la primera materia recursada y 7 por la segunda.
  - Dificultad: (promedio − 1) × 2,5.
- **Si el selector no se pudo cargar** y el estudiante escribió las materias a mano, se guarda el texto sin puntos.
- **Ítems que no están en la lista:** se copian igual como `pregunta_<id>`, sin puntos.
- **Si cambian las preguntas en Moodle:** actualizar la lista y subir la `version` de esa encuesta.

## Registro (base "Respuestas")

Definida en [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json) (propuesta, sin crear), con sus [plantillas](../../data/moodle/plantillas/respuestas/). Ejemplo de la Cuatrimestral, sacado de la prueba con los widgets reales:

```json
{
  "id_usuario": 2048,
  "dni": "00000006",
  "encuesta": "cuatrimestral",
  "version_encuesta": 2,
  "periodo": "2026-2",
  "json_pregunta_respuesta": [
    { "variable": "plan", "pregunta": "Plan de estudios (cuadro de créditos)", "respuesta": "2024", "criticidad": null },
    { "variable": "materias_aprobadas", "pregunta": "Materias aprobadas (cuadro de créditos)", "respuesta": ["ING1103", "INGM101", "INGM105"], "criticidad": null },
    { "variable": "creditos_aprobados", "pregunta": "Los créditos obtenidos actualmente son:", "respuesta": 14, "criticidad": 0 },
    { "variable": "progreso_proyecto_final", "pregunta": "¿En qué estado se encuentra tu Proyecto Final de Grado (PFG)?", "respuesta": "No iniciado", "criticidad": 10 },
    { "variable": "trabaja", "pregunta": "¿Trabaja actualmente?", "respuesta": "Si", "criticidad": 5 },
    { "variable": "inicio_laboral", "pregunta": "¿En qué momento de la carrera comenzaste tu actividad laboral?", "respuesta": "Comencé en 2.º año", "criticidad": 10 },
    { "variable": "materias_cursadas", "pregunta": "¿Qué materias cursaste el anterior cuatrimestre?", "respuesta": ["INGM102", "INGF101"], "criticidad": 5 },
    { "variable": "primera_vez", "pregunta": "¿Es la primera vez que la cursaste?", "materia": "INGM102", "respuesta": "No", "criticidad": 8 },
    { "variable": "primera_vez", "pregunta": "¿Es la primera vez que la cursaste?", "materia": "INGF101", "respuesta": "Sí", "criticidad": 0 },
    { "variable": "dificultad", "pregunta": "¿Qué tan difícil te resultó? (1 más fácil, 5 más difícil)", "materia": "INGM102", "respuesta": 4, "criticidad": 3.8 },
    { "variable": "dificultad", "pregunta": "¿Qué tan difícil te resultó? (1 más fácil, 5 más difícil)", "materia": "INGF101", "respuesta": 2, "criticidad": 1.3 },
    { "variable": "avance_percibido", "pregunta": "Considerando el año en que ingresaste a la carrera, ¿cómo defines tu situación actual de avance en el cursado?", "respuesta": "Demorado (retraso mayor al 50% de porcentaje esperado de materias aprobadas hasta ese año)", "criticidad": 5 }
  ],
  "puntaje_criticidad": 48,
  "created_at": "2026-10-25T00:40:00-03:00"
}
```

- **`respuesta`:** el texto de la opción tal como está en Moodle; los números van como número; las materias, como lista de códigos.
- **`pregunta`:** el texto de la pregunta tal como la vio el estudiante.
- **`materia`:** solo en las preguntas por materia.
- **Preguntas dependientes:** si no corresponden, no se guardan. Por ejemplo, `inicio_laboral` cuando no trabaja, aunque la Cuatrimestral la pida igual.

## Datos en Moodle

| Dato | De dónde sale |
|---|---|
| Encuesta | Campo oculto `id` del formulario (cmid) |
| Página actual | Campo oculto `gopage` |
| Respuestas | Campos `numeric_<id>`, `multichoice_<id>` (número de opción), `textfield_<id>` y `textarea_<id>`. El texto de la opción sale de su etiqueta |
| Enunciado, obligatoria y rango | Etiqueta del ítem (`#id_<tipo>_<id>_label` o `#fgroup_id_group_<tipo>_<id>_label`), con `.boundaries` y la marca "Campo obligatorio" |
| Plan y materias aprobadas | Widget `CuadroCreditos` (`.zk-cuadro-creditos`): botón de plan activo y casillas `data-codigo-creditos` marcadas. Incluye la PPS |
| Materias cursadas | JSON del widget `SelectorMaterias` en `textarea_8768`: `{ plan, ninguna, materias: [{ codigo, nombre, primera_vez, dificultad }] }` |
| Usuario y DNI | `M.cfg.userId` y `/login/change_password.php` → `[data-name="username"]` |
| Ingreso (cuatrimestral) | La Encuesta inicial más reciente del estudiante en la base Respuestas |

## Publicación

Cada paso requiere confirmación explícita (`RULES.md`, regla 3):

1. **Crear la base Respuestas** con `crear_base.js --confirmar`. La simulación del 2026-10-25 quedó bien: subsección Database, 8 campos, sin escribir nada. El script anota `bases.respuestas` en `moodle.config.json` y lo copia a esta sección.
2. **Configurar la base** en Moodle:
   - "Requiere aprobación" = Sí, sin aprobar entradas;
   - edición de entradas aprobadas = No;
   - sin comentarios;
   - sin máximo de entradas.

   El campus **no permite "disponible pero no mostrada"** (solo mostrar u ocultar), y si se oculta, los estudiantes no pueden escribir en ella. Por eso la base queda visible dentro de Zhakyz, y con la aprobación cada estudiante ve solo sus entradas.
3. **Cargar las plantillas** de `data/moodle/plantillas/respuestas/`. No hay un script para esto: se cargan a mano o con uno nuevo. Sin la plantilla de lista, la copia guarda igual, pero no puede leer el ingreso (avance de la Cuatrimestral) ni evitar duplicar copias pendientes.
4. **Agregar los ítems de copia**, cada uno con este archivo:
   - **Inicial:** uno al final de cada una de las 4 páginas. El de la página 4 tiene que **depender de `trabaja` = Si**, igual que la 8260. Si no, la página 4 nunca queda vacía y el estudiante que no trabaja ve una página en blanco.
   - **Cuatrimestral:** uno al final de la página.

   El editor de ítems de Moodle borra los scripts: hay que guardarlos con un POST directo al formulario del ítem, como el cuadro de créditos. Los ids nuevos no hace falta cargarlos en el script.
5. **Probar un envío.** Con la cuenta del equipo (rol Profesor), la encuesta no se puede responder. Hay dos caminos:
   - una cuenta con rol Estudiante (Nicolás Zuviria es el único del equipo);
   - **"Cambiar rol a… Estudiante"** con la cuenta del equipo. Moodle no guarda la respuesta cuando el rol está cambiado (`feedback_check_is_switchrole()`), pero la copia sí se agrega a la base. Sirve para probar la copia sin ensuciar las respuestas de la encuesta.

**Alternativa a evaluar:** en lugar de 5 copias del script en los ítems, sumarlo a la biblioteca de Utils como un widget más y usar el cargador. Así un cambio se publica una sola vez. Depende de que los estudiantes puedan abrir la Página Widgets.

## Vista previa local

Al abrir el archivo en local aparece un **simulador de la Encuesta de Moodle**:
- usa el mismo HTML que genera el campus y la misma navegación: valida obligatorias y rango al cambiar de página, y "Página siguiente" aparece aunque las páginas que siguen queden vacías;
- tiene un cuadro de créditos simplificado y, en la Cuatrimestral, el JSON del selector en un campo editable;
- usa el usuario de prueba Nicolás Zuviria, con DNI ficticio;
- muestra los registros que se copiarían, con su puntaje. Si Moodle guardara sin que la copia lo tomara, avisa.

## Pruebas hechas

**Con los widgets reales (2026-10-25).** Se usaron la vista previa de las dos encuestas, la Página Widgets y la base Materias del campus, descargadas en modo lectura y servidas sin conexión, con la base Respuestas simulada:

| Caso | Resultado |
|---|---|
| Inicial con el `CuadroCreditos` real (53 casillas) | El widget calcula 10 créditos. La copia guarda plan y materias, y Moodle recibe "Enviar respuestas" (65) |
| Cuatrimestral con respuestas por materia incompletas | El selector frena el envío: no hay copia ni envío |
| Cuatrimestral completa (2 materias, 1 recursada) | Moodle recibe `textarea_8768` y la base, el registro de arriba (48) |
| Cuatrimestral con "No cursé materias" | Inactividad: 35. Total 58 |
| Vista previa con dos ítems de copia | Un solo aviso; la estructura coincide |

**Con el HTML anterior a los widgets y con el simulador local (2026-10-24):**
- envío con "Página siguiente" cuando el estudiante no trabaja;
- páginas leídas con `fetch` cuando faltan en la pestaña;
- obligatoria vacía: sin copia;
- simulador a 1000 y 400 px, sin errores.

## Pendientes

1. **Publicar**, con los pasos de [Publicación](#publicación). Cada paso requiere confirmación.
2. **Probar un envío real**, con una cuenta de estudiante o con "Cambiar rol a… Estudiante".
3. **App móvil:** verificar si los estudiantes la usan. Si responden desde la app, probablemente el script no corre y no hay copia.
4. **Encuesta Cuatrimestral (para el equipo):**
   - borrar el ítem 8273;
   - `inicio_laboral` depende de `trabaja`, pero están en la misma página, así que Moodle la muestra y la pide siempre. Hace falta un salto de página entre las dos.
5. **Cuadro de créditos:** todavía ofrece el Plan 2003, que quedó fuera del alcance. Si el estudiante lo elige, el avance no se puntúa. Además, al volver a su página el cuadro empieza vacío (ver `section/utils/README.md`).
6. **Control para el equipo:** comparar la última respuesta de Moodle con la última versión de la base, para detectar copias que no llegaron.
7. **`avance_percibido`:** "Demorado" y "Muy demorado" tienen el mismo umbral (50 %) en Moodle.
8. **Período:** `PERIODO_ACTUAL` está fijo en el script (`2026-2`). Hay que cambiarlo cada cuatrimestre o definir la ventana del período.
