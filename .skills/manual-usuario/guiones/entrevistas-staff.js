// ---------------------------------------------------------
// GUION: ENTREVISTAS Y TUTORÍAS DEL EQUIPO (ADM, TUT Y PAR) · no envía ni guarda
// ---------------------------------------------------------
// Las filas se eligen por su estado ("Responder", "Registrar resultado"): en clic se usan selectores de Playwright (:has-text).
// Responder y registrar el resultado solo lo puede hacer quien pidió la entrevista (o ADM). La cuenta que genera el manual no pidió
// ninguna: esos pasos, con los botones, son solo de ADM; TUT y PAR tienen un paso que explica lo mismo para sus propias entrevistas.
const FILA = '#cuerpo-tabla-entrevistas tr[data-entrevista]';
module.exports = (config) => ({
  id: 'entrevistas-staff',
  roles: ['ADM', 'TUT', 'PAR'],
  orden: 40,
  titulo: 'Entrevistas y Tutorías',
  introduccion: 'Acá se coordinan las entrevistas con los estudiantes: se piden, se acuerda la fecha (aceptar o proponer otra), ' +
    'se registra cómo salió y qué acciones se acordaron. Arriba quedan las que esperan una respuesta o el resultado.',
  pasos: [
    {
      titulo: 'Abrir la agenda',
      texto: 'En el Hub, en la tarjeta "Entrevistas y Tutorías", hacé clic en "Abrir agenda". Las tarjetas de arriba resumen las entrevistas por estado y también funcionan como filtro.',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#btn-entrevistas' }, { clic: '#btn-entrevistas', navega: true },
        { esperar: `${FILA}` }, { pausa: 1500 }],
      marcas: [
        { selector: '#grilla-kpi-entrevistas', texto: 'Resumen: por responder, falta resultado, programadas, esperando al estudiante y realizadas.' },
        { selector: '#pestanas-entrevistas', texto: 'Agenda (pendientes) e Historial (realizadas, canceladas o rechazadas).' },
        { selector: '#filtro-busqueda-entrevistas', texto: 'Buscar por estudiante.' },
        { selector: '#btn-solicitar-entrevista', texto: 'Pedir una entrevista nueva.' },
        { selector: '#tabla-entrevistas thead', texto: 'Cada fila: estudiante y acompañante, fecha, quién la pidió, estado y la acción que corresponde.' },
      ],
      recorte: { selector: '#entrevistas-tutorias', alto: 760 },
    },
    {
      titulo: 'Pedir una entrevista',
      texto: 'Hacé clic en "Solicitar entrevista". Completá el DNI y el nombre del estudiante, si participás como tutor o como asesor par, una fecha y el motivo. Después hacé clic en "Enviar solicitud": el estudiante recibe un mensaje del campus y puede aceptar la fecha o proponer otra.',
      acciones: [{ clic: '#btn-solicitar-entrevista' }, { esperar: '#campo-dni-solicitud' },
        { escribir: '#campo-dni-solicitud', valor: '45503998' }, { escribir: '#campo-nombre-solicitud', valor: 'Abril Rossi' },
        { escribir: '#campo-motivo-solicitud', valor: 'Riesgo alto en el cierre 2026-2: no respondió la encuesta.' }, { pausa: 400 }],
      marcas: [
        { selector: '#campo-dni-solicitud', texto: 'DNI y nombre del estudiante.' },
        { selector: '#campo-tipo-solicitud', texto: 'Participás como tutor o como asesor par.' },
        { selector: '#campo-fecha-solicitud', texto: 'Fecha y hora que proponés.' },
        { selector: '#campo-motivo-solicitud', texto: 'Motivo de la entrevista.' },
        { selector: '#modal-solicitar-entrevista [data-accion="enviar-solicitud"]', texto: 'Envía el pedido al estudiante.' },
      ],
      recorte: { selector: '#modal-solicitar-entrevista > div', alto: 900 },
      despues: [{ clic: '#btn-cerrar-solicitar' }, { pausa: 400 }],
    },
    {
      roles: ['ADM'],
      titulo: 'Responder una propuesta del estudiante',
      texto: 'Cuando el estudiante propone otra fecha, la entrevista aparece "Por responder". Hacé clic en "Responder" y elegí "Aceptar fecha" o "Proponer otra fecha".',
      acciones: [{ clic: `${FILA}:has-text("Por responder")` }, { esperar: '#modal-entrevista [data-accion="contraoferta"]' }, { pausa: 600 }],
      marcas: [
        { selector: '#cuerpo-modal-entrevista > div:first-child', texto: 'Estado, estudiante, acompañante y quién pidió la entrevista.' },
        { selector: '#modal-entrevista [data-accion="aceptar"]', texto: 'Acepta la fecha que propuso el estudiante.' },
        { selector: '#modal-entrevista [data-accion="contraoferta"]', texto: 'Propone otra fecha y hora.' },
      ],
      recorte: { selector: '#modal-entrevista > div', alto: 900 },
      despues: [{ clic: '#btn-cerrar-entrevista' }, { pausa: 400 }],
    },
    {
      roles: ['ADM'],
      titulo: 'Registrar el resultado',
      texto: 'Cuando pasa la fecha, la entrevista queda en "Falta resultado". Abrila, hacé clic en "Registrar resultado" y completá cuándo se hizo, qué surgió y las acciones acordadas (derivaciones y compromisos). Después hacé clic en "Guardar resultado". Si el estudiante no fue, usá "No asistió".',
      acciones: [{ clic: `${FILA}:has-text("Falta resultado")` }, { esperar: '#modal-entrevista [data-accion="resultado"]' },
        { clic: '#modal-entrevista [data-accion="resultado"]' }, { esperar: '#campo-resultado' },
        { escribir: '#campo-resultado', valor: 'Recursa dos materias por superposición horaria. Se le sugirió cambiar de comisión.' }, { pausa: 400 }],
      marcas: [
        { selector: '#campo-fecha-realizada', texto: 'Fecha y hora en que se hizo.' },
        { selector: '#campo-resultado', texto: 'Qué surgió de la entrevista.' },
        { selector: '#modal-entrevista [data-accion="agregar-accion"]', texto: 'Agrega una acción acordada: una derivación o un compromiso con fecha de seguimiento.' },
        { selector: '#modal-entrevista [data-accion="guardar-resultado"]', texto: 'Guarda el resultado: la entrevista pasa al Historial.' },
      ],
      recorte: { selector: '#modal-entrevista > div', alto: 1000 },
      despues: [{ clic: '#btn-cerrar-entrevista' }, { pausa: 400 }],
    },
    {
      roles: ['TUT', 'PAR'],
      titulo: 'Gestionar tus entrevistas',
      texto: 'Hacé clic en la fila para abrir una entrevista. En las que pediste vos aparecen los botones que correspondan a su estado: "Aceptar fecha" o "Proponer otra fecha" cuando el estudiante propuso una fecha; "Registrar resultado" o "No asistió" cuando ya pasó la fecha (completás cuándo se hizo, qué surgió y las acciones acordadas, y hacés clic en "Guardar resultado"). Las entrevistas de otros acompañantes solo se pueden consultar.',
      acciones: [{ clic: `${FILA}:has-text("Falta resultado")` }, { esperar: '#modal-entrevista [data-accion="ver-detalle"]' }, { pausa: 600 }],
      marcas: [
        { selector: '#cuerpo-modal-entrevista > div:first-child', texto: 'Estado, estudiante, acompañante y quién pidió la entrevista.' },
        { selector: '#modal-entrevista [data-accion="ver-detalle"]', texto: 'Abre el detalle del estudiante.' },
      ],
      recorte: { selector: '#modal-entrevista > div', alto: 900 },
      despues: [{ clic: '#btn-cerrar-entrevista' }, { pausa: 400 }],
    },
  ],
});
