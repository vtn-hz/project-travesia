// ---------------------------------------------------------
// BORRAR LOS DATOS DE PRUEBA DEL CAMPUS (POR DEFECTO SIMULA)
// ---------------------------------------------------------
// Uso:
//   MOODLE_USUARIO=... MOODLE_CLAVE=... NODE_PATH=$(npm root -g) node .skills/datos-prueba/remover.js [--confirmar] [--paralelo <n>]
//
// Lee las 5 bases y junta las entradas de prueba:
//   - las de data/prueba/aplicado.json (por rid), y
//   - de respaldo, cualquier entrada con las marcas (id de usuario 900000–900999; en CargaParcialesPrimero, un DNI de
//     data/prueba/estudiantes.json con el mismo nombre), por ejemplo omisiones que agregó un cierre de período.
// Nunca borra una entrada sin marca, aunque esté en aplicado.json (avisa). Borra al revés del orden de aplicación (Entrevistas,
// Criticidad, CargaParcialesPrimero, Respuestas, Estudiantes), vuelve a leer las bases para confirmar que no quedó nada y
// vacía aplicado.json. Las entradas de una base borradas no van a la papelera: para recuperarlas, se vuelve a aplicar.
const c = require('./comun');

const confirmar = c.args.includes('--confirmar');
const paralelo = c.arg('--paralelo') ? Number(c.arg('--paralelo')) : 3;

(async () => {
  const datos = c.cargarDatos();
  const aplicado = c.cargarAplicado();
  const marca = c.marcas(datos);
  const { browser, page, permitido, escrituras } = await c.abrir();
  try {
    let bases = await c.leerBases(page);
    const plan = {};
    const avisos = [];
    for (const b of c.BASES) {
      const porRid = new Map(bases[b.clave].map((e) => [e.rid, e]));
      const conMarca = bases[b.clave].filter((e) => marca[b.clave](e.campos)).map((e) => e.rid);
      const registradas = Object.entries(aplicado.entradas).filter(([, a]) => a.base === b.clave);
      registradas.forEach(([ref, a]) => {
        const e = porRid.get(Number(a.rid));
        if (e && !marca[b.clave](e.campos)) avisos.push(`${ref}: el rid ${a.rid} de ${b.clave} no tiene la marca de prueba; no se toca`);
      });
      const yaNoEstan = registradas.filter(([, a]) => !porRid.has(Number(a.rid))).length;
      const fueraDelRegistro = conMarca.filter((rid) => !registradas.some(([, a]) => Number(a.rid) === rid)).length;
      plan[b.clave] = conMarca;
      console.log(`${b.clave.padEnd(24)} (d=${String(b.dataid).padEnd(3)}) : ${String(bases[b.clave].length).padStart(4)} entradas · ${String(conMarca.length).padStart(4)} de prueba (${fueraDelRegistro} fuera de aplicado.json) · ${yaNoEstan} del registro ya no están`);
    }
    avisos.forEach((a) => console.log('⚠ ' + a));
    const total = Object.values(plan).reduce((s, l) => s + l.length, 0);
    console.log(`Total a borrar: ${total}`);
    if (!confirmar) { console.log('\nSIMULACIÓN: no se borró nada. Para borrar, repetir con --confirmar (requiere confirmación explícita del equipo).'); return; }

    const fallidas = [];
    for (const b of c.BASES.slice().reverse()) {
      if (!plan[b.clave].length) continue;
      console.log(`\n${b.clave}: borrando ${plan[b.clave].length}…`);
      plan[b.clave].forEach((rid) => permitido.borrar.add(`${b.dataid}:${rid}`));
      let hechas = 0;
      await c.enParalelo(plan[b.clave], paralelo, async (rid) => {
        const ok = await page.evaluate(({ d, r }) => window.__zkPrueba.borrar(d, r), { d: b.dataid, r: rid });
        if (!ok) fallidas.push(`${b.clave} rid ${rid}`);
        if (++hechas % 25 === 0) console.log(`  ${hechas} de ${plan[b.clave].length}`);
      });
    }
    // Verificación: no tiene que quedar ninguna entrada con marca
    bases = await c.leerBases(page);
    const quedan = c.BASES.map((b) => [b.clave, bases[b.clave].filter((e) => marca[b.clave](e.campos)).length]).filter(([, n]) => n);
    console.log(`\nEscrituras: ${JSON.stringify(escrituras)}`);
    if (fallidas.length) console.log(`⚠ Moodle no confirmó ${fallidas.length} borrados: ${fallidas.slice(0, 10).join(', ')}${fallidas.length > 10 ? '…' : ''}`);
    if (quedan.length) { console.log(`✖ Quedan entradas de prueba: ${quedan.map(([k, n]) => `${k} ${n}`).join(', ')}. Volver a correr remover.js.`); process.exitCode = 1; }
    else {
      console.log('✔ No quedó ninguna entrada de prueba en las 5 bases.');
      c.guardarAplicado({ descripcion: aplicado.descripcion, actualizado: new Date().toISOString(), entradas: {} });
    }
  } finally {
    await browser.close();
  }
})().catch((e) => c.salir(e.message));
