# Especificación: Carga de parciales de 1.er año y su criticidad

> Documento vivo: se actualiza a medida que se refinan los requerimientos. Es la guía para el equipo que arme el apartado donde los estudiantes de 1.er año suben sus parciales.

- **Base:** CargaParcialesPrimero (cmid 59521, d=117), subsección Hub ([`BASE_CARGA_PARCIALES_PRIMERO.json`](../../data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json)). Los umbrales y las materias críticas están en CargaMateriasPrimero (cmid 59522, d=118).
- **Requerimiento (2026-11-01):** cada estudiante de 1.er año carga sus propias notas de parciales.
- **Criticidad:** cada nota guardada agrega una entrada a la base **Criticidad** (cmid 60191, d=199) con `fuente = notas_1ro` y `rid_fuente` = la nota ([ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md)). El índice es el ICG de las notas del estudiante en el período ([modelo](../models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md)), y el `indice_total` lo promedia con el de su última encuesta.
- **Código:**
  - la plantilla "Javascript personalizado" de la base ([`jstemplate.js`](../../data/moodle/plantillas/carga_parciales_primero/jstemplate.js));
  - la herramienta `CriticidadNotas` de la [Página Tools](../../section/utils/tools/content.html) ([guía de Utils](../../section/utils/README.md)).
- **Estado:**
  - **publicado y probado** el 2026-11-01 con el formulario de Moodle (Tools v4, ver [Prueba hecha](#prueba-hecha));
  - `CriticidadNotas({ rid })`, para una página propia, está en Tools v5, **publicada el 2026-11-02**;
  - la página propia ([Página de carga](#página-de-carga-scrum-22)), **publicada el 2026-11-02** (SCRUM-22).
- **Última actualización:** 2026-11-01

## Qué pasa al guardar una nota

Con el formulario de alta o edición de Moodle de la base (`mod/data/edit.php?d=117`), Moodle carga la plantilla JS, que se encarga de todo:

1. Toma el envío ("Guardar" o "Guardar y añadir otro").
2. Si el DNI está vacío, lo completa con el de la cuenta: el nombre de usuario del campus.
3. Guarda la nota con el mismo formulario y lee su `rid` nuevo.
4. Lee las notas de ese DNI en el período actual y los umbrales de CargaMateriasPrimero, y calcula el índice.
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

### Página de carga (SCRUM-22)

Es la opción B: [`section/carga_notas_primero/content.html`](../../section/carga_notas_primero/content.html), una página con el sistema de diseño para el rol EST. **Publicada el 2026-11-02** como Página "Carga de notas de 1.er año" (cmid 60209, `paginas.carga_notas_primero`) en la subsección Hub, visible en el listado. Los docentes ven todas las notas desde la tarjeta "Notas de 1.er año" del Hub, que abre la base.

**Qué muestra:**
- **Nueva nota:** Materia, Instancia, Fecha del parcial, Condición y Nota. El DNI y el nombre salen de la cuenta y no se editan.
- **Notas registradas:** las notas propias, de la más reciente a la más antigua, con la fecha en `DD-MM-AAAA`, el cuatrimestre (`2.º 2026`), el parcial que recupera cada recuperatorio y un botón **Editar** en cada una.

**Cómo cumple las [reglas de los campos](#reglas-de-los-campos):**

| Campo | En la página |
|---|---|
| DNI | Nombre de usuario de la cuenta (`/login/change_password.php`), como en Tools. Sin DNI no se puede cargar |
| Estudiante | Encabezado del perfil (`/user/profile.php`). Si no se lee, queda vacío |
| Materia | Lista con las materias de 1.er año del Plan 2024 (cuatrimestres 1 y 2) de la base Materias (d=152), con la versión vigente de cada código y sin bajas. Si la base no se puede leer, usa la lista de respaldo `MATERIAS_PRIMERO` con los mismos 7 nombres |
| Instancia | `Parcial 1` a `Parcial N` según la materia, más `Recuperatorio` (como indica la descripción del campo en Moodle). La cantidad de parciales sale de `PARCIALES`: 2 por defecto y 3 en Física A. Es el único dato por materia: la cantidad de recuperatorios no se configura, porque cada recuperatorio indica qué parcial recupera (se carga uno por cada parcial recuperado). **Provisorio:** son los datos que recuerda el equipo, sin confirmar con las cátedras. Cuando se confirmen, pueden pasar a un campo "Parciales" en CargaMateriasPrimero (cambio en Moodle, con confirmación). Si una materia tiene de más, sobra una opción; si tiene de menos, no se puede cargar un parcial. Los finales quedan fuera del alcance por ahora |
| Fecha | Selector de fecha del navegador. Se guarda en `AAAA-MM-DD`. No puede ser posterior a hoy ni anterior a 2024-01-01. El formato que se ve en el selector depende del idioma del navegador: en español, `dd/mm/aaaa` |
| Nota | De 0 a 10, con hasta dos decimales y **punto** como separador (`4.5`; `4,5` se rechaza con un error que indica el formato). Es un campo de texto: con `type="number"` el navegador descartaba la coma y "1,0" se guardaba como 10. Con la condición Ausente no se completa y se guarda `0`, porque el campo es obligatorio en Moodle. El cálculo cuenta la nota como ausencia por la condición, no por el número |
| Estado | Una sola opción entre Aprobado, Desaprobado y Ausente (en la página se llama "Condición") |
| Recupera_a | Con la instancia Recuperatorio aparece el campo **Parcial que recupera**, obligatorio, con los parciales de la materia. Sirve igual si la materia tiene un recuperatorio o uno por parcial. El cálculo agrupa los recuperatorios por este campo, no por el nombre de la instancia |

**Al guardar:**
1. Valida los campos. Cada error indica el campo, el valor recibido y lo que se esperaba.
2. Si ya existe una nota propia de la misma materia **en el mismo período**, no la duplica: ofrece editar la nota registrada. Un parcial se repite por su instancia (el mismo Parcial 1) y un recuperatorio, por el parcial que recupera (dos recuperatorios del Parcial 1). En otro período es una recursada: se guarda como nota nueva y la de la cursada anterior se conserva. El cálculo ya usa solo las notas del período actual (`periodoDeFecha` en Tools), así que no se mezclan. No se bloquea la carga de materias ya aprobadas: el cálculo no decide si una materia está aprobada y nadie revisa las notas.
3. Guarda con el formulario de Moodle de la base: lo pide (`edit.php?d=117`, con `&rid=` al editar), ubica cada campo por su etiqueta (sin la marca "Campo obligatorio" que Moodle agrega en Estado) y lo envía. Lee el `rid` de la redirección.
4. Llama a `CriticidadNotas({ rid })` sin esperar el resultado. Si la Página Tools publicada es anterior a la v5, la nota se guarda sin criticidad y queda un aviso en la consola.

**Privacidad:** la tabla filtra por el DNI de la cuenta. Con "requiere aprobación" en la base, Moodle ya devuelve solo las notas propias; el filtro evita que alguien con permiso para ver todas (un docente) vea las de otros en esta página.

**Criterio de 2.º año:** un estudiante pasa a 2.º año cuando empieza a cursar o ya aprobó Proyecto de Ingeniería Industrial I. Desde el 2026-11-02 (SCRUM-24, local) el estudiante lo indica en su [información personal](vista-estudiante.md) (campo `es_primer_anio` de la base Estudiantes), y **Mi Trayectoria** habilita la tarjeta *Parciales de primer año* solo en 1.er año. La página de carga no restringe quién carga: si un estudiante de 2.º recursa una materia de 1.er año y entra por el enlace directo, su nota también cuenta.

**Verificado (2026-11-01):**
- En local, con los 6 integrantes (DNI ficticios 99000001 a 99000006): cargar, editar, ausente, recuperatorio, nota repetida, errores de validación, cancelar la edición y que cada estudiante vea solo sus notas. A 1000 px y a 400 px, sin errores de consola.
- En el campus, solo con lecturas (GET): DNI y nombre de la cuenta, las 7 materias desde la base Materias, las 14 notas de la base con su `rid`, y el formulario de alta armado con los 8 campos (sin enviarlo).
- **Guardado real en el campus** (con confirmación, con la cuenta de Luca Zuanetti y la misma función de la página): Análisis Matemático I, Parcial 2, 2026-10-27, nota 7, Aprobado. Moodle la guardó en 0,7 s como **rid 20154**, con los 8 campos iguales a los enviados y el DNI de la cuenta. Sin entrada en Criticidad, porque el campus tiene Tools v4. Esta nota de prueba se borra junto con los demás datos de prueba de la base.
- **Edición real en el campus** (con confirmación): la misma nota (rid 20154) pasó a nota 8 y fecha 2026-10-28 en 0,7 s. Moodle conservó el rid, actualizó los campos y no creó otra entrada (la base siguió con 15 notas).
- **Revisión de Valentino con Playwright** (local y campus simulado con Tools v5 real): guardado, edición, ausente, recuperatorios, filtro por DNI y llamada a `CriticidadNotas({ rid })`. Corrigió el separador decimal de la nota.
- En local, después de la revisión: instancias por materia (Física A con Parcial 3), recuperatorio con el parcial que recupera (obligatorio, guardado en Recupera_a y editable), dos recuperatorios de parciales distintos en el mismo período, recursada en otro período guardada como nota nueva, y rechazados el parcial repetido y el segundo recuperatorio del mismo parcial en el mismo período. Sin errores de consola.
- **Prueba de punta a punta en el campus (2026-11-02)**, con la página publicada, Tools v5 y la cuenta de Luca Zuanetti con rol Estudiante: guardó Análisis Matemático I, Parcial 1, 2026-10-20, 6.5, Aprobado como **rid 20213**, con el DNI de la cuenta y **pendiente de aprobación**. `CriticidadNotas({ rid })` agregó su entrada en Criticidad (`fuente` notas_1ro, `rid_fuente` 20213, período 2026-2, índice 10, verde), que coincide con el cálculo de las dos notas del estudiante en el período.

## Reglas de los campos

El cálculo depende de que los datos lleguen así. Un formulario propio tiene que garantizarlo; el de Moodle no lo controla.

| Campo | Regla | Por qué |
|---|---|---|
| DNI | El de la cuenta del estudiante (el nombre de usuario). **No dejarlo editable** | El índice se calcula con las notas de ese DNI. Si el estudiante escribe otro, su nota no cuenta y ensucia la de otro |
| Estudiante | Nombre y apellido, de la cuenta | Solo para mostrar |
| Materia | **Exactamente el nombre de CargaMateriasPrimero** (por ejemplo, `Análisis Matemático I`, `Álgebra I- B`). Ofrecerlo como lista, no como texto libre | Las notas se agrupan por materia y se cruzan con su umbral por nombre. Se ignoran mayúsculas, espacios, guiones y guiones bajos, pero no las tildes |
| Instancia | `Parcial N` (según los parciales de la materia) o `Recuperatorio` | Cada parcial cuenta como una evaluación |
| Fecha | `AAAA-MM-DD` | Define el período: de enero a julio, `AAAA-1`; de agosto a diciembre, `AAAA-2`. Solo cuentan las notas del período vigente (`PERIODO_ACTUAL` en Tools; desde Tools v6, la base Períodos, [ADR-009](../decisions/009-cierre-de-periodo-y-omision.md)) |
| Nota | Número de 0 a 10. Vacío si estuvo ausente | Promedio y umbral |
| Estado | **Uno solo** entre `Aprobado`, `Desaprobado` y `Ausente` (el campo de Moodle permite elegir varios) | `Ausente` o sin nota cuenta como ausencia; `Aprobado`, como aprobada |
| Recupera_a | En un recuperatorio, **la instancia que reemplaza, escrita igual** (por ejemplo, `Parcial 1`) | El recuperatorio reemplaza a esa instancia en el cálculo |

## Antes de abrirlo a los estudiantes

1. **Configurar la base con "Requiere aprobación"** y no aprobar entradas. **Hecho el 2026-11-02** y probado con dos cuentas con el cambio de rol a Estudiante: cada una ve su nota pendiente y no la de la otra; los docentes ven todas. Las entradas cargadas antes quedaron aprobadas, así que las ve cualquier estudiante hasta que se reemplacen los datos de prueba.
2. **Completar CargaMateriasPrimero** con las 7 materias de 1.er año del Plan 2024. Hoy tiene Análisis Matemático I, Álgebra I- B, Fundamentos de Química y Análisis Matemático II. **Faltan Álgebra II, Física A y Fundamentos de la Programación:** sin ellas, sus notas cuentan como no críticas, con umbral 4.
3. **Elegir la opción A o la B.** Se eligió la B: la Página Tools v5 y la página propia se publicaron el 2026-11-02.
4. **Actualizar `PERIODO_ACTUAL`** en Tools si cambia el cuatrimestre. Con Tools v6 ([ADR-009](../decisions/009-cierre-de-periodo-y-omision.md), local) ya no hace falta: el período se cambia al cerrar el anterior en la Página Configuración del Sistema.
5. **Limpiar los datos de prueba** de la base. Tiene personas que no son del equipo (Carlos López, Juan Pérez…), contra la regla 5 de [`RULES.md`](../../RULES.md), y la nota de prueba del 2026-11-01 (rid 20152).

## Lo que todavía no hace

- **Borrar una nota no agrega una entrada en Criticidad.** El índice se corrige con la próxima nota que guarde el estudiante.
- **La importación por CSV de Moodle no calcula la criticidad,** porque no carga la plantilla JS.
- **Editar una nota agrega otra entrada,** con el mismo `rid_fuente`. Es correcto: cada entrada es una foto del momento.
- **Un cambio de umbral en CargaMateriasPrimero** se refleja recién en la próxima nota del estudiante. El recálculo de todos (`fuente = materias`) está pendiente ([ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md#publicación-y-pendientes)).
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
