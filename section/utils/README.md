# Utils · widgets y herramientas compartidos

Cómo usar las bibliotecas de Utils y sus cargadores. **Widgets** son componentes con interfaz que completan un campo de una encuesta; **Tools** son herramientas sin interfaz, como la copia de respuestas. En Moodle, cada Página muestra el índice de su biblioteca, y en Widgets cada widget se abre con `#widget=<nombre>` en la dirección. Esta guía vive solo en el repo.

| Archivo | Qué es | En Moodle |
|---|---|---|
| [`widgets/content.html`](widgets/content.html) | La biblioteca de widgets (`window.ZhakyzUtils`) como script muerto | Página "Widgets" de la subsección "Utils", justo antes de "Pruebas" (`moodle.config.json` → `paginas.utils_widgets`). Muestra el índice de widgets y cada widget con `#widget=<nombre>` |
| [`cargador/content.html`](cargador/content.html) | El script que lee la biblioteca y crea un widget (`WIDGET`) para un campo de la encuesta (`CAMPO`) | No se publica solo: se copia en cada vista que usa un widget |
| [`tools/content.html`](tools/content.html) | La biblioteca de herramientas (`window.ZhakyzTools`) como script muerto | Página "Tools" de la subsección "Utils", después de "Widgets" (`paginas.utils_tools`). Muestra el índice de herramientas |
| [`cargador_tools/content.html`](cargador_tools/content.html) | El script que lee la biblioteca de herramientas y arranca una (`TOOL`) | No se publica solo: su copia es [`section/copia_encuestas`](../copia_encuestas/content.html), en los 5 ítems de copia de las encuestas |

Estado: **publicado el 2026-10-25** ([`DEPLOY.md`](../../DEPLOY.md)). Subsección "Utils" (sección 15749), antes de Pruebas → Página "Widgets" (cmid 59932). Copias del cargador publicadas en la Encuesta Inicial (ítem 8254: [`section/encuesta_inicial`](../encuesta_inicial/content.html)) y en la Cuatrimestral (ítems 8261 y 8270: [`section/encuesta_cuatrimestral`](../encuesta_cuatrimestral)). Página "Tools" (cmid 59941), publicada el mismo día, y sus 5 copias del cargador de tools (ítems 8772, 8771, 8770 y 8769 de la Inicial y 8773 de la Cuatrimestral: [`section/copia_encuestas`](../copia_encuestas/content.html)).

---

## 1. Biblioteca (`widgets/content.html`)

Un `<script type="text/plain" data-zk-biblioteca="widgets">` dentro de un `div` oculto. El menú de la misma página lo ejecuta para mostrar los widgets; el cargador de las otras vistas solo lee ese script. El navegador no ejecuta ese tipo de script, así que el código queda guardado como texto hasta que un cargador lo lee y lo ejecuta en su vista. Al ejecutarse define `window.ZhakyzUtils`:

| Miembro | Qué es |
|---|---|
| `version` | Número de versión. Si la página ya tiene esa versión o una más nueva, la biblioteca no se vuelve a definir |
| `CuadroCreditos` | Widget del cuadro de créditos (ver más abajo) |
| `SelectorMaterias` | Widget de las materias cursadas el cuatrimestre anterior (ver más abajo) |
| `cargarMaterias()` | Materias vigentes, una sola lectura por página: `{ lista, fuente }`. `fuente` es `'base'` (Moodle), `'csv'` (local con Live Server) o `'ejemplo'` (local con `file://`) |
| `OTROS_CREDITOS` | Créditos y requisitos de cada plan que no son materias |

**Agregar un widget:** escribir su constructor dentro del script muerto, exportarlo en `window.ZhakyzUtils` y subir `VERSION`. Dentro del script muerto valen las mismas reglas que en cualquier sección: `'<\/svg>'` y no `'</svg>'`, entidades como `'\x26amp;'`, y nunca un `</script>` literal, porque cerraría el script muerto antes de tiempo. Tampoco `\[`, `\(` ni `$$`, ni siquiera dentro de una expresión regular (usar `\x5B` y `\x5D`): el filtro de fórmulas de Moodle los toma como TeX y, al mostrar la página, escapa los `<` y `>` de todo el script, que deja de funcionar. Pasó con la Página Tools el 2026-10-25.

**Publicar** (con confirmación, como cualquier sección): `publicar.js --archivo section/utils/widgets/content.html --tipo pagina --nombre "Widgets"`. El script crea la subsección "Utils" al final de Zhakyz: después hay que moverla antes de "Pruebas". Anotar el cmid en `paginas.utils_widgets` y correr `sincronizar_config.js`, que lo copia al `CMID_UTILS` de los cargadores.

## 2. Cargador (`cargador/content.html`)

Pide la Página Widgets con `fetch`, saca el texto de la biblioteca con `DOMParser`, lo ejecuta una sola vez por página (la carga en curso queda en `window.ZhakyzUtilsCarga`, así que varios cargadores en la misma página comparten una sola lectura) y crea el widget.

Para usarlo en una vista:

1. Copiar el contenido del archivo en la vista, por ejemplo en el ítem "Área de texto y medios" `[[Cuadro]]` de una encuesta.
2. Ajustar la configuración del principio del script:
   - `WIDGET`: `'CuadroCreditos'` o `'SelectorMaterias'`.
   - `CAMPO`: selector del campo de la encuesta que recibe el valor. Moodle nombra cada input `<tipo>_<id del ítem>`.
   - `OPCIONES`: opciones del constructor (el `contenedor` lo pone el cargador).
   - `RUTA_LOCAL_UTILS`: ruta a `widgets/content.html` desde la vista, solo para la vista local.
   - `CMID_UTILS` no se toca: lo completa `sincronizar_config.js`.

El cargador no usa ids propios: se ubica con `document.currentScript`, así que se puede copiar más de una vez en la misma página sin cambiar nada. Los cargadores de una misma página comparten una sola lectura de la biblioteca.

| Vista | Ítem donde va el cargador | `WIDGET` | `CAMPO` |
|---|---|---|---|
| Encuesta Inicial (cmid 59710) | 8254 | `CuadroCreditos` | `input[name="numeric_8253"]` |
| Encuesta Cuatrimestral (cmid 59712) | 8261 (`[[Cuadro]]`) | `CuadroCreditos` | `input[name="numeric_8262"]` |
| Encuesta Cuatrimestral (cmid 59712) | 8270 (`[Select de todas las materias]`) | `SelectorMaterias` | `textarea[name="textarea_8768"]`: la respuesta larga `materias_cuatrimestre`, creada el 2026-10-25 en lugar del 8273 |

Si la biblioteca no se puede cargar (Página sin publicar, sin acceso o sin red), el cargador muestra un aviso y la pregunta queda editable para completarla a mano. En local, la pregunta se simula con el mismo nombre que en Moodle.

## 3. Tools (`tools/content.html`)

Igual que la de widgets: un `<script type="text/plain" data-zk-biblioteca="tools">` dentro de un `div` oculto. Al ejecutarse define `window.ZhakyzTools`:

| Miembro | Qué es |
|---|---|
| `version` | Número de versión. Si la página ya tiene esa versión o una más nueva, la biblioteca no se vuelve a definir |
| `CopiaRespuestas({ contenedor })` | Copia cada envío de las Encuestas Inicial y Cuatrimestral a la base Respuestas, con su criticidad ([spec](../../docs/specs/copia-encuestas.md)). Una sola instancia por página: si hay varias copias del cargador, arranca la primera. En Editar preguntas y en la vista previa muestra un aviso para el equipo con el control de la estructura de páginas; en local, el simulador de las dos encuestas |
| `LeerBase(opciones)` | Lee todas las entradas de una base de datos, página por página (ver más abajo). **Ninguna vista la usa por ahora** |

Al ejecutarse, la biblioteca avisa con el evento `zk-tools` en `document`, con las herramientas en `detail`.

La Página muestra solo el índice **Tool Documentation**: las herramientas no tienen interfaz. Las mismas reglas del script muerto de widgets valen acá.

**Agregar una herramienta:** escribir su función dentro del script muerto, exportarla en `window.ZhakyzTools`, sumar su texto a la tabla `TOOLS` del índice y subir `VERSION`.

**Publicar** (con confirmación): `publicar.js --archivo section/utils/tools/content.html --tipo pagina --nombre "Tools"`. Anotar el cmid en `paginas.utils_tools` y correr `sincronizar_config.js`, que lo copia al `CMID_TOOLS` de los cargadores de tools. Un cambio en una herramienta se publica solo acá: los ítems de las encuestas no cambian.

## 4. Cargador de tools (`cargador_tools/content.html`)

Como el de widgets: pide la Página Tools con `fetch`, ejecuta su biblioteca una sola vez por página (`window.ZhakyzToolsCarga`) y llama a `ZhakyzTools[TOOL]({ contenedor })`. Configuración: `TOOL`, `OPCIONES` y `RUTA_LOCAL_TOOLS` (solo para la vista local); `CMID_TOOLS` lo completa `sincronizar_config.js`.

**Solo la biblioteca (`TOOL = null`):** no arranca ninguna herramienta. La vista usa las herramientas desde su propio código, como `LeerBase` (ver el ejemplo más abajo). Las copias publicadas en las encuestas son anteriores a este modo y no lo necesitan: se actualizan la próxima vez que cambie el cargador.

Si la biblioteca no se puede cargar, en la encuesta que responde el estudiante **no muestra nada**: la encuesta se envía igual, solo que sin copia. En Editar preguntas, en la vista previa y en local sí muestra el aviso.

| Vista | Ítems donde va el cargador | `TOOL` |
|---|---|---|
| Encuesta Inicial (cmid 59710) | Uno al final de cada una de las 4 páginas. El de la página 4 depende de `trabaja` = Si, igual que la 8260 | `CopiaRespuestas` |
| Encuesta Cuatrimestral (cmid 59712) | Uno al final de la página | `CopiaRespuestas` |

Los 5 ítems tienen el mismo contenido: [`section/copia_encuestas/content.html`](../copia_encuestas/content.html).

## Herramienta: `LeerBase`

Lee **todas** las entradas de una base de datos (`mod_data`) y las devuelve juntas. Moodle muestra las entradas de a `perpage` por página y no informa el total, así que la herramienta pide `view.php?d=…&perpage=…&page=N` desde la página 0 hasta que una trae menos entradas que `porPagina`, o la barra de páginas no tiene una siguiente. Reemplaza el `perpage=1000` (o `2000`) de un solo pedido, que corta sin aviso las entradas que sobran. **Ninguna vista la usa todavía.**

```js
ZhakyzTools.LeerBase({
  dataid: 117,               // id de la base (d=…). O cmid: 59521. Uno de los dos
  porPagina: 500,            // entradas por pedido. Por defecto 500
  paralelo: 2,               // pedidos a la vez después del primero. Por defecto 1
  maximo: 20000,             // tope de entradas, por seguridad. Por defecto 20000
  // Solo para plantillas sin data-campo: qué filas leer y el nombre de cada celda (td), en orden
  filas: 'tr[data-tipo="entrada_parcial"]',
  columnas: ['DNI', 'Estudiante', 'Materia', 'Instancia', 'Fecha', 'Nota', 'Estado'],
  filtro: function (e) { return e.campos.Materia === 'INGM101'; },  // opcional, mientras lee
  alAvanzar: function (leidas, pagina) { /* opcional: progreso */ }
}).then(function (r) {
  r.entradas;  // [{ rid: '19498', campos: { DNI: '…', … } }]; con plantilla propia, además alta y modificada (data-alta, data-modificada)
  r.formato;   // 'propio' (data-campo), 'columnas' (filas + columnas), 'defecto' (plantilla de Moodle) o null (base vacía)
  r.paginas;   // páginas leídas
  r.completa;  // false si cortó por "maximo"
});
```

| Formato | Cómo lo reconoce | `campos` |
|---|---|---|
| `propio` | Filas `.zk-registro` (plantillas del repo) | Una clave por celda `data-campo` |
| `columnas` | Se pasan `filas` y `columnas` (plantillas del equipo, como Carga_Parciales_Primero) | Una clave por celda, con el nombre de `columnas` en el mismo orden |
| `defecto` | Filas `.defaulttemplate-listentry` (plantilla de Moodle) | Una clave por campo, con su nombre en Moodle |

- **Rechaza la promesa** si Moodle responde con error HTTP, si la sesión venció (página de login) o si el usuario no puede ver la base (página de error). Sin `dataid` ni `cmid`, o con `filas` sin `columnas`, rechaza sin pedir nada.
- **Lee solo el contenido de la actividad** (`#region-main`): no toma filas de otros bloques de la página.
- **Sin duplicados:** si la base cambia mientras se lee y una entrada pasa de una página a otra, se cuenta una sola vez (por su `rid`).
- **En paralelo**, no pide páginas más allá de la última que muestra la barra.
- **Costo:** cada pedido trae unos 255 KB de la plantilla del campus, más las entradas.
- **Preferencia:** Moodle guarda `perpage` como preferencia del usuario para esa base. Después de una lectura, quien abra la base en Moodle ve `porPagina` entradas por página.
- Solo funciona dentro de Moodle (`M.cfg.wwwroot`). Para las pruebas se puede pasar `urlBase`.

**Cómo se usa desde una vista:** la vista lleva una copia del cargador de tools con `TOOL = null`, y en su código:

```js
function conTools(fn) {
  if (window.ZhakyzTools) return fn(window.ZhakyzTools);
  document.addEventListener('zk-tools', function (e) { fn(e.detail); }, { once: true });
}

conTools(function (Tools) {
  Tools.LeerBase({ dataid: 152 }).then(function (r) { /* r.entradas */ }, function (e) { /* aviso con e.message */ });
});
```

Desde otra herramienta de la biblioteca (por ejemplo `CopiaRespuestas`), se llama directo: `LeerBase({ … })`.

**Probado en local (2026-10-25)** con páginas de `view.php` simuladas:
- los tres formatos;
- varias páginas, múltiplos exactos con y sin barra, y sin barra de páginas;
- en paralelo, con tope, con una base que cambia mientras se lee, con filtro y progreso;
- base vacía, sesión vencida, página de error y HTTP 500;
- el cargador con `TOOL = null`.

## Widget: `CuadroCreditos`

```js
var cuadro = new ZhakyzUtils.CuadroCreditos('input[name="numeric_8262"]', {
  contenedor: '#cuadro-creditos-cuatrimestral' // opcional
});
cuadro.total();     // créditos seleccionados del plan actual, por ejemplo 235.5
cuadro.seleccion(); // { plan: '2024', codigos: [...], creditos: 235.5 }
```

| Parámetro | Descripción | Por defecto |
|---|---|---|
| `selectorCampo` (primer argumento, obligatorio) | Campo que recibe el total. Queda de solo lectura mientras la lista de materias se pueda leer. Si su valor cambia por otra vía, vuelve a la suma, y se escribe otra vez antes de enviar el formulario | — |
| `contenedor` | Elemento o selector donde se dibuja | Justo antes de la pregunta del campo (su `.fitem` en las encuestas de Moodle) |
| `plan` | Plan que se muestra primero | `'2024'` |
| `titulo`, `descripcion` | Textos del encabezado | "Materias aprobadas" e instrucción de selección |
| `materias` | Lista fija de materias, en lugar de la base Materias | Base Materias (d=152) |
| `otrosCreditos` | Créditos y requisitos que no son materias: `{ '<plan>': [{ codigo, nombre, detalle, creditos }] }`. Con `creditos: 0` la casilla registra el requisito sin sumar | `OTROS_CREDITOS` |
| `pie` | Dibujar el pie Zhakyz | `true` |
| `campoSeleccion` | Selector de una respuesta de texto larga donde el cuadro guarda su selección como JSON `{ plan, codigos }`. Su pregunta se oculta. Al abrir la página, si ese campo trae una selección (Moodle la trae al volver a la página o al editar la respuesta), el cuadro la vuelve a marcar: solo los códigos que siguen en el plan. Sin esta opción, el cuadro empieza vacío | — |

Con cada cambio emite el evento `zk-creditos` en el cuadro, con la selección en `detail`. Las casillas llevan `data-codigo-creditos` con el código de la materia o del requisito.

### Otros créditos y requisitos del plan

Al final de cada plan, una casilla por cada crédito o requisito que no es una materia. Suman créditos (si tienen) pero no cuentan como materias.

| Plan | Materias | Casillas | Total | Fuente |
|---|---|---|---|---|
| 2024 | 52 · 223 CG | Práctica Profesional Supervisada · 200 h · 12,5 CG | **235,5 CG · 3768 h** | Cuadro de créditos del plan: obligatorios 215 CG (incluye Práctica Sociocomunitaria, electivas y trabajo final), optativas 8 CG y PPS 12,5 CG |
| 2003 | 43 · 229 CG (219 obligatorios + 10 del Trabajo Final) | Práctica Profesional Supervisada · 200 h · sin créditos; Optativas · 16 CG · 256 h | **245 CG · 3920 h** | Texto ordenado del plan: obligatorios 219 CG, optativas 16 CG y Trabajo Final 10 CG. La PPS es un requisito sin créditos |

- **Optativas del Plan 2024:** ya son materias de la lista (Optativa I y Optativa II, 8 CG). Una casilla aparte las contaría dos veces.
- **Sin casilla:** INGRA01 y la Práctica Sociocomunitaria (2024), y el IV Nivel de Inglés y el Seminario de Comunicación Eficaz (2003). Son requisitos sin créditos propios.

## Widget: `SelectorMaterias`

La versión breve para elegir materias: en lugar del cuadro con todo el plan, una lista desplegable con todas las materias del plan (agrupadas por año) y una fila por cada materia elegida. Es el `[Select de todas las materias]` del ítem 8270 de la Encuesta Cuatrimestral.

```js
var selector = new ZhakyzUtils.SelectorMaterias('textarea[name="textarea_<id>"]', {
  contenedor: '#selector-materias-cuatrimestral' // opcional
});
selector.seleccion(); // { plan: '2024', ninguna: false, materias: [{ codigo, nombre, primeraVez, dificultad }] }
selector.valor();     // el JSON que se guarda en el campo
ZhakyzUtils.SelectorMaterias.parsear(valor); // { plan, ninguna, materias: [...] } o null si no es ese JSON
```

En cada materia elegida pregunta lo que pide el ítem 8270: **¿Es la primera vez que la cursaste?** (Sí / No) y **¿Qué tan difícil te resultó?** (1 a 5). Hay una casilla **No cursé materias el anterior cuatrimestre**, porque no cursar es un dato (inactividad, 35 puntos en el [modelo de criticidad](../../docs/models/MODELO_CRITICIDAD_ENCUESTAS.md)) y no es lo mismo que no responder.

| Parámetro | Descripción | Por defecto |
|---|---|---|
| `selectorCampo` (primer argumento, obligatorio) | Campo de texto que guarda la selección: una respuesta de texto larga (`textarea`). Con una corta, el JSON se escribe en un solo renglón y no entra con más de 2 o 3 materias. En la encuesta su pregunta (`.fitem`) se oculta mientras la lista de materias se pueda leer; si no se puede, queda visible para escribir las materias a mano | — |
| `contenedor` | Elemento o selector donde se dibuja | Justo antes de la pregunta del campo |
| `plan` | Plan que se muestra primero. Si en la página hay un `CuadroCreditos`, se usa el plan elegido en el cuadro y el selector no muestra sus propios botones de plan | `'2024'` |
| `titulo`, `descripcion` | Textos del encabezado | La pregunta del ítem 8270 y una instrucción |
| `materias` | Lista fija de materias, en lugar de la base Materias | Base Materias (d=152) |
| `preguntas` | `false` para elegir solo las materias, sin primera vez ni dificultad | `true` |
| `obligatorio` | `false` para dejar pasar de página sin materias y sin marcar "No cursé materias" | `true` |
| `pie` | Dibujar el pie Zhakyz | `true` |

**Valor del campo:** un JSON con la misma forma que `seleccion()`, con una materia por renglón:

```json
{
  "plan": "2024",
  "ninguna": false,
  "materias": [
    {"codigo":"INGM102","nombre":"Análisis Matemático II","primera_vez":false,"dificultad":4},
    {"codigo":"INGF101","nombre":"Física A","primera_vez":true,"dificultad":2}
  ]
}
```

| Clave | Valores |
|---|---|
| `primera_vez` | `true`; `false` si la recursa; `null` sin responder |
| `dificultad` | 1 (más fácil) a 5 (más difícil); `null` sin responder |
| `ninguna` | `true` si marcó "No cursé materias" (con `materias` vacío) |
| Con `preguntas: false` | Cada materia lleva solo `codigo` y `nombre` |
| Sin respuesta | El campo queda vacío |

Una respuesta de texto **corta** de Moodle admite como máximo 255 caracteres, y en JSON eso son 2 o 3 materias. Con un campo corto el JSON va en un solo renglón (el campo no admite saltos de línea), y si no entra, el widget frena el envío. Por eso el campo tiene que ser una respuesta **larga**, que no tiene límite.

- **Validación:** al pasar de página o enviar, si faltan respuestas, el envío se frena y se marcan las materias incompletas. Volver a la página anterior no se frena. Como el envío queda frenado (`defaultPrevented`), la copia de respuestas tampoco copia.
- **Al volver a la página:** Moodle trae el valor guardado y el selector recupera la selección con `parsear`.
- **Fuera del formulario:** los radios usan `form="zk-sin-formulario"`, así que Moodle solo recibe el campo con el JSON.
- Con cada cambio emite el evento `zk-materias` en el selector, con la selección en `detail`.

## Ver los widgets

**Página Widgets** ([`widgets/content.html`](widgets/content.html)): una barra con enlaces al índice y a cada widget. Sin `#widget` muestra el índice **Widget Documentation**, el mismo del cargador en local: un bloque por widget, con su enlace, descripción, dónde se usa y el campo de la encuesta. Con `#widget=<nombre>` muestra ese widget y debajo la pregunta de la Encuesta Cuatrimestral que recibe su valor, simulada:

| Widget | En Moodle | En local (Live Server) |
|---|---|---|
| `CuadroCreditos` (pregunta 8262) | `mod/page/view.php?id=<cmid>#widget=CuadroCreditos` | http://localhost:5517/section/utils/widgets/content.html#widget=CuadroCreditos |
| `SelectorMaterias` (respuesta 8768) | `mod/page/view.php?id=<cmid>#widget=SelectorMaterias` | http://localhost:5517/section/utils/widgets/content.html#widget=SelectorMaterias |

**Cargador** ([`cargador/content.html`](cargador/content.html)): lee la biblioteca de `widgets/content.html` como lo hace en una encuesta. En local, sin `#widget` muestra el índice **Widget Documentation**: un bloque por widget de la biblioteca, en vertical, con su enlace, descripción, dónde se usa y el campo de ejemplo (`descripcion` y `uso` de la tabla `WIDGETS` del cargador). Al elegir uno (`#widget=<nombre>`) lo crea con la pregunta de su ejemplo de la Encuesta Cuatrimestral, y la barra tiene enlaces al índice y a los otros widgets: http://localhost:5517/section/utils/cargador/content.html. En Moodle no hay menú: cada copia crea el widget de su `WIDGET`.

En local, las dos se abren con Live Server, que lee el plan completo de `data/plan_estudios/PLANES_CARGA.csv`. Con `file://` no funcionan, porque el navegador no permite leer otro archivo.

## Verificado en el campus (2026-10-24, solo lectura)

- El `fetch` de una Página de Zhakyz devuelve sus `<script>` completos, y las páginas de las encuestas no tienen `Content-Security-Policy`: el código leído se puede ejecutar.
- La Página llega completa (unos 300 KB con el tema) y sin caché, en cada vista que la carga.
- Con el HTML real de la Encuesta Cuatrimestral, el cuadro sin `contenedor` queda entre el ítem 8261 y la pregunta 8262, y lee la base Materias real (52 materias del Plan 2024 y 43 del 2003).

## Pendientes

- **ADR:** los cargadores (de widgets y de tools) cambian la regla "un único archivo autocontenido" de `RULES.md`. Registrar la decisión y actualizar `RULES.md` y la skill `crear-seccion`.
- **Máximos de `creditos_aprobados`:** la Encuesta Inicial acepta hasta 223 y la Cuatrimestral hasta 235,5. Con las optativas del Plan 2003 el total llega a 245, así que los dos máximos deberían ser 245. Es un cambio en Moodle y requiere confirmación.
- **Optativas del Plan 2003:** la casilla suma los 16 CG completos. Un estudiante con parte de las optativas no lo puede indicar.
- **Acceso a las Páginas Widgets y Tools:** los estudiantes necesitan poder abrirlas para que los cargadores las lean. Quedan visibles en la página del curso: el campus no permite "disponible pero no mostrada".
- **Borrar el ítem 8273:** la respuesta corta vieja sigue en la Encuesta Cuatrimestral, visible y vacía, con la misma etiqueta `materias_cuatrimestre` que el 8768. La encuesta tiene 0 respuestas.
- **Probar con una cuenta de estudiante:** con rol Profesor no se puede responder la encuesta, así que el envío real de los widgets no está probado.
- **El cuadro de créditos no recupera la selección:** al volver a su página, empieza vacío y vuelve a escribir 0 en el total. El selector de materias sí la recupera. El cuadro guarda un número, así que para recuperarlo haría falta guardar también los códigos en algún campo.
