# ADR-011: Estado actual de criticidad en la base Estudiantes

- **Estado:** aceptada (2026-11-18): opción A, con los campos `*_rid`. **Desarrollada en la rama `feat/estado-actual-criticidad`, sin publicar** (Tools v10, Tablero, Configuración del Sistema, definición y plantilla de Estudiantes, `agregar_campos.js`)
- **Fecha:** 2026-11-17
- **Pedido:** Valentino Hernández Pascual: el Tablero de Criticidad tarda mucho en cargar; ¿es viable "una vista que sea la conjunción entre la última criticidad que muestra la tabla y los datos del estudiante", y aceleraría el proceso?
- **Refs:** [ADR-005](005-modelo-de-bases-moodle.md) (carga de datos en el navegador), [ADR-007](007-encuestas-respuestas-y-criticidad.md) (base Criticidad), [ADR-009](009-cierre-de-periodo-y-omision.md) (omisión), [ADR-010](010-criticidad-por-fuente.md) (parciales y encuesta por separado), [spec del tablero](../specs/tablero-estudiantes.md)

## Contexto: por qué tarda el Tablero (medido en el campus el 2026-11-17)

| # | Hallazgo | Medición |
|---|---|---|
| 1 | **Moodle arma cada entrada de la lista** con la plantilla de la base: el costo crece con la cantidad de entradas, no con los pedidos | ~14 ms por entrada. Criticidad (577) tarda de 6 a 9 s sola |
| 2 | **Los pedidos de una sesión se atienden de a uno** (bloqueo de sesión de PHP): pedir en paralelo no acelera | 2 pedidos de 300 en paralelo: 18 s; 1 de 1.000: 8 s |
| 3 | **El Tablero lee todo Criticidad** para quedarse con la última entrada de cada fuente por estudiante | Con los datos de prueba, ~13 a 19 s según la carga del campus |
| 4 | **Criticidad crece con cada nota, encuesta y omisión.** Con 300 estudiantes, unas 3.000 a 4.500 entradas por cuatrimestre | Entre 40 y 60 s más de carga por cada cuatrimestre de uso |
| 5 | **No hay forma de pedir menos:** el servicio `mod_data_get_entries` está deshabilitado; la búsqueda (`filter=1&search=`) filtra por un texto, pero no admite varios estudiantes a la vez (espacio = Y; `OR` no existe), y 20 lecturas filtradas tardan 17 s | Probado en modo lectura |
| 6 | **Paginar la tabla de a 20 no acelera:** la tabla se dibuja en milisegundos; lo lento es leer Criticidad, y el orden por riesgo, los totales y los filtros necesitan el estado de todos | — |

El Detalle del estudiante ya se resolvió con la búsqueda por estudiante (de ~21 s a ~3 s, publicado el 2026-11-17). El Tablero no puede usarla porque necesita a todos.

## ¿Una vista?

**En Moodle no se puede hacer una vista como en SQL.** Cada base de datos (mod_data) es independiente: no hay vistas, no se pueden cruzar dos bases y el equipo no tiene acceso a la base del campus. Lo más parecido es una **tabla resumen materializada**: guardar, junto a los datos del estudiante, la última criticidad de cada fuente, y mantenerla al día cada vez que se agrega una entrada en Criticidad. El Tablero leería solo esa tabla.

## Opciones

| | A. Campos de estado en **Estudiantes** | B. Base nueva **EstadoActual** | C. Seguir leyendo Criticidad |
|---|---|---|---|
| Qué lee el Tablero | Estudiantes (una entrada por estudiante) + las entradas manuales de Criticidad, con la búsqueda `manual` | EstadoActual + Estudiantes + manuales | Todo Criticidad |
| Tiempo estimado hoy (65) | **~3 a 4 s** (Estudiantes: 1,2 s; manuales: 16 entradas, ~1,7 s) | ~4 a 5 s | 13 a 19 s |
| Con 300 estudiantes | **~6 a 8 s, y no crece con el tiempo** | Igual, más una lectura | Crece ~40 a 60 s por cuatrimestre |
| Una entrada por estudiante | **Ya existe** (máximo 1 por estudiante, la carga el propio estudiante) | Hay que crearla: si la crea el equipo (omisión) queda a su nombre, el estudiante no la puede editar y crea otra (duplicados) | — |
| Cambios en Moodle | Agregar campos al final de Estudiantes, sin recrearla (como en RespuestasEntrevistas) | Una base nueva con plantillas | Ninguno |

**Se propone A.**

## Cómo funcionaría (A)

**Campos nuevos en Estudiantes** (texto): `parciales_indice`, `parciales_periodo`, `parciales_fecha`, `parciales_rid` y `encuesta_indice`, `encuesta_periodo`, `encuesta_fecha`, `encuesta_fuente` (`respuestas` u `omision`), `encuesta_rid`. Son la **entrada automática más nueva de cada fuente**: la del **período más nuevo** (`AAAA-C`) y, dentro de él, la última cargada (`created_at`; si empatan, el rid mayor). Así una nota cargada tarde de un período anterior no pisa la del período vigente (Tools v11). `*_rid` apunta a esa entrada de Criticidad (el "por qué", como `rid_fuente`).

**El estado asignado no va en el resumen:** lo escribe un tutor sobre la entrada de otro, y dos escrituras sobre la misma entrada se pisan (Moodle guarda el formulario entero). Se sigue leyendo de Criticidad, filtrando por `manual`: son pocas y crecen solo con las asignaciones.

**Quién actualiza el resumen**, siempre después de agregar la entrada de Criticidad y solo si la nueva es más nueva que la guardada:

| Evento | Quién | Dónde |
|---|---|---|
| Envía la Cuatrimestral | El navegador del estudiante (su propia entrada) | `CopiaRespuestas` de Tools |
| Carga una nota | El navegador del estudiante | `CriticidadNotas` de Tools |
| Omisión al cerrar el período | El equipo (puede editar cualquier entrada) | Página Configuración del Sistema |

**El Tablero no cambia sus reglas:** la última entrada de una fuente es la del período vigente si hay alguna; si es del período anterior se muestra "período 2026-2" (ADR-009) y, si es más vieja, "Sin calcular". Con los períodos guardados en el resumen, da lo mismo que hoy.

## Riesgos y cómo se cubren

| Riesgo | Cobertura |
|---|---|
| **Dos escrituras (Criticidad y resumen):** si la segunda falla, el resumen queda atrasado | Queda pendiente y se reintenta, como hoy la entrada de Criticidad. Además, un botón **"Recalcular el estado actual"** en la Configuración del Sistema (ADM) lo rehace para todos desde Criticidad |
| **Escrituras que se pisan** sobre la misma entrada (el estudiante guarda su información personal mientras se registra una omisión) | Se lee el formulario justo antes de guardar, como ya hace Información personal; la ventana es de segundos y el recálculo lo corrige |
| **El estudiante puede editar sus campos de estado** desde el formulario de la base | Es el mismo límite que hoy tiene Criticidad (ADR-007, pendiente de roles). A verificar: si una plantilla de alta sin esos campos los conserva al guardar, el formulario de Moodle dejaría de mostrarlos |
| **Información personal pisa los campos nuevos** | No: arma el formulario desde la entrada guardada (`new FormData(form)`), así que conserva los campos que no toca (revisado en `section/informacion_personal`) |
| **Lo ya cargado** (entradas reales y datos de prueba) | El recálculo completa el resumen de todos; para los datos de prueba, también `generar.js` y `aplicar.js` |
| **Publicar Tools** | Hace falta una versión nueva de Tools; hoy en `main` está la v9 del equipo sin publicar (depende de un campo nuevo de Períodos). Se coordina con ella |

## Qué habría que hacer

1. Agregar los campos a Estudiantes en Moodle y a su plantilla de lista (`data-campo`), sin recrear la base.
2. Tools: actualizar el resumen en `CopiaRespuestas` y `CriticidadNotas`, y una herramienta `RecalcularEstadoActual`.
3. Configuración del Sistema: actualizar el resumen al registrar cada omisión y el botón de recálculo.
4. Tablero: leer Estudiantes y las manuales (búsqueda `manual`), sin leer todo Criticidad.
5. Datos de prueba: completar el resumen (generador o recálculo).
6. Medir antes y después en el campus, como con el Detalle.

## Desarrollo (2026-11-18)

| Parte | Qué hace |
|---|---|
| Base Estudiantes | 9 campos de texto al final ([`BASE_ESTUDIANTES.json`](../../data/moodle/BASE_ESTUDIANTES.json)); en la plantilla de lista van ocultos (`d-none`) |
| [`agregar_campos.js`](../../.skills/publicar-seccion/agregar_campos.js) | Agrega al final de una base con entradas los campos nuevos de su definición; nunca borra ni edita campos |
| Tools v10 | `registrarCriticidad` guarda el rid de la entrada y llama a `ActualizarEstadoActual`, que edita solo esos campos de la entrada del estudiante si la nueva es la más reciente. Queda pendiente antes de intentarlo y se reintenta con las demás pendientes. `RecalcularEstadoActual` rehace todos. Si la base no tiene los campos, no hacen nada |
| Tablero | Con los campos en la base, lee Estudiantes y solo los estados asignados de Criticidad (`filter=1&search=manual`); sin ellos, como antes |
| Configuración del Sistema | Actualiza el estado actual con cada omisión del cierre y suma la tarjeta *Estado actual del Tablero* (Revisar y Actualizar) |

**Pruebas (local):**
- Tools contra un Moodle de mentira (listas, formulario de edición con "Campo obligatorio" y redirección): actualiza solo los campos del estado y conserva los demás; una entrada más vieja o una manual no cambian nada; Recalcular simula sin escribir, aplica y después no encuentra diferencias; sin los campos en la base no hace nada y avisa; y el camino completo de una nota (`CriticidadNotas` → Criticidad → estado actual) no deja nada pendiente. 12 de 12.
- Tablero con los 60 estudiantes de prueba: las mismas 60 filas y los mismos totales leyendo el estado actual que leyendo todo Criticidad.
- `agregar_campos.js` simulado contra el campus: Estudiantes tiene 9 campos y se agregarían los 9 nuevos al final.

## Cómo se publica (cada paso simulado y con confirmación)

1. **Tools v10.** Incluye la v9 del equipo (`TrayectoriaEstudiantes`, que lee un campo nuevo de Períodos): coordinarlo antes. Sin los campos en Estudiantes, la v10 no cambia nada visible.
2. **Campos en Estudiantes** con `agregar_campos.js` y la plantilla de lista con `subir_plantillas.js --clave estudiantes`. Desde acá, cada nota y encuesta nueva actualiza el estado actual.
3. **Configuración del Sistema** y, desde su tarjeta, **Revisar y Actualizar** el estado actual de todos (incluye los datos de prueba).
4. **Tablero**, que pasa a leer el estado actual. Medir antes y después en el campus.

Publicar el Tablero antes del paso 3 lo dejaría con todos *Sin calcular*.

## Decisiones

- **Opción A**, con los campos `*_rid` (pedido del equipo).
- **El estado asignado no se resume:** se sigue leyendo de Criticidad, filtrado.
