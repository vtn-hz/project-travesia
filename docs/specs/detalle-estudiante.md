# Especificación: Detalle del estudiante

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/detalle_estudiante/content.html`
- **Acceso:** desde el [Tablero de Criticidad](tablero-estudiantes.md) ("Ver detalle" o clic en la fila). Recibe el estudiante en la URL: `#usuario=<id de Moodle>`.
- **Roles:** ADM, GES y TUT. Solo **TUT y ADM** pueden asignar estados.
- **Requerimientos:** Req 4 (semáforos), Req 5 (dashboard docente) y Req 10 (gestión de estados).
- **Estado:** desarrollado en local con datos de prueba. **No publicado.**

> **En revisión.** Cargar en el frontend los datos de todos los estudiantes para esta visualización puede ser muy pesado. El modelo de bases y la pregunta abierta están en el [ADR-005](../decisions/005-modelo-de-bases-moodle.md).

## Diseño

| Izquierda | Derecha |
|---|---|
| **Foto de perfil circular** del campus, nombre, etapa, cohorte y estado vigente | Resumen: criticidad actual, estado calculado y estado asignado |
| **Datos del campus**: id de usuario, DNI, roles, grupo, último acceso al curso, país (todo lo que muestre el perfil del curso) | **Evolución de la criticidad** (gráfico de 0 a 100) |
| | **Historial de criticidad**: todas las actividades del estudiante, con filtro por tipo |
| | **Historial de cambios de estado**: calculados y asignados |
| | **Asignar estado** (Req 10) |

En celular las columnas se apilan y el gráfico se dibuja al ancho de la pantalla.

## Foto y datos del campus

Verificado en el campus (con un integrante del equipo):

- **Foto:** `M.cfg.wwwroot + '/user/pix.php/<id>/f1.jpg'` devuelve la imagen de perfil. Moodle aplica los permisos de quien mira. Si no hay foto o falla, se muestran las iniciales.
- **Datos:** `user/view.php?id=<id>&course=1732`. El nombre está en `.page-context-header .page-header-headings h2` y los campos en `li.contentnode` (`dt` y `dd`): correo, país, zona horaria, roles, grupo, último acceso al curso. Se muestran solo los que Moodle deja ver a quien consulta.
- En local se usan las iniciales y datos ficticios. El repo es público, así que no se guardan correos.

## Índice de criticidad (0 a 100), provisorio

- **1.er año:** `100 − % de materias esperadas aprobadas`. Las bandas coinciden con los umbrales del Req 4 que usa el tablero:
  - **80 o más:** riesgo alto (aprobó menos del 20 %);
  - **40 a 79:** riesgo medio;
  - **menos de 40:** sin riesgo (aprobó más del 60 %).
- **2.º año en adelante:** todavía no hay criterio. En los datos de prueba, no responder la encuesta del período vale 60 (alerta por omisión). Puede salir de la criticidad de las respuestas a las encuestas o de los modelos.

**Gráfico:**
- Línea azul con los valores calculados en cada corte o cierre.
- Rombo con línea punteada en cada estado asignado por un tutor, dibujado en el centro de su banda (alto 90, medio 60, sin riesgo 20).
- El fondo marca las tres bandas del semáforo.
- Cada punto tiene su detalle al pasar el mouse.

## Historiales

- **Historial de criticidad:** une las actividades del estudiante (inscripción, encuestas, notas cargadas, entrevistas, accesos) con cada estado calculado y cada asignación, ordenados de lo más reciente a lo más viejo.
- **Historial de cambios de estado:**
  - **Calculado:** se registra cada vez que el nivel calculado cambia.
  - **Asignado:** todas las asignaciones, incluidas las que quitan el estado.
  - Cada fila muestra el nivel anterior y el nuevo, quién lo cambió (el sistema o el tutor) y por qué.

## Pendientes

- Bases de Zhakyz para las series de criticidad y las actividades (además de Estudiantes y Asignaciones).
- Definir el criterio de 2.º año en adelante y aplicar los modelos.
- Publicar el tablero y el detalle, y cargar `CMID_DETALLE` y `CMID_TABLERO`.
- Detectar el rol en Moodle (por grupos).
