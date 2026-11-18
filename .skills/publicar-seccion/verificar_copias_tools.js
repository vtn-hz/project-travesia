// Verifica que el bloque "COPIA DE TOOLS" (copia de LeerBase y de la regla de PeriodoVigente de section/utils/tools) sea idéntico
// en todas las secciones que lo tienen. Ver RULES.md, "Código copiado de Tools".
//   node .skills/publicar-seccion/verificar_copias_tools.js
// Sale con código 1 si falta el bloque en alguna sección o si las copias no son iguales.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
const SECCIONES = ['section/tablero_estudiantes/content.html', 'section/detalle_estudiante/content.html'];
const INICIO = '// COPIA DE TOOLS: INICIO';
const FIN = '// COPIA DE TOOLS: FIN';

function bloque(archivo) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const a = texto.indexOf(INICIO);
  const b = texto.indexOf(FIN);
  if (a === -1 || b === -1 || b < a) return null;
  if (texto.indexOf(INICIO, a + 1) !== -1) return null; // un solo bloque por sección
  return texto.slice(a, b);
}

let ok = true;
const bloques = SECCIONES.map((s) => ({ s, b: bloque(s) }));
bloques.forEach(({ s, b }) => { if (b === null) { console.log('✘ ' + s + ': falta el bloque (o está repetido) entre "' + INICIO + '" y "' + FIN + '"'); ok = false; } });
if (ok) {
  const [ref, ...resto] = bloques;
  resto.forEach(({ s, b }) => {
    if (b === ref.b) return;
    ok = false;
    const la = ref.b.split('\n'), lb = b.split('\n');
    const i = la.findIndex((l, k) => l !== lb[k]);
    console.log('✘ ' + s + ' no coincide con ' + ref.s + ' (primera diferencia en la línea ' + (i + 1) + ' del bloque):');
    console.log('  ' + ref.s + ': ' + (la[i] || '(fin del bloque)').trim());
    console.log('  ' + s + ': ' + (lb[i] || '(fin del bloque)').trim());
  });
}
if (ok) console.log('✔ El bloque COPIA DE TOOLS es idéntico en ' + SECCIONES.length + ' secciones (' + bloques[0].b.split('\n').length + ' líneas).');
process.exit(ok ? 0 : 1);
