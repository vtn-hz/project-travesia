// ---------------------------------------------------------
// GUION: INDICADORES DE COHORTE (ADM Y TUT) · solo lectura
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'indicadores',
  roles: ['ADM', 'TUT'],
  orden: 50,
  titulo: 'Indicadores de Cohorte',
  introduccion: 'Explica qué mide cada indicador del sistema, cómo se calcula y en qué se usa: trayectoria, abandono y egreso, ' +
    'materias que frenan el avance y el índice de criticidad de cada estudiante.',
  pasos: [
    {
      titulo: 'Recorrer las pestañas',
      texto: 'En el Hub, en "Indicadores de Cohorte", hacé clic en "Ver indicadores". El Resumen agrupa los indicadores por tema: hacé clic en el nombre de uno para ir a su explicación.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.indicadores_cohorte}` }, { esperar: '#tabs-indicadores' }, { pausa: 1200 },
        // La pantalla muestra siempre "Administrador" (rol fijo): se oculta para no confundir en los otros manuales
        { ocultar: '#badge-rol-indicadores' }],
      marcas: [
        { selector: '#tabs-indicadores', texto: 'Pestañas: Resumen, Trayectoria, Abandono y egreso, Cuellos de botella y Criticidad individual.' },
        { selector: '#contenido-indicadores > div:first-child', texto: 'Cuántos indicadores están en uso, en Reportes o en análisis.' },
        { selector: '#contenido-indicadores button[data-tab="trayectoria"]', texto: 'Nombre del indicador: abre su explicación.' },
      ],
      recorte: { selector: '#indicadores-cohorte', alto: 760 },
    },
    {
      titulo: 'Ver cómo se calcula la criticidad',
      texto: 'En "Criticidad individual" está cómo se calcula el índice de 0 a 100 de cada estudiante y su semáforo, que es lo que muestra el Tablero. Elegí un tema con los botones de arriba.',
      acciones: [{ clic: '#tabs-indicadores button[data-tab="criticidad"]' }, { esperar: '#contenido-indicadores button[data-sub]' }, { pausa: 800 }],
      marcas: [
        { selector: '#contenido-indicadores div:has(> button[data-sub])', texto: 'Temas: semáforo, encuestas, notas de 1.er año e índice total.' },
        { selector: '#contenido-indicadores h4', texto: 'Explicación del tema elegido.' },
      ],
      recorte: { selector: '#indicadores-cohorte', alto: 700, desde: '#tabs-indicadores' },
    },
  ],
});
