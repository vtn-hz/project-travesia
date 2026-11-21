# Especificación: Ocultamiento por rol en Zhakyz (SCRUM-32)

> Documento vivo: se actualiza con cada cambio de acceso en Moodle. Reemplaza al relevamiento suelto `ocultar-por-roles-zhakyz.md` (2026-11-19/20), que queda integrado acá.

- **Alcance:** sección Zhakyz (15647) del curso 1732, Moodle 5.0.2. Solo actividades y bases de Zhakyz.
- **Requerimiento:** que cada rol (ADM, GES, TUT, PAR, EST) vea y use solo lo que le corresponde, y que un estudiante no pueda leer datos de otros ni modificar los catálogos del sistema.
- **Estado (2026-11-21):**

  | Capa | Qué es | Estado |
  |---|---|---|
  | **Ojo** | Acceso por rol a nivel actividad | **Aplicado** (2026-11-20 y antes). No queda ninguna actividad más a la que se le pueda poner |
  | **Capa 1** | Acceso por rol y autoría a nivel entrada de las bases | **Aplicada el 2026-11-21** en las 11 bases y verificada (ver [Registro de cambios](#13-registro-de-cambios-en-moodle)) |
  | **Capa 2** | Ocultamiento visual por rol (lista de la sección, Hub y, más adelante, plantillas de las bases) | **Publicada el 2026-11-21** (lista de la sección y Hub; [§10](#10-capa-2-ocultamiento-visual)). Falta la redirección en las plantillas de las bases |
- **Rol GES retirado (2026-11-21):** el gestor ya no se tiene en cuenta. Se quitó del Hub, de la lista de la sección y de la detección del rol. Lo que este documento dice de GES en la capa 1 (§3 y §7) queda como antecedente.
- **Fuente de los ajustes:** el bloque `ajustes_moodle` de cada [`data/moodle/BASE_*.json`](../../data/moodle/). Se aplican con [`ajustar_bases.js`](../../.skills/publicar-seccion/ajustar_bases.js) (ver [§11](#11-cómo-se-aplica-y-cómo-se-revierte)).

## Índice

1. [Resumen](#1-resumen)
2. [Las tres capas](#2-las-tres-capas)
3. [Roles y permisos de Moodle](#3-roles-y-permisos-de-moodle)
4. [Reglas de Moodle verificadas en el código](#4-reglas-de-moodle-verificadas-en-el-código)
5. [Estado de las actividades (ojo)](#5-estado-de-las-actividades-ojo)
6. [Estado de las bases (capa 1)](#6-estado-de-las-bases-capa-1)
7. [Análisis por base: por qué no rompe](#7-análisis-por-base-por-qué-no-rompe)
8. [Condiciones para que la capa 1 siga funcionando](#8-condiciones-para-que-la-capa-1-siga-funcionando)
9. [Lo que la capa 1 no protege](#9-lo-que-la-capa-1-no-protege)
10. [Capa 2: ocultamiento visual](#10-capa-2-ocultamiento-visual)
11. [Cómo se aplica y cómo se revierte](#11-cómo-se-aplica-y-cómo-se-revierte)
12. [Verificación](#12-verificación)
13. [Registro de cambios en Moodle](#13-registro-de-cambios-en-moodle)
14. [Decisiones abiertas y próximos pasos](#14-decisiones-abiertas-y-próximos-pasos)

## 1. Resumen

1. **Hoy ningún estudiante real entra a Zhakyz.** La sección está restringida al grupo `2C2026-Zhakyz & Asociados` (4264), y sus 6 integrantes tienen rol **Profesor**. Lo de este documento prepara el sistema para cuando se abra.
2. **Seguridad real solo la da Moodle (el servidor).** Un código o una clave dentro del JS de una página no protege nada: el script corre en el navegador del estudiante, con su sesión, y cualquiera lo lee con "Ver código fuente". Moodle no distingue un `fetch` de Tools de una visita manual.
3. **El ojo no se puede usar en las bases que usan las pantallas del estudiante.** Si una base está oculta, el estudiante recibe "actividad oculta" también por `fetch`, y Mi Trayectoria, Información personal, la Carga de notas, la Encuesta Cuatrimestral y Entrevistas y Tutorías dejan de funcionar. De las 11 bases, solo **Informes** no la usa ningún estudiante, y ya está oculta.
4. **La capa 1 restringe el contenido de las bases que quedan visibles:** con **aprobación requerida** cada estudiante ve solo lo suyo y lo que escribe el staff; con **solo lectura desde / hasta** no puede escribir en los catálogos; con **entradas requeridas para ver** no ve las criticidades manuales del staff.
5. **La capa 1 funciona con cualquier cantidad de tutores y gestores, siempre que tengan rol de staff** (Profesor o Profesor sin edición). Si un tutor, gestor o asesor par tiene rol **Estudiante**, deja de ver lo que necesita ([§8](#8-condiciones-para-que-la-capa-1-siga-funcionando)).

## 2. Las tres capas

| Capa | Técnica | Qué decide | ¿Es seguridad? | Dónde se configura |
|---|---|---|---|---|
| **Ojo** | Control de acceso por rol a nivel **actividad**: Moodle envía la actividad solo a quien tiene `moodle/course:viewhiddenactivities` | Si el rol puede **entrar** a la actividad (también por URL y por `fetch`) | **Sí** | Disponibilidad de la actividad |
| **Capa 1** | Control de acceso a nivel **entrada** (*row-level security*): combina los permisos del rol (`mod/data:approve`, `mod/data:manageentries`) con la **autoría** de la entrada | **Qué entradas** ve y **si puede escribir** dentro de una base a la que sí entra | **Sí** | Ajustes de cada base de datos |
| **Capa 2** | Ocultamiento **visual** por rol: la interfaz detecta si el usuario es staff | Qué **se muestra** en pantalla | **No**: quien conoce la URL o desactiva JavaScript entra igual | Resumen de Zhakyz y plantillas de las bases |

En términos del ticket: el ojo y la capa 2 son "ocultar por rol" en sentido estricto (un recurso aparece o no según el rol). La capa 1 no oculta la base, restringe su **contenido** según el rol y la autoría.

## 3. Roles y permisos de Moodle

### 3.1 Roles del sistema

| Rol | Quién es | Cómo se detecta en las páginas | Hoy en el curso |
|---|---|---|---|
| **ADM** | Equipo Zhakyz / docente con edición | Rol de curso Profesor | Los 6 integrantes |
| ~~GES~~ | Gestor de carga de datos | **Retirado el 2026-11-21: ya no se tiene en cuenta** | — |
| **TUT** | Tutor / entrevistador | Grupo `Zhakyz_Tutor` (4316) o rol Profesor sin edición | 2 integrantes, con rol Profesor |
| **PAR** | Asesor par (alumno avanzado) | Grupo `Zhakyz_AsesorPar` (4318) | 1 integrante, con rol Profesor |
| **EST** | Estudiante seguido | Grupo `Zhakyz_Estudiante` (4317) o rol Estudiante | Nadie |

### 3.2 Permisos por defecto de Moodle sobre las bases de datos

| Permiso | Estudiante | Profesor sin edición | Profesor |
|---|---|---|---|
| Ver y agregar entradas (`mod/data:viewentry`, `mod/data:writeentry`) | Sí | Sí | Sí |
| Aprobar y ver las no aprobadas (`mod/data:approve`) | No | **Sí** | Sí |
| Gestionar entradas de otros, sin límites (`mod/data:manageentries`) | No | **Sí** | Sí |
| Ver actividades ocultas (`moodle/course:viewhiddenactivities`) | No | Sí | Sí |

Los grupos (`Zhakyz_*`) **no dan permisos**: sirven para que las páginas detecten el rol, pero Moodle decide el acceso por el rol del curso. Los overrides de permisos, la asignación de roles y la gestión de grupos los maneja solo la cátedra.

## 4. Reglas de Moodle verificadas en el código

Verificado en el código de Moodle 5.0 (rama `MOODLE_500_STABLE`, `mod/data/lib.php`, `mod/data/locallib.php`, `mod/data/view.php`) el 2026-11-21.

| Regla | Función | Qué hace |
|---|---|---|
| **Aprobación al crear** | `data_add_record` | La entrada nace aprobada solo si el autor tiene `mod/data:approve`. Si no, nace **sin aprobar, aunque la base no tenga la aprobación activada**. Lo que escribe un estudiante ya hoy queda sin aprobar; activar la opción solo hace que Moodle empiece a filtrarlo |
| **Aprobación al editar** | `data_update_record_fields_contents` | Si edita alguien sin `mod/data:approve`, la entrada vuelve a quedar sin aprobar. Si edita un profesor, conserva su estado |
| **Qué entradas se listan** | `data_search_entries` | Quien no tiene `mod/data:approve`, en una base con aprobación, ve `r.approved = 1 OR r.userid = yo`. Quien tiene el permiso ve todas |
| **Entrada individual** | `data_can_view_record` (locallib) | Se ve si el usuario gestiona, si la base no tiene aprobación, si la entrada está aprobada o si es suya. Por URL directa a una entrada ajena sin aprobar, Moodle responde `notapprovederror` |
| **Entradas requeridas para ver** | `data_get_entries_left_to_view` + `data_search_entries` | Si `requiredentriestoview > 0` y el usuario **sin `mod/data:manageentries`** tiene menos entradas propias que ese número, la búsqueda agrega `r.userid = yo`: ve **solo las que escribió**. Arriba de la lista se muestra un aviso con `$OUTPUT->notification` |
| **Solo lectura desde / hasta** | `data_in_readonly_period`, `data_user_can_add_entry`, `data_user_can_manage_entry` | Durante el período, quien no tiene `mod/data:manageentries` no puede agregar ni editar. Quien la tiene, sí (el control de gestor va primero). La lectura no cambia: `data_search_entries` no mira el período |
| **Modo de grupo** | `data_search_entries` | Las 11 bases están en `groupmode = 2`, que en Moodle es **grupos visibles** (no separados): no restringe qué entradas se ven |

## 5. Estado de las actividades (ojo)

Relevado el 2026-11-21 con la vista del profesor y el formulario de ajustes de cada actividad.

| Recurso | cmid | Visibilidad | Por qué |
|---|---|---|---|
| Área de texto "Hub" | 59511 | **Oculta** (2026-11-20) | Menú del staff |
| Tablero de Criticidad | 60287 | **Oculta** | Staff |
| Detalle del estudiante | 60288 | **Oculta** | Staff |
| Configuración del Sistema | 60294 | **Oculta** | ADM |
| Reportes | 60918 | **Oculta** | Staff |
| Indicadores de Cohorte | 60283 | **Oculta** (2026-11-20) | Staff |
| ListadoCriticidadPrimero | 59523 | **Oculta** (2026-11-20) | Staff |
| Dashboard Estudiantes de Primero | 60035 | **Oculta** (2026-11-20) | Staff |
| Base Informes | 60917 | **Oculta** | La escribe y la lee Reportes |
| Entrevistas y Tutorías | 60198 | Visible | La usa el estudiante |
| Plan de Estudios | 59718 | Visible | La usa el estudiante |
| Mi Trayectoria (área de texto) | 60264 | Visible | La usa el estudiante |
| Información personal | 60265 | Visible | La usa el estudiante |
| Carga de notas de 1.er año | 60209 | Visible | La usa el estudiante |
| Encuesta Cuatrimestral | 59712 | Visible | La responde el estudiante |
| Tools, Widgets | 59941, 59932 | Visible | Código que cargan las páginas del estudiante (sin datos) |
| Subsecciones Hub, Vista Estudiante, Database, Utils | 59510, 60263, 59497, 59931 | Visibles | Contienen recursos que usa el estudiante. Ocultarlas oculta todo lo de adentro |
| Las otras 10 bases | — | Visibles | Ver [§6](#6-estado-de-las-bases-capa-1) |

**No queda ninguna actividad a la que se le pueda poner el ojo sin romper una pantalla del estudiante.**

### 5.1 Qué base usa cada pantalla del estudiante

Sale del código del repo (líneas `// @config bases.*` y llamadas a Tools), el 2026-11-21:

| Pantalla del estudiante | Bases que lee | Bases que escribe |
|---|---|---|
| Mi Trayectoria (`vista_estudiante`) | Estudiantes, Respuestas, Períodos (por Tools) | Estudiantes |
| Información personal (`informacion_personal`) | Estudiantes, Períodos (por Tools) | Estudiantes |
| Carga de notas (`carga_notas_primero`) | Materias, CargaParcialesPrimero, CargaMateriasPrimero y Criticidad propias (por `Tools.CriticidadNotas`), Períodos | CargaParcialesPrimero, Criticidad, Estudiantes (estado actual) |
| Copia de la Encuesta Cuatrimestral (`copia_encuestas`, por `Tools.CopiaRespuestas`) | Encuestas (definición), Respuestas y Criticidad propias, Períodos | Respuestas, Criticidad, Estudiantes (estado actual) |
| Cuadros de la encuesta (`encuesta_cuatrimestral/*`) y Widgets | Materias | — |
| Plan de Estudios | Materias | — (la carga por CSV es de ADM y GES) |
| Entrevistas y Tutorías | Entrevistas, RespuestasEntrevistas | Entrevistas, RespuestasEntrevistas |

## 6. Estado de las bases (capa 1)

Valores leídos del formulario de ajustes de cada base el 2026-11-21, **después** de aplicar la capa 1. En negrita, lo que cambió ese día.

| Base | cmid | Visible | Aprobación | Editar aprobadas | Entradas requeridas para ver | Solo lectura | Qué ve un estudiante |
|---|---|---|---|---|---|---|---|
| Respuestas | 59940 | Sí | Sí | No | 0 | No | Las suyas y las aprobadas |
| Estudiantes | 60262 | Sí | Sí | Sí | 0 | No | La suya y las aprobadas |
| CargaParcialesPrimero | 59521 | Sí | Sí | Sí | 0 | No | Las suyas y las aprobadas |
| Criticidad | 60191 | Sí | Sí | No | **50** | No | **Solo las que escribió él** |
| Períodos | 60292 | Sí | Sí | No | 0 | **2026-01-01 → 2030-12-31** | Todas; **no puede agregar** |
| Encuestas | 60190 | Sí | No | Sí | 0 | **2026-01-01 → 2030-12-31** | Todas; **no puede agregar** |
| Materias | 59717 | Sí | No | Sí | 0 | **2026-01-01 → 2030-12-31** | Todas; **no puede agregar** |
| CargaMateriasPrimero | 59522 | Sí | No | Sí | 0 | **2026-01-01 → 2030-12-31** | Todas; **no puede agregar** |
| Entrevistas | 60197 | Sí | **Sí** | Sí | 0 | No | **Las suyas y las del staff** |
| RespuestasEntrevistas | 60299 | Sí | **Sí** | Sí | 0 | No | **Las suyas y las del staff** |
| Informes | 60917 | **No** (oculta) | No | No | 0 | No | Nada |

"Las aprobadas", en las bases de datos personales, son **las que cargó el staff**: los datos de prueba, lo que escriben los scripts y las criticidades manuales del Tablero y el Detalle. Ver [§9](#9-lo-que-la-capa-1-no-protege).

## 7. Análisis por base: por qué no rompe

### 7.1 Solo lectura desde / hasta: Encuestas, Períodos, Materias, CargaMateriasPrimero

**Qué protege:** sin esto, un estudiante podía agregar una versión de Encuestas (Tools toma la de mayor `version` y cambiaría las preguntas y los puntajes de criticidad para todos), un período falso en Períodos (el staff lo tomaría como vigente), o materias y umbrales falsos.

| Base | Quién escribe | Quién la lee con sesión de estudiante |
|---|---|---|
| Encuestas | Staff, por script | Tools: la definición para la copia de la encuesta (`DefinicionEncuesta`) |
| Períodos | Configuración del Sistema (ADM) | Tools: `PeriodoVigente` |
| Materias | Plan de Estudios, carga por CSV (ADM y GES) | Carga de notas, Plan de Estudios, Widgets y los cuadros de la encuesta |
| CargaMateriasPrimero | Staff | Tools: los umbrales de `IndiceNotasPrimero` dentro de `CriticidadNotas` |

**Por qué no rompe:** ninguna pantalla del estudiante escribe en estas 4 bases (verificado en el código, [§5.1](#51-qué-base-usa-cada-pantalla-del-estudiante)), y quien sí escribe tiene rol Profesor, con `mod/data:manageentries`, al que el período no le aplica. La lectura no cambia.

**Rompería si:**
- GES, o quien use la carga por CSV de Plan de Estudios, tuviera rol Estudiante.
- Llega el 2030-12-31: el período termina y el estudiante vuelve a poder escribir. Hay que extender `hasta` antes de esa fecha.

### 7.2 Aprobación requerida: Entrevistas y RespuestasEntrevistas

**Qué protege:** antes, cualquier estudiante veía las 34 entrevistas con su motivo, resultado y acciones acordadas. Ahora un estudiante no ve los pedidos ni las respuestas de **otros estudiantes**.

| Flujo de la Página Entrevistas y Tutorías | Autor de la entrada | ¿Lo ve quien lo necesita? |
|---|---|---|
| El estudiante pide una entrevista | Estudiante (sin aprobar) | Sí: el tutor tiene `mod/data:approve` y ve las no aprobadas |
| El tutor propone una entrevista | Tutor (aprobada) | Sí: el estudiante ve las aprobadas |
| El estudiante acepta o reprograma | Estudiante, en RespuestasEntrevistas (sin aprobar) | Sí: el tutor |
| El tutor acepta, reprograma o responde | Tutor, en RespuestasEntrevistas (aprobada) | Sí: el estudiante |
| El estudiante edita su propio pedido | Él mismo | Sí: `data_user_can_manage_entry` lo permite; sigue sin aprobar |
| ADM edita la entrevista de un estudiante | ADM (con `approve`) | Sí: la entrada conserva su estado |
| Control de 30 minutos entre entrevistas del mismo día (`choqueDeHorario`) | Lo usa el acompañante | Sí: ve todas las entrevistas |

**Por qué no rompe:** el estudiante nunca necesita una entrada de **otro estudiante**, que es lo único que la aprobación le oculta. Tampoco edita entradas ajenas: `editaEntrada` ya lo limita al autor y a ADM, y lo demás lo resuelve con una entrada propia en RespuestasEntrevistas. `respuestaValida` compara la cuenta del autor que muestra la lista, que no cambia.

**Rompería si:** un **TUT o PAR tiene rol Estudiante**. No vería los pedidos ni las respuestas de sus estudiantes (nacen sin aprobar), y la página le quedaría vacía. Por esta razón `BASE_RESPUESTAS_ENTREVISTAS.json` documentaba "sin aprobación". Hoy los 3 integrantes TUT y PAR tienen rol Profesor. **Si un asesor par pasa a tener rol Estudiante, hay que volver la aprobación a No en las dos bases, o resolverlo con la cátedra ([§14](#14-decisiones-abiertas-y-próximos-pasos)).**

### 7.3 Entradas requeridas para ver = 50: Criticidad

**Qué protege:** las criticidades manuales que el staff asigna desde el Tablero y el Detalle nacen aprobadas, así que con solo la aprobación cualquier estudiante veía el semáforo y el motivo de otro. Ahora, mientras tenga menos de 50 entradas propias, el estudiante ve solo las que escribió él.

**Por qué no rompe:**
- El estudiante lee Criticidad en un solo lugar: `baseCriticidadMoodle.leer` en Tools, para no duplicar entradas. Ya filtra por su propio `id_usuario`, y lo que busca son sus entradas automáticas, que escribió él.
- El estado actual (`ResumenEstadoActual`) usa solo entradas con `origen = automatica`, nunca las manuales. `ActualizarEstadoActual` trabaja con la entrada recién guardada, sin releer la base.
- El aviso de Moodle no se confunde con un error: `errorDePagina` de Tools busca solo `.errormessage`, y el aviso es un `notification`.
- El Tablero, el Detalle, Reportes, Configuración y `RecalcularEstadoActual` los usa el staff, que tiene `mod/data:manageentries` y no tiene el límite.

**Rompería o dejaría de proteger si:**
- Un estudiante llega a **50 entradas propias** en Criticidad: desde ahí ve todas las aprobadas. Hay que medir cuántas genera por año entre la encuesta y la carga de notas ([§14](#14-decisiones-abiertas-y-próximos-pasos)). 50 es el máximo que permite Moodle.
- Una pantalla de estudiante nueva necesitara mostrarle sus criticidades **manuales**: hoy ninguna lo hace.

### 7.4 Respuestas, Estudiantes, CargaParcialesPrimero

Ya tenían aprobación desde su creación, y nadie las aprueba. No cambiaron. Cada estudiante ve sus entradas y las aprobadas, que son las que cargó el staff.

### 7.5 Informes

Oculta con el ojo. La escribe y la lee Reportes, que es de staff. No cambió.

## 8. Condiciones para que la capa 1 siga funcionando

1. **Todo el staff (ADM, GES, TUT y PAR) tiene rol Profesor o Profesor sin edición.** La cantidad no importa: con esos roles, cada uno ve todas las entradas, las haya escrito quien sea. Hoy se cumple. **Esta es la condición crítica**: un usuario de staff con rol Estudiante ve solo sus entradas y las aprobadas.
2. **Las fechas de solo lectura cubren el presente** (hoy, del 2026-01-01 al 2030-12-31).
3. **Ninguna pantalla de estudiante escribe en los catálogos ni necesita leer entradas ajenas.** Al agregar o cambiar una pantalla, revisar la tabla del [§5.1](#51-qué-base-usa-cada-pantalla-del-estudiante) y este documento.
4. **Nadie aprueba entradas** de Respuestas, Estudiantes, CargaParcialesPrimero, Criticidad, Entrevistas ni RespuestasEntrevistas.
5. **Nadie carga entradas en nombre de un estudiante desde una cuenta de staff**, porque nacen aprobadas y las ven todos.

Una limitación aparte, que la capa 1 no cambia: con rol de staff, cada tutor ve **a todos** los estudiantes, no solo a sus asignados. Moodle no puede restringir "este tutor ve solo a estos estudiantes"; la página Entrevistas y Tutorías lo resuelve con el filtro por acompañante, que es solo visual.

## 9. Lo que la capa 1 no protege

| Riesgo | Por qué | Cómo se cierra |
|---|---|---|
| **Los datos de prueba aprobados** (60 estudiantes ficticios en Respuestas, Estudiantes, Criticidad y CargaParciales, y las 34 entrevistas) los ve cualquier estudiante | Los cargó el staff y nacieron aprobados. Activar la aprobación no cambia el estado de las entradas que ya existen | Borrarlos antes de abrir el sistema (skill `datos-prueba`) |
| **Lo que propone o responde un tutor** en Entrevistas y RespuestasEntrevistas lo ve cualquier estudiante, no solo el destinatario | Nace aprobado | ADR "toda entrevista es del estudiante" (opción 2 del relevamiento) o mensajería de Moodle |
| Un estudiante con **50 o más entradas** en Criticidad ve las manuales de todos | Límite de Moodle | Desaprobar cada manual al guardarla en el Tablero y el Detalle (opción B, código) |
| Un estudiante **sigue viendo los links** de las 10 bases y puede abrirlas a mano | Están visibles porque las usan sus pantallas | Capa 2 ([§10](#10-capa-2-ocultamiento-visual)). Con la capa 1, lo que ve al entrar es solo suyo y no puede escribir en los catálogos |
| En Respuestas, Estudiantes, CargaParciales y Criticidad el estudiante **puede agregar entradas a mano** | Tiene que poder escribir, porque así cargan sus datos sus pantallas | No se puede cerrar sin romperlas. Solo cambia sus propios datos, que el staff ve como "sin aprobar" |

## 10. Capa 2: ocultamiento visual

**No es seguridad.** Sirve para que cada rol vea en la sección solo lo que le corresponde y para que el estudiante común no abra las bases a mano. Quien tiene el link, o desactiva JavaScript, entra igual: lo que protege los datos es el ojo y la capa 1.

**Estado (2026-11-21):** la lista de la sección y el Hub están **publicados** (resumen de Zhakyz y área de texto Hub 59511, republicados con `publicar.js` el 2026-11-21). La redirección en las plantillas de las bases sigue como propuesta.

### 10.1 Lista de la sección (resumen de Zhakyz)

El script `OCULTAMIENTO VISUAL POR ROL` de [`section/resumen_zhakyz/content.html`](../../section/resumen_zhakyz/content.html) oculta por CSS, fuera del modo edición, las actividades que el rol no ve. En modo edición no se oculta nada, así el equipo sigue gestionando la sección.

**Matriz** (`VISIBLE_PARA` en el script; una actividad que no está en la matriz la ven todos). `V` = la ve en la lista, `·` = no la ve.

| Actividad | cmid | ADM | TUT | PAR | EST |
|---|---|---|---|---|---|
| Área de texto Hub | 59511 | V | V | V | · (además, oculta con el ojo) |
| Tablero de Criticidad | 60287 | V | V | · | · |
| Detalle del estudiante | 60288 | V | V | V | · |
| Indicadores de Cohorte, Reportes | 60283, 60918 | V | V | · | · |
| ListadoCriticidadPrimero, Dashboard Estudiantes de Primero | 59523, 60035 | V | · | · | · |
| Configuración del Sistema | 60294 | V | · | · | · |
| Entrevistas y Tutorías | 60198 | V | V | V | V |
| Plan de Estudios (con la carga por CSV del plan) | 59718 | V | V | · | · |
| Subsección Vista Estudiante (Mi Trayectoria, Información personal, Carga de notas) | 60263 | V | · | · | V |
| Subsección Database (las 11 bases) | 59497 | V | · | · | · |
| Subsección Utils (Tools, Widgets) | 59931 | V | · | · | · |
| Encuesta Cuatrimestral | 59712 | · | · | · | · (se entra desde Mi Trayectoria; `PAGINAS_SIN_LISTAR`, sin cambios) |

Decisiones de la matriz que el equipo puede cambiar en `VISIBLE_PARA`:
- **PAR ve el Detalle del estudiante, pero no el Tablero** (2026-11-21): abre el detalle de sus estudiantes desde Entrevistas y Tutorías ("Ver detalle del estudiante", habilitado para PAR ese día), sin la lista de todos.
- **PAR y EST no ven Plan de Estudios** (2026-11-21): la Página tiene la carga por CSV del plan, que escribe en la base Materias, y en Moodle arranca en el rol de carga. Que no puedan modificarlo lo garantiza la capa 1: Materias es de solo lectura para quien no tiene `mod/data:manageentries` (un estudiante, o un PAR con rol Estudiante). Un PAR con rol Profesor sí podría cargar si abre la Página por URL: ocultarla es solo visual. Desde el 2026-11-21 (publicado), la Página Plan de Estudios muestra la carga por CSV solo a ADM: con otro rol (detectado o elegido con "Cambiar rol") se ve como consulta ([plan-estudios.md](plan-estudios.md)).
- **Database la ve solo ADM** desde que se retiró GES (2026-11-21).
- **Utils solo la ve ADM**: Tools y Widgets se cargan por `fetch` desde las páginas, así que ocultarlas de la lista no cambia nada para los demás.
- La matriz coincide con los `roles` de las tarjetas del Hub (§10.2).

**Cómo se reconoce cada rol:**

| Caso | Cómo | Cuándo se aplica |
|---|---|---|
| **Estudiante** | Moodle manda las actividades ocultas solo a quien puede verlas: el Tablero (`#module-60287`, oculto) llega al HTML del staff y no al del estudiante. La regla `body:not(:has(li.activity#module-60287))` lo reconoce | **De inmediato y sin ningún `fetch`**: es CSS puro, no depende del script |
| **Staff** | La misma regla que Entrevistas y Tutorías (`detectarRol`): 1) grupo `Zhakyz_Tutor` → TUT, `Zhakyz_AsesorPar` → PAR, `Zhakyz_Estudiante` → EST; 2) "Cambiar rol a…" (se deduce de los permisos del rol simulado); 3) rol del curso (Profesor → ADM, Profesor sin edición → TUT). Si no se detecta nada, PAR (la vista de staff con menos permisos) | En la primera visita tarda de 2 a 5 s; mientras tanto (`PEND`) se ve solo lo que comparten todos los roles de staff (el Hub y Plan de Estudios). El rol se guarda 12 h por usuario en `localStorage` (`zk-rol`), así en las visitas siguientes se aplica de inmediato y se vuelve a detectar en segundo plano |

El rol queda publicado en la página: `<html data-zk-rol="ADM|TUT|PAR|EST|PEND">` y el evento `zk-rol` (`e.detail.rol`). **El Hub lo usa** y cualquier otra pieza de la página del curso puede hacerlo.

**A tener en cuenta:**
- Un integrante del equipo que esté en un grupo `Zhakyz_*` se ve con el rol de ese grupo (es la regla de Entrevistas). Para ver todo, entrar en modo edición.
- **GES no existe** desde el 2026-11-21. Antes de retirarlo se había definido con una lista de ids en `moodle.config.json` (`roles.gestores`) y el grupo `Zhakyz_Gestor`; las dos cosas se quitaron.
- La regla del rol está copiada de Entrevistas y Tutorías: si cambia allá, cambiarla acá.
- Si un PAR con rol de estudiante tuviera que ver el Hub, el área de texto se restringe por grupo con "ocultar por completo". Si se muestra en gris, llega al HTML y la marca de staff deja de servir.

### 10.2 Hub

[`section/menu_inicial/content.html`](../../section/menu_inicial/content.html) ya mostraba las tarjetas según `roles`, pero en Moodle arrancaba fijo en ADM. Ahora toma el rol que publica el resumen:
- en Moodle, mientras el rol es `PEND` **no muestra ninguna tarjeta** (nadie ve por un momento las de otro rol) y aplica el rol cuando llega el evento `zk-rol`;
- con un rol que no es del Hub (EST) no muestra ninguna tarjeta;
- en local (`file://` o `localhost`) sigue con la barra de vista previa, empezando en ADM.

| Tarjeta | ADM | TUT | PAR |
|---|---|---|---|
| Tablero de Criticidad, Indicadores de Cohorte, Reportes, Notas de 1.er año | V | V | · |
| Entrevistas y Tutorías | V | V | V |
| Plan de Estudios y Correlativas (editar) | V | · | · |
| Configuración del Sistema | V | · | · |
| Indicadores "Riesgo alto" y "Riesgo medio" | V | V | · |
| Indicador "Sin encuesta" | V | · | · |

Desde el 2026-11-21 el Hub no menciona al gestor: se quitaron el rol "Gestor Dpto. Industrial", su saludo, el chip GES de las tarjetas y los indicadores, y su botón en la barra de vista previa. La tarjeta Plan de Estudios y Correlativas y el indicador "Sin encuesta" quedaron solo para ADM.

### 10.3 Selector "Cambiar rol"

**Publicado el 2026-11-21** (resumen de Zhakyz, Hub 59511 y Mi Trayectoria 60264). Probado en la página real sin inyectar nada: ADM → TUT → EST, recarga en EST, "Volver al rol propio", sin errores.

Arriba a la derecha del **Hub** y de **Mi Trayectoria** hay un botón con el rol que se está viendo y "Cambiar rol". Abre un menú con los 4 roles (Administrador, Tutor / Entrevistador, Asesor par, Estudiante) y, si hay un rol elegido, "Volver al rol propio". **Es solo visual:** muestra la sección como la ve ese rol, sin cambiar permisos de Moodle. No reemplaza a "Cambiar rol a…" de Moodle, que sí cambia los permisos.

| Dónde | Cómo funciona |
|---|---|
| **Moodle** | El botón manda el evento `zk-rol-cambiar`. Lo recibe el resumen de Zhakyz, que **solo lo acepta del staff** (quien recibe la marca del Tablero oculto) y guarda el rol elegido en este navegador (`localStorage`, clave `zk-rol-forzado`, por usuario). Después vuelve a publicar: `data-zk-rol` (el que se muestra), `data-zk-rol-real` (el detectado), `data-zk-rol-forzado="1"` y `data-zk-staff="1"`, y avisa con `zk-rol`. Cambian juntos la lista de la sección, el Hub y Mi Trayectoria, y el rol elegido sigue al recargar. Elegir el rol propio o "Volver al rol propio" borra la elección |
| **Local** | No hay resumen: el rol elegido queda en `localStorage` (`zk-rol-forzado`, usuario vacío) y lo comparten los dos archivos. Reemplaza a la barra oscura de roles del Hub; la barra de casos de prueba de Mi Trayectoria sigue |

- **Un estudiante no ve el selector:** no tiene la marca de staff, y el resumen ignora sus pedidos.
- Como el Hub se oculta para EST y Mi Trayectoria para TUT y PAR, siempre queda un selector a la vista para volver: con EST, el de Mi Trayectoria; con TUT o PAR, el del Hub.
- **Avisos:** el Hub con el rol Estudiante muestra "El rol Estudiante no tiene acceso a este menú. Su pantalla es Mi Trayectoria."; Mi Trayectoria con TUT o PAR muestra "El rol … no tiene acceso a Mi Trayectoria. Su pantalla es el Menú del Equipo de Seguimiento.". En local, con un link a la otra pantalla.
- Cualquier rol de staff puede elegir cualquier rol, también ADM: es solo visual, y las Páginas ocultas igual las puede abrir cualquier profesor.
- Las otras Páginas (Entrevistas y Tutorías, el Tablero, etc.) todavía no leen el rol elegido: usan su propia detección.
- **Código:** el bloque `SELECTOR DE ROL: INICIO … FIN` es idéntico en `section/menu_inicial` y `section/vista_estudiante` (RULES.md, "Código copiado"). Los dos pueden estar en la misma página del curso, así que el selector busca todo dentro de su contenedor (`selector-rol-menu` y `selector-rol-estudiante`).

**Pruebas (2026-11-21):**
- **Local:** el Hub arranca en ADM con 7 tarjetas; TUT, 5; PAR, 1; EST, ninguna, con el aviso. Mi Trayectoria arranca en el rol elegido en el Hub; con TUT oculta su contenido y muestra el aviso; con ADM vuelve. Al volver al Hub, sigue el último rol elegido. Sin errores.
- **Página real de Zhakyz, solo en la sesión de prueba:** se quitaron del HTML los scripts publicados y se inyectaron las versiones locales; no se publicó nada.
  - ADM: todo visible y los dos selectores visibles.
  - Con el Hub → TUT: la lista oculta Configuración, Vista Estudiante y Database; el Hub muestra 5 tarjetas; el selector de Mi Trayectoria se oculta con su subsección.
  - Con EST: se ocultan el Hub, el Tablero y Database; queda Vista Estudiante con su selector.
  - Al recargar sigue en EST. El menú de Mi Trayectoria ofrece "Volver al rol propio (Administrador)" y vuelve a ADM.
  - Sin errores de JavaScript.

### 10.4 Pruebas hechas el 2026-11-21

- **Hub en local**, con la barra de vista previa: ADM 7 tarjetas, TUT 5, PAR 1, sin errores (después de retirar GES, ninguna mención visible del gestor).
- **Hub fuera de local** (servido desde otro dominio, como en Moodle): sin rol, ninguna tarjeta; con cada evento `zk-rol`, las tarjetas del rol; con `data-zk-rol` ya publicado antes de cargar, las del rol. Sin errores.
- **GES (2026-11-21):** se probó detectar al gestor por una lista de ids (94 a 115 ms) y después se retiró el rol. Con la versión sin GES, la cuenta de prueba vuelve a detectarse como ADM y los demás roles no cambian.
- **Resumen sobre la página real de Zhakyz**: el script nuevo se inyectó solo en la sesión de prueba (no se publicó nada; la guardia bloqueó toda escritura). Detectó ADM para la cuenta de prueba (rol Profesor, sin grupos) en 2 a 5 s y lo guardó en `localStorage`. Con cada rol forzado, la lista mostró exactamente la matriz del §10.1. El estudiante se simuló quitando del HTML las actividades "Ocultado a los estudiantes", como hace Moodle. Sin errores de JavaScript del script (los 3 que aparecen ya estaban antes de inyectarlo: salen de la página cuando la guardia corta sus llamadas AJAX).
- **Después de publicar (2026-11-21):** Moodle guardó el resumen y el Hub sin alterar los scripts. En la página real, sin inyectar nada: primera visita `PEND` → ADM; segunda visita, ADM desde el inicio (rol guardado); el Hub muestra "Administrador ADM" con sus 7 tarjetas y ninguna mención del gestor.
- **Pendiente:** probar con "Cambiar rol a… Estudiante" y con una cuenta de cada grupo.

### 10.5 Propuestas pendientes

1. **Redirección en la plantilla "Javascript personalizado" de cada base:** ese JS corre cuando alguien abre la base en el navegador, pero **no** cuando Tools la lee con `fetch` + `DOMParser` (el HTML parseado no ejecuta scripts). Puede mandar a quien no es staff a Mi Trayectoria.
   - Antes de aplicarla, revisar qué flujos legítimos del estudiante abren la base en el navegador. Por ejemplo, `CriticidadNotas({ form })` trabaja con el formulario de alta de CargaParcialesPrimero, cuya plantilla JS calcula la criticidad (ADR-007).
2. **Control en cada Página de staff:** el Tablero, el Detalle, Indicadores, Reportes y Configuración podrían leer el rol y mostrar "Sin acceso" a un rol que no corresponde (por ejemplo, un TUT que abre Configuración por URL). Hoy esas Páginas están ocultas con el ojo para los estudiantes, pero cualquier rol de staff las puede abrir.

## 11. Cómo se aplica y cómo se revierte

Los ajustes viven en el bloque `ajustes_moodle` de cada `data/moodle/BASE_*.json` (relación 1 a 1, RULES.md §4):

```json
"ajustes_moodle": {
  "visible": 1,
  "approval": 1,
  "manageapproved": 1,
  "requiredentriestoview": 0,
  "solo_lectura": { "desde": "2026-01-01", "hasta": "2030-12-31" }
}
```

`solo_lectura: null` desactiva el período. Para cambiar un ajuste: se edita el JSON, se commitea y se aplica.

```bash
# Simula: muestra la diferencia entre el repo y Moodle, sin escribir
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) \
  node .skills/publicar-seccion/ajustar_bases.js [--claves criticidad,entrevistas]

# Aplica, con confirmación explícita del cambio
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) \
  node .skills/publicar-seccion/ajustar_bases.js [--claves …] --confirmar
```

El script:
- verifica que cada cmid esté en la sección Zhakyz, que el formulario sea de una base de datos del curso 1732 y que el nombre coincida con el del JSON;
- cambia solo los controles pedidos (los demás campos del formulario se reenvían como están) y desmarca la notificación a los participantes;
- bloquea con la guardia de red todo lo que no sea `GET`, salvo el login y el `POST` a `course/modedit.php` de esa base;
- vuelve a leer el formulario y avisa si algo quedó distinto.

**Revertir:** cambiar el valor en el JSON (por ejemplo `"approval": 0` o `"solo_lectura": null`) y aplicar con `--claves <base> --confirmar`. Ningún ajuste borra ni modifica entradas: desactivarlos deja todo como antes del 2026-11-21.

El ojo se cambia con `publicar.js --visibilidad` (Páginas y Áreas de texto) o desde el curso.

## 12. Verificación

### 12.1 Hecha el 2026-11-21

- **Antes de escribir:** simulación con `ajustar_bases.js`; mostró solo los 11 cambios previstos en 7 bases.
- **Después de escribir:** relectura del formulario de cada base (todas "aplicado y verificado") y comparación completa del estado de las 11 bases, 15 páginas, 4 subsecciones y el resumen contra el relevamiento previo. Solo cambiaron los campos previstos.
- **Guardia de red:** 7 escrituras permitidas (una por base; Criticidad y Encuestas primero, como prueba), ningún otro `POST`.
- **Una diferencia ajena:** el número de posición (`section`) de las 3 actividades de Vista Estudiante pasó de 58 a 56 entre los dos relevamientos. Las bases están en la posición 44, que no cambió, y las actividades siguen en Zhakyz: lo más probable es que otro equipo haya borrado o movido secciones del curso.

### 12.2 Pendiente

Con "Cambiar rol a… Estudiante" (usa una URL con `sesskey`, requiere permiso puntual):
1. Abrir Mi Trayectoria, Información personal, Carga de notas, Plan de Estudios y Entrevistas y Tutorías, y verificar que carguen el período vigente, las materias y los datos propios.
2. En Encuestas, Períodos, Materias y CargaMateriasPrimero, verificar que no aparezca "Añadir entrada".
3. En Criticidad, verificar el aviso de "entradas requeridas" y que la lista muestre solo las propias. Verificar que el aviso no rompa la lectura de Tools.
4. En Entrevistas, verificar que se vean solo las entradas propias y las del staff.

Probar el guardado real (encuesta, notas, entrevistas) requiere una **cuenta de estudiante de prueba**, que hay que pedir a la cátedra: con "Cambiar rol" se escribiría una entrada con la cuenta de un integrante.

## 13. Registro de cambios en Moodle

| Fecha | Cambio | Cómo | Verificado |
|---|---|---|---|
| Antes del 2026-11-19 | Ojo en Tablero, Detalle, Configuración, Reportes y base Informes | Al publicarlas | Sí |
| 2026-11-02 / 03 | Aprobación requerida en CargaParcialesPrimero, Estudiantes, Respuestas, Criticidad y Períodos | Al crearlas o configurarlas | Sí |
| 2026-11-20 | Ojo en el área de texto Hub, Indicadores de Cohorte, ListadoCriticidadPrimero y Dashboard Estudiantes de Primero | Desde el curso | Sí, con rol de estudiante |
| 2026-11-21 | Criticidad: entradas requeridas para ver 0 → 50 | `ajustar_bases.js --claves criticidad --confirmar` | Relectura |
| 2026-11-21 | Encuestas, Materias, CargaMateriasPrimero y Períodos: solo lectura del 2026-01-01 00:00 al 2030-12-31 00:00 | `ajustar_bases.js --confirmar` | Relectura |
| 2026-11-21 | Entrevistas y RespuestasEntrevistas: aprobación requerida No → Sí | `ajustar_bases.js --confirmar` | Relectura |

## 14. Decisiones abiertas y próximos pasos

### 14.1 Decisiones del equipo y de la cátedra

1. **¿Qué rol de Moodle tienen tutores, gestores y asesores pares en producción?** Condiciona todo lo demás ([§8](#8-condiciones-para-que-la-capa-1-siga-funcionando)).
   - **Profesor sin edición:** todo lo de este documento funciona. Cada uno ve a todos los estudiantes.
   - **Estudiante en un grupo:** no ven nada de otros, y Entrevistas, el Tablero y el Detalle no les sirven. Habría que volver la aprobación de Entrevistas y RespuestasEntrevistas a No, o pedir a la cátedra un override de `mod/data:approve` en las bases de Zhakyz.
2. ~~¿Quién es GES y con qué rol?~~ Retirado el 2026-11-21: el rol gestor ya no se tiene en cuenta.
3. Criticidad: ¿se suma la opción B (desaprobar cada manual al guardarla), que no tiene el límite de 50?
4. Entrevistas: ¿ADR "toda entrevista es del estudiante; el acompañante edita su entrada"?
5. ¿Cuándo se agregan los grupos `Zhakyz_*` a la restricción de la sección? Sin eso, ningún estudiante usa el sistema.
6. ¿Cuándo se borran los datos de prueba aprobados?

### 14.2 Plan

1. ~~Ojo en Indicadores, ListadoCriticidadPrimero, Dashboard de Primero y el área de texto Hub.~~ **Hecho el 2026-11-20.**
2. ~~Capa 1: solo lectura en los catálogos, aprobación en Entrevistas y RespuestasEntrevistas, entradas requeridas en Criticidad.~~ **Hecho el 2026-11-21.**
3. Verificar con rol de estudiante ([§12.2](#122-pendiente)).
4. Capa 2: ~~lista de la sección por rol y Hub por rol, desarrollados y publicados~~ (**hecho el 2026-11-21**); falta verificar con rol de estudiante.
5. Capa 2: redirección en las plantillas JS de las bases y control de acceso en cada Página de staff (§10.5).
6. Código: desaprobar las criticidades manuales en el Tablero y el Detalle (opción B).
7. Medir cuántas entradas de Criticidad genera por año un estudiante (límite de 50).
8. Pedidos a la cátedra: el rol de TUT, GES y PAR, los miembros de los grupos `Zhakyz_*` y una cuenta de estudiante de prueba.
9. Antes de abrir el sistema: borrar los datos de prueba, sumar los grupos `Zhakyz_*` a la restricción de la sección, verificar con una cuenta de cada grupo y extender la fecha `hasta` si hace falta.
