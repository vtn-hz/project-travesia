// ---------------------------------------------------------
// GUION: DETALLE DEL ESTUDIANTE (ADM Y TUT) · no guarda
// ---------------------------------------------------------
// Abre siempre el mismo estudiante de prueba (datos ficticios) por la dirección del detalle.
const ESTUDIANTE_PRUEBA = 900033;
module.exports = (config) => ({
  id: 'detalle-estudiante',
  roles: ['ADM', 'TUT'],
  orden: 30,
  titulo: 'Detalle del estudiante',
  introduccion: 'El detalle reúne todo lo que se sabe de un estudiante: su perfil, el estado de cada fuente, la evolución de la criticidad, ' +
    'la trayectoria (encuestas y entrevistas) y el historial de cambios de estado. Se abre con un clic en su fila del Tablero.',
  pasos: [
    {
      titulo: 'Conocer la pantalla',
      texto: 'Arriba está el estado de cada fuente: parciales de 1.er año, Encuesta Cuatrimestral y el estado asignado. El gráfico muestra cómo cambió la criticidad en el tiempo.',
      acciones: [
        { ir: `/mod/page/view.php?id=${config.paginas.tablero}` }, { esperar: '#cuerpo-tabla-estudiantes tr[data-usuario]' },
        { ir: `/mod/page/view.php?id=${config.paginas.detalle}#usuario=${ESTUDIANTE_PRUEBA}` }, { esperar: '#contenedor-grafico' }, { pausa: 1500 },
      ],
      marcas: [
        { selector: '#contenido-detalle > div > div:first-child', texto: 'Perfil: año de la carrera, cohorte, estado vigente y datos de contacto.' },
        { selector: '#contenido-detalle div:has(> div > #btn-abrir-asignacion)', texto: 'Estado de cada fuente y el estado asignado por un tutor.' },
        { selector: '#contenedor-grafico', texto: 'Evolución de la criticidad: de 0 (sin riesgo) a 100 (máximo riesgo), con las bandas de cada estado.' },
        { selector: '#btn-solicitar-entrevista-detalle', texto: 'Pedir una entrevista con este estudiante.' },
      ],
      recorte: { selector: '#detalle-estudiante', alto: 640 },
    },
    {
      titulo: 'Revisar la trayectoria y el historial',
      texto: 'La trayectoria lista las encuestas y las entrevistas del estudiante, de la más nueva a la más vieja. Con "Ver detalle" se abren las respuestas de una encuesta. Abajo, el historial muestra cada cambio de estado, quién lo hizo y por qué.',
      acciones: [{ pausa: 300 }],
      marcas: [
        { selector: '#contenido-detalle span[data-filtro-actividad=""]', texto: 'Filtros: todo, solo encuestas o solo entrevistas.' },
        { selector: '#contenido-detalle [data-ver-respuesta]', texto: '"Ver detalle": las respuestas de esa encuesta.' },
        { selector: '#contenido-detalle table', texto: 'Historial de cambios de estado: calculados por el sistema o asignados por un tutor.' },
      ],
      recorte: { selector: '#contenido-detalle > div > div:last-child', alto: 900, desde: '#contenido-detalle div:has(> div > span[data-filtro-actividad])' },
    },
    {
      titulo: 'Asignar un estado desde el detalle',
      texto: 'Hacé clic en "Asignar estado", elegí el estado, escribí el motivo y hacé clic en "Guardar". Es la misma ventana que la del Tablero.',
      acciones: [{ clic: '#btn-abrir-asignacion' }, { esperar: '#btn-guardar-asignacion' }, { pausa: 300 }],
      marcas: [
        { selector: '#modal-asignar-detalle fieldset', texto: 'Nuevo estado.' },
        { selector: '#campo-motivo-asignado', texto: 'Motivo (obligatorio).' },
        { selector: '#btn-guardar-asignacion', texto: 'Guarda el estado asignado.' },
      ],
      recorte: { selector: '#caja-modal-asignar', alto: 700 },
      despues: [{ clic: '#btn-cancelar-asignacion' }, { pausa: 300 }],
    },
  ],
});
