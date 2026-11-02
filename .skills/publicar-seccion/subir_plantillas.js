// ---------------------------------------------------------
// SUBIR LA PLANTILLA DE LISTA DE UNA BASE DE ZHAKYZ (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/subir_plantillas.js \
//     --clave <bases.clave de moodle.config.json> [--confirmar]
//
// Lee data/moodle/plantillas/<clave>/listtemplateheader.html, listtemplate.html y listtemplatefooter.html,
// verifica que la base esté dentro de la sección Zhakyz y guarda las tres partes en Moodle (sin editor HTML).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const CONFIG = config.cargar();
const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);
const PARTES = ['listtemplateheader', 'listtemplate', 'listtemplatefooter'];

function salir(msg) { console.error('✖ ' + msg); process.exit(1); }

// ---------------------------------------------------------
// ARGUMENTOS Y ARCHIVOS
// ---------------------------------------------------------
const args = process.argv.slice(2);
const confirmar = args.includes('--confirmar');
const clave = args[args.indexOf('--clave') + 1];
if (!clave || args.indexOf('--clave') < 0) salir('Falta --clave.');
const base = CONFIG.bases[clave];
if (!base || !base.cmid || !base.dataid) salir(`bases.${clave} no tiene cmid y dataid en moodle.config.json.`);
const dir = path.join(config.RAIZ, 'data', 'moodle', 'plantillas', clave);
const plantillas = {};
PARTES.forEach((p) => {
  const ruta = path.join(dir, p + '.html');
  if (!fs.existsSync(ruta)) salir(`Falta ${path.relative(config.RAIZ, ruta)}.`);
  plantillas[p] = fs.readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n').trim();
});
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const estado = { fase: 'login' };
  const permitidas = [];

  // GUARDIA DE RED: SOLO GET SIN SESSKEY, SALVO LOGIN Y EL GUARDADO DE PLANTILLAS DE ESTA BASE
  await page.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (req.method() === 'GET' && !/sesskey=|delete|[?&]edit=on/i.test(url)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura' && req.method() === 'POST' &&
        url === `${BASE}/mod/data/templates.php?id=${base.cmid}&mode=listtemplate`) {
      permitidas.push(url.replace(BASE, ''));
      return route.continue();
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

  // VERIFICAR QUE LA BASE ESTÉ EN ZHAKYZ
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
  const enZhakyz = await page.evaluate(({ id, cmid }) => {
    const raiz = document.querySelector(`li.section[data-id="${id}"]`);
    return !!(raiz && raiz.querySelector(`[data-for="cmitem"][data-id="${cmid}"]`));
  }, { id: SECCION_ID, cmid: String(base.cmid) });
  if (!enZhakyz) salir(`La base cmid ${base.cmid} no está dentro de la sección Zhakyz. No se hace nada.`);

  // PLANTILLA ACTUAL
  const urlForm = `${BASE}/mod/data/templates.php?id=${base.cmid}&mode=listtemplate`;
  await page.goto(urlForm, { waitUntil: 'networkidle' });
  const actuales = await page.evaluate((partes) => partes.reduce((o, p) => {
    const t = document.querySelector(`textarea[name="${p}"]`);
    o[p] = t ? t.value.replace(/\r\n/g, '\n').trim() : null;
    return o;
  }, {}), PARTES);
  if (PARTES.some((p) => actuales[p] === null)) salir('No se encontró el formulario de la plantilla de lista.');

  console.log('──────────────── PLANTILLA DE LISTA ────────────────');
  console.log(`Base     : bases.${clave} (cmid ${base.cmid}, d=${base.dataid}) en Zhakyz`);
  PARTES.forEach((p) => console.log(`${p.padEnd(19)}: ${actuales[p] === plantillas[p] ? 'sin cambios' : `${actuales[p].length} → ${plantillas[p].length} caracteres`}`));
  if (PARTES.every((p) => actuales[p] === plantillas[p])) { await browser.close(); return console.log('\nLa plantilla de Moodle ya coincide con el repo.'); }
  if (!confirmar) {
    await browser.close();
    return console.log('\nSIMULACIÓN: no se escribió nada. Para guardar, repetir con --confirmar (requiere confirmación explícita del equipo).');
  }

  // GUARDAR: SE ENVÍA EL FORMULARIO CON fetch Y SIN "useeditor", PORQUE CON EL EDITOR ACTIVO
  // TinyMCE PISA LAS ÁREAS DE TEXTO AL ENVIAR Y PODRÍA LIMPIAR LOS ATRIBUTOS data-*
  estado.fase = 'escritura';
  const respuesta = await page.evaluate(async ({ partes, valores }) => {
    const form = document.querySelector('form[action*="templates.php"]');
    const fd = new FormData(form);
    fd.delete('useeditor');
    partes.forEach((p) => fd.set(p, valores[p]));
    const r = await fetch(form.action, { method: 'POST', body: fd, credentials: 'same-origin' });
    return r.status;
  }, { partes: PARTES, valores: plantillas });
  estado.fase = 'lectura';
  if (respuesta !== 200) salir(`Moodle respondió ${respuesta} al guardar la plantilla.`);

  // RELEER LO GUARDADO
  await page.goto(urlForm, { waitUntil: 'networkidle' });
  const guardadas = await page.evaluate((partes) => partes.reduce((o, p) => {
    o[p] = document.querySelector(`textarea[name="${p}"]`).value.replace(/\r\n/g, '\n').trim();
    return o;
  }, {}), PARTES);
  const distintas = PARTES.filter((p) => guardadas[p] !== plantillas[p]);
  console.log(distintas.length ? `\n⚠ Moodle guardó algo distinto en: ${distintas.join(', ')}` : '\n✔ Plantilla de lista guardada y verificada');
  console.log(`Ver en Moodle : ${BASE}/mod/data/view.php?id=${base.cmid}`);
  console.log(`Escrituras    : ${permitidas.length} (${[...new Set(permitidas)].join(', ')})`);
  await browser.close();
})().catch((e) => salir(e.message));
