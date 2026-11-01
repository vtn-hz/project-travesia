# Especificación: Copia de respuestas de las encuestas

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Código:** la herramienta `CopiaRespuestas` de la biblioteca de Tools ([`section/utils/tools/content.html`](../../section/utils/tools/content.html), Página "Tools" de Utils). Desde el 2026-10-25 ya no es un script autocontenido ([guía de Utils](../../section/utils/README.md#3-tools-toolscontenthtml)).
- **Ítem:** [`section/copia_encuestas/content.html`](../../section/copia_encuestas/content.html), una copia del cargador de tools con `TOOL = 'CopiaRespuestas'`. Desde el [ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md), `OPCIONES` va vacío (los 5 ítems se actualizaron el 2026-11-01).
- **Criticidad:** desde el ADR-007 (Tools v4, publicada el 2026-11-01), la copia guarda la respuesta en Respuestas y después agrega una entrada a **Criticidad** con el índice que calcula `CriticidadEncuesta` usando la versión vigente de la base **Encuestas** (ver [Copia y criticidad](#copia-y-criticidad)).
- **Dónde va en Moodle:** un ítem "Área de texto y medios" con el cargador **al final de cada página** de cada encuesta (ver [Publicación](#publicación)):
  - Encuesta Inicial (cmid 59710): 4 páginas, 4 ítems;
  - Encuesta Cuatrimestral (cmid 59712): 5 páginas desde que el equipo agregó los saltos 8781 a 8784 en Moodle (exportados el 2026-10-31), y 1 ítem, al final de la última. La estructura sale de la versión 3 de la Cuatrimestral en la base Encuestas, que tiene las 5 páginas (la vista previa lo confirma desde el 2026-11-01). Las páginas 1 a 4 no tienen ítem de copia: sus respuestas se leen con `fetch` al enviar.
- **Rol:** EST (corre mientras el estudiante responde). En "Editar preguntas" y en la vista previa solo muestra un aviso para el equipo.
- **Decisión:** [ADR-006](../decisions/006-versionado-de-encuestas.md).
- **Estado:** desarrollado y probado en local, adaptado a los widgets de [Utils](../../section/utils/README.md) que se publicaron el 2026-10-25. **Publicado el 2026-10-25:** base Respuestas (cmid 59940, d=166) configurada, Página Tools (cmid 59941) y los 5 ítems (Inicial 8772, 8771, 8770 y 8769; Cuatrimestral 8773). **Probado con un envío real de la Cuatrimestral** el 2026-10-25 (dos versiones en la base, con DNI). Falta probar la Inicial.
- **Última actualización:** 2026-11-01 (ADR-007, publicado)

## Qué hace

La Encuesta de Moodle valida, guarda y precarga como siempre, pero guarda solo la última respuesta. Este script agrega **cada envío** como una versión nueva en la base Respuestas, y su criticidad como una entrada nueva en la base Criticidad.

1. **Al pasar de página**, guarda en el navegador (`sessionStorage`) lo respondido en esa página. Si en la página está el cuadro de créditos, guarda también el plan elegido y las casillas marcadas.
2. **Al hacer el envío final:**
   - repite los controles de Moodle (obligatorias y rango de los numéricos). Si algo falla, no copia y deja que Moodle muestre el error;
   - lee la versión vigente de la encuesta en la base Encuestas (se pide al abrir la encuesta);
   - arma el registro con todas las páginas: `{ item_id, respuestas }` por ítem. Si falta alguna página, lee su HTML con `fetch` (Moodle la muestra con lo ya respondido);
   - agrega la entrada a la base Respuestas (`rid=0`) y toma su `rid` de la dirección a la que redirige Moodle;
   - calcula el índice con `CriticidadEncuesta`, lee las entradas propias del estudiante en Criticidad, calcula `indice_total` y agrega la entrada (`fuente = respuestas`, `rid_fuente` = la respuesta);
   - deja seguir el envío a Moodle. La copia espera como mucho 8 segundos para la respuesta y 4 para la criticidad.
3. **Si la copia falla**, la respuesta igual se guarda en Moodle:
   - el registro, con su índice, queda pendiente en el navegador (`localStorage`) y se reintenta la próxima vez que se abre la encuesta;
   - antes de reintentar, se verifica que no haya llegado (mismo `created_at`);
   - el estudiante ve un aviso.
   - Si se guardó la respuesta pero falló la criticidad, queda pendiente solo la entrada de Criticidad, sin aviso.
4. **Si un widget frena el envío**, la copia tampoco copia. Pasa, por ejemplo, con el selector cuando falta responder una materia.

### Cuándo es el envío final

| Botón | Envío final |
|---|---|
| Enviar respuestas | Siempre |
| Página siguiente | Solo si **no queda ninguna página con preguntas visibles**. Moodle muestra este botón aunque las páginas que siguen queden vacías por una dependencia, y en ese caso guarda sin pasar por "Enviar respuestas" (en la Inicial, si el estudiante no trabaja) |
| Página anterior y Cancelar | Nunca |

Para saberlo, el script usa las páginas de la versión vigente (el campo `pagina` de cada ítem en la base Encuestas) y las dependencias (`DEPENDENCIAS` en el código: `inicio_laboral` solo si `trabaja` = Si). Si la página actual no coincide con esa versión, o si la versión todavía no se leyó, no adivina: solo copia con "Enviar respuestas". Los ítems de copia no están en la base.

## Ítems y variables

Desde el ADR-007 están en la base Encuestas ([`DEFINICIONES_ENCUESTAS.json`](../../data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json)), copiados de [`ENCUESTA_INICIAL.xml`](../../data/moodle/encuestas/ENCUESTA_INICIAL.xml) y [`ENCUESTA_CUATRIMESTRAL.xml`](../../data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml). La variable es la etiqueta del ítem en Moodle; si un ítem no tiene etiqueta, la define la base.

| Encuesta | Página | Ítem | Variable | Criticidad |
|---|---|---|---|---|
| Inicial (versión 2) | 1 | 8254 (cuadro de créditos) | — (widget) | — |
| | 1 | 8253 | `creditos_aprobados` | Avance curricular (máx. 70). **En análisis:** `activa: false` |
| | 1 | 8774 (oculta, la completa el cuadro) | `seleccion_creditos` | — Guarda `{ plan, materias }`, del cuadro en pantalla o de esta respuesta |
| | 2 | 8257 | `año_cohorte` | — (se usa para el avance) |
| | 2 | 8258 | `cuatri_cohorte` | — (se usa para el avance) |
| | 3 | 8259 | `trabaja` | Sí → 10 |
| | 4 | 8260 (depende de `trabaja` = Si) | `inicio_laboral` | 20 · 20 |
| Cuatrimestral (versión 3) | 1 | 8261 (cuadro de créditos) | — (widget) | — |
| | 1 | 8262 | `creditos_aprobados` | Avance curricular (máx. 30). **En análisis:** `activa: false` |
| | 1 | 8775 (oculta, la completa el cuadro) | `seleccion_creditos` | Igual que la 8774 |
| | 2 | 8264 | `progreso_proyecto_final` | 0 · 10 · 7 · 3 · 0 |
| | 3 | 8265 | `trabaja` | Sí → 5 |
| | 4 | 8266 (depende de `trabaja` = Si) | `inicio_laboral` | 10 · 10 · 10 · 7 · 7 · 4 · 4 |
| | 5 | 8270 (selector de materias) | — (widget) | — |
| | 5 | 8768 (la completa el selector) | `materias_cuatrimestre` | Regla `cursada` (máx. 35) |
| | 5 | 8271 | `avance_percibido` | 0 · 5 · 10 |

- **Puntaje máximo:** 30 en la Inicial y 70 en la Cuatrimestral, mientras el avance está desactivado. El índice es puntos ÷ máximo × 100 ([modelo](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md)).
- **Bloque de cursada:** sale de lo que el selector escribe en la 8768.
  - Cantidad: ninguna (inactividad) 35, salvo con el PFG en desarrollo o finalizado; 1 materia 10; 2 materias 5; 3 o más 0.
  - Recursado: 8 por la primera materia recursada y 7 por la segunda.
  - Dificultad: (promedio − 1) × 2,5.
- **Si el selector no se pudo cargar** y el estudiante escribió las materias a mano, se guarda el texto sin puntos.
- **Ítems que la versión no conoce:** se guardan igual por su `item_id`, sin puntos.
- **Si cambian las preguntas o los puntos en Moodle:** cargar una versión nueva en la base Encuestas. El código no cambia.

## Registro (base "Respuestas")

Definida en [`BASE_RESPUESTAS.json`](../../data/moodle/BASE_RESPUESTAS.json), con sus [plantillas](../../data/moodle/plantillas/respuestas/). Ejemplo de la Cuatrimestral, del simulador local (2026-11-01):

```json
{
  "id_usuario": 3773,
  "dni": "00000004",
  "codigo_encuesta": "cuatrimestral",
  "version": 3,
  "periodo": "2026-2",
  "json_respuesta": [
    { "item_id": 8262, "respuestas": [34] },
    { "item_id": 8775, "respuestas": [{ "plan": "2024", "materias": ["INGM101"] }] },
    { "item_id": 8264, "respuestas": [2] },
    { "item_id": 8265, "respuestas": [2] },
    { "item_id": 8768, "respuestas": [{ "materia": "INGM102", "primera_vez": false, "dificultad": 4 }, { "materia": "INGF101", "primera_vez": true, "dificultad": 2 }] },
    { "item_id": 8271, "respuestas": [2] }
  ],
  "created_at": "2026-11-01T09:13:22-03:00"
}
```

- **`respuestas`:** siempre una lista. Opción múltiple: el número de opción que envía Moodle. Numéricos: el número. Cuadro de créditos: `{ plan, materias }`. Selector: `{ materia, primera_vez, dificultad }` por materia (lista vacía si no cursó ninguna).
- **Preguntas dependientes:** si no corresponden, no se guardan. En el ejemplo no está la 8266, porque el estudiante no trabaja.
- **Formato anterior:** las entradas de la Inicial versión 1 y la Cuatrimestral versión 2 (las 4 que hay en Moodle) tienen `json_pregunta_respuesta` con el texto de la pregunta y la criticidad. Se reconocen por la versión y no se migran.

## Copia y criticidad

Después de guardar la respuesta, la copia agrega a Criticidad:

```json
{ "id_usuario": 3773, "dni": "00000004", "periodo": "2026-2", "origen": "automatica", "fuente": "respuestas", "rid_fuente": 102,
  "indice": 47, "indice_total": 50, "semaforo": "amarillo", "motivo": "", "created_at": "2026-11-01T09:13:22-03:00" }
```

- **`indice`:** `CriticidadEncuesta(registro, definicion)`, con los puntos de la versión vigente. En el ejemplo: 33 puntos ÷ 70 = 47.
- **`indice_total`:** el promedio del último índice de las notas de 1.er año y el de esta encuesta, en el período. En el ejemplo, las notas tenían 52: (52 + 47) ÷ 2 = 50. Si el estudiante no tiene notas en el período, es igual al índice.
- **`semaforo`:** el del `indice_total` (40 y 70).
- **Si no se puede calcular el índice** (por ejemplo, una definición con errores), la respuesta se guarda igual y no se agrega la entrada de Criticidad.
- **El periodo** de la entrada es el de la respuesta. En la Inicial, que no lleva período, es `PERIODO_ACTUAL`.

## Datos en Moodle

| Dato | De dónde sale |
|---|---|
| Encuesta | Campo oculto `id` del formulario (cmid) |
| Página actual | Campo oculto `gopage` |
| Respuestas | Campos `numeric_<id>`, `multichoice_<id>` (número de opción), `textfield_<id>` y `textarea_<id>`. El texto de la opción sale de su etiqueta |
| Enunciado, obligatoria y rango | Etiqueta del ítem (`#id_<tipo>_<id>_label` o `#fgroup_id_group_<tipo>_<id>_label`), con `.boundaries` y la marca "Campo obligatorio" |
| Plan y materias aprobadas | Widget `CuadroCreditos` (`.zk-cuadro-creditos`): botón de plan activo y casillas `data-codigo-creditos` marcadas. Incluye la PPS |
| Materias cursadas | JSON del widget `SelectorMaterias` en `textarea_8768`: `{ plan, ninguna, materias: [{ codigo, nombre, primera_vez, dificultad }] }` |
| Usuario y DNI | `M.cfg.userId` y `/login/change_password.php` → `[data-name="username"]` |
| Versión vigente de la encuesta | Base Encuestas (con `LeerBase`). En local, `data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json` |
| Índice total | Entradas propias del estudiante en la base Criticidad (con "Requiere aprobación", solo ve las suyas) |
| Ingreso (cuatrimestral) | La Encuesta inicial más reciente del estudiante en la base Respuestas (para el avance, en análisis) |

## Publicación

Cada paso requiere confirmación explícita (`RULES.md`, regla 3):

1. **Crear la base Respuestas.** Hecho el 2026-10-25 con `crear_base.js --confirmar`: cmid 59940, d=166, en la subsección Database, con los 8 campos. El script anotó `bases.respuestas` en `moodle.config.json` y lo copió a esta sección.
2. **Configurar la base** en Moodle. Hecho el 2026-10-25 con un POST al formulario de ajustes:
   - "Requiere aprobación" = Sí, sin aprobar entradas;
   - edición de entradas aprobadas = No;
   - sin comentarios;
   - sin máximo de entradas.

   El campus **no permite "disponible pero no mostrada"** (solo mostrar u ocultar), y si se oculta, los estudiantes no pueden escribir en ella. Por eso la base queda visible dentro de Zhakyz, y con la aprobación cada estudiante ve solo sus entradas.
3. **Cargar las plantillas** de `data/moodle/plantillas/respuestas/`. Hecho el 2026-10-25: lista (cabecera, entrada repetida y pie) e individual, releídas después de guardar. La de añadir entrada queda la de Moodle, porque la copia ubica cada campo por su etiqueta. Si la plantilla de lista falta, la copia la reemplaza leyendo la de Moodle por defecto (filas "campo | valor", igual que Preguntas). Con la propia, el estudiante que abre la base no ve los botones de editar y borrar.
4. **Publicar la Página Tools** en la subsección Utils, después de Widgets, con `publicar.js`. Hecho el 2026-10-25 (cmid 59941). Queda visible por la misma razón que Widgets: el cargador la lee con la sesión del estudiante.
5. **Agregar los ítems de copia**, cada uno con el cargador ([`section/copia_encuestas`](../../section/copia_encuestas/content.html)). Hecho el 2026-10-25: Inicial 8772 (página 1), 8771 (página 2), 8770 (página 3) y 8769 (página 4, depende de trabaja = Si); Cuatrimestral 8773. Los cinco guardaron el archivo del repo sin cambios (exportación de las encuestas):
   - **Inicial:** uno al final de cada una de las 4 páginas. El de la página 4 tiene que **depender de `trabaja` = Si**, igual que la 8260. Si no, la página 4 nunca queda vacía y el estudiante que no trabaja ve una página en blanco.
   - **Cuatrimestral:** uno al final de la página.

   El editor de ítems de Moodle borra los scripts: hay que guardarlos con un POST directo al formulario del ítem, como el cuadro de créditos. Los ids nuevos no hace falta cargarlos en el script. Para actualizarlos: `publicar_item_encuesta.js` ([skill publicar-seccion](../../.skills/publicar-seccion/SKILL.md)).
6. **Probar un envío.** Con la cuenta del equipo (rol Profesor), la encuesta no se puede responder. Hay dos caminos:
   - una cuenta con rol Estudiante (Nicolás Zuviria es el único del equipo);
   - **"Cambiar rol a… Estudiante"** con la cuenta del equipo. Moodle no guarda la respuesta cuando el rol está cambiado (`feedback_check_is_switchrole()`), pero la copia sí se agrega a la base. Sirve para probar la copia sin ensuciar las respuestas de la encuesta.

## Vista previa local

Al abrir el ítem ([`section/copia_encuestas`](../../section/copia_encuestas/content.html)) en local con Live Server, el cargador lee la Página Tools del repo y la herramienta muestra un **simulador de la Encuesta de Moodle**:
- usa el mismo HTML que genera el campus y la misma navegación: valida obligatorias y rango al cambiar de página, y "Página siguiente" aparece aunque las páginas que siguen queden vacías;
- tiene un cuadro de créditos simplificado y, en la Cuatrimestral (5 páginas, como en Moodle), el JSON del selector en un campo editable;
- lee la versión vigente de `data/moodle/encuestas/DEFINICIONES_ENCUESTAS.json`, como si fuera la base Encuestas;
- usa el usuario de prueba Nicolás Zuviria, con DNI ficticio;
- muestra las entradas que se agregarían a Respuestas y a Criticidad. Criticidad empieza con una entrada de notas de 1.er año de ejemplo (índice 52), para ver el `indice_total`. Si Moodle guardara sin que la copia lo tomara, avisa.

## Pruebas hechas

**Con la base Encuestas y la base Criticidad, en local (2026-11-01, Tools v4).** Simulador con Playwright, sin errores de JavaScript:

| Caso | Respuestas | Criticidad |
|---|---|---|
| Inicial · trabaja desde 1.er año | v2, 6 ítems (cuadro con 2 materias) | 30 ÷ 30 = **100** · total (52 + 100) ÷ 2 = 76 · rojo |
| Inicial · no trabaja, envío con "Página siguiente" | v2, 5 ítems (sin la 8260) | **0** · total 26 · verde |
| Cuatrimestral · 5 páginas, no trabaja (la página 4 se salta) | v3, 6 ítems (sin la 8266) | 33 ÷ 70 = **47** · total 50 · amarillo |

La Página Tools (índice) carga sin errores y a 400 px no desborda.

**Con la Página Tools (2026-10-25).** El ítem (cargador de tools) y la Página Tools del repo, servidos en local, contra el script autocontenido anterior, con los mismos envíos en el simulador: Inicial que trabaja (65), Inicial que no trabaja, con el envío en "Página siguiente" (70), y Cuatrimestral con el cohorte de la Inicial (63). Los tres registros son **idénticos** (sin `created_at`) y no hay errores de JavaScript.

**Con los widgets reales (2026-10-25).** Se usaron la vista previa de las dos encuestas, la Página Widgets y la base Materias del campus, descargadas en modo lectura y servidas sin conexión, con la base Respuestas simulada:

| Caso | Resultado |
|---|---|
| Inicial con el `CuadroCreditos` real (53 casillas) | El widget calcula 10 créditos. La copia guarda plan y materias, y Moodle recibe "Enviar respuestas" (65) |
| Cuatrimestral con respuestas por materia incompletas | El selector frena el envío: no hay copia ni envío |
| Cuatrimestral completa (2 materias, 1 recursada) | Moodle recibe `textarea_8768` y la base, el registro de arriba (48) |
| Cuatrimestral con "No cursé materias" | Inactividad: 35. Total 58 |
| Vista previa con dos ítems de copia | Un solo aviso; la estructura coincide |

**Con el HTML anterior a los widgets y con el simulador local (2026-10-24):**
- envío con "Página siguiente" cuando el estudiante no trabaja;
- páginas leídas con `fetch` cuando faltan en la pestaña;
- obligatoria vacía: sin copia;
- simulador a 1000 y 400 px, sin errores.

## Pendientes

1. ~~**Publicar el ADR-007.**~~ Publicado el 2026-11-01 ([ADR-007 · publicación](../decisions/007-encuestas-respuestas-y-criticidad.md#publicación-y-pendientes)). Falta probar un envío real con la versión 4.
2. **Probar un envío real de la Inicial.** La Cuatrimestral ya se probó el 2026-10-25: Moodle guardó la respuesta y la base recibió dos versiones (el segundo envío fue una edición), con plan, materias aprobadas, créditos, materias cursadas con primera vez y dificultad, y DNI. El avance no se puntuó porque ese usuario no tiene una copia de la Inicial en la base (sus respuestas a la Inicial son anteriores a la copia).
3. **App móvil:** verificar si los estudiantes la usan. Si responden desde la app, probablemente el script no corre y no hay copia.
4. **Encuesta Cuatrimestral (para el equipo):** ~~`inicio_laboral` depende de `trabaja`, pero están en la misma página.~~ Resuelto en Moodle por el equipo: el salto 8783 separa las dos (exportado el 2026-10-31). (El ítem 8273 se borró el 2026-10-25.)
5. **Cuadro de créditos:** todavía ofrece el Plan 2003, que quedó fuera del alcance. Si el estudiante lo elige, el avance no se puntúa. Desde el 2026-10-25 el cuadro guarda su selección en las respuestas ocultas 8774 y 8775 y la recupera al volver a su página; la copia usa esas respuestas cuando el cuadro no está en pantalla (por ejemplo, si el estudiante termina la encuesta en otro dispositivo).
6. **Control para el equipo:** comparar la última respuesta de Moodle con la última versión de la base, para detectar copias que no llegaron.
7. **`avance_percibido`:** "Demorado" y "Muy demorado" tienen el mismo umbral (50 %) en Moodle.
8. **Período:** `PERIODO_ACTUAL` está fijo en el script (`2026-2`). Hay que cambiarlo cada cuatrimestre o definir la ventana del período.
9. **Índice de la Inicial con el avance desactivado:** solo puntúa la situación laboral, y quien trabaja desde 1.er año llega a 100. Revisar con el equipo.
