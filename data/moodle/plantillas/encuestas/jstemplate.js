// PLANTILLA JAVASCRIPT DE LA BASE ENCUESTAS ("Javascript personalizado" de Moodle)
// Muestra el JSON de las preguntas con sangría, en la lista (al abrir una fila) y en la vista individual.
// Solo cambia lo que se ve en el navegador: los scripts que leen la base (CopiaRespuestas con LeerBase) bajan el HTML de Moodle
// sin ejecutar esto y leen el JSON tal como se guardó, de la celda data-campo="json_preguntas".
(function() {
  function formatear() {
    document.querySelectorAll('.zk-json-completo').forEach(function(el) {
      if (el.getAttribute('data-formateado')) return;
      try { el.textContent = JSON.stringify(JSON.parse(el.textContent), null, 2); } catch (e) { /* no es JSON: queda como se guardó */ }
      el.setAttribute('data-formateado', '1');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', formatear);
  else formatear();
})();
