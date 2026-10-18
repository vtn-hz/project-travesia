// ---------------------------------------------------------
// CONFIGURACIÓN CENTRAL DE MOODLE (moodle.config.json EN LA RAÍZ DEL REPO)
// ---------------------------------------------------------
// Única fuente de los datos del entorno (campus, curso, sección Zhakyz) y de los ids de Moodle
// (subsecciones, páginas y bases). Los scripts la leen con require; las secciones HTML no pueden
// leerla en Moodle, así que llevan una copia de cada valor en las líneas marcadas con "// @config <ruta>",
// que se reescriben con sincronizar_config.js.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const RUTA = path.join(RAIZ, 'moodle.config.json');
const DIR_SECCIONES = path.join(RAIZ, 'section');

function cargar() {
  return JSON.parse(fs.readFileSync(RUTA, 'utf8'));
}

function guardar(config) {
  fs.writeFileSync(RUTA, JSON.stringify(config, null, 2) + '\n');
}

// VALOR DE UNA RUTA "a.b.c" (undefined si la ruta no existe; null es un valor válido)
function valor(config, ruta) {
  return ruta.split('.').reduce((o, k) => (o !== null && typeof o === 'object' && k in o ? o[k] : undefined), config);
}

// VALOR EN SINTAXIS JS, CON EL ESTILO DE LAS SECCIONES (COMILLAS SIMPLES)
function literal(v) {
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  return JSON.stringify(v);
}

// LÍNEA MARCADA: "var NOMBRE = <valor>; // @config <ruta>[ · comentario]"
const MARCA = /^(\s*var\s+\w+\s*=\s*)(.*?);(\s*\/\/\s*@config\s+([\w.]+)\b.*)$/;

// REESCRIBIR LAS LÍNEAS MARCADAS DE UN TEXTO. Devuelve el texto nuevo, los cambios y las rutas inexistentes.
function aplicar(texto, config) {
  const cambios = [];
  const errores = [];
  const lineas = texto.split('\n').map((linea, i) => {
    const m = linea.match(MARCA);
    if (!m) return linea;
    const v = valor(config, m[4]);
    if (v === undefined) {
      errores.push(`línea ${i + 1}: la ruta "${m[4]}" no existe en moodle.config.json`);
      return linea;
    }
    const nuevo = literal(v);
    if (nuevo === m[2].trim()) return linea;
    cambios.push(`línea ${i + 1}: ${m[4]} ${m[2].trim()} → ${nuevo}`);
    return m[1] + nuevo + ';' + m[3];
  });
  return { texto: lineas.join('\n'), cambios, errores };
}

// TODOS LOS content.html DE section/ (SIMPLES E ÍTEMS DE GRUPO)
function secciones(dir = DIR_SECCIONES) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return secciones(ruta);
    return e.name === 'content.html' ? [ruta] : [];
  });
}

// SINCRONIZAR LAS SECCIONES CON LA CONFIGURACIÓN (escribir = false solo informa)
function sincronizar({ escribir = true, archivos = secciones() } = {}) {
  const config = cargar();
  return archivos.map((archivo) => {
    const original = fs.readFileSync(archivo, 'utf8');
    const r = aplicar(original, config);
    if (escribir && r.texto !== original) fs.writeFileSync(archivo, r.texto);
    return { archivo: path.relative(RAIZ, archivo), cambios: r.cambios, errores: r.errores };
  });
}

module.exports = { RAIZ, RUTA, cargar, guardar, valor, aplicar, secciones, sincronizar };
