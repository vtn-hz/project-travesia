---
name: manual-usuario
description: Genera el manual de usuario en PDF de un rol (ADM, TUT, PAR o EST) del Proyecto Travesía, compacto y con todas sus funcionalidades, recorriendo Moodle en modo solo lectura, con capturas señalizadas (recuadro y número sobre cada elemento) y una leyenda por paso. Usar cuando pidan "hacer un manual", "documentar cómo se usa", "guía de usuario", "capturas con señales" o un PDF de instrucciones de una sección o pantalla.
---

# Manual de usuario en PDF

**El manual es por rol** (ADM, TUT, PAR, EST): uno por rol, con todas las funcionalidades de ese rol. Cada funcionalidad sale de un **guion** (`guiones/<id>.js`): una lista de pasos con las acciones a hacer en Moodle, los elementos a señalar y el texto. `generar.js` inicia sesión, recorre los guiones del rol, saca las imágenes señalizadas y arma el PDF.

**Es un manual de usuario:** solo documenta lo que el usuario hace desde el Hub o Mi Trayectoria. No incluye piezas de implementación o mantenimiento (subsecciones Database y Utils, Tools, Widgets, pantallas importadas), aunque el rol tenga acceso.

**Se asume que el usuario ya está dentro de la sección Zhakyz:** el manual no explica cómo entrar al campus, al curso ni a la sección. Cada funcionalidad arranca desde el Hub o desde Mi Trayectoria.

**Formato compacto:** encabezado con el contenido en la primera página (sin portada aparte), varios pasos por página, imagen y explicación lado a lado (las imágenes anchas van a ancho completo con la leyenda abajo). El texto habla de la funcionalidad, no de "capturas". Pie de cada página: "Zhakyz & Asociados", el nombre del manual y el número de página.

No hace falta instalar nada: usa **Playwright** (el mismo de `publicar-seccion`) para navegar, capturar e imprimir el PDF con Chromium.

## Reglas que no se negocian

1. **Solo lectura.** La guardia de red deja pasar únicamente GET, el POST del login y los servicios AJAX de lectura de `SERVICIOS_LECTURA` (hoy, `core_group_get_course_user_groups`, que usa la detección del rol, y `core_courseformat_get_state`). Un guion **nunca** guarda, asigna, borra ni exporta: si una funcionalidad escribe, se muestra el formulario completo y se cierra sin guardar.
2. **Credenciales** solo por `MOODLE_USUARIO` y `MOODLE_CLAVE`, pedidas en el momento. No se guardan en archivos ni en el guion.
3. **Datos:** solo las secciones de Zhakyz y los datos de prueba ficticios (skill [`datos-prueba`](../datos-prueba/SKILL.md)). Los datos reales de la cuenta que genera el manual (nombre, apellido, iniciales, DNI, correo e id de usuario) se reemplazan en cada imagen por los de `FICTICIO` (Lucía Gómez), las fotos de perfil no se descargan (se ven las iniciales) y la barra de usuario de Moodle se desenfoca (`OCULTAR`). Después de generar, verificar: `pdftotext <pdf> - | grep -i '<apellido real>\|<dni>'` no devuelve nada.
4. **Rol de Moodle del manual:** si el rol tiene `rolMoodle` en `ROLES` (TUT y PAR = 4, Profesor sin edición; EST = 5), se usa "Cambiar rol a…" de Moodle **solo en la sesión del navegador automatizado** y se vuelve al rol propio al terminar. No escribe datos: la guardia solo deja pasar `course/switchrole.php` del curso con ese rol o con 0. Así la vista es la de un estudiante real (sin el selector "Cambiar rol" del staff) y Entrevistas, que no toma el rol elegido con el selector, también se ve como estudiante. **PAR** sale del grupo `Zhakyz_AsesorPar`: con `grupo` en `ROLES`, la respuesta de `core_group_get_course_user_groups` se arma en el navegador (no llega a Moodle). La cuenta que genera los manuales no pidió ninguna entrevista: los botones de responder y registrar el resultado solo se ven en el manual de ADM, y TUT y PAR tienen un paso que los explica.
5. **Mirar todas las imágenes y el PDF** antes de entregar.

## Pasos

1. **Elegir la funcionalidad y el rol.** Una funcionalidad acotada por manual (por ejemplo, "consultar y filtrar el Tablero"). Leer su spec en `docs/specs/` y el `content.html` para sacar los selectores (ids `btn-…`, `filtro-…`, `data-…`).
2. **Escribir el guion** `guiones/<id>.js`, copiando [`guiones/tablero-consultar.js`](guiones/tablero-consultar.js). Arriba van `roles` (en qué manuales entra, por ejemplo `['ADM', 'TUT']`), `orden` (posición en el manual del rol), `titulo` e `introduccion`. Cada paso:
   - `titulo` y `texto`: en segunda persona y con voseo ("Hacé clic en…"), cortos y sin tecnicismos.
   - `acciones` (antes de la captura) y `despues` (para dejar la pantalla lista para el paso siguiente):
     `{ ir: '/ruta' }`, `{ esperar: selector }`, `{ clic: selector, navega?: true }`, `{ escribir: selector, valor }`, `{ elegir: selector, valor }`, `{ pausa: ms }`,
     `{ ocultar: selector }` (esconde algo que confunde, por ejemplo una etiqueta de rol fija) y `{ ventana: alto }` (ventana más alta para lo que queda debajo de los 2000 px).
     En `clic` vale la sintaxis de Playwright (`tr:has-text("Por responder")`); en `marcas`, solo CSS.
   - `roles` en un paso: ese paso entra solo en el manual de esos roles (por ejemplo, un paso con botones que solo ve ADM).
   - `marcas`: `[{ selector, indice?, texto, margen? }]`. Se numeran solas en orden: entre 1 y 5 por captura.
   - `recorte`: `'ventana'`, `{ selector, alto, desde? }` (ancho del contenedor y hasta `alto` px) o `{ selector, alrededor }` (las marcas más `alrededor` px arriba y abajo). Para que el manual sea compacto, mostrar solo la zona que importa (alto de 300 a 650 px).
   - Las rutas salen de `moodle.config.json` (parámetro `config` del guion), nunca de ids escritos a mano.
3. **Generar** (primero en el scratchpad, para iterar):
   ```bash
   MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/manual-usuario/generar.js \
     --rol ADM [--guion <id>] [--salida <carpeta>]   # por defecto docs/manuales/<rol>/
   ```
   En la carpeta del rol deja **solo** `manual-<rol>.md` (solo texto: pasos y leyendas) y `manual-<rol>.pdf` (con las imágenes); las imágenes y el HTML se arman en una carpeta temporal que se borra (con `MANUAL_CONSERVAR=1` queda, para revisarlas). Con `--guion`, solo ese guion (para iterar). Termina con código 2 si alguna marca no se encontró.
4. **Revisar:** cada captura (que la marca caiga sobre el elemento y que no haya zonas vacías) y el PDF (`pdftoppm -r 50 -png <pdf> pag`).

## Detalles del campus que ya se resolvieron

- **El Hub se abre desde la página de la sección Zhakyz** (`/course/section.php?id=<seccion.id>`), no desde la de la subsección Hub: la detección del rol vive en el resumen de Zhakyz y sin ella el Hub no muestra tarjetas.
- **Ventana de 2000 px de alto:** el tema de Moodle no dibuja lo que queda fuera de la ventana, y una captura de página completa sale vacía (verde) abajo.
- **Esperar a que carguen las listas:** por ejemplo, el tutor de "Solicitar entrevista" arranca en "Cargando…": esperar `#campo-destinatario-solicitud:not([disabled])`.
- **Bases de datos de Moodle (Notas de 1.er año):** para filtrar sin enviar el formulario, usar la dirección con `&filter=1&search=<texto>`, y buscar a un estudiante de prueba: la lista completa tiene datos reales.
- **Reportes e Indicadores** muestran siempre "Administrador" (rol fijo en el código): su guion oculta esa etiqueta.
- **El campus es lento:** esperas de hasta 90–120 s y un reintento del login.

## Al terminar

- Resumir qué se generó y dónde, y pegar la ruta del PDF.
- No commitear sin que lo pidan. Commits en inglés y en Conventional Commits, por ejemplo `docs(manual): add <funcionalidad> user manual`.
