// ---------------------------------------------------------
// GENERAR UN MANUAL DE USUARIO EN PDF RECORRIENDO MOODLE (SOLO LECTURA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/manual-usuario/generar.js \
//     --rol ADM [--guion <id>] [--salida docs/manuales/<rol>] [--ancho 1280] [--alto 2000] [--visible]
//
// En la carpeta de salida quedan solo manual-<rol>.md (solo texto) y manual-<rol>.pdf.
// Las imágenes y el HTML intermedio se arman en una carpeta temporal que se borra al terminar.
//
// El manual es POR ROL: junta todos los guiones (guiones/*.js) cuyo "roles" incluye ese rol, en el orden de "orden".
// Con --guion se genera solo ese (útil para iterar un guion nuevo).
// 1. Inicia sesión y recorre los pasos de cada guion con una guardia de red de solo lectura. Nada se escribe en el campus.
// 2. En cada paso hace las acciones, señala los elementos (senalar.js) y saca la imagen.
// 3. Arma el manual en HTML (pdf.js) y lo imprime a PDF con Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const senalar = require('./senalar');
const { armarHtml, armarMd } = require('./pdf');

const RAIZ = path.resolve(__dirname, '..', '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(RAIZ, 'moodle.config.json'), 'utf8'));
const BASE = CONFIG.campus;
const COLOR = '#8e24aa'; // violeta: no se confunde con el semáforo (rojo, amarillo y verde) ni con el azul de la interfaz
const CAPA = 'zk-manual-marcas';
// ROLES DEL SISTEMA (MISMAS SIGLAS QUE EL HUB). El manual asume que el usuario ya está dentro de la sección: no explica cómo entrar
const ROLES = {
  ADM: { nombre: 'Administrador' },
  TUT: { nombre: 'Tutor',
    rolMoodle: 4 }, // "Profesor sin permiso de edición": el sistema lo detecta como TUT
  PAR: { nombre: 'Asesor par',
    rolMoodle: 4, // mismos permisos de Moodle que el tutor (Req 11)
    grupo: 'Zhakyz_AsesorPar' }, // el rol PAR sale del grupo: la respuesta del servicio de grupos se arma en el navegador
  EST: { nombre: 'Estudiante',
    rolMoodle: 5 }, // "Cambiar rol a… Estudiante" de Moodle: con la cuenta del equipo, la vista queda igual a la de un estudiante real
};
// DATOS FICTICIOS QUE REEMPLAZAN A LOS DE LA CUENTA EN TODAS LAS IMÁGENES (NOMBRE, APELLIDO, DNI Y CORREO)
const FICTICIO = { nombre: 'Lucía', apellido: 'Gómez', dni: '40123456', correo: 'lucia.gomez@ejemplo.com', id: '1234' };
// DATOS DE LA CUENTA QUE SE DESENFOCAN EN LAS CAPTURAS (NOMBRE Y FOTO DEL USUARIO EN LA BARRA DE MOODLE)
const OCULTAR = ['.usermenu .usertext', '.usermenu .userpicture', '.usermenu .avatar', '#usernavigation .usertext',
  '.userbutton', '.logininfo', '.popover-region-notifications', '.popover-region-messages',
  'img[src*="/user/icon/"]', 'img.userpicture']; // fotos de perfil del campus

// ---------------------------------------------------------
// ARGUMENTOS
// ---------------------------------------------------------
function leerArgs() {
  const a = process.argv.slice(2);
  const val = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  const rol = String(val('--rol') || '').toUpperCase();
  if (!ROLES[rol]) salir('Falta --rol (' + Object.keys(ROLES).join(', ') + ').');
  if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE.');
  return { rol, guion: val('--guion'), salida: val('--salida'), ancho: Number(val('--ancho') || 1280), alto: Number(val('--alto') || 2000), visible: a.includes('--visible') };
}

// SERVICIOS AJAX DE MOODLE QUE SOLO LEEN. El resumen de Zhakyz detecta el rol con core_group_get_course_user_groups:
// sin él, el Hub no muestra ninguna tarjeta. Pasa solo si TODOS los métodos del pedido están en la lista.
const SERVICIOS_LECTURA = new Set(['core_group_get_course_user_groups', 'core_courseformat_get_state']);
function soloLectura(cuerpo) {
  try {
    const llamadas = JSON.parse(cuerpo || '[]');
    return Array.isArray(llamadas) && llamadas.length > 0 && llamadas.every((l) => SERVICIOS_LECTURA.has(l.methodname));
  } catch (e) { return false; }
}

// ---------------------------------------------------------
// DATOS FICTICIOS (SE EJECUTA DENTRO DE LA PÁGINA): reemplaza en textos y campos los datos reales de la cuenta,
// sin importar mayúsculas ni tildes, y respeta las mayúsculas del original
// ---------------------------------------------------------
function anonimizar(pares) {
  const sinTildes = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const patron = (t) => sinTildes(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/a/gi, '[aáà]').replace(/e/gi, '[eéè]').replace(/i/gi, '[iíì]').replace(/o/gi, '[oóò]').replace(/u/gi, '[uúùü]').replace(/n/gi, '[nñ]');
  // entero = true: solo como palabra completa y con las mismas mayúsculas (iniciales, id de usuario)
  const reglas = pares.filter((p) => p[0]).map(([real, ficticio, entero]) =>
    [entero ? new RegExp(`(^|[^\\wÀ-ÿ])${patron(real)}(?![\\wÀ-ÿ])`, 'g') : new RegExp(patron(real), 'gi'), ficticio, entero]);
  const cambiar = (t) => reglas.reduce((acc, [re, f, entero]) => acc.replace(re, (m, previo) =>
    (entero ? previo + f : (m === m.toUpperCase() ? f.toUpperCase() : f))), t);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) { const n = w.currentNode; const v = cambiar(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  document.querySelectorAll('input, textarea').forEach((el) => { const v = cambiar(el.value || ''); if (v !== el.value) el.value = v; });
}

function salir(msg) { console.error('ERROR: ' + msg); process.exit(1); }

// ---------------------------------------------------------
// ACCIONES DE UN PASO
// ---------------------------------------------------------
async function hacer(page, acciones = []) {
  for (const ac of acciones) {
    if (ac.ir) await page.goto(BASE + ac.ir, { waitUntil: 'networkidle', timeout: 120000 });
    else if (ac.esperar) await page.waitForSelector(ac.esperar, { state: 'visible', timeout: 90000 });
    else if (ac.clic && ac.navega) await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle', timeout: 120000 }), page.click(ac.clic)]);
    else if (ac.clic) await page.click(ac.clic);
    else if (ac.escribir) await page.fill(ac.escribir, ac.valor);
    else if (ac.elegir) await page.selectOption(ac.elegir, ac.valor);
    else if (ac.pausa) await page.waitForTimeout(ac.pausa);
    // OCULTAR UN ELEMENTO QUE CONFUNDE EN EL MANUAL (por ejemplo, una etiqueta de rol que la pantalla no detecta)
    else if (ac.ocultar) await page.addStyleTag({ content: ac.ocultar + '{ visibility: hidden !important; }' });
    // VENTANA MÁS ALTA: para pantallas largas (el tema no dibuja lo que queda fuera de la ventana)
    else if (ac.ventana) { await page.setViewportSize({ width: page.viewportSize().width, height: ac.ventana }); await page.waitForTimeout(800); }
    else throw new Error('Acción desconocida: ' + JSON.stringify(ac));
  }
}

// ---------------------------------------------------------
// RECORTE DE LA CAPTURA (EN COORDENADAS DE LA PÁGINA)
//   recorte: 'ventana'                          → lo que se ve en la ventana
//   recorte: { selector, alrededor }            → el ancho del selector; en alto, las marcas más <alrededor> px arriba y abajo
//   recorte: { selector, alto, desde }          → el ancho del selector, desde su borde (o el de "desde") hasta <alto> px
//                                                 como máximo (estricto: una marca más alta queda cortada)
// ---------------------------------------------------------
async function calcularRecorte(page, recorte, abarca) {
  if (!recorte || recorte === 'ventana') return null;
  const caja = await page.evaluate(({ sel, desde }) => {
    const r = (s) => { const e = s && document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; };
    return { el: r(sel), desde: r(desde), anchoDoc: document.documentElement.scrollWidth, altoDoc: document.documentElement.scrollHeight };
  }, { sel: recorte.selector, desde: recorte.desde });
  if (!caja.el) throw new Error('No se encontró el recorte ' + recorte.selector);
  const pad = 16;
  let x; let y; let x2; let y2;
  // En ancho, el borde justo (así no entra el fondo del tema), pero siempre con los números de las marcas adentro
  x = caja.el.x - 2; x2 = caja.el.x + caja.el.w + 2;
  if (abarca) { x = Math.min(x, abarca.x - 18); x2 = Math.max(x2, abarca.x2 + 4); }
  if (recorte.alrededor && abarca) {
    y = abarca.y - recorte.alrededor; y2 = abarca.y2 + recorte.alrededor;
  } else {
    y = (caja.desde || caja.el).y - pad;
    y2 = Math.min(caja.el.y + caja.el.h + pad, y + (recorte.alto || Infinity));
  }
  x = Math.max(0, x); y = Math.max(0, y);
  x2 = Math.min(caja.anchoDoc, x2); y2 = Math.min(caja.altoDoc, y2);
  return { x, y, width: x2 - x, height: y2 - y };
}

// ---------------------------------------------------------
// PRINCIPAL
// ---------------------------------------------------------
(async () => {
  const args = leerArgs();
  const dirGuiones = path.join(__dirname, 'guiones');
  const guiones = fs.readdirSync(dirGuiones).filter((f) => f.endsWith('.js'))
    .map((f) => require(path.join(dirGuiones, f))(CONFIG))
    .filter((g) => g.roles.includes(args.rol) && (!args.guion || g.id === args.guion))
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  // UN PASO PUEDE SER SOLO DE ALGUNOS ROLES (paso.roles): en el manual de los demás no aparece
  guiones.forEach((g) => { g.pasos = g.pasos.filter((p) => !p.roles || p.roles.includes(args.rol)); });
  if (!guiones.length) salir(`No hay guiones para el rol ${args.rol}${args.guion ? ' con id ' + args.guion : ''}.`);
  const rol = ROLES[args.rol];
  const salida = path.resolve(RAIZ, args.salida || path.join('docs', 'manuales', args.rol.toLowerCase()));
  fs.mkdirSync(salida, { recursive: true });
  const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-'));
  fs.mkdirSync(path.join(temporal, 'imagenes'));

  const browser = await chromium.launch({ headless: !args.visible });
  // VENTANA ALTA: el tema de Moodle no dibuja lo que queda fuera de la ventana, así que una captura de página
  // completa sale vacía abajo. Con 2000 px de alto, cada pantalla queda dibujada entera antes de la captura.
  const ctx = await browser.newContext({ viewport: { width: args.ancho, height: args.alto }, deviceScaleFactor: 2, locale: 'es-AR' });

  // GUARDIA DE RED: SOLO LECTURA (GET), SALVO EL POST DEL LOGIN
  let fase = 'login';
  const bloqueadas = [];
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    // FOTOS DE PERFIL DEL CAMPUS: no se descargan, así las pantallas muestran las iniciales en su lugar
    if (/\/user\/pix\.php\/|\/user\/icon\//.test(url)) return route.abort();
    // "Cambiar rol a…" (solo el del manual, o volver al propio): cambia la vista de esta sesión, no escribe datos
    if (req.method() === 'GET' && /^[^?]*\/course\/switchrole\.php\?/.test(url) && new RegExp(`[?&]id=${CONFIG.curso}(&|$)`).test(url) &&
      new RegExp(`[?&]switchrole=(0|${rol.rolMoodle || 'x'})(&|$)`).test(url)) return route.continue();
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on|logout/i.test(url)) return route.continue();
    if (fase === 'login' && req.method() === 'POST' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (req.method() === 'POST' && url.startsWith(`${BASE}/lib/ajax/service.php`) && soloLectura(req.postData())) {
      // ROL POR GRUPO (PAR): se contesta en el navegador que la cuenta está en el grupo del rol. No llega a Moodle
      const llamadas = JSON.parse(req.postData());
      if (rol.grupo && llamadas.length === 1 && llamadas[0].methodname === 'core_group_get_course_user_groups') {
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify([{ error: false, data: { warnings: [],
          groups: [{ id: CONFIG.grupos.asesor_par, name: rol.grupo, description: '', descriptionformat: 1, idnumber: '' }] } }]) });
      }
      return route.continue();
    }
    bloqueadas.push(`${req.method()} ${url.split('?')[0]}`);
    return route.abort();
  });

  const page = await ctx.newPage();
  const avisos = [];
  const errores = [];
  page.on('pageerror', (e) => e.message && errores.push(e.message));

  // LOGIN (EL CAMPUS A VECES TARDA: UN REINTENTO)
  for (let intento = 1; ; intento++) {
    try {
      await page.goto(`${BASE}/login/index.php`, { timeout: 90000 });
      await page.fill('#username', process.env.MOODLE_USUARIO);
      await page.fill('#password', process.env.MOODLE_CLAVE);
      await Promise.all([page.waitForNavigation({ timeout: 90000 }), page.click('#loginbtn')]);
      break;
    } catch (e) {
      if (intento >= 2) salir('No se pudo iniciar sesión: ' + e.message);
      console.log('Login lento, reintentando...');
    }
  }
  fase = 'lectura';
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión (usuario o clave).');
  // DATOS REALES DE LA CUENTA (PARA REEMPLAZARLOS POR LOS FICTICIOS) Y CAMBIO DE ROL
  await page.goto(`${BASE}/user/edit.php`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const inicial = (t) => (t || '').trim().charAt(0).toUpperCase();
  const cuenta = await page.evaluate(() => ({
    id: String(M.cfg.userId || ''),
    nombre: (document.querySelector('#id_firstname') || {}).value || '',
    apellido: (document.querySelector('#id_lastname') || {}).value || '',
    correo: (document.querySelector('#id_email') || {}).value || '',
  }));
  const pares = [
    [`${cuenta.nombre} ${cuenta.apellido}`, `${FICTICIO.nombre} ${FICTICIO.apellido}`],
    [`${cuenta.apellido} ${cuenta.nombre}`, `${FICTICIO.apellido} ${FICTICIO.nombre}`],
    [cuenta.correo, FICTICIO.correo], [process.env.MOODLE_USUARIO, FICTICIO.dni],
    [cuenta.apellido, FICTICIO.apellido], [cuenta.nombre, FICTICIO.nombre],
    [inicial(cuenta.nombre) + inicial(cuenta.apellido), inicial(FICTICIO.nombre) + inicial(FICTICIO.apellido), true],
    [cuenta.id, FICTICIO.id, true],
  ];
  if (!cuenta.nombre) avisos.push('No se pudieron leer los datos de la cuenta: revisar a mano que no aparezcan en las imágenes.');
  const sesskey = await page.evaluate(() => M.cfg.sesskey);
  const cambiarRol = (id) => page.goto(`${BASE}/course/switchrole.php?id=${CONFIG.curso}&switchrole=${id}&sesskey=${sesskey}` +
    `&returnurl=${encodeURIComponent('/course/view.php?id=' + CONFIG.curso)}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  if (rol.rolMoodle) {
    await cambiarRol(rol.rolMoodle);
    if (!(await page.evaluate(() => document.body.classList.contains('userswitchedrole')))) salir('No se pudo cambiar el rol en Moodle.');
    console.log('Rol de Moodle cambiado (solo en esta sesión).');
  }
  console.log(`Sesión iniciada. Manual: ${rol.nombre} (${guiones.length} funcionalidades)`);

  // FUNCIONALIDADES Y PASOS
  const funcionalidades = [];
  for (const guion of guiones) {
  console.log(guion.titulo);
  const imagenes = [];
  funcionalidades.push({ guion, imagenes });
  for (const [i, paso] of guion.pasos.entries()) {
    const n = String(i + 1).padStart(2, '0');
    await hacer(page, paso.acciones);
    await page.addStyleTag({ content: OCULTAR.join(',') + '{ filter: blur(7px) !important; }' }).catch(() => {});
    await page.evaluate(anonimizar, pares);
    const { faltan, abarca } = await page.evaluate(senalar, { marcas: paso.marcas, color: COLOR, capa: CAPA });
    if (faltan.length) avisos.push(`${guion.id}, paso ${i + 1}: no se encontró ${faltan.join(', ')}`);
    const clip = await calcularRecorte(page, paso.recorte, abarca);
    const archivo = `imagenes/${guion.id}-${n}.png`;
    await page.screenshot({ path: path.join(temporal, archivo), ...(clip ? { clip, fullPage: true } : {}) });
    imagenes.push({ archivo, ancho: clip ? clip.width : args.ancho, alto: clip ? clip.height : args.alto });
    console.log(`  ${n}. ${paso.titulo}${faltan.length ? '  (FALTAN MARCAS)' : ''}`);
    await page.evaluate((capa) => { const c = document.getElementById(capa); if (c) c.remove(); }, CAPA);
    await hacer(page, paso.despues);
  }
  }

  if (rol.rolMoodle) await cambiarRol(0).catch(() => {}); // vuelve al rol propio

  // MANUAL: MARKDOWN (SOLO TEXTO) + PDF (DESDE UN HTML TEMPORAL)
  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const md = path.join(salida, `manual-${args.rol.toLowerCase()}.md`);
  fs.writeFileSync(md, armarMd({ rol, funcionalidades, fecha }));
  const html = path.join(temporal, 'manual.html');
  fs.writeFileSync(html, armarHtml({ rol, funcionalidades, color: COLOR, fecha }));
  const pdfPage = await browser.newPage();
  await pdfPage.goto('file://' + html, { waitUntil: 'load' });
  const pdf = path.join(salida, `manual-${args.rol.toLowerCase()}.pdf`);
  await pdfPage.pdf({
    path: pdf, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:8px;color:#47536b;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">
      <span style="font-weight:700;letter-spacing:.08em">ZHAKYZ &amp; ASOCIADOS</span><span>Proyecto Travesía · Manual de usuario: ${rol.nombre}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
  });
  await browser.close();
  // EN LA CARPETA DEL ROL QUEDAN SOLO EL .md Y EL .pdf (SE BORRAN LAS IMÁGENES Y EL HTML DE VERSIONES ANTERIORES)
  fs.rmSync(path.join(salida, 'imagenes'), { recursive: true, force: true });
  fs.rmSync(path.join(salida, 'manual.html'), { force: true });
  if (process.env.MANUAL_CONSERVAR) console.log('Imágenes en ' + temporal); else fs.rmSync(temporal, { recursive: true, force: true });

  console.log(`\nMD:  ${path.relative(RAIZ, md)}`);
  console.log(`PDF: ${path.relative(RAIZ, pdf)}`);
  console.log(`Escrituras bloqueadas por la guardia: ${bloqueadas.length} (llamadas internas de Moodle; no afectan el manual)`);
  if (avisos.length) { console.log('\nAVISOS:'); avisos.forEach((a) => console.log('  - ' + a)); process.exitCode = 2; }
})().catch((e) => { console.error(e); process.exit(1); });
