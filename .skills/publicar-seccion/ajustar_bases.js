// ---------------------------------------------------------
// AJUSTAR LOS PERMISOS DE ACCESO DE LAS BASES DE ZHAKYZ (CAPA 1 DEL OCULTAMIENTO POR ROL)
// ---------------------------------------------------------
// Uso (por defecto SIMULA; solo escribe con --confirmar):
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/publicar-seccion/ajustar_bases.js \
//     [--claves criticidad,entrevistas] [--confirmar]
// Fuente: el bloque "ajustes_moodle" de cada data/moodle/BASE_*.json (el repo manda, Moodle es la copia). Sin --claves,
// toma todas las bases que lo tienen. Ajustes que entiende (los demás campos del formulario no se tocan):
//   approval (0|1) · manageapproved (0|1) · requiredentriestoview (0..50) · visible (0|1)
//   solo_lectura: { desde: "AAAA-MM-DD", hasta: "AAAA-MM-DD" } | null  → "Solo lectura desde / hasta" (timeviewfrom / timeviewto)
// Documentación: docs/specs/ocultamiento-por-rol.md. Solo escribe en actividades de la sección Zhakyz, con el formulario
// de ajustes de la actividad (course/modedit.php), y vuelve a leer lo guardado.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { RAIZ, cargar } = require('./config');
const CONFIG = cargar();
const BASE = CONFIG.campus;
const CURSO = String(CONFIG.curso);
const SECCION_ID = String(CONFIG.seccion.id);

function salir(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

const argv = process.argv.slice(2);
const arg = (n) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : null);
const confirmar = argv.includes('--confirmar');
const pedidas = (arg('--claves') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!process.env.MOODLE_USUARIO || !process.env.MOODLE_CLAVE) salir('Faltan MOODLE_USUARIO y MOODLE_CLAVE en el entorno.');

// ---------------------------------------------------------
// AJUSTES DESEADOS DESDE EL REPO
// ---------------------------------------------------------
const objetivos = Object.entries(CONFIG.bases).map(([clave, b]) => {
  const def = JSON.parse(fs.readFileSync(path.join(RAIZ, b.definicion), 'utf8'));
  return { clave, cmid: String(b.cmid), nombre: def.nombre, ajustes: def.ajustes_moodle || null, archivo: b.definicion };
}).filter((o) => o.ajustes && (!pedidas.length || pedidas.includes(o.clave)));
pedidas.forEach((c) => { if (!objetivos.some((o) => o.clave === c)) salir(`La base "${c}" no existe o no tiene "ajustes_moodle" en su definición.`); });
if (!objetivos.length) salir('Ninguna base tiene "ajustes_moodle".');

const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
objetivos.forEach((o) => {
  const a = o.ajustes;
  if ('requiredentriestoview' in a && !(Number.isInteger(a.requiredentriestoview) && a.requiredentriestoview >= 0 && a.requiredentriestoview <= 50)) salir(`${o.clave}: requiredentriestoview debe ser un entero de 0 a 50.`);
  if (a.solo_lectura && (!FECHA.test(a.solo_lectura.desde || '') || !FECHA.test(a.solo_lectura.hasta || '') || a.solo_lectura.desde >= a.solo_lectura.hasta)) salir(`${o.clave}: solo_lectura necesita desde < hasta, en formato AAAA-MM-DD.`);
});

// VALORES COMPARABLES (texto) DE LO DESEADO
function deseado(a) {
  const d = {};
  ['approval', 'manageapproved', 'requiredentriestoview', 'visible'].forEach((k) => { if (k in a) d[k] = String(a[k]); });
  if ('solo_lectura' in a) {
    d.timeviewfrom = a.solo_lectura ? a.solo_lectura.desde + ' 00:00' : null;
    d.timeviewto = a.solo_lectura ? a.solo_lectura.hasta + ' 00:00' : null;
  }
  return d;
}

// LECTURA DEL FORMULARIO DE AJUSTES (EN EL NAVEGADOR)
function leerFormulario() {
  const f = [...document.querySelectorAll('form')].find((x) => x.querySelector('[name=modulename]'));
  if (!f) return { error: 'No se encontró el formulario de ajustes (' + document.title + ').' };
  const v = (n) => { const e = f.querySelector(`[name="${n}"]`); return e ? e.value : undefined; };
  const dos = (x) => String(x).padStart(2, '0');
  const fecha = (p) => {
    const e = f.querySelector(`[name="${p}[enabled]"]`);
    if (!e || !e.checked) return null;
    return `${v(p + '[year]')}-${dos(v(p + '[month]'))}-${dos(v(p + '[day]'))} ${dos(v(p + '[hour]'))}:${dos(v(p + '[minute]'))}`;
  };
  return {
    modulename: v('modulename'), course: v('course'), update: v('update'), nombre: v('name'),
    approval: v('approval'), manageapproved: v('manageapproved'), requiredentriestoview: v('requiredentriestoview'), visible: v('visible'),
    timeviewfrom: fecha('timeviewfrom'), timeviewto: fecha('timeviewto'),
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const estado = { fase: 'login', cmid: null };
  const escrituras = [];
  const bloqueadas = [];

  // GUARDIA DE RED: solo GET (sin sesskey); el login; y en la fase de escritura, solo el POST del formulario de ajustes del cmid en curso
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (req.method() === 'GET' && !/sesskey=|logout|delete|[?&]edit=on/i.test(url)) return route.continue();
    if (estado.fase === 'login' && req.method() === 'POST' && url.startsWith(`${BASE}/login/index.php`)) return route.continue();
    if (estado.fase === 'escritura' && req.method() === 'POST' && url.split('?')[0] === `${BASE}/course/modedit.php`) {
      const p = new URLSearchParams(req.postData() || '');
      if (p.get('update') === estado.cmid && p.get('course') === CURSO && p.get('modulename') === 'data') {
        escrituras.push(estado.cmid);
        return route.continue();
      }
    }
    bloqueadas.push(`${req.method()} ${url.split('?')[0]}`);
    return route.abort();
  });

  // LOGIN
  await page.goto(`${BASE}/login/index.php`);
  await page.fill('#username', process.env.MOODLE_USUARIO);
  await page.fill('#password', process.env.MOODLE_CLAVE);
  await Promise.all([page.waitForNavigation(), page.click('#loginbtn')]);
  if (page.url().includes('/login/')) salir('No se pudo iniciar sesión.');
  estado.fase = 'lectura';

  // ACTIVIDADES DE LA SECCIÓN ZHAKYZ (incluye las de sus subsecciones)
  await page.goto(`${BASE}/course/section.php?id=${SECCION_ID}`);
  const enZhakyz = new Set(await page.evaluate(() => [...document.querySelectorAll('li.activity')].map((li) => li.id.replace('module-', ''))));
  if (!enZhakyz.size) salir('No se pudo leer la sección Zhakyz.');

  const resumen = [];
  for (const o of objetivos) {
    if (!enZhakyz.has(o.cmid)) salir(`${o.clave}: el cmid ${o.cmid} no está en la sección Zhakyz. No se toca.`);
    await page.goto(`${BASE}/course/modedit.php?update=${o.cmid}`);
    const antes = await page.evaluate(leerFormulario);
    if (antes.error) salir(`${o.clave}: ${antes.error}`);
    if (antes.modulename !== 'data' || antes.course !== CURSO || antes.update !== o.cmid) salir(`${o.clave}: el formulario no es el de la base ${o.cmid} del curso ${CURSO}.`);
    if (antes.nombre !== o.nombre) salir(`${o.clave}: en Moodle se llama "${antes.nombre}" y en ${o.archivo} "${o.nombre}".`);
    const quiero = deseado(o.ajustes);
    const cambios = Object.keys(quiero).filter((k) => String(antes[k]) !== String(quiero[k])).map((k) => ({ campo: k, antes: antes[k], despues: quiero[k] }));
    console.log(`\n■ ${o.nombre} (cmid ${o.cmid})`);
    if (!cambios.length) console.log('  sin cambios: ya coincide con el repo');
    cambios.forEach((c) => console.log(`  ${c.campo}: ${c.antes} → ${c.despues}`));
    const fila = { clave: o.clave, cmid: o.cmid, cambios: cambios.length, resultado: cambios.length ? 'simulado' : 'igual' };
    resumen.push(fila);
    if (!confirmar || !cambios.length) continue;

    // ESCRITURA: se cambian solo los controles pedidos y se guarda con el botón del formulario.
    // Los bloques colapsados (Disponibilidad, Entradas) se abren antes, para que los controles reciban eventos reales
    // (Moodle habilita los selectores de fecha recién cuando se marca su casillero)
    await page.evaluate(() => document.querySelectorAll('form fieldset.collapsible .fcontainer.collapse:not(.show), form fieldset .collapse:not(.show)').forEach((c) => c.classList.add('show')));
    for (const c of cambios) {
      if (c.campo === 'timeviewfrom' || c.campo === 'timeviewto') {
        // El casillero "Habilitar" se marca con un click nativo: dispara los eventos con los que Moodle habilita los selectores
        const marcar = (nombre, valor) => page.evaluate(([n, v]) => { const e = document.querySelector(`[name="${n}"]`); if (e.checked !== v) e.click(); return e.checked; }, [nombre, valor]);
        if (c.despues === null) { await marcar(`${c.campo}[enabled]`, false); continue; }
        if (!(await marcar(`${c.campo}[enabled]`, true))) throw new Error(`No se pudo habilitar ${c.campo}.`);
        const [, y, m, d] = c.despues.slice(0, 10).match(FECHA);
        await page.selectOption(`[name="${c.campo}[year]"]`, String(Number(y)));
        await page.selectOption(`[name="${c.campo}[month]"]`, String(Number(m)));
        await page.selectOption(`[name="${c.campo}[day]"]`, String(Number(d)));
        await page.selectOption(`[name="${c.campo}[hour]"]`, '0');
        await page.selectOption(`[name="${c.campo}[minute]"]`, '0');
      } else {
        await page.selectOption(`[name="${c.campo}"]`, String(c.despues));
      }
    }
    // Nunca notificar a los participantes por el cambio
    const notificar = page.locator('[name="coursecontentnotification"][type=checkbox]');
    if (await notificar.count()) await page.evaluate(() => { const e = document.querySelector('[name="coursecontentnotification"][type=checkbox]'); if (e.checked) e.click(); });
    estado.fase = 'escritura';
    estado.cmid = o.cmid;
    // "Guardar cambios y regresar al curso", enviado desde el DOM: no depende de que el botón esté a la vista
    await Promise.all([page.waitForNavigation({ timeout: 60000 }), page.evaluate(() => { const b = document.querySelector('#id_submitbutton2'); b.form.requestSubmit(b); })]);
    estado.fase = 'lectura';
    estado.cmid = null;
    if (page.url().includes('/course/modedit.php')) {
      const err = await page.evaluate(() => [...document.querySelectorAll('.error, .invalid-feedback, .alert-danger')].map((e) => e.textContent.trim()).filter(Boolean).join(' · '));
      salir(`${o.clave}: Moodle rechazó el guardado. ${err}`);
    }

    // RELECTURA
    await page.goto(`${BASE}/course/modedit.php?update=${o.cmid}`);
    const despues = await page.evaluate(leerFormulario);
    const distintos = Object.keys(quiero).filter((k) => String(despues[k]) !== String(quiero[k]));
    fila.resultado = distintos.length ? 'DISTINTO: ' + distintos.map((k) => `${k}=${despues[k]}`).join(', ') : 'aplicado y verificado';
    console.log('  → ' + fila.resultado);
  }

  console.log('\n' + (confirmar ? 'RESULTADO' : 'SIMULACIÓN (nada se escribió; correr con --confirmar para aplicar)'));
  resumen.forEach((f) => console.log(`  ${f.clave.padEnd(24)} ${String(f.cmid).padEnd(6)} ${f.cambios} cambio(s) · ${f.resultado}`));
  console.log(`Escrituras permitidas: ${escrituras.length} · peticiones bloqueadas por la guardia: ${bloqueadas.length}`);
  await browser.close();
  if (resumen.some((f) => f.resultado.startsWith('DISTINTO'))) process.exit(2);
})().catch((e) => salir(e.message));
