// ---------------------------------------------------------
// AGREGAR AL FINAL DE UNA BASE DE ZHAKYZ LOS CAMPOS NUEVOS DE SU DEFINICIÓN (SIN BORRAR NI TOCAR LOS QUE YA TIENE)
// ---------------------------------------------------------
// Para bases con entradas, donde recrear_campos.js no sirve. Moodle agrega cada campo al final y las entradas existentes quedan con
// ese campo vacío. Solo agrega: si los campos actuales no son, en orden, el comienzo de la definición, no hace nada.
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/agregar_campos.js \
//     --definicion data/moodle/BASE_<NOMBRE>.json [--confirmar]
// Después: subir la plantilla de lista con subir_plantillas.js si la definición la cambió.
const { chromium } = require('playwright');
const fs = require('fs');

const CONFIG = require('./config').cargar();
const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;

function salir(msg) { console.error('✖ ' + msg); process.exit(1); }

const argv = process.argv.slice(2);
const rutaDef = argv[argv.indexOf('--definicion') + 1];
const confirmar = argv.includes('--confirmar');
if (!rutaDef || !fs.existsSync(rutaDef)) salir('Falta --definicion o no existe.');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
const def = JSON.parse(fs.readFileSync(rutaDef, 'utf8'));
const ids = def.clave ? CONFIG.bases[def.clave] : null;
if (!ids || !ids.cmid || !ids.dataid) salir(`moodle.config.json no tiene cmid y dataid para bases.${def.clave || '<clave>'}.`);
const cmid = String(ids.cmid);
const dataId = String(ids.dataid);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  ctx.setDefaultTimeout(150000);
  ctx.setDefaultNavigationTimeout(150000);
  const page = await ctx.newPage();
  const estado = { fase: 'login' };
  const escrituras = [];

  // GUARDIA DE RED: SOLO GET SIN SESSKEY, SALVO LOGIN Y ALTA DE CAMPOS EN d=dataId (NUNCA BORRAR NI EDITAR CAMPOS)
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
    if (estado.fase === 'escritura' && req.method() === 'POST' && url.startsWith(`${BASE}/mod/data/field.php`) && valor('d') === dataId && valor('mode') === 'add') {
      escrituras.push(`alta de ${valor('name')}`);
      return route.continue();
    }
    return route.abort();
  });

  await page.goto(`${BASE}/login/index.php`, { waitUntil: 'domcontentloaded' });
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#loginbtn')]);
  estado.fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');

  // LA BASE TIENE QUE ESTAR DENTRO DE ZHAKYZ
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'domcontentloaded' });
  const enZhakyz = await page.evaluate(({ id, cm, nombre }) => {
    const raiz = document.querySelector(`li.section[data-id="${id}"]`);
    return !!(raiz && raiz.getAttribute('data-sectionname') === nombre && raiz.querySelector(`[data-for="cmitem"][data-id="${cm}"]`));
  }, { id: SECCION_ID, cm: cmid, nombre: SECCION_NOMBRE });
  if (!enZhakyz) salir(`La actividad ${cmid} no está dentro de la sección ${SECCION_NOMBRE}. No se toca.`);

  // CAMPOS ACTUALES, EN ORDEN
  const leerCampos = async () => {
    await page.goto(`${BASE}/mod/data/field.php?id=${cmid}`, { waitUntil: 'domcontentloaded' });
    return page.$$eval('#region-main table tbody tr', (filas) => filas.map((tr) => (tr.querySelector('td') || {}).innerText).filter(Boolean).map((s) => s.trim()));
  };
  const actuales = await leerCampos();
  const esperados = def.campos.map((c) => c.nombre);
  const prefijo = actuales.every((n, i) => esperados[i] === n);
  if (!prefijo) salir(`Los campos actuales (${actuales.join(', ')}) no son el comienzo de la definición (${esperados.join(', ')}). No se agrega nada.`);
  const nuevos = def.campos.slice(actuales.length);

  console.log('──────────────── AGREGAR CAMPOS ────────────────');
  console.log(`Base        : "${def.nombre}" (cmid ${cmid}, d=${dataId}) · dentro de ${SECCION_NOMBRE}`);
  console.log(`Ya tiene    : ${actuales.length} campos (${actuales.join(', ')})`);
  console.log(`Se agregan  : ${nuevos.length ? nuevos.map((c) => `${c.nombre} (${c.tipo})`).join(', ') : '(ninguno: la base ya coincide con la definición)'}`);
  if (!confirmar || !nuevos.length) {
    if (!confirmar) console.log('\nSIMULACIÓN: no se escribió nada. Para agregar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  for (const c of nuevos) {
    await page.goto(`${BASE}/mod/data/field.php?id=${cmid}&mode=new&newtype=${c.tipo}`, { waitUntil: 'domcontentloaded' });
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
    if (r.status !== 200 || r.errores.length) salir(`Moodle rechazó el campo ${c.nombre}: ${JSON.stringify(r)}. Los anteriores ya quedaron agregados: volver a correr agrega los que faltan.`);
    console.log(`✔ Agregado ${c.nombre} (${c.tipo})`);
  }

  const finales = await leerCampos();
  const ok = JSON.stringify(finales) === JSON.stringify(esperados);
  console.log(`\n${ok ? '✔' : '⚠'} Campos en Moodle, en orden: ${finales.join(', ')}${ok ? '' : ` (esperado: ${esperados.join(', ')})`}`);
  console.log(`Escrituras : ${escrituras.join(' · ')}`);
  await browser.close();
})().catch((e) => salir(e.message));
