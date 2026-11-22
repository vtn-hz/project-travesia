// ---------------------------------------------------------
// GUION: REPORTES (ADM Y TUT) · no descarga ni guarda conclusiones
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'reportes',
  roles: ['ADM', 'TUT'],
  orden: 60,
  titulo: 'Reportes',
  introduccion: 'Informes de gestión listos para presentar: criticidad del período, respuesta y resultados de la encuesta, notas de 1.er año, ' +
    'entrevistas, avance curricular y trayectoria. Cada informe se puede descargar en CSV o guardar en PDF.',
  pasos: [
    {
      titulo: 'Elegir el informe y los filtros',
      texto: 'En el Hub, en "Reportes", hacé clic en "Generar reporte". Elegí el período, la cohorte y el año de la carrera, y después el informe. Se arma solo, sin botón de buscar.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.reportes}` }, { esperar: '#selector-reportes button[data-informe]' }, { pausa: 1500 },
        // La pantalla muestra siempre "Administrador" (ROL_INICIAL fijo en ADM): se oculta para no confundir en los otros manuales
        { ocultar: '#badge-rol-reportes' }],
      marcas: [
        { selector: '#filtros-reportes', texto: 'Filtros: período, cohorte y año de la carrera.' },
        { selector: '#selector-reportes', texto: 'Informes disponibles.' },
        { selector: '#btn-csv-reportes', texto: 'Descarga los datos del informe en CSV.' },
        { selector: '#btn-pdf-reportes', texto: 'Imprime el informe o lo guarda en PDF.' },
      ],
      recorte: { selector: '#reportes-gestion', alto: 760 },
    },
    {
      titulo: 'Leer el informe',
      texto: 'Cada informe tiene un resumen con los números principales y tablas que se ordenan con un clic en el título de la columna. Al final, el equipo puede escribir las conclusiones del informe para el período.',
      acciones: [{ pausa: 300 }],
      marcas: [
        { selector: '#contenido-reportes table', texto: 'Tabla del informe: hacé clic en el título de una columna para ordenarla.' },
        { selector: '#btn-ir-conclusiones', texto: 'Lleva a las conclusiones del informe.' },
      ],
      recorte: { selector: '#contenido-reportes', alto: 760 },
    },
  ],
});
