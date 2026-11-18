// ---------------------------------------------------------
// DATOS DE PRUEBA: LO QUE COMPARTEN aplicar.js Y remover.js
// ---------------------------------------------------------
// Bases, marcas de los datos de prueba, registro de lo aplicado (data/prueba/aplicado.json), login con la guardia de red y las
// funciones que corren dentro del campus (leer con LeerBase de la Página Tools, agregar, desaprobar y borrar entradas).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const CONFIG = require('../publicar-seccion/config').cargar();

const RAIZ = path.resolve(__dirname, '..', '..');
const DIR_DATOS = path.join(RAIZ, 'data', 'prueba');
const ARCHIVO_APLICADO = path.join(DIR_DATOS, 'aplicado.json');
const BASE = CONFIG.campus;

// Bases en el orden en que se aplican (Criticidad apunta a Respuestas y a CargaParcialesPrimero). Se borran al revés
const BASES = [
  { clave: 'estudiantes', archivo: 'estudiantes.json', config: 'estudiantes' },
  { clave: 'respuestas', archivo: 'respuestas.json', config: 'respuestas' },
  { clave: 'carga_parciales_primero', archivo: 'parciales.json', config: 'carga_parciales_primero',
    leer: { filas: 'tr[data-tipo="entrada_parcial"]', columnas: ['dni', 'estudiante', 'materia', 'instancia', 'periodo', 'nota', 'estado', 'recupera_a'] } },
  { clave: 'criticidad', archivo: 'criticidad.json', config: 'criticidad' },
  { clave: 'entrevistas', archivo: 'entrevistas.json', config: 'entrevistas' }
].map((b) => Object.assign(b, { dataid: CONFIG.bases[b.config].dataid, cmid: CONFIG.bases[b.config].cmid }));

function salir(msg) { console.error('✖ ' + msg); process.exit(1); }
const args = process.argv.slice(2);
const arg = (n) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : null);

function cargarDatos() {
  return Object.fromEntries(BASES.map((b) => [b.clave, JSON.parse(fs.readFileSync(path.join(DIR_DATOS, b.archivo), 'utf8')).entradas]));
}
function cargarAplicado() {
  try { return JSON.parse(fs.readFileSync(ARCHIVO_APLICADO, 'utf8')); } catch (e) { return { descripcion: 'Entradas de data/prueba creadas en Moodle: ref → { base, rid }. Lo escribe aplicar.js y lo vacía remover.js.', entradas: {} }; }
}
function guardarAplicado(a) { fs.writeFileSync(ARCHIVO_APLICADO, JSON.stringify(a, null, 1) + '\n'); }

// ---------------------------------------------------------
// MARCAS: UNA ENTRADA ES DE PRUEBA SOLO SI LAS CUMPLE (EL BORRADO NUNCA TOCA OTRA)
// ---------------------------------------------------------
const esIdPrueba = (v) => { const n = Number(String(v || '').trim()); return n >= 900000 && n <= 900999; };
const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
function marcas(datos) {
  // CargaParcialesPrimero no tiene id de usuario: DNI de la lista y el mismo nombre del estudiante ficticio
  const nombrePorDni = Object.fromEntries(datos.estudiantes.map((e) => [e.campos.dni, normalizar(`${e.campos.nombre} ${e.campos.apellido}`)]));
  return {
    estudiantes: (c) => esIdPrueba(c.id_usuario),
    respuestas: (c) => esIdPrueba(c.id_usuario),
    criticidad: (c) => esIdPrueba(c.id_usuario),
    entrevistas: (c) => esIdPrueba(c.id_usuario_estudiante),
    carga_parciales_primero: (c) => !!nombrePorDni[String(c.dni || '').trim()] && nombrePorDni[String(c.dni).trim()] === normalizar(c.estudiante)
  };
}

// ---------------------------------------------------------
// NAVEGADOR CON GUARDIA DE RED
// ---------------------------------------------------------
// Lecturas: GET sin sesskey ni delete/approve. Escrituras, solo las que se habilitan en "permitido":
//   alta (POST mod/data/edit.php con rid=0 en una de las 5 bases), desaprobar o borrar un rid de la lista.
async function abrir() {
  if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  ctx.setDefaultTimeout(150000);
  ctx.setDefaultNavigationTimeout(150000);
  const permitido = { fase: 'login', altas: false, desaprobar: new Set(), borrar: new Set() };
  const escrituras = { alta: 0, desaprobar: 0, borrar: 0 };
  const dataids = new Set(BASES.map((b) => String(b.dataid)));
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    if (req.method() === 'GET' && url.startsWith(`${BASE}/mod/data/view.php?`)) {
      const q = new URL(url).searchParams;
      const d = q.get('d');
      if (q.get('sesskey') && dataids.has(d) && q.get('disapprove') && permitido.desaprobar.has(`${d}:${q.get('disapprove')}`)) { escrituras.desaprobar++; return route.continue(); }
      if (q.get('sesskey') && dataids.has(d) && q.get('delete') && q.get('confirm') === '1' && permitido.borrar.has(`${d}:${q.get('delete')}`)) { escrituras.borrar++; return route.continue(); }
    }
    if (req.method() === 'GET' && !/sesskey=|delete|approve|[?&]edit=on/i.test(url)) return route.continue();
    if (url.startsWith(`${BASE}/lib/ajax/service`) && /"methodname":"(core_output_load_template_with_dependencies|core_get_string|core_get_strings|core_output_load_fontawesome_icon_system_map|core_courseformat_get_state)"/.test(cuerpo) && !/update_course/.test(cuerpo)) return route.continue();
    if (permitido.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (permitido.altas && req.method() === 'POST' && url === `${BASE}/mod/data/edit.php`) {
      const campo = (n) => (cuerpo.match(new RegExp(`name="${n}"\\r\\n\\r\\n([^\\r]*)\\r\\n`)) || [])[1];
      if (dataids.has(campo('d')) && campo('rid') === '0') { escrituras.alta++; return route.continue(); }
    }
    return route.abort();
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login/index.php`, { waitUntil: 'domcontentloaded' });
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#loginbtn')]);
  permitido.fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');

  // Las 5 bases tienen que estar dentro de Zhakyz
  await page.goto(`${BASE}/course/section.php?id=${CONFIG.seccion.id}`, { waitUntil: 'domcontentloaded' });
  const fuera = await page.evaluate(({ id, cmids }) => {
    const raiz = document.querySelector(`li.section[data-id="${id}"]`);
    if (!raiz || raiz.getAttribute('data-sectionname') !== 'Zhakyz') return ['la sección Zhakyz'];
    return cmids.filter((c) => !raiz.querySelector(`[data-for="cmitem"][data-id="${c}"]`));
  }, { id: CONFIG.seccion.id, cmids: BASES.map((b) => String(b.cmid)) });
  if (fuera.length) salir(`No están dentro de Zhakyz: ${fuera.join(', ')}. No se hace nada.`);

  // Las funciones del campus corren en la Página Tools (carga M y la biblioteca)
  await page.goto(`${BASE}/mod/page/view.php?id=${CONFIG.paginas.utils_tools}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(instalar);
  return { browser, page, permitido, escrituras };
}

// ---------------------------------------------------------
// FUNCIONES QUE CORREN EN EL CAMPUS (window.__zkPrueba)
// ---------------------------------------------------------
function instalar() {
  const biblioteca = document.querySelector('script[type="text/plain"][data-zk-biblioteca="tools"]');
  if (!window.ZhakyzTools && biblioteca) { const s = document.createElement('script'); s.textContent = biblioteca.textContent; document.head.appendChild(s); }
  if (!window.ZhakyzTools) throw new Error('No se pudo cargar la biblioteca de Tools.');
  const formularios = {};
  // Formulario de alta de una base: campos por etiqueta (en minúsculas) y los demás valores del formulario. Se lee una vez por base
  async function formulario(dataid) {
    if (formularios[dataid]) return formularios[dataid];
    const html = await (await fetch(`${M.cfg.wwwroot}/mod/data/edit.php?d=${dataid}`, { credentials: 'same-origin' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const form = [...doc.querySelectorAll('form')].find((f) => f.querySelector('[name^="field_"]'));
    if (!form) throw new Error(`No se encontró el formulario de alta de la base d=${dataid}.`);
    const porCampo = {}, opciones = {};
    form.querySelectorAll('label[for]').forEach((l) => {
      const ctrl = form.querySelector('#' + CSS.escape(l.getAttribute('for')));
      if (!ctrl || !/^field_/.test(ctrl.name)) return;
      // Moodle agrega "Campo obligatorio" a la etiqueta de los obligatorios (como en la página de carga de notas)
      const etiqueta = l.textContent.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s*campo obligatorio$/, '');
      porCampo[etiqueta] = ctrl.name;
      if (ctrl.tagName === 'SELECT') opciones[etiqueta] = [...ctrl.options].map((o) => o.value).filter(Boolean);
    });
    const base = [...new FormData(form).entries()].filter(([k]) => !/^field_/.test(k) && k !== 'saveandadd' && k !== 'cancel');
    return (formularios[dataid] = { porCampo, opciones, base });
  }
  window.__zkPrueba = {
    // Campos del formulario de alta (por etiqueta) y opciones de las listas: para revisar los JSON sin escribir
    async campos(dataid) { const f = await formulario(dataid); return { campos: Object.keys(f.porCampo), opciones: f.opciones }; },
    async agregar(dataid, campos) {
      const f = await formulario(dataid);
      const fd = new FormData();
      f.base.forEach(([k, v]) => fd.append(k, v));
      fd.set('d', String(dataid));
      fd.set('rid', '0');
      fd.set('saveandview', 'Guardar');
      for (const [k, v] of Object.entries(campos)) {
        const nombre = f.porCampo[k.toLowerCase()];
        if (!nombre) throw new Error(`Falta el campo "${k}" en la base d=${dataid}.`);
        fd.delete(nombre); // un menú de selección múltiple (Estado) queda con una sola opción
        fd.append(nombre, v === null || v === undefined ? '' : String(v));
      }
      const r = await fetch(`${M.cfg.wwwroot}/mod/data/edit.php`, { method: 'POST', body: fd, credentials: 'same-origin' });
      const m = (r.url || '').match(/[?&]rid=(\d+)/);
      if (m) return Number(m[1]);
      const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
      const errores = [...doc.querySelectorAll('#region-main .alert-danger, #region-main .error')].map((e) => e.textContent.trim()).filter(Boolean);
      throw new Error(errores.length ? errores.join(' ') : 'Moodle no confirmó la entrada nueva.');
    },
    // true solo si Moodle muestra el aviso de éxito (la misma regla que la Página Configuración del Sistema)
    async aviso(url) {
      const r = await fetch(url, { credentials: 'same-origin' });
      if (!r.ok || /\/login\//.test(r.url || '')) return false;
      const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
      return !!doc.querySelector('.alert-success') && !doc.querySelector('#region-main .alert-danger, #region-main .errorbox');
    },
    desaprobar(dataid, rid) { return this.aviso(`${M.cfg.wwwroot}/mod/data/view.php?d=${dataid}&disapprove=${rid}&sesskey=${encodeURIComponent(M.cfg.sesskey)}`); },
    borrar(dataid, rid) { return this.aviso(`${M.cfg.wwwroot}/mod/data/view.php?d=${dataid}&delete=${rid}&confirm=1&sesskey=${encodeURIComponent(M.cfg.sesskey)}`); },
    // Todas las entradas de una base, con LeerBase de Tools (también las desaprobadas, que el equipo ve)
    async leer(opciones) {
      const r = await window.ZhakyzTools.LeerBase(opciones);
      return { completa: r.completa !== false, entradas: r.entradas.map((e) => ({ rid: Number(e.rid), campos: Object.fromEntries(Object.entries(e.campos).map(([k, v]) => [k, String(v).trim()])) })) };
    }
  };
}

// LEE LAS 5 BASES Y DEVUELVE, POR BASE, LAS ENTRADAS (rid → campos)
async function leerBases(page) {
  const r = {};
  for (const b of BASES) {
    const l = await page.evaluate((o) => window.__zkPrueba.leer(o), Object.assign({ dataid: b.dataid }, b.leer || {}));
    if (!l.completa) salir(`La base ${b.clave} tiene más entradas que las que lee Tools: no se puede seguir con seguridad.`);
    r[b.clave] = l.entradas;
  }
  return r;
}

// TAREAS DE A "n" EN PARALELO, EN ORDEN DE LLEGADA
async function enParalelo(lista, n, fn) {
  let i = 0;
  const trabajador = async () => { while (i < lista.length) { const k = i++; await fn(lista[k], k); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, lista.length)) }, trabajador));
}

module.exports = { CONFIG, BASES, ARCHIVO_APLICADO, salir, arg, args, cargarDatos, cargarAplicado, guardarAplicado, marcas, abrir, leerBases, enParalelo };
