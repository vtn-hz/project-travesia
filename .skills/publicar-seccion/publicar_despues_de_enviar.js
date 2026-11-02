// ---------------------------------------------------------
// GUARDAR "PÁGINA DESPUÉS DE ENVIAR" Y "URL PARA EL BOTÓN CONTINUAR" EN ENCUESTAS DE ZHAKYZ (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/publicar_despues_de_enviar.js \
//     --archivo section/encuestas_despues_de_enviar/content.html --cmids 59710,59712 \
//     --continuar '<campus>/course/section.php?id=<Zhakyz>#module-<paginas.vista_estudiante>' [--confirmar]
// Manda el formulario de configuración de cada encuesta (modedit.php) con el HTML del archivo en page_after_submit
// y la dirección en site_after_submit, sin abrir el editor (que puede quitar el script). Relee lo guardado.
const { chromium } = require('playwright');
const fs = require('fs');
const CONFIG = require('./config').cargar();
const BASE = CONFIG.campus, CURSO = String(CONFIG.curso), ZHAKYZ = String(CONFIG.seccion.id);
const a = process.argv.slice(2); const arg = (n) => a[a.indexOf(n) + 1];
const HTML = fs.readFileSync(arg('--archivo'), 'utf8'); const CMIDS = arg('--cmids').split(','); const CONT = arg('--continuar'); const CONFIRMAR = a.includes('--confirmar');
const salir = (m) => { console.log('✖ ' + m); process.exit(1); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage(); p.setDefaultTimeout(180000);
  const estado = { fase: 'login', cm: null }; const escrituras = [];
  await ctx.route('**/*', (r) => {
    const q = r.request(); const url = q.url(); const c = q.postData() || '';
    const campo = (n, v) => new RegExp(`name="${n.replace(/[[\]]/g, '\\$&')}"\\r\\n\\r\\n${v}\\r\\n|(^|&)${n}=${v}(&|$)`).test(c);
    if (q.method() === 'GET' && !/sesskey=|delete|[?&]edit=on/i.test(url)) return r.continue();
    if (estado.fase === 'login' && url.startsWith(`${BASE}/login/index.php`)) return r.continue();
    if (estado.fase === 'escritura' && url === `${BASE}/course/modedit.php` && campo('course', CURSO) && campo('update', estado.cm) && campo('modulename', 'feedback')) { escrituras.push('POST modedit.php update=' + estado.cm); return r.continue(); }
    return r.abort();
  });
  await p.goto(`${BASE}/login/index.php`, { waitUntil: 'domcontentloaded' }); // sin esperar "load": el login del campus puede tardar más de un minuto
  await p.fill('#username', process.env.MOODLE_USUARIO); await p.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded' }), p.click('#loginbtn')]);
  if (p.url().includes('/login/')) salir('No se pudo iniciar sesión.');
  estado.fase = 'lectura';
  await p.goto(`${BASE}/course/section.php?id=${ZHAKYZ}`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector(`li.section[data-id="${ZHAKYZ}"]`);
  const enZhakyz = await p.evaluate(({ z, cms }) => cms.filter((cm) => document.querySelector(`li.section[data-id="${z}"] [data-for="cmitem"][data-id="${cm}"]`)), { z: ZHAKYZ, cms: CMIDS });
  if (enZhakyz.length !== CMIDS.length) salir('Alguna encuesta no está dentro de Zhakyz: ' + CMIDS.filter((c) => !enZhakyz.includes(c)).join(', '));
  const leer = () => p.evaluate(() => { const m = document.querySelector('[name="modulename"]'); const f = m.form;
    return { course: f.querySelector('[name="course"]').value, modulename: m.value, name: f.querySelector('[name="name"]').value,
      texto: f.querySelector('[name="page_after_submit_editor[text]"]').value, url: f.querySelector('[name="site_after_submit"]').value }; });
  for (const cm of CMIDS) {
    await p.goto(`${BASE}/course/modedit.php?update=${cm}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(5000);
    const antes = await leer();
    if (antes.course !== CURSO || antes.modulename !== 'feedback') salir(`cm ${cm} no es una encuesta del curso.`);
    console.log(`"${antes.name}" (cm ${cm}): página después de enviar ${antes.texto.length} → ${HTML.length} caracteres · Continuar "${antes.url}" → "${CONT}"`);
    if (!CONFIRMAR) continue;
    estado.cm = cm; estado.fase = 'escritura';
    const st = await p.evaluate(async ({ html, cont }) => {
      const f = document.querySelector('[name="modulename"]').form; const fd = new FormData(f);
      fd.set('page_after_submit_editor[text]', html); fd.set('page_after_submit_editor[format]', '1'); fd.set('site_after_submit', cont);
      ['cancel', 'submitbutton', 'coursecontentnotification'].forEach((k) => fd.delete(k)); fd.set('submitbutton2', 'Guardar cambios y regresar al curso');
      const r = await fetch(f.action, { method: 'POST', body: fd, credentials: 'same-origin' }); return r.status + ' ' + r.url;
    }, { html: HTML, cont: CONT });
    estado.fase = 'lectura';
    await p.goto(`${BASE}/course/modedit.php?update=${cm}`, { waitUntil: 'domcontentloaded' });
    const d = await leer();
    const ok = d.texto.includes('data-zk-despues-de-enviar') && d.texto.includes('<script>') && d.texto.includes('SEGUNDOS = 5') && d.url === CONT && d.name === antes.name;
    console.log(`  respuesta ${st.replace(BASE, '')} → ${ok ? '✔ guardado y releído (script conservado)' : '✖ no quedó como se esperaba: ' + JSON.stringify({ largo: d.texto.length, script: d.texto.includes('<script>'), url: d.url })}`);
  }
  if (!CONFIRMAR) console.log('SIMULACIÓN: no se escribió nada.');
  console.log('Escrituras: ' + (escrituras.join(' · ') || 'ninguna'));
  await b.close();
})().catch((e) => salir(e.message.split('\n')[0]));
