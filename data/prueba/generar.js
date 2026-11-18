// ---------------------------------------------------------
// GENERADOR DE LOS DATOS DE PRUEBA DEL CAMPUS (60 ESTUDIANTES FICTICIOS)
// ---------------------------------------------------------
// Uso (desde la raíz del repo):
//   node data/prueba/generar.js                         → escribe los JSON de data/prueba/ e imprime el control
//   node data/prueba/generar.js --verificar <archivo>   → además compara contra { nombres: [...], dnis: [...] } (participantes
//                                                          del curso y DNI ya cargados; ese archivo NO va al repo)
//
// No inventa entradas sueltas: simula la carrera de cada estudiante cuatrimestre por cuatrimestre con el Plan 2024 y de ahí salen
// sus encuestas, sus notas y su criticidad. La criticidad se calcula con las funciones de la Página Tools (CriticidadEncuesta e
// IndiceNotasPrimero), en el mismo orden en que lo haría el sistema, así que los números son los que daría el campus.
// Con la misma SEMILLA los JSON salen idénticos.
//
// Marcas de los datos de prueba (las usa el borrado): id de usuario 900001–900060 (estudiantes) y 900901–900906 (acompañantes),
// correo @ejemplo.edu.ar y la lista de DNI de estudiantes.json. Los DNI están entre 40.000.000 y 50.000.000, acordes a la cohorte.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..', '..');
const SALIDA = __dirname;
const SEMILLA = 20261124;
const HOY = '2026-11-17T12:00';
const PERIODO_ACTUAL = '2026-2';
const PRIMER_PERIODO = '2021-1'; // desde cuándo hay Encuestas Cuatrimestrales en Respuestas
const METAS = { estudiantes: 60, respuestas: 300, parciales: 200 };
const ID_ESTUDIANTE = 900001;
const ID_ACOMPANANTE = 900901;
const DOMINIO = 'ejemplo.edu.ar';

// ---------------------------------------------------------
// AZAR CON SEMILLA (mulberry32)
// ---------------------------------------------------------
let estadoAzar = SEMILLA;
function azar() {
  estadoAzar |= 0; estadoAzar = (estadoAzar + 0x6D2B79F5) | 0;
  let t = Math.imul(estadoAzar ^ (estadoAzar >>> 15), 1 | estadoAzar);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const entero = (a, b) => a + Math.floor(azar() * (b - a + 1));
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const chance = (p) => azar() < p;
function mezclar(lista) {
  const l = lista.slice();
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}
function normal(media, desvio) {
  const u = Math.max(azar(), 1e-9), v = azar();
  return media + desvio * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------------------------------------------------
// FECHAS (HORA DE ARGENTINA, -03:00)
// ---------------------------------------------------------
const dos = (n) => String(n).padStart(2, '0');
function aFecha(texto) { // 'AAAA-MM-DD' o 'AAAA-MM-DDTHH:MM' → Date en UTC que representa esa hora local
  const m = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0) + 3, +(m[5] || 0)));
}
function local(d) { const x = new Date(d.getTime() - 3 * 3600 * 1000); return { a: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate(), h: x.getUTCHours(), mi: x.getUTCMinutes(), s: x.getUTCSeconds(), dow: x.getUTCDay() }; }
const iso = (d) => { const x = local(d); return `${x.a}-${dos(x.m)}-${dos(x.d)}T${dos(x.h)}:${dos(x.mi)}:${dos(x.s)}-03:00`; };
const isoMinutos = (d) => { const x = local(d); return `${x.a}-${dos(x.m)}-${dos(x.d)}T${dos(x.h)}:${dos(x.mi)}`; };
const dia = (d) => { const x = local(d); return `${x.a}-${dos(x.m)}-${dos(x.d)}`; };
const masDias = (d, n) => new Date(d.getTime() + n * 86400000);
const masMinutos = (d, n) => new Date(d.getTime() + n * 60000);
function entre(desde, hasta, horaMin = 8, horaMax = 23) { // día al azar del rango, con hora al azar
  const a = aFecha(desde).getTime(), b = aFecha(hasta).getTime();
  const base = new Date(a + Math.floor(azar() * ((b - a) / 86400000 + 1)) * 86400000);
  return masMinutos(base, entero(horaMin * 60, horaMax * 60 + 59));
}
const AHORA = aFecha(HOY);

// ---------------------------------------------------------
// PERÍODOS
// ---------------------------------------------------------
const indice = (p) => { const [a, c] = p.split('-').map(Number); return a * 2 + c - 1; };
const periodo = (i) => `${Math.floor(i / 2)}-${(i % 2) + 1}`;
const siguiente = (p) => periodo(indice(p) + 1);
const anterior = (p) => periodo(indice(p) - 1);
function periodos(desde, hasta) { const l = []; for (let i = indice(desde); i <= indice(hasta); i++) l.push(periodo(i)); return l; }
// Ventanas: cuándo se responde la Cuatrimestral de cada período y cuándo se cierra (ADR-009)
function ventanaEncuesta(p) {
  const [a, c] = p.split('-');
  if (p === PERIODO_ACTUAL) return [`${a}-08-24`, '2026-11-15'];
  return c === '1' ? [`${a}-03-16`, `${a}-04-30`] : [`${a}-08-24`, `${a}-10-10`];
}
function cierre(p) { const [a, c] = p.split('-'); return aFecha(c === '1' ? `${a}-08-14T10:00` : `${+a + 1}-03-06T10:00`); }

// ---------------------------------------------------------
// PLAN 2024 (data/plan_estudios/PLAN_2024_MATERIAS.csv)
// ---------------------------------------------------------
function leerCsv(texto) {
  const filas = []; let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (comillas) { if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (ch === '"') comillas = false; else campo += ch; }
    else if (ch === '"') comillas = true;
    else if (ch === ',') { fila.push(campo); campo = ''; }
    else if (ch === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += ch;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter((f) => f.length > 1).map((f) => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}
const PLAN = leerCsv(fs.readFileSync(path.join(RAIZ, 'data/plan_estudios/PLAN_2024_MATERIAS.csv'), 'utf8'))
  .map((m) => ({ codigo: m.codigo, nombre: m.nombre, anio: +m.anio, nivel: +m.cuat_inicio, creditos: +m.creditos }));
const MATERIA = Object.fromEntries(PLAN.map((m) => [m.codigo, m]));
const DIFICILES = ['INGM101', 'INGM102', 'INGM103', 'INGM106', 'INGF101', 'INGF103', 'ING2218', 'ING2217'];
const DE_PRIMERO = PLAN.filter((m) => m.anio === 1).map((m) => m.codigo); // las 7 materias con parciales en CargaParcialesPrimero
// Créditos esperados del Plan 2024 por cuatrimestres transcurridos (modelo de criticidad de las encuestas)
const ESPERADOS = [0, 14, 34, 57, 81, 104, 131, 152, 176, 193, 223];
// CargaMateriasPrimero tal como está en el campus (leída el 2026-11-17): marca de crítica y umbral
const MATERIAS_PRIMERO = [
  { materia: 'Análisis Matemático I', es_critica: 'S', umbral: '4.5' },
  { materia: 'Álgebra I- B', es_critica: 'S', umbral: '6' },
  { materia: 'Fundamentos de Química', es_critica: 'N', umbral: '0' },
  { materia: 'Análisis Matemático II', es_critica: 'S', umbral: '5' }
];

// ---------------------------------------------------------
// FUNCIONES DE LA PÁGINA TOOLS (MISMAS FÓRMULAS QUE EL CAMPUS)
// ---------------------------------------------------------
function cargarTools() {
  const html = fs.readFileSync(path.join(RAIZ, 'section/utils/tools/content.html'), 'utf8');
  const m = html.match(/<script type="text\/plain"[^>]*data-zk-biblioteca="tools"[^>]*>([\s\S]*?)<\/script>/);
  const nodo = () => ({ addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], appendChild() {}, setAttribute() {}, style: {} });
  const ventana = { location: { protocol: 'file:', hostname: '', href: 'file:///tools' }, addEventListener() {}, dispatchEvent() {}, CustomEvent: function() {}, localStorage: { getItem: () => null, setItem() {} } };
  const documento = Object.assign(nodo(), { readyState: 'complete', createElement: nodo, head: nodo(), body: nodo(), getElementById: () => null });
  ventana.document = documento;
  const ctx = vm.createContext({ window: ventana, document: documento, console, setTimeout, clearTimeout, Promise, URL, URLSearchParams, Date, JSON, Math });
  vm.runInContext(m[1], ctx);
  return ventana.ZhakyzTools;
}
const Tools = cargarTools();
const DEF_V4 = (() => {
  const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json'), 'utf8')).entradas
    .find((e) => e.codigo_encuesta === 'cuatrimestral' && e.version === 4);
  return Object.assign({}, d, { json_preguntas: JSON.stringify(d.json_preguntas) });
})();
const semaforo = (i) => (i >= 70 ? 'rojo' : i >= 40 ? 'amarillo' : 'verde');

// ---------------------------------------------------------
// NOMBRES (COMUNES EN ARGENTINA; SE COMBINAN AL AZAR)
// ---------------------------------------------------------
const NOMBRES_M = ['JUAN', 'MATEO', 'SANTIAGO', 'TOMÁS', 'BENJAMÍN', 'JOAQUÍN', 'LAUTARO', 'FRANCO', 'FACUNDO', 'AGUSTÍN', 'IGNACIO', 'MATÍAS', 'LUCAS', 'BRUNO', 'EZEQUIEL', 'GONZALO', 'FEDERICO', 'MAXIMILIANO', 'THIAGO', 'VALENTÍN', 'RAMIRO', 'IVÁN', 'EMILIANO', 'LEANDRO', 'GASTÓN', 'MARCOS', 'PABLO', 'ULISES', 'BAUTISTA', 'ALEJO', 'GENARO', 'CRISTIAN'];
const NOMBRES_F = ['SOFÍA', 'MARTINA', 'CAMILA', 'LUCÍA', 'FLORENCIA', 'AGUSTINA', 'JULIETA', 'MICAELA', 'MILAGROS', 'ABRIL', 'CANDELA', 'ROCÍO', 'ANTONELLA', 'PAULA', 'CAROLINA', 'BRENDA', 'ALDANA', 'VICTORIA', 'JOSEFINA', 'DELFINA', 'MORENA', 'CELESTE', 'MELINA', 'DAIANA', 'BELÉN', 'PILAR', 'EMILIA', 'GUADALUPE', 'AILÉN', 'XIMENA', 'LARA', 'NAHIARA'];
const APELLIDOS = ['GONZÁLEZ', 'RODRÍGUEZ', 'GÓMEZ', 'FERNÁNDEZ', 'LÓPEZ', 'DÍAZ', 'MARTÍNEZ', 'PÉREZ', 'GARCÍA', 'SÁNCHEZ', 'ROMERO', 'SOSA', 'TORRES', 'ÁLVAREZ', 'RUIZ', 'RAMÍREZ', 'FLORES', 'BENÍTEZ', 'ACOSTA', 'MEDINA', 'HERRERA', 'SUÁREZ', 'AGUIRRE', 'GIMÉNEZ', 'GUTIÉRREZ', 'PEREYRA', 'ROJAS', 'MOLINA', 'CASTRO', 'ORTIZ', 'SILVA', 'NÚÑEZ', 'LUNA', 'JUÁREZ', 'CABRERA', 'RÍOS', 'MORALES', 'GODOY', 'MORENO', 'FERREYRA', 'DOMÍNGUEZ', 'CARRIZO', 'PERALTA', 'CASTILLO', 'LEDESMA', 'QUIROGA', 'VEGA', 'VERA', 'MUÑOZ', 'OJEDA', 'PONCE', 'VILLALBA', 'CARDOZO', 'NAVARRO', 'CORONEL', 'VÁZQUEZ', 'RAMOS', 'VARGAS', 'CÁCERES', 'ARIAS', 'FIGUEROA', 'CÓRDOBA', 'CORREA', 'MALDONADO', 'RIVERO', 'MIRANDA', 'MENDOZA', 'BUSTOS', 'IBÁÑEZ', 'TOLEDO', 'IGLESIAS', 'BIANCHI', 'ROSSI', 'FERRARI', 'ROMANO', 'COLOMBO', 'MARINO', 'GRECO', 'LOMBARDI', 'ESPÓSITO', 'ARAMBURU', 'ECHEVERRÍA', 'ETCHEGARAY', 'IRIGOYEN', 'OLIVERA', 'SALINAS', 'BARRIOS', 'MANSILLA', 'PAREDES', 'ESCOBAR'];
const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalizarNombre = (s) => sinTildes(String(s)).toUpperCase().replace(/\s+/g, ' ').trim();
const usados = new Set();
function nombreNuevo() {
  for (;;) {
    const f = chance(0.5);
    const lista = f ? NOMBRES_F : NOMBRES_M;
    const n1 = elegir(lista);
    const nombre = chance(0.22) ? `${n1} ${elegir(lista.filter((x) => x !== n1))}` : n1;
    const a1 = elegir(APELLIDOS);
    const apellido = chance(0.12) ? `${a1} ${elegir(APELLIDOS.filter((x) => x !== a1))}` : a1;
    const clave = normalizarNombre(`${nombre} ${apellido}`);
    if (usados.has(clave)) continue;
    usados.add(clave);
    return { nombre, apellido };
  }
}
const nombreVisible = (n) => `${n.nombre} ${n.apellido}`;
const correo = (n) => `${sinTildes(n.nombre.split(' ')[0]).toLowerCase()}.${sinTildes(n.apellido.split(' ')[0]).toLowerCase()}${entero(1, 99)}@${DOMINIO}`;
// DNI acorde a la edad: nacidos en 1999 ≈ 42 millones, unos 700.000 más por año, entre 40 y 50 millones
const dnisUsados = new Set();
function dniPara(anioIngreso) {
  const nacimiento = anioIngreso - 18 - (chance(0.3) ? entero(1, 4) : 0);
  for (;;) {
    const dni = Math.min(49999999, Math.max(40000000, Math.round(42000000 + (nacimiento - 1999) * 700000 + entero(-250000, 450000))));
    if (!dnisUsados.has(dni)) { dnisUsados.add(dni); return String(dni); }
  }
}

// ---------------------------------------------------------
// PERFILES
// ---------------------------------------------------------
// aprueba: probabilidad de aprobar una materia; carga: materias por cuatrimestre; responde: probabilidad de responder la Cuatrimestral
const PERFILES = {
  al_dia: { aprueba: 0.88, carga: [5, 6], responde: 0.97, cohortes: ['2022-1', '2022-1', '2023-1', '2023-1', '2023-2', '2024-1', '2024-1', '2024-2', '2022-2'] },
  trabaja: { aprueba: 0.72, carga: [2, 4], responde: 0.92, cohortes: ['2018-1', '2019-1', '2019-2', '2020-1', '2020-1', '2021-1', '2021-1', '2021-2', '2022-1', '2022-1', '2023-1', '2023-2'] },
  riesgo: { aprueba: 0.48, carga: [3, 5], responde: 0.86, cohortes: ['2019-2', '2020-1', '2021-1', '2022-1', '2022-2', '2023-1', '2023-1', '2024-1'] },
  abandono: { aprueba: 0.55, carga: [3, 4], responde: 0.9, cohortes: ['2019-1', '2020-1', '2021-1', '2022-1'] },
  inactivo: { aprueba: 0.6, carga: [2, 3], responde: 0.93, cohortes: ['2020-1', '2021-2'] },
  nunca_responde: { aprueba: 0.7, carga: [3, 5], responde: 0, cohortes: ['2021-1', '2022-1', '2023-1'] },
  paso_reciente: { aprueba: 0.78, carga: [4, 5], responde: 0.92, cohortes: ['2025-1', '2025-1'] },
  // 1.er año
  buen_inicio: { aprueba: 0.82, carga: [3, 4], responde: 0, notas: [7.6, 1.3], ausente: 0.03, carga_notas: 0.95 },
  irregular: { aprueba: 0.6, carga: [3, 4], responde: 0, notas: [6.3, 1.8], ausente: 0.08, carga_notas: 0.85 },
  en_riesgo: { aprueba: 0.35, carga: [2, 4], responde: 0, notas: [4.6, 1.9], ausente: 0.16, carga_notas: 0.8 },
  sin_notas: { aprueba: 0.6, carga: [3, 4], responde: 0, notas: [5.5, 1.8], ausente: 0.1, carga_notas: 0 }
};
// 40 de 2.º año en adelante y 20 de 1.er año (15 de la cohorte 2026-1, 3 de 2025-2 y 2 de 2025-1 que siguen en 1.er año)
const REPARTO = [
  ['al_dia', 9], ['trabaja', 12], ['riesgo', 8], ['abandono', 4], ['inactivo', 2], ['nunca_responde', 3], ['paso_reciente', 2],
  ['buen_inicio', 6], ['irregular', 8], ['en_riesgo', 4], ['sin_notas', 2]
];
const COHORTES_PRIMERO = [...Array(15).fill('2026-1'), ...Array(3).fill('2025-2'), '2025-1', '2025-1'];

// ---------------------------------------------------------
// ESTUDIANTES Y SU CARRERA SIMULADA
// ---------------------------------------------------------
const estudiantes = [];
{
  let k = 0, primero = mezclar(COHORTES_PRIMERO);
  for (const [perfil, n] of REPARTO) {
    for (let i = 0; i < n; i++) {
      const p = PERFILES[perfil];
      const esPrimero = !p.cohortes;
      const cohorte = esPrimero ? primero.pop() : p.cohortes[i % p.cohortes.length];
      const nom = nombreNuevo();
      const id = ID_ESTUDIANTE + k;
      estudiantes.push({
        ref: `EST-${dos(k + 1).padStart(3, '0')}`, id: String(id), nombre: nom, dni: dniPara(+cohorte.slice(0, 4)), email: correo(nom),
        perfil, cohorte, esPrimero,
        // Trabaja desde (período) o null. Los de "trabaja" siempre; los demás, a veces
        trabajaDesde: perfil === 'trabaja' ? (chance(0.35) ? anterior(cohorte) : periodo(indice(cohorte) + entero(0, 5)))
          : (!esPrimero && chance(0.22) ? periodo(indice(cohorte) + entero(2, 7)) : null),
        abandonaDesde: perfil === 'abandono' ? elegir(['2024-1', '2024-2', '2025-1', '2025-2']) : null,
        inactivoDesde: perfil === 'inactivo' ? elegir(['2025-2', '2026-1']) : null,
        recursante: false
      });
      k++;
    }
  }
  // Recursantes: 5 de 2.º año en adelante que deben una materia de 1.er año y la rinden en 2026
  mezclar(estudiantes.filter((e) => ['trabaja', 'riesgo', 'al_dia'].includes(e.perfil) && indice(e.cohorte) >= indice('2022-1'))).slice(0, 5)
    .forEach((e) => { e.recursante = elegir(['INGM102', 'INGF101', 'INGM106', 'INGM101']); });
}

// Avance: por cuatrimestre, cursa las materias pendientes en el orden del plan (sin pasar dos niveles por encima de lo aprobado)
// y aprueba según su perfil. El cuatrimestre en curso (2026-2) todavía no tiene resultado.
function simular(e) {
  const p = PERFILES[e.perfil];
  e.aprobadas = {}; // codigo → período en que aprobó
  e.cursadas = {}; // período → [{ codigo, primera_vez, aprobo, dificultad }]
  const cursoAntes = new Set();
  for (const per of periodos(e.cohorte, PERIODO_ACTUAL)) {
    let carga = entero(p.carga[0], p.carga[1]);
    if (e.abandonaDesde && indice(per) >= indice(e.abandonaDesde)) carga = 0;
    if (e.inactivoDesde && indice(per) >= indice(e.inactivoDesde)) carga = 0;
    if (e.trabajaDesde && indice(per) >= indice(e.trabajaDesde) && e.perfil !== 'trabaja') carga = Math.max(1, carga - 1);
    const aprobadasYa = Object.keys(e.aprobadas).filter((c) => indice(e.aprobadas[c]) < indice(per));
    const nivel = aprobadasYa.length ? Math.max(...aprobadasYa.map((c) => MATERIA[c].nivel)) : 0;
    const pendientes = PLAN.filter((m) => !(m.codigo in e.aprobadas) && m.nivel <= Math.max(2, nivel + 2));
    const lista = pendientes.slice(0, carga).map((m) => {
      let prob = p.aprueba - (DIFICILES.includes(m.codigo) ? 0.12 : 0) + (cursoAntes.has(m.codigo) ? 0.08 : 0);
      if (e.recursante === m.codigo && indice(per) < indice('2026-2')) prob = 0; // la debe hasta 2026
      const aprobo = per === PERIODO_ACTUAL ? null : chance(prob);
      const dificultad = Math.min(5, Math.max(1, (aprobo ? entero(2, 4) : entero(3, 5)) + (DIFICILES.includes(m.codigo) && chance(0.5) ? 1 : 0)));
      return { codigo: m.codigo, primera_vez: !cursoAntes.has(m.codigo), aprobo, dificultad };
    });
    // El recursante cursa su materia de 1.er año en 2026-1 y 2026-2 aunque el orden del plan no la ponga primera
    if (e.recursante && ['2026-1', '2026-2'].includes(per) && !lista.some((x) => x.codigo === e.recursante) && !(e.recursante in e.aprobadas)) {
      lista.unshift({ codigo: e.recursante, primera_vez: !cursoAntes.has(e.recursante), aprobo: per === PERIODO_ACTUAL ? null : false, dificultad: entero(4, 5) });
    }
    lista.forEach((x) => { cursoAntes.add(x.codigo); if (x.aprobo) e.aprobadas[x.codigo] = per; });
    e.cursadas[per] = lista;
  }
  // Pasa a 2.º año cuando empieza a cursar materias de 2.º año (como Proyecto de Ingeniería Industrial I); los de 1.er año todavía no
  const conProyecto = periodos(e.cohorte, PERIODO_ACTUAL).find((per) => e.cursadas[per].some((x) => MATERIA[x.codigo].nivel >= 3));
  if (e.esPrimero) e.paso = null;
  else if (e.perfil === 'paso_reciente') e.paso = e.ref.endsWith('1') || e.ref.endsWith('3') || e.ref.endsWith('5') || e.ref.endsWith('7') || e.ref.endsWith('9') ? '2026-2' : '2026-1';
  else e.paso = conProyecto || periodo(indice(e.cohorte) + 2);
  if (e.esPrimero) for (const per of Object.keys(e.cursadas)) e.cursadas[per] = e.cursadas[per].filter((x) => MATERIA[x.codigo].nivel <= 2);
}
estudiantes.forEach(simular);
const creditosAl = (e, per) => Object.keys(e.aprobadas).filter((c) => indice(e.aprobadas[c]) < indice(per)).reduce((s, c) => s + MATERIA[c].creditos, 0);
const aprobadasAl = (e, per) => PLAN.map((m) => m.codigo).filter((c) => c in e.aprobadas && indice(e.aprobadas[c]) < indice(per));

// ---------------------------------------------------------
// ENCUESTAS CUATRIMESTRALES (BASE RESPUESTAS)
// ---------------------------------------------------------
// Responde la del período P quien está en 2.º año en adelante durante P (pasó antes, o en P). Cuenta lo del cuatrimestre anterior.
function opcionInicioLaboral(e) {
  if (indice(e.trabajaDesde) < indice(e.cohorte)) return 1; // antes de ingresar
  return Math.min(6, Math.floor((indice(e.trabajaDesde) - indice(e.cohorte)) / 2) + 2); // 1.º año → 2 … 5.º año → 6
}
function respuestaDe(e, per) {
  const previo = anterior(per);
  const creditos = creditosAl(e, per);
  const cursadas = (e.cursadas[previo] || []);
  const trabaja = e.trabajaDesde && indice(e.trabajaDesde) <= indice(per);
  let pfg = 1;
  if (creditos >= 156) pfg = creditos >= 205 ? elegir([4, 4, 5]) : elegir([2, 3, 3, 4]);
  else if (chance(0.08)) pfg = 2; // marca "No iniciado" sin que le corresponda (pasa en el campus)
  const t = indice(per) - indice(e.cohorte);
  const r = creditos / ESPERADOS[Math.min(Math.max(t, 1), 10)];
  let avance = r >= 0.85 ? 1 : r >= 0.5 ? 2 : 3;
  if (avance > 1 && chance(0.18)) avance -= 1; // se ve mejor de lo que está
  const lista = [
    { item_id: 8262, respuestas: [creditos] },
    { item_id: 8775, respuestas: [{ plan: '2024', materias: aprobadasAl(e, per) }] },
    { item_id: 8264, respuestas: [pfg] },
    { item_id: 8265, respuestas: [trabaja ? 1 : 2] }
  ];
  if (trabaja) lista.push({ item_id: 8266, respuestas: [opcionInicioLaboral(e)] });
  lista.push({ item_id: 8768, respuestas: cursadas.map((x) => ({ materia: x.codigo, primera_vez: x.primera_vez, dificultad: x.dificultad })) });
  lista.push({ item_id: 8271, respuestas: [avance] });
  return lista;
}

let respuestas = [];
for (const e of estudiantes) {
  if (e.esPrimero) continue;
  const p = PERFILES[e.perfil];
  for (const per of periodos(PRIMER_PERIODO, PERIODO_ACTUAL)) {
    if (indice(per) < indice(e.cohorte) || !e.paso || indice(e.paso) > indice(per)) continue;
    if (e.abandonaDesde && indice(per) > indice(e.abandonaDesde)) continue;
    let prob = p.responde * (per === PERIODO_ACTUAL ? 0.78 : 1);
    if (e.perfil === 'paso_reciente' && e.paso === PERIODO_ACTUAL && per === PERIODO_ACTUAL) prob = 0;
    if (!chance(prob)) continue;
    const [a, b] = ventanaEncuesta(per);
    respuestas.push({ e, periodo: per, fecha: entre(a, b), json: respuestaDe(e, per), reenvio: false });
  }
}
const habilitadas = respuestas.length;
// Ajuste a la meta: si sobran, se quitan respuestas de períodos cerrados (pasan a ser omisiones); si faltan, se agregan reenvíos
respuestas = mezclar(respuestas);
while (respuestas.length > METAS.respuestas) {
  const i = respuestas.findIndex((r) => r.periodo !== PERIODO_ACTUAL && r.e.perfil !== 'al_dia');
  respuestas.splice(i, 1);
}
let intentos = 0;
while (respuestas.length < METAS.respuestas && intentos++ < 5000) {
  const r = elegir(respuestas);
  if (r.reenvio || respuestas.some((x) => x.e === r.e && x.periodo === r.periodo && x.reenvio)) continue;
  const fecha = masMinutos(r.fecha, entero(1, 6) * 1440 + entero(-300, 300));
  if (fecha > AHORA) continue;
  const json = JSON.parse(JSON.stringify(r.json));
  const sel = json.find((x) => x.item_id === 8768);
  if (sel.respuestas.length && chance(0.6)) { const m = elegir(sel.respuestas); m.dificultad = Math.min(5, Math.max(1, m.dificultad + elegir([-1, 1]))); }
  respuestas.push({ e: r.e, periodo: r.periodo, fecha, json, reenvio: true });
}
respuestas.sort((a, b) => a.fecha - b.fecha);
respuestas.forEach((r, i) => { r.ref = `RES-${String(i + 1).padStart(4, '0')}`; });

// ---------------------------------------------------------
// PARCIALES DE 1.ER AÑO (BASE CARGAPARCIALESPRIMERO, SOLO 2026)
// ---------------------------------------------------------
// Ventanas en que se rinde cada instancia y se carga la nota. Al 17/11 no se rindieron los recuperatorios del Parcial 2 de 2026-2
const VENTANAS_NOTA = {
  '2026-1': { 'Parcial 1': ['2026-04-13', '2026-05-08'], 'Parcial 2': ['2026-06-08', '2026-06-30'], 'Recuperatorio 1': ['2026-07-01', '2026-07-10'], 'Recuperatorio 2': ['2026-07-06', '2026-07-17'] },
  '2026-2': { 'Parcial 1': ['2026-09-21', '2026-10-09'], 'Parcial 2': ['2026-11-02', '2026-11-14'], 'Recuperatorio 1': ['2026-10-19', '2026-10-30'] }
};
function nota(e, codigo) {
  const p = PERFILES[e.perfil];
  const [media, desvio] = p.notas || [5.9, 1.8];
  const n = normal(media - (DIFICILES.includes(codigo) ? 0.6 : 0), desvio);
  return Math.min(10, Math.max(1, Math.round(n * 2) / 2));
}
const estadoDe = (n) => (n >= 6 ? 'Aprobado' : 'Desaprobado');
let parciales = [];
for (const e of estudiantes) {
  const p = PERFILES[e.perfil];
  for (const per of ['2026-1', '2026-2']) {
    const cursa = (e.cursadas[per] || []).filter((x) => DE_PRIMERO.includes(x.codigo));
    // Los de 2.º año en adelante solo cargan la materia de 1.er año que recursan; los que pasaron en 2026 cargaron las de 2026-1
    const propias = e.esPrimero || (e.paso && indice(e.paso) > indice(per)) ? cursa : cursa.filter((x) => x.codigo === e.recursante);
    if (!propias.length) continue;
    const cargaNotas = e.esPrimero ? p.carga_notas : 0.9;
    if (!chance(cargaNotas)) continue;
    for (const x of propias) {
      const v = VENTANAS_NOTA[per];
      const instancias = per === '2026-2' && !chance(0.8) ? ['Parcial 1'] : ['Parcial 1', 'Parcial 2'];
      for (const inst of instancias) {
        const ausente = chance((p.ausente || 0.08));
        const n = ausente ? 0 : nota(e, x.codigo);
        const fecha = entre(...v[inst], 9, 23);
        parciales.push({ e, periodo: per, materia: MATERIA[x.codigo].nombre, instancia: inst, nota: n, estado: ausente ? 'Ausente' : estadoDe(n), recupera_a: '', fecha });
        const ventanaRec = v[`Recuperatorio ${inst.slice(-1)}`];
        if ((ausente || n < 6) && ventanaRec && chance(0.7)) {
          const ausRec = chance(0.1);
          const nr = ausRec ? 0 : Math.min(10, Math.max(1, Math.round((nota(e, x.codigo) + 0.6) * 2) / 2));
          parciales.push({ e, periodo: per, materia: MATERIA[x.codigo].nombre, instancia: 'Recuperatorio', nota: nr, estado: ausRec ? 'Ausente' : estadoDe(nr), recupera_a: inst, fecha: entre(...ventanaRec, 9, 23) });
        }
      }
    }
  }
}
// Ajuste a la meta: si sobran, se quitan notas al azar de estudiantes con muchas (no cargaron todo). Si la quitada es un parcial
// con recuperatorio, el recuperatorio se va con ella: nunca queda un recuperatorio sin su parcial
parciales.sort((a, b) => a.fecha - b.fecha);
while (parciales.length > METAS.parciales) {
  const porEst = {};
  parciales.forEach((x) => { porEst[x.e.id] = (porEst[x.e.id] || 0) + 1; });
  const candidatos = parciales.filter((x) => porEst[x.e.id] > 5);
  const quitada = elegir(candidatos.length ? candidatos : parciales);
  parciales.splice(parciales.indexOf(quitada), 1);
  const j = parciales.findIndex((x) => x.e === quitada.e && x.periodo === quitada.periodo && x.materia === quitada.materia && x.recupera_a === quitada.instancia);
  if (j !== -1) parciales.splice(j, 1);
}
parciales.forEach((x, i) => { x.ref = `PAR-${String(i + 1).padStart(4, '0')}`; });

// ---------------------------------------------------------
// CRITICIDAD AUTOMÁTICA: UNA ENTRADA POR NOTA, POR RESPUESTA Y POR OMISIÓN, EN ORDEN CRONOLÓGICO
// ---------------------------------------------------------
const criticidad = [];
for (const x of parciales) {
  // Como CriticidadNotas: el índice de todas las notas del estudiante en el período cargadas hasta ese momento
  const hasta = parciales.filter((y) => y.e === x.e && y.periodo === x.periodo && y.fecha <= x.fecha)
    .map((y) => ({ materia: y.materia, instancia: y.instancia, nota: String(y.nota), estado: y.estado, recupera_a: y.recupera_a }));
  const calc = Tools.IndiceNotasPrimero(hasta, MATERIAS_PRIMERO);
  criticidad.push({ e: x.e, fecha: masMinutos(x.fecha, 1), periodo: x.periodo, origen: 'automatica', fuente: 'notas_1ro', rid_fuente: '@' + x.ref, indice: calc.indice, motivo: '' });
}
for (const r of respuestas) {
  const calc = Tools.CriticidadEncuesta({ codigo_encuesta: 'cuatrimestral', version: 4, json_respuesta: r.json }, DEF_V4);
  r.indice = calc.indice;
  criticidad.push({ e: r.e, fecha: masMinutos(r.fecha, 1), periodo: r.periodo, origen: 'automatica', fuente: 'respuestas', rid_fuente: '@' + r.ref, indice: calc.indice, motivo: '' });
}
// Omisiones (ADR-009): al cerrar cada período, a quien estaba en 2.º año en adelante desde antes y no respondió
for (const per of periodos(PRIMER_PERIODO, anterior(PERIODO_ACTUAL))) {
  for (const e of estudiantes) {
    if (e.esPrimero || !e.paso || indice(e.paso) >= indice(per) || indice(per) < indice(e.cohorte)) continue;
    if (respuestas.some((r) => r.e === e && r.periodo === per)) continue;
    criticidad.push({ e, fecha: cierre(per), periodo: per, origen: 'automatica', fuente: 'omision', rid_fuente: '', indice: 70, motivo: `No respondió la Encuesta Cuatrimestral ${per}.`, desaprobar: true });
  }
}

// ---------------------------------------------------------
// ESTADO DE CADA ESTUDIANTE EN 2026 (PARA ELEGIR A QUIÉN ENTREVISTAR)
// ---------------------------------------------------------
function ultimaDe(e, filtro) { return criticidad.filter((c) => c.e === e && filtro(c)).sort((a, b) => a.fecha - b.fecha).pop() || null; }
// Lo que un tutor puede ver durante el período: su encuesta y sus notas del período, y la omisión del período anterior (ya cerrado)
function senal(e, per, hasta) {
  const antes = (c) => !hasta || c.fecha < hasta;
  const enc = ultimaDe(e, (c) => c.periodo === per && c.fuente === 'respuestas' && antes(c));
  const not = ultimaDe(e, (c) => c.periodo === per && c.fuente === 'notas_1ro' && antes(c));
  const om = ultimaDe(e, (c) => c.periodo === anterior(per) && c.fuente === 'omision' && antes(c));
  const candidatas = [enc, not, om].filter(Boolean);
  const disparo = candidatas.sort((a, b) => b.indice - a.indice)[0] || null;
  return { enc, not, om, disparo, max: disparo ? disparo.indice : 0 };
}

// ---------------------------------------------------------
// ENTREVISTAS (BASE ENTREVISTAS) Y ESTADOS ASIGNADOS (CRITICIDAD MANUAL)
// ---------------------------------------------------------
const ACOMPANANTES = [
  { id: String(ID_ACOMPANANTE), nombre: 'Mariela Ocampo', tipo: 'tutor' },
  { id: String(ID_ACOMPANANTE + 1), nombre: 'Hernán Bustamante', tipo: 'tutor' },
  { id: String(ID_ACOMPANANTE + 2), nombre: 'Silvina Arregui', tipo: 'tutor' },
  { id: String(ID_ACOMPANANTE + 3), nombre: 'Gustavo Lescano', tipo: 'tutor' },
  { id: String(ID_ACOMPANANTE + 4), nombre: 'Rocío Albornoz', tipo: 'asesor_par' },
  { id: String(ID_ACOMPANANTE + 5), nombre: 'Franco Saravia', tipo: 'asesor_par' }
];
const TUTORES = ACOMPANANTES.filter((a) => a.tipo === 'tutor');
const PARES = ACOMPANANTES.filter((a) => a.tipo === 'asesor_par');

function motivoDe(e, s, per) {
  if (s.disparo && s.disparo === s.om) return `Alerta por omisión: no respondió la Encuesta Cuatrimestral ${anterior(per)}.`;
  if (s.disparo && s.disparo === s.not) {
    const nombres = [...new Set(parciales.filter((x) => x.e === e && x.periodo === per && x.estado !== 'Aprobado').map((x) => x.materia))];
    return nombres.length ? `Riesgo en los parciales: desaprobó o faltó en ${nombres.slice(0, 2).join(' y ')}.` : 'Seguimiento de los parciales del cuatrimestre.';
  }
  const r = respuestas.filter((x) => x.e === e && x.periodo === per).pop();
  if (r) {
    const sel = r.json.find((x) => x.item_id === 8768).respuestas;
    if (!sel.length) return 'Riesgo alto en la Encuesta Cuatrimestral: no cursó materias el cuatrimestre anterior.';
    if (sel.filter((m) => !m.primera_vez).length >= 2) return 'Riesgo en la Encuesta Cuatrimestral: recursa dos o más materias.';
    if (r.json.some((x) => x.item_id === 8265 && x.respuestas[0] === 1)) return 'Trabaja y se declara demorado en el avance de la carrera.';
  }
  return 'Entrevista de seguimiento del cuatrimestre.';
}
// Cada resultado lleva el estado que suele asignar el tutor después (verde, amarillo o rojo)
const RESULTADOS = {
  omision: [['No había visto el aviso de la encuesta. La respondió durante la entrevista y cursa con normalidad.', 'verde'], ['Dejó de cursar por problemas familiares. Piensa retomar el próximo cuatrimestre.', 'rojo'], ['Está trabajando jornada completa y no encuentra tiempo para cursar. Se evalúa una cursada reducida.', 'rojo'], ['Se olvidó de responder. Cursa tres materias y no reporta dificultades.', 'verde']],
  parciales: [['Le cuesta la materia: se lo deriva a las clases de consulta y a un asesor par.', 'amarillo'], ['Faltó al parcial por enfermedad. Rinde el recuperatorio y está bien encaminado.', 'verde'], ['Reconoce que no organiza bien el estudio. Se acuerda un cronograma semanal con el asesor par.', 'amarillo'], ['Desaprobó por poco. Se lo nota motivado; se hace seguimiento después del recuperatorio.', 'amarillo'], ['Desaprobó todos los parciales y piensa dejar la materia. Se lo deriva al gabinete psicopedagógico.', 'rojo']],
  recursa: [['Recursa dos materias del ciclo básico. Se acuerda priorizarlas y bajar la carga.', 'amarillo'], ['Está desmotivado con la carrera. Se lo deriva a orientación vocacional.', 'rojo'], ['Recursa porque se superponían los horarios con el trabajo. Ya lo resolvió y va bien.', 'verde']],
  inactivo: [['No cursó el cuatrimestre pasado por razones económicas. Se lo orienta sobre las becas de la universidad.', 'rojo'], ['Tomó un cuatrimestre sabático por salud. Retoma con dos materias.', 'amarillo']],
  trabaja: [['Trabaja y cursa pocas materias. Pide orientación para elegir qué cursar el próximo cuatrimestre.', 'amarillo'], ['Consiguió un trabajo de medio tiempo y reorganizó la cursada. Sin riesgo por ahora.', 'verde'], ['Respondió la encuesta pensando en el año anterior; en realidad va al día.', 'verde']],
  encuesta: [['Se habló del avance de la carrera. No reporta dificultades puntuales.', 'verde'], ['Pide orientación para elegir qué cursar el próximo cuatrimestre.', 'amarillo']],
  seguimiento: [['Cumplió lo acordado y mejoró en los parciales.', 'verde'], ['Sigue con dificultades, pero asiste a las consultas.', 'amarillo'], ['Retomó la cursada con dos materias. Buen avance.', 'verde']]
};
const ACCIONES = [
  { tipo_derivacion: 'asesor_par', descripcion: 'Encuentros semanales con un asesor par para preparar los parciales.' },
  { tipo_derivacion: 'reduccion_cursada', descripcion: 'Armar un plan de cursada compatible con el trabajo.' },
  { tipo_derivacion: 'psicopedagogia', descripcion: 'Derivación al gabinete psicopedagógico por técnicas de estudio.' },
  { tipo_derivacion: 'beca', descripcion: 'Averiguar si puede acceder a una beca de ayuda económica.' },
  { tipo_derivacion: 'otra', descripcion: 'Consultar con la cátedra las fechas de recuperatorio.' }
];
// Los textos salen de una pila mezclada y se recorren en orden: no se repiten hasta agotarla
const pilas = {};
function deLaPila(clave, lista) {
  if (!pilas[clave] || !pilas[clave].length) pilas[clave] = mezclar(lista);
  return pilas[clave].pop();
}
const tipoResultado = (motivo) => (/omisi/.test(motivo) ? 'omision' : /parciales|Necesito ayuda/.test(motivo) ? 'parciales' : /Seguimiento de las acciones/.test(motivo) ? 'seguimiento'
  : /recursa/.test(motivo) ? 'recursa' : /no cursó/.test(motivo) ? 'inactivo' : /Trabaja/.test(motivo) ? 'trabaja' : 'encuesta');

const entrevistas = [];
const agenda = []; // { acompanante, fecha } de las activas, para las 2 horas entre entrevistas del mismo día
function horarioLibre(acomp, desde, hasta) {
  for (let k = 0; k < 50; k++) {
    let f = entre(desde, hasta, 9, 18);
    f = masMinutos(f, -(local(f).mi % 30)); // en punto o y media
    const x = local(f);
    if (x.dow === 0 || x.dow === 6) continue;
    if (agenda.some((a) => a.acompanante === acomp.id && dia(a.fecha) === dia(f) && Math.abs(a.fecha - f) < 120 * 60000)) continue;
    agenda.push({ acompanante: acomp.id, fecha: f });
    return f;
  }
  throw new Error('No se encontró un horario libre para ' + acomp.nombre);
}
function nuevaEntrevista(e, acomp, origen, estado, motivo, solicitud, opciones) {
  const o = opciones || {};
  const propuestas = [];
  let fechaProg = '', fechaReal = '', resultado = '', tono = null, acciones = [];
  const primera = o.fecha || horarioLibre(acomp, dia(masDias(solicitud, 2)), dia(masDias(solicitud, 9)));
  propuestas.push({ por: origen === 'estudiante' ? 'estudiante' : 'acompanante', fecha: isoMinutos(primera), creada: isoMinutos(solicitud), mensaje: '' });
  let vigente = primera;
  if (o.contraoferta) {
    const otra = horarioLibre(acomp, dia(masDias(primera, 1)), dia(masDias(primera, 4)));
    const de = origen === 'estudiante' ? 'acompanante' : 'estudiante';
    propuestas.push({ por: de, fecha: isoMinutos(otra), creada: isoMinutos(masMinutos(solicitud, entero(120, 2000))), mensaje: de === 'estudiante' ? elegir(['Ese día curso hasta tarde. ¿Puede ser otro día?', 'Tengo parcial esa semana. ¿Podemos pasarla?', 'Trabajo a esa hora. ¿Puede ser más tarde?']) : elegir(['Ese horario lo tengo ocupado, te propongo este.', 'Ese día no estoy en la facultad.']) });
    vigente = otra;
  }
  if (['programada', 'realizada', 'no_asistio'].includes(estado)) fechaProg = isoMinutos(vigente);
  if (estado === 'realizada') {
    fechaReal = isoMinutos(vigente);
    [resultado, tono] = deLaPila('res-' + tipoResultado(motivo), RESULTADOS[tipoResultado(motivo)]);
    acciones = mezclar(ACCIONES).slice(0, entero(0, 2)).map((a) => {
      const compromiso = masDias(vigente, entero(7, 30));
      const vencida = compromiso < AHORA;
      return Object.assign({}, a, { fecha_compromiso: dia(compromiso), estado: vencida ? elegir(['cumplida', 'cumplida', 'cumplida', 'incumplida', 'pendiente']) : 'pendiente' });
    });
  }
  if (estado === 'no_asistio') resultado = elegir(['No se presentó ni avisó.', 'Avisó a último momento que no podía asistir.']);
  if (estado === 'cancelada') resultado = elegir(['El estudiante resolvió la consulta por correo con el departamento.', 'Se canceló por un paro docente; se vuelve a pedir más adelante.']);
  if (estado === 'rechazada') resultado = elegir(['El estudiante prefiere no tener la entrevista por ahora.', 'El acompañante no tiene disponibilidad en esas fechas; se lo deriva a otro.']);
  const ent = {
    ref: `ENT-${String(entrevistas.length + 1).padStart(3, '0')}`, e, acomp, origen, estado, motivo, solicitud, vigente, tono,
    campos: {
      dni: e.dni, id_usuario_estudiante: e.id, nombre_estudiante: nombreVisible(e.nombre), tipo_acompanante: acomp.tipo,
      id_usuario_acompanante: acomp.id, nombre_acompanante: acomp.nombre, originada_por: origen, estado, motivo,
      fecha_solicitud: isoMinutos(solicitud), fecha_programada: fechaProg, fecha_realizada: fechaReal, resultado,
      propuestas_json: JSON.stringify(propuestas), acciones_json: JSON.stringify(acciones)
    }
  };
  entrevistas.push(ent);
  return ent;
}

// Quiénes: los de señal más alta de cada período (2026-1 y 2026-2), más algunos que piden ayuda por su cuenta
const manuales = [];
function asignar(e, fecha, semaforoAsignado, motivo) {
  manuales.push({ e, fecha, periodo: fecha < aFecha('2026-08-01') ? '2026-1' : '2026-2', origen: 'manual', fuente: '', rid_fuente: '', indice: '', semaforo: semaforoAsignado, motivo });
}
{
  // La solicitud es posterior a lo que la disparó (la encuesta, la nota o el cierre del período anterior) y cae dentro de la ventana
  const despuesDe = (s, desde, hasta) => {
    const d = Math.max(masDias(aFecha(desde), entero(0, 18)).getTime(), masDias(s.disparo.fecha, entero(1, 10)).getTime());
    return d <= aFecha(hasta).getTime() ? masMinutos(new Date(d - (d % 86400000) + 3 * 3600000), entero(9 * 60, 18 * 60)) : null;
  };
  const conSenal = (per, minimo) => {
    const todos = estudiantes.map((e) => ({ e, s: senal(e, per) })).filter((x) => x.s.max >= minimo).sort((a, b) => b.s.max - a.s.max);
    const tipo = (x) => (x.s.disparo === x.s.om ? 'omision' : x.s.disparo === x.s.not ? 'notas' : 'encuesta');
    const grupos = { omision: [], encuesta: [], notas: [] };
    todos.forEach((x) => grupos[tipo(x)].push(x));
    const lista = [];
    while (Object.values(grupos).some((g) => g.length)) for (const k of ['encuesta', 'notas', 'omision']) if (grupos[k].length) lista.push(grupos[k].shift());
    return lista;
  };
  // 2026-1: entrevistas cerradas (realizadas, no asistió, cancelada)
  const usados1 = new Set();
  let i1 = 0;
  for (const { e, s } of conSenal('2026-1', 55)) {
    if (i1 >= 11) break;
    const solicitud = despuesDe(s, '2026-04-06', '2026-06-20');
    if (!solicitud) continue;
    usados1.add(e);
    const acomp = TUTORES[i1 % TUTORES.length];
    const estado = i1 < 8 ? 'realizada' : i1 < 10 ? 'no_asistio' : 'cancelada';
    const ent = nuevaEntrevista(e, acomp, 'tutor', estado, motivoDe(e, s, '2026-1'), solicitud, { contraoferta: chance(0.3) });
    if (estado === 'realizada' && chance(0.6)) asignar(e, masMinutos(ent.vigente, entero(60, 1500)), ent.tono, 'Entrevista: ' + ent.campos.resultado);
    i1++;
  }
  // 2026-2: abiertas y cerradas, con una sola activa por estudiante
  const lista2 = conSenal('2026-2', 45).filter((x) => !usados1.has(x.e) || chance(0.5));
  const plan2 = ['realizada', 'realizada', 'realizada', 'realizada', 'realizada', 'no_asistio', 'rechazada', 'programada', 'programada', 'programada', 'programada', 'falta_resultado', 'falta_resultado', 'solicitada', 'solicitada'];
  let i2 = 0;
  for (const { e, s } of lista2) {
    if (i2 >= plan2.length) break;
    const estado = plan2[i2];
    const acomp = TUTORES[(i2 + 1) % TUTORES.length];
    let solicitud = null, fecha;
    if (estado === 'programada') { solicitud = despuesDe(s, '2026-11-05', '2026-11-16'); fecha = solicitud && horarioLibre(acomp, '2026-11-18', '2026-12-04'); }
    else if (estado === 'falta_resultado') { solicitud = despuesDe(s, '2026-10-26', '2026-11-04'); fecha = solicitud && horarioLibre(acomp, '2026-11-09', '2026-11-16'); }
    else if (estado === 'solicitada') { solicitud = despuesDe(s, '2026-11-10', '2026-11-16'); fecha = solicitud && horarioLibre(acomp, '2026-11-19', '2026-11-27'); }
    else solicitud = despuesDe(s, '2026-09-01', '2026-10-30');
    if (!solicitud) continue;
    const ent = nuevaEntrevista(e, acomp, 'tutor', estado === 'falta_resultado' ? 'programada' : estado, motivoDe(e, s, '2026-2'), solicitud,
      { fecha, contraoferta: estado === 'solicitada' ? i2 % 2 === 0 : chance(0.25) });
    if (estado === 'realizada' && chance(0.7)) asignar(e, masMinutos(ent.vigente, entero(60, 1500)), ent.tono, 'Entrevista: ' + ent.campos.resultado);
    i2++;
  }
  // Seguimiento programado de una realizada en 2026-1, y entrevistas que piden los estudiantes a un asesor par
  const realizada1 = entrevistas.find((x) => x.estado === 'realizada' && x.vigente < aFecha('2026-08-01') && !entrevistas.some((y) => y.e === x.e && ['solicitada', 'programada'].includes(y.estado)));
  if (realizada1) nuevaEntrevista(realizada1.e, realizada1.acomp, 'tutor', 'programada', `Seguimiento de las acciones acordadas el ${dia(realizada1.vigente).split('-').reverse().slice(0, 2).join('/')}.`, entre('2026-11-09', '2026-11-13', 9, 18), { fecha: horarioLibre(realizada1.acomp, '2026-11-23', '2026-12-02') });
  const activos = (e) => entrevistas.some((y) => y.e === e && ['solicitada', 'programada'].includes(y.estado));
  const piden = mezclar(estudiantes.filter((e) => e.esPrimero && !activos(e) && parciales.some((x) => x.e === e && x.estado !== 'Aprobado'))).slice(0, 4);
  piden.forEach((e, i) => {
    const materia = parciales.filter((x) => x.e === e && x.estado !== 'Aprobado').pop().materia;
    const estado = ['realizada', 'solicitada', 'programada', 'cancelada'][i];
    const acomp = PARES[i % PARES.length];
    const solicitud = estado === 'realizada' ? entre('2026-09-25', '2026-10-20', 9, 22) : entre('2026-11-08', '2026-11-16', 9, 22);
    const fecha = estado === 'realizada' || estado === 'cancelada' ? undefined : horarioLibre(acomp, '2026-11-18', '2026-11-28');
    nuevaEntrevista(e, acomp, 'estudiante', estado, `Necesito ayuda con ${materia} antes del próximo parcial.`, solicitud, { fecha, contraoferta: estado === 'programada' });
  });
  // Estados asignados sin entrevista, y dos que después se quitaron
  const sinEnt = mezclar(estudiantes.filter((e) => !e.esPrimero && !entrevistas.some((x) => x.e === e))).slice(0, 3);
  sinEnt.forEach((e, i) => asignar(e, entre('2026-09-10', '2026-11-12', 9, 19), ['rojo', 'amarillo', 'verde'][i],
    ['Informe de la cátedra de Física: dejó de asistir a las clases prácticas.', 'Consultó por mail por una baja de materias; se hace seguimiento.', 'Aprobó dos finales en la mesa de octubre. Sin riesgo por ahora.'][i]));
  mezclar(manuales.filter((m) => m.semaforo !== 'verde' && m.fecha < aFecha('2026-10-20'))).slice(0, 2).forEach((m) => {
    const fecha = masDias(m.fecha, entero(10, 30));
    if (fecha < AHORA) manuales.push({ e: m.e, fecha, periodo: fecha < aFecha('2026-08-01') ? '2026-1' : '2026-2', origen: 'manual', fuente: '', rid_fuente: '', indice: '', semaforo: 'sin_asignar', motivo: 'Vuelve el calculado: cumplió lo acordado en la entrevista.' });
  });
}

// ---------------------------------------------------------
// SALIDA
// ---------------------------------------------------------
const todasCriticidad = criticidad.concat(manuales).sort((a, b) => a.fecha - b.fecha);
todasCriticidad.forEach((c, i) => { c.ref = `CRI-${String(i + 1).padStart(4, '0')}`; });

const archivos = {
  'estudiantes.json': {
    base: 'estudiantes', descripcion: 'Información personal de los 60 estudiantes ficticios (una entrada por estudiante).',
    entradas: estudiantes.map((e) => ({ ref: e.ref, perfil: e.perfil, campos: {
      id_usuario: e.id, dni: e.dni, nombre: e.nombre.nombre, apellido: e.nombre.apellido, email: e.email,
      es_primer_anio: e.esPrimero ? 'si' : 'no', anio_ingreso: e.cohorte.slice(0, 4), cuatrimestre_ingreso: e.cohorte.slice(5),
      periodo_paso_superior: e.paso && indice(e.paso) >= indice('2025-1') ? e.paso : ''
    } }))
  },
  'respuestas.json': {
    base: 'respuestas', descripcion: 'Encuestas Cuatrimestrales (versión 4) copiadas a la base Respuestas, de ' + PRIMER_PERIODO + ' a ' + PERIODO_ACTUAL + '.',
    entradas: respuestas.map((r) => ({ ref: r.ref, campos: {
      id_usuario: r.e.id, dni: r.e.dni, codigo_encuesta: 'cuatrimestral', version: '4', periodo: r.periodo,
      json_respuesta: JSON.stringify(r.json), created_at: iso(r.fecha)
    } }))
  },
  'parciales.json': {
    base: 'carga_parciales_primero', descripcion: 'Notas de parciales de 1.er año de 2026 (incluye recursantes de 2.º año en adelante).',
    entradas: parciales.map((x) => ({ ref: x.ref, cargada: iso(x.fecha), campos: {
      DNI: x.e.dni, Estudiante: nombreVisible(x.e.nombre), Materia: x.materia, Instancia: x.instancia, Periodo: x.periodo,
      Nota: String(x.nota), Estado: x.estado, Recupera_a: x.recupera_a
    } }))
  },
  'criticidad.json': {
    base: 'criticidad', descripcion: 'Entradas de Criticidad: una por nota, por respuesta y por omisión (calculadas con Tools v8), y los estados asignados. rid_fuente "@REF" se reemplaza por el rid real al aplicar. Las omisiones se desaprueban, como en el cierre real.',
    entradas: todasCriticidad.map((c) => {
      const auto = c.origen === 'automatica';
      const o = { ref: c.ref, campos: {
        id_usuario: c.e.id, dni: c.e.dni, periodo: c.periodo, origen: c.origen, fuente: c.fuente, rid_fuente: c.rid_fuente,
        indice: auto ? String(c.indice) : '', indice_total: auto ? String(c.indice) : '', semaforo: auto ? semaforo(c.indice) : c.semaforo,
        motivo: c.motivo, created_at: iso(c.fecha)
      } };
      if (c.desaprobar) o.desaprobar = true;
      return o;
    })
  },
  'entrevistas.json': {
    base: 'entrevistas', descripcion: 'Entrevistas con tutores y asesores pares ficticios (id 900901 a 900906), en distintos estados al ' + HOY.slice(0, 10) + '. Las contraofertas van en propuestas_json; no se usa RespuestasEntrevistas, porque la página solo acepta las respuestas que carga la cuenta de cada parte.',
    entradas: entrevistas.map((x) => ({ ref: x.ref, campos: x.campos }))
  }
};
const cabecera = { generado_con: 'data/prueba/generar.js', semilla: SEMILLA, fecha_de_referencia: HOY, aplicar: 'ver data/prueba/README.md' };
for (const [nombre, contenido] of Object.entries(archivos)) {
  fs.writeFileSync(path.join(SALIDA, nombre), JSON.stringify(Object.assign({}, cabecera, contenido), null, 1) + '\n');
}

// ---------------------------------------------------------
// CONTROL DE COHERENCIA
// ---------------------------------------------------------
const errores = [];
const refs = new Set([...respuestas.map((r) => r.ref), ...parciales.map((x) => x.ref)]);
todasCriticidad.forEach((c) => { if (c.rid_fuente && !refs.has(c.rid_fuente.slice(1))) errores.push(`${c.ref}: rid_fuente ${c.rid_fuente} no existe`); });
respuestas.forEach((r) => {
  const cr = r.json.find((x) => x.item_id === 8262).respuestas[0];
  const suma = r.json.find((x) => x.item_id === 8775).respuestas[0].materias.reduce((s, c) => s + MATERIA[c].creditos, 0);
  if (cr !== suma) errores.push(`${r.ref}: créditos ${cr} ≠ ${suma}`);
});
estudiantes.forEach((e) => {
  const act = entrevistas.filter((x) => x.e === e && ['solicitada', 'programada'].includes(x.estado));
  if (act.length > 1) errores.push(`${e.ref}: ${act.length} entrevistas activas`);
});
parciales.forEach((x) => { if (x.recupera_a && !parciales.some((y) => y.e === x.e && y.periodo === x.periodo && y.materia === x.materia && y.instancia === x.recupera_a)) errores.push(`${x.ref}: recuperatorio sin su parcial`); });
[...todasCriticidad, ...respuestas, ...parciales].forEach((x) => { if (x.fecha > AHORA) errores.push(`${x.ref}: fecha futura`); });
if (new Set(estudiantes.map((e) => e.dni)).size !== estudiantes.length) errores.push('DNI repetidos');

const iVerificar = process.argv.indexOf('--verificar');
if (iVerificar !== -1) {
  const ex = JSON.parse(fs.readFileSync(process.argv[iVerificar + 1], 'utf8'));
  const nombresReales = new Set((ex.nombres || []).map(normalizarNombre));
  const dnisReales = new Set((ex.dnis || []).map(String));
  [...estudiantes.map((e) => nombreVisible(e.nombre)), ...ACOMPANANTES.map((a) => a.nombre)].forEach((n) => { if (nombresReales.has(normalizarNombre(n))) errores.push(`Nombre de un participante real: ${n}`); });
  estudiantes.forEach((e) => { if (dnisReales.has(e.dni)) errores.push(`DNI ya usado en el campus: ${e.ref}`); });
  console.log(`Verificado contra ${nombresReales.size} nombres y ${dnisReales.size} DNI del campus.`);
}

// Lo que mostraría el Tablero en 2026-2 (CriticidadEstudiante de Tools v8)
const encuestaDe = Object.fromEntries(respuestas.map((r) => [r.ref, 'cuatrimestral']));
const tablero = { primero: {}, superior: {} };
estudiantes.forEach((e) => {
  const entradas = todasCriticidad.filter((c) => c.e === e).map((c) => ({ origen: c.origen, periodo: c.periodo, fuente: c.fuente, rid_fuente: c.rid_fuente.slice(1), indice: c.origen === 'automatica' ? String(c.indice) : '', semaforo: c.semaforo || '', created_at: iso(c.fecha) }));
  const r = Tools.CriticidadEstudiante(entradas, { primerAnio: e.esPrimero, periodo: PERIODO_ACTUAL, encuestas: encuestaDe });
  const t = tablero[e.esPrimero ? 'primero' : 'superior'];
  t[r.calculado.nivel] = (t[r.calculado.nivel] || 0) + 1;
  if (r.asignado) t.con_asignado = (t.con_asignado || 0) + 1;
});
const contar = (lista, f) => lista.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
console.log('──────────── DATOS DE PRUEBA ────────────');
console.log(`Estudiantes  : ${estudiantes.length} (${estudiantes.filter((e) => e.esPrimero).length} de 1.er año) · perfiles ${JSON.stringify(contar(estudiantes, (e) => e.perfil))}`);
console.log(`Respuestas   : ${respuestas.length} (${respuestas.filter((r) => r.reenvio).length} reenvíos; ${habilitadas} antes del ajuste) · por período ${JSON.stringify(contar(respuestas, (r) => r.periodo))}`);
console.log(`Parciales    : ${parciales.length} · ${JSON.stringify(contar(parciales, (x) => x.periodo))} · ${JSON.stringify(contar(parciales, (x) => x.estado))}`);
console.log(`Criticidad   : ${todasCriticidad.length} · ${JSON.stringify(contar(todasCriticidad, (c) => c.fuente || 'manual'))} · semáforo de las automáticas ${JSON.stringify(contar(criticidad, (c) => semaforo(c.indice)))}`);
console.log(`Entrevistas  : ${entrevistas.length} · ${JSON.stringify(contar(entrevistas, (x) => x.estado))}`);
console.log(`Tablero 2026-2 (calculado): 1.er año ${JSON.stringify(tablero.primero)} · 2.º en adelante ${JSON.stringify(tablero.superior)}`);
console.log(`Entradas a crear en Moodle: ${estudiantes.length + respuestas.length + parciales.length + todasCriticidad.length + entrevistas.length}`);
console.log(errores.length ? `✖ ${errores.length} problemas:\n  ${errores.slice(0, 20).join('\n  ')}` : '✔ Sin problemas de coherencia');
if (errores.length) process.exitCode = 1;
