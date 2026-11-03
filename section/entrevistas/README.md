# Entrevistas y Tutorías

> **Publicado en Moodle** el 2026-11-01: Página "Entrevistas y Tutorías" (cmid 60198) en la subsección Hub de Zhakyz. Se abre desde el botón "Abrir agenda" de la tarjeta Entrevistas y Tutorías del Hub, y el resumen de Zhakyz la oculta del listado del curso (fuera del modo edición).

| | |
|---|---|
| Archivo | [`content.html`](content.html) |
| Estado | **Publicado** |
| En Moodle | Página cmid 60198 (`paginas.entrevistas`), conectada a la base Entrevistas (cmid 60197, d=202) en la subsección Database |
| Especificación | [`docs/specs/entrevistas.md`](../../docs/specs/entrevistas.md) |
| Base | [`BASE_ENTREVISTAS.json`](../../data/moodle/BASE_ENTREVISTAS.json), con su plantilla de lista en [`data/moodle/plantillas/entrevistas/`](../../data/moodle/plantillas/entrevistas/) |

## Cómo guarda los datos

- Cada entrevista es una entrada de la base Entrevistas con sus **involucrados** (DNI, nombre y cuenta del estudiante; tipo, cuenta y nombre del acompañante), su estado y sus fechas. No hay base de asignaciones: Acompañamientos se eliminó el 2026-11-01.
- El acompañante es el usuario de la sesión que pide la entrevista (`M.cfg.userId` y el nombre del menú de usuario de Moodle).
- Todos los roles ven todas las entrevistas, y no se puede pedir otra a un DNI que ya tiene una activa.
- **Destinatario y mensaje:** al enviar la solicitud, el destinatario (estudiante, o tutor o asesor par) se busca entre los participantes del curso; si no se encuentra uno solo, sale un error y no se guarda. Después de guardar, se le envía un mensaje del campus (`core_message_send_instant_messages`). Ver la [especificación](../../docs/specs/entrevistas.md).
- **Quién pide:** un tutor o asesor par escribe el nombre y el DNI del estudiante; un estudiante (rol EST) elige al tutor o asesor par de una lista con los integrantes de los grupos `Zhakyz_Tutor` y `Zhakyz_AsesorPar` (`GRUPO_TUTOR` y `GRUPO_ASESOR_PAR`, desde `grupos` de `moodle.config.json`). El estudiante ve solo sus entrevistas. En Moodle el rol sale del grupo del usuario (ver Pendiente, punto 1).
- La Página lee la base desde `/mod/data/view.php`. La plantilla de lista es una tabla con el formato de la base Materias (una fila `tr.zk-registro` con `data-rid` por entrevista); cada campo va como texto en un elemento con `data-campo="…"`, y los que no se muestran (cuentas, `propuestas_json` y `acciones_json`) van en una celda oculta. **No usar atributos `data-*` para los campos:** Moodle no escapa las comillas del texto y un JSON o un motivo con comillas corta el atributo. Si se cambia la plantilla, subirla con `node .skills/publicar-seccion/subir_plantillas.js --clave entrevistas`.
- Para guardar, usa los `field_<id>` de la base (`CAMPOS_ENTREVISTAS`, 1339 a 1353). Si se recrean los campos, hay que actualizarlos.
- **Respuestas** (publicado el 2026-11-03): Moodle solo deja editar una entrada a su autor y a los profesores. Cuando acepta o propone una fecha alguien que no es el autor (el estudiante, en una entrevista que pidió el tutor o el asesor par), se guarda una entrada nueva a su nombre en la base [RespuestasEntrevistas](../../data/moodle/BASE_RESPUESTAS_ENTREVISTAS.json), y la Página la aplica a la entrevista al leerla (`combinar()`). Cuando abre la página el autor de la entrevista o un administrador, `actualizarBase()` guarda esas respuestas en la entrada de Entrevistas, así la base queda al día. Las reglas están en la [especificación](../../docs/specs/entrevistas.md). Base cmid 60299 (d=208), campos 1398 a 1403 en `CAMPOS_RESPUESTAS_ENTREVISTAS`.

## Pendiente

1. **Detección de roles por grupo** (publicada el 2026-11-03, falta probarla con cuentas de cada rol): `Zhakyz_Tutor` → TUT, `Zhakyz_AsesorPar` → PAR, `Zhakyz_Estudiante` → EST. Sin ninguno de esos grupos, el rol del curso: Profesor → ADM, Profesor sin permiso de edición → TUT, Estudiante → EST. Está en `GRUPOS_ROL`, `ROLES_CURSO` y `detectarRol()`. Al publicar, verificar en el campus qué método responde (el servicio `core_group_get_course_user_groups` o el perfil del usuario en el curso) y que el perfil muestre los roles.
2. **Lado del estudiante** (aceptar o reprogramar): resuelto con la base RespuestasEntrevistas (publicado el 2026-11-03). Falta probarlo con una cuenta que solo sea Estudiante. El estudiante llega desde Mi Trayectoria (`section/vista_estudiante`, tarjeta *Entrevistas y Tutorías*) y se lo reconoce como EST por el grupo `Zhakyz_Estudiante`.

## Cómo verla en local

Abrir `content.html` en el navegador (`file://` o Live Server). Aparece la barra de vista previa para ver como ADM, TUT o PAR, con datos de prueba de los integrantes de Zhakyz. Lo que se guarda queda solo en la pantalla.
