// ---------------------------------------------------------
// ARMADO DEL MANUAL DE UN ROL EN HTML (DESPUÉS SE IMPRIME A PDF CON CHROMIUM)
// ---------------------------------------------------------
// Compacto: varios pasos por página, sin saltos forzados. Un paso no se parte entre páginas.
// Imagen ancha (una franja) → ancho completo con la leyenda abajo; si no → imagen y leyenda lado a lado.
// Estilo según la skill diseno-ui: grises azulados, bordes finos y sin emojis.

const escapar = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PROPORCION_FRANJA = 2.4; // ancho / alto a partir del cual la imagen va a ancho completo

function armarPaso(p, n, img) {
  const leyenda = p.marcas.map((m, j) =>
    `<li><span class="num">${j + 1}</span><span>${escapar(m.texto)}</span></li>`).join('');
  const franja = img.ancho / img.alto >= PROPORCION_FRANJA;
  return `
      <div class="paso ${franja ? 'franja' : 'lado'}">
        <h3><span class="n">${n}</span>${escapar(p.titulo)}</h3>
        <div class="cuerpo">
          <img src="${escapar(img.archivo)}" alt="">
          <div class="texto">
            <p>${escapar(p.texto)}</p>
            ${leyenda ? `<ol class="leyenda">${leyenda}</ol>` : ''}
          </div>
        </div>
      </div>`;
}

function armarHtml({ rol, funcionalidades, color, fecha }) {
  const indice = funcionalidades.map((f, i) => `<li><span>${i + 1}.</span> ${escapar(f.guion.titulo)}</li>`).join('');
  const cuerpo = funcionalidades.map((f, i) => `
    <section class="funcionalidad">
      <h2><span class="fn">${i + 1}</span>${escapar(f.guion.titulo)}</h2>
      <p class="intro">${escapar(f.guion.introduccion)}</p>
      ${f.guion.pasos.map((p, j) => armarPaso(p, `${i + 1}.${j + 1}`, f.imagenes[j])).join('')}
    </section>`).join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Manual de usuario · ${escapar(rol.nombre)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Inter", "Segoe UI", Arial, Helvetica, sans-serif; color: #0b0e14; font-size: 9.5pt; line-height: 1.45; }
  .encabezado { border-bottom: 2px solid #0b0e14; padding-bottom: 4mm; margin-bottom: 5mm; }
  .marca { font-size: 8pt; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #47536b; }
  h1 { font-size: 22pt; line-height: 1.15; margin: 2mm 0 1mm; font-weight: 700; }
  .sub { font-size: 11pt; color: #47536b; margin: 0; }
  .ficha { margin-bottom: 6mm; }
  .caja { border: 1px solid #dadee7; border-radius: 6px; padding: 3mm 4mm; }
  .caja h4 { margin: 0 0 1.5mm; font-size: 8pt; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #47536b; }
  .caja ul, .caja ol { margin: 0; padding-left: 4mm; }
  .caja ol { list-style: none; padding-left: 0; } .caja ol span { color: #47536b; }
  h2 { font-size: 13pt; margin: 0 0 1.5mm; font-weight: 600; display: flex; align-items: center; gap: 2.5mm; page-break-after: avoid; }
  .fn { width: 7mm; height: 7mm; border-radius: 4px; background: #0b0e14; color: #fff; font-size: 10pt; display: inline-flex; align-items: center; justify-content: center; }
  .funcionalidad + .funcionalidad { margin-top: 8mm; }
  .intro { margin: 0 0 4mm; color: #333c4d; }
  .paso { page-break-inside: avoid; break-inside: avoid; margin-bottom: 5mm; }
  h3 { font-size: 10.5pt; margin: 0 0 1.5mm; font-weight: 600; display: flex; align-items: baseline; gap: 2mm; }
  h3 .n { color: ${color}; font-weight: 700; font-variant-numeric: tabular-nums; }
  .cuerpo img { display: block; border: 1px solid #dadee7; border-radius: 6px; background: #fff; }
  .lado .cuerpo { display: grid; grid-template-columns: 58% 1fr; gap: 4mm; align-items: start; }
  .lado .cuerpo img { width: 100%; max-height: 95mm; object-fit: contain; object-position: top left; }
  .franja .cuerpo img { width: 100%; margin-bottom: 2mm; }
  .texto p { margin: 0 0 2mm; color: #333c4d; }
  .leyenda { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.5mm; }
  .franja .leyenda { grid-template-columns: 1fr 1fr; column-gap: 5mm; }
  .leyenda li { display: grid; grid-template-columns: 6mm 1fr; align-items: start; }
  .num { width: 4.6mm; height: 4.6mm; border-radius: 50%; background: ${color}; color: #fff; font-weight: 700; font-size: 7.5pt; display: inline-flex; align-items: center; justify-content: center; margin-top: .3mm; }
</style>
</head>
<body>
  <header class="encabezado">
    <div class="marca">Proyecto Travesía · SBIRE</div>
    <h1>Manual de usuario: ${escapar(rol.nombre)}</h1>
    <p class="sub">Sistema de seguimiento de estudiantes de Ingeniería Industrial · ${escapar(fecha)}</p>
  </header>
  <div class="ficha">
    <div class="caja"><h4>Contenido</h4><ol>${indice}</ol></div>
  </div>
  ${cuerpo}
</body>
</html>`;
}

// ---------------------------------------------------------
// MISMO MANUAL EN MARKDOWN: solo texto (las imágenes van solo en el PDF); cada paso conserva la leyenda de sus marcas
// ---------------------------------------------------------
function armarMd({ rol, funcionalidades, fecha }) {
  const linea = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const partes = [
    `# Manual de usuario: ${rol.nombre}`,
    '',
    `Proyecto Travesía · SBIRE — Sistema de seguimiento de estudiantes de Ingeniería Industrial · ${fecha}`,
    '',
    '## Contenido',
    '',
    ...funcionalidades.map((f, i) => `${i + 1}. ${linea(f.guion.titulo)}`),
  ];
  funcionalidades.forEach((f, i) => {
    partes.push('', `## ${i + 1}. ${linea(f.guion.titulo)}`, '', linea(f.guion.introduccion));
    f.guion.pasos.forEach((p, j) => {
      partes.push('', `### ${i + 1}.${j + 1} ${linea(p.titulo)}`, '', linea(p.texto));
      if (p.marcas.length) partes.push('', ...p.marcas.map((m, k) => `${k + 1}. ${linea(m.texto)}`));
    });
  });
  partes.push('', '---', '', `Zhakyz & Asociados · Proyecto Travesía · Manual de usuario: ${rol.nombre}`, '');
  return partes.join('\n');
}

module.exports = { armarHtml, armarMd };
