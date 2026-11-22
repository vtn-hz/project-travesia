// ---------------------------------------------------------
// GUION: ASIGNAR O QUITAR UN ESTADO DE RIESGO DESDE EL TABLERO (ADM Y TUT) · no guarda
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'tablero-asignar',
  roles: ['ADM', 'TUT'],
  orden: 20,
  titulo: 'Asignar un estado de riesgo y exportar el tablero',
  introduccion: 'El estado calculado sale de las notas y de las encuestas. Si después de una entrevista sabés algo que el cálculo no ve, ' +
    'podés asignarle otro estado al estudiante, siempre con un motivo. El estado asignado pasa a ser el vigente hasta que lo quites.',
  pasos: [
    {
      titulo: 'Abrir la asignación',
      texto: 'En la fila del estudiante, hacé clic en "Asignar estado". Se abre una ventana con el estado de cada fuente.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.tablero}` }, { esperar: '#cuerpo-tabla-estudiantes tr[data-usuario]' }, { pausa: 800 }],
      marcas: [
        { selector: '#cuerpo-tabla-estudiantes [data-asignar]', texto: 'Botón "Asignar estado" de la fila.' },
      ],
      recorte: { selector: '#scroll-tabla-estudiantes', alto: 330 },
      despues: [{ clic: '#cuerpo-tabla-estudiantes [data-asignar]' }, { esperar: '#btn-guardar-asignacion' }],
    },
    {
      titulo: 'Elegir el estado y escribir el motivo',
      texto: 'Elegí el nuevo estado y escribí el motivo, que es obligatorio. Después hacé clic en "Guardar". Si el estudiante ya tiene un estado asignado, aparece la opción "Quitar el estado asignado", que vuelve al calculado.',
      acciones: [
        { clic: '#modal-asignar-tablero [data-opcion-nivel="amarillo"]' },
        { escribir: '#campo-motivo-asignado', valor: 'Entrevista del 20/11: mejoró la asistencia, pero adeuda dos parciales.' },
        { pausa: 300 },
      ],
      marcas: [
        { selector: '#caja-modal-asignar > div:nth-of-type(3)', texto: 'Estado de cada fuente: parciales, encuesta y el asignado actual.' },
        { selector: '#modal-asignar-tablero fieldset', texto: 'Nuevo estado: riesgo alto, riesgo medio o sin riesgo.' },
        { selector: '#campo-motivo-asignado', texto: 'Motivo: queda en el historial del estudiante.' },
        { selector: '#btn-guardar-asignacion', texto: 'Guarda el estado asignado.' },
      ],
      recorte: { selector: '#caja-modal-asignar', alto: 700 },
      despues: [{ clic: '#btn-cancelar-asignacion' }, { pausa: 400 }],
    },
    {
      titulo: 'Exportar el tablero',
      texto: 'Hacé clic en "Exportar CSV" para descargar los estudiantes que cumplen los filtros elegidos, con el estado de cada fuente y el estado asignado. El archivo se abre con Excel o con Google Sheets.',
      acciones: [{ pausa: 200 }],
      marcas: [
        { selector: '#btn-exportar-csv', texto: 'Descarga la tabla filtrada en un archivo CSV.' },
      ],
      recorte: { selector: '#tablero-estudiantes', alto: 330, desde: '#tablero-estudiantes div:has(> div > #filtro-busqueda)' },
    },
  ],
});
