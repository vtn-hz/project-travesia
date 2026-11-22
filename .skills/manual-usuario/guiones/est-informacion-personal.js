// ---------------------------------------------------------
// GUION: INFORMACIÓN PERSONAL (EST) · no guarda
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'est-informacion-personal',
  roles: ['EST'],
  orden: 20,
  titulo: 'Cargar o editar la información personal',
  introduccion: 'La información personal es lo primero que hay que completar: con ella el sistema sabe tu año de ingreso y habilita las demás secciones.',
  pasos: [
    {
      titulo: 'Abrir el formulario',
      texto: 'En Mi Trayectoria, hacé clic en "Cargar información personal" (la primera vez) o en "Editar información personal".',
      acciones: [{ ir: `/course/section.php?id=${config.seccion.id}` }, { esperar: '#vista-estudiante [data-accion="informacion"]' }, { pausa: 1000 }],
      marcas: [{ selector: '#vista-estudiante [data-accion="informacion"]', texto: 'Abre el formulario de información personal.' }],
      recorte: { selector: '#vista-estudiante', alrededor: 140 },
      despues: [{ clic: '#vista-estudiante [data-accion="informacion"]', navega: true }],
    },
    {
      titulo: 'Completar y guardar',
      texto: 'Revisá tus datos, indicá si cursás o aprobaste Proyecto de Ingeniería Industrial I y tu año y cuatrimestre de ingreso. Después, hacé clic en "Guardar información".',
      acciones: [{ esperar: '#form-info-personal' }, { pausa: 800 }],
      marcas: [
        { selector: '#form-info-personal input#campo-nombre-info', texto: 'Datos personales: nombre, apellido, DNI y correo.' },
        { selector: '#form-info-personal input#campo-anio-ingreso', texto: 'Año y cuatrimestre de ingreso a la facultad.' },
        { selector: '#btn-guardar-info', texto: 'Guarda la información. "Cancelar" vuelve sin guardar.' },
      ],
      recorte: { selector: '#form-info-personal', alto: 700 },
    },
  ],
});
