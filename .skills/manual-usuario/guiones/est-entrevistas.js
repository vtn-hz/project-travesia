// ---------------------------------------------------------
// GUION: ENTREVISTAS Y TUTORÍAS (EST) · no envía ni responde
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'est-entrevistas',
  roles: ['EST'],
  orden: 50,
  titulo: 'Entrevistas y Tutorías',
  introduccion: 'Podés pedir una entrevista con un tutor o un asesor par, y responder las que te propongan: aceptar la fecha o proponer otra.',
  pasos: [
    {
      titulo: 'Abrir la agenda',
      texto: 'En Mi Trayectoria, hacé clic en "Abrir agenda". Arriba están tus entrevistas pendientes (Agenda) y las pasadas (Historial).',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.entrevistas}` }, { esperar: '#tabla-entrevistas' }, { pausa: 1500 }],
      marcas: [
        { selector: '#pestanas-entrevistas', texto: 'Agenda (pendientes) e Historial (realizadas, canceladas o rechazadas).' },
        { selector: '#btn-solicitar-entrevista', texto: 'Pedir una entrevista nueva.' },
        { selector: '#tabla-entrevistas', texto: 'Tus entrevistas, con la fecha, quién la propuso y el estado.' },
      ],
      recorte: { selector: '#entrevistas-tutorias', alto: 520 },
    },
    {
      titulo: 'Pedir una entrevista',
      texto: 'Hacé clic en "Solicitar entrevista", elegí el tutor o asesor par, una fecha posible y el motivo. El elegido recibe un mensaje del campus. Después, hacé clic en "Enviar solicitud".',
      acciones: [{ clic: '#btn-solicitar-entrevista' }, { esperar: '#campo-destinatario-solicitud:not([disabled])' }, { pausa: 500 }],
      marcas: [
        { selector: '#campo-destinatario-solicitud', texto: 'Con quién: un tutor o un asesor par del curso.' },
        { selector: '#modal-solicitar-entrevista #campo-fecha-solicitud', texto: 'Fecha y hora propuestas.' },
        { selector: '#modal-solicitar-entrevista #campo-motivo-solicitud', texto: 'Motivo de la entrevista.' },
        { selector: '#modal-solicitar-entrevista [data-accion="enviar-solicitud"]', texto: 'Envía el pedido.' },
      ],
      recorte: { selector: '#modal-solicitar-entrevista > div', alto: 900 },
      despues: [{ clic: '#btn-cerrar-solicitar' }, { pausa: 500 }],
    },
    {
      titulo: 'Responder una propuesta',
      texto: 'Cuando un tutor te propone una fecha, la entrevista aparece "Por responder". Abrila con "Ver" y elegí "Aceptar fecha" o "Proponer otra fecha".',
      acciones: [{ clic: '#cuerpo-tabla-entrevistas tr[data-entrevista]' }, { esperar: '#modal-entrevista' }, { pausa: 800 }],
      marcas: [
        { selector: '#modal-entrevista [data-accion="aceptar"]', texto: 'Acepta la fecha propuesta.' },
        { selector: '#modal-entrevista [data-accion="contraoferta"]', texto: 'Propone otra fecha y hora.' },
      ],
      recorte: { selector: '#modal-entrevista > div', alto: 900 },
      despues: [{ clic: '#btn-cerrar-entrevista' }],
    },
  ],
});
