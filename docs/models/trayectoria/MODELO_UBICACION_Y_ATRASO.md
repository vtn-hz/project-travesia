# Propuesta para ubicar al alumno y describir su atraso

SCRUM-13 · Versión fusionada del 13 de octubre de 2026. Toma como base la propuesta del 12 de octubre y suma tres aportes de la revisión: el indicador de inactividad, la antigüedad de la deuda más vieja y la conexión con el mapa de correlativas.

## La idea

Queremos responder tres preguntas al cierre de cada cuatrimestre:

1. **¿En qué cuatrimestre del plan se ubica su avance?** Lo estimamos a partir de las materias aprobadas.
2. **¿Cómo viene respecto del tiempo desde que ingresó?** Comparamos ese avance con el recorrido nominal y mostramos qué materias anteriores siguen pendientes.
3. **¿Sigue activo?** Contamos cuántos cierres seguidos pasaron sin actividad registrada.

El resultado es un **cuatrimestre equivalente por aprobaciones**. Un alumno puede cursar materias de distintos años, así que este número no afirma qué está cursando actualmente.

Ejemplo de salida:

> Al cierre de 2026-2 lleva seis cuatrimestres desde el ingreso y tiene siete materias aprobadas. Su avance equivale a dos cuatrimestres completos: se ubica al comienzo del tercer cuatrimestre del plan. La diferencia con el recorrido nominal es de cuatro cuatrimestres equivalentes. Su pendiente más antigua es del tercer cuatrimestre, vencida hace tres. Registró actividad en este cierre.

Usamos los datos del modelo 0.2, sin agregar campos en esta primera versión.

## Datos que necesitamos

- Año y cuatrimestre de ingreso.
- Período y fecha del cierre evaluado.
- Condición de las materias: aprobada, habilitada, desaprobada, etc.
- Ubicación nominal de las materias y duración del plan.
- Eventos de actividad por cierre: encuesta respondida, cursada informada, nota o ausencia cargada, aprobación.

Las condiciones pueden venir de encuestas o de registros académicos disponibles. La encuesta inicial toma los antecedentes de primero, sin inventar cuándo cursó esas materias.

Reglas para contar las aprobaciones:

- Una aprobación por promoción, final o equivalencia reconocida se cuenta **una sola vez**.
- Una habilitación o un parcial aprobado no equivalen a aprobar la materia.
- Los datos sin informar no se toman como desaprobaciones.
- Las contradicciones entre fuentes quedan para revisión.

## Paso 1. Tiempo desde el ingreso

Llamamos **T** a los cuatrimestres transcurridos hasta el cierre, incluyendo el período que terminó:

```text
T = 2 × (año del cierre − año de ingreso)
    + cuatrimestre del cierre − cuatrimestre de ingreso + 1
```

Al cierre de 2026-2:

| Ingreso | T |
|---|---:|
| 2025-1 | 4 |
| 2025-2 | 3 |
| 2024-1 | 6 |

Así contemplamos los ingresos de marzo y de agosto. Evaluamos el cierre informado, no la fecha en que alguien consulta el panel.

## Paso 2. Cuatrimestre equivalente

Llamamos **N** al total de materias aprobadas y lo comparamos con la carga acumulada del plan:

| Cuatrimestre completo | Aprobaciones esperadas | Cuatrimestre completo | Aprobaciones esperadas |
|---|---:|---|---:|
| 1 | 3 | 6 | 31 |
| 2 | 7 | 7 | 36 |
| 3 | 12 | 8 | 42 |
| 4 | 18 | 9 | 46 |
| 5 | 24 | 10 | 52 |

Criterios de la tabla:

- Cada espacio de asignatura pesa lo mismo.
- Incluimos Inglés, electivas y optativas.
- Los proyectos anuales suman una sola aprobación y se esperan al terminar sus pares 3–4, 5–6, 7–8 y 9–10.

La tabla anterior corresponde al **Plan 2024**. Para los alumnos del **Plan 2003** se usa esta:

| Cuatrimestre completo | Aprobaciones esperadas | Cuatrimestre completo | Aprobaciones esperadas |
|---|---:|---|---:|
| 1 | 3 | 6 | 27 |
| 2 | 7 | 7 | 32 |
| 3 | 12 | 8 | 35 |
| 4 | 17 | 9 | 38 |
| 5 | 22 | 10 | 43 |

Criterios de la tabla del Plan 2003:

- Cada espacio de asignatura pesa lo mismo, igual que en el Plan 2024.
- Introducción a la Ingeniería (RA8) no tiene créditos y se toma como requisito de ingreso, como INGRA01 en el Plan 2024.
- Inglés no cuenta: en este plan es un requisito (IV Nivel del Laboratorio de Idiomas), igual que la PPS y el Seminario de Comunicación Eficaz.
- Las optativas (16 créditos) no tienen cantidad de materias ni ubicación fija, así que no entran en la tabla ni en N.
- El Trabajo Final cuenta como un espacio del cuatrimestre 10. Su correlativa es tener 35 asignaturas aprobadas, que coincide con lo esperado al cierre del cuatrimestre 8.

En este plan el total es 43, así que en las fórmulas de abajo el 52 se reemplaza por 43.

El **avance equivalente A** reconoce también lo aprobado entre dos umbrales:

- Con 7 aprobadas, A = 2: dos cuatrimestres completos de carga.
- Con 8 aprobadas, A = 2,20: dos completos y una quinta parte de la carga del siguiente, que tiene cinco materias.
- Con 51 aprobadas, A = 9,83: cerca de completar los diez en cantidad de asignaturas.

La ubicación es el cuatrimestre siguiente a los completos: con A = 2 o A = 2,20, el alumno está en el **tercer cuatrimestre equivalente**. Con 52 aprobaciones informamos "52 espacios completados", sin inventar un cuatrimestre once ni certificar egreso.

Para implementar el cálculo, con B(0) = 0 y B igual a la tabla acumulada:

```text
k = mayor cuatrimestre completo para el que B(k) ≤ N
A = k + (N − B(k)) / (B(k+1) − B(k))    si N < 52
A = 10                                 si N = 52

Cuatrimestre equivalente = parte entera de A + 1    si N < 52
```

Se redondea solo para mostrar. Es una equivalencia por cantidad: no mide créditos, esfuerzo ni tiempo restante hasta recibirse. Además funciona aunque solo se conozca **cuántas** materias aprobó y no cuáles.

## Paso 3. Diferencia con el recorrido nominal

Mostramos dos datos separados:

```text
Diferencia de avance = máximo(0, mínimo(T, 10) − A)
Períodos adicionales al plan = máximo(0, T − 10)
```

- **La diferencia de avance** indica la carga equivalente que falta para alcanzar lo esperado al cierre. Cero significa que alcanza o supera el volumen esperado, pero no asegura que tenga todas las materias anteriores aprobadas. Eso lo muestra el paso 4.
- **Los períodos adicionales** indican cuánto tiempo lleva después de los diez cuatrimestres nominales. Con T = 12 y A = 9,83, la diferencia es 0,17 y lleva dos períodos adicionales. No predice cuánto tardará en recibirse.

## Paso 4. Pendientes anteriores y antigüedad de la deuda

La **lista de pendientes anteriores** reúne las materias que deberían estar aprobadas al cierre y cuya condición conocida indica que todavía no lo están. Para las anuales usamos el cuatrimestre de finalización.

```text
Pendientes anteriores = { m sin aprobar : fin(m) ≤ mínimo(T, 10) }
Antigüedad de la deuda = T − fin(m más vieja de la lista)
```

La lista es necesaria porque la diferencia de avance cuenta cantidad. Un alumno puede aprobar electivas o materias adelantadas, llegar a diferencia cero y seguir debiendo básicas. La lista evita que esa deuda quede oculta.

La **antigüedad** resume la lista en un número: cuántos cuatrimestres pasaron desde que venció la pendiente más vieja. Por ejemplo, deber una materia del primer cuatrimestre en el sexto da una antigüedad de 5.

Si faltan condiciones, señalamos qué no puede determinarse en lugar de darlo por pendiente.

## Paso 5. Inactividad

Llamamos **inactividad** a la cantidad de cierres seguidos, hasta el evaluado, sin actividad registrada:

```text
Inactividad = T − T del último cierre con actividad
```

Cuenta como actividad cualquier evento del alumno en ese cierre: encuesta respondida, cursada informada, nota o ausencia cargada, o una aprobación. Si hubo actividad en el cierre evaluado, la inactividad es 0.

Es necesaria porque los pasos anteriores no distinguen a quien sigue cursando de quien dejó. Dos alumnos de la misma cohorte con las mismas aprobaciones dan el mismo T, el mismo A, la misma diferencia y la misma lista. Lo único que los separa es hace cuánto no hay noticias de ellos, y esa es justamente la deserción que el sistema tiene que detectar.

Para no confundir falta de datos con abandono:

- Solo cuentan los cierres en los que había forma de registrar actividad. Si a ese alumno no se le envió encuesta y no hubo carga de registros para sus materias, ese cierre no suma.
- Tras el egreso académico confirmado, la inactividad deja de aumentar.

## Ejemplos para discutir

Todos toman el cierre de 2026-2 y datos completos ficticios. Los cuatrimestres de la tabla son del plan, no años de la carrera.

| Caso | T | N | A | Cuat. equivalente | Diferencia | Deuda más vieja | Inactividad |
|---|---:|---:|---:|---|---:|---|---:|
| Al día en cantidad | 3 | 12 | 3 | Cuarto | 0 | Ninguna | 0 |
| Debe primero y cursó materias de segundo | 3 | 6 | 1,75 | Segundo | 1,25 | Química (cuat. 1), antigüedad 2 | 0 |
| Avance menor al nominal | 6 | 7 | 2 | Tercero | 4 | Cuat. 3, antigüedad 3 | 0 |
| Aprobaciones fuera de orden | 4 | 18 | 4 | Quinto | 0 | Inglés I (cuat. 3), antigüedad 1 | 0 |
| Casi completa, activo | 12 | 51 | 9,83 | Décimo | 0,17 (+2 períodos) | Proyecto IV (fin cuat. 10), antigüedad 2 | 0 |
| Casi completa, sin actividad | 12 | 51 | 9,83 | Décimo | 0,17 (+2 períodos) | Proyecto IV (fin cuat. 10), antigüedad 2 | 2 |

**Al día en cantidad:** ingresó en 2025-2. Aprobó las siete materias de primero y las cinco cuatrimestrales del tercer cuatrimestre. Alcanzó lo esperado al cierre de su tercer período. Proyecto I termina en el cuarto y todavía no vence.

**Debe primero y cursó segundo:** ingresó en 2025-2, aprobó seis materias de primero y debe Química. Cursó Probabilidad y Estadística y Mecánica del Sólido, pero todavía no las aprobó; sus correlativas permiten ese caso. Su equivalente sigue en el segundo cuatrimestre, aunque ya cursó materias de segundo año y debe recibir encuestas. Si aprobara esas dos, N sería 8, A sería 2,20 y la diferencia sería 0,80.

**Avance menor al nominal:** ingresó en 2024-1 y solo tiene primero aprobado. Lleva seis períodos y dos equivalentes completos. La diferencia es cuatro, pero no predice cuatro cuatrimestres más hasta egresar. Sigue cursando, por eso su inactividad es 0.

**Fuera de orden:** ingresó en 2025-1. Aprobó las materias previstas hasta el cuarto cuatrimestre salvo Inglés I y II, y en su lugar aprobó Sistemas de Representación y Física Experimental A. Tiene 18 aprobadas y diferencia cero, pero la lista muestra dos pendientes anteriores. Sin el paso 4, esa deuda no se vería. La oferta de las adelantadas se supone para este ejemplo.

**Casi completa, activo y sin actividad:** los dos ingresaron en 2021-1, tienen 51 espacios aprobados y les falta Proyecto IV. Llevan dos períodos adicionales. Esa materia es anual, así que el 0,17 equivalente no mide su duración restante. Prácticas y demás requisitos se verifican por separado. Coinciden en todo menos en la inactividad: el segundo no registra actividad desde el cierre de 2025-2.

## Conexión con el mapa de correlativas

El mapa usaba un valor C de cuatrimestre actual, que se ingresaba a mano o se completaba con `C_auto` (primer cuatrimestre con una obligatoria pendiente). Con este modelo queda así:

| Parte del mapa | Antes | Ahora |
|---|---|---|
| "Podés cursar ahora", bloqueo inmediato y magnitud (`ref = max(fin(m), C)`) | C manual o `C_auto` | **Cuatrimestre equivalente** |
| Criterio "atrasadas" del orden de "Podés cursar ahora" | `cuat(m) < C` | Materias sin aprobar con `fin(m) <` cuatrimestre equivalente |
| Indicador "al día" | `atrasadas(C)` vacío | **Diferencia de avance** y **lista de pendientes anteriores** (pasos 3 y 4) |
| `C_auto` | Valor por defecto | Deja de usarse |

El orden "Podés cursar ahora" usa el cuatrimestre equivalente y no T porque mide dónde está parado el alumno. Con T, a un alumno atrasado casi todas sus pendientes le darían bloqueo inmediato y el orden dejaría de distinguir entre ellas.

Si no se puede determinar el avance, el mapa muestra la estructura del plan sin personalizar, en lugar de completar un valor automático.

## Encuestas y criticidad

En primero no hay encuestas: la criticidad sigue usando las notas y ausencias que cargan los gestores.

Cuando empieza a cursar alguna materia de segundo año, se incorpora a las encuestas aunque deba primero. **La incorporación no depende del cuatrimestre equivalente**: la gestiona el proceso de alta o una inscripción conocida. Al cierre usamos las condiciones informadas y los registros disponibles.

Inglés cuenta para avance y pendientes del plan, pero sigue fuera del análisis de criticidad de materias definido por el equipo.

Estos resultados son descriptivos y no se convierten automáticamente en un índice de riesgo o semáforo.

## Límites importantes

- **Planes vigentes:** ambos planes (2003 y 2024) están confirmados con los documentos oficiales de la Facultad, que indican el cuatrimestre de cada materia. Cada plan tiene su propia tabla acumulada (Paso 2). El documento del Plan 2024 todavía figura como "sujeto a verificación".
- **Ingreso en agosto y oferta:** todas las materias de primero tienen contracursada. Desde segundo no conocemos toda la oferta. La diferencia es nominal y puede deberse a disponibilidad, pausas o información faltante.
- **Datos incompletos:** mostrar avance conocido o sin determinar, según la información disponible. No afirmar cero aprobadas por falta de carga. Si falta una nueva encuesta, mostrar el último cierre conocido y su fecha.
- **Inactividad:** depende de que los registros se carguen a tiempo. Una carga atrasada puede hacer ver inactivo a alguien que no lo está; por eso solo cuentan los cierres en los que había forma de registrar actividad.
- **Fin de carrera:** completar los 52 espacios no sustituye PPS, PSC y demás requisitos. Tras el egreso académico confirmado, se conserva el resultado histórico y no sigue aumentando el atraso ni la inactividad mientras espera la titulación.

## Referencia técnica breve

| Información | Campos existentes del modelo 0.2 |
|---|---|
| Plan e ingreso | Estudiante.id_plan; Estudiante.id_cohorte → Cohorte.id_periodo_ingreso → Periodo_Lectivo |
| Cierre evaluado | Situacion_Cuatrimestral.id_periodo y fecha_corte |
| Condiciones declaradas | Respuesta.id_materia y valor → Pregunta y Envio_Encuesta, con estudiante y período |
| Registros académicos disponibles | Cursada.condicion y origen_dato; Evaluacion.tipo, resultado y fecha |
| Eventos de actividad | Envio_Encuesta respondido, Cursada y Evaluacion por período |
| Ubicación y duración nominal | Materia_Plan.cuatrimestre_plan; Plan_Estudio.duracion_cuatrimestres |
| Resultados | Indicador y Medicion_Indicador, asociados a Situacion_Cuatrimestral |

La tabla acumulada y la duración de los cuatro proyectos se configuran como reglas de cada plan. Avance equivalente, diferencia, períodos adicionales, antigüedad de la deuda e inactividad se registran como indicadores en `Indicador` y `Medicion_Indicador`. La lista de pendientes se obtiene de las condiciones disponibles.

Se conservan respuestas y mediciones por cierre. Una aprobación declarada hoy sin fecha histórica no permite reconstruir cierres anteriores.

## Para cerrar la tarjeta

- Consultar con el DII tres detalles del Plan 2003: si Introducción a la Ingeniería se toma como requisito de ingreso, cuántas optativas suelen cubrir los 16 créditos y si el Trabajo Final es cuatrimestral o anual.
- Verificar que los campos citados existan tal cual en el modelo 0.2.
- Actualizar el mapa de correlativas según la tabla de conexión.
- Usar los seis ejemplos como casos de prueba de la implementación.
