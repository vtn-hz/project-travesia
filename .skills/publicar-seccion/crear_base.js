// ---------------------------------------------------------
// CREAR UNA BASE DE DATOS (mod_data) EN LA SECCIÓN ZHAKYZ DESDE SU DEFINICIÓN EN EL REPO
// ---------------------------------------------------------
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/crear_base.js \
//     --definicion data/moodle/BASE_<NOMBRE>.json [--confirmar]
//
// La definición indica la clave, el nombre, la subsección de Zhakyz donde va (se crea si no existe) y los campos.
// Al terminar, escribe los ids de Moodle en moodle.config.json → bases.<clave> (relación 1 a 1)
// y actualiza las secciones que los usan (líneas "// @config").
const { chromium } = require('playwright');
const fs = require('fs');
const config = require('./config');

// ---------------------------------------------------------
// CONSTANTES (ÚNICO DESTINO PERMITIDO, DESDE moodle.config.json)
// ---------------------------------------------------------
const CONFIG = config.cargar();
const BASE = CONFIG.campus;
const CURSO = String(CONFIG.curso);
const SECCION_ID = String(CONFIG.seccion.id); // Zhakyz: se identifica por id (el número de posición cambia)
const SECCION_NOMBRE = CONFIG.seccion.nombre;
const TIPOS_CAMPO = ['text', 'menu', 'textarea', 'number', 'radiobutton', 'checkbox', 'multimenu', 'date', 'url'];

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

// ---------------------------------------------------------
// ARGUMENTOS Y DEFINICIÓN
// ---------------------------------------------------------
const argv = process.argv.slice(2);
const rutaDef = argv[argv.indexOf('--definicion') + 1];
const confirmar = argv.includes('--confirmar');
if (!rutaDef || !fs.existsSync(rutaDef)) salir('Falta --definicion o no existe.');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
const def = JSON.parse(fs.readFileSync(rutaDef, 'utf8'));
if (!def.clave || !def.nombre || !def.subseccion || !Array.isArray(def.campos) || !def.campos.length) salir('La definición necesita clave, nombre, subseccion y campos.');
def.campos.forEach((c) => {
  if (!TIPOS_CAMPO.includes(c.tipo)) salir(`Tipo de campo no soportado: ${c.tipo}`);
  if (c.tipo === 'menu' && !(c.opciones || []).length) salir(`El campo ${c.nombre} necesita opciones.`);
});
const existente = CONFIG.bases[def.clave];
if (existente && existente.cmid) salir(`bases.${def.clave} ya tiene cmid ${existente.cmid} en moodle.config.json: la base ya existe. No se crea otra.`);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const permitidas = [];
  const estado = { fase: 'login', seccionNum: null, subNum: null, dataId: null };

  // GUARDIA DE RED: SOLO GET, SALVO LOGIN Y LAS ESCRITURAS DE ESTA OPERACIÓN
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    const campo = (n, v) => new RegExp(`name="${n}"\\r\\n\\r\\n${v}\\r\\n|(^|&)${n}=${v}(&|$)`).test(cuerpo);
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura') {
      const subseccion = url === `${BASE}/course/modedit.php` && campo('course', CURSO) && campo('add', 'subsection') &&
        estado.seccionNum && campo('section', estado.seccionNum);
      const base = url === `${BASE}/course/modedit.php` && campo('course', CURSO) && campo('add', 'data') &&
        estado.subNum && campo('section', estado.subNum);
      const nuevoCampo = url === `${BASE}/mod/data/field.php` && estado.dataId && campo('d', estado.dataId) && campo('mode', 'add');
      if (subseccion || base || nuevoCampo) { permitidas.push(url.replace(BASE, '')); return route.continue(); }
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

  // LEER LA SECCIÓN ZHAKYZ, SUS SUBSECCIONES Y SUS ACTIVIDADES
  async function leerZhakyz() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate((id) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      if (!raiz) return null;
      const subs = [...raiz.querySelectorAll('li.section[data-id], [data-for="section"][data-id]')]
        .filter((s) => s !== raiz && s.getAttribute('data-id') !== id)
        .map((s) => ({ id: s.getAttribute('data-id'), numero: s.getAttribute('data-number'), nombre: s.getAttribute('data-sectionname') }));
      const cms = [...raiz.querySelectorAll('[data-for="cmitem"][data-id]')].map((c) => ({
        id: c.getAttribute('data-id'), texto: (c.innerText || '').split('\n')[0].trim(),
        // Una subsección es una actividad que contiene su propia sección delegada
        seccionDelegada: (c.querySelector('li.section[data-id], [data-for="section"][data-id]') || { getAttribute: () => null }).getAttribute('data-id'),
        subseccion: (c.closest('li.section') || {}).getAttribute ? c.closest('li.section').getAttribute('data-id') : null
      }));
      return { numero: raiz.getAttribute('data-number'), nombre: raiz.getAttribute('data-sectionname'), subs, cms };
    }, SECCION_ID);
  }

  let z = await leerZhakyz();
  if (!z || z.nombre !== SECCION_NOMBRE) salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}". No se hace nada.`);
  estado.seccionNum = z.numero;
  let sub = z.subs.find((s) => s.nombre === def.subseccion);
  const yaExiste = sub && z.cms.some((c) => c.subseccion === sub.id && c.texto.startsWith(def.nombre));
  if (yaExiste) salir(`Ya hay una actividad "${def.nombre}" en la subsección "${def.subseccion}". No se crea otra.`);

  console.log('──────────────── CREAR BASE DE DATOS ────────────────');
  console.log(`Definición : ${rutaDef}`);
  console.log(`Destino    : curso ${CURSO} → sección ${SECCION_NOMBRE} (id ${SECCION_ID}, hoy n.º ${z.numero}) → subsección "${def.subseccion}" ${sub ? `(existe, id ${sub.id})` : '(SE CREA)'}`);
  console.log(`Base       : "${def.nombre}" (mod_data, sin entradas)`);
  def.campos.forEach((c, i) => console.log(`Campo ${i + 1}    : ${c.nombre} (${c.tipo}${c.opciones ? ': ' + c.opciones.join(' · ') : ''})`));
  if (!confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para crear, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // ENVIAR EL FORMULARIO ABIERTO, CON LOS VALORES DADOS
  async function enviarForm(valores, quitar) {
    estado.fase = 'escritura';
    const r = await page.evaluate(async ({ valores, quitar }) => {
      const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name^="_qf__"], [name="mode"]'));
      const fd = new FormData(f);
      Object.keys(valores).forEach((k) => fd.set(k, valores[k]));
      [...fd.keys()].filter((k) => quitar.some((q) => k === q || k.endsWith(q))).forEach((k) => fd.delete(k));
      const resp = await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' });
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const errores = [...doc.querySelectorAll('.error, .invalid-feedback, .alert-danger, .errormessage')].map((e) => e.textContent.trim()).filter(Boolean);
      return { status: resp.status, url: resp.url, errores };
    }, { valores, quitar });
    estado.fase = 'lectura';
    if (r.status !== 200 || r.errores.length) salir(`Moodle rechazó el guardado: ${JSON.stringify(r)}`);
    return r;
  }

  // 1) SUBSECCIÓN (SOLO SI NO EXISTE)
  if (!sub) {
    await page.goto(`${BASE}/course/modedit.php?add=subsection&type=&course=${CURSO}&section=${estado.seccionNum}&return=0&sr=0`, { waitUntil: 'networkidle' });
    await enviarForm({ name: def.subseccion, submitbutton2: 'Guardar cambios y regresar al curso' }, ['cancel', 'submitbutton', 'coursecontentnotification', 'id']);
    z = await leerZhakyz();
    sub = z.subs.find((s) => s.nombre === def.subseccion);
    if (!sub) salir('Se envió la subsección pero no aparece dentro de Zhakyz. Revisar a mano.');
    console.log(`✔ Subsección "${def.subseccion}" creada (sección id ${sub.id}, n.º ${sub.numero})`);
  }
  estado.subNum = sub.numero;
  const subCm = z.cms.find((c) => c.seccionDelegada === sub.id);
  const cmsAntes = z.cms.map((c) => c.id);

  // 2) BASE DE DATOS DENTRO DE LA SUBSECCIÓN (SIN FECHAS, SIN NOTIFICAR)
  await page.goto(`${BASE}/course/modedit.php?add=data&type=&course=${CURSO}&section=${estado.subNum}&return=0&sr=0`, { waitUntil: 'networkidle' });
  const formBase = await page.evaluate(() => {
    const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name="_qf__mod_data_mod_form"]'));
    return f ? { course: f.course.value, section: f.section.value } : null;
  });
  if (!formBase || formBase.course !== CURSO || formBase.section !== estado.subNum) salir(`El formulario de la base no apunta a la subsección (${JSON.stringify(formBase)}).`);
  await enviarForm({ name: def.nombre, 'introeditor[text]': def.descripcion || '', submitbutton2: 'Guardar cambios y regresar al curso' },
    ['cancel', 'submitbutton', 'coursecontentnotification', 'id', '[enabled]']);
  z = await leerZhakyz();
  const nuevos = z.cms.filter((c) => !cmsAntes.includes(c.id));
  if (nuevos.length !== 1 || nuevos[0].subseccion !== sub.id) salir(`No se pudo identificar la base nueva dentro de la subsección (${JSON.stringify(nuevos)}). Revisar a mano.`);
  const cmid = nuevos[0].id;

  // 3) DATAID Y CAMPOS
  await page.goto(`${BASE}/mod/data/field.php?id=${cmid}&mode=new&newtype=text`, { waitUntil: 'networkidle' });
  estado.dataId = await page.$eval('[name="d"]', (e) => e.value);
  console.log(`✔ Base "${def.nombre}" creada (cmid ${cmid}, d=${estado.dataId})`);
  for (const c of def.campos) {
    await page.goto(`${BASE}/mod/data/field.php?id=${cmid}&mode=new&newtype=${c.tipo}`, { waitUntil: 'networkidle' });
    const valores = { name: c.nombre, description: c.descripcion || '' };
    if (c.tipo === 'menu') valores.param1 = c.opciones.join('\n');
    await enviarForm(valores, ['cancel', c.requerido ? '__nada__' : 'required']);
    console.log(`✔ Campo ${c.nombre} (${c.tipo})`);
  }

  // 4) VERIFICAR LOS CAMPOS CREADOS
  await page.goto(`${BASE}/mod/data/field.php?id=${cmid}`, { waitUntil: 'networkidle' });
  const creados = await page.$$eval('#region-main table tr', (filas) => filas.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.innerText.trim())).filter((f) => f.length > 1 && f[0]).map((f) => f[0]));
  const faltan = def.campos.map((c) => c.nombre).filter((n) => !creados.includes(n));

  // 5) RELACIÓN 1 A 1: GUARDAR LOS IDS EN moodle.config.json Y PASARLOS A LAS SECCIONES
  const actual = config.cargar();
  actual.subsecciones[def.subseccion] = { id: Number(sub.id), cmid: subCm ? Number(subCm.id) : null };
  actual.bases[def.clave] = Object.assign({}, actual.bases[def.clave], {
    cmid: Number(cmid), dataid: Number(estado.dataId), definicion: rutaDef, subseccion: def.subseccion, creada: new Date().toISOString().slice(0, 10)
  });
  config.guardar(actual);
  console.log(`✔ moodle.config.json → bases.${def.clave} (cmid ${cmid}, d=${estado.dataId})`);
  config.sincronizar().filter((r) => r.cambios.length).forEach((r) => console.log(`✔ ${r.archivo}: ${r.cambios.join('; ')}`));

  console.log(`\n${faltan.length ? '⚠ Faltan campos: ' + faltan.join(', ') : '✔ Los ' + def.campos.length + ' campos están creados'}`);
  console.log(`Ver en Moodle : ${BASE}/mod/data/view.php?id=${cmid}`);
  console.log(`Escrituras    : ${permitidas.length} (${[...new Set(permitidas)].join(', ')})`);
  console.log(`Fila para RULES.md: | Base de datos "${def.nombre}" (cmid ${cmid}, d=${estado.dataId}) en la subsección "${def.subseccion}" | \`${rutaDef}\` |`);
  await browser.close();
})().catch((e) => salir(e.message));
