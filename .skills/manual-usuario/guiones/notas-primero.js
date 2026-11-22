// ---------------------------------------------------------
// GUION: NOTAS DE 1.ER AÑO (ADM Y TUT) · solo lectura
// ---------------------------------------------------------
// Es una base de datos de Moodle. Se busca un estudiante de prueba (filter=1 aplica la búsqueda por dirección, sin enviar el
// formulario) para que la lista solo muestre datos ficticios.
module.exports = (config) => ({
  id: 'notas-primero',
  roles: ['ADM', 'TUT'],
  orden: 70,
  titulo: 'Notas de 1.er año',
  introduccion: 'Reúne las notas de parciales que cargan los estudiantes de 1.er año. Con ellas se calcula su estado de riesgo.',
  pasos: [
    {
      titulo: 'Buscar las notas de un estudiante',
      texto: 'En el Hub, en "Notas de 1.er año", hacé clic en "Ver notas". Escribí el DNI o el nombre en "Buscar" y presioná Enter. Con "Ordenar por" cambiás el orden de la lista.',
      acciones: [{ ir: `/mod/data/view.php?id=${config.bases.carga_parciales_primero.cmid}&perpage=10&filter=1&search=${encodeURIComponent('Martínez')}` }, { esperar: '#data-listview-content' }, { pausa: 800 }],
      marcas: [
        { selector: '#reg_search', texto: 'Buscar por DNI, nombre, materia o estado.' },
        { selector: '#pref_sortby', texto: 'Ordenar la lista.' },
        { selector: '#data-listview-content table', texto: 'Notas: materia, instancia, período, nota y condición.' },
      ],
      recorte: { selector: '#region-main', alto: 700, desde: '#options' },
    },
  ],
});
