# Especificación: Carga de parciales de 1.er año y su criticidad

> Documento vivo: se actualiza a medida que se refinan los requerimientos. Es la guía para el equipo que arme el apartado donde los estudiantes de 1.er año suben sus parciales.

- **Base:** Carga_Parciales_Primero (cmid 59521, d=117), subsección Hub ([`BASE_CARGA_PARCIALES_PRIMERO.json`](../../data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json)). Los umbrales y las materias críticas están en Carga_Materias_Primero (cmid 59522, d=118).
- **Requerimiento (2026-11-01):** cada estudiante de 1.er año carga sus propias notas de parciales.
- **Criticidad:** cada nota guardada agrega una entrada a la base **Criticidad** (cmid 60191, d=199) con `fuente = notas_1ro` y `rid_fuente` = la nota ([ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md)). El índice es el ICG de las notas del estudiante en el período ([modelo](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md)), y el `indice_total` lo promedia con el de su última encuesta.
- **Código:**
  - la plantilla "Javascript personalizado" de la base ([`jstemplate.js`](../../data/moodle/plantillas/carga_parciales_primero/jstemplate.js));
  - la herramienta `CriticidadNotas` de la [Página Tools](../../section/utils/tools/content.html) ([guía de Utils](../../section/utils/README.md)).
- **Estado:**
  - **publicado y probado** el 2026-11-01 con el formulario de Moodle (Tools v4, ver [Prueba hecha](#prueba-hecha));
  - `CriticidadNotas({ rid })`, para una página propia, está en Tools v5, **solo en local**.
- **Última actualización:** 2026-11-01

## Qué pasa al guardar una nota

Con el formulario de alta o edición de Moodle de la base (`mod/data/edit.php?d=117`), Moodle carga la plantilla JS, que se encarga de todo:

1. Toma el envío ("Guardar" o "Guardar y añadir otro").
2. Si el DNI está vacío, lo completa con el de la cuenta: el nombre de usuario del campus.
3. Guarda la nota con el mismo formulario y lee su `rid` nuevo.
4. Lee las notas de ese DNI en el período actual y los umbrales de Carga_Materias_Primero, y calcula el índice.
5. Lee las entradas propias del estudiante en Criticidad, calcula `indice_total` y agrega la entrada.
6. Muestra la nota guardada, como Moodle. Si eligió "Guardar y añadir otro", abre un formulario vacío.

**Si algo falla:**
- **Moodle rechaza la nota** (por ejemplo, un campo obligatorio vacío): se repite el envío normal para que Moodle muestre el error.
- **Falla la criticidad o tarda más de 8 segundos:** la nota queda guardada y la entrada queda pendiente en el navegador (`localStorage`). Se reintenta en la próxima página de la base o de las encuestas.
- **La Página Tools no carga:** la nota se guarda igual, sin criticidad.

## Cómo armar el apartado

### Opción A: usar el formulario de Moodle (funciona hoy)

El apartado enlaza o lleva a `mod/data/edit.php?d=117`. No hace falta nada más: la plantilla JS calcula la criticidad. Se puede ajustar cómo se ve el formulario con la plantilla de alta de la base (`addtemplate`), mientras los campos conserven sus etiquetas: el script ubica el DNI por su etiqueta.

### Opción B: una página propia (requiere publicar Tools v5)

Si el apartado tiene su propio formulario, por ejemplo una Página en Hub con el estilo del sistema de diseño, la plantilla JS **no corre**, porque no es la página de la base. La página propia tiene que:

1. Llevar una copia del cargador de tools con `TOOL = null` ([guía de Utils](../../section/utils/README.md#4-cargador-de-tools-cargador_toolscontenthtml)).
2. Guardar la nota en la base, con el mismo POST a `edit.php` que usa `guardarEntradaMoodle`, y leer el `rid` de la dirección a la que redirige Moodle (`view.php?d=117&rid=<nuevo>`).
3. Llamar a la herramienta con ese `rid`:

```js
conTools(function (Tools) {
  // … después de guardar la nota y obtener su rid
  Tools.CriticidadNotas({ rid: rid }).then(function (entrada) {
    // entrada: la de Criticidad (null si no hay notas en el período)
  }, function (e) {
    // quedó pendiente: se reintenta sola; no hace falta avisarle al estudiante
  });
});
```

## Reglas de los campos

El cálculo depende de que los datos lleguen así. Un formulario propio tiene que garantizarlo; el de Moodle no lo controla.

| Campo | Regla | Por qué |
|---|---|---|
| DNI | El de la cuenta del estudiante (el nombre de usuario). **No dejarlo editable** | El índice se calcula con las notas de ese DNI. Si el estudiante escribe otro, su nota no cuenta y ensucia la de otro |
| Estudiante | Nombre y apellido, de la cuenta | Solo para mostrar |
| Materia | **Exactamente el nombre de Carga_Materias_Primero** (por ejemplo, `Análisis Matemático I`, `Álgebra I- B`). Ofrecerlo como lista, no como texto libre | Las notas se agrupan por materia y se cruzan con su umbral por nombre. Se ignoran mayúsculas, espacios, guiones y guiones bajos, pero no las tildes |
| Instancia | `Parcial 1`, `Parcial 2` o `Recuperatorio N` | Cada instancia distinta cuenta como una evaluación |
| Fecha | `AAAA-MM-DD` | Define el período: de enero a julio, `AAAA-1`; de agosto a diciembre, `AAAA-2`. Solo cuentan las notas del período actual (`PERIODO_ACTUAL` en Tools) |
| Nota | Número de 0 a 10. Vacío si estuvo ausente | Promedio y umbral |
| Estado | **Uno solo** entre `Aprobado`, `Desaprobado` y `Ausente` (el campo de Moodle permite elegir varios) | `Ausente` o sin nota cuenta como ausencia; `Aprobado`, como aprobada |
| Recupera_a | En un recuperatorio, **la instancia que reemplaza, escrita igual** (por ejemplo, `Parcial 1`) | El recuperatorio reemplaza a esa instancia en el cálculo |

## Antes de abrirlo a los estudiantes

1. **Configurar la base con "Requiere aprobación"** y no aprobar entradas. **Hoy no la tiene:** con el rol de estudiante se ven las notas de todos, y una nota cargada por un estudiante la ven los demás. Con la aprobación, cada estudiante ve solo las suyas y el equipo sigue viendo todas. Es un cambio en Moodle y requiere confirmación.
2. **Completar Carga_Materias_Primero** con las 7 materias de 1.er año del Plan 2024. Hoy tiene Análisis Matemático I, Álgebra I- B, Fundamentos de Química y Análisis Matemático II. **Faltan Álgebra II, Física A y Fundamentos de la Programación:** sin ellas, sus notas cuentan como no críticas, con umbral 4.
3. **Elegir la opción A o la B.** La B necesita publicar la Página Tools v5 (con confirmación).
4. **Actualizar `PERIODO_ACTUAL`** en Tools si cambia el cuatrimestre.
5. **Limpiar los datos de prueba** de la base. Tiene personas que no son del equipo (Carlos López, Juan Pérez…), contra la regla 5 de [`RULES.md`](../../RULES.md), y la nota de prueba del 2026-11-01 (rid 20152).

## Lo que todavía no hace

- **Borrar una nota no agrega una entrada en Criticidad.** El índice se corrige con la próxima nota que guarde el estudiante.
- **La importación por CSV de Moodle no calcula la criticidad,** porque no carga la plantilla JS.
- **Editar una nota agrega otra entrada,** con el mismo `rid_fuente`. Es correcto: cada entrada es una foto del momento.
- **Un cambio de umbral en Carga_Materias_Primero** se refleja recién en la próxima nota del estudiante. El recálculo de todos (`fuente = materias`) está pendiente ([ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md#publicación-y-pendientes)).
- **Las notas cargadas antes del 2026-11-01** no tienen entrada en Criticidad.

## Prueba hecha

**2026-11-01, en el campus (Tools v4).** Con la cuenta de Valentino Hernández Pascual y "Cambiar rol a… Estudiante", por el formulario de Moodle de la base. Datos: DNI vacío, Análisis Matemático I, Parcial 1, 2026-10-20, nota 6, Aprobado.

| Dónde | Resultado |
|---|---|
| Formulario | Moodle cargó la plantilla JS con el rol de estudiante y mostró la nota guardada a los 3,9 s |
| Carga_Parciales_Primero | rid 20152, con el DNI 47626513 completado por el script |
| Criticidad | rid 20153: `notas_1ro`, `rid_fuente` 20152, índice 14, total 57 (con la Inicial de 100), amarillo |
| Navegador | Sin pendientes y sin errores de JavaScript |

El índice 14 sale de una sola instancia, aprobada con 6, en una materia crítica de umbral 4,5: FP = 0,4 × 35 % = 14; FR, FA y FAC = 0.

## Cómo verificarlo

1. Con una cuenta de estudiante (o "Cambiar rol a… Estudiante"), cargar una nota del período actual.
2. En la base Criticidad (d=199), buscar la entrada con `fuente = notas_1ro` y `rid_fuente` igual al rid de la nota.
3. Si no aparece, mirar en el navegador `localStorage['zk-criticidad-pendientes']`: ahí queda lo que falló y se reintenta.
