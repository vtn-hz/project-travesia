// ---------------------------------------------------------
// BORRAR UNA BASE DE DATOS DE ZHAKYZ (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/borrar_base.js \
//     --clave <bases.clave de moodle.config.json> [--confirmar]
//
// Solo borra si la base está dentro de la sección Zhakyz, es una base de datos (mod_data) y no tiene entradas.
// Al terminar quita bases.<clave> de moodle.config.json. Las secciones que la usen deben dejar de hacerlo antes.
const { chromium } = require('playwright');
const config = require('./config');

const CONFIG = config.cargar();
const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);

function salir(msg) { console.error('✖ ' + msg); process.exit(1); }

const args = process.argv.slice(2);
const confirmar = args.includes('--confirmar');
const clave = args.indexOf('--clave') >= 0 ? args[args.indexOf('--clave') + 1] : null;
if (!clave) salir('Falta --clave.');
const base = CONFIG.bases[clave];
if (!base || !base.cmid) salir(`bases.${clave} no tiene cmid en moodle.config.json.`);
const cmid = String(base.cmid);
const usos = config.secciones().filter((f) => require('fs').readFileSync(f, 'utf8').includes(`@config bases.${clave}.`));
if (usos.length) salir(`Todavía hay secciones que usan bases.${clave}:\n  ${usos.join('\n  ')}`);
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const estado = { fase: 'login' };
  const permitidas = [];

  // GUARDIA DE RED: SOLO GET SIN SESSKEY, SALVO LOGIN Y LA CONFIRMACIÓN DE BORRADO DE ESTE cmid
  await page.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (req.method() === 'GET' && !/sesskey=|delete|[?&]edit=on/i.test(url)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura' && url.startsWith(`${BASE}/course/mod.php?`)) {
      const q = new URL(url).searchParams;
      if (q.get('delete') === cmid && q.get('confirm') === '1' && q.get('sesskey')) {
        permitidas.push(url.replace(BASE, '').replace(/sesskey=[^&]+/, 'sesskey=…'));
        return route.continue();
      }
    }
    return route.abort();
  });

  // LOGIN
  await page.goto(`${BASE}/login/index.php`);
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation(), page.click('#loginbtn')]);
  estado.fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');

  // VERIFICAR: DENTRO DE ZHAKYZ Y ES UNA BASE DE DATOS
  async function enZhakyz() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate(({ id, cmid }) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      const item = raiz && raiz.querySelector(`[data-for="cmitem"][data-id="${cmid}"]`);
      if (!item) return null;
      const a = item.querySelector('a[href*="/mod/"]');
      return { nombre: (item.innerText || '').split('\n')[0].trim(), href: a ? a.getAttribute('href') : '' };
    }, { id: SECCION_ID, cmid });
  }
  const item = await enZhakyz();
  if (!item) salir(`La actividad cmid ${cmid} no está dentro de la sección Zhakyz. No se hace nada.`);
  if (!/\/mod\/data\/view\.php/.test(item.href)) salir(`La actividad cmid ${cmid} no es una base de datos (${item.href}). No se hace nada.`);

  // VERIFICAR QUE NO TENGA ENTRADAS (LA EXPORTACIÓN NO SIRVE SIN ENTRADAS; SE CUENTA EN LA VISTA DE LISTA)
  await page.goto(`${BASE}/mod/data/view.php?id=${cmid}&perpage=1000`, { waitUntil: 'networkidle' });
  const entradas = await page.evaluate(() => {
    const zk = document.querySelectorAll('.zk-registro').length;
    const generico = document.querySelectorAll('[data-region="data-entry"], .defaulttemplate-listentry').length;
    const vacia = /No hay entradas|No entries/i.test(document.body.innerText);
    return { cuenta: Math.max(zk, generico), vacia };
  });
  if (entradas.cuenta > 0 || !entradas.vacia) salir(`La base "${item.nombre}" tiene entradas (${entradas.cuenta}) o no se pudo confirmar que esté vacía. No se borra.`);

  console.log('──────────────── BORRAR BASE DE DATOS ────────────────');
  console.log(`Base     : "${item.nombre}" (cmid ${cmid}${base.dataid ? `, d=${base.dataid}` : ''}) en Zhakyz · sin entradas`);
  console.log(`Config   : se quita bases.${clave} de moodle.config.json`);
  if (!confirmar) {
    await browser.close();
    return console.log('\nSIMULACIÓN: no se borró nada. Para borrar, repetir con --confirmar (requiere confirmación explícita del equipo).');
  }

  // BORRAR: EL sesskey SALE DE LA PÁGINA YA ABIERTA (LA GUARDIA BLOQUEA CUALQUIER OTRA URL CON "delete")
  const sesskey = await page.evaluate(() => (window.M && M.cfg && M.cfg.sesskey) || '');
  if (!sesskey) salir('No se pudo obtener el sesskey para confirmar el borrado.');
  estado.fase = 'escritura';
  await page.goto(`${BASE}/course/mod.php?delete=${cmid}&confirm=1&sesskey=${sesskey}`, { waitUntil: 'networkidle' });
  estado.fase = 'lectura';
  if (await enZhakyz()) salir('Moodle no borró la base (sigue en la sección). Revisar a mano.');

  const actual = config.cargar();
  delete actual.bases[clave];
  config.guardar(actual);
  console.log(`\n✔ Base "${item.nombre}" borrada (cmid ${cmid})`);
  console.log(`✔ moodle.config.json: se quitó bases.${clave}`);
  console.log(`Escrituras : ${permitidas.length} (${permitidas.join(', ')})`);
  await browser.close();
})().catch((e) => salir(e.message));
