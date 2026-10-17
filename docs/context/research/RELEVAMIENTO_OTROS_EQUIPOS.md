# Relevamiento de avances de otros equipos

> Hecho el 2026-10-17 sobre el curso de prueba `id=1732` del Campus Ingeniería UNMdP, en **modo solo lectura**.
> Detalle técnico de la plataforma en [MOODLE_SECCIONES_Y_HERRAMIENTAS](../platform/MOODLE_SECCIONES_Y_HERRAMIENTAS.md).
> Objetivo: saber qué construyó cada consultora y qué ideas puede adoptar Zhakyz & Asociados.
> No se incluyen datos personales de alumnos: solo la estructura, las funcionalidades y las técnicas.

## Metodología y garantía de no modificación

- Navegación automatizada con Playwright, con el usuario del equipo.
- **Bloqueo a nivel de red** de toda petición que no fuera `GET` (excepto el login) y de todo `GET` con `sesskey`, `edit`, `delete` o `togglecompletion`. En total se abortaron **~500 peticiones**: llamadas AJAX automáticas de Moodle, el lanzamiento de LTI y las descargas CSV de encuestas que hacen los propios paneles. No se hizo clic en ningún botón ni se envió ningún formulario.
- **Comparación antes y después.** Se guardó una foto de las 20 secciones y de los inventarios de actividades (entradas por base de datos, respuestas por encuesta, intentos por cuestionario) antes y después de recorrer las ~190 actividades:
  - Inventarios: **idénticos**.
  - Secciones: **idénticas**, salvo el texto "Última actualización: 10:41 → 11:04" del panel de Parser. Ese texto es la hora local que su JS calcula al cargar la página, no un dato guardado.
- Efectos colaterales inevitables de cualquier visita: Moodle registra cada vista en sus *logs*, y las actividades con finalización "al ver" pueden quedar marcadas como vistas **para nuestro usuario**. Ninguno de los dos efectos altera contenido de otros equipos.

## Resumen por equipo

Grado de avance estimado: 🟢 avanzado · 🟡 intermedio · 🟠 inicial · ⚪ vacío.

| Equipo | Avance | Qué construyó | Lo más destacable |
|--------|:------:|---------------|-------------------|
| **GLASS GROUP** | 🟢 | Sistema completo: 7 páginas (Panel Alumno, Tablero principal, Histórico, Tablero 1.er año, Histórico 1.er año, Completitud de encuestas, Configuración, Herramientas) y ~12 bases | **Configuración centralizada en JSON**, IRD ponderado, ralentización, snapshots históricos por cuatrimestre, mensajería con cooldown, editor de configuración y herramienta de limpieza |
| **TransIT** | 🟢 | Hub del alumno con 4 tarjetas (Encuesta inicial, Cuatrimestral, Carga de notas, Solicitar tutoría), panel docente con semáforo de 1.er año, carga de parciales por CSV/XML, bandeja de solicitudes de tutoría | Usa la **importación nativa del libro de calificaciones** para los parciales de 1.er año. Su hub es casi igual a nuestro main menu (ver ⚠️ más abajo) |
| **Perceptron** | 🟢 | Modelo de datos relacional: Estudiantes, Asignaturas, Correlatividades, Situación académica, Equipo de seguimiento, Turnos, Disponibilidad. Páginas: Registrarme, Solicitar turno, Historial académico, Carga de notas, BI de encuesta | El **modelo de datos más prolijo**, un **sistema de turnos** con disponibilidad de tutores y un registro que valida sesión y formulario antes de escribir |
| **LuminaTech** | 🟡 | Preguntas de encuestas guardadas en una base con **criticidad por opción**, Panel IRD, base del plan de estudios, histórico de alumnos | Las encuestas se definen **como datos** y no en el código: el panel calcula el riesgo leyendo las preguntas y sus pesos |
| **Córvax** (FlockX) | 🟡 | Todo con **herramientas nativas**: cuestionarios como encuestas, base "Seguimiento de notas", 3 páginas "Ver mi estado académico" que se muestran según la calificación, SCORM de correlatividades, Consulta para agendar tutoría, postulación a asesor par | Un **semáforo sin JS**: la nota del cuestionario "Estado de alerta" más restricciones por rango deciden qué página ve el alumno |
| **Parser Consulting** | 🟡 | Panel histórico con Chart.js y exportación CSV, varias bases de prueba (alumnos, plan de estudios, entrevistas) | Una base de **registro de intervenciones**: motivo, origen de la alerta, responsable, resultado y acción posterior |
| **APEX Intelligence** | 🟠 | Banner con diagnóstico (40% de deserción en 1.er año), subsecciones Estudiantes 1.er año y Docentes, encuesta de 1.er año, base de notas por instancia de evaluación | Base de notas con *Materia × Cohorte × Instancia de evaluación × Nota* |
| **Koru** | 🟠 | Encuesta cuatrimestral con un texto introductorio cuidado, base de disponibilidad | Buen **microcopy**: explica para qué se pide el dato, cuánto tarda (⏱ 5 min) y que es confidencial |
| **Altiora** | 🟠 | Encuesta inicial (anónima), encuesta cuatrimestral condicionada a la inicial, LTI | Encuesta inicial larga y bien redactada sobre factores socioeconómicos. ⚠️ Está en modo **anónimo** |
| **Atlántico Dev** | 🟠 | Encuestas inicial y cuatrimestral de prueba, carpeta, página | — |
| **Cauquén** | 🟠 | Encuesta y LTI | — |
| **Re-Action.** | 🟠 | Encuestas inicial y cuatrimestral (casi vacías) | — |
| **Summit Labs**, **Puerto Byte**, **Sección 18**, **GLASS GROUP (copia)** | ⚪ | Vacías | — |
| **Zhakyz** (nosotros) | 🟠 | En Moodle solo hay actividades de prueba (BD_Prueba, Prueba_Cuestionario, Prueba_Encuesta, Prueba2, database testing) | El main menu está en el repo, todavía no se publicó en nuestra sección |

## Detalle de las ideas más valiosas

### 1. Índice de Riesgo de Deserción (IRD) ponderado — GLASS GROUP y LuminaTech

Los dos equipos implementan la misma fórmula:

```
Z     = Σ (beta_pregunta × X_respuesta)        X ∈ [0, 1] = gravedad de la opción elegida
Z_max = Σ (beta_pregunta × max_value)
IRD   = Z / Z_max × 100                        (0–100)
```

- Umbrales de GLASS GROUP: **IRD < 40 sin riesgo, 40–79 riesgo medio, ≥ 80 riesgo alto**.
- Los pesos (`beta`) y la gravedad de cada opción **no están en el código**. GLASS GROUP los guarda en un JSON y LuminaTech en la base "Preguntas Encuesta Inicial/Cuatrimestral", con los campos Pregunta, Tipo, Respuestas, idPregunta y Criticidad.
- Tipos de pregunta que soportan: `si_no`, `numerico` (0, 1, 2, 3, 4 o más) y directo (mapeo opción → puntos).

**Para nosotros:** encaja con el semáforo de nuestra spec, donde el criterio para 2.º año en adelante es "cuanti + cuali". Además nos da una fórmula defendible y ajustable sin redeployar.

### 2. Ralentización — GLASS GROUP

```
ralentizacion = (1 − materias_aprobadas / materias_esperadas_al_cuatrimestre_N) × 100
```

Tiene una tabla del plan de estudios con las materias esperadas acumuladas por cuatrimestre (`cuat1 … cuat10`). Es el **índice de ritmo** del Bloque 1 de nuestro [documento de indicadores](INDICADORES_TRAYECTORIA_TERMINALIDAD.md).

### 3. Configuración centralizada — GLASS GROUP

- Una base "Configuración" con **un solo campo `json_config`** que guarda los CMIDs, los DATAIDs, los umbrales (`threshold_ird`, `threshold_ird_red`, `cuatrimestres_desercion`, `cooldown`) y las preguntas con sus pesos.
- Todas las páginas leen ese JSON al cargar. Si no lo encuentran, usan valores por defecto.
- Hay una página **"Editor de Configuración del Sistema"** con pestañas para editar el JSON sin tocar código, que incluye una ayuda para encontrar CMID y DATAID.

**Para nosotros:** hoy `content.html` tiene los CMIDs y los IDs de campo *hardcodeados*. Conviene adoptar este patrón.

### 4. Históricos por cuatrimestre (snapshots) — GLASS GROUP

Las bases *Histórico-Alumnos* (IRD, ralentización, estado y `datos_json` por alumno y cuatrimestre) e *Histórico-Indicadores Generales* se llenan con un botón "Guardar Histórico". Así se puede ver la **evolución por cohorte**, que es justo el enfoque de cohorte que pide la bibliografía.

### 5. Semáforo nativo sin JS — Córvax

Un cuestionario "Estado de alerta" genera una calificación, y 3 copias de la página "Ver mi estado académico" tienen restricciones por **rango de calificación**. Cada alumno ve solo la que le corresponde, con un mensaje y un link a "Solicitar apoyo académico".

**Para nosotros:** es un buen *fallback* si el JS falla o si el docente quiere ajustar el semáforo sin tocar código.

### 6. Modelo de datos relacional — Perceptron

| Base | Campos clave |
|------|--------------|
| Estudiantes | dni, legajo, apellido, nombre, email, carrera, estado, tutor_asignado, asesor_par, cohorte |
| Asignaturas | codigo, nombre, carrera, anio_plan, cuatrimestre, carga_horaria, creditos, tipo_curricular, nota_minima_aprobacion, clasificacion |
| Correlatividades | codigo_asignatura, codigo_requerida, tipo, condicion |
| Situación académica | dni, codigo_asignatura, periodo, condicion, nota_final, numero_cursada, origen, fecha_aprobacion |
| Equipo de seguimiento | nombre, rol, email, dni, legajo, horario_atencion, estado, usuario_moodle_id |
| Turnos / Disponibilidad | tutor, día, desde/hasta, duración, estado; con historial de cambios |

- La **cohorte** se carga como `AAAA-1C` / `AAAA-2C`, igual que la recomendación de nuestro documento de indicadores.
- `numero_cursada` permite medir el **recursado**, y `Correlatividades` permite construir el indicador de **cuellos de botella**. Las dos son vacancias que marcamos en el documento de indicadores.

### 7. Tutorías y seguimiento de intervenciones

- **Perceptron:** el alumno elige un tutor y una fecha, y ve los horarios libres según la base Disponibilidad.
- **TransIT:** "Solicitar tutoría" y una bandeja docente de solicitudes pendientes.
- **GLASS GROUP:** "Encuestas Tutor", una ficha post-entrevista con riesgo percibido por el tutor, factores económicos, personales e institucionales, y acciones acordadas.
- **Parser:** un registro de intervenciones con origen de la alerta, resultado y acción posterior.

**Para nosotros:** nuestra tarjeta "Solicitar Entrevista" (Req 11) puede combinar el flujo de turnos de Perceptron con la ficha post-entrevista de GLASS GROUP.

### 8. Carga de notas de 1.er año

- **TransIT:** importación por **CSV/XML al libro de calificaciones** nativo, con un semáforo por porcentaje.
- **GLASS GROUP:** importa un CSV de alta de alumnos y un CSV de notas a su propia base.
- **APEX:** base con *Materia × Cohorte × Instancia de evaluación × Nota*, que es justo "nota por parcial", como pide nuestro diseño de la Etapa 1.

### 9. Control de completitud de encuestas y mensajería — GLASS GROUP

Un tablero filtra a los alumnos por "Sin encuesta inicial", "Sin cuatrimestral" o "En estado de deserción", y les manda un **mensaje interno de Moodle** de forma masiva. Una base de *cooldown* evita mandar dos veces el mismo mensaje.

### 10. Detalles de UX que vale la pena copiar

- Un botón "Mostrar configuración de actividad" que vuelve a mostrar la navegación de Moodle oculta (GLASS GROUP y LuminaTech).
- Overlay de carga, *cooldown* en "Actualizar datos" y exportación a CSV con BOM para que Excel lo abra bien (GLASS GROUP y Parser).
- Microcopy que explica el propósito, el tiempo estimado y la confidencialidad (Koru).
- Validación previa de sesión y formulario antes de escribir, con mensajes de error claros (Perceptron).

## ⚠️ Alertas para Zhakyz

1. **Nuestro `section/section_sample/content.html` usa bases de TransIT.** Los CMID 59386 (*Encuestas*), 59387 (*Encuestas Iniciales*) y 59405 (*Fecha Actual*), con sus campos 519–522, 551 y 552, son bases que están **dentro de la sección de TransIT**, en la subsección "Bases de Datos". Con esa configuración nuestro menú leería y escribiría datos de otro equipo. Hay que **crear nuestras propias bases en la sección Zhakyz** y actualizar los IDs, idealmente con un JSON de configuración (idea 3).
2. **ADR-001 dice "sin CDNs" porque "Moodle puede bloquear `<script src>`".** El relevamiento muestra que **Chart.js desde jsDelivr funciona** (GLASS GROUP y Parser). La regla puede seguir siendo válida por simplicidad, pero la razón técnica ya no aplica. Conviene revisar el ADR si queremos gráficos.
3. **Encuestas anónimas:** si usamos *Encuesta* (feedback), tiene que ser en modo **con nombre**. Si no, no se pueden cruzar las respuestas con el alumno.
4. **La sección Zhakyz sigue sin contenido real.** Varios equipos ya tienen sistemas funcionales.

## Prioridades sugeridas (qué tomar primero)

1. Crear **nuestras bases** en la sección Zhakyz y una base `config` con JSON → corrige la alerta 1 y aplica la idea 3.
2. Adoptar la **fórmula IRD Z/Z_max** con pesos configurables, más la **ralentización**, para nuestro semáforo (ideas 1 y 2).
3. Usar el **modelo de datos de Perceptron** como base para Estudiantes, Asignaturas, Correlatividades y Situación académica (idea 6), con cohorte `AAAA-nC`.
4. Agregar **snapshots por cuatrimestre** desde el principio (idea 4).
5. Tutorías: turnos con disponibilidad y ficha post-entrevista (idea 7).
6. Mantener el **semáforo nativo de Córvax** como respaldo (idea 5).
