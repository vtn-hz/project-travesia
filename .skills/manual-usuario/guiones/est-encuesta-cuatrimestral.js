// ---------------------------------------------------------
// GUION: ENCUESTA CUATRIMESTRAL (EST) · no envía
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'est-encuesta-cuatrimestral',
  roles: ['EST'],
  orden: 30,
  titulo: 'Responder la Encuesta Cuatrimestral',
  introduccion: 'Desde 2.º año, cada cuatrimestre se responde la Encuesta Cuatrimestral: materias, situación laboral y cursadas actuales. ' +
    'Con tus respuestas el equipo de tutores puede acompañarte a tiempo.',
  pasos: [
    {
      titulo: 'Abrir la encuesta',
      texto: 'En Mi Trayectoria, la tarjeta muestra el período y si ya la respondiste. Hacé clic en "Responder la encuesta" o, si ya la respondiste, en "Actualizar la respuesta".',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#vista-estudiante [data-accion="cuatrimestral"]' }, { pausa: 1000 }],
      marcas: [
        { selector: '#card-encuesta-cuatrimestral', texto: 'Estado de la encuesta en el período vigente.' },
        { selector: '#vista-estudiante [data-accion="cuatrimestral"]', texto: 'Abre la encuesta.' },
      ],
      recorte: { selector: '#vista-estudiante', alrededor: 60 },
      despues: [{ clic: '#vista-estudiante [data-accion="cuatrimestral"]', navega: true }],
    },
    {
      titulo: 'Empezar a responder',
      texto: 'En la portada de la encuesta, hacé clic en "Responda a las preguntas".',
      acciones: [{ esperar: '#region-main a[href*="complete.php"], #region-main .btn' }],
      marcas: [{ selector: '#region-main a[href*="complete.php"]', texto: 'Abre las preguntas de la encuesta.' }],
      recorte: { selector: '#region-main', alrededor: 120 },
      despues: [{ clic: '#region-main a[href*="complete.php"]', navega: true }],
    },
    {
      titulo: 'Completar y enviar',
      texto: 'Respondé cada pregunta. Al final de la página, hacé clic en "Enviar sus respuestas". Si ya la respondiste en este período, la nueva respuesta reemplaza a la anterior.',
      acciones: [{ esperar: '#region-main form' }, { pausa: 3000 }],
      marcas: [
        { selector: '#region-main form .feedback_itemlist, #region-main form fieldset, #region-main form .mform', texto: 'Preguntas de la encuesta.' },
      ],
      recorte: { selector: '#region-main', alto: 760 },
    },
  ],
});
