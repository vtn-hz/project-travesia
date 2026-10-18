// ---------------------------------------------------------
// COPIAR LOS VALORES DE moodle.config.json A LAS SECCIONES (LÍNEAS "// @config <ruta>")
// ---------------------------------------------------------
// Uso:
//   node .skills/publicar-seccion/sincronizar_config.js            → reescribe las secciones desactualizadas
//   node .skills/publicar-seccion/sincronizar_config.js --revisar  → solo informa; sale con error si hay diferencias
// Solo cambia archivos locales: no se conecta a Moodle.
const { sincronizar } = require('./config');

const revisar = process.argv.includes('--revisar');
const resultado = sincronizar({ escribir: !revisar });
let pendientes = 0;
let errores = 0;
resultado.forEach((r) => {
  if (!r.cambios.length && !r.errores.length) return;
  console.log(r.archivo);
  r.cambios.forEach((c) => console.log(`  ${revisar ? '≠' : '✔'} ${c}`));
  r.errores.forEach((e) => console.log(`  ✖ ${e}`));
  pendientes += r.cambios.length;
  errores += r.errores.length;
});
if (!pendientes && !errores) console.log('✔ Todas las secciones coinciden con moodle.config.json');
else if (revisar && pendientes) console.log(`\n${pendientes} valor(es) desactualizado(s). Correr sin --revisar para actualizarlos.`);
process.exit(errores || (revisar && pendientes) ? 1 : 0);
