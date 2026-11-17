// ---------------------------------------------------------
// BORRAR ACTIVIDADES O SUBSECCIONES DE ZHAKYZ (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/borrar_actividades.js \
//     --cmids <id,id,...> [--confirmar]
//
// - Solo borra actividades que están dentro de la sección Zhakyz (o de una de sus subsecciones).
// - Una subsección solo se borra si está VACÍA: Moodle borra una subsección con todo lo que tenga adentro. Para borrar una
//   subsección con su contenido, pasar primero las actividades y al final la subsección (se borran en el orden de --cmids).
// - Borra de a una (course/mod.php?delete=<cm>&confirm=1) y verifica cada una. Lo borrado queda en la papelera de reciclaje del
//   curso (7 días en el campus), que es compartida con los otros equipos: no usar "Borrar todo".
// - No toca moodle.config.json: si una subsección o página borrada estaba ahí, sacarla a mano.
const { chromium } = require('playwright');
const CONFIG = require('./config').cargar();

const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;

function salir(msg) { console.error('✖ ' + msg); process.exit(1); }

const argv = process.argv.slice(2);
const arg = (n) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : null);
const cmids = (arg('--cmids') || '').split(',').map((s) => s.trim()).filter(Boolean);
const confirmar = argv.includes('--confirmar');
if (!cmids.length || cmids.some((c) => !/^\d+$/.test(c))) salir('Uso: --cmids <id,id,...> [--confirmar]');
if (new Set(cmids).size !== cmids.length) salir('Hay cmids repetidos.');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const estado = { fase: 'login', borrar: null };
  const escrituras = [];

  // GUARDIA DE RED: solo lecturas, el login y el borrado de la actividad que toca en ese momento
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    if (estado.fase === 'escritura' && req.method() === 'GET' && url.startsWith(`${BASE}/course/mod.php?`)) {
      const q = new URL(url).searchParams;
      if (q.get('delete') === estado.borrar && q.get('confirm') === '1' && q.get('sesskey')) { escrituras.push(`borrar ${estado.borrar}`); return route.continue(); }
    }
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (url.startsWith(`${BASE}/lib/ajax/service`) && /"methodname":"(core_output_load_template_with_dependencies|core_get_string|core_get_strings|core_output_load_fontawesome_icon_system_map|core_courseformat_get_state)"/.test(cuerpo) && !/update_course/.test(cuerpo)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    return route.abort();
  });

  // LOGIN
  await page.goto(`${BASE}/login/index.php`);
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation(), page.click('#loginbtn')]);
  estado.fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');

  // ACTIVIDADES DE ZHAKYZ: cmid, nombre, tipo, sección donde está y, si es una subsección, cuántas actividades tiene adentro
  async function leerZhakyz() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate((id) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      if (!raiz) return null;
      const cms = [...raiz.querySelectorAll('[data-for="cmitem"][data-id]')].map((c) => {
        const li = c.closest('li.activity') || c;
        const tipo = ((li.className || '').match(/modtype_(\w+)/) || [])[1] || '?';
        const delegada = tipo === 'subsection' ? li.querySelector('li.section.delegated-section[data-id]') : null;
        return {
          id: c.getAttribute('data-id'),
          // El nombre de una subsección es el de su sección (adentro están los nombres de sus actividades y el botón "Colapsar")
          nombre: delegada ? delegada.getAttribute('data-sectionname') : ((c.querySelector('.instancename, .activityname') || c).innerText || '').split('\n')[0].trim(),
          tipo,
          seccion: c.closest('li.section').getAttribute('data-id'),
          contenido: delegada ? delegada.querySelectorAll('[data-for="cmitem"][data-id]').length : null,
          seccionPropia: delegada ? delegada.getAttribute('data-id') : null
        };
      });
      return { nombre: raiz.getAttribute('data-sectionname'), cms, sesskey: M.cfg.sesskey };
    }, SECCION_ID);
  }

  let z = await leerZhakyz();
  if (!z || z.nombre !== SECCION_NOMBRE) salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}".`);
  const faltan = cmids.filter((id) => !z.cms.some((c) => c.id === id));
  if (faltan.length) salir(`Estas actividades no están dentro de Zhakyz: ${faltan.join(', ')}. No se borra nada.`);

  // Una subsección se puede borrar si, al llegarle el turno, su contenido es solo lo que se borra antes en la lista
  console.log('──────────────── BORRAR ACTIVIDADES ────────────────');
  for (const [k, id] of cmids.entries()) {
    const c = z.cms.find((x) => x.id === id);
    let nota = '';
    if (c.tipo === 'subsection') {
      const adentro = z.cms.filter((x) => x.seccion === c.seccionPropia).map((x) => x.id);
      const quedan = adentro.filter((x) => cmids.indexOf(x) === -1 || cmids.indexOf(x) > k);
      if (quedan.length) salir(`La subsección "${c.nombre}" (cm ${id}) tiene actividades que no se borran antes: ${quedan.join(', ')}. No se borra nada.`);
      nota = adentro.length ? ` · tiene ${adentro.length} actividades, que se borran antes` : ' · vacía';
    }
    console.log(`Borra   : ${c.nombre} (cm ${id}, ${c.tipo}, en sección ${c.seccion})${nota}`);
  }
  if (!confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para borrar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  for (const id of cmids) {
    z = await leerZhakyz();
    const c = z.cms.find((x) => x.id === id);
    if (!c) { console.log(`- ${id}: ya no estaba`); continue; }
    if (c.tipo === 'subsection' && c.contenido) salir(`La subsección "${c.nombre}" (cm ${id}) no está vacía (${c.contenido} actividades). Se detiene.`);
    estado.borrar = id;
    estado.fase = 'escritura';
    await page.goto(`${BASE}/course/mod.php?delete=${id}&confirm=1&sesskey=${z.sesskey}`, { waitUntil: 'networkidle' });
    estado.fase = 'lectura';
    z = await leerZhakyz();
    if (z.cms.some((x) => x.id === id)) salir(`Moodle no borró ${c.nombre} (cm ${id}). Se detiene.`);
    console.log(`✔ Borrada: ${c.nombre} (cm ${id})`);
  }
  console.log(`Escrituras : ${escrituras.join(' · ')}`);
  await browser.close();
})().catch((e) => salir(e.message));
