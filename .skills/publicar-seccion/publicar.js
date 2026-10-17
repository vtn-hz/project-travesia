// ---------------------------------------------------------
// PUBLICAR UNA SECCIÓN LOCAL EN MOODLE (SOLO SECCIÓN ZHAKYZ)
// ---------------------------------------------------------
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/publicar.js \
//     --archivo section/<nombre>/content.html --tipo pagina|etiqueta|resumen \
//     [--cmid <id>] [--nombre "<nombre visible>"] [--subseccion "<subsección de Zhakyz>"] [--confirmar]
//
//   tipo pagina   → Página (mod_page). Con --cmid la actualiza; sin --cmid la crea (requiere --nombre).
//   tipo etiqueta → Área de texto y medios (mod_label). Igual que pagina.
//   tipo resumen  → Resumen de la sección Zhakyz (no lleva --cmid).
//   --subseccion  → crea la actividad dentro de esa subsección de Zhakyz (la crea si no existe).
const { chromium } = require('playwright');
const fs = require('fs');
const crypto = require('crypto');

// ---------------------------------------------------------
// CONSTANTES (ÚNICO DESTINO PERMITIDO)
// La sección se identifica por su id, que no cambia. El número de posición (section=N)
// cambia si se agregan o se borran secciones, así que se lee en el momento.
// ---------------------------------------------------------
const BASE = 'https://ingenieria.campus.mdp.edu.ar';
const CURSO = '1732';
const SECCION_ID = '15647';
const SECCION_NOMBRE = 'Zhakyz';
const TIPOS = {
  pagina: { modulo: 'page', campo: 'page[text]', etiqueta: 'Página' },
  etiqueta: { modulo: 'label', campo: 'introeditor[text]', etiqueta: 'Área de texto y medios' },
  resumen: { modulo: null, campo: 'summary_editor[text]', etiqueta: 'Resumen de la sección' }
};

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
  if (!TIPOS[o.tipo]) salir('--tipo debe ser pagina, etiqueta o resumen.');
  if (o.tipo === 'resumen' && o.cmid) salir('El resumen de la sección no lleva --cmid.');
  if (o.subseccion && (o.tipo === 'resumen' || o.cmid)) salir('--subseccion solo sirve para crear una actividad nueva.');
  // Ítem de un grupo (section/<grupo>/<item>/content.html): la subsección sale de section/<grupo>/seccion.json
  const rutaGrupo = require('path').join(require('path').dirname(require('path').dirname(o.archivo)), 'seccion.json');
  if (!o.subseccion && !o.cmid && o.tipo !== 'resumen' && fs.existsSync(rutaGrupo)) {
    o.subseccion = JSON.parse(fs.readFileSync(rutaGrupo, 'utf8')).nombre;
    console.log(`Grupo         : ${rutaGrupo} → subsección "${o.subseccion}"`);
  }
  if (o.tipo !== 'resumen' && !o.cmid && !o.nombre) salir('Para crear una actividad nueva hace falta --nombre.');
  if (o.cmid && !/^\d+$/.test(o.cmid)) salir('--cmid tiene que ser numérico.');
  if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');
  return o;
}

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

// ---------------------------------------------------------
// ENCABEZADO 1 A 1 (COMENTARIO DE UBICACIÓN EN MOODLE)
// ---------------------------------------------------------
function conEncabezado(html, args, cmid) {
  const fecha = new Date().toISOString().slice(0, 10);
  const destino = args.tipo === 'resumen'
    ? `sección "${SECCION_NOMBRE}" (id ${SECCION_ID}) → campo "Resumen"`
    : `sección "${SECCION_NOMBRE}" (id ${SECCION_ID}) → ${TIPOS[args.tipo].etiqueta} "${args.nombre || ''}" (cmid ${cmid || 'nuevo'})`;
  const linea = `<!-- PUBLICADO EN MOODLE: curso ${CURSO} → ${destino} · ${fecha} -->`;
  const lineas = html.split('\n');
  const i = lineas.findIndex((l) => l.startsWith('<!-- PUBLICADO EN MOODLE:'));
  if (i >= 0) lineas[i] = linea;
  else lineas.unshift(linea);
  return lineas.join('\n').replace(/<!-- ÚLTIMA PUBLICACIÓN: [^>]* -->/, `<!-- ÚLTIMA PUBLICACIÓN: ${fecha} -->`);
}

// RESUMEN DE DIFERENCIAS POR LÍNEAS
function diferencias(antes, despues) {
  const a = new Set(antes.split('\n').map((l) => l.trim()).filter(Boolean));
  const b = new Set(despues.split('\n').map((l) => l.trim()).filter(Boolean));
  return {
    agregadas: [...b].filter((l) => !a.has(l)).length,
    quitadas: [...a].filter((l) => !b.has(l)).length
  };
}

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

// ---------------------------------------------------------
// PRINCIPAL
// ---------------------------------------------------------
(async () => {
  const args = leerArgs();
  const tipo = TIPOS[args.tipo];
  const local = fs.readFileSync(args.archivo, 'utf8');
  let fase = 'login';
  const permitidas = [];
  let cmidObjetivo = args.cmid || null;
  let seccionNum = null; // se completa al verificar la sección por id y nombre
  let destinoNum = null; // sección (o subsección de Zhakyz) donde va la actividad
  let seccionesValidas = []; // Zhakyz y sus subsecciones

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // GUARDIA DE RED: SOLO GET, SALVO LOGIN Y LA ESCRITURA PUNTUAL CONFIRMADA
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    const campo = (n, v) => new RegExp(`name="${n.replace(/[[\]]/g, '\\$&')}"\\r\\n\\r\\n${v}\\r\\n|(^|&)${encodeURIComponent(n)}=${v}(&|$)`).test(cuerpo);
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) { permitidas.push('POST login'); return route.continue(); }
    if (fase === 'escritura') {
      const esResumen = args.tipo === 'resumen' && url === `${BASE}/course/editsection.php` && campo('id', SECCION_ID);
      const esModulo = args.tipo !== 'resumen' && url === `${BASE}/course/modedit.php` && campo('course', CURSO) &&
        destinoNum !== null && campo('section', destinoNum) && campo('modulename', tipo.modulo) &&
        (cmidObjetivo ? campo('coursemodule', cmidObjetivo) : campo('add', tipo.modulo));
      const esSubseccion = !!args.subseccion && url === `${BASE}/course/modedit.php` && campo('course', CURSO) &&
        campo('add', 'subsection') && campo('section', seccionNum);
      if (esResumen || esModulo || esSubseccion) { permitidas.push(`POST ${url}`); return route.continue(); }
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

  // VERIFICAR QUE LA SECCIÓN DESTINO ES ZHAKYZ
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
  const seccion = await page.evaluate((id) => {
    const li = document.querySelector(`[data-id="${id}"][data-for="section"], li.section[data-id="${id}"]`);
    return li ? { numero: li.getAttribute('data-number'), nombre: li.getAttribute('data-sectionname') } : null;
  }, SECCION_ID);
  if (!seccion || seccion.nombre !== SECCION_NOMBRE || !/^\d+$/.test(seccion.numero || '')) {
    salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}" (${JSON.stringify(seccion)}). No se publica.`);
  }
  seccionNum = seccion.numero;
  // SUBSECCIONES DE ZHAKYZ
  async function leerSubsecciones() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate((id) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      return [...raiz.querySelectorAll('li.section.delegated-section[data-id]')]
        .map((s) => ({ id: s.getAttribute('data-id'), numero: s.getAttribute('data-number'), nombre: s.getAttribute('data-sectionname') }));
    }, SECCION_ID);
  }
  let subs = await leerSubsecciones();
  seccionesValidas = [seccionNum].concat(subs.map((s) => s.numero));
  let sub = args.subseccion ? subs.find((s) => s.nombre === args.subseccion) : null;
  destinoNum = sub ? sub.numero : seccionNum;
  if (args.subseccion && !sub && !args.confirmar) {
    console.log('──────────────── PUBLICAR SECCIÓN ────────────────');
    console.log(`Archivo local : ${args.archivo} (${local.length} caracteres, sha ${hash(local)})`);
    console.log(`Destino       : curso ${CURSO} → sección ${SECCION_NOMBRE} (id ${SECCION_ID}) → subsección "${args.subseccion}" (SE CREA) → ${tipo.etiqueta} "${args.nombre}" (NUEVA)`);
    console.log('\nSIMULACIÓN: no se escribió nada. Para publicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }
  if (args.subseccion && !sub) {
    await page.goto(`${BASE}/course/modedit.php?add=subsection&type=&course=${CURSO}&section=${seccionNum}&return=0&sr=0`, { waitUntil: 'networkidle' });
    fase = 'escritura';
    const st = await page.evaluate(async (nombre) => {
      const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name="_qf__mod_subsection_mod_form"]'));
      const fd = new FormData(f);
      fd.set('name', nombre);
      ['cancel', 'submitbutton', 'coursecontentnotification', 'id'].forEach((k) => fd.delete(k));
      fd.set('submitbutton2', 'Guardar cambios y regresar al curso');
      return (await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' })).status;
    }, args.subseccion);
    fase = 'lectura';
    if (st !== 200) salir(`No se pudo crear la subsección (HTTP ${st}).`);
    subs = await leerSubsecciones();
    sub = subs.find((s) => s.nombre === args.subseccion);
    if (!sub) salir('Se envió la subsección pero no aparece dentro de Zhakyz.');
    seccionesValidas = [seccionNum].concat(subs.map((s) => s.numero));
    destinoNum = sub.numero;
    console.log(`✔ Subsección "${args.subseccion}" creada (sección ${sub.id})`);
  }
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
  const cmidsAntes = await page.$$eval('[data-for="cmitem"][data-id], li.activity[data-id]', (els) => els.map((e) => e.getAttribute('data-id')));

  // ABRIR EL FORMULARIO
  const urlForm = args.tipo === 'resumen' ? `${BASE}/course/editsection.php?id=${SECCION_ID}`
    : cmidObjetivo ? `${BASE}/course/modedit.php?update=${cmidObjetivo}&return=0`
      : `${BASE}/course/modedit.php?add=${tipo.modulo}&type=&course=${CURSO}&section=${destinoNum}&return=0&sr=0`;
  await page.goto(urlForm, { waitUntil: 'networkidle' });
  const form = await page.evaluate((campoTexto) => {
    const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name^="_qf__"]'));
    if (!f) return null;
    const v = (n) => (f.querySelector(`[name="${n}"]`) || {}).value;
    return { course: v('course'), section: v('section'), modulename: v('modulename'), id: v('id'), nombre: v('name'), texto: v(campoTexto) };
  }, tipo.campo);
  if (!form) salir('No se encontró el formulario (¿permisos o cmid inexistente?).');
  if (args.tipo === 'resumen') {
    if (form.nombre !== SECCION_NOMBRE) salir(`El formulario no es de la sección ${SECCION_NOMBRE}.`);
  } else if (form.course !== CURSO || !seccionesValidas.includes(form.section) || form.modulename !== tipo.modulo) {
    salir(`El destino no está en la sección ${SECCION_NOMBRE} o no es del tipo pedido: ${JSON.stringify({ course: form.course, section: form.section, modulename: form.modulename })}. No se publica.`);
  }
  if (args.tipo !== 'resumen') destinoNum = form.section;

  // PREPARAR CONTENIDO Y MOSTRAR LO QUE VA A CAMBIAR
  let contenido = conEncabezado(local, { ...args, nombre: args.nombre || form.nombre }, cmidObjetivo);
  const dif = diferencias(form.texto || '', contenido);
  console.log('──────────────── PUBLICAR SECCIÓN ────────────────');
  console.log(`Archivo local : ${args.archivo} (${local.length} caracteres, sha ${hash(local)})`);
  console.log(`Destino       : curso ${CURSO} → sección ${SECCION_NOMBRE} (id ${SECCION_ID})${sub ? ` → subsección "${sub.nombre}" (${sub.id})` : ''} → ${tipo.etiqueta}` +
    (args.tipo === 'resumen' ? '' : cmidObjetivo ? ` "${form.nombre}" (cmid ${cmidObjetivo}, ACTUALIZAR)` : ` "${args.nombre}" (NUEVA)`));
  console.log(`En Moodle hoy : ${(form.texto || '').length} caracteres, sha ${hash(form.texto || '')}`);
  console.log(`Cambios       : +${dif.agregadas} / -${dif.quitadas} líneas`);
  if (!args.confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para publicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // ESCRIBIR
  async function enviar(html) {
    fase = 'escritura';
    const r = await page.evaluate(async ({ campoTexto, html, nombre, esResumen, seccionId }) => {
      const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name^="_qf__"]'));
      f.querySelector(`[name="${campoTexto}"]`).value = html;
      const fd = new FormData(f);
      fd.set(campoTexto, html);
      fd.delete('cancel');
      fd.delete('coursecontentnotification'); // nunca notificar a los participantes
      fd.delete('id'); // el selector de grupo de las restricciones también se llama "id"
      if (esResumen) fd.set('id', seccionId);
      if (nombre && !esResumen) fd.set('name', nombre);
      fd.delete('submitbutton');
      fd.set(esResumen ? 'submitbutton' : 'submitbutton2', 'Guardar cambios');
      const resp = await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' });
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const errores = [...doc.querySelectorAll('.error, .invalid-feedback, .alert-danger, .errormessage')]
        .map((e) => e.textContent.trim()).filter(Boolean);
      return { status: resp.status, url: resp.url, errores };
    }, { campoTexto: tipo.campo, html, nombre: args.nombre, esResumen: args.tipo === 'resumen', seccionId: SECCION_ID });
    fase = 'lectura';
    if (r.status !== 200 || r.errores.length || /modedit|editsection/.test(r.url)) {
      salir(`Moodle rechazó el guardado: ${JSON.stringify(r)}`);
    }
  }

  await enviar(contenido);

  // SI ERA NUEVA: OBTENER EL CMID Y VOLVER A GUARDAR CON EL ENCABEZADO COMPLETO
  if (args.tipo !== 'resumen' && !cmidObjetivo) {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    const cmidsDespues = await page.$$eval('[data-for="cmitem"][data-id], li.activity[data-id]', (els) => els.map((e) => e.getAttribute('data-id')));
    const nuevos = cmidsDespues.filter((c) => !cmidsAntes.includes(c));
    if (nuevos.length !== 1) salir(`Se creó la actividad pero no se pudo identificar su cmid (${JSON.stringify(nuevos)}). Revisar a mano.`);
    cmidObjetivo = nuevos[0];
    contenido = conEncabezado(local, args, cmidObjetivo);
    await page.goto(`${BASE}/course/modedit.php?update=${cmidObjetivo}&return=0`, { waitUntil: 'networkidle' });
    await enviar(contenido);
  }

  // VERIFICAR LEYENDO LO GUARDADO
  await page.goto(args.tipo === 'resumen' ? `${BASE}/course/editsection.php?id=${SECCION_ID}` : `${BASE}/course/modedit.php?update=${cmidObjetivo}&return=0`, { waitUntil: 'networkidle' });
  const guardado = await page.$eval(`[name="${tipo.campo}"]`, (e) => e.value);
  const normal = (s) => s.replace(/\s+/g, ' ').trim();
  const identico = normal(guardado) === normal(contenido);
  const conservaScripts = (guardado.match(/<script/g) || []).length === (contenido.match(/<script/g) || []).length;

  // ACTUALIZAR EL ARCHIVO LOCAL (RELACIÓN 1 A 1)
  fs.writeFileSync(args.archivo, contenido);

  console.log('\n✔ PUBLICADO');
  console.log(`cmid          : ${cmidObjetivo || '(resumen de sección)'}`);
  console.log(`Ver en Moodle : ${args.tipo === 'resumen' ? `${BASE}/course/section.php?id=${SECCION_ID}` : `${BASE}/mod/${tipo.modulo}/view.php?id=${cmidObjetivo}`}`);
  console.log(`Verificación  : ${identico ? 'el contenido guardado coincide con el local' : 'Moodle modificó el contenido al guardarlo (revisar)'}; scripts ${conservaScripts ? 'conservados' : 'ALTERADOS'}`);
  console.log(`Escrituras    : ${JSON.stringify(permitidas)}`);
  console.log(`Fila para RULES.md: | ${tipo.etiqueta}${args.tipo === 'resumen' ? '' : ` "${args.nombre || form.nombre}" (cmid ${cmidObjetivo})`} | \`${args.archivo}\` |`);
  await browser.close();
})().catch((e) => salir(e.message));
