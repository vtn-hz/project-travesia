# ADR-009: Cierre de período y alerta por omisión

- **Estado:** aceptada (2026-11-02). Desarrollada en local, **sin publicar**
- **Fecha:** 2026-11-02
- **Pedido:** Valentino Hernández Pascual a Luca Zuanetti, fuera del Jira: "un apartado en la configuración (un botón) que dispare un proceso que, a todos los que no respondieron la encuesta cuatrimestral, les genere una alerta ('no respondió encuesta'), que genera una entrada en la tabla de Criticidad. Además, a los que sí la respondieron, que les indique que tienen que volver a responderla porque finalizó el corte del cuatrimestre. Analizar si es viable el tiempo de días que se espera para empezar a esperar que se respondan las encuestas."
- **Requerimientos:** Req 2 (alerta por omisión), Req 4 (semáforos) y el requerimiento no funcional de minimizar la no respuesta
- **Refs:** [ADR-007](007-encuestas-respuestas-y-criticidad.md) (fuente `omision`, pendiente 3 y 4), [modelo de datos · base 2 Períodos](../models/datos/MODELO_SIMPLIFICADO_MOODLE.md#2-períodos), [`BASE_PERIODOS.json`](../../data/moodle/BASE_PERIODOS.json), [spec de la Configuración del Sistema](../specs/configuracion.md), [puntaje de las encuestas](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md#omisión)

## Contexto

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **La omisión no la genera nadie.** La base Criticidad acepta `fuente = omision` desde el ADR-007, pero ningún script la escribe: quien no responde la Cuatrimestral figura *Sin calcular* en el tablero | ADR-007, pendiente 3; spec del tablero, pendientes |
| 2 | **El período está fijo en el código.** `PERIODO_ACTUAL = '2026-2'` está repetido en la Página Tools, Mi Trayectoria, Información personal, el Tablero y el Detalle. Cambiar de cuatrimestre es editar y republicar las cinco | ADR-007, pendiente 4 |
| 3 | **"Volver a responder" sale del período.** Mi Trayectoria marca la Cuatrimestral como respondida si hay una entrada de Respuestas del período vigente. Con un período nuevo, todos los de 2.º año en adelante quedan en *Pendiente*, hayan respondido o no el anterior | `section/vista_estudiante` |
| 4 | **Las encuestas de Moodle no necesitan cambios.** No tienen apertura ni cierre y permiten más de un envío (`multiple_submit = Sí`, revisado en el campus el 2026-11-02). Moodle guarda solo el último envío; la base Respuestas, todos | Ajustes de las encuestas 59710 y 59712 |
| 5 | **Lo que escribe el equipo lo ven todos los estudiantes.** Moodle aprueba solas las entradas de quien puede aprobar, y una entrada aprobada la ve cualquiera que pueda abrir la base. El ADR-007 decía que el estudiante no ve las de `omision` y `materias`: no es así | Spec del tablero, pendientes de privacidad |
| 6 | **La copia en Respuestas puede faltar.** Moodle tiene una respuesta de la Cuatrimestral del 27/10 (Gian Luca) que no está en la base Respuestas: si la copia falla, queda pendiente en el navegador del estudiante hasta que vuelve a abrir la encuesta | `show_entries.php?id=59712`, revisado el 2026-11-02 |
| 7 | **Moodle no corre tareas propias.** Ningún script del sistema se ejecuta si nadie abre una página: no hay forma de "esperar N días" y disparar algo solo | [ADR-005](005-modelo-de-bases-moodle.md#quién-escribe-la-criticidad) |

## Decisión

Las cinco respuestas del 2026-11-02 (Luca Zuanetti), más dos reglas que salieron al diseñar:

| Tema | Decisión |
|---|---|
| Dónde | Una **Página nueva, "Configuración del Sistema"** (`section/configuracion`), oculta, que abre la tarjeta del mismo nombre del Hub (rol ADM). Mientras Moodle no detecte roles, ocultarla es la única protección |
| Período | Una **base nueva, Períodos** (la base 2 del modelo, reducida): `periodo`, `fecha_inicio`, `fecha_limite_encuesta`, `created_at`. Solo se agregan entradas; **la vigente es la de `rid` mayor**. Las Páginas la leen con `PeriodoVigente()` de la Página Tools (versión 6) y dejan de tener el período fijo |
| Alcance | Solo la **Encuesta Cuatrimestral** y solo los estudiantes de **2.º año en adelante con entrada en la base Estudiantes** (`es_primer_anio = no`). La Inicial es de una sola vez y en 1.er año la Cuatrimestral está deshabilitada |
| Pasaron a 2.º año en el período | **No reciben omisión** en ese cierre (`periodo_paso_superior` = el período que se cierra): no tuvieron la Cuatrimestral habilitada durante todo el período |
| Índice de la omisión | **70**, el piso del rojo: el tutor la ve como riesgo alto sin que pese más que la peor respuesta real |
| Respondió solo en Moodle | **No recibe omisión.** Además de Respuestas, el cierre lee las respuestas de la Encuesta Cuatrimestral en Moodle (`show_entries.php`, todos los grupos): una respuesta desde el inicio del período cuenta como respondida y el estudiante figura "Sin omisión · solo en Moodle" (hallazgo 6). Moodle guarda solo la última respuesta de cada estudiante, con su fecha |
| Privacidad | Cada omisión **se desaprueba apenas se crea** (`view.php?d=…&disapprove=<rid>&sesskey=…`): así solo la ve el equipo. Cuenta como desaprobada solo si Moodle muestra el aviso de éxito; si no, el resultado del cierre la lista para revisarla a mano |
| Plazo en días | Una **fecha límite** por período (`fecha_limite_encuesta`), **opcional**: se puede dejar vacía al abrir el período y definirla o cambiarla después (*Definir la fecha límite* agrega una entrada del mismo período con la fecha nueva). Con fecha, Mi Trayectoria la muestra y el cierre avisa, y pide marcar una casilla, si se hace antes. **Sin disparo automático** |
| Volver a responder | Un **aviso en Mi Trayectoria**, no un mensaje de Moodle: "Finalizó el período 2026-2. Se debe responder la Encuesta Cuatrimestral del período 2027-1" |
| Tablero y Detalle | Si un estudiante no tiene entradas en el período vigente, el calculado es el último del **período anterior**, marcado con su período. Sin esto, al cerrar, las omisiones (que son del período cerrado) dejarían de verse |

### Flujo del cierre

1. La Página lee Períodos (vigente), Estudiantes, Respuestas (Cuatrimestral del período), Criticidad (entradas del período) y las respuestas de la Encuesta Cuatrimestral en Moodle.
2. Arma el **plan**: por cada estudiante de 2.º año en adelante, *respondió*, *respondió solo en Moodle*, *recibe omisión*, *ya tiene omisión* o *pasó a 2.º año en el período*; los de 1.er año quedan fuera. Es la simulación: se muestra al abrir la Página y no escribe nada.
3. **Cerrar período** pide la fecha de inicio y, si ya se conoce, la fecha límite del período nuevo, vuelve a leer las bases (por si alguien respondió mientras tanto) y, por cada estudiante sin respuesta (en Respuestas ni en Moodle) ni omisión:
   - agrega a Criticidad `origen = automatica`, `fuente = omision`, `rid_fuente` vacío, `indice = 70`, `indice_total` (la misma regla del ADR-007, con las entradas automáticas del estudiante en el período), `semaforo` y `motivo = "No respondió la Encuesta Cuatrimestral <período>"`, con el período que se cierra;
   - la desaprueba.
4. Recién con todas las omisiones guardadas agrega el período nuevo a Períodos. Si algo falla, se detiene sin cambiar el período: volver a cerrar retoma donde quedó, porque no se repite una omisión que ya existe.

### Plazo en días: viabilidad

- **Disparo automático a los N días: no es viable.** Moodle no ejecuta código del sistema si nadie abre una página (hallazgo 7). Las alternativas (un script programado en la computadora de un integrante, o disparar el cierre cuando alguien del equipo abre el tablero) escriben en Moodle sin una persona que lo confirme, contra la regla 7 de [`RULES.md`](../../RULES.md).
- **La fecha de cierre de la Encuesta de Moodle (`timeclose`): no conviene.** Al pasar la fecha, Moodle no deja responder, y habría que cambiar la configuración de la actividad en cada período.
- **Fecha límite como dato: viable.** Se carga al abrir cada período o más adelante, cuando el equipo la conozca (al 2026-11-03 todavía no está definida la de 2026-2). El estudiante la ve en Mi Trayectoria y el cierre avisa si se hace antes. El cierre lo hace una persona.
- **Cuántos días:** no se fija en el sistema. Sale del calendario académico de la facultad (fin de las clases y mesas de examen) y lo define el equipo con el cliente al abrir cada período. La Página muestra el plazo resultante ("N días").

### Base Períodos

| Campo | Tipo | Notas |
|---|---|---|
| `periodo` | text | `AAAA-n` (`n` = 1 o 2). Se ignoran las entradas con otro formato |
| `fecha_inicio` | text | `AAAA-MM-DD` |
| `fecha_limite_encuesta` | text | `AAAA-MM-DD`: hasta cuándo se espera la Cuatrimestral del período. Opcional: vacía hasta que el equipo la defina |
| `created_at` | text | ISO 8601 con zona |

- **"Requiere aprobación":** sí. Lo que carga el equipo queda aprobado solo y lo leen todos; lo que cargara un estudiante lo vería solo él (afectaría solo a sus propias vistas).
- **Vigente:** la de `rid` mayor. Definir o cambiar la fecha límite es agregar una entrada del mismo período con la fecha nueva; volver atrás es agregar otra vez el período anterior.
- **Sin la base** (o si no se puede leer), `PeriodoVigente()` usa `2026-2` y lo avisa.
- Quedan fuera del modelo original `fecha_fin` y `cant_ingresantes`: no los usa nadie todavía.

## Opciones consideradas

| | A. Período en el código | B. Período por fecha (enero a julio = 1) | **C. Base Períodos** |
|---|---|---|---|
| El botón cambia el período | No: hay que republicar 5 Páginas | No hay corte: cambia solo el 1 de agosto | **Sí** |
| Fecha límite | No | No | **Sí** |
| Historial de los períodos | Git | No | **Sí** |
| Costo | — | — | Una lectura más por página (una base chica) |

## Consecuencias

**A favor**
- La omisión se genera, con el mismo formato que las demás entradas de Criticidad: el tablero y el detalle la muestran sin lógica nueva.
- Cambiar de cuatrimestre deja de requerir código.
- Cerrar dos veces no duplica nada.

**En contra**
- **El cierre corre en el navegador de quien lo aprieta:** escribe una entrada por estudiante, de a una (unos 2 segundos cada una). Con 300 estudiantes sin responder, unos 10 minutos con la pestaña abierta. La Página muestra el progreso y se puede retomar.
- **Solo la protege que esté oculta.** Cualquier estudiante puede agregar entradas a Criticidad desde el formulario de la base: es el mismo problema que las asignaciones manuales (spec del tablero, pendientes). Se resuelve con la detección de roles.
- **Quien no cargó la información personal no existe para el sistema** y no recibe la omisión.
- **El envío de las encuestas lee una base más** (Períodos) antes de copiar, con una espera máxima de 4 segundos. Si no la puede leer a tiempo, usa el último período leído en ese navegador o, si nunca leyó uno, `2026-2`.
- **Leer las respuestas de Moodle depende de su página de respuestas** (`show_entries.php`): si cambia el tema o el idioma del campus, la fecha puede dejar de leerse. Sin fecha, la respuesta cuenta igual (no se da una omisión por error).
- **Las notas de 1.er año siguen tomando el período de su fecha** (enero a julio → 1, agosto a diciembre → 2) y `CriticidadNotas` solo cuenta las del período vigente. Si 2026-2 se cierra en diciembre, las notas que se carguen ese mes quedan en 2026-2 y no entran en el índice de 2027-1. Queda para cuando la base Períodos tenga las fechas de cada cuatrimestre.
- **La URL de desaprobar** se verificó en el código de Moodle, no en el campus: hay que confirmarla en la primera ejecución real (la Página informa si una entrada no se pudo desaprobar).

## Publicación y pendientes

Nada publicado. Pasos, cada uno simulado y con confirmación:
1. Crear la base Períodos con `crear_base.js`, configurarla ("Requiere aprobación"), cargar sus plantillas y su primera entrada: `2026-2`, con inicio el 2026-08-18 (el 17 fue feriado) y sin fecha límite, que se define más adelante.
2. Publicar la Página Tools v6 y probar un envío real de la Cuatrimestral.
3. Crear la subsección oculta "Configuración" con la Página "Configuración del Sistema".
4. Republicar Mi Trayectoria, Información personal, el Tablero, el Detalle y el Hub.
5. Simular el cierre sobre las bases reales. El cierre real, solo con un pedido aparte.
