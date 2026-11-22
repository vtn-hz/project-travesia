// ---------------------------------------------------------
// GUION: CONSULTAR Y FILTRAR ESTUDIANTES EN EL TABLERO DE CRITICIDAD (ADM)
// ---------------------------------------------------------
// Solo lectura: no asigna estados ni exporta. Las rutas salen de moodle.config.json.
module.exports = (config) => ({
  id: 'tablero-consultar',
  titulo: 'Consultar y filtrar estudiantes en el Tablero de Criticidad',
  roles: ['ADM', 'TUT'], // en el manual de qué roles entra
  orden: 10, // posición dentro del manual del rol
  introduccion:
    'El Tablero de Criticidad reúne a todos los estudiantes en seguimiento con su estado de riesgo del período vigente. ' +
    'Desde acá se lee el resumen, se busca a un estudiante, se combinan filtros y se abre su detalle.',
  pasos: [
    {
      titulo: 'Entrar al tablero desde el Hub',
      texto: 'En el Hub, en la tarjeta "Tablero de Criticidad", hacé clic en "Ver estudiantes".',
      acciones: [
        // En la página de la sección Zhakyz (no en la de la subsección Hub): ahí corre la detección del rol
        { ir: `/course/section.php?id=${config.seccion.id}` },
        { esperar: '#btn-tablero-criticidad' },
      ],
      marcas: [
        { selector: '#btn-tablero-criticidad', texto: 'Botón "Ver estudiantes": abre el Tablero de Criticidad.' },
      ],
      recorte: { selector: '#menu-equipo', alrededor: 220 },
      despues: [{ clic: '#btn-tablero-criticidad', navega: true }],
    },
    {
      titulo: 'Conocer la pantalla',
      texto: 'El tablero se carga con todos los estudiantes del período vigente, ordenados por estado: primero los de riesgo alto.',
      acciones: [{ esperar: '#cuerpo-tabla-estudiantes tr[data-usuario]' }],
      marcas: [
        { selector: '#grilla-kpi-tablero', texto: 'Resumen: cuántos estudiantes hay en cada estado. Cada tarjeta también funciona como filtro.' },
        { selector: '#tablero-estudiantes div:has(> div > #filtro-busqueda)', texto: 'Búsqueda y filtros: por nombre o DNI, estado, año de la carrera y cohorte.' },
        { selector: '#paginacion-tabla', texto: 'Paginación: cuántas filas ver por página y cómo pasar a la siguiente.' },
        { selector: '#scroll-tabla-estudiantes', texto: 'Tabla de estudiantes: estado por parciales, por encuesta y el estado asignado por un tutor.' },
      ],
      recorte: { selector: '#tablero-estudiantes', alto: 620 },
    },
    {
      titulo: 'Filtrar con el resumen',
      texto: 'Hacé clic en una tarjeta del resumen para ver solo esos estudiantes. Por ejemplo, "Riesgo alto". Para volver a ver a todos, hacé clic en "Estudiantes".',
      acciones: [{ clic: '[data-kpi="rojo"]' }, { pausa: 600 }],
      marcas: [
        { selector: '[data-kpi="rojo"]', texto: 'Tarjeta seleccionada: queda resaltada en azul.' },
        { selector: '#txt-total-filtrados', texto: 'Cantidad de estudiantes que cumplen el filtro.' },
        { selector: '#cuerpo-tabla-estudiantes', texto: 'La tabla muestra solo a los estudiantes con riesgo alto.' },
      ],
      recorte: { selector: '#tablero-estudiantes', alto: 620 },
      despues: [{ clic: '[data-kpi=""]' }, { pausa: 400 }],
    },
    {
      titulo: 'Buscar a un estudiante',
      texto: 'Escribí parte del nombre, del apellido o el DNI en el buscador. La tabla se actualiza mientras escribís.',
      acciones: [{ escribir: '#filtro-busqueda', valor: 'Rossi' }, { pausa: 600 }],
      marcas: [
        { selector: '#filtro-busqueda', texto: 'Buscador: acepta nombre, apellido o DNI.' },
        { selector: '#cuerpo-tabla-estudiantes', texto: 'Resultados de la búsqueda.' },
      ],
      recorte: { selector: '#tablero-estudiantes', alto: 620, desde: '#tablero-estudiantes div:has(> div > #filtro-busqueda)' },
      despues: [{ escribir: '#filtro-busqueda', valor: '' }, { pausa: 400 }],
    },
    {
      titulo: 'Combinar filtros',
      texto: 'Los filtros se pueden combinar. Por ejemplo, para ver a los estudiantes de 1.er año con riesgo medio, elegí "Riesgo medio" en el estado y "1.er año" en el año de la carrera.',
      acciones: [
        { elegir: '#filtro-semaforo', valor: 'amarillo' },
        { elegir: '#filtro-tramo', valor: 'primero' },
        { pausa: 600 },
      ],
      marcas: [
        { selector: '#filtro-semaforo', texto: 'Estado vigente: riesgo alto, riesgo medio, sin riesgo o sin calcular.' },
        { selector: '#filtro-tramo', texto: 'Año de la carrera: 1.er año o 2.º año en adelante.' },
        { selector: '#filtro-cohorte', texto: 'Cohorte: año de ingreso del estudiante.' },
        { selector: '#txt-total-filtrados', texto: 'Cantidad de estudiantes que cumplen todos los filtros.' },
      ],
      recorte: { selector: '#tablero-estudiantes', alto: 620, desde: '#tablero-estudiantes div:has(> div > #filtro-busqueda)' },
      despues: [{ elegir: '#filtro-semaforo', valor: '' }, { elegir: '#filtro-tramo', valor: '' }, { pausa: 400 }],
    },
    {
      titulo: 'Abrir el detalle de un estudiante',
      texto: 'Hacé clic en la fila de un estudiante para abrir su detalle, con la trayectoria, las encuestas y el historial de estados.',
      acciones: [{ pausa: 300 }],
      marcas: [
        { selector: '#cuerpo-tabla-estudiantes tr[data-usuario]', texto: 'Fila del estudiante: con un clic se abre su detalle.' },
      ],
      recorte: { selector: '#scroll-tabla-estudiantes', alto: 320 },
      despues: [{ clic: '#cuerpo-tabla-estudiantes tr[data-usuario]', navega: true }],
    },
  ],
});
