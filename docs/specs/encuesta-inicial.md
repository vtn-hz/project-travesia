# Especificación: Encuesta Inicial · cuadro de materias aprobadas

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Encuesta en Moodle:** Encuesta (`mod_feedback`) "Encuesta Inicial" (cmid 59710), subsección Hub. Creada por el equipo en Moodle e importada al repo: [`data/moodle/encuestas/ENCUESTA_INICIAL.xml`](../../data/moodle/encuestas/ENCUESTA_INICIAL.xml) (exportación de preguntas, se puede volver a importar).
- **Cuadro:** [`section/encuesta_inicial/content.html`](../../section/encuesta_inicial/content.html). Reemplaza el texto `[[Cuadro]]` del ítem "Área de texto y medios" (ítem 8254), el primero de la encuesta.
- **Base:** Materias (d=152).
- **Última actualización:** 2026-10-24 (el equipo agregó en Moodle tres saltos de página y bajó el máximo de `creditos_aprobados` de 235,5 a 223)

---

## Propósito

Que el estudiante seleccione las materias que tiene aprobadas y que el total de créditos se complete solo en la pregunta `creditos_aprobados`, en lugar de calcularlo a mano. Alimenta el avance curricular acumulado (requerimiento de indicadores) y el término `Créditos aprobados / Créditos esperados` del [modelo ICE](../models/MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md).

## Preguntas de la encuesta (importadas)

| Ítem | Tipo | Etiqueta | Pregunta | Obligatoria |
|---|---|---|---|---|
| 8254 | Área de texto y medios | — | `[[Cuadro]]` (acá va el cuadro) | — |
| 8253 | Numérica (0 a 223) | `creditos_aprobados` | Los créditos obtenidos actualmente son: | Sí |
| 8506 | Salto de página | — | — | — |
| 8257 | Numérica (2000 a 3000) | `año_cohorte` | ¿En qué año ingresaste a la facultad? | Sí |
| 8258 | Elección múltiple | `cuatri_cohorte` | ¿En cuál cuatrimestre ingresaste? (1 · 2) | Sí |
| 8507 | Salto de página | — | — | — |
| 8259 | Elección múltiple | `trabaja` | ¿Trabaja actualmente? (Si · No) | Sí |
| 8508 | Salto de página | — | — | — |
| 8260 | Elección múltiple | — | ¿En qué momento de la carrera comenzaste tu actividad laboral? Depende de `trabaja = Si` | No |

## Cómo funciona el cuadro

- Lee las materias **vigentes** de la base Materias (la entrada más nueva de cada `plan + codigo`, sin las dadas de baja). Usa la plantilla propia de la base y, si no está, la de Moodle.
- Botón por plan (2024 primero). Las materias se agrupan por año (`ceil(cuatrimestre / 2)`) y cada una muestra código, cuatrimestre (las anuales, los dos) y créditos.
- Cada selección actualiza el total de créditos, la cantidad de materias y el porcentaje sobre los créditos del plan, y escribe el total en el input `feedback_item_8253` de la encuesta.
- "Seleccionar todas" / "Quitar todas" por año.
- **El total no se edita a mano:** cuando la lista de materias se pudo leer, la pregunta `creditos_aprobados` queda de solo lectura y siempre muestra la suma. Si su valor cambia por otra vía, vuelve a la suma, y antes de enviar la encuesta se escribe una vez más. Si la base no se pudo leer, el campo queda editable para completarlo a mano.
- Es un control del navegador: Moodle no puede validar en el servidor que el número coincida con las materias.
- Si la base no se puede leer o está vacía, avisa que el total se completa a mano en la pregunta siguiente.
- En local muestra unas pocas materias de ejemplo y simula la pregunta numérica.

## Pendientes

- Publicado el 2026-10-19 en el ítem 8254 con un POST directo al formulario del ítem: Moodle guarda el `<script>` y lo ejecuta, pero el editor del ítem muestra una versión limpia, sin script. **No editar el ítem desde Moodle**: al guardar, el script se pierde. Los cambios se hacen en el repo y se vuelven a publicar.
- El estudiante necesita poder ver la base Materias: revisar las restricciones de la subsección Database.
- La encuesta no guarda qué materias se marcaron, solo el total. Si hace falta el detalle, agregar una pregunta de texto oculta con los códigos.
- El plan del estudiante no se pregunta: lo elige en el cuadro.
- El máximo de `creditos_aprobados` (223) es el total del Plan 2024. El Plan 2003 suma 229 créditos: un estudiante de ese plan con más de 223 no puede enviar la encuesta. Decidir si el máximo vuelve a 229 o más.
