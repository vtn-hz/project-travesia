// ---------------------------------------------------------
// APLICAR LOS DATOS DE PRUEBA EN EL CAMPUS (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   node .skills/datos-prueba/aplicar.js                          → simula: cuántas entradas crearía en cada base (no se conecta)
//   Con MOODLE_USUARIO y MOODLE_CLAVE, la simulación además revisa en el campus (solo lectura) que cada campo de los JSON exista
//   en el formulario de su base y que los valores de las listas sean opciones válidas.
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/datos-prueba/aplicar.js --confirmar \
//     [--limite <n>] [--paralelo <n>]
//
// Crea las entradas de data/prueba/*.json en este orden: Estudiantes, Respuestas, CargaParcialesPrimero, Criticidad (con
// rid_fuente "@REF" reemplazado por el rid real) y Entrevistas. Desaprueba las omisiones, como el cierre real (ADR-009).
// Anota cada rid en data/prueba/aplicado.json apenas lo crea: si se corta, volver a correr retoma donde quedó (no duplica).
// --limite <n>: crea como mucho n entradas en esta corrida (para probar). --paralelo <n>: altas simultáneas (por defecto 3).
const c = require('./comun');

const confirmar = c.args.includes('--confirmar');
const limite = c.arg('--limite') ? Number(c.arg('--limite')) : Infinity;
const paralelo = c.arg('--paralelo') ? Number(c.arg('--paralelo')) : 3;
if (!(limite > 0) || !(paralelo > 0)) c.salir('--limite y --paralelo tienen que ser números positivos.');

const datos = c.cargarDatos();
const aplicado = c.cargarAplicado();

function resumen() {
  let total = 0;
  console.log('──────────────── APLICAR DATOS DE PRUEBA ────────────────');
  for (const b of c.BASES) {
    const lista = datos[b.clave];
    const hechas = lista.filter((e) => aplicado.entradas[e.ref]).length;
    total += lista.length - hechas;
    console.log(`${b.clave.padEnd(24)} (d=${String(b.dataid).padEnd(3)}) : ${String(lista.length).padStart(4)} en el JSON · ${String(hechas).padStart(4)} ya aplicadas · ${String(lista.length - hechas).padStart(4)} por crear`);
  }
  const porDesaprobar = Object.entries(aplicado.entradas).filter(([, a]) => a.desaprobar && !a.desaprobada).length;
  const nuevasOmisiones = datos.criticidad.filter((e) => e.desaprobar && !aplicado.entradas[e.ref]).length;
  console.log(`Omisiones a desaprobar : ${nuevasOmisiones + porDesaprobar}`);
  console.log(`Total por crear        : ${total}${limite < Infinity ? ` (esta corrida: como mucho ${limite})` : ''}`);
  return total;
}

// REVISIÓN DE SOLO LECTURA: CAMPOS Y OPCIONES DE CADA BASE CONTRA LOS JSON
async function revisarCampos() {
  const { browser, page } = await c.abrir();
  const problemas = [];
  try {
    for (const b of c.BASES) {
      const f = await page.evaluate((d) => window.__zkPrueba.campos(d), b.dataid);
      const claves = new Set(datos[b.clave].flatMap((e) => Object.keys(e.campos)));
      for (const k of claves) {
        const etiqueta = k.toLowerCase();
        if (!f.campos.includes(etiqueta)) { problemas.push(`${b.clave}: el formulario no tiene el campo "${k}"`); continue; }
        if (!f.opciones[etiqueta]) continue;
        const invalidos = [...new Set(datos[b.clave].map((e) => String(e.campos[k])).filter((v) => v && !f.opciones[etiqueta].includes(v)))];
        if (invalidos.length) problemas.push(`${b.clave}.${k}: valores que no son opciones de la lista: ${invalidos.join(', ')}`);
      }
    }
  } finally { await browser.close(); }
  console.log(problemas.length ? `\n✖ Revisión de campos en el campus:\n  ${problemas.join('\n  ')}` : '\n✔ Revisión de campos en el campus: los JSON coinciden con los formularios de las 5 bases.');
  if (problemas.length) process.exitCode = 1;
}

(async () => {
  const pendientes = resumen();
  if (!confirmar) {
    if (process.env.MOODLE_USUARIO && process.env.MOODLE_CLAVE) await revisarCampos();
    console.log('\nSIMULACIÓN: no se escribió nada. Para aplicar, repetir con --confirmar (requiere confirmación explícita del equipo).');
    return;
  }
  if (!pendientes && !Object.values(aplicado.entradas).some((a) => a.desaprobar && !a.desaprobada)) { console.log('\nNo hay nada pendiente.'); return; }

  const { browser, page, permitido, escrituras } = await c.abrir();
  const guardar = () => { aplicado.actualizado = new Date().toISOString(); c.guardarAplicado(aplicado); };
  let creadas = 0;
  const inicio = Date.now();

  async function desaprobar(ref) {
    const a = aplicado.entradas[ref];
    permitido.desaprobar.add(`${a.dataid}:${a.rid}`);
    a.desaprobada = await page.evaluate(({ d, r }) => window.__zkPrueba.desaprobar(d, r), { d: a.dataid, r: a.rid });
    guardar();
  }

  try {
    for (const b of c.BASES) {
      const lista = datos[b.clave].filter((e) => !aplicado.entradas[e.ref]);
      if (!lista.length) continue;
      if (b.clave === 'criticidad') {
        const faltan = [...datos.respuestas, ...datos.carga_parciales_primero].filter((e) => !aplicado.entradas[e.ref]).length;
        if (faltan) { console.log(`\nCriticidad espera a que estén todas las Respuestas y notas (faltan ${faltan}).`); break; }
      }
      console.log(`\n${b.clave}: creando ${Math.min(lista.length, limite - creadas)} de ${lista.length}…`);
      permitido.altas = true;
      await c.enParalelo(lista, paralelo, async (e) => {
        if (creadas >= limite) return;
        creadas++;
        const campos = Object.assign({}, e.campos);
        if (typeof campos.rid_fuente === 'string' && campos.rid_fuente.startsWith('@')) {
          const fuente = aplicado.entradas[campos.rid_fuente.slice(1)];
          if (!fuente) throw new Error(`${e.ref}: su fuente ${campos.rid_fuente} no está aplicada.`);
          campos.rid_fuente = String(fuente.rid);
        }
        let rid;
        for (let intento = 1; ; intento++) {
          try { rid = await page.evaluate(({ d, campos }) => window.__zkPrueba.agregar(d, campos), { d: b.dataid, campos }); break; }
          catch (err) { if (intento >= 2) throw new Error(`${e.ref}: ${err.message}`); }
        }
        aplicado.entradas[e.ref] = { base: b.clave, dataid: b.dataid, rid };
        if (e.desaprobar) aplicado.entradas[e.ref].desaprobar = true;
        guardar();
        if (e.desaprobar) await desaprobar(e.ref);
        const hechas = Object.keys(aplicado.entradas).length;
        if (hechas % 25 === 0) console.log(`  ${hechas} entradas aplicadas · ${Math.round((Date.now() - inicio) / 1000)} s`);
      });
      permitido.altas = false;
      if (creadas >= limite) break;
    }
    // Omisiones que quedaron sin desaprobar en una corrida anterior
    for (const [ref, a] of Object.entries(aplicado.entradas)) if (a.desaprobar && !a.desaprobada) await desaprobar(ref);
  } catch (err) {
    console.error(`\n✖ Se detuvo: ${err.message}\nLo creado hasta acá quedó en data/prueba/aplicado.json: volver a correr retoma desde ahí.`);
    process.exitCode = 1;
  } finally {
    permitido.altas = false;
    const sinDesaprobar = Object.entries(aplicado.entradas).filter(([, a]) => a.desaprobar && !a.desaprobada).map(([r, a]) => `${r} (rid ${a.rid})`);
    console.log(`\nCreadas en esta corrida: ${creadas} · escrituras ${JSON.stringify(escrituras)} · ${Math.round((Date.now() - inicio) / 1000)} s`);
    if (sinDesaprobar.length) console.log(`⚠ Omisiones sin desaprobar (Moodle no mostró el aviso de éxito): ${sinDesaprobar.join(', ')}`);
    resumen();
    await browser.close();
  }
})().catch((e) => c.salir(e.message));
