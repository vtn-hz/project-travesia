// ---------------------------------------------------------
// MOVER ACTIVIDADES DE ZHAKYZ A UNA SUBSECCIÓN DE ZHAKYZ (LA CREA SI NO EXISTE)
// ---------------------------------------------------------
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/mover_actividades.js \
//     --subseccion "Pruebas" --cmids 59223,59441 [--confirmar]
//   Con --subseccion "Zhakyz" las actividades se mueven al FINAL de la sección principal (sirve para ordenar subsecciones).
//   --ocultar <id,id,...>: actividades (de las que se mueven) que se ocultan apenas se mueven. Moodle, al mover a una subsección
//   visible, puede volver a mostrar una actividad que estaba oculta por su subsección: así no queda expuesta.
const { chromium } = require('playwright');

const CONFIG = require('./config').cargar();

const BASE = CONFIG.campus;
const CURSO = String(CONFIG.curso);
const SECCION_ID = String(CONFIG.seccion.id);
const SECCION_NOMBRE = CONFIG.seccion.nombre;

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

const argv = process.argv.slice(2);
const arg = (n) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : null);
const nombreSub = arg('--subseccion');
const cmids = (arg('--cmids') || '').split(',').map((s) => s.trim()).filter(Boolean);
const confirmar = argv.includes('--confirmar');
const ocultar = (arg('--ocultar') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (ocultar.some((c) => !cmids.includes(c))) salir('--ocultar solo acepta actividades de --cmids.');
if (!nombreSub || !cmids.length || cmids.some((c) => !/^\d+$/.test(c))) salir('Uso: --subseccion "<nombre>" --cmids <id,id,...> [--confirmar]');
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const estado = { fase: 'login', seccionNum: null, destino: null };
  const escrituras = [];

  // GUARDIA DE RED
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const cuerpo = req.postData() || '';
    if (req.method() === 'GET' && !/sesskey=|delete|togglecompletion|[?&]edit=on/i.test(url)) return route.continue();
    // Moodle carga plantillas y textos por AJAX: solo se permiten llamadas de lectura conocidas
    if (url.startsWith(`${BASE}/lib/ajax/service`) && /^\[?\{?.*"methodname":"(core_output_load_template_with_dependencies|core_get_string|core_get_strings|core_output_load_fontawesome_icon_system_map|core_courseformat_get_state)"/.test(cuerpo) && !/update_course/.test(cuerpo)) return route.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura') {
      const campo = (n, v) => new RegExp(`name="${n}"\\r\\n\\r\\n${v}\\r\\n|(^|&)${n}=${v}(&|$)`).test(cuerpo);
      const subseccion = url === `${BASE}/course/modedit.php` && campo('course', CURSO) && campo('add', 'subsection') && campo('section', estado.seccionNum);
      let mover = false, esconder = false;
      if (url.startsWith(`${BASE}/lib/ajax/service.php`)) {
        try {
          const llamadas = JSON.parse(cuerpo);
          const a = llamadas.length === 1 && llamadas[0].methodname === 'core_courseformat_update_course' && String(llamadas[0].args.courseid) === CURSO ? llamadas[0].args : null;
          mover = !!a && a.action === 'cm_move' && String(a.targetsectionid) === String(estado.destino) && a.ids.every((i) => cmids.includes(String(i)));
          esconder = !!a && a.action === 'cm_hide' && a.ids.every((i) => ocultar.includes(String(i)));
        } catch (e) { mover = false; esconder = false; }
      }
      if (subseccion || mover || esconder) { escrituras.push(subseccion ? 'crear subsección' : mover ? 'mover actividades' : 'ocultar actividades'); return route.continue(); }
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

  // ESTRUCTURA DE ZHAKYZ
  async function leerZhakyz() {
    await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`, { waitUntil: 'networkidle' });
    return page.evaluate((id) => {
      const raiz = document.querySelector(`li.section[data-id="${id}"]`);
      if (!raiz) return null;
      // Visibilidad tal como la muestra el curso: clase "hidden" y texto de restricciones de acceso (si los hay)
      const subs = [...raiz.querySelectorAll('li.section.delegated-section[data-id]')]
        .map((s) => {
          const info = s.querySelector('[data-for="sectioninfo"] .availabilityinfo, .section_availability .availabilityinfo');
          const insignias = [...s.querySelectorAll('[data-for="sectionbadges"] .badge, .section-header .badge')].map((b) => b.innerText.trim()).filter(Boolean);
          return {
            id: s.getAttribute('data-id'), nombre: s.getAttribute('data-sectionname'),
            oculta: s.classList.contains('hidden'),
            restriccion: info ? info.innerText.replace(/\s+/g, ' ').trim() : '',
            insignias: insignias.join(', ')
          };
        });
      const cms = [...raiz.querySelectorAll('[data-for="cmitem"][data-id]')].map((c) => ({
        id: c.getAttribute('data-id'),
        nombre: ((c.querySelector('.instancename, .activityname') || c).innerText || '').split('\n')[0].trim(),
        seccion: c.closest('li.section').getAttribute('data-id'),
        oculta: /Ocultado a los estudiantes|Hidden from students/.test(c.innerText || '')
      }));
      return { numero: raiz.getAttribute('data-number'), nombre: raiz.getAttribute('data-sectionname'), subs, cms };
    }, SECCION_ID);
  }

  let z = await leerZhakyz();
  if (!z || z.nombre !== SECCION_NOMBRE) salir(`La sección ${SECCION_ID} no es "${SECCION_NOMBRE}".`);
  estado.seccionNum = z.numero;
  const aMover = cmids.map((id) => z.cms.find((c) => c.id === id));
  if (aMover.some((c) => !c)) salir(`Alguna actividad no está dentro de Zhakyz: ${cmids.filter((id) => !z.cms.some((c) => c.id === id)).join(', ')}. No se mueve nada.`);
  let sub = nombreSub === SECCION_NOMBRE ? { id: SECCION_ID, nombre: SECCION_NOMBRE } : z.subs.find((s) => s.nombre === nombreSub);

  console.log('──────────────── MOVER ACTIVIDADES ────────────────');
  console.log(`Destino : sección ${SECCION_NOMBRE} (id ${SECCION_ID}) → subsección "${nombreSub}" ${sub ? `(existe, id ${sub.id})` : '(SE CREA)'}`);
  aMover.forEach((c) => console.log(`Mueve   : ${c.nombre} (cm ${c.id}, hoy en sección ${c.seccion})`));
  // Una actividad hereda la visibilidad de su subsección: comparar origen y destino antes de confirmar
  const verVis = (s) => (s ? `${s.oculta ? 'OCULTA' : 'visible'}${s.restriccion ? ` · restricción: ${s.restriccion}` : ''}${s.insignias ? ` · ${s.insignias}` : ''}` : 'no es una subsección');
  [...new Set(aMover.map((c) => c.seccion))].forEach((id) => console.log(`Origen  : sección ${id} → ${verVis(z.subs.find((s) => s.id === id))}`));
  console.log(`Destino : ${sub ? verVis(sub) : '(se crea, visible)'}`);
  if (ocultar.length) console.log(`Ocultar : ${ocultar.join(', ')} (apenas se muevan)`);
  if (!confirmar) {
    console.log('\nSIMULACIÓN: no se escribió nada. Para aplicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    await browser.close();
    return;
  }

  // CREAR LA SUBSECCIÓN SI HACE FALTA
  if (!sub) {
    await page.goto(`${BASE}/course/modedit.php?add=subsection&type=&course=${CURSO}&section=${estado.seccionNum}&return=0&sr=0`, { waitUntil: 'networkidle' });
    estado.fase = 'escritura';
    const r = await page.evaluate(async (nombre) => {
      const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name="_qf__mod_subsection_mod_form"]'));
      const fd = new FormData(f);
      fd.set('name', nombre);
      ['cancel', 'submitbutton', 'coursecontentnotification', 'id'].forEach((k) => fd.delete(k));
      fd.set('submitbutton2', 'Guardar cambios y regresar al curso');
      const resp = await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' });
      return resp.status;
    }, nombreSub);
    estado.fase = 'lectura';
    if (r !== 200) salir(`No se pudo crear la subsección (HTTP ${r}).`);
    z = await leerZhakyz();
    sub = z.subs.find((s) => s.nombre === nombreSub);
    if (!sub) salir('Se envió la subsección pero no aparece dentro de Zhakyz.');
    console.log(`✔ Subsección "${nombreSub}" creada (sección ${sub.id})`);
  }

  // MOVER (UNA SOLA LLAMADA AL SERVICIO DE MOODLE)
  estado.destino = sub.id;
  estado.fase = 'escritura';
  const r = await page.evaluate(async ({ ids, destino, curso }) => {
    const resp = await fetch(`${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=core_courseformat_update_course`, {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ index: 0, methodname: 'core_courseformat_update_course', args: { action: 'cm_move', courseid: Number(curso), ids: ids.map(Number), targetsectionid: Number(destino) } }])
    });
    return resp.json();
  }, { ids: cmids, destino: sub.id, curso: CURSO });
  if (!Array.isArray(r) || r[0].error) { estado.fase = 'lectura'; salir(`Moodle rechazó el movimiento: ${JSON.stringify(r).slice(0, 300)}`); }

  // OCULTAR ENSEGUIDA LAS QUE TIENEN QUE QUEDAR OCULTAS
  if (ocultar.length) {
    const h = await page.evaluate(async ({ ids, curso }) => {
      const resp = await fetch(`${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=core_courseformat_update_course`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ index: 0, methodname: 'core_courseformat_update_course', args: { action: 'cm_hide', courseid: Number(curso), ids: ids.map(Number) } }])
      });
      return resp.json();
    }, { ids: ocultar, curso: CURSO });
    if (!Array.isArray(h) || h[0].error) console.error(`⚠ Moodle rechazó ocultar ${ocultar.join(', ')}: ${JSON.stringify(h).slice(0, 300)}. OCULTARLAS A MANO YA.`);
  }
  estado.fase = 'lectura';

  // VERIFICAR
  z = await leerZhakyz();
  const mal = cmids.filter((id) => (z.cms.find((c) => c.id === id) || {}).seccion !== sub.id);
  console.log(`\n${mal.length ? '⚠ No se movieron: ' + mal.join(', ') : `✔ Las ${cmids.length} actividades están en "${nombreSub}"`}`);
  cmids.forEach((id) => { const c = z.cms.find((x) => x.id === id) || {}; console.log(`  ${c.nombre || id} (cm ${id}): ${c.oculta ? 'OCULTA' : 'visible'}`); });
  const expuestas = ocultar.filter((id) => !(z.cms.find((c) => c.id === id) || {}).oculta);
  if (expuestas.length) console.error(`⚠ Siguen visibles y tenían que quedar ocultas: ${expuestas.join(', ')}`);
  console.log(`Escrituras : ${escrituras.join(' · ')}`);
  console.log(`Fila para RULES.md: | Subsección "${nombreSub}" (sección ${sub.id}) con: ${aMover.map((c) => c.nombre).join(', ')} | — (contenido creado por el equipo directamente en Moodle) |`);
  await browser.close();
})().catch((e) => salir(e.message));
