# Especificación: Detalle del estudiante

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/detalle_estudiante/content.html`
- **Acceso:** desde el [Tablero de Criticidad](tablero-estudiantes.md) ("Ver detalle" o clic en la fila). Recibe el estudiante en la URL: `#usuario=<id de Moodle>`.
- **Roles:** ADM, GES y TUT. Solo **TUT y ADM** pueden asignar estados.
- **Requerimientos:** Req 4 (semáforos), Req 5 (dashboard docente) y Req 10 (gestión de estados).
- **Ticket:** [SCRUM-21](https://zhakyz.atlassian.net/browse/SCRUM-21) · rama `feat/SCRUM-21-tablero-criticidad`
- **Estado:** desarrollado en local con datos de prueba sobre las bases del ADR-007. **No publicado.**
- **Última actualización:** 2026-11-03

> **En revisión.** Cargar en el frontend los datos de todos los estudiantes para esta visualización puede ser muy pesado. El modelo de bases y la pregunta abierta están en el [ADR-005](../decisions/005-modelo-de-bases-moodle.md).

## Diseño

| Izquierda | Derecha |
|---|---|
| **Perfil del estudiante:** foto del campus (o iniciales), nombre, año de la carrera, cohorte y estado vigente; id de usuario, DNI, correo, ingreso, paso a 2.º año y fecha de la información personal (base Estudiantes). En el campus se suman los datos del perfil del curso | **Resumen:** criticidad calculada (índice y de dónde sale), estado calculado y estado asignado, con el botón **Asignar estado** (TUT y ADM) |
| | **Evolución de la criticidad:** gráfico con dos series |
| | **Trayectoria:** la cronología, con filtros por tipo |
| | **Historial de cambios de estado:** calculados y asignados |

En celular las columnas se apilan y el gráfico se dibuja al ancho de la pantalla. Un estudiante sin información personal muestra "DNI …", el ícono de persona y el aviso en el perfil.

## Foto y datos del campus

Verificado en el campus (con un integrante del equipo):

- **Foto:** `M.cfg.wwwroot + '/user/pix.php/<id>/f1.jpg'` devuelve la imagen de perfil. Moodle aplica los permisos de quien mira. Si no hay foto o falla, se muestran las iniciales.
- **Datos:** `user/view.php?id=<id>&course=1732`. El nombre está en `.page-context-header .page-header-headings h2` y los campos en `li.contentnode` (`dt` y `dd`): correo, país, zona horaria, roles, grupo, último acceso al curso. Se muestran solo los que Moodle deja ver a quien consulta.
- En local se usan las iniciales y datos ficticios. El repo es público, así que no se guardan correos.

## Decisiones del 2026-11-03

- **Gráfico con dos series** de la base Criticidad (entradas automáticas):
  - **Parciales:** el `indice` de cada entrada de notas (`notas_1ro`, `materias`);
  - **Encuestas:** el `indice` de cada envío de encuesta (`respuestas`, `omision`).
  - Para quien pasó de 1.er a 2.º año se ven las dos en el tiempo. Los estados asignados siguen como marcas (rombo en el centro de su banda).
- **Cronología** (de lo más reciente a lo más viejo): encuestas enviadas (con su índice y semáforo), notas de parciales cargadas (con el índice que generaron), estados asignados y quitados (motivo y autor), entrevistas, alta de la información personal y paso a 2.º año (`periodo_paso_superior`).
- **Asignar estado:** el mismo diálogo que el tablero (semáforo y motivo obligatorio; solo TUT y ADM).

## Gráfico

- **Parciales (1.er año):** el `indice` de cada entrada automática de notas (`notas_1ro`, `materias`). Línea azul con círculos.
- **Encuestas:** el `indice` de cada envío (Inicial y Cuatrimestral) y de cada omisión. Línea gris oscura punteada con cuadrados. La Inicial se dibuja, pero no entra en el calculado.
- **Estados asignados:** rombo del color del estado, en el centro de su banda (verde 20, amarillo 55, rojo 85), con una línea vertical.
- **Paso a 2.º año:** línea vertical punteada al inicio de `periodo_paso_superior`.
- **Bandas:** las del semáforo de la base Criticidad: menos de 40, de 40 a 69 y 70 o más. Cada punto tiene su detalle al pasar el mouse.

## Trayectoria (cronología)

De lo más reciente a lo más viejo, con filtros *Todo*, *Encuestas*, *Notas de parciales*, *Estados asignados*, *Entrevistas* e *Información personal* (cada uno con su cantidad):

| Tipo | Sale de | Muestra |
|---|---|---|
| Encuestas | Criticidad (`respuestas`, `omision`) y Respuestas | Qué encuesta, el período, el semáforo y el índice. Un envío sin entrada de Criticidad figura "sin índice" |
| Notas de parciales | Criticidad (`notas_1ro`, `materias`) y CargaParcialesPrimero (por `rid_fuente`) | Materia, instancia, nota y estado, con el índice de notas que generó. El recálculo muestra su motivo |
| Estados asignados | Criticidad (`origen = manual`) | Asignó o quitó, el estado, el autor y el motivo |
| Entrevistas | Entrevistas (por DNI o `id_usuario_estudiante`) | Con quién, el estado y el resultado (o el motivo) |
| Información personal | Estudiantes | Alta de la información y paso a 2.º año |

## Historial de cambios de estado

- **Calculado:** cada vez que cambia el nivel, con la fuente que correspondía al año de la carrera en ese período (antes de `periodo_paso_superior`, las notas; después, la Cuatrimestral o la omisión).
- **Asignado:** todas las asignaciones, incluidas las que quitan el estado.

## Lectura en Moodle

Como el tablero (Página Tools y `LeerBase`), más CargaParcialesPrimero (por columnas, `tr[data-tipo="entrada_parcial"]`) y Entrevistas. Esas dos solo completan la cronología: si no se pueden leer, el detalle sigue sin ellas.

## Pendientes

- Publicar el detalle y el tablero, y cargar `paginas.detalle` y `paginas.tablero` (requiere confirmación).
- Detectar el rol en Moodle (por grupos).
- Los mismos pendientes de privacidad y de la omisión que el [tablero](tablero-estudiantes.md#pendientes).
