// ---------------------------------------------------------
// GUION: EL HUB DEL ASESOR PAR (PAR) · solo lectura
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'par-hub',
  roles: ['PAR'],
  orden: 5,
  titulo: 'El Hub',
  introduccion: 'El Hub es tu pantalla de inicio. Como asesor par trabajás en Entrevistas y Tutorías: desde ahí también abrís el detalle de cada estudiante que acompañás.',
  pasos: [
    {
      titulo: 'Conocer el Hub',
      texto: 'En la tarjeta "Entrevistas y Tutorías", hacé clic en "Abrir agenda".',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#btn-entrevistas' }, { pausa: 1000 }],
      marcas: [
        { selector: '#txt-saludo-equipo', texto: 'Qué podés hacer con tu rol.' },
        { selector: '#btn-entrevistas', texto: 'Abre Entrevistas y Tutorías.' },
      ],
      recorte: { selector: '#menu-equipo', alto: 700 },
    },
  ],
});
