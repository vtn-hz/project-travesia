# ADR-007: Bases Encuestas, Respuestas y Criticidad

- **Estado:** Aceptada y **publicada** (2026-11-01): bases Encuestas (cmid 60190, d=198) y Criticidad (cmid 60191, d=199), Respuestas con los campos nuevos, Página Tools v4, los 5 ítems de copia y las plantillas de Carga_Parciales_Primero
- **Fecha:** 2026-11-01
- **Refs:** [ADR-005](005-modelo-de-bases-moodle.md), [ADR-006](006-versionado-de-encuestas.md), [modelo simplificado · bases 7, 8 y 9](../models/datos/MODELO_SIMPLIFICADO_MOODLE.md#7-encuestas), [`BASE_ENCUESTAS.json`](../../data/moodle/BASE_ENCUESTAS.json), [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json), [`BASE_CRITICIDAD.json`](../../data/moodle/BASE_CRITICIDAD.json), [`DEFINICIONES_ENCUESTAS.json`](../../data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json), [spec Copia de respuestas](../specs/copia-encuestas.md), [puntaje de las encuestas](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md), [índice de las notas de 1.er año](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md)

## Contexto

Con el ADR-006, cada envío de una encuesta se copia a la base Respuestas. Al revisar Moodle en modo lectura (2026-11-01: las dos encuestas, sus envíos y las 4 entradas de Respuestas) aparecieron estos problemas:

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **La definición de cada encuesta está fija en el código** de la Página Tools: ítems, páginas, dependencias y puntos (`ENCUESTAS`, `PUNTOS_INICIAL`, `PUNTOS_CUATRIMESTRAL`). Cambiar un puntaje exige publicar Tools, y el ADM no puede configurar la criticidad de cada opción, que es lo que pide el *Módulo de Preguntas* | Requerimientos, módulo 3: "Opción(es) de la respuesta (título respuesta, valor de respuesta (criticidad))" |
| 2 | **La versión no garantiza el formato:** la entrada del 25/10 no tiene `opcion` y las del 27/10 sí, y todas dicen `version_encuesta = 2` | Base Respuestas (d=166) |
| 3 | **La estructura quedó desactualizada:** el equipo agregó 4 saltos de página a la Cuatrimestral y el script sigue suponiendo una sola página | `DEPLOY.md`, exportación del 2026-10-31 |
| 4 | **Cada respuesta repite el texto de su pregunta:** la última Cuatrimestral repite 18 veces "dificultad" y otras 18 "primera vez" (unos 7 KB por envío) | Base Respuestas |
| 5 | **El estudiante ve sus puntos de riesgo:** con "Requiere aprobación" ve sus propias entradas, y el JSON tiene la `criticidad` de cada respuesta. El modelo dice que no la ve | Plantilla de lista de Respuestas |
| 6 | **No hay historial de criticidad:** el Dashboard y el Listado de 1.er año la calculan al abrirse y no la guardan, y la de las encuestas queda dentro de Respuestas | Páginas 60035 y 59523 |
| 7 | **Cambio de requerimientos (2026-11-01):** cada estudiante carga sus propias notas, así que todo estudiante tiene cuenta y escribe tanto sus respuestas como sus notas | Pedido del equipo |

## Decisión

Tres bases, todas en la subsección Database, que **solo agregan entradas**:

| Base | Una entrada por… | Campos | Quién escribe |
|---|---|---|---|
| **Encuestas** | encuesta y versión | `codigo_encuesta`, `version`, `json_preguntas`, `por_periodo`, `puntaje_maximo`, `created_at` | El equipo (ADM) |
| **Respuestas** | envío | `id_usuario`, `dni`, `codigo_encuesta`, `version`, `periodo`, `json_respuesta`, `created_at` | El navegador del estudiante (copia de la encuesta) |
| **Criticidad** | evento | `id_usuario`, `dni`, `periodo`, `origen`, `fuente`, `rid_fuente`, `indice`, `indice_total`, `semaforo`, `motivo`, `created_at` | El navegador del estudiante (encuestas y notas) y el equipo (asignaciones y recálculos) |

### Encuestas

- **`json_preguntas`:** un elemento por ítem de Moodle, con `variable`, `item_id`, `pagina`, `tipo`, `pregunta`, `obligatoria`, `rango`, `formato`, `opciones` (con la `criticidad` de cada opción), `criticidad_max` y `regla`.
- **`item_id` es obligatorio:** en Moodle, `inicio_laboral` y `avance_percibido` no tienen etiqueta, así que solo se pueden ubicar por su id.
- **Las dependencias entre preguntas no van acá.** Las define la Encuesta de Moodle y el script de copia conserva solo la regla que necesita (`inicio_laboral` cuenta si `trabaja` = Si).
- **La vigente es la de mayor `version`.** Cambiar un texto, un salto de página o un puntaje es cargar una versión nueva.
- **Se descartaron** `vigente_desde`, `cmid`, `tramo_destino`, `dias_plazo` y `motivo`. El cmid de cada encuesta queda en `moodle.config.json`.

### Respuestas

- **`json_respuesta`:** `[{ item_id, respuestas: [...] }]`, solo lo que respondió el estudiante. Opción múltiple: el número de opción. Numéricos: el número. Cuadro de créditos: `{ plan, materias }`. Selector de materias: `{ materia, primera_vez, dificultad }`.
- **Sin criticidad:** la criticidad pasa a la base Criticidad. Así se resuelven los hallazgos 4 y 5.
- **Las entradas anteriores no se migran.** La Inicial versión 1 y la Cuatrimestral versión 2 tienen el formato anterior (texto de la pregunta y criticidad adentro) y se reconocen por la versión.

### Criticidad

- **Cada evento agrega una entrada:**
  - `respuestas`: el envío de una encuesta;
  - `notas_1ro`: el alta o la edición de una nota en Carga_Parciales_Primero;
  - `materias`: un cambio de umbral o de materia crítica en Carga_Materias_Primero;
  - `omision`: el estudiante no respondió la encuesta del período;
  - `origen = manual`: un tutor asigna un estado (Req 10).
- **`rid_fuente` es el "por qué":** el `rid` de la entrada que disparó el cálculo. Es la única referencia: no se copian los valores usados. Va vacío en `omision` y en las manuales.
- **`indice_total`:** el promedio del último índice de cada grupo de fuentes del estudiante en el período, contando la entrada nueva. Los grupos son *notas* (`notas_1ro` y `materias`) y *encuestas* (`respuestas` y `omision`). Se guarda porque el estudiante escribe las dos fuentes principales, así que su navegador puede leer sus propias entradas.
- **`semaforo`:** en las automáticas, el del `indice_total` (0–39 verde, 40–69 amarillo, 70–100 rojo). En las manuales, el estado asignado; `sin_asignar` quita una asignación anterior.
- **La asignación manual persiste:** vale la última manual del estudiante, de cualquier período, mientras no sea `sin_asignar`. `periodo` dice cuándo se asignó, pero no limita su vigencia.
- **El tablero muestra las dos cosas, sin que una reemplace a la otra:** el calculado (`indice_total` de la última automática del período) y el asignado (la última manual). Las automáticas se siguen guardando mientras haya un estado asignado.
- **`motivo` es opcional,** salvo en las manuales.
- **`id_usuario` siempre está:** todo estudiante tiene cuenta (hallazgo 7).

### Índice de cada fuente

- **Encuestas:** puntos ÷ `puntaje_maximo` de la versión × 100. Con el avance curricular desactivado, el máximo es 30 en la Inicial y 70 en la Cuatrimestral. Al llevarlo a 0–100, los cortes del semáforo valen igual para las dos ([modelo](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md)).
- **Notas de 1.er año:** la fórmula ICm/ICG que el equipo puso en el Dashboard de 1.er año, ahora documentada ([modelo](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md)).

## Opciones consideradas

| | A. Como está (ADR-006) | **B. Tres bases** | C. Criticidad calculada al leer, sin base |
|---|---|---|---|
| Configurar puntos sin publicar código | No | **Sí** (versión nueva en Encuestas) | Sí, si se suma Encuestas |
| Historial de la criticidad | Solo el de las encuestas, dentro de Respuestas | **Sí, por evento** | Se recalcula: cambia el pasado si cambian las notas o la fórmula |
| El estudiante ve sus puntos | Sí, en el JSON | Sí, en sus entradas de Criticidad (mismo límite) | No |
| Lecturas al abrir el tablero | — | Una base (Criticidad), filtrada por período | Todas las bases, de todos los estudiantes |

Se elige **B**. Con C se perdería el historial ("el historial se guarda, no se recalcula", ADR-005).

## Consecuencias

**A favor**
- Los puntos y la estructura de cada encuesta se cambian cargando una versión, sin tocar código.
- Respuestas guarda solo lo respondido y baja de unos 7 KB a menos de 1 KB por envío.
- Hay historial de la criticidad por estudiante, con la entrada que la disparó.
- El tablero lee una sola base para pintar el semáforo.

**En contra**
- **El estudiante ve sus propias entradas de Criticidad,** con su índice. Su navegador tiene que escribirlas y leerlas para calcular `indice_total`, así que la base va con "Requiere aprobación". Es el mismo límite que antes tenía Respuestas.
- **Envío más lento:** al enviar, la copia guarda la respuesta (hasta 8 s) y después la entrada de Criticidad (hasta 4 s). Si la segunda falla, queda pendiente y se reintenta.
- **Lo que escribe el equipo no lo ve el estudiante.** Las entradas de `materias` y `omision` no entran en el `indice_total` que calcula el navegador del estudiante. Para las notas, el navegador del estudiante recalcula su índice con los umbrales actuales cada vez que guarda una nota, así que un cambio de umbral se refleja en su próxima carga.
- **`rid_fuente` de una nota apunta a una entrada que se puede editar.** Si alguien corrige una nota, la entrada vieja de Criticidad conserva su índice, pero la nota ya muestra el valor nuevo. Es el costo de no copiar los valores.
- **La importación por CSV de Moodle no crea entradas de Criticidad,** porque `import.php` no carga la plantilla JS. Si se usa, hace falta un recálculo.
- **Borrar una nota no agrega una entrada** (pendiente).
- **Volumen:** cada nota guardada agrega una entrada. Con unos 300 estudiantes son entre 3.000 y 4.500 por cuatrimestre. El tablero tiene que leer solo el período actual, más las manuales.

## Publicación y pendientes

Publicado el 2026-11-01, en este orden y con cada paso releído:
- **Bases nuevas:** Encuestas y Criticidad creadas con `crear_base.js`. Criticidad configurada como Respuestas: requiere aprobación, sin edición de las aprobadas, sin comentarios y sin máximo. Las dos tienen sus plantillas, y Encuestas, sus dos entradas (rid 20148 y 20149).
- **Respuestas:** se borraron sus 4 entradas con el formato anterior, que eran pruebas del equipo y quedaron respaldadas fuera del repo porque tienen DNI reales. Después se recrearon los campos y se cargaron las plantillas.
- **Carga_Parciales_Primero:** plantilla de lista con `data-rid` y plantilla JS.
- **Página Tools v4 y los 5 ítems de copia.** En la vista previa de las dos encuestas, el aviso dice que la estructura coincide con la versión vigente (Inicial 2, Cuatrimestral 3).

Quedan:

1. **Configurar Carga_Parciales_Primero para que escriban los estudiantes** ("Requiere aprobación"). No se cambió: la base es del equipo y hoy la carga el equipo.
2. **Probar un envío real** con una cuenta de estudiante (la del equipo tiene rol Profesor y no puede responder), y una nota cargada por un estudiante.
3. **Escritura del equipo:** asignaciones manuales (tablero o detalle), recálculo por `materias` y alertas por `omision`.
4. **Período:** `PERIODO_ACTUAL` sigue fijo en el código, y el período de una nota se deduce de su fecha (enero a julio → 1, agosto a diciembre → 2). Definirlo con la base Períodos.
