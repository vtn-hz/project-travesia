# ADR-010: Criticidad por fuente, sin índice total combinado

- **Estado:** aceptada (2026-11-17). **Publicados el 2026-11-17:** el Tablero de Criticidad (60287), Tools v8 (59941) y el Detalle del estudiante (60288). **En local, sin publicar:** la Página Configuración del Sistema
- **Fecha:** 2026-11-17
- **Pedido:** Valentino Hernández Pascual: "la encuesta cuatrimestral ahora no llega más nunca a 100 de criticidad en la tabla de criticidad". Eligió la opción B: mostrar en la tabla la criticidad de los parciales y la de la Cuatrimestral por separado
- **Refs:** [ADR-007](007-encuestas-respuestas-y-criticidad.md) (`indice_total`), [ADR-008](008-encuesta-inicial-y-datos-personales.md) (parciales de 1.er año también desde 2.º año), [ADR-009](009-cierre-de-periodo-y-omision.md) (período anterior), [spec del tablero](../specs/tablero-estudiantes.md), [spec del detalle](../specs/detalle-estudiante.md)

## Contexto

Revisión del campus en modo lectura el 2026-11-17: la base Criticidad tiene 18 entradas, todas de 2026-2.

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **El `indice` de la Cuatrimestral sí llega a 100.** Con el avance curricular desactivado, la versión 4 suma como mucho 70 puntos y el índice se lleva a 0–100 sobre ese máximo (puntos ÷ 70 × 100). La peor combinación (no cursó, muy demorado, trabaja desde 1.er año, PFG no iniciado) da 100 | Base Encuestas, rid 20530 (`puntaje_maximo = 70`) |
| 2 | **Lo que no llega a 100 es el `indice_total`.** Promedia el último índice de las notas y el de las encuestas del período. Desde [SCRUM-27](https://zhakyz.atlassian.net/browse/SCRUM-27), los estudiantes de 2.º año en adelante también cargan parciales de 1.er año, así que su Cuatrimestral queda promediada con sus notas | Valentino: Cuatrimestral 63 y notas 14 → total 39 (rid 20534). Luca: 50 y 10 → 30 (rid 20290) |
| 3 | **La Encuesta Inicial ya no influye.** Se borró del campus el 2026-11-14 con sus entradas. Lo único que dependía de ella era el año de ingreso para el avance curricular, que sigue desactivado (hoy ese dato está en la base Estudiantes) | ADR-008 |
| 4 | **El Tablero y el Detalle no usan `indice_total`.** El calculado de 2.º año en adelante ya era el `indice` de la última Cuatrimestral; las notas de 1.er año de esos estudiantes no se veían en el tablero | `CriticidadEstudiante` (Tools v7) |

## Decisión

**Opción B:** cada fuente se muestra por separado y no se combinan.

| Tema | Decisión |
|---|---|
| Fuentes | **Parciales** (`notas_1ro` y `materias`) y **Encuesta Cuatrimestral** (`respuestas` de la Cuatrimestral, u `omision`). De cada una, la última entrada automática del período, con su índice y su semáforo |
| Tablero | Dos columnas, *Parciales* y *Encuesta* (la Cuatrimestral), en lugar de *Criticidad calculada*. En 1.er año, la columna Encuesta muestra "Desde 2.º año". El CSV y el diálogo de asignar estado muestran las dos |
| Detalle | El resumen pasa a tener una tarjeta por fuente (índice, semáforo y fecha) y el estado asignado. La fuente del año de la carrera dice "estado calculado" |
| Estado calculado y vigente | **No cambian:** el calculado es la fuente del año de la carrera (parciales en 1.er año, Cuatrimestral desde 2.º), y el vigente es el asignado o, si no hay, el calculado. Lo usan el orden, los indicadores y los filtros del tablero, y Reportes |
| Período anterior | Solo la fuente del año de la carrera toma la entrada del período anterior si no hay del vigente ([ADR-009](009-cierre-de-periodo-y-omision.md)). La otra cuenta solo en el período: las notas de 1.er año de un estudiante de 2.º año no se arrastran al período siguiente |
| `indice_total` | Desde Tools v8 es **el índice de la propia entrada** y su semáforo es el de la entrada. El campo se conserva para no cambiar la base. Las entradas guardadas antes conservan su promedio: el historial no se recalcula |

### Por qué B

| | A. El peor de los dos | **B. Por separado** | C. Promedio (hasta v7) |
|---|---|---|---|
| Una Cuatrimestral de 100 se ve como 100 | Sí | **Sí** | No (con notas de 10, queda en 55) |
| Las notas de 1.er año de 2.º año en adelante se ven | Sí, dentro del calculado | **Sí, en su columna** | Solo dentro del promedio |
| Un número para ordenar el tablero | El máximo | **El de la fuente del año de la carrera** (sin cambios) | El promedio |
| Fórmula nueva para validar | Una (el máximo) | **Ninguna** | — |

El equipo eligió B el 2026-11-17: es la que menos cambia y el tutor ve las dos señales sin que una tape a la otra. El costo de cálculo es el mismo en las tres; lo que pesa es leer la base Criticidad, igual en todas.

## Consecuencias

**A favor**
- La Cuatrimestral se ve con su índice real, de 0 a 100, en la base Criticidad, el Tablero y el Detalle.
- Quien recursa materias de 1.er año en 2.º año o más tiene esa señal a la vista, sin que cambie su estado calculado.
- Sin bases ni campos nuevos.

**En contra**
- **El estado calculado de 2.º año en adelante no mira los parciales.** Alguien con parciales en rojo y una Cuatrimestral en verde queda en verde: el tutor lo ve en la columna y puede asignar un estado. Si se quiere que cuente, la opción A (el peor de los dos) cambia una línea en `CriticidadEstudiante` y en las dos Páginas.
- **`indice_total` cambia de significado sin cambiar de nombre.** Las entradas hasta Tools v7 tienen el promedio; desde la v8, el índice de la entrada. Nadie lo lee para mostrar el calculado (hallazgo 4), pero un reporte que lo use tiene que saberlo.
- **Tres copias de la misma regla:** `CriticidadEstudiante` de Tools, el Tablero y el Detalle. Se cambiaron juntas; el Tablero y el Detalle no cargan Tools en la vista previa local.

## Publicación

Pendiente, con la skill `publicar-seccion` y confirmación de cada paso: Tools v8 primero (la usan la copia de las encuestas y la carga de notas), después la Configuración del Sistema, el Tablero y el Detalle. Reportes no cambia: sigue usando el calculado de `CriticidadEstudiante`, que da lo mismo que en la v7.
