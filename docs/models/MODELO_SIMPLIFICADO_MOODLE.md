# SBIRE: modelo simplificado para Moodle

Este documento adapta el [modelo de datos v2](MODELO_DE_DATOS_V2.md) (DER de 23 entidades) a lo que permite Moodle. Cada tabla de este documento es una **base de datos de Moodle** (actividad `mod_data`) dentro de la subsección *Database* de Zhakyz.

- **Estado:** propuesta. Ninguna base nueva está creada; la única que existe es Preguntas. Crearlas requiere confirmación ([`RULES.md`](../../RULES.md)).
- **Pregunta abierta:** si es viable cargar los datos de todos los estudiantes desde el navegador. Está en el [ADR-005](../decisions/005-modelo-de-bases-moodle.md) y se resuelve antes de crear las bases.

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
2. **Las bases de historial solo agregan entradas.** En Situación académica, Respuestas y Criticidad, editar agrega una entrada nueva; la vigente es la más reciente. Nada se borra.
3. **Clave del estudiante: el DNI.** En 1.er año a veces solo se conoce el DNI. La cuenta de Moodle (`id_usuario_moodle`) es opcional, y cuando existe sirve para la foto y los datos del campus.
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
| 4 | Estudiantes | `Estudiante`, `Trabajo_Final` | estudiante | Editable | Equipo |
| 5 | Situación académica | `Cursada`, `Evaluacion`, `Lote_Importacion` | estudiante y período | Solo agrega | Equipo |
| 6 | Preguntas | `Pregunta` | pregunta | Editable | Equipo |
| 7 | Armado de encuestas | `Encuesta` | encuesta y versión | Editable | Equipo |
| 8 | Respuestas | `Envio_Encuesta`, `Respuesta` | envío respondido | Solo agrega | Cada estudiante ve las suyas |
| 9 | Criticidad | `Situacion_Cuatrimestral`, `Medicion_Indicador` + **estado asignado** | corte o asignación | Solo agrega | Equipo |
| 10 | Alertas | `Alerta` | alerta | Editable (estado) | Equipo |
| 11 | Acompañamientos | `Asignacion_Acompanamiento` | asignación | Editable | Equipo |
| 12 | Entrevistas | `Entrevista`, `Accion_Acordada` | entrevista | Editable (estado) | Equipo |
| — | (sin base) | `Docente` | — | — | Usuarios y grupos de Moodle |

**Mínimo para el tablero y el detalle del estudiante:** Estudiantes, Situación académica, Criticidad y Respuestas (4 bases). El resto se suma con los módulos de alertas, tutorías y configuración.

## Bases y campos

Tipos de campo de Moodle:
- `number`, `text` y `menu` (lista fija de opciones) son los de la base;
- **JSON** es un campo `text` con contenido JSON;
- las fechas se guardan como `text` en formato ISO (`AAAA-MM-DD`, o con hora `AAAA-MM-DDTHH:MM`), porque el campo fecha de Moodle no guarda la hora y es incómodo de escribir por script.

Toda entrada tiene además, sin crear campos: `rid` (clave), `userid` (quién la cargó), `timecreated` y `timemodified`.

### 1. Plan de estudios

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

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Estudiante.dni` | **Clave del estudiante.** Único |
| `legajo` | text | `Estudiante.legajo` | Opcional |
| `nombre` | text | `Estudiante.nombre` | Opcional en 1.er año |
| `apellido` | text | `Estudiante.apellido` | Opcional en 1.er año |
| `email` | text | `Estudiante.email` | Opcional |
| `id_usuario_moodle` | number | `Estudiante.id_usuario_moodle` | Opcional. Con él se muestran la foto y los datos del campus |
| `cohorte` | text | `Estudiante.id_cohorte` | Período de ingreso (`AAAA-n`) |
| `plan` | menu (`Plan 2003`, `Plan 2024`) | `Estudiante.id_plan` | |
| `fecha_consentimiento` | text (fecha) | `Estudiante.fecha_consentimiento` | Opcional |
| `periodo_egreso` | text | `Estudiante.id_periodo_egreso` | Opcional |
| `periodo_titulacion` | text | `Estudiante.id_periodo_titulacion` | Opcional |
| `tf_tema` | text | `Trabajo_Final.tema` | Opcional |
| `tf_periodo_inicio` | text | `Trabajo_Final.id_periodo_inicio` | Opcional |
| `tf_periodo_aprobacion` | text | `Trabajo_Final.id_periodo_aprobacion` | Opcional |

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

### 6. Preguntas (ya existe: cmid 59498, d=114)

Campos actuales: `id`, `pregunta`, `tipo`, `respuestas`, `criticidad`. Para cubrir el DER hay que agregar:

| Campo nuevo | Tipo | Origen en el DER |
|---|---|---|
| `variable` | text | `Pregunta.variable` (nombre que usa el motor, por ejemplo `trabaja`) |
| `por_materia` | menu (`si`, `no`) | `Pregunta.por_materia` |

Y sumar `likert` a las opciones de `tipo`.

**Diferencia con el DER:** en el DER cada pregunta pertenece a una encuesta (`id_encuesta`). Nosotros tenemos un banco de preguntas reutilizables y el orden de cada encuesta se arma aparte, en la base 7. Ver *Decisiones pendientes*.

### 7. Armado de encuestas

Propuesta en [`BASE_ENCUESTAS_ARMADO.json`](../../data/moodle/BASE_ENCUESTAS_ARMADO.json). Para cubrir el DER:

| Campo | Tipo | Origen en el DER |
|---|---|---|
| `encuesta` | menu (`inicial`, `cuatrimestral`) | `Encuesta.tipo` |
| `titulo` | text | `Encuesta.nombre` |
| `descripcion` | text | (nuevo) |
| `preguntas` | text | `Pregunta.orden`: ids del banco separados por coma, en orden |
| `version` | number | `Encuesta.version` (nuevo en la propuesta) |
| `tramo_destino` | menu (`primero`, `superior`, `todos`) | `Encuesta.tramo_destino` (nuevo) |
| `dias_plazo` | number | `Encuesta.dias_plazo` (nuevo) |

### 8. Respuestas

Propuesta en [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json). Una entrada por envío respondido. Editar agrega un envío nuevo; el vigente es el más reciente. Se configura con **"Requiere aprobación"** para que cada estudiante vea solo las suyas.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Envio_Encuesta.id_estudiante` | |
| `id_usuario` | number | (cuenta del campus) | Quien responde siempre tiene cuenta |
| `encuesta` | menu (`inicial`, `cuatrimestral`) | `Envio_Encuesta.id_encuesta` | |
| `version` | number | `Encuesta.version` | Versión de la encuesta que respondió |
| `periodo` | text | `Envio_Encuesta.id_periodo` | Vacío en la inicial |
| `json_pregunta_respuesta` | text (JSON) | `Respuesta` | `[{ id, pregunta, respuesta, criticidad, id_materia? }]`; `id_materia` solo si la pregunta es por materia |
| `created_at` | text (fecha y hora) | `Envio_Encuesta.fecha_completado` | |

No se guardan envíos pendientes: un envío **pendiente** es un estudiante del tramo sin entrada en el período, y está **vencido** si además pasaron los `dias_plazo`. Así no hay que crear una entrada por estudiante al abrir el período.

### 9. Criticidad

Una entrada por **foto** (cálculo del sistema en un corte) o por **estado asignado** a mano (Req 10, que no está en el DER). El gráfico de evolución del detalle del estudiante lee solo esta base.

| Campo | Tipo | Origen en el DER | Notas |
|---|---|---|---|
| `dni` | text | `Situacion_Cuatrimestral.id_estudiante` | |
| `periodo` | text | `Situacion_Cuatrimestral.id_periodo` | |
| `fecha_corte` | text (fecha) | `Situacion_Cuatrimestral.fecha_corte` | |
| `origen` | menu (`calculado`, `asignado`) | (nuevo) | `asignado` = cambio manual de un tutor |
| `tramo` | menu (`primero`, `superior`) | `Situacion_Cuatrimestral.tramo` | |
| `estado_actividad` | menu (`cursando`, `hiatus`, `abandono`, `egresado`, `titulado`) | `Situacion_Cuatrimestral.estado_actividad` | |
| `indice_criticidad` | number | `Situacion_Cuatrimestral.indice_criticidad` | 0 a 100. Vacío en las asignadas |
| `semaforo` | menu (`verde`, `amarillo`, `rojo`, `auto`) | `Situacion_Cuatrimestral.semaforo` | `auto` en una asignada = quitar el estado asignado |
| `motivo` | text | (nuevo) | Obligatorio en las asignadas |
| `mediciones_json` | text (JSON) | `Medicion_Indicador` | `[{ "indicador": "pct_parciales", "version": 1, "valor": 14, "categoria": null, "semaforo": "rojo" }]` |

- **Estado vigente:** la última asignada, si no es `auto`; si no, la última calculada.
- **Quién asignó:** el `userid` de la entrada.

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
| Estudiantes | Plan de estudios | `plan` |
| Estudiantes | Períodos | `cohorte`, `periodo_egreso`, `periodo_titulacion` |
| Situación académica, Respuestas, Criticidad, Alertas, Acompañamientos, Entrevistas | Estudiantes | `dni` |
| Situación académica | Plan de estudios | `materia` (código) dentro del JSON |
| Respuestas | Preguntas | `id` dentro del JSON |
| Armado de encuestas | Preguntas | `preguntas` (lista de ids) |
| Criticidad | Indicadores | `indicador` + `version` dentro de `mediciones_json` |
| Alertas | Criticidad | `rid_situacion` |
| Entrevistas | Acompañamientos | `rid_acompanamiento` |
| Entrevistas | Alertas | `rid_alerta` |

## Reglas que controla la página

- **Únicos:**
  - `dni` en Estudiantes;
  - `periodo` en Períodos;
  - `plan` + `codigo` en Plan de estudios;
  - `clave` + `version` en Indicadores.
- **Bases que solo agregan** (Situación académica, Respuestas, Criticidad): la página nunca edita ni borra; siempre guarda con `rid=0`.
- **Vigente = la entrada más reciente** por clave:
  - Situación académica: (`dni`, `periodo`);
  - Respuestas: (`dni`, `encuesta`, `periodo`);
  - Criticidad: (`dni`, `origen`).
- **Acompañamientos:** exactamente uno entre tutor y asesor par (`tipo`).
- **Privacidad:**
  - **Respuestas** con "Requiere aprobación" y sin aprobar entradas;
  - el resto, con acceso restringido al equipo por grupo o rol. Ocultar la actividad no alcanza, porque se puede entrar por URL.

## Decisiones pendientes

1. **Volumen y carga en el navegador.** Pregunta abierta del [ADR-005](../decisions/005-modelo-de-bases-moodle.md). Si no alcanza, una opción es sumar una base 13, *Estado actual*: una entrada por estudiante con el último estado, que el tablero lea en lugar de toda Criticidad.
2. **Preguntas: banco o por encuesta.** Hoy usamos un banco reutilizable más el armado de cada encuesta; el DER ata cada pregunta a una encuesta. El banco con `version` en el armado cubre lo mismo y ya está hecho.
3. **Respuestas por materia.** Se guardan dentro del JSON con `id_materia`. Falta definir cómo las arma el formulario del estudiante.
4. **Índice de criticidad de 0 a 100.** Es provisorio (ver la spec del [detalle del estudiante](../specs/detalle-estudiante.md)). Depende de `Indicadores.peso` y de la escala de `Evaluacion.nota`, que en el DER sigue pendiente.
5. **Cambio de plan del estudiante.** Mismo pendiente que el DER: con esta simplificación, Estudiantes guarda un solo `plan`.
