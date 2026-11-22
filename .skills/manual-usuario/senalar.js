// ---------------------------------------------------------
// SEÑALIZACIÓN DE CAPTURAS (SE EJECUTA DENTRO DE LA PÁGINA CON page.evaluate)
// ---------------------------------------------------------
// Dibuja sobre la página, antes de la captura, un recuadro y un número por cada marca.
// Las marcas se ubican por selector, así que caen siempre sobre el elemento real.
// Devuelve el rectángulo que abarca los elementos marcados (para recortar la captura)
// y la lista de marcas que no se encontraron.
//
// marca = { selector, indice?, texto, margen? }   (indice: cuál de los elementos que coinciden; por defecto 0)
module.exports = function senalar({ marcas, color, capa }) {
  const viejo = document.getElementById(capa);
  if (viejo) viejo.remove();
  const raiz = document.createElement('div');
  raiz.id = capa;
  raiz.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none;';
  document.body.appendChild(raiz);

  const faltan = [];
  const cajas = [];
  marcas.forEach((m, i) => {
    const el = document.querySelectorAll(m.selector)[m.indice || 0];
    if (!el) { faltan.push(m.selector); return; }
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) { faltan.push(m.selector + ' (sin tamaño)'); return; }
    const g = m.margen == null ? 4 : m.margen;
    const x = r.left + window.scrollX - g;
    const y = r.top + window.scrollY - g;
    const w = r.width + g * 2;
    const h = r.height + g * 2;
    cajas.push({ x, y, w, h });

    const caja = document.createElement('div');
    caja.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;` +
      `border:3px solid ${color};border-radius:8px;box-sizing:border-box;` +
      `box-shadow:0 0 0 3px rgba(255,255,255,.85);`;
    const num = document.createElement('div');
    num.textContent = String(i + 1);
    const d = 28;
    // EL NÚMERO VA EN LA ESQUINA SUPERIOR IZQUIERDA, POR FUERA; SI NO ENTRA, POR DENTRO
    const nx = x - d / 2 < window.scrollX ? x + 4 : x - d / 2;
    const ny = y - d / 2 < 0 ? y + 4 : y - d / 2;
    num.style.cssText = `position:absolute;left:${nx}px;top:${ny}px;width:${d}px;height:${d}px;border-radius:50%;` +
      `background:${color};color:#fff;font:700 15px/28px Arial,Helvetica,sans-serif;text-align:center;` +
      `box-shadow:0 0 0 2px #fff,0 2px 6px rgba(0,0,0,.35);`;
    raiz.append(caja, num);
  });

  const abarca = cajas.length ? {
    x: Math.min(...cajas.map((c) => c.x)),
    y: Math.min(...cajas.map((c) => c.y)),
    x2: Math.max(...cajas.map((c) => c.x + c.w)),
    y2: Math.max(...cajas.map((c) => c.y + c.h)),
  } : null;
  return { faltan, abarca };
};
