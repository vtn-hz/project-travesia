# Especificación: Entrevistas y Tutorías

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/entrevistas/content.html`
- **Acceso:** tarjeta "Entrevistas y Tutorías" del [menú inicial](../../section/menu_inicial/content.html) (en local, `btn-entrevistas`). Con `#usuario=<id de Moodle>` abre la solicitud con ese estudiante elegido (para enlazarla desde el tablero o el detalle).
- **Roles:** ADM, TUT y PAR. GES no entra. La vista del estudiante (pedir entrevista, aceptar o contraofertar desde su lado) es otra sección y queda fuera del modelo reducido (ver Pendientes). Desde SCRUM-24 (local), [Mi Trayectoria](vista-estudiante.md) enlaza a esta Página con la tarjeta *Entrevistas y Tutorías* para todos los estudiantes; el rol EST se detecta por el grupo `Zhakyz_Estudiante` (ver *Detección del rol en Moodle*).
- **Requerimientos:** Req 5 (Dashboard Entrevistas: solicitudes, registro de realizadas e histórico), Req 11 (gestión de entrevistas) y RNF 1 (proactividad: programar antes de que el estudiante abandone).
- **Estado:** **en revisión**, desarrollado en local con datos de prueba. **No publicado en Moodle** y no se publica hasta terminar la revisión ([`README` de la sección](../../section/entrevistas/README.md)).

## Qué ve cada rol

| Rol | Entrevistas que ve | Puede gestionar |
|---|---|---|
| **ADM** | Todas, con filtro por acompañante | Todas |
| **TUT** | Las de los estudiantes que tiene asignados como tutor | Las suyas |
| **PAR** | Las de los estudiantes que acompaña como asesor par (Req 11: mismos permisos que el tutor) | Las suyas |

"Asignados" sale de la base **Acompañamientos** (11): cada entrada une un estudiante con su tutor o su asesor par. En la vista previa local, TUT es Valentino Hernández Pascual y PAR es Nahuel Spikerman. En Moodle será el usuario de la sesión (`M.cfg.userId`, a verificar en el campus) junto con la detección de roles por grupo.

"Ver detalle del estudiante" solo aparece para ADM y TUT, porque el [detalle](detalle-estudiante.md) no incluye a PAR.

### Detección del rol en Moodle

Desde el 2026-11-02 (local), la Página toma el rol del grupo del usuario de la sesión en el curso 1732:

| Grupo de Moodle | Rol |
|---|---|
| `Zhakyz_Tutor` | TUT |
| `Zhakyz_AsesorPar` | PAR |
| `Zhakyz_Estudiante` | EST |

Si no está en ninguno de esos grupos, se usa su rol en el curso:

| Rol del curso | Rol |
|---|---|
| Profesor (con permiso de edición, `roleid` 3) | ADM |
| Profesor sin permiso de edición (`roleid` 4) | TUT |
| Estudiante (`roleid` 5) | EST |

- **Orden:** 1) el grupo; 2) el rol elegido con "Cambiar rol a…"; 3) el rol del curso. El grupo siempre manda: quien está en un grupo `Zhakyz_*` ve la vista de ese grupo aunque cambie el rol.
- **"Cambiar rol a…"** (2026-11-03) se mira solo si el usuario no está en ningún grupo `Zhakyz_*`. Con el rol cambiado, Moodle marca la página con `body.userswitchedrole`, pero no muestra cuál rol se eligió, y el perfil sigue mostrando los roles reales. El rol simulado se deduce de sus permisos: si abre la gestión de grupos (`/group/index.php`), es Profesor → ADM; si abre los registros del curso (`/report/log/index.php`), es Profesor sin permiso de edición → TUT; si no abre ninguna, es Estudiante → EST. Probado en el campus con la cuenta del equipo: Estudiante → EST y Profesor sin permiso de edición → TUT.
- Una cuenta con los roles Profesor y Estudiante a la vez (como las del equipo) entra como ADM. Para ver la vista del estudiante se usa "Cambiar rol a… Estudiante".
- Si el usuario está en más de un grupo, la prioridad es Tutor, Asesor par y Estudiante. Si tiene más de un rol en el curso, la prioridad es Profesor, Profesor sin permiso de edición y Estudiante.
- Los grupos se leen con el servicio AJAX `core_group_get_course_user_groups`. Si ese servicio no responde, se buscan los nombres de los grupos en el perfil del usuario en el curso (`/user/view.php?id=<id>&course=1732`). **En el campus el servicio está deshabilitado** ("El servicio Web no está disponible", verificado el 2026-11-03), así que siempre se usa el perfil. El texto del perfil se arma nodo por nodo, separado por espacios: con `textContent`, el nombre del último grupo queda pegado al bloque siguiente y no se reconoce.
- Los roles del curso se leen de ese mismo perfil: cada rol es un link con `roleid=<id>`. Se reconoce por el nombre y, si el campus le puso otro nombre, por el `roleid` estándar. Si Moodle no responde y no se puede leer ni el grupo ni el rol, se muestra la vista con menos permisos (EST, `ROL_SIN_DETECTAR`).
- La correspondencia está en `GRUPOS_ROL` y `ROLES_CURSO`, al principio del script. En la vista previa local el rol se sigue eligiendo con la barra.

## Pantalla

1. **Resumen** (cada tarjeta filtra la tabla): Por responder · Falta resultado · Programadas · Esperando · Realizadas.
2. **Pestañas Agenda / Historial**, búsqueda por estudiante, filtro de acompañante (solo ADM) y la acción principal **Solicitar entrevista**.
3. **Tabla:** estudiante (para ADM, con su acompañante; para asesor par, con la materia), fecha, origen, estado y la acción que corresponde. No se muestra el nivel de riesgo: el modelo reducido no lee Criticidad. En la agenda van arriba las que piden una respuesta o el resultado; en el historial, la más reciente primero.
4. **Modal de la entrevista:** estado, estudiante, acompañante, origen, motivo, la línea de tiempo de fechas propuestas (con las contraofertas y sus mensajes), el resultado y las acciones acordadas, y las acciones posibles.

## Estados

En la base se guarda el `estado` del modelo. Lo que se muestra se calcula (regla 5 del modelo simplificado: lo que se puede calcular no se guarda):

| Se muestra | Estado guardado | Condición | Acciones |
|---|---|---|---|
| **Por responder** | `solicitada` | La última fecha la propuso el estudiante | Aceptar fecha · Proponer otra fecha · Rechazar |
| **Esperando al estudiante** | `solicitada` | La última fecha la propuso el acompañante | Cambiar la fecha · Cancelar solicitud |
| **Programada** | `programada` | La fecha acordada todavía no pasó | Registrar resultado · Reprogramar · Cancelar |
| **Falta resultado** | `programada` | La fecha acordada ya pasó | Registrar resultado · No asistió |
| Realizada · No asistió · Rechazada · Cancelada | igual | — | Solo lectura (en las realizadas, el estado de cada acción acordada se puede actualizar) |

- **Aceptar** pasa a `programada` con la última fecha propuesta.
- **Proponer otra fecha / Reprogramar** agrega una propuesta del acompañante y vuelve a `solicitada`.
- **Registrar resultado:** fecha en que se hizo (no futura), resultado obligatorio y acciones acordadas (tipo de derivación, descripción y fecha de seguimiento). Pasa a `realizada`.
- **Rechazar, cancelar y no asistió** piden un comentario opcional, que se guarda en `resultado`.
- Después de una entrevista realizada, el modal invita a asignar el estado de criticidad en el detalle del estudiante (Req 10).
- En la vista previa local, "Esperando al estudiante" tiene un botón para simular que el estudiante acepta.

Colores (skill `diseno-ui`): naranja = te toca actuar; azul = programada; gris = esperando o cerrada sin entrevista; verde = realizada; rojo = no asistió. Siempre punto + texto.

## Datos: una sola base (Entrevistas)

Desde el 2026-11-01 la sección funciona con **una sola base** de la sección Zhakyz, sin depender de Estudiantes, Criticidad ni Alertas. La base Acompañamientos (asignaciones fijas de tutor o asesor par) se eliminó: cada entrevista guarda a sus **involucrados**, su estado y sus fechas.

| Base | Definición | Uso en la página |
|---|---|---|
| **Entrevistas** (cmid 60197, d=202) | [`BASE_ENTREVISTAS.json`](../../data/moodle/BASE_ENTREVISTAS.json) | Lectura y edición (una entrada por entrevista; cambia de estado) |

Campos: involucrados (`dni`, `id_usuario_estudiante`, `nombre_estudiante`, `tipo_acompanante`, `id_usuario_acompanante`, `nombre_acompanante`), `originada_por`, `estado`, `motivo`, fechas (`fecha_solicitud`, `fecha_programada`, `fecha_realizada`), `resultado`, `propuestas_json` y `acciones_json`.

### Diferencias con el modelo simplificado

| Modelo simplificado | Este modelo | Por qué |
|---|---|---|
| Entrevistas se relaciona con **Acompañamientos** por `rid_acompanamiento` | Entrevistas guarda copia del estudiante y del acompañante | No mantener una base de asignaciones; el acompañante es quien pide la entrevista |
| El nombre y la cuenta del estudiante salen de **Estudiantes** (por `dni`) | Se escriben al pedir la entrevista | No depender de la base Estudiantes |
| El nombre del acompañante sale del perfil del campus | `nombre_acompanante`, tomado del menú de usuario de Moodle | Una base de Moodle no puede mostrar el nombre de otro usuario |
| Entrevistas tiene `rid_alerta` | Se quita | No hay base Alertas |
| Contraofertas: no previstas | `propuestas_json` | Req 11 |
| El nivel de riesgo sale de **Criticidad** | No se muestra | No hay base Criticidad |

**Costo de las copias:** si cambia el nombre de alguien, queda el nombre viejo en sus entrevistas anteriores.

Ids en [`moodle.config.json`](../../moodle.config.json): `bases.entrevistas` y `paginas.entrevistas`. Los `field_<id>` de Entrevistas van en `CAMPOS_ENTREVISTAS`, al principio del script (1339 a 1353).

### Reglas que controla la página

- **Todos los roles (ADM, TUT y PAR) ven todas las entrevistas**, con el nombre de quien la lleva, para que dos acompañantes no entrevisten al mismo estudiante.
- El acompañante de una entrevista es el **usuario de la sesión que la pidió** (`M.cfg.userId` y el nombre del menú de usuario). "Participa como" (tutor o asesor par) sale del rol y se puede cambiar.
- **Gestionan los involucrados** (publicado el 2026-11-03): el estudiante de la entrevista puede aceptar la fecha o reprogramarla; el acompañante (tutor o asesor par) puede aceptar, reprogramar, cancelar o rechazar y registrar el resultado; un ADM gestiona cualquiera como acompañante.
- **Quien hizo la última propuesta de fecha no la acepta:** la acepta la otra parte o se espera su contraoferta. Reprogramar deja la fecha nueva como propuesta de quien reprograma.
- **Respuestas de quien no es el autor** (publicado el 2026-11-03): en una base de datos de Moodle, cada usuario solo edita sus propias entradas (editar las de otros requiere `mod/data:manageentries`, que tienen los profesores y no los estudiantes). No se da ese permiso, porque dejaría a cualquier estudiante editar o borrar cualquier entrevista desde la base. En cambio:
  - **Edita la entrada** de Entrevistas su autor (quien la pidió: el acompañante si `originada_por = tutor`, el estudiante si `originada_por = estudiante`) y ADM.
  - **La otra parte responde con una entrada propia** en la base [RespuestasEntrevistas](../../data/moodle/BASE_RESPUESTAS_ENTREVISTAS.json) (`rid_entrevista`, `por`, `accion` = `aceptar` o `proponer`, `fecha`, `mensaje`, `creada`). Así el estudiante acepta o reprograma una entrevista que pidió el tutor o el asesor par, y un asesor par con rol Estudiante responde una que pidió el estudiante.
  - Al leer, la página **aplica las respuestas a cada entrevista** en orden de rid. Una respuesta vale solo si su autor según Moodle (`##user##` de la plantilla, no un campo del formulario) es la cuenta de la parte que indica `por`. `aceptar` vale si la fecha vigente la propuso la otra parte y es la misma que se acepta; `proponer`, si la entrevista sigue solicitada o programada. Las demás se ignoran (por ejemplo, si la entrevista se canceló antes).
  - La propuesta nueva guarda el rid de la respuesta en `respuesta`, y la aceptada lo guarda en `aceptada` (dentro de `propuestas_json`). Cuando el autor vuelve a guardar la entrevista, la respuesta queda incorporada y no se aplica dos veces.
  - Quien no es el autor solo acepta o propone fechas: rechazar, cancelar, registrar el resultado o la inasistencia y cambiar el estado de las acciones editan la entrada, y lo hacen el autor o un ADM.
  - Al aceptar o proponer una fecha, la otra parte recibe un mensaje del campus. Si el mensaje falla, el cambio queda guardado y se avisa.
  - Después de guardar, la página vuelve a leer la base y verifica que Moodle haya aplicado el cambio (en Entrevistas: estado, fecha acordada y cantidad de propuestas; en RespuestasEntrevistas: que la respuesta esté guardada a nombre del usuario y se haya aplicado). Si no, muestra el error.
  - Mientras la base RespuestasEntrevistas no esté creada (`bases.respuestas_entrevistas.cmid` en `null`), en Moodle solo acepta o propone el autor; la otra parte ve el error "la base RespuestasEntrevistas todavía no está creada en Moodle".
- **El destinatario se busca entre los participantes del curso y recibe un mensaje del campus** (local desde el 2026-11-03). Si pide un tutor o asesor par, se busca al estudiante: por la cuenta del campus si se indica y, si no, por nombre y apellido. Si pide el estudiante, **elige al tutor o asesor par de una lista** con los integrantes de los grupos `Zhakyz_Tutor` (4316) y `Zhakyz_AsesorPar` (4318) (`grupos` en `moodle.config.json`), separados en Tutores y Asesores pares, sin su propia cuenta; el tipo de acompañante sale del grupo (desde el 2026-11-03). La lista sale de la lista de participantes filtrada por grupo (`/user/index.php?id=1732&group=<id>`, solo las filas de `table#participants`; si la tabla muestra la columna Grupos, cada fila debe nombrar al grupo). Si los grupos están vacíos, la lista lo dice y no se puede enviar; si la lista no se puede leer, el campo vuelve a ser de texto y el nombre se busca entre los participantes. Si no hay un único participante con ese nombre (ninguno, varios, o una sola palabra escrita), aparece un error y la solicitud no se guarda.
  - Los participantes se leen de `/user/index.php?id=1732&perpage=5000` (cuenta y nombre; se quitan las iniciales del avatar). La cuenta encontrada se guarda en la entrevista (`id_usuario_estudiante` o `id_usuario_acompanante`).
  - Después de guardar, se envía el mensaje con el servicio `core_message_send_instant_messages` (habilitado en el campus): quién pide, la fecha propuesta, el motivo y el enlace a esta Página. Si el mensaje falla, la entrevista queda guardada y se avisa.
  - En la vista previa local se busca entre los integrantes de Zhakyz y no se envía ningún mensaje.
- **No se puede pedir una entrevista a un estudiante (por DNI) que ya tiene una activa** (por responder, esperando, programada o sin resultado). El aviso indica con quién la tiene.
- "Ver detalle del estudiante" necesita `id_usuario_estudiante`. Si falta, avisa.

## Datos de prueba (al 19/10/2026)

Los DNI son marcadores (`prueba-<id>`), no documentos reales.

| Estudiante | Acompañante | Entrevistas |
|---|---|---|
| Nicolás Zuviria | Valentino Hernández Pascual (tutor) | Realizada el 06/10, con dos acciones (coincide con el detalle) · Programada el 27/10 |
| Nahuel Spikerman | Luca Zuanetti (tutor) | Realizada el 10/10, tras una contraoferta (coincide con el detalle) · Cancelada en septiembre |
| Santiago Yanosky | Valentino Hernández Pascual (tutor) | No asistió el 13/10 · Por responder: el estudiante contraofertó el 23/10 |
| Gian Luca Distefano | Nahuel Spikerman (asesor par) | Falta resultado (16/10) · Por responder (la pidió el estudiante) |
| Luca Zuanetti | Valentino Hernández Pascual (tutor) | Esperando al estudiante (22/10) |

## Solicitud desde el Detalle del estudiante

Publicado el 2026-11-03. El Detalle del estudiante (se llega desde "Ver detalle" del Tablero de Criticidad) tiene el botón **"Solicitar entrevista"** arriba a la derecha, en la fila de "Volver al Tablero de Criticidad" (ADM y TUT; GES no lo ve). Abre esta Página con `#solicitar&usuario=<id>&dni=<dni>&nombre=<nombre>`:

- El formulario se abre solo, con el estudiante fijo (nombre, DNI y cuenta del campus, sin editar). Se completan **Participa como** (tutor o asesor par), la fecha y el motivo.
- Si el estudiante ya tiene una entrevista activa, el formulario lo avisa al abrirse (y al enviar, como siempre, no se guarda).
- Los datos se quitan de la dirección al abrir el formulario, para que no se vuelva a abrir al recargar o después de guardar. El estudiante (rol EST) no abre el formulario aunque llegue con esa dirección.
- Con solo `#usuario=<id>`, el formulario se abre con los campos editables, completados con lo que figura en otra entrevista de ese estudiante.

## Pendientes

- Probar en el campus la detección del rol (publicada el 2026-11-03) con una cuenta de cada grupo y de cada rol del curso, y ver qué método responde.
- **Probar las respuestas** (base RespuestasEntrevistas, cmid 60299, creada y publicada el 2026-11-03) con una cuenta que solo sea Estudiante: aceptar y reprogramar una entrevista pedida por un tutor.
- **Cierre por quien no es el autor:** un asesor par con rol Estudiante no puede rechazar, cancelar ni registrar el resultado de una entrevista que pidió un estudiante (lo hace un ADM). Si hace falta, se agregan esas acciones a RespuestasEntrevistas.
- Enlazar "Solicitar entrevista" desde el tablero (`#usuario=<id>`). Desde el detalle ya está (publicado el 2026-11-03).
