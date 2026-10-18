// ---------------------------------------------------------
// RECREAR LOS CAMPOS DE UNA BASE DE DATOS DE ZHAKYZ SEGÚN SU DEFINICIÓN (SOLO SI ESTÁ VACÍA)
// ---------------------------------------------------------
// Moodle ordena los campos por orden de creación y no permite reordenarlos ni cambiarles el tipo:
// para cambiar orden, nombres o tipos se borran todos y se crean de nuevo en el orden de la definición.
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/recrear_campos.js \
//     --definicion data/moodle/BASE_<NOMBRE>.json [--confirmar]
// La base se busca en moodle.config.json → bases.<clave de la definición>.
const { chromium } = require('playwright');
const fs = require('fs');

const CONFIG = require('./config').cargar();

const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

const argv = process.argv.slice(2);
const rutaDef = argv[argv.indexOf('--definicion') + 1];
const confirmar = argv.includes('--confirmar');
if (!rutaDef || !fs.existsSync(rutaDef)) salir('Falta --definicion o no existe.');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
const def = JSON.parse(fs.readFileSync(rutaDef, 'utf8'));
// Los ids de la base están en moodle.config.json → bases.<clave>
const ids = def.clave ? CONFIG.bases[def.clave] : null;
if (!ids) salir(`La definición necesita "clave" y moodle.config.json una entrada bases.${def.clave || '<clave>'}.`);
const cmid = ids.cmid ? String(ids.cmid) : null;
const dataId = ids.dataid ? String(ids.dataid) : null;
if (!cmid || !dataId) salir(`bases.${def.clave} no tiene cmid/dataid: la base no existe todavía (usar crear_base.js).`);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const estado = { fase: 'login', fidsBorrables: [] };
  const escrituras = [];

  // GUARDIA DE RED: SOLO GET SIN SESSKEY, SALVO LOGIN, BORRADO DE CAMPOS LISTADOS Y ALTA DE CAMPOS, SIEMPRE EN d=dataId
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    const valor = (n) => {
      const m = url.match(new RegExp(`[?&]${n}=([^&]*)`)) || cuerpo.match(new RegExp(`name="${n}"\\r\\n\\r\\n([^\\r]*)\\r\\n|(?:^|&)${n}=([^&]*)`));
      return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
    };
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura' && url.startsWith(`${BASE}/mod/data/field.php`) && valor('d') === dataId) {
      const borrar = valor('mode') === 'delete' && estado.fidsBorrables.includes(valor('fid'));
      const alta = req.method() === 'POST' && valor('mode') === 'add';
      if (borrar || alta) { escrituras.push(`${valor('mode')}${valor('fid') ? ' fid ' + valor('fid') : ''}${valor('confirm') ? ' (confirmado)' : ''}`); return route.continue(); }
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

  // LA BASE TIENE QUE ESTAR DENTRO DE ZHAKYZ
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
  const enZhakyz = await page.evaluate(({ id, cm, nombre }) => {
    const raiz = document.querySelector(`li.section[data-id="${id}"]`);
    return !!(raiz && raiz.getAttribute('data-sectionname') === nombre && raiz.querySelector(`[data-for="cmitem"][data-id="${cm}"]`));
  }, { id: SECCION_ID, cm: cmid, nombre: SECCION_NOMBRE });
  if (!enZhakyz) salir(`La actividad ${cmid} no está dentro de la sección ${SECCION_NOMBRE}. No se toca.`);

  // LA BASE TIENE QUE ESTAR VACÍA Y SER LA DE LA DEFINICIÓN
  await page.goto(`${BASE}/mod/data/view.php?id=${cmid}`, { waitUntil: 'networkidle' });
  const vacia = await page.evaluate(() => /No hay entradas/i.test(document.querySelector('#region-main').innerText));
  if (!vacia) salir('La base tiene entradas: recrear los campos borraría datos. No se hace.');

  // CAMPOS ACTUALES
  await page.goto(`${BASE}/mod/data/field.php?id=${cmid}`, { waitUntil: 'networkidle' });
  const actuales = await page.evaluate((d) => {
    const vistos = {};
    [...document.querySelectorAll('#region-main a[href*="mode=delete"]')].forEach((a) => {
      const u = new URL(a.href);
      if (u.searchParams.get('d') !== d) return;
      vistos[u.searchParams.get('fid')] = { fid: u.searchParams.get('fid'), nombre: a.closest('tr').querySelector('td').innerText.trim(), href: a.href };
    });
    return Object.values(vistos);
  }, dataId);

  console.log('──────────────── RECREAR CAMPOS ────────────────');
  console.log(`Base        : "${def.nombre}" (cmid ${cmid}, d=${dataId}) · vacía · dentro de ${SECCION_NOMBRE}`);
  console.log(`Se borran   : ${actuales.map((c) => c.nombre).join(', ') || '(ninguno)'}`);
  console.log(`Se crean    : ${def.campos.map((c) => `${c.nombre} (${c.tipo})`).join(', ')}`);
  if (!confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para aplicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // BORRAR (CONFIRMANDO EN LA PANTALLA DE MOODLE)
  estado.fidsBorrables = actuales.map((c) => c.fid);
  for (const c of actuales) {
    estado.fase = 'escritura';
    await page.goto(c.href, { waitUntil: 'networkidle' });
    // Moodle muestra dos formularios: Cancelar (GET) y Continuar (POST con confirm=1 y el fid)
    const boton = page.locator(`form[method="post"]:has(input[name="confirm"][value="1"]):has(input[name="fid"][value="${c.fid}"]) [type="submit"]`);
    if ((await boton.count()) !== 1) salir(`No apareció la confirmación para borrar ${c.nombre}.`);
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), boton.click()]);
    estado.fase = 'lectura';
    console.log(`✔ Borrado ${c.nombre}`);
  }

  // CREAR EN ORDEN
  for (const c of def.campos) {
    await page.goto(`${BASE}/mod/data/field.php?id=${cmid}&mode=new&newtype=${c.tipo}`, { waitUntil: 'networkidle' });
    estado.fase = 'escritura';
    const r = await page.evaluate(async ({ c }) => {
      const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name="mode"]'));
      const fd = new FormData(f);
      fd.set('name', c.nombre);
      fd.set('description', c.descripcion || '');
      if (c.tipo === 'menu') fd.set('param1', c.opciones.join('\n'));
      fd.delete('cancel');
      if (!c.requerido) fd.delete('required');
      const resp = await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' });
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      return { status: resp.status, errores: [...doc.querySelectorAll('.error, .invalid-feedback, .alert-danger, .errormessage')].map((e) => e.textContent.trim()).filter(Boolean) };
    }, { c });
    estado.fase = 'lectura';
    if (r.status !== 200 || r.errores.length) salir(`Moodle rechazó el campo ${c.nombre}: ${JSON.stringify(r)}`);
    console.log(`✔ Creado ${c.nombre} (${c.tipo})`);
  }

  // VERIFICAR ORDEN Y NOMBRES
  await page.goto(`${BASE}/mod/data/field.php?id=${cmid}`, { waitUntil: 'networkidle' });
  const finales = await page.$$eval('#region-main table tbody tr', (filas) => filas.map((tr) => (tr.querySelector('td') || {}).innerText).filter(Boolean).map((s) => s.trim()));
  const esperado = def.campos.map((c) => c.nombre);
  const ok = JSON.stringify(finales) === JSON.stringify(esperado);
  console.log(`\n${ok ? '✔' : '⚠'} Campos en Moodle, en orden: ${finales.join(', ')}${ok ? '' : ` (esperado: ${esperado.join(', ')})`}`);
  console.log(`Escrituras : ${escrituras.join(' · ')}`);
  await browser.close();
})().catch((e) => salir(e.message));
