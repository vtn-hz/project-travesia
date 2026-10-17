# Plan de estudios — Ingeniería Industrial

Datos del plan listos para importar en una **Base de datos** (`mod_data`) de la sección Zhakyz.

| Archivo | Contenido |
|---------|-----------|
| `PLAN_2024_MATERIAS.csv` | 52 espacios del Plan 2024 (una fila por materia) |
| `PLAN_2024_CORRELATIVAS.csv` | 76 correlatividades (una fila por par materia → requerida) |

## Origen

Se tomó la base **"DB Plan de estudios"** de LuminaTech (`mod/data/view.php?id=59408`), leída en modo solo lectura el 2026-10-17.

Cómo la armaron ellos:

- **Una base `mod_data`** con 7 campos: `Codigo`, `Nombre`, `Creditos`, `Horas`, `Correlativas` (texto), `Año` (desplegable 1–5) y `Cuatrimestre` (desplegable 1, 2, Anual).
- Las 52 entradas las cargó una sola persona el mismo día (14/10/2026), así que seguramente las **importó por CSV** con *Base de datos → Importar entradas*.
- Una **plantilla de lista en forma de tabla** (una `<table>` por entrada) con un `<script>` en el pie que reordena las filas por año y cuatrimestre, ubicando las anuales entre el 1.º y el 2.º cuatrimestre.

## Qué cambiamos respecto de LuminaTech

| Problema en el original | Cómo quedó acá |
|---|---|
| Las correlativas eran **nombres en texto separados por coma**: se rompen con errores de tipeo ("Tecnologías de Control" vs. "Tecnología de Control") y con nombres que tienen coma ("Ética, Legislación y…") | Archivo aparte de correlatividades con **códigos** (`codigo_materia → codigo_requerida`), como el modelo de Perceptron |
| Electivas y optativas sin código (`-`) | Códigos propios: `ELEC1`–`ELEC4`, `OPT1`, `OPT2` |
| "Electiva VI" en 5.º año, 2.º cuatrimestre | Corregida a **Electiva IV**, por la secuencia I, II, III (queda anotado en la columna `nota`) |
| "(anual)" dentro del nombre | Sacado del nombre: lo indica `cuatrimestre = Anual` |
| Sin ubicación en la escala 1–10 que usan nuestros modelos | Columnas `cuat_inicio` y `cuat_fin` |

El requisito de ingreso "Introducción a la Ciencia y la Ingeniería" se registra con el código **`INGRA01`**, como lo nombra el [modelo de ubicación](../../docs/models/MODELO_UBICACION_Y_ATRASO.md).

## Columnas

**`PLAN_2024_MATERIAS.csv`**

| Columna | Descripción |
|---|---|
| `plan` | `2024` (queda lugar para cargar el Plan 2003 en el mismo archivo o base) |
| `codigo` | Código de la asignatura |
| `nombre` | Nombre oficial |
| `anio` | Año de la carrera (1–5) |
| `cuatrimestre` | `1`, `2` o `Anual` |
| `cuat_inicio` / `cuat_fin` | Cuatrimestre del plan en escala 1–10. Las anuales ocupan dos (por ejemplo, Proyecto I va de 3 a 4) |
| `creditos`, `horas` | Carga de la materia |
| `tipo` | `obligatoria`, `ingles`, `electiva` u `optativa`. El modelo de criticidad excluye `ingles` |
| `nota` | Observaciones de la carga |

**`PLAN_2024_CORRELATIVAS.csv`**: `plan`, `codigo_materia`, `codigo_requerida`, `nombre_requerida`. El nombre se repite solo para que el archivo sea legible.

## Validaciones hechas

- **Aprobaciones esperadas acumuladas** (contando cada materia en su `cuat_fin`): 3, 7, 12, 18, 24, 31, 36, 42, 46, 52. Coinciden **exactamente** con la tabla del Plan 2024 del `MODELO_UBICACION_Y_ATRASO`.
- **Total:** 223 créditos y 3568 horas.
- **Ninguna correlativa** está en el mismo cuatrimestre que la materia que la requiere, ni en uno posterior.

## Pendientes

- **Plan 2003:** LuminaTech no lo cargó. Falta conseguir el documento oficial (el modelo de ubicación ya tiene su tabla acumulada).
- **Tipo de correlatividad:** el origen no distingue "para cursar" de "para rendir". Si el DII lo informa, se agrega una columna `condicion`.
- **Electivas y optativas:** no tienen correlativas definidas ("(**)" en el original).
- **Confirmar con el plan oficial** los códigos de la Facultad y la corrección de "Electiva VI".

## Cómo importarlo en Moodle

1. Crear en la sección Zhakyz una Base de datos "Plan de estudios" con **un campo por columna**, con los mismos nombres que el encabezado del CSV.
2. *Base de datos → Importar entradas* → subir el CSV con separador coma y codificación UTF-8.
3. Repetir lo mismo con una segunda base, "Correlatividades".
