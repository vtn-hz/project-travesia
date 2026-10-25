---
name: crear-seccion
description: Crea o desarrolla una sección nueva del Proyecto Travesía (section/<nombre>/content.html) con el estilo del proyecto (HTML autocontenido, estilos inline con !important, vanilla JS en IIFE, pie Zhakyz, vista previa local por rol y datos de prueba de los integrantes). Usar cuando pidan "crear", "desarrollar", "armar" o "hacer" una sección, un tablero, un panel o una pantalla del sistema, o cuando haya que agregar una tarjeta del menú con su pantalla.
---

# Crear una sección del Proyecto Travesía

Las reglas de estilo están en **`RULES.md`** (raíz del repo), que es la fuente de verdad. Leelo **siempre** antes de empezar: si esta skill y `RULES.md` dicen cosas distintas, manda `RULES.md`.

## Antes de escribir

1. Leé `RULES.md` completo: reglas de Moodle, arquitectura, estilos, naming, JS y componentes.
   Para todo lo visual, seguí la skill [`diseno-ui`](../diseno-ui/SKILL.md): tokens, componentes, íconos y **cero emojis**.
2. Leé lo que ya existe para copiar el estilo, no para inventarlo:
   - `section/menu_inicial/content.html`: **referencia de diseño** (ya migrada a `diseno-ui`): menú por roles, tarjetas generadas desde un array, íconos SVG y barra de vista previa.
   - `section/tablero_estudiantes/content.html`: tabla, filtros, resumen, modal de detalle y escritura a `mod_data`.
3. Revisá los requerimientos en `docs/context/requirements/` y la spec de la sección en `docs/specs/`, si existe.
4. Si el pedido es ambiguo en algo que cambia el diseño (por ejemplo, qué roles ven la sección o de dónde salen los datos), preguntá antes de escribir.

## Reglas que no se negocian

- **Desarrollar es siempre en local.** No se publica nada en Moodle sin una confirmación explícita y puntual (RULES, regla 3).
- **Un único archivo** `section/<nombre_snake>/content.html`, autocontenido, con un solo `<div>` raíz. Sin CSS, JS ni archivos externos.
- **Estilos 100 % inline con `!important`**, salvo las propiedades que se animan (`opacity`, `transform`, `background-position`): esas van **sin** `!important`, porque si no la animación no puede cambiarlas.
- Al `<head>` solo se inyectan `@keyframes`, desde JS, con un `id` propio para no duplicarlos.
- **Diseño según la skill `diseno-ui`:** tokens de `referencia/tokens.md`, íconos SVG de `iconos.js` y **ningún emoji**. Comparar el resultado con `muestrario.html`.
- **Comentarios de bloque en MAYÚSCULAS** en el HTML (`<!-- ENCABEZADO -->`) y separadores `// ----` en el JS.
- **IDs en español sin tildes**, con el patrón `{tipo}-{seccion}[-{variante}]`.
- **JS:** vanilla, dentro de un IIFE, configuración como `var` al principio, **un listener por tipo de evento** con `e.target.closest()` y limitado al contenedor de la sección.
- **Pie Zhakyz obligatorio** (`<!-- PIE DE PÁGINA ZHAKYZ -->`, `id="footer-zhakyz"`) al final del contenido, antes de modales y script.
- **Datos de prueba = los 6 integrantes de Zhakyz** (`docs/context/EQUIPO_ZHAKYZ.md`), identificados por su id de usuario de Moodle y con datos académicos ficticios. No se inventan personas ni se usan DNI o mails reales.
- **Solo bases propias de Zhakyz:** los CMID van en `null` hasta que existan. Mientras tanto se usan los datos de prueba y se muestra el aviso. Nunca se apunta a bases de otros equipos.
- **Los modelos de `docs/models/` no se aplican** hasta que el usuario lo indique.
- Todo texto que se inserta con `innerHTML` pasa por `escapar()`.
- **Dentro del JS, las etiquetas de cierre van escapadas: `'<\/svg>'`, no `'</svg>'`.** Como `content.html` no tiene `<body>`, Live Server inyecta su script antes del primer `</svg>` que encuentra y rompe el JS. Además, es buena práctica en todo `<script>` inline.
- **Todo el contenido va dentro de `<nolink>…</nolink>`**, justo adentro del contenedor raíz. El filtro de Moodle "Autoenlace de nombres de actividades" convierte palabras como "Encuestas" o "Preguntas" en links a **actividades de otros equipos**. Solo respeta `<nolink>` o `<span class="nolink">`; `class="nolink"` en un `div` no alcanza.
  - **`<nolink>` necesita `display: block`** desde el `<style>` inyectado (`'#<id> > nolink { display: block; }'`). Si no, el navegador lo trata como elemento en línea y en pantallas angostas tapa los clics. No se le puede poner `style` a la etiqueta, porque Moodle solo reconoce `<nolink>` exacto.
- **Tablas:** `border: 0 !important` en `th` y `td` (más el `border-top` de la fila): el tema Adaptable agrega bordes verticales.
- **Sin entidades HTML literales dentro del JS** (`'&#39;'`, `'&amp;'`…): escribirlas como `'\x26#39;'`, `'\x26amp;'`. El editor de Moodle decodifica las entidades al abrir la actividad para editarla, y si alguien guarda desde ahí, el script queda roto.
- **Vista previa local:** la barra de roles aparece con `file://` y con `localhost` o `127.0.0.1` (Live Server). En Moodle no se dibuja.

## ¿Sección simple o ítem de un grupo?

- **Sección simple:** una pantalla sola → `section/<nombre>/content.html`.
- **Ítem de un grupo:** varias pantallas que van juntas en una **subsección de Moodle** (por ejemplo "Utils" → `widgets` y `tools`) → `section/<grupo>/<item>/content.html`.
  - El grupo tiene un `section/<grupo>/seccion.json` con el nombre de la subsección en Moodle y la lista de ítems (carpeta, nombre, tipo y la clave de `moodle.config.json` → `paginas` donde va su `cmid`). Si el grupo es nuevo, crearlo. Si ya existe, agregar el ítem a `items`. Ejemplo: `section/utils/seccion.json`.
  - Los links relativos desde un ítem suben dos niveles: `../../<otra>/content.html`. Desde una sección simple hacia un ítem: `../<grupo>/<item>/content.html`.
  - El contenedor raíz de cada ítem tiene un id propio y único (por ejemplo `vitrina-widgets`, `vitrina-tools`), porque en Moodle varios ítems pueden convivir en la misma página del curso.

## Pasos

1. **Copiar la plantilla** [`plantilla.html`](plantilla.html) a `section/<nombre_snake>/content.html` (o a `section/<grupo>/<item>/content.html`) y reemplazar:
   - `__ID_SECCION__`: id del contenedor (por ejemplo, `tablero-estudiantes`).
   - `__SECCION__`: sufijo de los IDs internos (por ejemplo, `tablero`).
   - `__TITULO__`, `__SUBTITULO__` y `__ROLES__` (por ejemplo, `ADM, GES, TUT`).
   - En `ROLES`, dejar solo los roles que acceden a la sección.
2. **Desarrollar el contenido** dentro de `<!-- CONTENIDO -->`, con los componentes de `RULES.md`:
   - **Tarjeta:** ícono, badge, `<h4>`, `<p>` y CTA.
   - **Modal:** overlay fijo, encabezado con ✕ y cierre con Escape o clic afuera.
   - **Chips de rol** arriba a la derecha cuando el contenido depende del rol.
   - **Tablas** dentro de un `div` con `overflow-x: auto` para celular.
3. **Permisos por rol:** ocultar o deshabilitar acciones según `ROLES`, y explicarlo en la interfaz ("Solo tutores y administradores pueden…"). Recordar que esto es comodidad visual: la seguridad real la da la restricción por grupo de Moodle.
4. **Escritura a Moodle** (si la sección guarda datos): `POST` a `/mod/data/edit.php` con `FormData` (`id`, `rid=0`, `sesskey`, `field_<id>`). En local devuelve `{ local: true }` y actualiza solo la memoria.
5. **Conectar con el menú:** agregar el destino en `DESTINOS` de `section/menu_inicial/content.html` (por ejemplo, `'btn-<tarjeta>': '../<nombre>/content.html'`).
6. **Documentar:**
   - Crear o actualizar `docs/specs/<nombre-kebab>.md`: propósito, roles, qué muestra, reglas, datos de prueba, bases a crear con su plantilla `data-*` y pendientes.
   - Agregar la spec al árbol de `docs/README.md`.

## Verificación (obligatoria antes de entregar)

Con un navegador automatizado (por ejemplo, Playwright: `NODE_PATH=$(npm root -g) node …`), abriendo el archivo con `file://`:

- [ ] No hay errores de consola ni `pageerror`.
- [ ] Captura en 1000px de ancho y en **400px** (celular): nada se desborda y las tablas se pueden desplazar.
- [ ] Se probó cada rol de la barra de vista previa: cada uno ve y puede hacer solo lo que le corresponde.
- [ ] Se probaron los flujos principales (abrir y cerrar modales, filtros, guardar en local).
- [ ] Se ve el pie Zhakyz y el aviso de datos de prueba.
- [ ] Sin emojis: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]'` no devuelve nada.
- [ ] `grep` sin datos de otros equipos ni CMID ajenos.

Mirar las capturas antes de dar por terminado.

## Al terminar

- Resumir qué se hizo, qué se verificó y qué quedó pendiente (por ejemplo, las bases a crear o los criterios a validar).
- **No commitear ni publicar sin que lo pidan.** Proponer commits separados en inglés y en Conventional Commits, **sin coautorías ni atribuciones a agentes de IA**, por ejemplo:
  - `feat(<seccion>): add <descripción>`
  - `feat(menu): link <tarjeta> card`
  - `docs(specs): add <seccion> spec`
- Si piden publicar en Moodle: pedir confirmación explícita y seguir la regla 4 de `RULES.md` (relación 1 a 1: comentario de ubicación en el archivo y fila en la tabla de RULES).
