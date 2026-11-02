# Indicadores no implementados

Indicadores del [documento de trayectoria y terminalidad](../context/research/INDICADORES_TRAYECTORIA_TERMINALIDAD.md) y de los requerimientos v1.1 que quedan **fuera de la sección [Indicadores de Cohorte](../../section/indicadores_cohorte/content.html)** ([spec](../specs/indicadores-cohorte.md)) porque, con las limitaciones actuales, son difíciles o muy difíciles de calcular en el campus. Revisado el 2026-11-02.

## Limitaciones de las que parten

1. **No hay servidor ni tareas programadas.** Todo lo calcula el navegador de quien abre la página. Nada se ejecuta solo al cerrar un período: alguien del equipo tiene que apretar un botón.
2. **Leer es descargar HTML.** Una base de Moodle se lee pidiendo sus páginas de listado y recorriendo el HTML (`LeerBase`). Cuantas más entradas, más pedidos y más lento. Es la pregunta abierta del [ADR-005](../decisions/005-modelo-de-bases-moodle.md): la base Criticidad suma entre 3.000 y 4.500 entradas por cuatrimestre.
3. **Solo hay datos que cargan los propios estudiantes:** sus notas de 1.er año y sus encuestas. No hay acceso al sistema académico de la Facultad (ingresantes, egresos, titulaciones).
4. **Quien abandona desaparece.** Un estudiante que deja la carrera deja de cargar notas y de responder encuestas, así que no queda ningún registro de que se fue.
5. **La importación de Moodle no ejecuta nuestro código.** Se puede subir un CSV a una base, pero `import.php` no corre la plantilla JavaScript, así que no calcula ni guarda criticidad.
6. **Sin librerías.** Las secciones son HTML autocontenido con JavaScript puro: no se puede usar una librería estadística.

## Muy difíciles

### Supervivencia académica y riesgo de abandono por período

- **Qué pide:** la probabilidad de seguir activo en cada cuatrimestre (Kaplan-Meier) y el riesgo de abandono por período con un modelo de Cox en tiempo discreto (Castaño et al., 2004 y 2006; Paz, 2022).
- **Por qué es muy difícil:**
  - el modelo de Cox requiere un ajuste estadístico iterativo (máxima verosimilitud) que habría que programar a mano, sin librerías (limitación 6);
  - necesita varios años de historial por cohorte y leerlo todo de una vez (limitación 2);
  - el evento "abandono" no se registra: solo se ve que el estudiante dejó de aparecer (limitación 4), y no se distingue de quien dejó de responder pero sigue cursando.
- **Lo que sí se podría:** una curva de Kaplan-Meier simple, más adelante, con un resumen por cohorte guardado al cerrar cada período.

### Retención de 1.er año

- **Qué pide:** estudiantes de la cohorte que siguen en 2.º año ÷ ingresantes de la cohorte.
- **Por qué es muy difícil:** el denominador, los ingresantes, sale del sistema de ingreso de la Facultad, que no está en Moodle (limitación 3). Contar como ingresantes a quienes cargan notas deja afuera justamente a los que abandonan sin cargar nada (limitación 4), y el indicador sale mejor de lo que es.
- **Lo que haría falta:** la lista de ingresantes de cada cohorte, importada a una base y con un recálculo manual (limitación 5).

### Tasa de egreso por cohorte

- **Qué pide:** egresados de la cohorte ÷ ingresantes de la misma cohorte, con una base individualizada por estudiante (Estigarribia Barreto y Recalde, 2024).
- **Por qué es muy difícil:** faltan los dos datos, los ingresantes y la fecha de egreso (limitación 3). Un estudiante que egresa deja de responder encuestas, así que tampoco se puede deducir desde el campus.

### Egreso frente a titulación

- **Qué pide:** egresados ÷ ingresantes y titulados ÷ ingresantes, por separado (Pérez González, 2006).
- **Por qué es muy difícil:** además de lo anterior, la titulación (defensa o trámite final) no se registra en ningún lugar del campus.

### Duración real frente a teórica

- **Qué pide:** cuatrimestres desde el ingreso hasta el egreso, comparados con los 10 del plan.
- **Por qué es muy difícil:** sin la fecha de egreso no hay final del intervalo (limitación 3).

## Difíciles

### Desgranamiento cuatrimestral

- **Qué pide:** la caída de estudiantes activos de cada cohorte, cuatrimestre a cuatrimestre.
- **Por qué es difícil:**
  - hay que leer la actividad de todos los estudiantes en todos los períodos (limitación 2);
  - "activo" solo puede significar "cargó algo en el sistema", y la caída mezcla abandonos con estudiantes que dejaron de usar el campus (limitación 4);
  - sin la lista de ingresantes, el punto de partida de cada cohorte es incierto (limitación 3).
- **Lo que haría falta:** un resumen por cohorte y período guardado al cerrar cada cuatrimestre, en lugar de recalcularlo al abrir la página.

### Permanencia terminal

- **Qué pide:** estudiantes con mucho avance que no completan los requisitos finales.
- **Por qué es difícil:** el documento no fija qué es "mucho avance", y los estudiantes del tramo final son los que menos responden la encuesta cuatrimestral (limitación 4). Sin el egreso (limitación 3) no se distingue a quien terminó de quien quedó trabado.

### Tiempo desde el fin de la cursada hasta el Proyecto Final

- **Qué pide:** el tiempo entre la última materia y la aprobación del Proyecto Final de Grado. Es la vacancia más clara de la bibliografía (Morcela, 2023).
- **Por qué es difícil:**
  - necesita seguir a cada estudiante durante años (limitación 2);
  - la pregunta del Proyecto Final de la Encuesta Cuatrimestral no tiene la opción "Aprobado", así que el intervalo nunca se cierra;
  - quien aprueba el Proyecto Final deja de responder (limitación 4).

### Inactividad del modelo de Ubicación y atraso

- **Qué pide:** los cierres seguidos sin actividad del estudiante, contando solo los cierres en los que podía registrar actividad.
- **Por qué es difícil:** hay que saber, para cada estudiante y cada cierre, si tenía la encuesta disponible o notas para cargar, y alguien tiene que cerrar cada período (limitación 1). El resto del modelo de ubicación (cuatrimestre equivalente, diferencia y pendientes) sí queda en la vista.

## Qué queda en la vista

| Bloque | Indicadores |
|---|---|
| Seguimiento de trayectoria | Avance curricular acumulado, índice de ritmo, ubicación en el plan (sin la inactividad) |
| Cuellos de botella | Materias críticas por correlativas, dificultad y recursado por materia |
| Criticidad individual | Índice de las encuestas, índice de las notas de 1.er año, índice total y semáforo |

## Consecuencia para el Hub

La tarjeta "Indicadores de Cohorte" promete *retención, desgranamiento, índice de ritmo, egreso, duración real y materias críticas*. Con este recorte, cuatro de esos seis quedan fuera. Si la vista se publica así, el texto de la tarjeta tiene que cambiar, por ejemplo: "Avance curricular, índice de ritmo, ubicación en el plan, materias críticas y criterios de criticidad".

## Qué destrabaría los "muy difíciles"

Una sola decisión con el DII: **obtener del sistema académico, una vez por cuatrimestre, la lista de ingresantes y las fechas de egreso y titulación**, e importarla a una base de Zhakyz. Con eso, retención, egreso, egreso frente a titulación y duración pasan a ser cálculos simples sobre un resumen por cohorte.
