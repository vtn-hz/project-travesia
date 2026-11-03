# Especificación: Configuración del Sistema (período vigente y cierre del período)

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** [`section/configuracion/content.html`](../../section/configuracion/content.html)
- **Acceso:** tarjeta "Configuración del Sistema" del [Hub](../../section/menu_inicial/content.html) (rol ADM)
- **Rol:** ADM. Mientras Moodle no detecte roles, la Página va **oculta** (como el Tablero de Criticidad): es la única protección
- **Requerimientos:** Req 2 (alerta por omisión), Req 4 (semáforos)
- **Decisión:** [ADR-009](../decisions/009-cierre-de-periodo-y-omision.md)
- **Pedido:** Valentino Hernández Pascual a Luca Zuanetti, fuera del Jira · rama `luca-configuracion`
- **Estado:** **publicada el 2026-11-03** como Página oculta (cmid 60294) en la subsección oculta "Configuración" (cm 60293). La abre "Configurar" del Hub. El cierre ya escribe en las bases reales: usarlo solo cuando el equipo decida cerrar el período.
- **Última actualización:** 2026-11-02

## Qué muestra

1. **Período vigente:** período, inicio, fecha límite de la Encuesta Cuatrimestral, plazo en días y un chip con el estado del plazo (*Dentro del plazo · faltan N días*, *El plazo vence hoy*, *Plazo vencido el …* o *Sin fecha límite*). Sin fecha límite, un aviso lo dice. *Definir la fecha límite* (o *Cambiar la fecha límite*) abre un diálogo con la fecha; al guardar, agrega a Períodos una entrada del mismo período y el mismo inicio con la fecha nueva (la vigente es la última). La fecha tiene que ser posterior al inicio y distinta de la actual. Si la base Períodos no se puede leer, un aviso de error dice qué período usan las vistas mientras tanto y el cierre queda deshabilitado.
2. **Cierre del período (simulación):** se arma al abrir la Página y no escribe nada.
   - Resumen: estudiantes de 2.º año en adelante, respondieron, reciben omisión, ya tienen omisión, pasaron a 2.º año en el período y 1.er año (fuera del cierre).
   - Tabla de los estudiantes de 2.º año en adelante: la Encuesta Cuatrimestral del período (respondida y cuándo, o sin responder) y el resultado del cierre (*Recibe omisión*, con el índice, el índice total y el semáforo que va a quedar; *Ya tiene omisión*; *Fuera del cierre*; *Sin cambios*, "debe volver a responder en <período nuevo>").
   - *Volver a leer las bases* y *Cerrar el período <período>*.
3. **Historial de períodos:** las entradas de la base Períodos, la vigente marcada.

## Cierre

- **Diálogo:** qué se va a escribir, el inicio del período nuevo (hoy, editable) y la **fecha límite** de su Encuesta Cuatrimestral (opcional: se puede definir después desde *Período vigente*; si se carga, posterior al inicio), con el plazo en días. Si todavía no llegó la fecha límite del período que se cierra, pide marcar *Cerrar antes de la fecha límite del …*.
- **Errores** con el campo, el valor y lo esperado: `Fecha límite de la Encuesta Cuatrimestral: "01/10/2026" debe ser posterior al inicio del período (02/11/2026).`
- **Proceso** ([ADR-009 → flujo](../decisions/009-cierre-de-periodo-y-omision.md#flujo-del-cierre)):
  1. vuelve a leer las bases; si el período vigente cambió mientras tanto, se detiene sin escribir;
  2. por cada estudiante sin respuesta ni omisión, agrega la entrada de omisión a Criticidad y la desaprueba, de a una, con una barra de progreso;
  3. con todas guardadas, agrega el período nuevo a Períodos.
- **Si algo falla,** se detiene sin cambiar el período y lo informa con las omisiones ya guardadas. Volver a cerrar retoma: las que ya existen se ven como *Ya tiene omisión* y no se repiten.
- **Mientras corre,** el diálogo no se puede cerrar y el navegador pregunta antes de salir de la Página.
- **Al terminar,** un aviso con el resultado (omisiones con su `rid`, período vigente nuevo y su fecha límite) y, si alguna entrada no se pudo desaprobar, cuáles hay que desaprobar a mano.

## Quién recibe la omisión

| Situación | Condición | Resultado |
|---|---|---|
| 1.er año | `es_primer_anio = si` | Fuera del cierre (solo cuenta en el resumen) |
| Respondió | Hay una entrada de Respuestas con `codigo_encuesta = cuatrimestral` y el período | Sin cambios |
| Respondió solo en Moodle | Moodle tiene su respuesta de la Cuatrimestral desde el inicio del período, pero la copia no llegó a Respuestas | Sin omisión ("solo en Moodle"): la copia se reintenta cuando el estudiante vuelve a abrir la encuesta |
| Ya tiene omisión | Hay una entrada de Criticidad con `fuente = omision` y el período | Sin cambios: no se repite |
| Pasó a 2.º año en el período | `periodo_paso_superior` = el período | Fuera del cierre |
| Ninguna de las anteriores | — | **Recibe omisión** |

Solo figuran los estudiantes con entrada en la base Estudiantes (si hay varias, la de `rid` mayor).

## Entrada de omisión (base Criticidad)

| Campo | Valor |
|---|---|
| `id_usuario`, `dni` | Los de la base Estudiantes |
| `periodo` | El período que se cierra |
| `origen` / `fuente` | `automatica` / `omision` |
| `rid_fuente` | Vacío |
| `indice` | 70 ([modelo](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md#omisión)) |
| `indice_total` | Promedio del último índice de cada grupo de fuentes del estudiante en el período, contando la omisión (la regla de la Página Tools) |
| `semaforo` | El del `indice_total` (40 y 70) |
| `motivo` | `No respondió la Encuesta Cuatrimestral <período>.` |
| `created_at` | Fecha y hora del cierre |

Después de crearla, `view.php?d=<Criticidad>&disapprove=<rid>&sesskey=…` la desaprueba: así solo la ve el equipo. Cuenta como desaprobada solo si Moodle muestra el aviso de éxito; si no, el resultado del cierre la lista para revisarla en la base.

## El período en las demás vistas

| Vista | Qué cambia |
|---|---|
| Página Tools v6 | `PeriodoVigente()`: la copia de las encuestas y `CriticidadNotas` guardan con el período de la base |
| Mi Trayectoria | Estado de la Cuatrimestral en el período vigente, con "Responder hasta el …". Con una Cuatrimestral de un período anterior y ninguna del vigente: "Finalizó el período 2026-2. Se debe responder la Encuesta Cuatrimestral del período 2027-1 (1.er cuatrimestre 2027) hasta el …" |
| Información personal | Año máximo de ingreso y período en que el estudiante pasa a 2.º año |
| Tablero y Detalle | Calculado del período vigente o, sin entradas, del anterior, marcado "período 2026-2" |
| Hub | La tarjeta "Configuración del Sistema" abre esta Página |

## Vista previa local

Abrir `section/configuracion/content.html` con Live Server (o cualquier servidor en `localhost`): con `file://` el navegador puede no compartir `localStorage` entre Páginas.

- Datos de prueba: los del Tablero de Criticidad. En 2026-2, Valentino no respondió (recibe omisión), Nicolás respondió solo en Moodle (sin copia en Respuestas: no la recibe), Nahuel respondió y Luca, Gian Luca y Santiago son de 1.er año.
- Lo que se cierra queda en `localStorage`: los períodos en `zk-preview-periodos` (los leen Tools, Mi Trayectoria, Información personal, el Tablero y el Detalle) y las omisiones en `zk-preview-criticidad-cierre` (las leen el Tablero y el Detalle).
- *Simular un error en la 1.ª omisión* prueba que el cierre se detiene sin cambiar el período y que después se retoma. *Restablecer datos de prueba* (acá, en el Tablero o en Mi Trayectoria) vuelve a 2026-2.

**Verificado (2026-11-02, navegador integrado, `localhost`):** la simulación de 2026-2, primero con las reglas de base (2 omisiones con índice total 70, 1 respuesta y 3 de 1.er año) y, desde la revisión del 2026-11-03, con la respuesta de Nicolás solo en Moodle (1 omisión, 1 "Sin omisión · solo en Moodle", 1 respuesta); las validaciones del diálogo (sin fecha límite, fecha anterior al inicio y sin la casilla de cierre anticipado); un cierre con el error simulado en la 2.ª omisión (guardó una y no cambió el período) y otro en la 1.ª (no guardó ninguna); los cierres siguientes, que guardaron solo las que faltaban y pasaron a 2027-1; el Tablero (período 2027-1 y calculado del período anterior, con las omisiones) y el Detalle de Valentino (omisión en la cronología y en el gráfico); Mi Trayectoria (aviso para Nahuel, que desaparece al responder; sin aviso para Valentino, que nunca respondió); Información personal con 2027 como año vigente; la copia de la Encuesta Inicial simulada con Tools v6, que guardó la entrada de Criticidad en 2027-1; el Hub con la tarjeta habilitada; *Restablecer datos de prueba*; 400 px sin desborde y sin errores de consola. Tools v6 en Node, con un campus simulado: sin la base Períodos usa el último período leído en ese navegador (o `2026-2` si no leyó ninguno), también antes de leer la base. Fecha límite opcional (2026-11-03): con 2026-2 desde el 18/08 y sin fecha límite, el aviso y *Definir la fecha límite*; sus validaciones (sin fecha y anterior al inicio); la entrada nueva del mismo período en el historial, con el plazo de 104 días; el cierre, que pide la casilla con la fecha definida y abre 2027-1 sin fecha límite; Mi Trayectoria sin "Responder hasta" mientras no hay fecha; y el foco, que vuelve al botón al guardar.

**Probado en el campus, solo lectura (2026-11-02 y 2026-11-03):** Tools v6 y esta Página cargadas en memoria desde la rama (sin publicar) leen las bases reales (Estudiantes 2, Respuestas 3, Criticidad 12) y la simulación de 2026-2 da 0 omisiones (Valentino respondió; Santiago pasó a 2.º año en el período). La lectura de las respuestas de Moodle (`show_entries.php`) devuelve las dos respuestas de la Cuatrimestral con su fecha exacta. Solo pedidos GET.

**Sin verificar:** la escritura (alta de la omisión, desaprobarla y alta del período nuevo), que requiere crear la base Períodos.

## Pendientes

- Publicar, cada paso con confirmación ([ADR-009 → publicación](../decisions/009-cierre-de-periodo-y-omision.md#publicación-y-pendientes)).
- Definir con el equipo y el calendario académico la fecha límite de 2026-2 (el inicio ya está: 2026-08-18) y el criterio para los plazos siguientes. Se carga desde *Definir la fecha límite*, sin tocar código.
- Detectar el rol en Moodle: hasta entonces, la Página va oculta.
- Más adelante, en la misma Página: umbrales del semáforo y pesos de los indicadores (la tarjeta del Hub ya no los promete).
