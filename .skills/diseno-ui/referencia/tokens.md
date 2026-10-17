# Tokens de diseño

Fuente principal: **plantilla Dashboard de Material UI v9.5.0**, en `docs/data/material/getting-started/templates/shared-theme/themePrimitives.js` y `customizations/*` (licencia MIT). Los valores HSL originales se pasaron a hexadecimal para usarlos en estilos inline.

Fuente secundaria: kit **Material UI for Figma (and MUI X)**, que aporta los estados de interacción, los tamaños de componentes y los íconos.

## Escalas de color

| Paso | brand | gray | green | orange | red |
|---|---|---|---|---|---|
| 50 | `#e5f2ff` | `#f5f6fa` | `#f6fef6` | `#fffbf0` | `#fff0f0` |
| 100 | `#d6ebff` | `#ebeef4` | `#e4fbe4` | `#fdf1ce` | `#fdcece` |
| 200 | `#99ccff` | `#dadee7` | `#c5f7c5` | `#fce49c` | `#fc9c9c` |
| 300 | `#4da6ff` | `#c2c9d6` | `#a1e8a1` | `#f6ce55` | `#f65555` |
| 400 | `#027af2` | `#94a0b8` | `#52bc52` | `#c2940a` | `#c20a0a` |
| 500 | `#026bd4` | `#566481` | `#1f7a1f` | `#aa8109` | `#910808` |
| 600 | `#1c8cfd` | `#47536b` | `#136c13` | `#7a5d06` | `#7a0606` |
| 700 | `#0059b3` | `#333c4d` | `#0a470a` | `#634b03` | `#590303` |
| 800 | `#002952` | `#0b0e14` | `#042f04` | `#503c02` | `#3c0202` |
| 900 | `#00366b` | `#05070a` | `#021d02` | `#3b2d02` | `#1e0101` |

## Colores semánticos (modo claro)

| Token | Valor | Uso |
|---|---|---|
| `primary.main` | `#027af2` (brand 400) | Acciones secundarias de color, links, foco |
| `primary.dark` | `#0059b3` (brand 700) | Hover de links |
| `text.primary` | `#0b0e14` (gray 800) | Títulos y texto principal |
| `text.secondary` | `#47536b` (gray 600) | Descripciones y etiquetas |
| `text.disabled` | `#94a0b8` (gray 400) | Deshabilitado, placeholders |
| `background.default` | `#fcfcfc` | Fondo de inputs y de la página |
| `background.paper` | `#f5f6fa` (gray 50) | Encabezados de tabla, zonas de apoyo |
| `divider` | `rgba(194, 201, 214, 0.4)` (gray 300 al 40 %) | Bordes de tarjetas, separadores |
| `action.hover` | `rgba(218, 222, 231, 0.2)` (gray 200 al 20 %) | Hover de filas |
| `action.selected` | `rgba(218, 222, 231, 0.3)` | Fila seleccionada |
| `success.main` | `#52bc52` (green 400) | Gráficos y tendencias positivas |
| `warning.main` | `#c2940a` (orange 400) | Gráficos y tendencias de alerta |
| `error.main` | `#c20a0a` (red 400) | Gráficos y tendencias negativas |
| Foco | `outline: 3px solid rgba(2, 107, 212, 0.5); outline-offset: 2px` | Foco visible en botones e inputs |

## Semáforo de riesgo (dominio SBIRE)

Se deriva del `Chip` de la plantilla: borde de 1px, fondo suave y texto oscuro.

| Estado | Punto | Fondo | Borde | Texto |
|---|---|---|---|---|
| Riesgo alto | `#c20a0a` | `#fff0f0` (red 50) | `#fdcece` (red 100) | `#910808` (red 500) |
| Riesgo medio | `#c2940a` | `#fffbf0` (orange 50) | `#fce49c` (orange 200) | `#7a5d06` (orange 600) * |
| Sin riesgo | `#52bc52` | `#f6fef6` (green 50) | `#c5f7c5` (green 200) | `#1f7a1f` (green 500) |
| Sin calcular / neutro | `#94a0b8` | `#ebeef4` (gray 100) | `#dadee7` (gray 200) | `#566481` (gray 500) |

\* La plantilla no trae un chip "warning". Este se armó con la escala orange, usando el paso 600 para el texto: con el 500 el contraste no llega a AA sobre fondo claro.

## Tipografía

**Familia:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

Inter no se carga desde afuera, porque Moodle no permite `<link>` externos. Si no está instalada, se usa la fuente del sistema, con métricas parecidas.

| Variante | Tamaño | Peso | Interlineado | Uso |
|---|---|---|---|---|
| h4 | 24px | 600 | 1.5 | Título de sección |
| h5 | 20px | 600 | 1.4 | Título de modal |
| h6 | 18px | 600 | 1.4 | Título de bloque |
| subtitle2 | 14px | 500 | 1.5 | Título de tarjeta, encabezado de tabla |
| body | 14px | 400 | 1.5 | Texto general |
| caption | 12px | 400 | 1.5 | Ayudas, pies, metadatos |
| overline | 12px | 600 | 1.5, `letter-spacing: 0.5px`, mayúsculas | Rótulos de grupo (con moderación) |
| valor KPI | 24px | 600 | 1.2 | Número de una tarjeta de estadística |

Los botones **no** van en mayúscula (`text-transform: none`).

## Espaciado, forma y profundidad

| Token | Valor |
|---|---|
| Unidad de espaciado | 8px. Escala: 4, 8, 12, 16, 24, 32, 40, 48 |
| Radio | **8px** (tarjetas, botones, inputs); 10px (alertas, modales); 999px (chips) |
| Sombra base | `0 4px 16px rgba(10, 13, 18, 0.07), 0 8px 16px -5px rgba(20, 23, 31, 0.07)`, solo para elementos flotantes (modal, menú) |
| Tarjetas | Sin sombra: borde de 1px `divider` |
| Ancho del contenedor | 850px (restricción de Moodle) |
| Breakpoints | sm 600, md 900, lg 1200 |

## Tamaños de componentes

| Componente | Medidas |
|---|---|
| Botón medium | alto 40px, padding 0 16px, radio 8, texto 14px/500 |
| Botón small | alto 36px, padding 8px 12px |
| Input | alto 40px (small: 36), padding 8px 12px, radio 8, borde `divider`, fondo `#fcfcfc` |
| Chip | alto 24px, padding 0 8px, radio 999px, texto 12px/600, borde 1px |
| Fila de tabla | alto 52px (compacta: 40), padding horizontal 12px |
| Tarjeta | padding 16px, gap 16px, radio 8 |
| Ícono | 20px (en botones y listas: 18; en tarjetas: 20 dentro de un recuadro de 36) |
