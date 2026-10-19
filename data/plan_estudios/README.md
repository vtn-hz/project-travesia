# Plan de estudios — Ingeniería Industrial

Datos de los planes listos para importar en una **Base de datos** (`mod_data`) de la sección Zhakyz.

| Archivo | Contenido |
|---------|-----------|
| `PLAN_2024_MATERIAS.csv` | 52 espacios del Plan 2024 (una fila por materia) |
| `PLAN_2024_CORRELATIVAS.csv` | 76 correlatividades (una fila por par materia → requerida) |
| `PLAN_2003_MATERIAS.csv` | 43 espacios del Plan 2003 (una fila por materia) |
| `PLAN_2003_CORRELATIVAS.csv` | 66 correlatividades (una fila por par materia → requerida) |
| `PLAN_2024_CARGA.csv` | Los dos anteriores en el formato de la base **Materias** ([`BASE_MATERIAS.json`](../moodle/BASE_MATERIAS.json)): una fila por materia con `desbloquea` como `codigo:cuatrimestre`. Es el archivo que se sube en la sección [`plan_estudios`](../../section/plan_estudios/content.html) |

Los dos planes usan las mismas columnas, así que se pueden cargar en la misma base y separarlos por la columna `plan`.

## Origen

### Plan 2024

Se tomó la base **"DB Plan de estudios"** de LuminaTech (`mod/data/view.php?id=59408`), leída en modo solo lectura el 2026-10-17.

Cómo la armaron ellos:

- **Una base `mod_data`** con 7 campos: `Codigo`, `Nombre`, `Creditos`, `Horas`, `Correlativas` (texto), `Año` (desplegable 1–5) y `Cuatrimestre` (desplegable 1, 2, Anual).
- Las 52 entradas las cargó una sola persona el mismo día (14/10/2026), así que seguramente las **importó por CSV** con *Base de datos → Importar entradas*.
- Una **plantilla de lista en forma de tabla** (una `<table>` por entrada) con un `<script>` en el pie que reordena las filas por año y cuatrimestre, ubicando las anuales entre el 1.º y el 2.º cuatrimestre.

### Plan 2003

Se transcribió del documento oficial de la Facultad: **"Ingeniería Industrial - Plan 2003 (Texto Ordenado)"**, Anexo III, recibido el 2026-10-19. El documento indica el cuatrimestre (1 a 10), el código, los créditos de grado (CG), las horas y las correlativas por código de cada asignatura.

## Qué cambiamos respecto de los originales

### Plan 2024 (LuminaTech)

| Problema en el original | Cómo quedó acá |
|---|---|
| Las correlativas eran **nombres en texto separados por coma**: se rompen con errores de tipeo ("Tecnologías de Control" vs. "Tecnología de Control") y con nombres que tienen coma ("Ética, Legislación y…") | Archivo aparte de correlatividades con **códigos** (`codigo_materia → codigo_requerida`), como el modelo de Perceptron |
| Electivas y optativas sin código (`-`) | Códigos propios: `ELEC1`–`ELEC4`, `OPT1`, `OPT2` |
| "Electiva VI" en 5.º año, 2.º cuatrimestre | Corregida a **Electiva IV**, confirmado por el equipo |
| "(anual)" dentro del nombre | Sacado del nombre: lo indica `cuatrimestre = Anual` |
| Sin ubicación en la escala 1–10 que usan nuestros modelos | Columnas `cuat_inicio` y `cuat_fin` |

El requisito de ingreso "Introducción a la Ciencia y la Ingeniería" se registra con el código **`INGRA01`**, como lo nombra el [modelo de ubicación](../../docs/models/MODELO_UBICACION_Y_ATRASO.md).

### Plan 2003 (documento oficial)

Se siguieron los criterios de la tabla del Plan 2003 del [modelo de ubicación](../../docs/models/MODELO_UBICACION_Y_ATRASO.md):

| En el documento | Cómo quedó acá |
|---|---|
| **Introducción a la Ingeniería (`RA8`)**, en el cuatrimestre 1, sin créditos | No es una fila de materias: se toma como requisito de ingreso, igual que `INGRA01` en el Plan 2024. Sí aparece como requerida en las correlativas de las tres materias del cuatrimestre 1 |
| **Optativas: 16 CG**, sin cantidad de materias ni ubicación | No tienen filas. No entran en la tabla de aprobaciones esperadas ni en N |
| **IV Nivel de Inglés, 200 h de PPS y Seminario de Comunicación Eficaz** (requisitos académicos) | No tienen filas: son requisitos de egreso, no asignaturas |
| **Trabajo Final (`863`)**, correlativa "35 asignaturas aprobadas" | Fila en el cuatrimestre 10. Su correlativa no es un par de materias, así que **no está en el archivo de correlativas**: queda anotada en la columna `nota` |
| Gestión de la Calidad (`828`) pide "848 Organización y Dirección Industrial II": el **código y el nombre no coinciden** (848 es ODI I) | Se tomó el **nombre**: la correlativa es `849` (ODI II). Es la continuación de la cadena ODI I → ODI II y deja a ODI I tres cuatrimestres antes. Queda anotado en `nota` y a confirmar con el DII |
| "Mecanismos y Elementos de Maquinas" (sin tilde en la fila de la materia) | "Máquinas", como figura en la correlativa de Tecnología de la Fabricación |
| "Ingeniería Económica para empresas industriales y de servicios", partido en dos líneas | Nombre en una línea con mayúsculas de título |
| "Organización y Dirección Ind. I" (abreviado en una correlativa) | Nombre completo |

`anio` y `cuatrimestre` se derivan del cuatrimestre del plan (1–10): el documento no tiene materias anuales, así que todas tienen `cuat_inicio = cuat_fin`. Todas son de tipo `obligatoria`.

## Columnas

**`PLAN_<AÑO>_MATERIAS.csv`**

| Columna | Descripción |
|---|---|
| `plan` | `2024` o `2003` |
| `codigo` | Código de la asignatura |
| `nombre` | Nombre oficial |
| `anio` | Año de la carrera (1–5) |
| `cuatrimestre` | `1`, `2` o `Anual` |
| `cuat_inicio` / `cuat_fin` | Cuatrimestre del plan en escala 1–10. Las anuales ocupan dos (por ejemplo, Proyecto I va de 3 a 4) |
| `creditos`, `horas` | Carga de la materia |
| `tipo` | `obligatoria`, `ingles`, `electiva` u `optativa`. El modelo de criticidad excluye `ingles` |
| `nota` | Observaciones de la carga |

**`PLAN_<AÑO>_CORRELATIVAS.csv`**: `plan`, `codigo_materia`, `codigo_requerida`, `nombre_requerida`. El nombre se repite solo para que el archivo sea legible.

## Validaciones hechas

### Plan 2024

- **Aprobaciones esperadas acumuladas** (contando cada materia en su `cuat_fin`): 3, 7, 12, 18, 24, 31, 36, 42, 46, 52. Coinciden **exactamente** con la tabla del Plan 2024 del `MODELO_UBICACION_Y_ATRASO`.
- **Total:** 223 créditos y 3568 horas.
- **Ninguna correlativa** está en el mismo cuatrimestre que la materia que la requiere, ni en uno posterior.

### Plan 2003

- **Aprobaciones esperadas acumuladas:** 3, 7, 12, 17, 22, 27, 32, 35, 38, 43. Coinciden **exactamente** con la tabla del Plan 2003 del `MODELO_UBICACION_Y_ATRASO`.
- **Créditos:** 219 CG obligatorios más 10 del Trabajo Final, igual que el documento. Con las 16 CG de optativas suman los 245 CG para recibirse.
- **Horas:** 3664. Con las 256 h de optativas (16 CG × 16 h) suman las 3920 h del documento.
- **Ninguna correlativa** está en el mismo cuatrimestre que la materia que la requiere, ni en uno posterior. La única requerida que no es una fila de materias es `RA8`.

## Pendientes

- **Tipo de correlatividad:** ninguno de los dos orígenes distingue "para cursar" de "para rendir". Si el DII lo informa, se agrega una columna `condicion`.
- **Electivas y optativas del Plan 2024:** no tienen correlativas definidas ("(**)" en el original).
- **Confirmar con el plan oficial** los códigos del Plan 2024.
- **Consultar con el DII sobre el Plan 2003:**
  - la correlativa de Gestión de la Calidad (848 o 849);
  - las tres dudas del modelo de ubicación: si Introducción a la Ingeniería se toma como requisito de ingreso, cuántas optativas suelen cubrir las 16 CG y si el Trabajo Final es cuatrimestral o anual. Hoy está cargado como cuatrimestral, en el cuatrimestre 10.

## Cómo importarlo en Moodle

1. Crear en la sección Zhakyz una Base de datos "Plan de estudios" con **un campo por columna**, con los mismos nombres que el encabezado del CSV.
2. *Base de datos → Importar entradas* → subir el CSV con separador coma y codificación UTF-8. Los dos planes van en la misma base.
3. Repetir lo mismo con una segunda base, "Correlatividades".
