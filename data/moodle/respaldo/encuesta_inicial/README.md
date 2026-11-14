# Respaldo de la Encuesta Inicial

Copia de la Encuesta Inicial (cmid 59710, subsección Encuestas y Preguntas de Zhakyz), tomada el **2026-11-14**, antes de borrarla del campus ese mismo día ([SCRUM-27](https://zhakyz.atlassian.net/browse/SCRUM-27), [ADR-008](../../../../docs/decisions/008-encuesta-inicial-y-datos-personales.md)). Sirve para volver a crear la encuesta si hace falta.

**Respalda las preguntas y la configuración, no las respuestas.** Las 3 respuestas que guardaba Moodle y las entradas de la Inicial en las bases Respuestas y Criticidad se borraron y no están acá.

## Archivos

| Archivo | Qué es |
|---|---|
| [`ENCUESTA_INICIAL.xml`](ENCUESTA_INICIAL.xml) | Las 8 preguntas, exportadas del campus el 2026-11-14 con "Exportar preguntas" (`export.php?action=exportfile&id=59710`). Es el archivo que Moodle vuelve a importar |
| [`AJUSTES.json`](AJUSTES.json) | Ajustes de la actividad: nombre, respuestas con nombre, envíos múltiples, grupos visibles, "Página después de enviar" y "URL para el botón Continuar" |
| [`DEFINICIONES_INICIAL.json`](DEFINICIONES_INICIAL.json) | Versiones 2 y 3 de la Inicial en la base Encuestas (rid 20148 y 20529): preguntas, opciones y puntos de criticidad |
| [`ITEM_8254_CUADRO_CREDITOS.html`](ITEM_8254_CUADRO_CREDITOS.html) | Ítem "Área de texto y medios" con el cuadro de créditos (copia de `section/encuesta_inicial/content.html`) |
| [`ITEM_8772_COPIA_RESPUESTAS.html`](ITEM_8772_COPIA_RESPUESTAS.html) | Ítem "Área de texto y medios" con la copia de respuestas (copia de `section/copia_encuestas/content.html`) |

## Preguntas

| Ítem | Tipo | Etiqueta | Pregunta |
|---|---|---|---|
| 8254 | Área de texto y medios | — | Cuadro de créditos (script) |
| 8253 | Numérica (0 a 223) | `creditos_aprobados` | Los créditos obtenidos actualmente son: |
| 8774 | Respuesta larga (oculta) | `seleccion_creditos` | Selección del cuadro de créditos |
| 8257 | Numérica (2000 a 3000) | `año_cohorte` | ¿En qué año ingresaste a la facultad? |
| 8258 | Elección múltiple | `cuatri_cohorte` | ¿En cuál cuatrimestre ingresaste? (1 · 2) |
| 8259 | Elección múltiple | `trabaja` | ¿Trabaja actualmente? (Si · No) |
| 8260 | Elección múltiple | — | ¿En qué momento de la carrera comenzaste tu actividad laboral? (la muestra el script si `trabaja` = Si) |
| 8772 | Área de texto y medios | — | Copia de respuestas (script) |

El detalle de cada una está en la [spec](../../../../docs/specs/encuesta-inicial.md).

## Cómo recuperarla

Cada paso escribe en Moodle y requiere confirmación explícita ([`RULES.md`](../../../../RULES.md)).

1. Crear una Encuesta nueva en la subsección Encuestas y Preguntas con los ajustes de `AJUSTES.json`.
2. En la encuesta: *Plantillas → Importar preguntas*, y subir `ENCUESTA_INICIAL.xml`.
3. La encuesta y sus ítems tienen **ids nuevos**. Hay que actualizarlos:
   - `encuestas.inicial.cmid` en `moodle.config.json`, y correr `node .skills/publicar-seccion/sincronizar_config.js`;
   - los ids de los ítems (8253, 8774, 8259, 8260…) en la configuración de los dos ítems con script y en las entradas de la base Encuestas, que identifican cada pregunta por su `item_id`.
4. Volver a guardar los dos ítems con script con `publicar_item_encuesta.js`, sin el editor de Moodle: el editor y la importación pueden quitar el `<script>`.
5. Cargar en la base Encuestas una versión nueva de la Inicial con los ids nuevos (partir de `DEFINICIONES_INICIAL.json`).
6. Volver a agregar la tarjeta de la Encuesta Inicial a Mi Trayectoria (`section/vista_estudiante`; el commit `41391f7` la quitó).
