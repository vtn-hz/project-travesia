# Especificación: Indicadores de Cohorte

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/indicadores_cohorte/content.html`
- **Acceso:** tarjeta "Indicadores de Cohorte" del [menú inicial](../../section/menu_inicial/content.html) (en la vista previa local)
- **Estado:** versión provisoria, **solo en el repo**. No está publicada en Moodle
- **Requerimientos:** Seguimiento de Trayectoria, Cuellos de Botella e Inteligencia de Negocio (semáforos), más la configuración de indicadores por el equipo gestor
- **Última actualización:** 2026-11-02

---

## Propósito

Mostrar qué mide cada indicador del sistema, cómo se calcula, de dónde salen sus datos y en qué estado está. Esta versión explica las definiciones y los cálculos; todavía **no muestra valores por cohorte**.

Los indicadores que son difíciles o muy difíciles de calcular en Moodle quedan fuera y están explicados en [`INDICADORES_NO_IMPLEMENTADOS.md`](../models/INDICADORES_NO_IMPLEMENTADOS.md).

## Roles

| Rol | Puede |
|---|---|
| ADM, GES, TUT | Ver toda la sección (es de solo lectura) |
| PAR, EST | No acceden. Al estudiante no se le muestran los puntos de cada respuesta |

## Pestañas

1. **Resumen:** cuántos indicadores hay en cada estado, qué es una cohorte (año y cuatrimestre de ingreso) y el catálogo por bloque, con un enlace a cada indicador.
2. **Trayectoria:** avance curricular acumulado, índice de ritmo y ubicación en el plan.
3. **Cuellos de botella:** materias críticas por correlativas, y dificultad y recursado por materia.
4. **Criticidad individual**, en cuatro subvistas:
   - **Semáforo y registro:** cómo se combinan las fuentes, los cortes 40 y 70, y qué evento escribe cada entrada de la base Criticidad;
   - **Encuestas:** los puntos de cada opción y cada regla de la Encuesta Inicial y la Cuatrimestral, la fórmula del índice y una calculadora;
   - **Notas de 1.er año:** los factores del ICm, la fórmula del ICG, las materias críticas con su umbral y una calculadora;
   - **Índice total y estado asignado:** cómo se promedian notas y encuestas, un ejemplo con un integrante y datos ficticios, y las reglas del estado que asigna un tutor.
5. **En revisión:** los puntos abiertos que cambian los resultados.

Cada indicador muestra su fórmula, sus datos, su estado y la referencia bibliográfica o el modelo del que sale.

## Estados de un indicador

| Estado | Significado |
|---|---|
| En uso | Se calcula hoy en Moodle y se guarda en la base Criticidad |
| Datos disponibles | Los datos ya se guardan en Moodle; falta la vista que lo calcule |
| En análisis | Está definido, pero tiene una decisión abierta del equipo |

## Calculadoras

No guardan nada. Usan las mismas reglas que las tools de la Página Tools:

- **Encuestas:** las respuestas de opción múltiple y, en la Cuatrimestral, cantidad de materias cursadas, recursadas y dificultad promedio. El índice es puntos ÷ puntaje máximo de la versión × 100.
- **Notas de 1.er año:** nota y estado de cada instancia (Parcial 1, Parcial 2 y Recuperatorio, que reemplaza a la instancia que indica). Una instancia es ausente si su estado es "Ausente" o no tiene nota, y aprobada si su estado es "Aprobado". Redondea como `IndiceNotasPrimero`: el ICm a un decimal y el índice a entero. Con los ejemplos de [`MODELO_CRITICIDAD_NOTAS_PRIMERO`](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md) da 11 y 86.

## Datos

Por ahora los valores están **copiados en el código** y hay que actualizarlos a mano:

| Dato | Sale de | Leído el |
|---|---|---|
| Preguntas, opciones, puntos y reglas | Base Encuestas, versiones vigentes (Inicial 2 y Cuatrimestral 3) | 2026-11-01 |
| Materias críticas y umbrales | CargaMateriasPrimero | 2026-11-01 |
| Cortes del semáforo y pesos del ICm y el ICG | Página Tools v5 y modelo de las notas de 1.er año | 2026-11-02 |

Para publicarla, conviene leerlos en vivo: la base Encuestas y CargaMateriasPrimero con `LeerBase`, y los cortes desde Tools, que hoy no exporta `CORTES_SEMAFORO` (haría falta publicar una versión nueva de Tools).

## Pendientes

- **Texto de la tarjeta del Hub:** promete retención, desgranamiento, egreso y duración real, que quedaron fuera. Antes de publicar hay que cambiarlo (propuesta en [`INDICADORES_NO_IMPLEMENTADOS.md`](../models/INDICADORES_NO_IMPLEMENTADOS.md#consecuencia-para-el-hub)).
- **Valores por cohorte:** calcular los indicadores con datos disponibles (avance curricular, materias críticas por correlativas, dificultad y recursado) a partir de las bases Respuestas, Materias y Criticidad.
- **Leer los puntos y los cortes en vivo** en lugar de copiarlos.
- **Publicar** en la subsección Hub, con confirmación ([`RULES.md`](../../RULES.md), regla 3), y conectar la tarjeta en `DESTINOS_MOODLE` del menú.
- **Detección de roles** en Moodle, por grupos.
