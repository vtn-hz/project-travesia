# Especificación: Encuestas (armado)

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/encuestas_preguntas/encuestas/content.html` (ítem del grupo [`encuestas_preguntas`](../../section/encuestas_preguntas/seccion.json))
- **Acceso:** tarjeta "Encuestas" del [menú inicial](../../section/menu_inicial/content.html)
- **Roles:** **ADM** arma y guarda. **GES** solo consulta.
- **Estado:** desarrollado en local. **No publicado.** La base de composición todavía no existe en Moodle.

## Concepto

| Pieza | Qué es | Dónde vive |
|---|---|---|
| **Banco de preguntas** | Todas las preguntas, cada una con su tipo, opciones y criticidad | Ítem "Preguntas" → base de Moodle cmid 59498 (hoy llamada "Encuestas") |
| **Encuesta** | Una selección **ordenada** de preguntas del banco, con título y texto introductorio | Este apartado → base "Armado de encuestas" (propuesta) |

Hay **dos encuestas**: **inicial** (una sola vez, al empezar 2.º año) y **cuatrimestral** (al cierre de cada cuatrimestre). Una misma pregunta puede estar en las dos.

## Qué hace

1. **Pestañas** Encuesta inicial y Encuesta cuatrimestral, con la cantidad de preguntas y un punto si hay **cambios sin guardar**.
2. **Datos de la encuesta:** título que ve el estudiante y texto introductorio.
3. **Armado:**
   - Banco de preguntas a la izquierda (con búsqueda) y la encuesta a la derecha, numerada.
   - **Arrastrar y soltar** desde el banco a una posición exacta, y para reordenar dentro de la encuesta, con una línea azul que marca dónde va a caer.
   - **Alternativas al arrastre** (teclado y celular): botón **+** en el banco y **subir, bajar y quitar** en cada pregunta.
   - Las preguntas que ya están en la encuesta se ven atenuadas en el banco.
4. **Vista del estudiante:** la encuesta completa, en orden, con radios, casillas o campos según el tipo.
5. **Guardar** la encuesta activa. Valida que tenga título y al menos una pregunta, y avisa al salir si hay cambios sin guardar.

## Datos

- **Banco:** lee la base de preguntas (cmid 59498) con la plantilla por defecto de Moodle, igual que el ítem "Preguntas".
- **Composición:** base propuesta en [`data/moodle/BASE_ENCUESTAS_ARMADO.json`](../../data/moodle/BASE_ENCUESTAS_ARMADO.json). Tiene una entrada por encuesta:

| Campo | Contenido |
|---|---|
| `encuesta` | `inicial` o `cuatrimestral` |
| `titulo` | Título que ve el estudiante |
| `descripcion` | Texto introductorio |
| `preguntas` | ids del banco **en orden**, separados por coma (por ejemplo `6,1,7,8`) |

Guardar es **una sola escritura por encuesta**: el orden completo viaja en el campo `preguntas`, así que reordenar no requiere tocar varias entradas. La escritura usa el formulario nativo y ubica los campos por su etiqueta, como en "Preguntas".

**Comportamiento según el entorno:**
- **Local** (`file://` o `localhost`): 8 preguntas de ejemplo y dos encuestas armadas.
- **En Moodle sin la base de composición:** lee el banco real, pero no guarda, y lo avisa.
- **En Moodle con la base** (`CMID_ARMADO` y `DATAID_ARMADO`): lee y guarda.

## Decisiones pendientes

1. **Nombres en Moodle.** La base que hoy se llama "Encuestas" guarda **preguntas**. Propuesta:
   - renombrarla a **"Preguntas"** y el apartado publicado a **"Banco de Preguntas"**;
   - crear la nueva base **"Encuestas"** con la composición.
   
   Si no se renombra, la base nueva se llama "Armado de encuestas".
2. **Crear la base de composición** en Database con `crear_base.js` (requiere confirmación) y cargar sus ids en la sección.
3. **Publicar** este apartado (requiere confirmación).
4. Si se borra una pregunta del banco que está en una encuesta, la encuesta la muestra como "ya no está en el banco". Falta decidir si se bloquea el borrado en ese caso.
