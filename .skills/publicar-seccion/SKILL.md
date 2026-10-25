---
name: publicar-seccion
description: Publica en Moodle una sección desarrollada en local (section/<nombre>/content.html), solo dentro de la sección Zhakyz del curso 1732. Crea o actualiza una Página, un Área de texto y medios, o el resumen de la sección, siempre simulando primero y escribiendo únicamente con confirmación explícita. Usar cuando pidan "publicar", "subir", "pasar a Moodle" o "actualizar en Moodle" una sección.
---

# Publicar una sección en Moodle

Sube un `content.html` del repo a Moodle con el script [`publicar.js`](publicar.js). Las reglas de [`RULES.md`](../../RULES.md) están por encima de esta skill: si algo choca, **no se publica**.

## Reglas que no se negocian

1. **Solo la sección Zhakyz** (`section.php?id=15647` del curso 1732). Se identifica por su **id**: el número de posición cambia si se agregan o se borran secciones, y el script lo lee en el momento. El script lo verifica antes de escribir y se niega a tocar cualquier otra cosa: otras secciones, actividades de otros equipos o configuración del curso.
2. **Confirmación absoluta.** "Desarrollar" o "dejar listo" no alcanza. Hace falta un pedido explícito de publicar **ese** archivo **ahora**. Ante la duda, preguntar.
3. **Primero simular.** Correr **siempre** el script sin `--confirmar`, mostrar el resultado (destino, tamaño, cambios) y recién con el OK correr con `--confirmar`.
4. **Relación 1 a 1:** el repo es la fuente. Primero se commitea o se guarda el cambio local y después se publica. El script escribe en el archivo el comentario `<!-- PUBLICADO EN MOODLE: … -->` con el destino y el cmid, y al terminar hay que agregar o actualizar la fila en la tabla de `RULES.md`.
5. **Nunca notificar:** el script desactiva siempre "Notificación de contenido del curso", para que nadie reciba un aviso por cada publicación.
6. **Ids desde `moodle.config.json`.** El campus, el curso, la sección y los ids de subsecciones, páginas y bases salen de [`moodle.config.json`](../../moodle.config.json). El script se niega a publicar si las líneas `// @config` del archivo no coinciden con ese archivo: correr `node .skills/publicar-seccion/sincronizar_config.js`.
7. **Credenciales** solo por variables de entorno (`MOODLE_USUARIO` y `MOODLE_CLAVE`), pedidas al usuario en el momento. No se guardan en archivos, en el repo ni en la memoria.

## Dónde publicar cada cosa

| `--tipo` | En Moodle | Cuándo |
|---|---|---|
| `pagina` | **Página** (`mod_page`): se abre en su propia pantalla | Tableros y pantallas grandes (`tablero_estudiantes`, `menu_inicial`) |
| `etiqueta` | **Área de texto y medios** (`mod_label`): se ve dentro de la sección | Bloques chicos que tienen que verse sin hacer clic |
| `resumen` | **Resumen** de la sección Zhakyz | Solo el encabezado del equipo (`resumen_zhakyz`) |

**Ítems de un grupo** (`section/<grupo>/<item>/content.html`): el grupo es una subsección de Zhakyz. Si no se pasa `--subseccion`, el script la toma del campo `nombre` de `section/<grupo>/seccion.json` (y la crea si no existe). Después de publicar, anotar el `cmid` del ítem en `moodle.config.json` → `paginas.<clave>` (la clave está en `moodle.config` del ítem en `seccion.json`) y correr `sincronizar_config.js`, así las secciones que enlazan a esa página toman el id.

Si el archivo ya está publicado, su comentario `PUBLICADO EN MOODLE` (o la tabla de `RULES.md`) tiene el **cmid**: usar `--cmid` para **actualizar**. No crear un duplicado.

## Pasos

1. **Preparar en local**
   - La sección pasa la verificación de [`crear-seccion`](../crear-seccion/SKILL.md) (sin errores, sin emojis, roles probados).
   - Los cambios están commiteados, o al menos guardados.
   - Los CMID de bases que use la sección apuntan a bases **de Zhakyz** (nunca de otros equipos). Si todavía son `null`, la sección muestra datos de prueba: avisar al usuario.
2. **Simular** (no escribe nada):
   ```bash
   MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) \
     node .skills/publicar-seccion/publicar.js --archivo section/<nombre>/content.html \
     --tipo pagina [--cmid <id> | --nombre "<Nombre visible>"]
   ```
   Muestra el destino verificado, el tamaño, el hash y las líneas que cambian.
3. **Pedir confirmación** mostrando ese resumen: "¿Publico `<archivo>` como <tipo> en Zhakyz?".
4. **Publicar:** el mismo comando con `--confirmar`. El script:
   - abre la guardia de red solo para ese `POST` (`modedit.php` o `editsection.php`, con curso, sección y cmid verificados en el cuerpo);
   - si la actividad es nueva, la crea, detecta su cmid y vuelve a guardar con el encabezado completo;
   - **relee lo guardado** y avisa si Moodle alteró el contenido o los `<script>`;
   - actualiza el comentario de ubicación en el archivo local.
5. **Cerrar el ciclo**
   - Agregar o actualizar la fila en la tabla 1 a 1 de `RULES.md` (el script la imprime).
   - Actualizar el estado en [`DEPLOY.md`](../../DEPLOY.md).
   - Proponer el commit, por ejemplo: `chore(moodle): publish <seccion> to Zhakyz section`.
   - Darle al usuario el link "Ver en Moodle" que imprime el script.

## Si algo falla

- **"La sección … no es Zhakyz":** no forzar nada. Avisar al usuario (puede que hayan renombrado la sección).
- **"Moodle rechazó el guardado":** mostrar el error. No reintentar a ciegas ni probar otros endpoints.
- **"Moodle modificó el contenido" o "scripts ALTERADOS":** el filtro de HTML del campus limpió algo. Revisar la sección en Moodle y avisar: puede requerir otro tipo de destino o ajustes.
- **No se pudo identificar el cmid de una actividad nueva:** buscarla a mano en la sección Zhakyz y anotar el cmid. No crear otra.
- **Archivos (imágenes, logos):** este script publica solo HTML. Subir archivos requiere el flujo de borrador de Moodle (ver la memoria del proyecto o el resumen de Zhakyz) y su propia confirmación.

## Crear bases de datos (`crear_base.js`)

Para las bases (`mod_data`) que usan las secciones, el flujo es el mismo (simular → confirmar → verificar) con `crear_base.js`:

1. Definir la base en `data/moodle/BASE_<NOMBRE>.json`: `clave` (la entrada de `bases` en `moodle.config.json`), nombre, descripción, subsección de Zhakyz y campos (`text`, `menu` con `opciones`, `textarea`, `number`, etc.). Ver `BASE_MATERIAS.json`.
2. Simular:
   ```bash
   MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/publicar-seccion/crear_base.js --definicion data/moodle/BASE_<NOMBRE>.json
   ```
3. Con confirmación, agregar `--confirmar`. El script:
   - crea la subsección dentro de Zhakyz si no existe;
   - crea la base sin fechas de disponibilidad y sin notificar;
   - crea los campos y los verifica;
   - escribe los ids (cmid y d) en `moodle.config.json` → `bases.<clave>` (y la subsección en `subsecciones`);
   - corre la sincronización, así las secciones que usan esa base toman los ids.
   
   Se niega si `bases.<clave>` ya tiene cmid.
4. Agregar la fila a la tabla de `RULES.md` (el script la imprime) y commitear `moodle.config.json` junto con las secciones actualizadas.

### Cambiar los campos de una base existente (`recrear_campos.js`)

Moodle ordena los campos por orden de creación y no permite reordenarlos ni cambiarles el tipo. Para cambiar el orden, los nombres o los tipos:
1. Editar los campos en el JSON de la definición.
2. Correr `recrear_campos.js --definicion …`, primero simulando y después con `--confirmar`. Los ids de la base los toma de `moodle.config.json` → `bases.<clave>`.

El script borra todos los campos y los crea de nuevo en el orden del JSON. **Solo funciona si la base está vacía y está dentro de Zhakyz**: si tiene entradas, se niega, porque se perderían datos.

## Qué NO hace

- No borra ni oculta actividades.
- No cambia restricciones de acceso, visibilidad, nombres de otras actividades ni nada fuera de Zhakyz.
- No publica sin `--confirmar`.
