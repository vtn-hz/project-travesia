---
name: diseno-ui
description: Sistema de diseño visual del Proyecto Travesía, basado en la plantilla Dashboard de Material UI (tokens de color, tipografía, espaciado, componentes, semáforo de riesgo e íconos SVG de Material Icons, sin emojis). Usar al diseñar, rediseñar o revisar la apariencia de cualquier sección, tarjeta, tabla, tablero, modal o formulario del sistema, o cuando pidan que algo se vea más serio, profesional o consistente.
---

# Diseño UI — Proyecto Travesía

Es un **sistema de seguimiento de estudiantes en riesgo**: la interfaz tiene que transmitir seriedad, claridad y confianza. El estilo sigue la **plantilla Dashboard de Material UI v9.5.0**: sobria, con grises azulados, color usado con propósito, tarjetas con borde y sin sombra, y tipografía firme.

Esta skill define **cómo se ve**. La skill [`crear-seccion`](../crear-seccion/SKILL.md) define **cómo se arma** una sección, y [`RULES.md`](../../RULES.md) define las restricciones técnicas (estilos inline con `!important`, sin dependencias externas, sin CDNs, sin fuentes externas).

> **Estado:** sistema de diseño **oficial** del proyecto ([ADR-004](../../docs/decisions/004-sistema-de-diseno-mui.md)). Aplicarlo en toda sección nueva o que se modifique. Referencia ya migrada: `section/menu_inicial/content.html`.

## Archivos

| Archivo | Contenido |
|---|---|
| [`referencia/tokens.md`](referencia/tokens.md) | **Todos los valores**: escalas de color, colores semánticos, semáforo, tipografía, espaciado, radios, sombras y tamaños |
| [`iconos.js`](iconos.js) | `ICONOS` (30 íconos Material Outlined como SVG inline) y la función `icono(nombre, tamaño)` |
| [`muestrario.html`](muestrario.html) | Todos los componentes renderizados. Abrirlo para ver cómo tiene que quedar |

## Principios

1. **Sin emojis.** Nunca en la interfaz (títulos, botones, chips, tarjetas, estados, pies). Se ven distinto en cada sistema, los lectores de pantalla los leen en voz alta y le quitan seriedad. En su lugar van íconos de `iconos.js`.
2. **El color comunica estado, no decora.** La base es gris (texto `#0b0e14` y `#47536b`, bordes `divider`). El color aparece en el semáforo, en las tendencias y en una sola acción principal por pantalla.
3. **Nunca solo color.** Todo estado lleva **punto de color + texto** ("Riesgo alto"), por accesibilidad: daltonismo y lectura en blanco y negro.
4. **Tarjetas planas:** fondo blanco, borde 1px `divider`, radio 8 y **sin sombra**. La sombra base solo va en elementos flotantes (modal, menú).
5. **Jerarquía con tipografía, no con tamaño de color.** Título h4 (24/600), títulos de tarjeta subtitle2 (14/500), texto body (14/400) y ayudas caption (12/400, gris).
6. **Botones en minúscula** (`text-transform: none`), alto 40px y radio 8. La acción principal es oscura (gris 700→800) o azul brand; las secundarias, *outlined* grises.
7. **Densidad de dashboard:** espaciado en múltiplos de 8, tablas con filas de 52px y números grandes en las tarjetas de estadística.
8. **Contraste AA como mínimo** en todo texto. No usar gris 400 para texto que haya que leer.

## Componentes (fragmentos inline listos para usar)

Todos van con `!important` en cada propiedad, según `RULES.md`.

### Tarjeta (outlined)
```html
<div style="background-color: #ffffff !important; border: 1px solid rgba(194, 201, 214, 0.4) !important; border-radius: 8px !important; padding: 16px !important; display: flex !important; flex-direction: column !important; gap: 16px !important; box-sizing: border-box !important;">
```

### Tarjeta de estadística (StatCard)
Título subtitle2, valor de 24px/600, chip de tendencia a la derecha y caption con el período.
```html
<div style="font-size: 14px !important; font-weight: 500 !important; color: #0b0e14 !important;">Riesgo alto</div>
<div style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
  <span style="font-size: 24px !important; font-weight: 600 !important; line-height: 1.2 !important; color: #0b0e14 !important;">2</span>
  <!-- chip de estado -->
</div>
<div style="font-size: 12px !important; color: #47536b !important;">Cierre 2026-2</div>
```

### Chip de estado (semáforo)
```html
<span style="display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 24px !important; padding: 0 8px !important; border-radius: 999px !important; border: 1px solid #fdcece !important; background-color: #fff0f0 !important; color: #910808 !important; font-size: 12px !important; font-weight: 600 !important; white-space: nowrap !important;">
  <span style="width: 8px !important; height: 8px !important; border-radius: 50% !important; background-color: #c20a0a !important;"></span>Riesgo alto</span>
```
Los colores de riesgo medio, sin riesgo y neutro están en `referencia/tokens.md` → *Semáforo*.

### Botones
```html
<!-- Principal (oscuro) -->
<button style="height: 40px !important; padding: 0 16px !important; border-radius: 8px !important; border: 1px solid #333c4d !important; background-image: linear-gradient(to bottom, #333c4d, #0b0e14) !important; color: #ffffff !important; font-size: 14px !important; font-weight: 500 !important; text-transform: none !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 8px !important;">Ver estudiantes</button>
<!-- Secundario (outlined) -->
<button style="height: 40px !important; padding: 0 16px !important; border-radius: 8px !important; border: 1px solid #dadee7 !important; background-color: rgba(245, 246, 250, 0.3) !important; color: #0b0e14 !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important;">Exportar</button>
```
Variante de color (azul brand): `border: 1px solid #026bd4`, `background-image: linear-gradient(to bottom, rgba(2, 122, 242, 0.8), #026bd4)`, texto blanco.

### Ícono en recuadro (encabezado de tarjeta)
```html
<span style="width: 36px !important; height: 36px !important; border-radius: 8px !important; background-color: #f5f6fa !important; border: 1px solid #dadee7 !important; color: #47536b !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;">' + icono('tablero', 20) + '</span>
```
Para darle color de categoría, cambiar el fondo por el paso 50 de la escala, el borde por el 100 o 200, y `color` por el 500 o 700.

### Input y select
```html
<input style="height: 40px !important; padding: 8px 12px !important; border-radius: 8px !important; border: 1px solid rgba(194, 201, 214, 0.4) !important; background-color: #fcfcfc !important; color: #0b0e14 !important; font-size: 14px !important; box-sizing: border-box !important;">
```
Al recibir el foco: `outline: 3px solid rgba(2, 107, 212, 0.5) !important; outline-offset: 2px !important;` (inyectarlo como regla `:focus-visible` en el `<style>` del `<head>` junto con los `@keyframes`).

### Tabla
- Contenedor: borde 1px `divider`, radio 8, `overflow-x: auto`.
- Encabezado: fondo `#f5f6fa`, texto 14px/500 `#47536b`, alto 52px.
- Filas: alto 52px, separador superior 1px `divider` y hover `rgba(218, 222, 231, 0.2)`.
- Números alineados a la derecha.

### Alerta / aviso
```html
<div style="display: flex !important; gap: 10px !important; align-items: flex-start !important; padding: 10px 14px !important; border-radius: 10px !important; background-color: #fdf1ce !important; border: 1px solid rgba(246, 206, 85, 0.5) !important; color: #0b0e14 !important; font-size: 14px !important;">
  <span style="color: #aa8109 !important;">' + icono('alerta', 20) + '</span><span>…</span></div>
```
Variante informativa: fondo `#e5f2ff`, borde `rgba(77, 166, 255, 0.4)` e ícono `#026bd4`.

### Modal
Overlay `rgba(5, 7, 10, 0.5)`. Caja blanca con radio 10, borde 1px `divider` y sombra base. Título h5 (20/600). Cierre con el ícono `cerrar` en un botón de 32px.

## Íconos

1. Copiar de [`iconos.js`](iconos.js) **solo** los íconos que use la sección, dentro de un objeto `ICONOS`, junto con la función `icono()`.
2. Insertarlos con `icono('nombre', 20)`. Heredan el color del texto (`currentColor`).
3. Siempre acompañados de texto visible, o de `aria-label` si el botón es solo un ícono.
4. Si falta alguno, tomarlo del set **Material Icons Outlined** (paquete `@material-design-icons/svg`, Apache 2.0) y agregarlo a `iconos.js` con su nombre original en el comentario.

| Nombre | Material | Uso sugerido |
|---|---|---|
| `tablero` | speed | Tablero de criticidad |
| `entrevistas` | event_note | Entrevistas y tutorías |
| `indicadores` | insights | Indicadores de cohorte |
| `reportes` | description | Reportes |
| `importar` | upload_file | Importar datos |
| `encuestas` | quiz | Encuestas y preguntas |
| `plan` | account_tree | Plan de estudios y correlativas |
| `configuracion` | settings | Configuración |
| `estudiantes` / `estudiante` | groups / person | Listas y perfiles |
| `ok` / `error` / `alerta` / `info` | check_circle / error / warning / info | Estados del sistema y avisos |
| `buscar`, `descargar`, `cerrar`, `ver`, `flecha`, `chevron` | — | Acciones |
| `asignado` | assignment_ind | Estado asignado por un tutor |
| `calendario`, `horario` | calendar_month, schedule | Turnos |

## Verificación

- [ ] Ningún emoji: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' content.html` no devuelve nada.
- [ ] Todo color sale de `referencia/tokens.md`; no hay hex inventados.
- [ ] Todo estado tiene punto y texto.
- [ ] Captura comparada con `muestrario.html`: misma tipografía, radios, bordes y densidad.
- [ ] Contraste AA en los textos (los de la tabla de tokens ya cumplen).

## Licencias

- Plantilla Dashboard de Material UI: MIT (© Material UI SAS).
- Material Icons: Apache 2.0 (© Google).
