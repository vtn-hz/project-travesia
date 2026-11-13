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
| **Respuesta a la encuesta** | Habilitados (2.º año en adelante), respondieron, sin responder y con omisión; tasa de respuesta por cohorte; fecha límite del período | Estudiantes, Respuestas, Criticidad (omisiones) y Períodos |
| **Resultados de la encuesta** | Distribución del avance percibido, el estado del Proyecto Final, la situación laboral y el inicio laboral; por materia, cuántos la cursaron, cuántos la recursan y la dificultad promedio | Respuestas (último envío de la Cuatrimestral de cada estudiante en el período) y Materias |
| **Notas de 1.er año** | Distribución del ICG; por materia, % de aprobadas, % de ausentes, promedio de lo rendido y cuántos estudiantes tienen alguna nota bajo el umbral | CargaParcialesPrimero, CargaMateriasPrimero y Criticidad |
| **Entrevistas y tutorías** | Entrevistas pedidas en el período por estado y por acompañante, días promedio hasta realizarlas y un aviso con los estudiantes en riesgo alto sin entrevista | Entrevistas, Estudiantes y Criticidad |
| **Avance curricular** | Créditos aprobados y avance sobre el plan (223 créditos), por cohorte y por estudiante, y cuántos están bajo el 38,97 %. **Provisorio:** la comparación con lo esperado según el tiempo desde el ingreso está en análisis | Estudiantes y Respuestas (cuadro de créditos) |

### Reglas

- **Criticidad:** la misma regla que el [Tablero de Criticidad](tablero-estudiantes.md). En 1.er año, el último índice de notas del período; desde 2.º año, el de la última Encuesta Cuatrimestral o la omisión. Sin entradas en el período, vale la última del período anterior. El estado asignado es la última entrada manual, de cualquier período.
- **Notas de 1.er año:** como `IndiceNotasPrimero`. Un recuperatorio reemplaza la instancia que indica en `Recupera_a`; una instancia es ausente si su estado es "Ausente" o no tiene nota, y aprobada si su estado es "Aprobado". Las notas se cruzan con Estudiantes por DNI.
- **Respuestas:** solo las Cuatrimestrales con el formato del [ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md) (`{ item_id, respuestas }`). Las versiones anteriores se ignoran.
- **Entrevistas del período:** las pedidas entre el inicio del período y el inicio del siguiente.

## Exportar

- **Descargar CSV:** el detalle del informe, con punto y coma, coma decimal y BOM para Excel. Las celdas que empiezan con `=`, `+`, `-` o `@` se neutralizan, como en el tablero.
- **Imprimir o guardar en PDF:** abre una ventana con solo el informe (encabezado, filtros, resumen y tabla) y el diálogo de impresión del navegador, donde se elige "Guardar como PDF". Si el navegador bloquea la ventana, se avisa.
- **Sin DNI ni email** en las exportaciones: solo nombre y apellido (decisión del 2026-11-13).

## Datos

- **En Moodle:** lee las 8 bases con `LeerBase` de la Página Tools, como el Tablero. Lee todas las entradas al abrir la página (la forma de leer de las otras secciones; reducir la lectura queda para más adelante). Si una base no se leyó entera, lo avisa.
- **En la vista previa local:** datos de prueba de los integrantes, con datos académicos ficticios.

## Pendientes

- **Publicar** como Página **oculta** en la subsección Hub (la ven profesores y administradores; los estudiantes no), con confirmación ([`RULES.md`](../../RULES.md), regla 3), y cargar su cmid en `paginas.reportes`.
- **Reducir la lectura** de las bases que crecen con cada período (Criticidad y Entrevistas): filtrar por período o guardar resúmenes al cerrar cada período.
- **Textos de las opciones** de la Encuesta Cuatrimestral: hoy están copiados en el código; se pueden leer de la versión vigente de la base Encuestas.
- **Detección de roles** en Moodle, por grupos.
