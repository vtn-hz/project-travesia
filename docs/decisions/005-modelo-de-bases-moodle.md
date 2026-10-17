# ADR-005: Modelo de bases de datos en Moodle para la criticidad y su historial

- **Estado:** Pendiente (**en revisión**)
- **Fecha:** 2026-10-17
- **Refs:** [spec Detalle del estudiante](../specs/detalle-estudiante.md), [spec Tablero de Criticidad](../specs/tablero-estudiantes.md), [`data/moodle/`](../../data/moodle/), [`RULES.md`](../../RULES.md)

> **En revisión.** La visualización de la evolución de la criticidad (tablero + detalle del estudiante) puede ser **muy pesada de cargar en el frontend**. Todo se lee desde el navegador de quien mira, con varias bases y todos los estudiantes. Hay que resolver la [pregunta abierta](#pregunta-abierta-carga-de-datos-en-el-frontend) antes de crear las bases.

## Contexto

El [Detalle del estudiante](../specs/detalle-estudiante.md) muestra:
- la evolución de la criticidad de 0 a 100 a lo largo del tiempo;
- un registro de todas sus actividades;
- el historial de cambios de estado, tanto calculados como asignados.

Para eso hacen falta datos guardados en Moodle. Las restricciones son las del proyecto:

- Solo se pueden usar **bases de datos de Moodle** (`mod_data`) dentro de la sección Zhakyz ([`RULES.md`](../../RULES.md)).
- **No hay servidor propio:** todo el cálculo y la lectura se hacen con JavaScript en la página, contra las URLs de Moodle (`view.php`, `edit.php`).

## Propuesta

### Principios

1. **El historial se guarda, no se recalcula.** Cada cálculo de criticidad queda como una foto fija. Recalcular con las notas de hoy cambiaría el pasado.
2. **Las bases de historial solo agregan entradas.** Se aplica a Criticidad, Asignaciones, Respuestas y Entrevistas: editar agrega una entrada nueva y nada se borra.
3. **Clave común: `id_usuario` de Moodle.** Los CSV de notas vienen por DNI y la base Estudiantes traduce DNI a `id_usuario`.
4. **Lo que Moodle ya sabe no se copia:**
   - el autor y la fecha de cada entrada los guarda Moodle solo;
   - la foto y los datos del campus se leen en vivo del perfil.

### Bases

| # | Base | Una entrada por… | Campos principales | Tipo |
|---|---|---|---|---|
| 1 | **Estudiantes** | estudiante | `id_usuario`, `dni`, `nombre`, `cohorte`, `plan` (2003/2024), `fecha_ingreso` | Editable |
| 2 | **Calificaciones** | nota importada | `dni`, `materia`, `instancia` (parcial 1, parcial 2, final, cursada), `nota`, `aprobada`, `periodo`, `importacion` | Solo agrega |
| 3 | **Criticidad** | cálculo por estudiante y corte | `id_usuario`, `periodo`, `corte` (parcial o cierre), `fecha`, `valor` (0–100), `nivel`, `criterio` (por ejemplo `req4-v1`), `motivo`, `detalle_json` | Solo agrega |
| 4 | **Asignaciones** | cambio manual de estado | `id_usuario`, `nivel` (rojo, amarillo, verde o `auto` para quitarlo), `motivo` | Solo agrega |
| 5 | **Entrevistas** | entrevista o tutoría | `id_usuario`, `fecha`, `tipo`, `resultado`, `estado` (pedida, aceptada, realizada) | Solo agrega |
| 6 | **Configuración** | parámetro | `clave`, `valor` (umbrales, bandas, períodos abiertos, versión del criterio) | Editable |
| 7 | **Preguntas** | pregunta | La que ya existe (cmid 59498, d=114) | Editable |
| 8 | **Respuestas** | respuesta a una encuesta | [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json) (propuesta) | Solo agrega |

A estas se suma **Armado de encuestas** ([`BASE_ENCUESTAS_ARMADO.json`](../../data/moodle/BASE_ENCUESTAS_ARMADO.json), propuesta). El plan de estudios y las correlativas pueden quedar en `data/` porque cambian muy poco.

### De dónde sale cada parte de la visualización

| En pantalla | Origen |
|---|---|
| Foto y datos del campus | Perfil de Moodle en vivo (`user/pix.php` y `user/view.php`) |
| DNI, cohorte, etapa | Estudiantes |
| Línea de criticidad | Criticidad del estudiante, ordenada por `fecha` |
| Marcas de estado asignado | Asignaciones del estudiante |
| Resumen (actual, calculado, asignado) | Última entrada de Criticidad y última de Asignaciones |
| Historial de criticidad (actividades) | Se une al leer:<br>• inscripción: Estudiantes<br>• encuestas: Respuestas<br>• notas cargadas: Calificaciones<br>• entrevistas: Entrevistas<br>• estados: Criticidad y Asignaciones |
| Historial de cambios de estado | Se calcula al leer: cambios de `nivel` en Criticidad, más todas las Asignaciones |

No hay una base de "actividades": el registro se arma uniendo las demás, para no cargar nada dos veces.

### Quién escribe la criticidad

Moodle no corre tareas propias. Un ADM o GES aprieta **"Calcular corte"** en el tablero, después de importar notas o al cerrar el período. La página:
1. calcula la criticidad de cada estudiante con el criterio vigente;
2. agrega una entrada por estudiante en Criticidad.

`detalle_json` guarda los datos usados, por ejemplo `{"aprobadas":1,"esperadas":7,"encuesta":false}`. Así cada punto del gráfico se puede explicar aunque después cambien los criterios.

### Privacidad

- Respuestas va con **"Requiere aprobación"**, para que cada estudiante vea solo lo suyo.
- Criticidad, Asignaciones, Entrevistas, Calificaciones y Estudiantes tienen que ser **solo para el equipo**: restringir el acceso a la actividad por grupo o rol. Ocultarla no alcanza, porque se puede entrar con el link.

## Pregunta abierta: carga de datos en el frontend

**¿Es viable que el navegador lea y cruce todas estas bases para todos los estudiantes?**

Para pintar el semáforo, el **tablero** necesita el estado vigente de **cada** estudiante:
- la última entrada de Criticidad y la última de Asignaciones de cada uno;
- y, al calcular un corte, también Calificaciones y Respuestas de todos.

Con la forma de leer que usamos hoy (`view.php?perpage=1000` y leer el HTML):

- **Se descarga y se procesa el HTML de todas las entradas,** incluido el historial completo, aunque solo haga falta la última. Criticidad crece unas 3 a 5 entradas por estudiante y cuatrimestre, y Calificaciones bastante más.
- **Son varias consultas por carga:** Estudiantes, Criticidad, Asignaciones y, según la pantalla, Respuestas, Calificaciones y Entrevistas.
- **"Calcular corte"** escribe una entrada por estudiante: un `POST` a `edit.php` por cada uno, hechos uno tras otro desde el navegador.
- **Rendimiento del campus:** cada carga del tablero le pide a Moodle páginas grandes. Con cientos de estudiantes y varios años puede ser lento para el usuario y pesado para el servidor de la facultad.

El **detalle** de un solo estudiante es más liviano: puede usar la búsqueda avanzada de la base para traer solo las entradas de un `id_usuario`.

### Alternativas a evaluar

| Opción | Idea | A favor | En contra |
|---|---|---|---|
| A. Todo en el frontend | Como está propuesto | Simple, sin bases extra | Puede no escalar |
| B. **Base resumen "Estado actual"** | Una entrada por estudiante con el último valor, el nivel calculado y el asignado. Se actualiza al calcular un corte o al asignar. El tablero lee solo esta base; el historial completo se lee únicamente en el detalle, filtrado por estudiante | El tablero lee N entradas chicas | Hay que mantenerla sincronizada. Es la única base que se edita en lugar de agregar |
| C. Paginación y filtros | Leer por cohorte o por página (`perpage`, `page`, búsqueda avanzada) | Menos datos por carga | El resumen y los totales de todos quedan incompletos |
| D. Exportación de Moodle | Usar el export CSV/JSON de cada base en lugar de leer el HTML | Menos peso que el HTML | Requiere permisos de exportación y hay que probarlo |
| E. Caché en el navegador | Guardar la última lectura y traer solo lo nuevo | Recargas rápidas | Más complejo; datos posiblemente desactualizados |

### Para decidir

1. ¿Cuántos estudiantes y cuántos cuatrimestres de historial tiene que soportar? Hace falta una estimación del volumen real.
2. ¿Se mide primero? Por ejemplo, cargar 500 entradas de prueba en una base de Zhakyz y tomar el tiempo de lectura. Solo con confirmación ([`RULES.md`](../../RULES.md)).
3. ¿Se adopta la base resumen (opción B) para el tablero, dejando el historial completo solo para el detalle?
4. ¿Es aceptable que "Calcular corte" tarde varios segundos y muestre una barra de progreso?

## Decisión

**Pendiente.** No se crea ninguna de estas bases en Moodle hasta resolver la pregunta abierta.

## Consecuencias

- Mientras tanto, el tablero y el detalle siguen funcionando en local con datos de prueba (`CMID_* = null`).
- La visualización del detalle queda **en revisión**: el diseño de pantalla está aprobado para seguir iterando, pero su fuente de datos puede cambiar según lo que se decida.
