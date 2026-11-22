# Especificación: Indicadores de Cohorte

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/indicadores_cohorte/content.html`
- **Acceso:** botón "Ver indicadores" de la tarjeta "Indicadores de Cohorte" del [menú inicial](../../section/menu_inicial/content.html)
- **Estado:** **publicada** el 2026-11-02 como Página "Indicadores de Cohorte" (cmid 60283) en la subsección Hub; republicada el 2026-11-18 con la pestaña *Abandono y egreso*. **Republicada el 2026-11-22:** sin el aviso de versión provisoria ni la pestaña *En revisión*, con todos los indicadores de datos disponibles calculados en Reportes y la criticidad explicada por fuente (ADR-010)
- **Requerimientos:** Seguimiento de Trayectoria, Cuellos de Botella e Inteligencia de Negocio (semáforos), más la configuración de indicadores por el equipo gestor
- **Última actualización:** 2026-11-22

---

## Propósito

Mostrar qué mide cada indicador del sistema, cómo se calcula, de dónde salen sus datos y en qué estado está. Explica las definiciones y los cálculos; los **valores por cohorte y por estudiante** se ven en [Reportes](reportes.md), en el informe que indica cada indicador (*Dónde se ve*).

Los indicadores que son difíciles o muy difíciles de calcular en Moodle quedan fuera y están explicados en [`INDICADORES_NO_IMPLEMENTADOS.md`](../models/INDICADORES_NO_IMPLEMENTADOS.md).

## Roles

| Rol | Puede |
|---|---|
| ADM, TUT | Ver toda la sección (es de solo lectura). GES se retiró el 2026-11-21 |
| PAR, EST | No acceden. Al estudiante no se le muestran los puntos de cada respuesta |

## Pestañas

1. **Resumen:** cuántos indicadores hay en cada estado, qué es una cohorte (año y cuatrimestre de ingreso) y el catálogo por bloque, con un enlace a cada indicador.
2. **Trayectoria:** avance curricular acumulado, e índice de ritmo (avance sobre lo esperado).
3. **Cuellos de botella:** materias críticas por correlativas, y dificultad y recursado por materia.
4. **Criticidad individual**, en cuatro subvistas:
   - **Semáforo y registro:** cómo se muestra cada fuente, los cortes 40 y 70, y qué evento escribe cada entrada de la base Criticidad;
   - **Encuesta Cuatrimestral:** los puntos de cada opción y cada regla de la versión 4, la fórmula del índice y una calculadora (la Encuesta Inicial se quitó el 2026-11-22: se borró del campus el 2026-11-14);
   - **Notas de 1.er año:** los factores del ICm, la fórmula del ICG, las materias críticas con su umbral y una calculadora;
   - **Por fuente y estado asignado:** parciales y Encuesta Cuatrimestral por separado y cuál es el estado calculado según el año de la carrera ([ADR-010](../decisions/010-criticidad-por-fuente.md)), un ejemplo con un integrante y datos ficticios, y las reglas del estado que asigna un tutor. Hasta el 2026-11-22 explicaba el índice total como promedio de notas y encuestas, que se dejó de usar con ADR-010.

La pestaña **En revisión** se quitó el 2026-11-22; sus puntos están en [Puntos abiertos](#puntos-abiertos).

Cada indicador muestra su fórmula, sus datos, su estado y la referencia bibliográfica o el modelo del que sale.

## Estados de un indicador

| Estado | Significado |
|---|---|
| En el Tablero | Se calcula al cargar cada nota o encuesta, se guarda en la base Criticidad y se ve en el Tablero de Criticidad y en el Detalle del estudiante (hasta el 2026-11-22 se llamaba *En uso*) |
| En Reportes | Se calcula al abrir en Reportes el informe que indica (*Dónde se ve*) |

El estado *Datos disponibles* se quitó el 2026-11-22: sus cuatro indicadores pasaron a Reportes (avance curricular e índice de ritmo en *Avance curricular*; materias críticas por correlativas, y dificultad y recursado en *Cuellos de botella*).

## Calculadoras

No guardan nada. Usan las mismas reglas que las tools de la Página Tools:

- **Encuestas:** las respuestas de opción múltiple y, en la Cuatrimestral, cantidad de materias cursadas, recursadas y dificultad promedio. El índice es puntos ÷ puntaje máximo de la versión × 100.
- **Notas de 1.er año:** nota y estado de cada instancia (Parcial 1, Parcial 2 y Recuperatorio, que reemplaza a la instancia que indica). Una instancia es ausente si su estado es "Ausente" o no tiene nota, y aprobada si su estado es "Aprobado". Redondea como `IndiceNotasPrimero`: el ICm a un decimal y el índice a entero. Con los ejemplos de [`MODELO_CRITICIDAD_NOTAS_PRIMERO`](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md) da 11 y 86.

## Datos

Por ahora los valores están **copiados en el código** y hay que actualizarlos a mano:

| Dato | Sale de | Leído el |
|---|---|---|
| Preguntas, opciones, puntos y reglas | Base Encuestas, Cuatrimestral v4 (la vigente), con los textos de la encuesta de Moodle | 2026-11-22 |
| Materias críticas y umbrales | CargaMateriasPrimero | 2026-11-22 |
| Cortes del semáforo y pesos del ICm y el ICG | Página Tools (v12) y modelo de las notas de 1.er año | 2026-11-22 |

Para publicarla, conviene leerlos en vivo: la base Encuestas y CargaMateriasPrimero con `LeerBase`, y los cortes desde Tools, que hoy no exporta `CORTES_SEMAFORO` (haría falta publicar una versión nueva de Tools).

## Pendientes

- **Leer los puntos y los cortes en vivo** en lugar de copiarlos.
- **Ubicación en el plan y tiempo en el Proyecto Final:** se quitaron del catálogo el 2026-11-22 por decisión del equipo, junto con el estado *En análisis*. La ubicación repetía el avance sobre lo esperado (en materias en lugar de créditos), y el tiempo en el Proyecto Final necesitaba un criterio que no se definió. Quedan en [Indicadores no implementados](../models/INDICADORES_NO_IMPLEMENTADOS.md).

## Puntos abiertos

Estaban en la pestaña *En revisión* hasta el 2026-11-22. Afectan al resultado y quedan para decisión del equipo o del DII:

- **Regla de avance de las encuestas desactivada:** la criticidad por avance curricular (créditos aprobados ÷ esperados) sigue apagada en la base Encuestas, y no cuenta en el puntaje máximo (70 en la Cuatrimestral). El avance sobre lo esperado ya se ve en el informe *Avance curricular* de Reportes, con los mismos créditos esperados.
- **Cortes distintos en otras vistas:** el Dashboard de 1.er año corta en 40 y 65, y el Detalle del estudiante en 40 y 80. La base Criticidad usa 40 y 70.
- **Fórmula de 1.er año sin validar:** los pesos del ICm y el ICG son una propuesta del equipo. El requerimiento propone otro criterio: aprobación menor al 20 % rojo; de 20 % a 60 % amarillo.
- **Texto del avance percibido:** «Demorado» y «Muy demorado» tienen el mismo umbral en la Encuesta Cuatrimestral (retraso mayor al 50 %). Se corrige con la Cuatrimestral v5, que además sube el avance percibido a 40 puntos y el máximo a 100; se carga al abrir el período siguiente (DEPLOY.md, punto 10), y ese día se actualiza esta Página.
- **Pregunta del PFG:** un estudiante de los primeros años que elige «No iniciado» suma 10. Se propone mostrarla solo con el 70 % de los créditos aprobados.
- **Tres criterios para 1.er año:** el Dashboard usa ICm e ICG, el Listado de 1.er año usa alertas por umbral y el requerimiento usa el porcentaje de aprobación.
- **Umbral de la permanencia terminal:** el 90 % de los créditos y los 10 cuatrimestres se usan como definición, pero falta que el DII los confirme ([modelo](../models/trayectoria/MODELO_ABANDONO_Y_EGRESO.md)).
