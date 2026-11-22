// ---------------------------------------------------------
// GUION: EL HUB (ADM Y TUT) · solo lectura
// ---------------------------------------------------------
// Cada rol ve solo sus tarjetas: el mismo guion sirve para los dos manuales.
module.exports = (config) => ({
  id: 'staff-hub',
  roles: ['ADM', 'TUT'],
  orden: 5,
  titulo: 'El Hub',
  introduccion: 'El Hub es la pantalla de inicio del equipo de seguimiento. Muestra una tarjeta por cada módulo al que tenés acceso, ' +
    'agrupadas en "Seguimiento de estudiantes" y "Gestión de datos y configuración".',
  pasos: [
    {
      titulo: 'Conocer el Hub',
      texto: 'Cada tarjeta explica para qué sirve el módulo y tiene un botón para abrirlo. Las etiquetas de arriba a la derecha indican qué roles lo usan.',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#btn-entrevistas' }, { pausa: 1000 }],
      marcas: [
        { selector: '#txt-saludo-equipo', texto: 'Qué podés hacer con tu rol.' },
        { selector: '#grupo-seguimiento', texto: 'Seguimiento de estudiantes: Tablero de Criticidad, Entrevistas, Indicadores y Reportes.' },
        { selector: '#grupo-gestion', texto: 'Gestión de datos: notas de 1.er año y, según el rol, el plan de estudios y la configuración.' },
        { selector: '#btn-tablero-criticidad', texto: 'Botón de cada tarjeta: abre el módulo.' },
      ],
      recorte: { selector: '#menu-equipo', alto: 900 },
    },
  ],
});
