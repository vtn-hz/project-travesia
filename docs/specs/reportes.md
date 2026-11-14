# Especificación: Reportes

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/reportes/content.html`
- **Acceso:** botón "Generar reporte" de la tarjeta "Reportes" del [menú inicial](../../section/menu_inicial/content.html). Hoy solo en la vista previa local (`paginas.reportes` vale `null`)
- **Roles:** ADM, GES y TUT. Todos ven los mismos informes
- **Requerimientos:** Visualización y Reportes (informes de gestión con resumen y estadísticas) y Generación de estadísticas (exportar en CSV y PDF)
- **Estado:** desarrollada en local, **sin publicar**
- **Última actualización:** 2026-11-13

---

## Propósito

Armar informes de gestión del período con un resumen, estadísticas y el detalle, y descargarlos en CSV o guardarlos en PDF.

## Filtros

| Filtro | Opciones | De dónde sale |
|---|---|---|
| Período | Los de la base Períodos (la entrada más nueva de cada uno). Arranca en el más reciente | Períodos |
| Cohorte | Todas, o un año y cuatrimestre de ingreso | Estudiantes (`anio_ingreso`, `cuatrimestre_ingreso`) |
| Año de la carrera | Todos, 1.er año o 2.º año en adelante | Estudiantes (`es_primer_anio`) |

## Informes

| Informe | Qué muestra | Bases |
|---|---|---|
| **Criticidad del período** | Estudiantes en riesgo alto, moderado y bajo, sin calcular y con estado asignado; por año de la carrera; detalle con el calculado, el asignado y el vigente | Estudiantes, Criticidad y Respuestas (para saber de qué encuesta es cada entrada) |
| **Respuesta a la encuesta** | Habilitados (2.º año en adelante), respondieron (también las que quedaron solo en Moodle), sin responder, con omisión y, si hay, los que pasaron a 2.º año en el período; tasa de respuesta por cohorte; fecha límite del período | Estudiantes, Respuestas, Criticidad (omisiones), Períodos y las respuestas de la Encuesta Cuatrimestral en Moodle |
| **Resultados de la encuesta** | Distribución del avance percibido, el estado del Proyecto Final, la situación laboral y el inicio laboral, con el texto de cada pregunta; por materia, cuántos la cursaron, cuántos la recursan y la dificultad promedio | Respuestas (último envío de la Cuatrimestral de cada estudiante en el período), Encuestas y Materias |
| **Notas de 1.er año** | Distribución del ICG; por materia, % de aprobadas, % de ausentes, promedio de lo rendido y cuántos estudiantes tienen alguna nota bajo el umbral. Las materias con notas que no están en CargaMateriasPrimero se muestran como no críticas | CargaParcialesPrimero, CargaMateriasPrimero y Criticidad |
| **Entrevistas y tutorías** | Entrevistas pedidas en el período por estado y por acompañante, días promedio hasta realizarlas y un aviso con los estudiantes en riesgo alto sin entrevista | Entrevistas, Estudiantes y Criticidad |
| **Avance curricular** | Créditos aprobados y avance sobre el plan (223 créditos), por cohorte y por estudiante, y cuántos están bajo el 38,97 %. **Provisorio:** la comparación con lo esperado según el tiempo desde el ingreso está en análisis | Estudiantes, Respuestas (cuadro de créditos) y Encuestas |

### Reglas

- **Criticidad:** la misma regla que el [Tablero de Criticidad](tablero-estudiantes.md), con `CriticidadEstudiante` de la Página Tools (versión 7). En 1.er año, el último índice de notas del período; desde 2.º año, el de la última Encuesta Cuatrimestral o la omisión. Sin entradas en el período, vale la última del período anterior. El estado asignado es la última entrada manual, de cualquier período.
- **Notas de 1.er año:** como `IndiceNotasPrimero`. Los nombres de las materias se comparan con `NormalizarMateria` de Tools (sin mayúsculas, espacios, guiones ni guiones bajos; las tildes sí cuentan). Un recuperatorio reemplaza la instancia que indica en `Recupera_a`; una instancia es ausente si su estado es "Ausente" o no tiene nota, y aprobada si su estado es "Aprobado". Las notas se cruzan con Estudiantes por DNI.
- **Respuestas:** solo las Cuatrimestrales con el formato del [ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md) (`{ item_id, respuestas }`). Las versiones anteriores se ignoran. Cada pregunta se busca por su variable (`avance_percibido`, `progreso_proyecto_final`, `trabaja`, `inicio_laboral`, `materias_cuatrimestre` y `creditos_aprobados`): el `item_id` sale de la versión de cada envío en la base Encuestas, y los textos de las opciones, de la versión vigente (`DefinicionEncuesta` de Tools).
- **Respuesta a la encuesta:** el mismo orden que el cierre del período ([ADR-009](../decisions/009-cierre-de-periodo-y-omision.md)): respondió, respondió solo en Moodle, omisión registrada, pasó a 2.º año en el período y sin responder. Una respuesta en Moodle (`RespuestasMoodle` de Tools) cuenta para el período si es del inicio del período en adelante y anterior al inicio del siguiente; Moodle guarda solo la última de cada estudiante.
- **Entrevistas del período:** las pedidas entre el inicio del período y el inicio del siguiente.

## Exportar

- **Descargar CSV:** el detalle del informe, con punto y coma, coma decimal y BOM para Excel. Las celdas que empiezan con `=`, `+`, `-` o `@` se neutralizan, como en el tablero.
- **Imprimir o guardar en PDF:** abre una ventana con solo el informe (encabezado, filtros, fecha y hora de generación, resumen, gráficos, tablas de resumen y detalle) y el diálogo de impresión del navegador, donde se elige "Guardar como PDF". Si el navegador bloquea la ventana, se avisa.
- **Fecha y hora de generación:** también se muestran en pantalla, debajo de los filtros.
- **Ordenar:** un clic en el encabezado de una columna ordena la tabla de menor a mayor y otro, de mayor a menor; las celdas vacías van al final. El CSV y el PDF mantienen el orden original.
- **Sin DNI ni email** en las exportaciones: solo nombre y apellido (decisión del 2026-11-13).

## Datos

- **En Moodle:** lee las bases con `LeerBase` de la Página Tools (versión 7 o más nueva), como el Tablero. Al abrir lee Períodos y Estudiantes (los filtros); cada informe lee las demás bases la primera vez que se elige y después las reutiliza. Cada base se lee entera (la forma de leer de las otras secciones; filtrar la lectura queda para más adelante). Si una base no se leyó entera, lo avisa. Si no se pueden leer las respuestas en Moodle, el informe de respuesta lo avisa y cuenta solo las de Respuestas.
- **En la vista previa local:** la Página Tools del repo (hay que abrirla con Live Server) y datos de prueba de los integrantes, con datos académicos ficticios, que pasan por la misma conversión que los datos de Moodle.

## Pendientes

- **Publicar antes la Página Tools versión 7** (`CriticidadEstudiante`, `DefinicionEncuesta`, `RespuestasMoodle` y `NormalizarMateria`): con la v6 Reportes avisa que necesita la v7.
- **Publicar** como Página **oculta** en la subsección Hub (la ven profesores y administradores; los estudiantes no), con confirmación ([`RULES.md`](../../RULES.md), regla 3), y cargar su cmid en `paginas.reportes`.
- **Reducir la lectura** de las bases que crecen con cada período (Criticidad y Entrevistas): filtrar por período o guardar resúmenes al cerrar cada período.
- **Una sola copia de la regla:** el Tablero y el Detalle todavía tienen su propia copia de la regla de criticidad, y la Configuración del Sistema, de la lectura de las respuestas en Moodle. Pasarlos a `CriticidadEstudiante` y `RespuestasMoodle` de Tools v7 (hay que republicar las tres Páginas).
- **Detección de roles** en Moodle, por grupos.
