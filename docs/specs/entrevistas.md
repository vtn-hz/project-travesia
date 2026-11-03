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

- Si el usuario está en más de un grupo, la prioridad es Tutor, Asesor par y Estudiante. Si tiene más de un rol en el curso, la prioridad es Profesor, Profesor sin permiso de edición y Estudiante.
- Los grupos se leen con el servicio AJAX `core_group_get_course_user_groups`. Si ese servicio no responde, se buscan los nombres de los grupos en el perfil del usuario en el curso (`/user/view.php?id=<id>&course=1732`).
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
- Solo ese acompañante o un ADM gestionan la entrevista (aceptar, contraofertar, registrar el resultado, cancelar).
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

## Pendientes

- Publicar en Moodle la detección del rol por grupo (ver *Detección del rol en Moodle*) y verificar en el campus qué método responde.
- **Lado del estudiante (Req 11):** con permisos de `mod_data`, un estudiante solo edita sus propias entradas y no puede leer una base del equipo. Para que pida, acepte o contraoferte hace falta una tercera base donde solo agregue entradas, con "Requiere aprobación", o un mensaje de Moodle. Queda fuera del modelo reducido.
- Enlazar "Solicitar entrevista" desde el tablero y el detalle (`#usuario=<id>`).
