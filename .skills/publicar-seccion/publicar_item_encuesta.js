// ---------------------------------------------------------
// PUBLICAR UN ÍTEM "ÁREA DE TEXTO Y MEDIOS" DE UNA ENCUESTA DE ZHAKYZ (mod_feedback)
// ---------------------------------------------------------
// El editor de ítems de Moodle borra los <script> al guardar: este script manda el mismo formulario de edición del ítem
// (edit_item.php) con el HTML del archivo, sin pasar por el editor. Solo ACTUALIZA ítems que ya existen; no crea ni borra.
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/publicar_item_encuesta.js \
//     --archivo section/<nombre>/content.html --encuesta inicial|cuatrimestral --items <id>[,<id>…] [--confirmar]
//
//   --encuesta → clave de moodle.config.json → encuestas (la encuesta tiene que estar en Zhakyz o en una de sus subsecciones)
//   --items    → ids de los ítems de esa encuesta (Editar preguntas: #feedback_item_<id>). Todos reciben el mismo archivo
const { chromium } = require('playwright');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');

// ---------------------------------------------------------
// CONSTANTES (ÚNICO DESTINO PERMITIDO, DESDE moodle.config.json)
// ---------------------------------------------------------
const CONFIG = config.cargar();
const BASE = CONFIG.campus;
const CURSO = String(CONFIG.curso);
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;
const CAMPO = 'presentation_editor[text]';

// ---------------------------------------------------------
// ARGUMENTOS
// ---------------------------------------------------------
function leerArgs() {
  const a = process.argv.slice(2);
  const o = { confirmar: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--confirmar') o.confirmar = true;
    else if (a[i].startsWith('--')) o[a[i].slice(2)] = a[++i];
  }
  if (!o.archivo || !fs.existsSync(o.archivo)) salir('Falta --archivo o no existe.');
  const enc = (CONFIG.encuestas || {})[o.encuesta];
  if (!enc || !enc.cmid) salir(`--encuesta tiene que ser una clave de moodle.config.json → encuestas (${Object.keys(CONFIG.encuestas || {}).join(', ')}).`);
  o.cmid = String(enc.cmid);
  o.items = String(o.items || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!o.items.length || o.items.some((s) => !/^\d+$/.test(s))) salir('--items tiene que ser una lista de ids numéricos separados por coma.');
  if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
  // Los valores "// @config" del archivo tienen que coincidir con moodle.config.json
  const sync = config.aplicar(fs.readFileSync(o.archivo, 'utf8'), CONFIG);
  if (sync.errores.length) salir('Rutas @config inexistentes:\n  ' + sync.errores.join('\n  '));
  if (sync.cambios.length) salir('El archivo no coincide con moodle.config.json. Correr sincronizar_config.js:\n  ' + sync.cambios.join('\n  '));
  return o;
}

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

// FECHA DEL COMENTARIO "PUBLICADO EN MOODLE" (EL DESTINO LO DESCRIBE EL ARCHIVO: VARIOS ÍTEMS COMPARTEN EL MISMO)
function conFecha(html) {
  const fecha = new Date().toISOString().slice(0, 10);
  return html.replace(/^(<!-- PUBLICADO EN MOODLE: .*?· )\d{4}-\d{2}-\d{2}( -->)$/m, `$1${fecha}$2`);
}

function diferencias(antes, despues) {
  const a = new Set(antes.split('\n').map((l) => l.trim()).filter(Boolean));
  const b = new Set(despues.split('\n').map((l) => l.trim()).filter(Boolean));
  return { agregadas: [...b].filter((l) => !a.has(l)).length, quitadas: [...a].filter((l) => !b.has(l)).length };
}

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const normal = (s) => s.replace(/\s+/g, ' ').trim();
const scripts = (s) => (s.match(/<script/g) || []).length;

// ---------------------------------------------------------
// PRINCIPAL
// ---------------------------------------------------------
(async () => {
  const args = leerArgs();
  const local = fs.readFileSync(args.archivo, 'utf8');
  const contenido = conFecha(local);
  let fase = 'login';
  let itemEnEscritura = null;
  const permitidas = [];

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // GUARDIA DE RED: SOLO GET, SALVO LOGIN Y EL POST DEL ÍTEM CONFIRMADO (id DEL ÍTEM Y cmid DE LA ENCUESTA EN EL CUERPO)
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    const campo = (n, v) => new RegExp(`name="${n.replace(/[[\]]/g, '\\$&')}"\\r\\n\\r\\n${v}\\r\\n|(^|&)${encodeURIComponent(n)}=${v}(&|$)`).test(cuerpo);
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) { permitidas.push('POST login'); return route.continue(); }
    if (fase === 'escritura' && itemEnEscritura && url === `${BASE}/mod/feedback/edit_item.php` &&
      campo('id', itemEnEscritura) && campo('cmid', args.cmid) && campo('typ', 'label')) {
      permitidas.push(`POST edit_item.php (ítem ${itemEnEscritura})`);
      return route.continue();
    }
    return route.abort();
  });

  // LOGIN
  await page.goto(`${BASE}/login/index.php`);
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation(), page.click('#loginbtn')]);
  fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');

  // VERIFICAR QUE LA SECCIÓN ES ZHAKYZ Y LEER SUS SUBSECCIONES
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
  const zona = await page.evaluate((id) => {
    const li = document.querySelector(`li.section[data-id="${id}"]`);
    if (!li) return null;
    return {
      numero: li.getAttribute('data-number'), nombre: li.getAttribute('data-sectionname'),
      subs: [...li.querySelectorAll('li.section.delegated-section[data-id]')].map((s) => s.getAttribute('data-number'))
    };
  }, SECCION_ID);
  if (!zona || zona.nombre !== SECCION_NOMBRE) salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}". No se publica.`);
  const seccionesValidas = [zona.numero].concat(zona.subs);

  // VERIFICAR QUE LA ENCUESTA ESTÁ EN ZHAKYZ
  await page.goto(`${BASE}/course/modedit.php?update=${args.cmid}&return=0`, { waitUntil: 'networkidle' });
  const act = await page.evaluate(() => {
    const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name^="_qf__"]'));
    const v = (n) => (f && f.querySelector(`[name="${n}"]`) || {}).value;
    return f ? { course: v('course'), section: v('section'), modulename: v('modulename'), nombre: v('name') } : null;
  });
  if (!act || act.course !== CURSO || act.modulename !== 'feedback' || !seccionesValidas.includes(act.section)) {
    salir(`La encuesta ${args.cmid} no es una Encuesta de la sección ${SECCION_NOMBRE}: ${JSON.stringify(act)}. No se publica.`);
  }

  // LOS ÍTEMS TIENEN QUE SER DE ESA ENCUESTA
  await page.goto(`${BASE}/mod/feedback/edit.php?id=${args.cmid}`, { waitUntil: 'networkidle' });
  const enEncuesta = await page.$$eval('[id^="feedback_item_"]', (els) => els.map((e) => e.id.replace('feedback_item_', '')));
  const ajenos = args.items.filter((id) => !enEncuesta.includes(id));
  if (ajenos.length) salir(`Los ítems ${ajenos.join(', ')} no están en la encuesta "${act.nombre}" (cmid ${args.cmid}). No se publica.`);

  // FORMULARIO DE EDICIÓN DE UN ÍTEM, LEÍDO DEL HTML DEL SERVIDOR (SIN EL EDITOR)
  async function leerItem(id) {
    await page.goto(`${BASE}/mod/feedback/edit_item.php?id=${id}`, { waitUntil: 'domcontentloaded' });
    return page.evaluate(async ({ id, campo }) => {
      const html = await (await fetch(`edit_item.php?id=${id}`, { credentials: 'same-origin' })).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const f = doc.querySelector('form [name="_qf__feedback_label_form"]');
      if (!f) return null;
      const form = f.closest('form');
      const v = (n) => (form.querySelector(`[name="${n}"]`) || {}).value;
      return { id: v('id'), cmid: v('cmid'), typ: v('typ'), texto: v(campo) || '' };
    }, { id, campo: CAMPO });
  }

  console.log('──────────────── PUBLICAR ÍTEMS DE ENCUESTA ────────────────');
  console.log(`Archivo local : ${args.archivo} (${contenido.length} caracteres, sha ${hash(contenido)})`);
  console.log(`Encuesta      : "${act.nombre}" (cmid ${args.cmid}) en ${SECCION_NOMBRE}`);
  const actuales = {};
  for (const id of args.items) {
    const it = await leerItem(id);
    if (!it || it.typ !== 'label' || it.id !== id || it.cmid !== args.cmid) {
      salir(`El ítem ${id} no es un "Área de texto y medios" de la encuesta ${args.cmid}: ${JSON.stringify(it && { id: it.id, cmid: it.cmid, typ: it.typ })}.`);
    }
    actuales[id] = it.texto;
    const dif = diferencias(it.texto, contenido);
    console.log(`Ítem ${id}     : hoy ${it.texto.length} caracteres (sha ${hash(it.texto)}, ${scripts(it.texto)} scripts) · cambios +${dif.agregadas} / -${dif.quitadas} líneas${normal(it.texto) === normal(contenido) ? ' (SIN CAMBIOS)' : ''}`);
  }
  if (!args.confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para publicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // ESCRIBIR CADA ÍTEM: EL MISMO FORMULARIO DE EDICIÓN, CON EL HTML NUEVO. LA POSICIÓN Y LA DEPENDENCIA NO CAMBIAN
  for (const id of args.items) {
    await page.goto(`${BASE}/mod/feedback/edit_item.php?id=${id}`, { waitUntil: 'domcontentloaded' });
    itemEnEscritura = id;
    fase = 'escritura';
    const r = await page.evaluate(async ({ id, campo, html }) => {
      const pagina = await (await fetch(`edit_item.php?id=${id}`, { credentials: 'same-origin' })).text();
      const doc = new DOMParser().parseFromString(pagina, 'text/html');
      const form = doc.querySelector('form [name="_qf__feedback_label_form"]').closest('form');
      const fd = new FormData(form);
      fd.set(campo, html);
      fd.delete('cancel');
      const resp = await fetch(new URL(form.getAttribute('action'), location.href).href, { method: 'POST', body: fd, credentials: 'same-origin' });
      const res = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const errores = [...res.querySelectorAll('.error, .invalid-feedback, .alert-danger, .errormessage')].map((e) => e.textContent.trim()).filter(Boolean);
      return { status: resp.status, url: resp.url, errores };
    }, { id, campo: CAMPO, html: contenido });
    fase = 'lectura';
    itemEnEscritura = null;
    if (r.status !== 200 || r.errores.length || /edit_item\.php/.test(r.url)) salir(`Moodle rechazó el guardado del ítem ${id}: ${JSON.stringify(r)}`);
    // VERIFICAR LEYENDO LO GUARDADO
    const guardado = (await leerItem(id)).texto;
    const identico = normal(guardado) === normal(contenido);
    const conserva = scripts(guardado) === scripts(contenido);
    console.log(`✔ Ítem ${id}: ${identico ? 'el contenido guardado coincide con el local' : 'Moodle modificó el contenido al guardarlo (revisar)'}; scripts ${conserva ? 'conservados' : 'ALTERADOS'}`);
    if (!conserva) salir(`El ítem ${id} perdió scripts al guardarse. Se frena antes de seguir con los demás.`);
  }

  // ACTUALIZAR EL ARCHIVO LOCAL (RELACIÓN 1 A 1: FECHA DE PUBLICACIÓN)
  fs.writeFileSync(args.archivo, contenido);
  console.log('\n✔ PUBLICADO');
  console.log(`Ver en Moodle : ${BASE}/mod/feedback/edit.php?id=${args.cmid}`);
  console.log(`Escrituras    : ${JSON.stringify(permitidas)}`);
  await browser.close();
})().catch((e) => salir(e.message));
