# Moodle — Secciones y herramientas disponibles

> Relevamiento del Campus Ingeniería UNMdP (curso de prueba `id=1732`) hecho en modo solo lectura el 2026-10-17.
> Complementa [ADR-001](../../decisions/001-arquitectura-general.md) y el [relevamiento de otros equipos](../research/RELEVAMIENTO_OTROS_EQUIPOS.md).

## Entorno

| Dato | Valor |
|------|-------|
| URL del curso | `https://ingenieria.campus.mdp.edu.ar/course/view.php?id=1732` |
| Versión | **Moodle 5.0.2** (los links de ayuda apuntan a `docs.moodle.org/502/es`) |
| Tema | Adaptable |
| Idioma | Español (`es`) |
| Organización | Una **sección por equipo** (Zhakyz, TransIT, GLASS GROUP, etc.) más la sección general `OyDI - AEEC` |
| Nuestra sección | `Zhakyz` → `course/section.php?id=15647`, restringida al grupo `2C2026-Zhakyz & Asociados` |

## Anatomía de una sección

Cada sección tiene su propia página (`/course/section.php?id=<id>`) y se compone de:

1. **Nombre y resumen.** El resumen acepta HTML y es donde la mayoría de los equipos pone el encabezado o banner con su marca.
2. **Actividades y recursos.** Se muestran en orden y cada uno tiene su propio `cmid`, que es el `id=` de la URL `/mod/<tipo>/view.php?id=<cmid>`.
3. **Subsecciones** (`mod_subsection`, disponible desde Moodle 4.5). Son secciones colapsables dentro de otra sección. Los equipos las usan para separar "Estudiantes" de "Docentes" o "Bases de datos". Ejemplos: TransIT tiene *Continuidad en la carrera - Alumno*, *Herramientas para Docentes* y *Panel de Control - Docente*.
4. **Restricciones de acceso**, que se aplican a la sección o a cada actividad:
   - **Grupo**: "No disponible hasta que se pertenezca al grupo 2C2026-X". Es el patrón que usan todos los equipos.
   - **Finalización de actividad**: "…hasta que la actividad Encuesta Inicial esté marcada como realizada". La usan Altiora y Corvax.
   - **Calificación en un rango**: "…hasta que haya alcanzado una puntuación dentro de cierto rango en *Estado de alerta*". Corvax la usa para mostrar una página distinta según el nivel de riesgo, es decir, un semáforo armado solo con herramientas nativas.
   - Cada restricción tiene un modificador **"(si no, ocultado)"**: el ícono del ojo decide si el alumno ve la actividad bloqueada o directamente no la ve.
5. **Visibilidad**:
   - *Ocultado a los estudiantes*: solo la ven los docentes.
   - *Disponible pero no visible en la página del curso*: el modo "stealth". La actividad existe y se puede abrir por URL, pero no aparece listada. Perceptron lo usa para su base `Estudiantes`.

## Cómo crear y editar una sección (paso a paso)

> Requiere rol con permisos de edición. Antes de tocar nada, hay que confirmar que estás **dentro de la sección Zhakyz**.

1. Entrar al curso → **Activar edición**, el interruptor arriba a la derecha.
2. Al final de la lista de secciones → **+ Añadir sección**. La sección nueva se crea vacía al final.
3. En el menú `⋮` de la sección → **Editar**:
   - **Nombre** de la sección.
   - **Resumen**: el editor HTML (TinyMCE) tiene un botón `</>` para pegar código.
   - **Restricciones de acceso** → *Añadir restricción* → *Grupo* → elegir el grupo del equipo.
4. Dentro de la sección → **+ Añadir una actividad o un recurso** → elegir el tipo (ver la tabla siguiente).
5. Para agrupar contenido: **Añadir actividad → Subsección**.
6. Para mover algo: arrastrar con el ícono de cruz, o usar `⋮` → *Mover*.
7. **Desactivar edición** al terminar.

### Dónde embeber HTML/JS propio

| Contenedor | Uso típico | Observaciones |
|------------|------------|---------------|
| **Área de texto y medios** (`mod_label`) | Banners, tarjetas y paneles que se ven directamente en la sección | Es lo que usan TransIT, Parser y Perceptron para menús y paneles inline |
| **Página** (`mod_page`) | Dashboards completos que se abren en su propia pantalla | GLASS GROUP, LuminaTech y Perceptron arman ahí sus tableros |
| **Resumen de la sección** | Encabezado y branding | Se renderiza arriba de todo |
| **Plantillas de Base de datos** (`mod_data`) | Cómo se ve cada entrada de la base | Se editan en *Plantillas* (lista, individual, añadir, etc.) |

## Herramientas instaladas

Verificado con `/mod/<tipo>/index.php?id=1732`: si la página respondió 200, el módulo está instalado. Que esté instalado no garantiza que aparezca en el selector de actividades para cualquier rol.

### Actividades

| Módulo | Nombre en español | Utilidad para SBIRE |
|--------|-------------------|---------------------|
| `data` | **Base de datos** | ⭐ La "base de datos" del sistema. Todos los equipos guardan ahí alumnos, notas, configuración e históricos |
| `feedback` | **Encuesta** (Feedback) | ⭐ Encuestas inicial y cuatrimestral. Tiene modo con nombre o anónimo, saltos de página y exportación a CSV |
| `quiz` | **Cuestionario** | Corvax lo usa como encuesta porque genera **calificación**, y la calificación permite restricciones por rango (semáforo nativo) |
| `choice` | **Consulta** | Votación de una opción. Corvax la usa para "Agendar tutoría" (elegir día y horario) |
| `assign` | Tarea | Entregas de archivos |
| `forum` | Foro | Avisos (el curso tiene "Avisos") |
| `scorm` | Paquete SCORM | Corvax subió un SCORM interactivo "Ver mis Correlatividades" |
| `lti` | Herramienta externa (LTI) | Integra aplicaciones externas. Altiora y Cauquén tienen herramientas configuradas |
| `wiki`, `glossary`, `lesson`, `workshop`, `h5pactivity`, `hvp` (H5P), `bigbluebuttonbn`, `attendance` (Asistencia), `ivs` (video interactivo), `customcert` (certificados) | — | Disponibles; ningún equipo los usa para el SBIRE |
| `subsection` | Subsección | Organización interna de la sección |
| `qbank` | Banco de preguntas | Soporte de `quiz` |

### Recursos

`page` (Página), `label` (Área de texto y medios), `book` (Libro), `folder` (Carpeta), `resource` (Archivo), `url`, `imscp`.

### No instalados (404)

`chat`, `survey` (la encuesta predefinida clásica), `questionnaire` (plugin de encuestas avanzado), `scheduler` (turnos), `checklist`. Por eso los equipos arman los turnos y las encuestas complejas sobre **Base de datos + JS**.

### Herramientas a nivel curso (menú "Más")

Participantes · Calificaciones · Informes · Bancos de preguntas · Banco de contenido · Finalización del curso · Insignias · Competencias · Filtros · Archivos de curso heredados · IVS Annotations · Herramientas Externas LTI · Papelera de reciclaje · Reutilización de curso (copias de seguridad e importación). Desde *Calificaciones* también se puede **importar notas por CSV o XML** (`grade/import/csv`, `grade/import/xml`), que es lo que usa TransIT para los parciales de 1.er año.

## Patrones técnicos para integrar JS con Moodle

Esto es lo que los equipos usan en la práctica. Es la "API" disponible sin plugins ni tokens de web service.

### Variables globales

```js
M.cfg.wwwroot   // https://ingenieria.campus.mdp.edu.ar
M.cfg.sesskey   // token anti-CSRF de la sesión, obligatorio para escribir
M.cfg.courseId  // 1732
M.cfg.userId    // id del usuario logueado (algunos lo leen del link al perfil como respaldo)
```

### Leer una Base de datos (GET + parseo de HTML)

```js
const r = await fetch(`${M.cfg.wwwroot}/mod/data/view.php?d=${DATAID}&perpage=100&page=${p}`);
const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
doc.querySelectorAll('.defaulttemplate-listentry'); // una entrada por elemento (plantilla por defecto)
```

- `id=<cmid>` y `d=<dataid>` son **IDs distintos**. GLASS GROUP agrega en su página de configuración una ayuda que explica cómo encontrar cada uno.
- Hay que paginar (`perpage` y `page`) o pedir `perpage=1000`.
- Lo que se parsea depende de la **plantilla de lista**. Si alguien la cambia, el parser se rompe. Algunos equipos meten un JSON entero en un campo *Área de texto* para no depender de la plantilla (por ejemplo `json_config` y `datos_json`).
- Para buscar entradas de un usuario se puede usar `&search=<userid>` (TransIT).

### Escribir en una Base de datos (POST)

```js
const fd = new FormData();
fd.append('d', DATAID);           // o 'id', CMID
fd.append('rid', 0);              // 0 = entrada nueva; rid existente = editar
fd.append('sesskey', M.cfg.sesskey);
fd.append('saveanddisplay', 'Guardar');
fd.append(`field_${FIELD_ID}`, valor);      // un campo por cada field_<id>
// los campos de fecha requieren field_<id>_day/_month/_year y _enabled=1
await fetch(`${M.cfg.wwwroot}/mod/data/edit.php`, { method: 'POST', body: fd });
```

- Los `field_<id>` se ven en *Base de datos → Campos* (`/mod/data/field.php?d=…`).
- Perceptron lo hace más robusto: primero descarga el formulario nativo `edit.php`, toma sus campos `field_\d+` y valida que coincidan antes de enviar.

### Otras integraciones vistas

| Necesidad | Cómo lo resolvieron |
|-----------|---------------------|
| Respuestas de Encuesta (feedback) | `GET /mod/feedback/show_entries.php?id=<cmid>&download=csv&sesskey=…` y parseo del CSV (GLASS GROUP, LuminaTech) |
| Enviar mensajes al alumno | Servicio AJAX `core_message_send_instant_messages` (GLASS GROUP, LuminaTech) |
| Datos del usuario | `/user/profile.php`, `/user/view.php`, `/user/index.php?id=1732` (participantes) |
| Gráficos | **Chart.js desde CDN** (`cdn.jsdelivr.net/npm/chart.js`): funciona dentro de Página y Área de texto (GLASS GROUP, Parser) |
| CSS | Bloques `<style>` o, más seguido, `document.createElement('style')` desde JS "para evitar la sanitización de etiquetas" |
| Ocultar el chrome de Moodle | Script que oculta la navegación y los títulos nativos, más un botón "Mostrar configuración de actividad" para volver a verlos |
| Fecha simulada para pruebas | Una base "Fecha Actual" con un campo fecha (TransIT), o una constante de período (GLASS GROUP) |

### Advertencias

- **Encuesta en modo "Anónima"** (Altiora, APEX): las respuestas no se pueden vincular al alumno, así que no sirven para calcular el riesgo individual. Hay que usar *"Los nombres de los usuarios se mostrarán y registrarán con las respuestas"*.
- El parseo de HTML depende del tema y de las plantillas. Conviene buscar elementos por texto o clase de forma tolerante, como hacen GLASS GROUP y LuminaTech con sus funciones `normalizeText` y `getRowValueByNormalizedKey`.
- Todo lo que el JS escribe queda a nombre del usuario que está viendo la página y respeta sus permisos. Un alumno no puede leer bases que no le estén habilitadas.
- Cada sección es de un equipo. **No hay que reutilizar bases de otra sección**: sus `cmid` y `field_id` pueden cambiar o borrarse sin aviso.
