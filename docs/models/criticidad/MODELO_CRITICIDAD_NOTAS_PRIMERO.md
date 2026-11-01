# Índice de las notas de 1.er año

- **Estado:** provisorio. Es la fórmula que el equipo armó en Moodle para la Página "Dashboard Estudiantes de Primero" (cmid 60035, [`section/dashboard_estudiantes_primero`](../../../section/dashboard_estudiantes_primero/content.html)), que la calcula al abrirse y no la guarda. Se documenta el 2026-11-01 con el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md), que la usa para la base Criticidad.
- **Dónde se usa:** la tool `IndiceNotasPrimero` de la [biblioteca de Tools](../../../section/utils/tools/content.html), que llama `CriticidadNotas` cuando un estudiante guarda una nota en Carga_Parciales_Primero. Cada nota guardada agrega una entrada a Criticidad con `fuente = notas_1ro` y `rid_fuente` = la nota.
- **Datos:** las notas del estudiante en el período (Carga_Parciales_Primero, d=117) y la marca de materia crítica con su umbral (Carga_Materias_Primero, d=118).
- **Qué calcula:** un índice de **0 a 100**. 0 es sin señales de riesgo.

## Por materia: ICm

Primero se aplican los recuperatorios: una nota con `Recupera_a` reemplaza a la instancia que indica (por ejemplo, el Recuperatorio 1 reemplaza al Parcial 1).

| Factor | Cálculo | Peso |
|---|---|---:|
| FP · promedio | (10 − promedio de las instancias rendidas) ÷ 10; sin instancias rendidas, 1 | 35 % |
| FR · reprobación | 1 − aprobadas ÷ rendidas; sin instancias rendidas, 1 | 35 % |
| FA · ausentismo | ausentes ÷ instancias | 15 % |
| FAC · materia crítica | 1 si la materia es crítica y alguna nota está por debajo de su umbral (si no tiene umbral, 4) | 15 % |

**ICm** = (0,35 × FP + 0,35 × FR + 0,15 × FA + 0,15 × FAC) × 100, con un máximo de 100.

- Una instancia es **ausente** si su estado dice "Ausente" o no tiene nota.
- Está **aprobada** si su estado es "Aprobado".

## Por estudiante: ICG

**ICG** = 60 % del promedio de sus ICm + 40 % del ICm más alto, redondeado a entero. Es el `indice` de la entrada de Criticidad.

## Período

Cuentan las notas del período actual (`PERIODO_ACTUAL` en Tools). El período de una nota sale de su fecha: de enero a julio, `AAAA-1`; de agosto a diciembre, `AAAA-2`. **Es provisorio:**
- el Dashboard usa otro corte (el 1 de abril como inicio del 2.º cuatrimestre), que deja en el 2.º cuatrimestre los parciales de mayo y junio;
- hay que definirlo con la base Períodos.

## Ejemplos (datos de prueba de Carga_Parciales_Primero, leídos el 2026-11-01)

| Estudiante (ficticio) | Notas | ICm | Índice |
|---|---|---|---:|
| Ana Martínez · Álgebra I-B (crítica, umbral 6) | Parcial 1: 5,5; Parcial 2: ausente; Recuperatorio 1 del Parcial 1: 9 | FP 0,1 · FR 0 · FA 0,5 · FAC 0 → 11 | **11** |
| María Gómez · Análisis Matemático I (crítica, umbral 4,5) | Parcial 1: 2; Parcial 2: ausente | FP 0,8 · FR 1 · FA 0,5 · FAC 1 → 85,5 | **86** |

Los resultados coinciden con los del Dashboard, que redondea a un decimal.

## Pendientes

- **Validar la fórmula y los pesos** con el equipo: no tienen fundamento en `docs/context/research`. El requerimiento de 1.er año propone otro criterio (aprobación < 20 % rojo; de 20 % a 60 % amarillo).
- **Semáforo:** el Dashboard corta en 40 y 65; la base Criticidad usa 40 y 70 para el `indice_total`, igual que las encuestas.
- **Materias por nombre:** Carga_Parciales_Primero identifica la materia por su nombre ("Álgebra I- B"), y Materias y Respuestas, por su código. Para cruzarlas hace falta el código en las notas.
