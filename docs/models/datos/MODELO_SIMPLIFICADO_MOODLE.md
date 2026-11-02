# SBIRE: modelo simplificado para Moodle

Este documento es el **modelo de datos del SBIRE**: adapta el DER v2 (23 entidades) a lo que permite Moodle. Cada tabla de este documento es una **base de datos de Moodle** (actividad `mod_data`) dentro de la subsección *Database* de Zhakyz.

- **DER v2:** se retiró del repo el 2026-10-31 y este es el único modelo de datos. Las reglas y los pendientes que solo estaban en el DER pasaron a [Reglas que controla la página](#reglas-que-controla-la-página), [Datos que se calculan y no se guardan](#datos-que-se-calculan-y-no-se-guardan) y [Decisiones pendientes](#decisiones-pendientes). La columna *Origen en el DER* queda como referencia de nombres; el DER completo está en el historial de git (`git show 3f7047a:docs/models/MODELO_DE_DATOS_V2.md`).
- **Estado:** propuesta. Están creadas en Moodle **Materias** (la base 1, con los campos de [`BASE_MATERIAS.json`](../../../data/moodle/BASE_MATERIAS.json)) **Respuestas** (la base 8, con los campos del [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md) desde el 2026-11-01), **Encuestas** (base 7) y **Criticidad** (base 9), creadas el 2026-11-01. Preguntas se creó y se borró el 2026-10-25. Crear las demás requiere confirmación ([`RULES.md`](../../../RULES.md)).
- **Pregunta abierta:** si es viable cargar los datos de todos los estudiantes desde el navegador. Está en el [ADR-005](../../decisions/005-modelo-de-bases-moodle.md) y se resuelve antes de crear las bases.

## Por qué hay que simplificar

Una base de Moodle es una **tabla plana**, y la leemos y escribimos desde JavaScript en la página. No hay servidor propio.

| El DER supone | Una base de Moodle da | Cómo se resuelve |
|---|---|---|
| Clave primaria | Cada entrada tiene su id (`rid`) | Se usa el `rid` como clave primaria |
| Claves foráneas y joins | No existen | Las relaciones se guardan como texto (DNI, código o `rid`) y se cruzan en JavaScript. **Cada base es una descarga más:** hay que juntar entidades |
| Valores únicos (`UK`) | No existen | La página controla los duplicados antes de guardar |
| Permisos por fila | Permisos por base, más "requiere aprobación" | Lo sensible va en bases visibles solo para el equipo |
| Autor y fecha de alta | Los guarda Moodle en cada entrada (`userid`, `timecreated`, `timemodified`) | No se crean campos para eso |
| Carga masiva | Un guardado por entrada desde la página. Moodle tiene **importación nativa de CSV** | Las cargas grandes se agrupan en JSON o usan la importación de Moodle |

## Criterios de la simplificación

1. **Juntar lo que se lee junto:**
   - las relaciones 1 a 0..1 pasan a ser columnas (`Trabajo_Final` dentro de `Estudiante`);
   - los detalles de un registro pasan a un campo JSON (evaluaciones de una cursada, mediciones de un corte, acciones de una entrevista);
   - los catálogos chicos se unen (`Plan_Estudio` + `Materia` + `Materia_Plan` + `Correlatividad`).
2. **Las bases de historial solo agregan entradas.** En Situación académica, Encuestas, Respuestas y Criticidad, editar agrega una entrada nueva; la vigente es la más reciente. Nada se borra.
3. **Clave del estudiante: el DNI, siempre junto con la cuenta de Moodle.** Desde el 2026-11-01 (cambio de requerimientos) cada estudiante carga sus propias notas, así que todo estudiante tiene cuenta del campus: `id_usuario_moodle` es obligatorio y sirve además para la foto y los datos del campus.
4. **Lo que ya existe en Moodle no se duplica:**
   - los docentes son usuarios del campus;
   - su rol sale de los grupos del curso;
   - el autor y la fecha de cada entrada los guarda Moodle.
5. **Lo que se puede calcular no se guarda.** Por ejemplo, el estado "pendiente" o "vencido" de una encuesta sale de que no haya respuesta y de la fecha límite.

## Resumen: 12 bases

| # | Base | Entidades del DER | Una entrada por… | Tipo | Visible para |
|---|---|---|---|---|---|
| 1 | Plan de estudios | `Plan_Estudio`, `Materia`, `Materia_Plan`, `Correlatividad` | materia de un plan | Editable | Equipo |
| 2 | Períodos | `Periodo_Lectivo`, `Cohorte` | cuatrimestre | Editable | Equipo |
| 3 | Indicadores | `Indicador` | regla y versión | Editable (versiona) | Equipo |
| 4 | Estudiantes | `Estudiante` | estudiante | Editable | Cada estudiante ve y edita la suya |
| 5 | Situación académica | `Cursada`, `Evaluacion`, `Lote_Importacion` | estudiante y período | Solo agrega | Equipo |
| 6 | Preguntas (descartada) | `Pregunta` | — | — | Las preguntas van dentro de Encuestas |
| 7 | Encuestas | `Encuesta`, `Pregunta` | encuesta y versión | Solo agrega | Todos (la leen los navegadores de los estudiantes) |
| 8 | Respuestas | `Envio_Encuesta`, `Respuesta` | envío respondido | Solo agrega | Cada estudiante ve las suyas |
| 9 | Criticidad | `Situacion_Cuatrimestral` + **estado asignado** | evento: envío de una encuesta, nota guardada, recálculo, omisión o asignación | Solo agrega | Cada estudiante ve las suyas |
| 10 | Alertas | `Alerta` | alerta | Editable (estado) | Equipo |
| 11 | Acompañamientos | `Asignacion_Acompanamiento` | asignación | Editable | Equipo |
| 12 | Entrevistas | `Entrevista`, `Accion_Acordada` | entrevista | Editable (estado) | Equipo |
| — | (sin base) | `Docente` | — | — | Usuarios y grupos de Moodle |

**Mínimo para el tablero y el detalle del estudiante:** Criticidad (el semáforo y su historial), más Respuestas y CargaParcialesPrimero (lo que explica cada valor). El resto se suma con los módulos de alertas, tutorías y configuración.

## Bases y campos

Tipos de campo de Moodle:
- `number`, `text` y `menu` (lista fija de opciones) son los de la base;
- **JSON** es un campo `text` con contenido JSON;
- las fechas se guardan como `text` en formato ISO (`AAAA-MM-DD`, o con hora `AAAA-MM-DDTHH:MM`), porque el campo fecha de Moodle no guarda la hora y es incómodo de escribir por script.

Toda entrada tiene además, sin crear campos: `rid` (clave), `userid` (quién la cargó), `timecreated` y `timemodified`.

### 1. Plan de estudios

> **En Moodle es la base Materias** (cmid 59717, d=152), con otros campos: `plan`, `codigo`, `nombre`, `cuatrimestre`, `duracion`, `tipo`, `creditos`, `horas`, `desbloquea`, `estado` y `cambio` ([`BASE_MATERIAS.json`](../../../data/moodle/BASE_MATERIAS.json)). La tabla de abajo es la propuesta original.

Una entrada por materia en un plan. Los datos del plan (vigencia, duración) se repiten en cada fila porque son pocos y no cambian.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `plan` | menu (`Plan 2003`, `Plan 2024`) | `Plan_Estudio.nombre` | |
| `anio_vigencia` | number | `Plan_Estudio.anio_vigencia` | |
| `duracion_cuatrimestres` | number | `Plan_Estudio.duracion_cuatrimestres` | |
| `codigo` | text | `Materia.codigo` | Único por plan (lo controla la página) |
| `nombre` | text | `Materia.nombre` | |
| `cuatrimestre_plan` | number | `Materia_Plan.cuatrimestre_plan` | 1 a 10 |
| `es_critica` | menu (`si`, `no`) | `Materia_Plan.es_critica` | |
| `correlativas` | text | `Correlatividad` | Una por línea: `codigo:cursada_aprobada` o `codigo:final_aprobado` |

### 2. Períodos

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `periodo` | text | `Periodo_Lectivo.anio` + `cuatrimestre` | `AAAA-n`, por ejemplo `2026-2`. Único |
| `fecha_inicio` | text (fecha) | `Periodo_Lectivo.fecha_inicio` | |
| `fecha_fin` | text (fecha) | `Periodo_Lectivo.fecha_fin` | |
| `cant_ingresantes` | number | `Cohorte.cant_ingresantes` | Vacío si en ese período no hubo ingreso. La cohorte se identifica con el período de ingreso |

### 3. Indicadores

| Campo | Tipo | Origen en el DER |
|---|---|---|
| `clave` | text | (nuevo) nombre corto que usa el motor, por ejemplo `pct_parciales` |
| `nombre` | text | `Indicador.nombre` |
| `descripcion_calculo` | text | `Indicador.descripcion_calculo` |
| `tramo` | menu (`primero`, `superior`) | `Indicador.tramo` |
| `fuente` | menu (`parciales`, `encuesta`, `cohorte`) | `Indicador.fuente` |
| `umbral_amarillo` | number | `Indicador.umbral_amarillo` |
| `umbral_rojo` | number | `Indicador.umbral_rojo` |
| `peso` | number | `Indicador.peso` |
| `vigente_desde` | text (fecha) | `Indicador.vigente_desde` |
| `version` | number | `Indicador.version` |

Cambiar una regla agrega una versión nueva; la vigente es la de mayor `version` con `vigente_desde` ya cumplido. Así cada foto de criticidad se puede explicar con la regla que estaba vigente.

### 4. Estudiantes

> **Definida en [`BASE_ESTUDIANTES.json`](../../../data/moodle/BASE_ESTUDIANTES.json)** (2026-11-02, SCRUM-24, [spec](../../specs/vista-estudiante.md)), todavía sin crear en Moodle. Es la información personal que cada estudiante carga en la Página Información personal: una entrada por estudiante que se edita, sin historial y sin criticidad. Se configura con "requiere aprobación" sin aprobar entradas, así cada estudiante ve y edita solo la suya. Sin entrada, la vista Mi Trayectoria deshabilita todas las secciones.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `id_usuario` | number | `Estudiante.id_usuario_moodle` | Obligatorio: todo estudiante tiene cuenta. Con él, cada página encuentra la entrada propia |
| `dni` | text | `Estudiante.dni` | **Clave del estudiante.** Único (lo controla la página). Nombre de usuario del campus, no se edita |
| `nombre` | text | `Estudiante.nombre` | Se precarga con la cuenta del campus; desde que se guarda, se usa el de la base |
| `apellido` | text | `Estudiante.apellido` | Igual que `nombre` |
| `email` | text | `Estudiante.email` | Opcional. Se precarga con la cuenta |
| `es_primer_anio` | menu (`si`, `no`) | (nuevo) | Tramo: `si` si todavía no cursa ni aprobó Proyecto de Ingeniería Industrial I |
| `anio_ingreso` | number | `Estudiante.id_cohorte` | Con `cuatrimestre_ingreso` forma la cohorte (`AAAA-n`) |
| `cuatrimestre_ingreso` | menu (`1`, `2`) | `Estudiante.id_cohorte` | |
| `periodo_paso_superior` | text | (nuevo) | Período en que `es_primer_anio` pasó de `si` a `no` (cuándo pasó a 2.º año). Opcional |

- **No se guardan:** el plan (solo Plan 2024), la situación laboral (la preguntan las encuestas, en Respuestas) y si es de Ingeniería Industrial (con "No" no se crea la entrada).
- **Quedan fuera por ahora** (los campos de la propuesta anterior que ninguna pantalla usa): `legajo`, `fecha_consentimiento`, `periodo_egreso`, `periodo_titulacion` y los del trabajo final (`tf_tema`, `tf_periodo_inicio`, `tf_periodo_aprobacion`). Se suman cuando haya una pantalla que los cargue.

### 5. Situación académica

Una entrada por estudiante y período con **todas sus cursadas y evaluaciones**. Cada carga de notas agrega una versión nueva para cada estudiante afectado; la vigente es la más reciente. Así se conserva cuándo cambió una condición, que en el DER se perdía.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Cursada.id_estudiante` | |
| `periodo` | text | `Cursada.id_periodo` | `AAAA-n` |
| `cursadas_json` | text (JSON) | `Cursada` + `Evaluacion` | Ver el formato abajo |
| `origen_dato` | menu (`carga_gestor`, `autoinforme`) | `Cursada.origen_dato` | |
| `archivo_origen` | text | `Lote_Importacion.archivo_origen` | Quién y cuándo lo dicen `userid` y `timecreated` |
| `fuente` | menu (`xls`, `csv`, `moodle`) | `Lote_Importacion.fuente` | |

Formato de `cursadas_json`:

```json
[
  {
    "materia": "AN1",
    "condicion": "en_curso",
    "evaluaciones": [
      { "tipo": "parcial", "instancia": 1, "fecha": "2026-05-06", "nota": 7, "resultado": "aprobado" },
      { "tipo": "parcial", "instancia": 2, "fecha": "2026-06-24", "nota": null, "resultado": "ausente" }
    ]
  }
]
```

Con unos 300 estudiantes, una carga son unas 300 entradas, en lugar de una entrada por evaluación (miles).

### 6. Preguntas (descartada el 2026-10-25)

> Se borró de Moodle (era la cmid 59498, d=114) y del repo: las preguntas quedaron fijas en las Encuestas de Moodle. Desde el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md), su texto, sus opciones y su criticidad van dentro de cada versión de la base 7, Encuestas. Lo que sigue queda como referencia del diseño.

Campos actuales: `id`, `pregunta`, `tipo`, `respuestas`, `criticidad`. Para cubrir el DER hay que agregar:

| Campo nuevo | Tipo | Origen en el DER |
|---|---|---|
| `variable` | text | `Pregunta.variable` (nombre que usa el motor, por ejemplo `trabaja`) |
| `por_materia` | menu (`si`, `no`) | `Pregunta.por_materia` |

Y sumar `likert` a las opciones de `tipo`.

**Diferencia con el DER:** en el DER cada pregunta pertenece a una encuesta (`id_encuesta`). Nosotros tenemos un banco de preguntas reutilizables y el orden de cada encuesta se arma aparte, en la base 7. Ver *Decisiones pendientes*.

### 7. Encuestas

Definida en [`BASE_ENCUESTAS.json`](../../../data/moodle/BASE_ENCUESTAS.json) por el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md). Creada el 2026-11-01 (cmid 60190, d=198). Reemplaza al *Armado de encuestas* que se descartó el 2026-10-25. Una entrada por encuesta y versión: cambiar una pregunta, un salto de página o un puntaje es cargar una versión nueva. La vigente es la de mayor `version`. Las entradas que se cargan están en [`DEFINICIONES_ENCUESTAS.json`](../../../data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json) (Inicial versión 2, Cuatrimestral versión 3).

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `codigo_encuesta` | menu (`inicial`, `cuatrimestral`) | `Encuesta.tipo` | |
| `version` | number | `Encuesta.version` | Única con el mismo `codigo_encuesta` (lo controla la página) |
| `json_preguntas` | text (JSON) | `Pregunta` | `[{ variable, item_id, pagina, tipo, pregunta, obligatoria, rango, formato, opciones: [{ opcion, texto, criticidad }], criticidad_max, regla }]` |
| `por_periodo` | menu (`si`, `no`) | (nuevo) | La cuatrimestral lleva período; la inicial, no |
| `puntaje_maximo` | number | (nuevo) | Suma de los `criticidad_max` de las preguntas que puntúan: el índice de la encuesta es el puntaje sobre este máximo, de 0 a 100 |
| `created_at` | text (fecha y hora) | (nuevo) | Cuándo se cargó la versión |

- **`item_id`** es el id del ítem en Moodle: algunos ítems no tienen etiqueta y Respuestas guarda cada respuesta por su id.
- **Las dependencias entre preguntas no van acá:** las define la Encuesta de Moodle (`inicio_laboral` solo si `trabaja` = Si).
- **Sin `cmid`:** el cmid de cada encuesta está en `moodle.config.json`.

### 8. Respuestas

Definida en [`BASE_RESPUESTAS.json`](../../../data/moodle/BASE_RESPUESTAS.json). La escribe el [script de copia](../../specs/copia-encuestas.md) que va dentro de las Encuestas de Moodle ([ADR-006](../../decisions/006-versionado-de-encuestas.md)): Moodle guarda solo la última respuesta y esta base guarda todas. Una entrada por envío respondido. Editar agrega un envío nuevo (una versión); el vigente es el más reciente. Se configura con **"Requiere aprobación"** para que cada estudiante vea solo las suyas.

Desde el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md) guarda **solo lo respondido**: los textos están en Encuestas y la criticidad, en Criticidad. Los campos anteriores (`encuesta`, `version_encuesta`, `json_pregunta_respuesta`, `puntaje_criticidad`) se reemplazaron en Moodle el 2026-11-01, después de borrar sus 4 entradas de prueba.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `id_usuario` | number | (cuenta del campus) | Quien responde siempre tiene cuenta (`M.cfg.userId`) |
| `dni` | text | `Envio_Encuesta.id_estudiante` | El nombre de usuario del campus. La clave que comparte con CargaParcialesPrimero |
| `codigo_encuesta` | menu (`inicial`, `cuatrimestral`) | `Envio_Encuesta.id_encuesta` | |
| `version` | number | `Encuesta.version` | Con `codigo_encuesta`, apunta a su definición en Encuestas |
| `periodo` | text | `Envio_Encuesta.id_periodo` | Vacío en la inicial |
| `json_respuesta` | text (JSON) | `Respuesta` | `[{ item_id, respuestas: [...] }]`: número de opción, número, `{ plan, materias }` o `{ materia, primera_vez, dificultad }` |
| `created_at` | text (fecha y hora) | `Envio_Encuesta.fecha_completado` | |

No se guardan envíos pendientes: un envío **pendiente** es un estudiante del tramo sin entrada en el período. Si al cerrar el período no respondió, el equipo agrega una entrada `omision` en Criticidad.

### 9. Criticidad

Definida en [`BASE_CRITICIDAD.json`](../../../data/moodle/BASE_CRITICIDAD.json) por el [ADR-007](../../decisions/007-encuestas-respuestas-y-criticidad.md). Creada el 2026-11-01 (cmid 60191, d=199). **Una entrada por evento:** cada envío de una encuesta, cada nota guardada en CargaParcialesPrimero, cada recálculo, cada omisión y cada estado asignado a mano (Req 10). El gráfico de evolución del detalle del estudiante lee solo esta base.

| Campo | Tipo | Vacío | Notas |
|---|---|---|---|
| `id_usuario` | number | no | Todo estudiante tiene cuenta |
| `dni` | text | no | |
| `periodo` | text | no | En las manuales, cuándo se asignó: no limita su vigencia |
| `origen` | menu (`automatica`, `manual`) | no | `manual` = un tutor asigna el estado |
| `fuente` | menu (`notas_1ro`, `respuestas`, `materias`, `omision`) | sí | Qué la disparó. Vacía en las manuales |
| `rid_fuente` | number | sí | El `rid` de la entrada que la disparó (Respuestas, CargaParcialesPrimero o CargaMateriasPrimero). Vacío en `omision` y en las manuales |
| `indice` | number | sí | De 0 a 100, el de esa fuente. Vacío en las manuales |
| `indice_total` | number | sí | Promedio del último índice de cada grupo de fuentes del período (*notas*: `notas_1ro` y `materias`; *encuestas*: `respuestas` y `omision`). Vacío en las manuales |
| `semaforo` | menu (`verde`, `amarillo`, `rojo`, `sin_asignar`) | no | En las automáticas, el del `indice_total` (40 y 70). En las manuales, el asignado; `sin_asignar` lo quita |
| `motivo` | text | sí | Obligatorio en las manuales |
| `created_at` | text (fecha y hora) | no | |

- **Calculado vigente:** la última entrada automática del período.
- **Asignado vigente:** la última entrada manual del estudiante, de cualquier período, si no es `sin_asignar`. Persiste hasta que un tutor la quita.
- **El tablero muestra los dos:** el asignado no reemplaza al calculado.
- **Quién asignó:** el `userid` de la entrada.
- **Índices:** el de las encuestas sale de [`MODELO_CRITICIDAD_ENCUESTAS.md`](../criticidad/MODELO_CRITICIDAD_ENCUESTAS.md) y el de las notas de 1.er año, de [`MODELO_CRITICIDAD_NOTAS_PRIMERO.md`](../criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md).

### 10. Alertas

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Alerta.id_estudiante` | |
| `rid_situacion` | number | `Alerta.id_situacion` | Opcional: `rid` de la foto en Criticidad |
| `rid_envio` | number | `Alerta.id_envio` | Opcional: si nació de una omisión, no hay envío; se usa `periodo` |
| `periodo` | text | (nuevo) | Período de la alerta |
| `tipo` | menu (`temprana`, `omision`, `materia_critica`, `carrera_extendida`) | `Alerta.tipo` | |
| `nivel` | menu (`amarillo`, `rojo`) | `Alerta.nivel` | |
| `materia` | text | (propuesta del DER) | Opcional |
| `indicador` | text | (propuesta del DER) | Opcional |
| `estado` | menu (`abierta`, `en_seguimiento`, `cerrada`) | `Alerta.estado` | La única parte que se edita |
| `fecha_cierre` | text (fecha y hora) | `Alerta.fecha_cierre` | Opcional |
| `motivo_cierre` | text | `Alerta.motivo_cierre` | Opcional |

`fecha_generacion` es el `timecreated` de la entrada. Quién la cerró queda en `timemodified` y `userid`, aunque Moodle solo guarda el autor original. Si hace falta saber quién la cerró, agregar `cerrada_por`.

### 11. Acompañamientos

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Asignacion_Acompanamiento.id_estudiante` | |
| `tipo` | menu (`tutor`, `asesor_par`) | (nuevo) | Garantiza "un docente o un asesor par, nunca ambos" |
| `id_usuario_acompanante` | number | `id_docente` o `id_asesor_par` | Cuenta del campus del tutor o del asesor par |
| `materia` | text | `Asignacion_Acompanamiento.id_materia` | Solo para asesor par |
| `fecha_desde` | text (fecha) | `fecha_desde` | |
| `fecha_hasta` | text (fecha) | `fecha_hasta` | Opcional |

### 12. Entrevistas

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `rid_acompanamiento` | number | `Entrevista.id_asignacion` | Define tutor y estudiante |
| `dni` | text | (copia) | Permite filtrar sin leer Acompañamientos |
| `rid_alerta` | number | `Entrevista.id_alerta` | Opcional |
| `originada_por` | menu (`tutor`, `estudiante`) | `Entrevista.originada_por` | Quién la pidió. Si nació de una alerta, lo indica `rid_alerta` |
| `estado` | menu (`solicitada`, `rechazada`, `programada`, `realizada`, `no_asistio`, `cancelada`) | `Entrevista.estado` | |
| `motivo` | text | `Entrevista.motivo` | Opcional |
| `fecha_solicitud` | text (fecha y hora) | `Entrevista.fecha_solicitud` | |
| `fecha_programada` | text (fecha y hora) | `Entrevista.fecha_programada` | Opcional |
| `fecha_realizada` | text (fecha y hora) | `Entrevista.fecha_realizada` | Opcional |
| `resultado` | text | `Entrevista.resultado` | Opcional |
| `acciones_json` | text (JSON) | `Accion_Acordada` | `[{ "tipo_derivacion": "asesor_par", "descripcion": "…", "fecha_compromiso": "2026-11-01", "estado": "pendiente" }]` |

### Sin base: Docente

- Los docentes, tutores y gestores son **usuarios del campus**. Su `id_usuario_moodle` se usa directamente en Acompañamientos, y el autor de cada entrada lo guarda Moodle.
- **Roles (ADM, GES, TUT, PAR):** grupos del curso. Esto resuelve el pendiente del DER sobre roles y permisos.
- Nombre, email y foto se leen del perfil del campus.

## Relaciones

Ninguna se garantiza en Moodle: la página valida antes de guardar.

| Desde | Hacia | Por |
|---|---|---|
| Estudiantes | Períodos | `anio_ingreso` + `cuatrimestre_ingreso` (cohorte), `periodo_paso_superior` |
| Situación académica, Respuestas, Criticidad, Alertas, Acompañamientos, Entrevistas | Estudiantes | `dni` |
| Situación académica | Plan de estudios | `materia` (código) dentro del JSON |
| Respuestas | Encuestas | `codigo_encuesta` + `version`; `item_id` dentro del JSON |
| Criticidad | Respuestas, CargaParcialesPrimero o CargaMateriasPrimero | `rid_fuente`, según `fuente` |
| Alertas | Criticidad | `rid_situacion` |
| Entrevistas | Acompañamientos | `rid_acompanamiento` |
| Entrevistas | Alertas | `rid_alerta` |

## Reglas que controla la página

- **Únicos:**
  - `dni` en Estudiantes;
  - `periodo` en Períodos;
  - `plan` + `codigo` en Plan de estudios;
  - `clave` + `version` en Indicadores;
  - `codigo_encuesta` + `version` en Encuestas;
  - cada materia una sola vez dentro de `cursadas_json` (en el DER, `Cursada` era única por estudiante, materia y período);
  - cada ítem (`item_id`) una sola vez dentro de `json_respuesta`.
- **Bases que solo agregan** (Situación académica, Encuestas, Respuestas, Criticidad): la página nunca edita ni borra; siempre guarda con `rid=0`.
- **Vigente = la entrada más reciente** por clave:
  - Situación académica: (`dni`, `periodo`);
  - Encuestas: (`codigo_encuesta`), por mayor `version`;
  - Respuestas: (`dni`, `codigo_encuesta`, `periodo`);
  - Criticidad: (`dni`, `periodo`) entre las automáticas, y (`dni`) entre las manuales, de cualquier período.
- **Acompañamientos:** exactamente uno entre tutor y asesor par (`tipo`).
- **Privacidad:**
  - **Respuestas** y **Criticidad** con "Requiere aprobación" y sin aprobar entradas (cada estudiante ve las suyas, incluido su índice);
  - **Estudiantes**, igual: cada estudiante ve y edita solo su información personal;
  - **Encuestas**, legible por todos: la leen los navegadores de los estudiantes;
  - el resto, con acceso restringido al equipo por grupo o rol. Ocultar la actividad no alcanza, porque se puede entrar por URL.
- **Criticidad:** toda entrada automática tiene `fuente` e `indice`; toda manual tiene `motivo`.

## Datos que se calculan y no se guardan

- **Recursa:** si hay una cursada anterior de la misma materia en Situación académica. Es distinto del recursado que **declara** el estudiante en la encuesta (`primera_vez`), que sí se guarda en Respuestas.
- **Inicio laboral:** se puede deducir como el primer período con `trabaja` = Sí en Respuestas.
- **Avance curricular.**
- **Egresados, titulados y los que continúan en 2.º año por cohorte:** se cuentan sobre Estudiantes.
- **Estado vigente del estudiante:** el calculado y el asignado salen de sus últimas entradas en Criticidad (ver la base 9).
- **Envío pendiente o vencido:** ver la base 8.

## Decisiones pendientes

1. **Volumen y carga en el navegador.** Pregunta abierta del [ADR-005](../../decisions/005-modelo-de-bases-moodle.md). Si no alcanza, una opción es sumar una base 13, *Estado actual*: una entrada por estudiante con el último estado, que el tablero lea en lugar de toda Criticidad.
2. ~~**Preguntas: banco o por encuesta.**~~ Resuelto por el ADR-007: las preguntas van dentro de cada versión de Encuestas.
3. ~~**Respuestas por materia.**~~ Resuelto: el selector de materias las guarda en `json_respuesta` como `{ materia, primera_vez, dificultad }`.
4. **Índice de criticidad de 0 a 100.** Es provisorio (ver la spec del [detalle del estudiante](../../specs/detalle-estudiante.md)). Depende de `Indicadores.peso` y de la escala de `Evaluacion.nota`, que en el DER sigue pendiente.
5. **Cambio de plan del estudiante.** Mismo pendiente que el DER: con esta simplificación, Estudiantes guarda un solo `plan`. Opciones: una entrada por plan con fechas desde y hasta, o un solo plan más la fecha del cambio.
6. **Consentimiento.** Solo se guarda `fecha_consentimiento`. Falta la versión del texto aceptado y la revocación, si la universidad las exige.
7. **Datos de contexto del estudiante.** No hay edad, género ni colegio de origen. Definir si se van a segmentar indicadores por ellos.
8. **Responsable de las acciones acordadas.** `acciones_json` no dice quién tiene que cumplir cada acción ni si generó un acompañamiento nuevo.
