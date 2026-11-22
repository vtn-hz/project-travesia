// ---------------------------------------------------------
// GUION: MI TRAYECTORIA (EST) · solo lectura
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'est-mi-trayectoria',
  roles: ['EST'],
  orden: 10,
  titulo: 'Mi Trayectoria',
  introduccion: 'Mi Trayectoria es la pantalla de inicio del estudiante: muestra tu perfil y te lleva a cada sección del sistema. ' +
    'Las secciones se habilitan según tu año de la carrera y si ya cargaste tu información personal.',
  pasos: [
    {
      titulo: 'Conocer la pantalla',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#vista-estudiante [data-accion]' }, { pausa: 1500 }],
      texto: 'A la izquierda está tu perfil. A la derecha, tu información personal y las secciones del sistema. El botón oscuro es la acción que te conviene hacer primero.',
      marcas: [
        { selector: '#vista-estudiante [data-accion="informacion"]', texto: 'Información personal: cargala o editala. Sin ella, las demás secciones no se habilitan.' },
        { selector: '#vista-estudiante [data-accion="cuatrimestral"]', texto: 'Encuesta Cuatrimestral: responderla una vez por cuatrimestre (desde 2.º año).' },
        { selector: '#vista-estudiante [data-accion="parciales"]', texto: 'Parciales de primer año: cargar las notas de las materias de 1.er año.' },
        { selector: '#vista-estudiante [data-accion="entrevistas"]', texto: 'Entrevistas y Tutorías: pedir una entrevista o responder una propuesta.' },
      ],
      recorte: { selector: '#vista-estudiante', alto: 900 },
    },
  ],
});
