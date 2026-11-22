// ---------------------------------------------------------
// GUION: CARGA DE NOTAS DE 1.ER AÑO (EST) · no guarda
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'est-parciales',
  roles: ['EST'],
  orden: 40,
  titulo: 'Cargar las notas de los parciales de 1.er año',
  introduccion: 'Si cursás materias de 1.er año, cargá la nota de cada parcial o recuperatorio apenas la tengas. Cada estudiante ve y edita solo sus notas.',
  pasos: [
    {
      titulo: 'Abrir la carga de notas',
      texto: 'En Mi Trayectoria, hacé clic en "Cargar parciales".',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#vista-estudiante [data-accion="parciales"]' }, { pausa: 1000 }],
      marcas: [{ selector: '#vista-estudiante [data-accion="parciales"]', texto: 'Abre la carga de notas de 1.er año.' }],
      recorte: { selector: '#vista-estudiante', alrededor: 140 },
      despues: [{ clic: '#vista-estudiante [data-accion="parciales"]', navega: true }],
    },
    {
      titulo: 'Cargar una nota',
      texto: 'Elegí la materia, la instancia (parcial o recuperatorio), el año y el cuatrimestre de la cursada y la condición. Escribí la nota con punto decimal (por ejemplo, 4.5) y hacé clic en "Guardar nota".',
      acciones: [{ esperar: '#form-nota-notas' }, { pausa: 800 }],
      marcas: [
        { selector: '#campo-materia-notas', texto: 'Materia de 1.er año.' },
        { selector: '#campo-instancia-notas', texto: 'Instancia: se habilita después de elegir la materia.' },
        { selector: '#campo-condicion-notas', texto: 'Condición. Con "Ausente", la nota no se completa.' },
        { selector: '#campo-nota-notas', texto: 'Nota, con punto decimal.' },
        { selector: '#btn-guardar-notas', texto: 'Guarda la nota.' },
      ],
      recorte: { selector: '#form-nota-notas', alto: 420 },
    },
    {
      titulo: 'Revisar o corregir las notas',
      texto: 'Las notas guardadas aparecen en "Notas registradas". Para corregir una, hacé clic en "Editar".',
      marcas: [
        { selector: '#tabla-notas', texto: 'Notas registradas, con su materia, instancia, nota y condición.' },
        { selector: '#tabla-notas button, #tabla-notas [role="button"]', texto: 'Editar: carga la nota en el formulario para corregirla.' },
      ],
      recorte: { selector: '#tabla-notas', alto: 300 },
    },
  ],
});
