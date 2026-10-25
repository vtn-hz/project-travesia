# Especificación: Copia de respuestas de las encuestas

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** [`section/copia_encuestas/content.html`](../../section/copia_encuestas/content.html)
- **Dónde va en Moodle:** un ítem "Área de texto y medios" con este archivo **en cada página** de cada encuesta:
  - Encuesta Inicial (cmid 59710): 4 páginas, 4 ítems;
  - Encuesta Cuatrimestral (cmid 59712): 1 página, 1 ítem.
- **Rol:** EST (corre mientras el estudiante responde). En "Editar preguntas" y en la vista previa solo muestra un aviso para el equipo.
- **Decisión:** [ADR-006](../decisions/006-versionado-de-encuestas.md).
- **Estado:** desarrollado y probado en local. **No publicado.** Hace falta crear antes la base Respuestas.
- **Última actualización:** 2026-10-24

## Qué hace

La Encuesta de Moodle valida, guarda y precarga como siempre, pero guarda solo la última respuesta. Este script agrega **cada envío** como una versión nueva en la base Respuestas, con su puntaje de criticidad.

1. **Al pasar de página**, guarda en el navegador (`sessionStorage`) lo respondido en esa página. Si la página es la del cuadro de créditos, guarda también el plan elegido y las materias marcadas.
2. **Al hacer el envío final:**
   - repite los controles de Moodle (obligatorias y rango de los numéricos). Si algo falla, no copia y deja que Moodle muestre el error;
   - arma el registro con todas las páginas. Si falta alguna, lee su HTML con `fetch` (Moodle la muestra con lo ya respondido);
   - calcula la criticidad y agrega la entrada a la base Respuestas (`rid=0`);
   - deja seguir el envío a Moodle. La copia espera como mucho 8 segundos.
3. **Si la copia falla**, la respuesta igual se guarda en Moodle:
   - el registro queda pendiente en el navegador (`localStorage`) y se reintenta la próxima vez que se abre la encuesta;
   - antes de reintentar, se verifica que no haya llegado (mismo `created_at`);
   - el estudiante ve un aviso.

### Cuándo es el envío final

| Botón | Envío final |
|---|---|
| Enviar respuestas | Siempre |
| Página siguiente | Solo si **no queda ninguna página con preguntas visibles**. Moodle muestra este botón aunque las páginas que siguen queden vacías por una dependencia, y en ese caso guarda sin pasar por "Enviar respuestas" (en la Inicial, si el estudiante no trabaja) |
| Página anterior y Cancelar | Nunca |

Para saberlo, el script tiene la lista de ítems de cada página (`paginas` en `ENCUESTAS`) y las dependencias. Si la página actual no coincide con esa lista, no adivina: solo copia con "Enviar respuestas".

## Ítems y variables

Copiados de [`ENCUESTA_INICIAL.xml`](../../data/moodle/encuestas/ENCUESTA_INICIAL.xml) y [`ENCUESTA_CUATRIMESTRAL.xml`](../../data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml). La variable es la etiqueta del ítem en Moodle. Si un ítem no tiene etiqueta, la define el script.

| Encuesta | Página | Ítem | Variable | Criticidad |
|---|---|---|---|---|
| Inicial | 1 | 8254 (cuadro de créditos) | `plan`, `materias_aprobadas` | — |
| | 1 | 8253 | `creditos_aprobados` | Avance curricular (máx. 70) |
| | 2 | 8257 | `año_cohorte` | — (se usa para el avance) |
| | 2 | 8258 | `cuatri_cohorte` | — (se usa para el avance) |
| | 3 | 8259 | `trabaja` | Sí → 10 |
| | 4 | 8260 (depende de `trabaja` = Si) | `inicio_laboral` | 20 |
| Cuatrimestral | 1 | 8262 | `creditos_aprobados` | Avance curricular (máx. 30). El ingreso sale de la Encuesta inicial vigente en la base |
| | 1 | 8264 | `progreso_proyecto_final` | 0 · 10 · 7 · 3 · 0 |
| | 1 | 8265 | `trabaja` | Sí → 5 |
| | 1 | 8266 (depende de `trabaja` = Si) | `inicio_laboral` | 10 · 10 · 10 · 7 · 7 · 4 · 4 |
| | 1 | 8273 | `materias_cuatrimestre` | — (texto libre) |
| | 1 | 8271 | `avance_percibido` | 0 · 5 · 10 |

- **Puntos:** van por número de opción, en el orden de Moodle. Los valores son los provisorios de [`MODELO_CRITICIDAD_ENCUESTAS.md`](../models/MODELO_CRITICIDAD_ENCUESTAS.md).
- **Ítems que no están en la lista:** si el equipo agrega una pregunta, se copia igual como `pregunta_<id>`, sin puntos.
- **Bloque de cursada de la Cuatrimestral** (35 puntos: inactividad, recursado y dificultad): todavía no se puede calcular, porque la Encuesta no tiene preguntas por materia. Hoy la Cuatrimestral llega como mucho a 65.

## Registro (base "Respuestas")

Definida en [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json) (propuesta, sin crear), con sus [plantillas](../../data/moodle/plantillas/respuestas/).

```json
{
  "id_usuario": 2048,
  "dni": "00000006",
  "encuesta": "inicial",
  "version_encuesta": 1,
  "periodo": "",
  "json_pregunta_respuesta": [
    { "variable": "plan", "pregunta": "Plan de estudios (cuadro de créditos)", "respuesta": "2024", "criticidad": null },
    { "variable": "materias_aprobadas", "pregunta": "Materias aprobadas (cuadro de créditos)", "respuesta": ["INGM101", "INGM105"], "criticidad": null },
    { "variable": "creditos_aprobados", "pregunta": "Los créditos obtenidos actualmente son:", "respuesta": 10, "criticidad": 35 },
    { "variable": "año_cohorte", "pregunta": "¿En qué año ingresaste a la facultad?", "respuesta": 2026, "criticidad": null },
    { "variable": "cuatri_cohorte", "pregunta": "¿En cuál cuatrimestre ingresaste?", "respuesta": "1", "criticidad": null },
    { "variable": "trabaja", "pregunta": "¿Trabaja actualmente?", "respuesta": "Si", "criticidad": 10 },
    { "variable": "inicio_laboral", "pregunta": "¿En qué momento de la carrera comenzaste tu actividad laboral?", "respuesta": "Comencé en 1.º año", "criticidad": 20 }
  ],
  "puntaje_criticidad": 65,
  "created_at": "2026-10-24T22:36:03-03:00"
}
```

- **`respuesta`:** el texto de la opción tal como está en Moodle; los números van como número.
- **`pregunta`:** el texto de la pregunta tal como la vio el estudiante.
- **Preguntas dependientes:** si no corresponden, no se guardan. Por ejemplo, `inicio_laboral` cuando no trabaja, aunque la Cuatrimestral la pida igual.

## Datos en Moodle

| Dato | De dónde sale |
|---|---|
| Encuesta | Campo oculto `id` del formulario (cmid) |
| Página actual | Campo oculto `gopage` |
| Respuestas | Campos `numeric_<id>`, `multichoice_<id>` (número de opción) y `textfield_<id>`. El texto de la opción sale de su etiqueta |
| Enunciado, obligatoria y rango | Etiqueta del ítem (`#id_<tipo>_<id>_label` o `#fgroup_id_group_<tipo>_<id>_label`), con `.boundaries` y la marca "Campo obligatorio" |
| Plan y materias | Cuadro de créditos (`#cuadro-creditos`): botón de plan activo y casillas marcadas |
| Usuario y DNI | `M.cfg.userId` y `/login/change_password.php` → `[data-name="username"]` |
| Ingreso (cuatrimestral) | La Encuesta inicial más reciente del estudiante en la base Respuestas |

## Vista previa local

Al abrir el archivo en local aparece un **simulador de la Encuesta de Moodle**:
- usa el mismo HTML que genera el campus y la misma navegación: valida obligatorias y rango al cambiar de página, y "Página siguiente" aparece aunque las páginas que siguen queden vacías;
- tiene un cuadro de créditos simplificado y el usuario de prueba Nicolás Zuviria, con DNI ficticio;
- muestra los registros que se copiarían, con su puntaje. Si Moodle guardara sin que la copia lo tomara, avisa.

## Pruebas hechas (2026-10-24)

**Simulador local:**

| Caso | Resultado |
|---|---|
| Inicial completa, trabaja desde 1.er año | Puntaje 65 |
| Inicial sin trabajo | La página 4 queda vacía; Moodle guarda con "Página siguiente" y la copia lo toma. Puntaje 70 |
| Cuatrimestral | El ingreso sale de la última Inicial copiada. Puntaje 60 |
| Obligatoria sin responder y créditos fuera de rango | No se copia |

Sin errores de consola, a 1000 y 400 px.

**Integración con el HTML real de Moodle**, tomado de la vista previa del campus y armado como en modo responder, sin conexión. Incluye el cuadro de créditos publicado, la navegación entre páginas, la base Materias y el alta en la base Respuestas, todo simulado:

| Caso | Resultado |
|---|---|
| Inicial completa | El cuadro calcula los créditos; Moodle recibe "Enviar respuestas" y la base recibe el registro (65) |
| Inicial sin trabajo, empezada en otra pestaña | Moodle guarda con "Página siguiente"; las páginas anteriores se leen con `fetch` y se copian (70) |
| Cuatrimestral | Toma el ingreso de la base y no guarda `inicio_laboral` porque no trabaja (15) |
| Falta una obligatoria | No hay copia |
| Vista previa | El aviso confirma que la estructura de páginas coincide |

Las pruebas encontraron y corrigieron dos errores:
- el texto de la pregunta de créditos se tomaba de una etiqueta oculta del cuadro;
- en "Editar preguntas" el control de estructura corría antes de que la página terminara de cargar.

## Pendientes

1. **Crear la base Respuestas** (requiere confirmación) con `crear_base.js`. Después:
   - cargar las plantillas de `data/moodle/plantillas/respuestas/`;
   - configurar la aprobación;
   - sincronizar `bases.respuestas` en el script.
2. **Probar con una cuenta de estudiante**, porque con rol Profesor no se puede responder:
   - el envío real;
   - el DNI de `change_password.php`;
   - la lectura de páginas con `fetch`;
   - el alta en la base.
3. **App móvil:** verificar si los estudiantes la usan. Si responden desde la app, probablemente el script no corre y no hay copia.
4. **Publicar** el ítem en las 5 páginas (requiere confirmación). No editar esos ítems desde Moodle.
5. **Encuesta Cuatrimestral (para el equipo):**
   - `inicio_laboral` depende de `trabaja`, pero están en la misma página, así que Moodle la muestra y la pide siempre. Hace falta un salto de página entre las dos;
   - el ítem 8261 todavía dice `[[Cuadro]]`: falta el cuadro de créditos;
   - el ítem 8270 describe preguntas por materia que la Encuesta no puede hacer. Hacen falta para el bloque de cursada de la criticidad.
6. **Cuadro de créditos:** todavía ofrece el Plan 2003, que quedó fuera del alcance. Si el estudiante lo elige, el avance no se puntúa.
7. **Control para el equipo:** comparar la última respuesta de Moodle con la última versión de la base, para detectar copias que no llegaron.
8. **`avance_percibido`:** "Demorado" y "Muy demorado" tienen el mismo umbral (50 %) en Moodle.
9. **Período:** `PERIODO_ACTUAL` está fijo en el script (`2026-2`). Hay que cambiarlo cada cuatrimestre o definir la ventana del período.
