# Puntaje de criticidad de las encuestas

- **Estado:** propuesta, con **valores provisorios** para que el equipo los ajuste.
- **Alcance:** solo el **Plan 2024** (223 créditos en 10 cuatrimestres). El Plan 2003 queda afuera ([`RULES.md`](../../../RULES.md) → *Alcance*).
- **Dónde se usa:** la tool `CriticidadEncuesta` de la [biblioteca de Tools](../../../section/utils/tools/content.html), que el [script de copia](../../specs/copia-encuestas.md) de las Encuestas de Moodle ([ADR-006](../../decisions/006-versionado-de-encuestas.md)) aplica al enviar. Hasta la versión 3 de Tools (publicada hasta el 2026-11-01) eran `CriticidadInicial` y `CriticidadCuatrimestral`, con los puntos en el código.
- **Dónde están los puntos:** desde el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md), en la base **Encuestas**: cada opción de cada versión lleva su `criticidad`, y las preguntas que se calculan llevan su `regla` ([`DEFINICIONES_ENCUESTAS.json`](../../../data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json)). Cambiar un valor es cargar una versión nueva de la encuesta.
- **Qué calcula:** un índice de **0 a 100** para cada envío de una encuesta.
  - **0** significa sin señales de riesgo.
  - **100** es la combinación de respuestas más crítica posible **entre las preguntas que puntúan en esa versión**.
- **Cómo se guarda:** cada envío agrega una entrada a la base **Criticidad** (`fuente = respuestas`, `rid_fuente` = la respuesta), con su `indice`, el `indice_total` del estudiante y el semáforo. Respuestas no guarda puntos.
  - El índice se calcula al enviar y no se recalcula después. Si cambian los valores, las entradas viejas conservan el suyo.
  - **El estudiante no lo ve en la encuesta,** pero puede ver sus propias entradas de Criticidad (ADR-007).

## Cómo se arma

- **Cada encuesta reparte 100 puntos entre sus preguntas.** La peor respuesta de cada pregunta suma el máximo de esa pregunta, y la suma de todos los máximos es 100.
- **Preguntas que no suman puntos:** año y cuatrimestre de ingreso, y materias aprobadas. Se usan para calcular el avance curricular, que va en *Créditos aprobados*.
- **Índice:** puntos ÷ `puntaje_maximo` de la versión × 100, redondeado al entero más cercano. `puntaje_maximo` es la suma de los máximos de las preguntas que puntúan en esa versión: hoy 30 en la Inicial y 70 en la Cuatrimestral, porque el avance curricular está desactivado. Con todas las preguntas activas es 100 y el índice coincide con los puntos.

### Semáforo (mismos cortes que el [ICE](MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md#3-semáforo-de-criticidad))

| Puntaje | Semáforo |
|---|---|
| 0 a 39 | Verde: riesgo bajo |
| 40 a 69 | Amarillo: riesgo moderado |
| 70 a 100 | Rojo: criticidad alta |

## Avance curricular (lo usan las dos encuestas)

> **En análisis (2026-10-26).** El cálculo está desactivado ([biblioteca de Tools](../../../section/utils/tools/content.html), comentado, sin borrar) mientras el equipo lo revisa porque es complejo. En la base Encuestas, `creditos_aprobados` tiene `regla: { nombre: "avance_curricular", activa: false }`: se guarda la respuesta, pero no suma ni cuenta en `puntaje_maximo`. Mientras tanto, el máximo es **30** en la inicial y **70** en la cuatrimestral, y desde el ADR-007 el índice se lleva a 0–100 con ese máximo para que los cortes del semáforo sigan valiendo.

Compara los **créditos aprobados** con los **créditos esperados** según los cuatrimestres que pasaron desde el ingreso.

**T, cuatrimestres transcurridos:** los cuatrimestres completos desde el ingreso hasta el anterior al de la respuesta. Por ejemplo, una respuesta de 2026-2 da:
- ingreso 2026-2 → T = 0;
- ingreso 2026-1 → T = 1;
- ingreso 2024-1 → T = 5.

**Créditos esperados del Plan 2024:** la suma de los créditos de los cuatrimestres 1 a T. Las materias anuales cuentan en el cuatrimestre en que terminan.

| T | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 o más |
|---|---|---|---|---|---|---|---|---|---|---|
| Créditos esperados | 14 | 34 | 57 | 81 | 104 | 131 | 152 | 176 | 193 | 223 |

**Cociente r** = créditos aprobados ÷ créditos esperados.

| Situación | Parte del máximo | Inicial (máx. 70) | Cuatrimestral (máx. 30) |
|---|---|---|---|
| T = 0 (ingresante en su primer cuatrimestre) o año de ingreso desconocido | No se puntúa | 0 | 0 |
| r ≥ 1 (al día o adelantado) | 0 % | 0 | 0 |
| 0,75 ≤ r < 1 | 25 % | 18 | 8 |
| 0,50 ≤ r < 0,75 | 50 % | 35 | 15 |
| 0,3897 ≤ r < 0,50 | 75 % | 53 | 23 |
| r < 0,3897 (umbral crítico de García Lambert, el mismo del ICE) | 100 % | 70 | 30 |

En la cuatrimestral, el año y el cuatrimestre de ingreso salen de la Encuesta inicial vigente del estudiante.

## Encuesta inicial (total 100)

| Pregunta | Respuesta | Puntos |
|---|---|---:|
| Créditos aprobados (avance curricular) | Según la tabla de avance | 0 a **70** |
| ¿Trabaja actualmente? | No | 0 |
| | Sí | **10** |
| ¿En qué momento de la carrera comenzó su actividad laboral? (solo si trabaja) | Antes de ingresar a la carrera | **20** |
| | En 1.er año | **20** |
| **Máximo** | | **100** |

Las dos opciones de inicio laboral de la inicial son inserción temprana, la de mayor riesgo según el ICE. Por eso valen lo mismo.

## Encuesta cuatrimestral (total 100)

| Bloque | Pregunta | Respuesta | Puntos |
|---|---|---|---:|
| Avance (30) | Créditos aprobados (avance curricular) | Según la tabla de avance | 0 a **30** |
| Cursada del cuatrimestre anterior (35) | ¿Qué materias cursó en el cuatrimestre anterior? | Ninguna (inactividad) | **35** |
| | | 1 materia | 10 |
| | | 2 materias | 5 |
| | | 3 o más | 0 |
| | ¿Es la primera vez que cursó esta materia? (por materia: se cuentan las materias con respuesta *No*, es decir, las que recursa) | Ninguna materia recursada | 0 |
| | | 1 materia recursada | 8 |
| | | 2 o más materias recursadas | **15** |
| | ¿Qué tan difícil resultó la materia? (por materia, de 1 a 5) | Promedio de las materias: (promedio − 1) × 2,5 | 0 a 10 |
| | | promedio 1 · 2 · 3 · 4 · 5 | 0 · 2,5 · 5 · 7,5 · 10 |
| Avance percibido (10) | ¿Cómo define su situación actual de avance en el cursado? | Al día | 0 |
| | | Demorado | 5 |
| | | Muy demorado | **10** |
| Situación laboral (15) | ¿Trabaja actualmente? | No | 0 |
| | | Sí | **5** |
| | ¿En qué momento de la carrera comenzó su actividad laboral? (solo si trabaja) | Antes de ingresar a la carrera | **10** |
| | | En 1.er año | **10** |
| | | En 2.º año | **10** |
| | | En 3.er año | 7 |
| | | En 4.º año | 7 |
| | | En 5.º año | 4 |
| | | Con solo el trabajo final pendiente | 4 |
| Proyecto Final (10) | ¿En qué estado se encuentra el Proyecto Final de Grado (PFG)? | No aplica por el nivel de la carrera | 0 |
| | | No iniciado | **10** |
| | | Tema propuesto sin avance | 7 |
| | | En desarrollo activo | 3 |
| | | Finalizado, pendiente de defensa | 0 |
| **Máximo** | | | **100** |

**Criterios**

- **Cursada:**
  - **No cursar ninguna materia** se toma como inactividad y es el peor caso del bloque: suma los 35 puntos completos, y como no hay materias, no se suman recursado ni dificultad.
  - **Con materias cursadas**, el bloque llega como mucho a 30: 2 materias, las dos recursadas y con dificultad 5.
  - **Excepción:** si el PFG está *En desarrollo activo* o *Finalizado, pendiente de defensa*, no cursar materias es esperable y no suma.
- **Recursado:** sigue el criterio del ICE. Una materia recursada suma la mitad y dos o más suman el máximo.
- **Inicio laboral:** sigue el factor del ICE. Empezar en 1.º o 2.º año (o antes) es el mayor riesgo, en 3.º o 4.º año es un 70 % y en el tramo final un 40 %. Trabajar suma 5 aunque no se sepa desde cuándo.
- **PFG:** sigue el ICE. Defendido o en la etapa final no suma, y frenado o sin iniciar suma el máximo.

## Ejemplos (respuestas del período 2026-2)

| Caso | Cálculo | Total | Semáforo |
|---|---|---:|---|
| Inicial · ingresó en 2026-2, sin materias aprobadas, no trabaja | Avance no se puntúa (T = 0) + 0 | **0** | Verde |
| Inicial · ingresó en 2026-1, 2 materias (10 créditos), trabaja desde 1.er año | T = 1, esperados 14, r = 0,71 → 35 · trabaja 10 · inicio 20 | **65** | Amarillo |
| Cuatrimestral · ingresó en 2025-1, 60 créditos, cursó 5 materias por primera vez con dificultad promedio 2, al día, no trabaja | T = 3, esperados 57, r = 1,05 → 0 · cursada 0 + 0 + 2,5 · 0 · 0 · PFG no aplica 0 | **3** | Verde |
| Cuatrimestral · ingresó en 2024-1, 34 créditos, cursó 4 materias (1 recursada; dificultad 4, 4, 3 y 2), demorado, trabaja desde 2.º año | T = 5, esperados 104, r = 0,33 → 30 · cursada 0 + 8 + 5,6 · 5 · 5 + 10 · 0 | **64** | Amarillo |
| Cuatrimestral · peor caso | Avance 30 · no cursó materias 35 · muy demorado 10 · trabaja desde 1.er año 15 · PFG no iniciado 10 | **100** | Rojo |

Estos ejemplos suponen el avance curricular activo. **Con el avance desactivado (lo vigente),** el índice se calcula sobre el máximo de la versión (probado en el simulador local el 2026-11-01):

| Caso | Puntos ÷ máximo | Índice | Semáforo |
|---|---|---:|---|
| Inicial · trabaja desde 1.er año | (10 + 20) ÷ 30 | **100** | Rojo |
| Inicial · no trabaja | 0 ÷ 30 | **0** | Verde |
| Cuatrimestral · PFG no iniciado, no trabaja, 2 materias (1 recursada; dificultad 4 y 2), demorado | (10 + 0 + 5 + 8 + 5 + 5) ÷ 70 | **47** | Amarillo |

En la Inicial, con el avance desactivado, solo puntúa la situación laboral: quien trabaja desde 1.er año llega al máximo. **Revisar con el equipo** si el índice de la Inicial tiene que esperar a que se reactive el avance.

## Cómo queda en las bases

En **Encuestas**, cada opción lleva sus puntos y las preguntas calculadas llevan su regla:

```json
{ "variable": "trabaja", "item_id": 8265, "pagina": 3, "tipo": "multichoice", "opciones": [{ "opcion": 1, "texto": "Si", "criticidad": 5 }, { "opcion": 2, "texto": "No", "criticidad": 0 }], "criticidad_max": 5 }
{ "variable": "materias_cuatrimestre", "item_id": 8768, "pagina": 5, "tipo": "textarea", "formato": "selector_materias", "criticidad_max": 35,
  "regla": { "nombre": "cursada", "activa": true, "cantidad": [35, 10, 5], "recursada": [8, 7], "dificultad_max": 10, "sin_inactividad": { "variable": "progreso_proyecto_final", "opciones": [4, 5] } } }
```

En **Respuestas**, solo lo respondido (`{ "item_id": 8265, "respuestas": [1] }`). En **Criticidad**, el resultado:

```json
{ "fuente": "respuestas", "rid_fuente": 102, "indice": 47, "indice_total": 50, "semaforo": "amarillo" }
```

- En la dificultad, cada materia aporta su parte del promedio: (dificultad − 1) × `dificultad_max` ÷ 4 ÷ cantidad de materias cursadas.
- En el recursado, la primera materia recursada suma `recursada[0]` (8), la segunda `recursada[1]` (7) y las demás 0.

## En las Encuestas de Moodle

Las preguntas de las tablas de arriba son las de las Encuestas de Moodle, con el texto en registro formal. Los puntos se asignan **por número de opción, en el orden de Moodle** (el número que guarda Respuestas). Por ejemplo, en el Proyecto Final: *No aplico por nivel* = 1.ª opción → 0; *No iniciado* = 2.ª → 10.

- **Inicial:** se aplica completa.
- **Cuatrimestral:** el bloque *Cursada del cuatrimestre anterior* (35 puntos) sale del selector de materias (ítem 8270), que guarda en la respuesta 8768 las materias cursadas con su primera vez y su dificultad. Desde el 2026-10-25 se aplica completa.

## Pendientes

- **Calibrar los valores** con el equipo. Son provisorios: los máximos de cada bloque siguen el orden de importancia del ICE (lo académico primero), pero no están validados con datos.
- **Período de cálculo:** T depende de cuándo se abre la encuesta cuatrimestral. Está pendiente la *ventana del período* (ver los [pendientes de la copia](../../specs/copia-encuestas.md#pendientes)).
- **PFG:** un estudiante de los primeros años que elige *No iniciado* en lugar de *No aplica* suma 10. Conviene mostrar la pregunta solo con el 70 % de los créditos aprobados (156 de 223), como propone el ICE.
- **Inicial y 1.er año:** desde Mi Trayectoria ([SCRUM-24](../../specs/vista-estudiante.md), local) la Encuesta Inicial se habilita desde 2.º año, así que la criticidad de 1.er año sale solo de las notas de parciales. La situación laboral de la Inicial (sus 30 puntos) y las dos opciones de inicio laboral ("antes de ingresar" y "en 1.er año") se pensaron para ingresantes: revisarlas con el equipo para quienes la responden desde 2.º año.
- **Avance percibido:** las opciones *Demorado* y *Muy demorado* tienen el mismo umbral (50 %) en la Encuesta de Moodle. Hay que corregir el texto para que los puntos signifiquen algo distinto.
