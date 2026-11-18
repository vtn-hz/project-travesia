# Modelo: Abandono y egreso

- **Qué calcula:** el estado de cada estudiante en cada período (activo, abandono o egresado) y, por cohorte, la retención de 1.er año, la permanencia por cuatrimestre (desgranamiento), la tasa de egreso, la duración de la carrera y la permanencia terminal, más la supervivencia académica de todas las cohortes juntas.
- **Dónde corre:** `TrayectoriaEstudiantes` de la Página Tools (versión 9). La usa el informe **Trayectoria y egreso** de [Reportes](../../specs/reportes.md). No guarda nada: se calcula cada vez que se abre el informe, hasta el período elegido.
- **Estado:** local, sin publicar (2026-11-17).
- **Origen:** reunión con el DII del 2026-11-17. Hasta entonces estos indicadores estaban en [Indicadores no implementados](../INDICADORES_NO_IMPLEMENTADOS.md), porque no había datos de ingresantes, abandono ni egreso.

## Definiciones (acordadas con el DII)

| Concepto | Definición | De dónde sale |
|---|---|---|
| **Ingresantes de una cohorte** | Los estudiantes que completaron la información personal con esa cohorte (año y cuatrimestre de ingreso). Los que no están en el sistema no cuentan | Base Estudiantes |
| **Actividad en un período** | Cargó al menos una nota de 1.er año o respondió la Encuesta Cuatrimestral en ese período | CargaParcialesPrimero (`Periodo`) y Respuestas (`periodo`) |
| **Abandono** | **N períodos cerrados seguidos sin actividad.** El estudiante cuenta como abandono desde el primero de esos períodos. Si después vuelve a tener actividad, deja de contar (queda como reincorporado) | N: campo `periodos_abandono` de la base Períodos, que se cambia en Configuración del Sistema. **4** (acordado con el DII; si ninguna entrada lo define, vale 4) |
| **Egreso** | Declarar en la Encuesta Cuatrimestral **todos los créditos del plan: 235,5** (las 52 materias del Plan 2024, 223 créditos, incluido el Proyecto de Ingeniería Industrial IV, más la PPS, 12,5). El período de egreso es el de la primera encuesta con 235,5 | Respuestas (`creditos_aprobados`). La encuesta final es obligatoria para el título |
| **Egreso y titulación** | Son lo mismo: el Proyecto de Ingeniería Industrial IV es el PFG y está dentro de los créditos | — |

## Qué períodos se observan

- **Solo los del sistema:** los de la base Períodos, desde el ingreso del estudiante hasta el período elegido. Antes del primer período del sistema no hay datos.
- **El período vigente no está cerrado:** su falta de actividad no cuenta para el abandono. Su actividad sí cuenta (un estudiante con actividad en el vigente no abandonó).
- **Las cohortes que ingresaron antes del primer período del sistema** (por ejemplo, 2022-1 si el sistema empezó en 2026-2) solo incluyen a quienes seguían cursando y cargaron su información personal. Su permanencia sale más alta que la real: el informe las marca como **parciales**.
- **Las cohortes que ingresan después del período elegido** todavía no son ingresantes.

## Indicadores

| Indicador | Cálculo |
|---|---|
| **Estado actual** | Egresado si declaró 235,5 créditos; abandono si los últimos N períodos cerrados no tuvieron actividad; si no, activo |
| **Retención de 1.er año** | Estudiantes de la cohorte que no abandonaron un año después del ingreso (cohorte + 2 períodos) ÷ ingresantes. Se calcula si ese período está en el sistema. Es **provisoria** hasta que pasan N períodos cerrados desde ahí, porque antes un abandono todavía no se ve |
| **Permanencia por cuatrimestre (desgranamiento)** | Para cada cuatrimestre k desde el ingreso: estudiantes de la cohorte que siguen (activos o egresados) ÷ ingresantes. La caída es el desgranamiento |
| **Supervivencia académica** | Kaplan-Meier con entrada tardía, con k = cuatrimestres desde el ingreso. Cada estudiante está en riesgo desde su primer período observado hasta que abandona (evento), egresa o termina el último período cerrado (censura). S(k) = Π (1 − abandonos en k ÷ en riesgo en k). El riesgo de abandono por período es abandonos ÷ en riesgo |
| **Tasa de egreso** | Egresados de la cohorte ÷ ingresantes |
| **Duración de la carrera** | Cuatrimestres desde el ingreso hasta el egreso, inclusive (10 teóricos, 5 años). El informe muestra el promedio por cohorte en años |
| **Permanencia terminal** | Activo, con el **90 % de los créditos o más** (212 de 235,5) y **más de 10 cuatrimestres** desde el ingreso. El 90 % es provisorio |
| **Reincorporados** | Tuvieron N períodos cerrados seguidos sin actividad y después volvieron |

## Ejemplo (datos de prueba de Reportes, períodos 2024-1 a 2026-2, N = 4)

| Estudiante (ficticio) | Cohorte | Actividad | Resultado |
|---|---|---|---|
| Gian Luca | 2023-2 | Ninguna | Abandono desde 2024-1 (de 2024-1 a 2026-1, 5 períodos cerrados sin actividad) |
| Luca | 2024-1 | 2025-2 y 2026-2 | Activo: nunca tuvo 4 períodos cerrados seguidos sin actividad (como mucho, 3: de 2024-1 a 2025-1) |
| Valentino | 2022-1 | Todos; 235,5 créditos en 2026-2 | Egresado en 2026-2, 10 cuatrimestres (5 años) |
| Nicolás y Santiago | 2026-1 | Notas en 2026-1 o 2026-2 | Activos; sin retención todavía (2027-1 no está en el sistema) |

## Pendientes

- **Tiempo en el Proyecto Final:** se puede aproximar con la pregunta del PFG de la Cuatrimestral; falta acordar desde qué respuesta se cuenta.
- **Umbral de la permanencia terminal** (90 % y 10 cuatrimestres): confirmar.
- **Los egresados que no responden la encuesta final** no aparecen como egresados: después de N períodos figurarían como abandono. La encuesta final es obligatoria para el título, así que no debería pasar.
