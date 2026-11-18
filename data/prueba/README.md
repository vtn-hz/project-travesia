# Datos de prueba del campus

Conjunto de **60 estudiantes ficticios** para que el sistema se vea en uso: encuestas desde 2021, notas de 1.er año de 2026, criticidad, estados asignados y entrevistas. Lo arma [`generar.js`](generar.js) y se carga en las bases de Zhakyz. **Estado: generado en local, sin aplicar en Moodle** (los scripts de aplicar y borrar son el paso siguiente).

```bash
node data/prueba/generar.js                         # escribe los JSON e imprime el control de coherencia
node data/prueba/generar.js --verificar <archivo>   # además compara contra nombres de participantes y DNI ya usados
```

El archivo de `--verificar` (`{ "nombres": [...], "dnis": [...] }`) se arma leyendo el campus en modo lectura y **no se guarda en el repo**: tiene nombres de personas reales. Con la semilla actual, ningún nombre coincide con los 105 participantes del curso ni con los DNI cargados al 2026-11-17.

## Qué hay

| Archivo | Base de Moodle | Entradas | Contenido |
|---|---|---:|---|
| [`estudiantes.json`](estudiantes.json) | Estudiantes | 60 | 40 de 2.º año en adelante (cohortes 2018 a 2025) y 20 de 1.er año (2025 y 2026) |
| [`respuestas.json`](respuestas.json) | Respuestas | 300 | Encuestas Cuatrimestrales v4 de 2021-1 a 2026-2. 59 son reenvíos: el mismo estudiante vuelve a responder en el período |
| [`parciales.json`](parciales.json) | CargaParcialesPrimero | 200 | Notas de 2026-1 y 2026-2: parciales, recuperatorios y ausentes, de los de 1.er año y de 5 recursantes |
| [`criticidad.json`](criticidad.json) | Criticidad | 559 | Una entrada por nota (200) y por respuesta (300), 46 omisiones de los períodos cerrados y 13 estados asignados (2 quitados después) |
| [`entrevistas.json`](entrevistas.json) | Entrevistas | 30 | Realizadas con resultado y acciones, no asistió, canceladas, rechazada, programadas (2 con la fecha vencida, sin resultado) y solicitadas |

En 2026-2 el Tablero quedaría así (estado vigente): 12 en riesgo alto, 17 en riesgo medio, 27 sin riesgo y 4 sin calcular, con 9 estados asignados por un tutor. Se comprobó con una copia local del Tablero y del Detalle cargada con estos JSON.

## Cómo se genera

- **Se simula la carrera de cada estudiante** con el Plan 2024 (`data/plan_estudios/PLAN_2024_MATERIAS.csv`), según un perfil: *al día*, *trabaja*, *en riesgo*, *abandona*, *inactivo*, *nunca responde*, *pasó a 2.º año en 2026*; y en 1.er año, *buen inicio*, *irregular*, *en riesgo* y *sin notas cargadas*.
- **De esa simulación salen las encuestas** (créditos = suma de las materias aprobadas, materias cursadas el cuatrimestre anterior con su primera vez y dificultad, situación laboral estable, avance percibido) y las notas.
- **La criticidad se calcula con las funciones de la Página Tools** (`CriticidadEncuesta` con la Cuatrimestral v4 e `IndiceNotasPrimero` con CargaMateriasPrimero tal como está en el campus), en el orden en que lo haría el sistema. `indice_total` sigue la regla de Tools v8 (el propio índice).
- **Omisiones como el cierre real (ADR-009):** al cerrar cada período, a quien estaba en 2.º año en adelante desde antes y no respondió; índice 70, y se desaprueban al aplicarlas.
- **Entrevistas posteriores a lo que las dispara** (una encuesta, una nota o la omisión del período anterior), con una sola activa por estudiante y 2 horas entre entrevistas del mismo acompañante el mismo día. Los estados asignados salen de sus resultados.
- **Semilla fija:** volver a correr el generador da los mismos JSON.

## Cómo se reconocen (para borrarlos)

| Marca | Dónde |
|---|---|
| id de usuario **900001 a 900060** | Estudiantes, Respuestas, Criticidad y Entrevistas (`id_usuario_estudiante`). En el campus los ids reales van por los 2.000–4.000 |
| id **900901 a 900906** | Los 4 tutores y 2 asesores pares ficticios de las entrevistas |
| Correo **@ejemplo.edu.ar** | Estudiantes |
| La **lista de los 60 DNI** de `estudiantes.json` | CargaParcialesPrimero, que no tiene id de usuario |

Los DNI están entre 40.000.000 y 50.000.000, acordes a la edad de cada cohorte, como pidió el equipo. Pueden coincidir con el de una persona real (no con los ya cargados en el campus, que se descartan): por eso el borrado no se apoya solo en el DNI.

## Aplicar y borrar (pendiente)

1. **Aplicar** (`aplicar.js`, por defecto simula): crea las entradas en orden (Estudiantes, Respuestas y CargaParcialesPrimero, Criticidad con `rid_fuente` resuelto, Entrevistas), desaprueba las omisiones y anota cada rid en `aplicado.json` a medida que avanza, así se puede retomar. Son ~1.150 entradas: con el campus lento, entre 40 y 90 minutos.
2. **Borrar** (`remover.js`, por defecto simula): junta los rid de `aplicado.json` y, de respaldo, las entradas con las marcas de arriba; borra en orden inverso, nunca una entrada sin marca, y vuelve a leer las bases para confirmar que no quedó nada.

**Mientras estén cargados:** las entradas las carga la cuenta del equipo, así que el autor de los estados asignados es esa cuenta; el Detalle muestra iniciales en lugar de foto; la fecha de alta en Moodle es la del día en que se apliquen (las fechas del sistema van en `created_at`). No se usa RespuestasEntrevistas ni se agregan períodos a la base Períodos (cambiaría el período vigente).
