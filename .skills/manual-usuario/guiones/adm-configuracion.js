// ---------------------------------------------------------
// GUION: CONFIGURACIÓN DEL SISTEMA Y CIERRE DEL PERÍODO (ADM) · no guarda ni cierra
// ---------------------------------------------------------
module.exports = (config) => ({
  id: 'adm-configuracion',
  roles: ['ADM'],
  orden: 90,
  titulo: 'Configuración del Sistema',
  introduccion: 'Define el período vigente, cuándo un estudiante cuenta como abandono y el cierre del período, ' +
    'que registra las alertas por no responder la Encuesta Cuatrimestral.',
  pasos: [
    {
      titulo: 'Período vigente y abandono',
      texto: 'En el Hub, en "Configuración del Sistema", hacé clic en "Configurar". Arriba están el período vigente, con la fecha límite de la encuesta, y el criterio de abandono de la carrera.',
      acciones: [{ ir: `/mod/page/view.php?id=${config.paginas.configuracion}` }, { esperar: '#card-periodo-config' }, { pausa: 1500 }],
      marcas: [
        { selector: '#card-periodo-config', texto: 'Período vigente y fecha límite de la Encuesta Cuatrimestral.' },
        { selector: '#btn-abrir-limite', texto: 'Define o cambia la fecha límite.' },
        { selector: '#card-abandono-config', texto: 'Cuándo un estudiante cuenta como abandono.' },
        { selector: '#btn-abrir-abandono', texto: 'Cambia el criterio de abandono.' },
      ],
      recorte: { selector: '#configuracion-sistema', alto: 820 },
    },
    {
      titulo: 'Revisar la simulación del cierre',
      texto: 'Antes de cerrar, la tabla simula el cierre: muestra qué estudiantes de 2.º año en adelante no respondieron la encuesta y van a recibir una alerta por omisión. Al final de la tabla están los botones "Volver a leer las bases" (si cambiaron los datos) y "Cerrar el período".',
      acciones: [{ pausa: 200 }],
      marcas: [
        { selector: '#card-cierre-config h4', texto: 'Período que se va a cerrar.' },
        { selector: '#tabla-cierre-config thead', texto: 'Simulación: estudiante, si respondió la encuesta y qué pasa al cerrar.' },
      ],
      recorte: { selector: '#card-cierre-config', alto: 560 },
    },
    {
      titulo: 'Cerrar el período',
      texto: 'Al final de la tabla, hacé clic en "Cerrar el período". En la ventana, revisá cuántas alertas se agregan, elegí el inicio del período siguiente y, si querés, la fecha límite de su encuesta. Después confirmá con "Cerrar el período". El cierre no se puede deshacer.',
      acciones: [{ clic: '#btn-abrir-cierre' }, { esperar: '#btn-confirmar-cierre' }, { pausa: 500 }],
      marcas: [
        { selector: '#cuerpo-modal-config > :first-child', texto: 'Cuántas alertas por omisión se agregan.' },
        { selector: '#campo-inicio-periodo', texto: 'Inicio del período siguiente.' },
        { selector: '#campo-limite-periodo', texto: 'Fecha límite de la encuesta del período siguiente (opcional).' },
        { selector: '#btn-confirmar-cierre', texto: 'Confirma el cierre.' },
      ],
      recorte: { selector: '#caja-modal-config', alto: 700 },
      despues: [{ clic: '#btn-cancelar-modal' }, { pausa: 400 }],
    },
    {
      titulo: 'Historial y estado del Tablero',
      texto: 'Abajo, "Estado actual del Tablero" permite revisar qué lee el Tablero de Criticidad, y el historial lista los períodos anteriores con sus fechas.',
      acciones: [{ pausa: 200 }],
      marcas: [
        { selector: '#btn-revisar-estado', texto: 'Revisa el estado que lee el Tablero.' },
        { selector: '#card-historial-config', texto: 'Historial de períodos.' },
      ],
      recorte: { selector: '#contenido-config', alrededor: 40 },
    },
  ],
});
