// PLANTILLA JAVASCRIPT DE LA BASE Carga_Parciales_Primero ("Javascript personalizado" de Moodle) · ADR-007
// Moodle la carga en la lista, en la vista individual y en el formulario de alta y edición (mod/data/edit.php).
// Al guardar una nota, lee la Página Tools de Utils y llama a CriticidadNotas: guarda la nota, calcula el índice de las notas del
// estudiante en el período y agrega su entrada a la base Criticidad (fuente notas_1ro). En las demás páginas de la base, reintenta
// las entradas pendientes. Si la Página Tools no carga, la nota se guarda igual, sin criticidad.
// La línea "// @config" se copia de moodle.config.json con sincronizar_config.js: no editarla a mano.
(function() {
  var CMID_TOOLS = 59941; // @config paginas.utils_tools
  if (!window.M || !M.cfg || !M.cfg.wwwroot) return;

  // CARGA DE LA BIBLIOTECA DE TOOLS (COMO EL CARGADOR DE TOOLS: UNA SOLA VEZ POR PÁGINA)
  function cargarTools() {
    if (window.ZhakyzTools) return Promise.resolve(window.ZhakyzTools);
    if (window.ZhakyzToolsCarga) return window.ZhakyzToolsCarga;
    var url = M.cfg.wwwroot + '/mod/page/view.php?id=' + CMID_TOOLS;
    window.ZhakyzToolsCarga = fetch(url, { credentials: 'same-origin' })
      .then(function(r) {
        if (!r.ok) throw new Error('La Página Tools respondió HTTP ' + r.status + '.');
        return r.text();
      })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var biblioteca = doc.querySelector('script[type="text/plain"][data-zk-biblioteca="tools"]');
        if (!biblioteca) throw new Error('La Página Tools no contiene la biblioteca.');
        var s = document.createElement('script');
        s.setAttribute('data-base', url);
        s.textContent = biblioteca.textContent;
        document.head.appendChild(s);
        if (!window.ZhakyzTools || typeof window.ZhakyzTools.CriticidadNotas !== 'function') throw new Error('La biblioteca de Tools no tiene CriticidadNotas.');
        return window.ZhakyzTools;
      });
    window.ZhakyzToolsCarga.catch(function() { window.ZhakyzToolsCarga = null; });
    return window.ZhakyzToolsCarga;
  }

  // ENVÍO NORMAL (SIN CRITICIDAD), CON EL BOTÓN PRESIONADO COMO CAMPO OCULTO
  function enviarNormal(form, boton) {
    if (boton && boton.name) {
      var h = document.createElement('input');
      h.type = 'hidden';
      h.name = boton.name;
      h.value = boton.value;
      form.appendChild(h);
    }
    form.setAttribute('data-zk-notas', 'enviando');
    HTMLFormElement.prototype.submit.call(form);
  }

  // AL GUARDAR UNA NOTA (ALTA O EDICIÓN)
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var boton = e.submitter || null;
    if (e.defaultPrevented || form.getAttribute('data-zk-notas') || !form.querySelector('[name^="field_"]')) return;
    if (boton && boton.name === 'cancel') return;
    e.preventDefault();
    form.setAttribute('data-zk-notas', 'guardando');
    cargarTools().then(function(Tools) {
      return Tools.CriticidadNotas({ form: form, boton: boton });
    }).catch(function() {
      // Sin la biblioteca, o si falló antes de guardar: la nota se guarda con el envío normal de Moodle
      enviarNormal(form, boton);
    });
  });

  // EN LAS DEMÁS PÁGINAS DE LA BASE: REINTENTAR LAS ENTRADAS DE CRITICIDAD PENDIENTES
  var pendientes = null;
  try { pendientes = window.localStorage.getItem('zk-criticidad-pendientes'); } catch (e) { pendientes = null; }
  if (pendientes) cargarTools().then(function(Tools) { return Tools.CriticidadNotas({}); }).catch(function() { /* se reintenta en la próxima página */ });
})();
