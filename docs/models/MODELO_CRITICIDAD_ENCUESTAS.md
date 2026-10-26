# Puntaje de criticidad de las encuestas

- **Estado:** propuesta, con **valores provisorios** para que el equipo los ajuste.
- **Alcance:** solo el **Plan 2024** (223 créditos en 10 cuatrimestres). El Plan 2003 queda afuera ([`RULES.md`](../../RULES.md) → *Alcance*).
- **Dónde se usa:** el [script de copia](../specs/copia-encuestas.md) de las Encuestas de Moodle ([ADR-006](../decisions/006-versionado-de-encuestas.md)), que calcula el puntaje al enviar.
- **Qué calcula:** un puntaje de **0 a 100** para cada versión guardada de una encuesta.
  - **0** significa sin señales de riesgo.
  - **100** es la combinación de respuestas más crítica posible.
- **Cómo se guarda:** cada respuesta del JSON lleva su `criticidad` (los puntos que aporta) y la base Respuestas guarda el total en `puntaje_criticidad`.
  - El puntaje se calcula al enviar y no se recalcula después. Si cambian los valores, las versiones viejas conservan el suyo.
  - **El estudiante no lo ve.**

## Cómo se arma

- **Cada encuesta reparte 100 puntos entre sus preguntas.** La peor respuesta de cada pregunta suma el máximo de esa pregunta, y la suma de todos los máximos es 100.
- **Preguntas que no suman puntos:** año y cuatrimestre de ingreso, y materias aprobadas. Se usan para calcular el avance curricular, que va en *Créditos aprobados*.
- **Redondeo:** el total se redondea al entero más cercano.

### Semáforo (mismos cortes que el [ICE](MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md#3-semáforo-de-criticidad))

| Puntaje | Semáforo |
|---|---|
| 0 a 39 | Verde: riesgo bajo |
| 40 a 69 | Amarillo: riesgo moderado |
| 70 a 100 | Rojo: criticidad alta |

## Avance curricular (lo usan las dos encuestas)

> **En análisis (2026-10-26).** El cálculo está desactivado en el [script de copia](../../section/utils/tools/content.html) (comentado, sin borrar) mientras el equipo lo revisa porque es complejo. `creditos_aprobados` se sigue copiando, pero con `criticidad: null`. Mientras tanto, el puntaje máximo alcanzable es **30** en la inicial y **70** en la cuatrimestral, así que los cortes del semáforo no son comparables con los de esta propuesta.

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

## Cómo queda en el JSON

Cada respuesta lleva los puntos que aporta. Las que no suman llevan `null`, y la suma de todas es `puntaje_criticidad`.

```json
{ "variable": "creditos_aprobados", "pregunta": "Créditos aprobados", "respuesta": 34, "criticidad": 30 }
{ "variable": "materias_cursadas", "pregunta": "¿Qué materias cursó en el cuatrimestre anterior?", "respuesta": ["ING8408", "INGF103", "INGM103", "INGM108"], "criticidad": 0 }
{ "variable": "primera_vez", "pregunta": "¿Es la primera vez que cursó esta materia?", "materia": "INGM108", "respuesta": "No", "criticidad": 8 }
{ "variable": "dificultad", "pregunta": "¿Qué tan difícil resultó la materia?", "materia": "INGM103", "respuesta": 4, "criticidad": 1.9 }
```

En la dificultad, cada materia aporta su parte del promedio: (dificultad − 1) × 2,5 ÷ cantidad de materias cursadas.

En el recursado, los puntos se reparten entre las respuestas *No* para que la suma dé el total de la tabla: la primera lleva 8, la segunda 7 y las demás 0. Con una materia recursada el total es 8; con dos o más, 15.

## En las Encuestas de Moodle

Las preguntas de las tablas de arriba son las de las Encuestas de Moodle, con el texto en registro formal. El script de copia asigna los puntos **por número de opción, en el orden de Moodle** (por ejemplo, en el Proyecto Final: *No aplico por nivel* = 1.ª opción → 0; *No iniciado* = 2.ª → 10).

- **Inicial:** se aplica completa.
- **Cuatrimestral:** el bloque *Cursada del cuatrimestre anterior* (35 puntos) sale del selector de materias (ítem 8270), que guarda en la respuesta 8768 las materias cursadas con su primera vez y su dificultad. Desde el 2026-10-25 se aplica completa.

## Pendientes

- **Calibrar los valores** con el equipo. Son provisorios: los máximos de cada bloque siguen el orden de importancia del ICE (lo académico primero), pero no están validados con datos.
- **Período de cálculo:** T depende de cuándo se abre la encuesta cuatrimestral. Está pendiente la *ventana del período* (ver los [pendientes de la copia](../specs/copia-encuestas.md#pendientes)).
- **PFG:** un estudiante de los primeros años que elige *No iniciado* en lugar de *No aplica* suma 10. Conviene mostrar la pregunta solo con el 70 % de los créditos aprobados (156 de 223), como propone el ICE.
- **Avance percibido:** las opciones *Demorado* y *Muy demorado* tienen el mismo umbral (50 %) en la Encuesta de Moodle. Hay que corregir el texto para que los puntos signifiquen algo distinto.
