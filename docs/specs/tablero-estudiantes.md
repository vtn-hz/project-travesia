# Especificación: Tablero de Criticidad

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/tablero_estudiantes/content.html`
- **Acceso:** tarjeta "Tablero de Criticidad" del [menú inicial](../../section/menu_inicial/content.html)
- **Roles:** ADM, GES y TUT. Solo **TUT y ADM** pueden asignar estados.
- **Requerimientos:** Req 2 (alerta por omisión), Req 4 (semáforos), Req 5 (dashboard docente) y Req 10 (gestión de estados)
- **Ticket:** [SCRUM-21](https://zhakyz.atlassian.net/browse/SCRUM-21) · rama `feat/SCRUM-21-tablero-criticidad`
- **Estado:** desarrollado en local con datos de prueba sobre las bases del ADR-007 (Estudiantes, Criticidad y Respuestas), con el sistema de diseño ([skill `diseno-ui`](../../.skills/diseno-ui/SKILL.md), ADR-004). **No publicado en Moodle.**
- **Última actualización:** 2026-11-03

## Dos estados por estudiante

| Estado | Quién lo define | Cómo |
|---|---|---|
| **Estado calculado** | El sistema | Se genera solo, al cierre evaluado, con los criterios configurados |
| **Estado asignado** | Un tutor o un administrador (Req 10) | Se elige a mano, con un motivo obligatorio (por ejemplo, el resultado de una entrevista) |

- **Estado vigente:** si hay estado asignado, manda el asignado; si no, manda el calculado. La tabla se ordena por el estado vigente y el calculado se muestra atenuado cuando hay uno asignado.
- El estado asignado se puede **quitar** ("Quitar el estado asignado"), y entonces vuelve a mandar el calculado.
- Cada asignación queda en un **historial** con el estado, el motivo, el autor y la fecha.

Elegimos los nombres **calculado / asignado** porque cada uno dice de dónde sale el estado. "Automático / manual" describe el mecanismo, pero no quién toma la decisión.

### De dónde salen (base Criticidad, [ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md))

- **Calculado:** lo arma el tablero al leer (sin `indice_total`, que se saca de la base Criticidad):
  - **1.er año** (`es_primer_anio = si`): el `indice` de la última entrada automática de notas (`notas_1ro` o `materias`) del período.
  - **2.º año en adelante:** el `indice` de la **última Cuatrimestral** (`fuente = respuestas` de la Cuatrimestral, u `omision`). La Inicial se ve en el detalle, pero no entra en el número: vale 0, 33 o 100 según si el estudiante trabaja ([ADR-008](../decisions/008-encuesta-inicial-y-datos-personales.md)).
  - El semáforo sale de ese índice (40 y 70). Sin ninguna entrada automática, **Sin calcular**.
- **Asignado:** la última entrada manual del estudiante, de cualquier período, si no es `sin_asignar`. **Persiste** entre períodos hasta que un tutor la quita, y al quitarla se agrega una entrada manual con `sin_asignar`.
- **El tablero muestra los dos.** El asignado no reemplaza al calculado: el calculado se sigue guardando y mostrando. Si no coinciden, se marca la diferencia ("asignado verde · calculado rojo").
- **Lectura:** las entradas automáticas del período actual y todas las manuales.

## Decisiones del 2026-11-03 (panel de estudiantes)

| Tema | Decisión |
|---|---|
| Filtro | 1.er año / 2.º año en adelante, con `es_primer_anio` de la base Estudiantes |
| Criticidad calculada | La de arriba: notas en 1.er año, última Cuatrimestral desde 2.º año, calculada en el frontend |
| Sin encuesta del período | **Sin lógica propia en el tablero.** La omisión va a ser una entrada de Criticidad (`fuente = omision`) y se muestra como cualquier otra. Cuándo y cómo se genera queda fuera de esta tarea |
| Criticidad manual | **Desde el listado:** botón *Asignar estado* en cada fila, que abre un diálogo con el semáforo (verde, amarillo o rojo), el **motivo obligatorio** y *Quitar el estado asignado*. Agrega una entrada manual en Criticidad (`origen = manual`, `indice` vacío) y el listado se actualiza sin recargar |
| Quién asigna | TUT y ADM. GES ve todo, pero no asigna |
| Detalle | Página aparte (`detalle_estudiante`, `#usuario=<id>`), como hoy |

## Qué muestra

1. **Resumen por estado vigente:** total, riesgo alto, riesgo medio, sin riesgo, sin calcular y con estado asignado. Cada tarjeta filtra la tabla (también con el teclado).
2. **Filtros:** nombre o DNI, estado vigente, año de la carrera (1.er año / 2.º en adelante) y cohorte; **exportar a CSV** (con el índice calculado, de dónde sale y el asignado con su motivo).
3. **Tabla:** estudiante (con el año de la carrera), cohorte, **criticidad calculada** (chip, índice de 0 a 100, de dónde sale y la fecha, o por qué no hay) y **estado asignado** (chip, autor y fecha). Con estado asignado, el calculado queda atenuado.
4. **Asignar estado** (TUT y ADM): botón en cada fila que abre el diálogo. Se elige verde, amarillo o rojo (o *Quitar el estado asignado*, si hay uno) y el motivo es obligatorio. Se cierra con Escape, *Cancelar* o un clic afuera, y el foco vuelve al botón de la fila.
5. **Detalle:** clic o Enter en la fila abre el [Detalle del estudiante](detalle-estudiante.md) con `#usuario=<id>`.

- **Solo estudiantes cargados en el sistema** (decisión del 2026-11-03): el tablero lista únicamente a quienes tienen entrada en la base Estudiantes. Las entradas de Criticidad de un usuario sin información personal (por ejemplo, de una prueba de carga de notas) no se muestran.
- Si un estudiante tiene más de una entrada en Estudiantes, vale la de `rid` mayor.

## Lectura y escritura en Moodle

- **Lectura:** carga la Página Tools (`CMID_TOOLS`) y lee con `LeerBase` las bases Estudiantes, Criticidad y Respuestas (de Respuestas solo usa `codigo_encuesta`, para separar la Inicial de la Cuatrimestral). Si falta alguno de los `DATAID_*`, usa los datos de prueba y lo avisa.
- **Escritura:** una entrada manual en Criticidad (`origen = manual`, `fuente`, `rid_fuente` e `indice` vacíos, `semaforo` = el estado o `sin_asignar`). Los campos se ubican por su etiqueta en el formulario de alta, como en la Página Tools. **No escribe `indice_total`**, así que no depende de que se saque ese campo.
- **Autor:** la plantilla de lista de Criticidad agrega la columna `autor` (`##user##`, [`listtemplate.html`](../../data/moodle/plantillas/criticidad/listtemplate.html)). **Falta publicarla** en la base (requiere confirmación).

## Datos de prueba

Son los **6 integrantes de Zhakyz** ([EQUIPO_ZHAKYZ](../context/EQUIPO_ZHAKYZ.md)), con datos académicos **ficticios**. Las entradas de Estudiantes son las de Mi Trayectoria. El detalle usa los mismos datos, y los estados que se asignan en la vista previa quedan en `localStorage` (`zk-preview-criticidad-manual`), compartidos entre las dos pantallas. *Restablecer datos de prueba* los borra.

| Integrante | Año | Calculado (2026-2) | Asignado | Vigente |
|---|---|---|---|---|
| Santiago Yanosky | 1.er año, cohorte 2026-1 | Riesgo alto, 81 (notas) | Asignado y después quitado | Riesgo alto |
| Nicolás Gabriel Zuviria | 2.º en adelante (desde 2025-1) | Sin calcular: no respondió la Cuatrimestral 2026-2 | Riesgo alto, por Valentino Hernández Pascual | Riesgo alto |
| Gian Luca Distefano | 1.er año | Riesgo medio, 64 (recálculo por un cambio de umbral) | — | Riesgo medio |
| Valentino Hernández Pascual | 2.º en adelante | Sin calcular: sin entradas | — | Sin calcular |
| Luca Zuanetti | 1.er año | Sin riesgo, 22 (notas) | — | Sin riesgo |
| Nahuel Spikerman | 2.º en adelante | Riesgo medio, 47 (Cuatrimestral; su Inicial vale 0 y no cuenta) | Sin riesgo, por Luca Zuanetti | Sin riesgo |

## Verificación (2026-11-03, Playwright, `file://`)

60 verificaciones entre el tablero y el detalle, sin errores de consola, entre ellas:
- el calculado y el vigente de cada integrante, el orden, los indicadores, los filtros (año, cohorte, nombre y DNI) y los roles (GES no ve *Asignar estado*);
- el diálogo: validaciones, guardar, quitar, Escape, clic afuera y *Cancelar*, y que la asignación sobreviva a recargar y se vea en el detalle;
- 400 px sin desborde. Se corrigió un desborde que ya existía: el texto oculto "Acciones" del encabezado de la tabla estiraba la página.

## Pendientes

- Publicar el tablero y el detalle, y cargar `paginas.tablero` y `paginas.detalle` (requiere confirmación).
- Publicar la plantilla de lista de Criticidad con la columna `autor`.
- **Privacidad de las asignaciones:** Moodle aprueba solas las entradas de quien puede aprobar (el equipo docente), y una entrada aprobada la ve cualquiera que pueda abrir la base, incluidos los estudiantes. Revisar el acceso a la base Criticidad antes de asignar estados reales.
- Detectar el rol en Moodle (por grupos): hoy arranca como ADM. Fuera del alcance de SCRUM-21: en la prueba con un Moodle simulado (2026-11-03), una sesión de estudiante vio las filas de otros estudiantes y pudo guardar una asignación. Hay que resolverlo antes de publicar, restringiendo el acceso a la Página o detectando el rol.
- **Asignaciones falsificables:** el estado asignado es la última entrada `origen = manual`, sin mirar quién la cargó, y los estudiantes pueden escribir en Criticidad (ADR-007). Un estudiante podría cargarse un `semaforo = verde` desde el formulario de la base. Hay que aceptar solo las manuales del equipo (por autor o aprobación) o llevarlas a una base que solo escriba el equipo. También queda fuera del alcance de SCRUM-21 por depender de los roles.
- La entrada de omisión (`fuente = omision`) todavía no la genera nadie. Mientras tanto, quien no respondió la Cuatrimestral del período figura *Sin calcular*.
- Leer todas las bases en el navegador puede ser pesado con muchos estudiantes ([ADR-005](../decisions/005-modelo-de-bases-moodle.md)).
