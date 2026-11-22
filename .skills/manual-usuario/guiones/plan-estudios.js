// ---------------------------------------------------------
// GUION: PLAN DE ESTUDIOS (CONSULTA: ADM Y TUT; CARGA POR CSV: SOLO ADM) · no sube ni guarda
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'plan-estudios',
  roles: ['ADM', 'TUT'],
  orden: 80,
  titulo: 'Plan de Estudios y Correlativas',
  introduccion: 'Muestra las materias de cada plan con sus correlativas, que el sistema usa para calcular el avance y las materias críticas.',
  pasos: [
    {
      titulo: 'Consultar las materias de un plan',
      texto: 'Abrí "Plan de Estudios" desde la sección. Elegí el plan con los botones de arriba para ver sus materias.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.plan_estudios}` }, { esperar: '#bloque-base-plan button' }, { pausa: 1500 }],
      marcas: [
        { selector: '#bloque-base-plan div:has(> button[data-plan-base])', texto: 'Planes cargados y cuántas materias tiene cada uno.' },
        { selector: '#bloque-base-plan', texto: 'Materias del plan elegido, con su versión vigente.' },
      ],
      recorte: { selector: '#carga-plan', alto: 700 },
    },
    {
      roles: ['ADM'],
      titulo: 'Preparar el archivo del plan',
      texto: 'Para cargar un plan nuevo o actualizarlo, armá un archivo CSV con una materia por fila. La tabla explica cada columna. Con "Descargar plantilla" obtenés un archivo de ejemplo para completar.',
      acciones: [{ pausa: 200 }],
      marcas: [
        { selector: '#ejemplo-formato-plan', texto: 'Ejemplo de las primeras líneas del archivo.' },
        { selector: '#tabla-formato-plan', texto: 'Columnas: cuáles son obligatorias, qué contienen y un ejemplo.' },
        { selector: '#btn-plantilla-plan', texto: 'Descarga una plantilla para completar.' },
      ],
      recorte: { selector: '#bloque-formato-plan', alto: 900 },
    },
    {
      roles: ['ADM'],
      titulo: 'Subir y cargar el archivo',
      texto: 'Arrastrá el archivo a la zona marcada o hacé clic para elegirlo. Antes de guardar, el sistema muestra cada materia y avisa los errores. Si está todo bien, confirmá la carga.',
      acciones: [{ ventana: 2600 }],
      marcas: [
        { selector: '#zona-archivo-plan', texto: 'Zona para subir el archivo CSV.' },
      ],
      recorte: { selector: '#bloque-archivo-plan', alto: 400 },
      despues: [{ ventana: 2000 }],
    },
  ],
});
