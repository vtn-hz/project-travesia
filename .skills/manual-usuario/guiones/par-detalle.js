// ---------------------------------------------------------
// GUION: DETALLE DEL ESTUDIANTE DESDE UNA ENTREVISTA (PAR) · solo lectura
// ---------------------------------------------------------
const FILA = '#cuerpo-tabla-entrevistas tr[data-entrevista]';
module.exports = (config) => ({
  id: 'par-detalle',
  roles: ['PAR'],
  orden: 45,
  titulo: 'Detalle del estudiante',
  introduccion: 'Desde una entrevista podés abrir el detalle del estudiante: su perfil, la evolución de la criticidad y su trayectoria.',
  pasos: [
    {
      titulo: 'Abrir y leer el detalle',
      texto: 'Abrí la entrevista desde su fila y hacé clic en "Ver detalle del estudiante". Arriba está el estado de cada fuente y el gráfico con la evolución de la criticidad. Más abajo, la trayectoria con las encuestas y las entrevistas del estudiante.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.entrevistas}` }, { esperar: FILA }, { pausa: 1200 },
        { clic: `${FILA}:has-text("Falta resultado")` }, { esperar: '#modal-entrevista [data-accion="ver-detalle"]' }, { pausa: 500 },
        { clic: '#modal-entrevista [data-accion="ver-detalle"]', navega: true }, { esperar: '#contenedor-grafico' }, { pausa: 1500 }],
      marcas: [
        { selector: '#contenido-detalle > div > div:first-child', texto: 'Perfil del estudiante.' },
        { selector: '#contenedor-grafico', texto: 'Evolución de la criticidad.' },
        { selector: '#contenido-detalle span[data-filtro-actividad=""]', texto: 'Trayectoria: encuestas y entrevistas.' },
      ],
      recorte: { selector: '#detalle-estudiante', alto: 900 },
    },
  ],
});
