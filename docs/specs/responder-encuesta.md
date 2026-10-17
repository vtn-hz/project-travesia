# Especificación: Mis encuestas (responder)

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/encuestas_preguntas/responder/content.html` (ítem del grupo [`encuestas_preguntas`](../../section/encuestas_preguntas/seccion.json))
- **Rol:** **EST**. Es la pantalla del estudiante; va en su sección, no en el menú del equipo.
- **Requerimientos:** Req 2 (encuestas inicial y cuatrimestral) y edición de respuestas.
- **Estado:** desarrollado en local con **una pregunta de prueba de cada tipo**. **No publicado.**

## Qué hace

1. **Lista "Mis encuestas":** encuesta inicial y cuatrimestral (del período actual), con su estado (*Pendiente* o *Respondida*), la fecha de la última respuesta y la cantidad de versiones.
2. **Formulario:** muestra las preguntas en el orden armado en "Encuestas", con el control que corresponde a cada tipo (radio, número, casillas o texto).
   - **Valida:** las obligatorias son todas menos el texto libre, el número tiene que ser válido y en la selección múltiple hay que marcar al menos una opción.
   - **Precarga** la última respuesta si ya existe.
   - **No guarda** si no cambió nada.
3. **Editar = nueva versión:** cada envío **agrega** un registro y la versión anterior **nunca se modifica ni se borra**. La vigente es la de `created_at` más reciente.
4. **Historial:** todas las versiones, con la respuesta y la criticidad de cada pregunta, y el **registro tal como se guarda** (JSON).

## Registro (base "Respuestas")

Definida en [`data/moodle/BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json) (propuesta, sin crear):

| Campo | Contenido |
|---|---|
| `id_usuario` | id de Moodle del estudiante |
| `dni` | DNI del estudiante |
| `encuesta` | `inicial` o `cuatrimestral` |
| `periodo` | `AAAA-n` en la cuatrimestral; vacío en la inicial |
| `json_pregunta_respuesta` | Lista de `{ id, pregunta, respuesta, criticidad }` |
| `created_at` | Fecha y hora ISO 8601 de esta versión |

**Criticidad: misma forma que la respuesta.**

| Tipo | `respuesta` | `criticidad` |
|---|---|---|
| Selección única | Texto de la opción | Número |
| Número | El número ingresado (por ejemplo `2`) | El valor del **rango** en el que cae (`desde-hasta`; `3-` = 3 o más). El estudiante no ve los rangos |
| Selección múltiple | Lista de opciones | Lista de números **alineada** con las opciones (por ejemplo `[3, 6]`) |
| Texto libre | Texto | `null` |

El texto de la pregunta se guarda tal como estaba al responder (foto). Cómo se combinan las criticidades (suma, máximo, etc.) lo decide el modelo de riesgo, no el registro.

## Privacidad y "nunca se borra" en Moodle

- Configurar la base con **"Requiere aprobación" = Sí** y **no aprobar** entradas. Así cada estudiante ve solo las suyas y los docentes ven todas.
- **Disponible pero no visible:** los estudiantes entran solo por este formulario, que nunca edita ni borra (`rid=0` siempre).
- Un administrador del campus puede borrar igual: **exportar a CSV en cada cierre de cuatrimestre**.

## Pruebas locales hechas

- Validaciones con el formulario vacío.
- Registro guardado: selección única → `4`; número `2` → `5`; múltiple `["Horarios", "Económicas"]` → `[3, 6]`; texto → `null`.
- Edición: la versión 2 se agrega y la 1 queda intacta. El número `7` → "3 o más" → `0`. La inicial también versiona.
- Precarga de la última respuesta y bloqueo de guardado sin cambios.
- Celular (400px) y escritorio, sin errores. Durante las pruebas se corrigió que `<nolink>` tapaba los clics en pantallas angostas; la corrección se aplicó a todas las secciones.

## Pendientes

- **Origen del DNI** en Moodle: base de estudiantes, perfil o una pregunta de la encuesta inicial.
- **Crear las bases** "Armado de encuestas" y "Respuestas" (requiere confirmación) y cargar sus ids (`CMID_ARMADO`, `CMID_RESPUESTAS`, `DATAID_RESPUESTAS`).
- **Lectura de respuestas propias** desde Moodle (con la base creada y "Requiere aprobación" activo).
- **Ventana del período** de la cuatrimestral: cuándo se abre y se cierra.
- Opción "Ninguna" en la selección múltiple: decidir si desmarca las demás.
