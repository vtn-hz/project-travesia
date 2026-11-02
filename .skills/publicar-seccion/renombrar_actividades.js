// ---------------------------------------------------------
// RENOMBRAR ACTIVIDADES DE ZHAKYZ (SOLO EL NOMBRE VISIBLE)
// ---------------------------------------------------------
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/renombrar_actividades.js \
//     --renombrar "59521=CargaParcialesPrimero,59522=CargaMateriasPrimero" [--confirmar]
// Cambia solo el nombre, con la misma llamada que el lápiz del curso (core_update_inplace_editable, activityname).
// El cmid, el dataid, la configuración, los permisos, las plantillas y las entradas no cambian, así que no se desvincula
// nada de lo que usa ids (Tools, páginas, plantillas JS). Solo acepta actividades que estén dentro de Zhakyz.
const { chromium } = require('playwright');
const CONFIG = require('./config').cargar();
const BASE = CONFIG.campus;
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

const argv = process.argv.slice(2);
const arg = (n) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : null);
const pares = (arg('--renombrar') || '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
  const i = s.indexOf('=');
  return { cmid: s.slice(0, i).trim(), nombre: s.slice(i + 1).trim() };
});
const confirmar = argv.includes('--confirmar');
if (!pares.length || pares.some((p) => !/^\d+$/.test(p.cmid) || !p.nombre)) salir('Uso: --renombrar "<cmid>=<nombre>,<cmid>=<nombre>" [--confirmar]');
if (new Set(pares.map((p) => p.cmid)).size !== pares.length) salir('Hay un cmid repetido.');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const estado = { fase: 'login' };
  const escrituras = [];

  // GUARDIA DE RED: lecturas, y en la fase de escritura solo el renombre de los cmid pedidos
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    if (url.startsWith(`${BASE}/lib/ajax/service`) && /^\[?\{?.*"methodname":"(core_output_load_template_with_dependencies|core_get_string|core_get_strings|core_output_load_fontawesome_icon_system_map|core_courseformat_get_state)"/.test(cuerpo) && !/update_course|inplace_editable/.test(cuerpo)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura' && url.startsWith(`${BASE}/lib/ajax/service.php`)) {
      let ok = false;
      try {
        const llamadas = JSON.parse(cuerpo);
        ok = llamadas.length === 1 && llamadas[0].methodname === 'core_update_inplace_editable' &&
          llamadas[0].args.component === 'core_course' && llamadas[0].args.itemtype === 'activityname' &&
          pares.some((p) => String(llamadas[0].args.itemid) === p.cmid && llamadas[0].args.value === p.nombre);
      } catch (e) { ok = false; }
      if (ok) { escrituras.push('renombrar'); return route.continue(); }
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

  // ACTIVIDADES DE ZHAKYZ: cmid, nombre visible y sección
  async function leerZhakyz() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate((id) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      if (!raiz) return null;
      const cms = [...raiz.querySelectorAll('[data-for="cmitem"][data-id]')].map((c) => {
        const el = c.querySelector('[data-itemtype="activityname"][data-value]');
        const s = c.closest('li.section');
        return {
          id: c.getAttribute('data-id'),
          nombre: el ? el.getAttribute('data-value') : ((c.querySelector('.instancename, .activityname') || c).innerText || '').split('\n')[0].trim(),
          seccion: s ? s.getAttribute('data-sectionname') : ''
        };
      });
      return { nombre: raiz.getAttribute('data-sectionname'), cms };
    }, SECCION_ID);
  }

  let z = await leerZhakyz();
  if (!z || z.nombre !== SECCION_NOMBRE) salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}".`);
  const faltan = pares.filter((p) => !z.cms.some((c) => c.id === p.cmid));
  if (faltan.length) salir(`Alguna actividad no está dentro de Zhakyz: ${faltan.map((p) => p.cmid).join(', ')}. No se renombra nada.`);
  const choque = pares.find((p) => z.cms.some((c) => c.id !== p.cmid && c.nombre === p.nombre));
  if (choque) salir(`Ya hay otra actividad de Zhakyz llamada "${choque.nombre}". No se renombra nada.`);

  console.log('──────────────── RENOMBRAR ACTIVIDADES ────────────────');
  pares.forEach((p) => {
    const c = z.cms.find((x) => x.id === p.cmid);
    console.log(`cm ${p.cmid} (en "${c.seccion}"): "${c.nombre}" → "${p.nombre}"${c.nombre === p.nombre ? '  (ya tiene ese nombre)' : ''}`);
  });
  const pendientes = pares.filter((p) => z.cms.find((x) => x.id === p.cmid).nombre !== p.nombre);
  if (!confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para aplicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // RENOMBRAR (UNA LLAMADA POR ACTIVIDAD, COMO EL LÁPIZ DEL CURSO)
  for (const p of pendientes) {
    estado.fase = 'escritura';
    const r = await page.evaluate(async ({ cmid, nombre }) => {
      const resp = await fetch(`${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=core_update_inplace_editable`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ index: 0, methodname: 'core_update_inplace_editable', args: { component: 'core_course', itemtype: 'activityname', itemid: Number(cmid), value: nombre } }])
      });
      return resp.json();
    }, p);
    estado.fase = 'lectura';
    if (!Array.isArray(r) || r[0].error) salir(`Moodle rechazó el renombre de cm ${p.cmid}: ${JSON.stringify(r).slice(0, 300)}`);
  }

  // VERIFICAR
  z = await leerZhakyz();
  const mal = pares.filter((p) => (z.cms.find((c) => c.id === p.cmid) || {}).nombre !== p.nombre);
  console.log(`\n${mal.length ? '⚠ No quedaron con el nombre pedido: ' + mal.map((p) => p.cmid).join(', ') : `✔ Las ${pares.length} actividades tienen el nombre nuevo (mismo cmid)`}`);
  console.log(`Escrituras : ${escrituras.length ? escrituras.length + ' renombre(s)' : 'ninguna (ya tenían el nombre)'}`);
  await browser.close();
})().catch((e) => salir(e.message));
