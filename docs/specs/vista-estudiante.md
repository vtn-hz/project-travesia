# Especificación: Vista del estudiante (Mi Trayectoria) e Información personal

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Ticket:** [SCRUM-24](https://zhakyz.atlassian.net/browse/SCRUM-24) · rama `feat/SCRUM-24-vista-estudiante`. Cambios posteriores: [SCRUM-27](https://zhakyz.atlassian.net/browse/SCRUM-27) (sin Encuesta Inicial y parciales en los dos tramos) y [SCRUM-29](https://zhakyz.atlassian.net/browse/SCRUM-29) (sin la pregunta de Ingeniería Industrial)
- **Archivos (dos Páginas de Moodle):**
  - [`section/vista_estudiante/content.html`](../../section/vista_estudiante/content.html): Mi Trayectoria, la pantalla de entrada del estudiante;
  - [`section/informacion_personal/content.html`](../../section/informacion_personal/content.html): carga y edición de la información personal.
- **Rol:** EST (estudiante).
- **Estado:** SCRUM-27 y SCRUM-29 en **local, sin publicar** (2026-11-14): en Moodle sigue la versión anterior. Antes, **publicado el 2026-11-02** (Mi Trayectoria, cmid 60264; Información personal, cmid 60265; base Estudiantes, d=206; [`DEPLOY.md`](../../DEPLOY.md)). Desde el [ADR-009](../decisions/009-cierre-de-periodo-y-omision.md) (local, sin publicar) las dos Páginas leen el período vigente de la base Períodos.
- **Última actualización:** 2026-11-14 (SCRUM-27 y SCRUM-29)

---

## Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Datos personales | Van en la base **Estudiantes**, una entrada por estudiante que se edita. No son una encuesta | No deben generar historial en Respuestas ni disparar criticidad |
| Dónde se cargan | En una **Página propia de Moodle** (Información personal), no dentro de Mi Trayectoria | Pedido del equipo |
| Encuesta Inicial | **Retirada** (SCRUM-27, 2026-11-14): Mi Trayectoria no la muestra | Sus preguntas ya están en la Información personal y en la Cuatrimestral ([ADR-008](../decisions/008-encuesta-inicial-y-datos-personales.md), opción C). Está decidido borrar la actividad y sus entradas en Respuestas y en Criticidad; todavía sin ejecutar |
| Parciales de primer año | Habilitada en **los dos tramos** (SCRUM-27) | Quien está en 2.º año y recursa materias de 1.er año sigue rindiendo sus parciales |
| Tramo | Campo `es_primer_anio`. Sale de "¿Cursa o aprobó Proyecto de Ingeniería Industrial I?": No → `si` (1.er año); Sí → `no` (2.º año en adelante) | Criterio de la [spec de la carga de notas](carga-parciales-primero.md); el campo nombra el tramo y no la pregunta |
| Ingeniería Industrial | **No se pregunta** (SCRUM-29, 2026-11-14): el formulario aparece directo. Antes, la primera vez se preguntaba "¿Es estudiante de Ingeniería Industrial?" y con "No" no se guardaba nada | Pedido del equipo |
| Nombre de la sección | **Mi Trayectoria** (la carpeta sigue siendo `section/vista_estudiante`) | Pedido del equipo |
| Nombre, apellido y correo | La primera vez se precargan con la cuenta de Moodle. Al guardar quedan en la base, y desde ese momento se usan los de la base | Pedido del equipo |
| Criticidad e historial de estados | No se muestran (por ahora) | Pedido del equipo |

## Mi Trayectoria

Diseño del detalle del estudiante: **perfil a la izquierda** y, a la derecha, la tarjeta **Información personal** y la grilla de 3 secciones.

- **Perfil:** iniciales o foto del campus, nombre y apellido, tramo y cohorte, id de usuario, DNI, correo y fecha de carga. Antes de cargar la información personal muestra los datos de la cuenta ("Perfil del campus"); después, los de la base ("Perfil del estudiante").
- **Tarjeta Información personal:**
  - sin entrada: chip "Sin cargar", aviso "Para usar todas las secciones se debe cargar la información personal" y el botón **Cargar información personal**;
  - con entrada: ingreso y año de la carrera, y el botón **Editar información personal**.
  - Los dos botones abren la Página Información personal.

### Período vigente ([ADR-009](../decisions/009-cierre-de-periodo-y-omision.md), local)

- La tarjeta de la Encuesta Cuatrimestral muestra el período vigente y, si no está respondida, "Responder hasta el …" (o "La fecha límite fue el …: la encuesta sigue abierta hasta el cierre del período").
- **Volver a responder:** con una Cuatrimestral de un período anterior y ninguna del vigente, un aviso arriba de las secciones: "Finalizó el período 2026-2. Se debe responder la Encuesta Cuatrimestral del período 2027-1 (1.er cuatrimestre 2027) hasta el …". Desaparece al responder.

### Secciones por tramo

| Sección | Sin información personal | 1.er año | 2.º año en adelante |
|---|---|---|---|
| Encuesta Cuatrimestral | Deshabilitada: "Requiere cargar la información personal" | Deshabilitada: "Disponible a partir de 2.º año" | Habilitada, con estado del período vigente (base Períodos, [ADR-009](../decisions/009-cierre-de-periodo-y-omision.md)) y su fecha límite |
| Parciales de primer año | Deshabilitada | **Habilitada** (Página 60209) | **Habilitada** (SCRUM-27): notas de las materias de 1.er año que todavía se cursan |
| Entrevistas y Tutorías | Deshabilitada | **Habilitada** (Página 60198) | **Habilitada** |

- El botón de una sección deshabilitada dice qué falta o desde cuándo está disponible; nunca "No disponible".
- Una sola acción principal: sin información personal, *Cargar información personal*; en 1.er año, Parciales; en 2.º año en adelante, la Encuesta Cuatrimestral si está pendiente y, si no, Entrevistas.
- La encuesta se abre con su portada, `/mod/feedback/view.php?id=<cmid>`, que al estudiante le muestra el botón para responder. `complete.php` da error a quien no puede responder (el equipo, con rol de profesor). Al terminar, la encuesta muestra "Sus respuestas han sido guardadas. Gracias." y a los 5 segundos vuelve a Mi Trayectoria ([`section/encuestas_despues_de_enviar`](../../section/encuestas_despues_de_enviar/content.html), en la "Página después de enviar"). Su estado sale de las entradas propias de Respuestas del período actual.
- Las notas que carga un estudiante de 2.º año en adelante quedan en CargaParcialesPrimero y en el historial de Criticidad, pero su criticidad calculada sigue saliendo de la última Cuatrimestral ([ADR-008](../decisions/008-encuesta-inicial-y-datos-personales.md)).

## Información personal (Página propia)

- **Encabezado:** "Cargar información personal" o "Editar información personal", y el botón *Volver a Mi Trayectoria*.
- **Primera vez:** el formulario aparece directo, con nombre, apellido, correo y DNI precargados de la cuenta de Moodle. Desde SCRUM-29 no se pregunta si es estudiante de Ingeniería Industrial.
- **Edición:** el mismo formulario, precargado con los datos de la base.
- Al guardar, un aviso confirma y enlaza a Mi Trayectoria. *Cancelar* vuelve a Mi Trayectoria sin guardar.

| Bloque | Campo | Reglas |
|---|---|---|
| Datos personales | Nombre, Apellido | Obligatorios |
| | DNI | Editable, de 7 a 9 números. Se precarga con el nombre de usuario de la cuenta |
| | Correo electrónico | Opcional; formato `nombre@dominio.com` |
| Carrera | ¿Cursa o aprobó Proyecto de Ingeniería Industrial I? | Obligatorio. Define el tramo |
| | Año de ingreso | De 2000 al año actual |
| | Cuatrimestre de ingreso | 1 o 2; no puede ser un cuatrimestre que todavía no empezó |

- Cada error indica el campo, el valor recibido y lo esperado.
- Al guardar: si no hay entrada propia, se crea (antes se vuelve a leer la base para no duplicarla); si hay, se edita la misma. `periodo_paso_superior` se completa con el período actual cuando `es_primer_anio` pasa de `si` a `no`.
- **Cuenta de Moodle:** nombre, apellido y correo salen de `/user/edit.php`; si el campus no deja verla, de `/user/profile.php` (el nombre completo va en Nombre y el estudiante lo separa). El DNI, de `/login/change_password.php`.

## Base Estudiantes

Definición: [`BASE_ESTUDIANTES.json`](../../data/moodle/BASE_ESTUDIANTES.json). Plantilla de lista: [`plantillas/estudiantes/`](../../data/moodle/plantillas/estudiantes/) (`.zk-registro` con `data-rid` y `data-campo`, para `LeerBase`; la fecha de modificación va en la celda `_modificada`, columna Modificada, porque `##timemodified##` es HTML y rompe un atributo).

| Campo | Para qué |
|---|---|
| `id_usuario` | Encontrar la entrada propia |
| `dni` | Cruzar con Respuestas, CargaParcialesPrimero y Entrevistas |
| `nombre`, `apellido`, `email` | Perfil del estudiante (desde que se guardan, en lugar de la cuenta) |
| `es_primer_anio` | Tramo (`si` = 1.er año): habilita y deshabilita las secciones |
| `anio_ingreso`, `cuatrimestre_ingreso` | Cohorte del perfil e indicadores por cohorte |
| `periodo_paso_superior` | Cuándo pasó a 2.º año, sin guardar un historial |

Configuración: "requiere aprobación" sin aprobar entradas (cada estudiante ve y edita solo la suya; el equipo, todas). No se guardan: la situación laboral (la pregunta la Encuesta Cuatrimestral), el tramo (se calcula), el plan, la criticidad ni las fechas de alta y modificación (las guarda Moodle).

## Vista previa local

Abrir `section/vista_estudiante/content.html` en el navegador. La barra permite ver la pantalla como cada integrante (DNI y correos ficticios), y `#usuario=<id>` en la dirección lleva el mismo estudiante a la Página Información personal y de vuelta. Lo que se guarda en la vista previa queda en el navegador (`localStorage`, clave `zk-preview-estudiantes`); *Restablecer datos de prueba* lo borra.

| Integrante | Caso |
|---|---|
| Luca Zuanetti | 1.er año, información cargada |
| Gian Luca Distefano | 1.er año; la base tiene otro correo que la cuenta (se ve el de la base) |
| Santiago Nicolás Yanosky | Sin información personal: todo deshabilitado |
| Nicolás Gabriel Zuviria | 2.º año en adelante, Cuatrimestral del período anterior: debe volver a responder |
| Nahuel Spikerman | 2.º año en adelante, Cuatrimestral respondida |
| Valentino Hernández Pascual | 2.º año en adelante, Cuatrimestral pendiente |

**Verificado (2026-11-02, Playwright, `file://`):** Mi Trayectoria en los casos de 1.er año, 2.º año y sin información, a 1000 px y 400 px, sin desborde ni errores de consola, sin el subtítulo ni la descripción de la Encuesta Inicial y sin pestañas. Con Santiago: *Cargar información personal* abre la otra Página; sin respuesta y con "No", el formulario queda oculto y Guardar deshabilitado ("No" muestra el aviso de Ingeniería Industrial); con "Sí", aparece precargado con la cuenta; errores de validación; guardado como 1.er año; *Volver a Mi Trayectoria* muestra las secciones de 1.er año con los datos de la base; editar (sin la pregunta de Industrial) y pasar a 2.º año cambia las secciones; *Restablecer datos de prueba* vuelve a deshabilitar todo.

**Verificado (2026-11-14, Playwright, `file://`, SCRUM-27 y SCRUM-29):** Mi Trayectoria con los 5 casos, a 1000 px y 400 px, sin desborde ni errores de consola: tres tarjetas, sin la Encuesta Inicial; en 1.er año la Cuatrimestral dice "Disponible a partir de 2.º año" y la acción principal es Parciales; en 2.º año en adelante, Parciales habilitada y la acción principal es la Cuatrimestral pendiente o, respondida, Entrevistas. Información personal con Santiago: el formulario aparece directo y precargado, sin la pregunta de Ingeniería Industrial; errores de validación; guardado como 2.º año y vuelta a Mi Trayectoria con sus secciones.

## Documentos relacionados

Actualizados con este cambio:

| Documento | Qué cambia |
|---|---|
| [Modelo de datos](../models/datos/MODELO_SIMPLIFICADO_MOODLE.md) | Base 4 (Estudiantes) redefinida, relaciones y privacidad |
| [Carga de parciales de 1.er año](carga-parciales-primero.md) | El criterio de 2.º año ya se aplica: Mi Trayectoria habilita la carga solo en 1.er año |
| [Encuesta Inicial](encuesta-inicial.md) | Acceso desde Mi Trayectoria, habilitada desde 2.º año; la encuesta no cambia |
| [Criticidad de las encuestas](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md) | En 1.er año la criticidad sale solo de las notas; revisar la parte laboral de la Inicial |
| [Entrevistas](entrevistas.md) y su [README](../../section/entrevistas/README.md) | El estudiante llega desde Mi Trayectoria; falta detectar el rol EST |
| [Detalle del estudiante](detalle-estudiante.md) y [tablero](tablero-estudiantes.md) | Etapa y cohorte salen de la base Estudiantes (`es_primer_anio`, `anio_ingreso`, `cuatrimestre_ingreso`) |
| [Main menu](main-menu.md) | Las tarjetas EST quedan reemplazadas por Mi Trayectoria |
| [`DEPLOY.md`](../../DEPLOY.md), [changelog](../changelog.md) y [equipo](../context/EQUIPO_ZHAKYZ.md) | Estado local de las dos Páginas y de la base |

## Pendientes (cada paso en Moodle, con confirmación)

1. Crear la base Estudiantes en la subsección Database con sus plantillas y cargar sus ids.
2. Crear las dos Páginas y decidir cómo llega el estudiante desde el Hub, que todavía no detecta roles.
3. Probar la lectura de la cuenta con un estudiante real (`/user/edit.php` puede no estar permitido).
4. Entrevistas y Tutorías todavía abre como ADM en Moodle (no detecta el rol EST).
5. ~~`PERIODO_ACTUAL` está repetido en Tools y en la vista.~~ Resuelto en local por el [ADR-009](../decisions/009-cierre-de-periodo-y-omision.md): las dos leen `PeriodoVigente()`.
