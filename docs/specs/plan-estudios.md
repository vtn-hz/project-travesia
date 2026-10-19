# Especificación: Plan de Estudios y Correlativas (carga por CSV)

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/plan_estudios/content.html`
- **Base:** Materias ([`data/moodle/BASE_MATERIAS.json`](../../data/moodle/BASE_MATERIAS.json)), todavía no creada en Moodle (`bases.materias` en `moodle.config.json`)
- **Ejemplo listo para subir:** [`data/plan_estudios/PLAN_2024_CARGA.csv`](../../data/plan_estudios/PLAN_2024_CARGA.csv)
- **Última actualización:** 2026-10-19

---

## Propósito

Cargar uno o varios planes de estudio desde un CSV. La página explica el formato, revisa el archivo completo antes de guardar y dice qué corregir fila por fila.

## Roles

| Rol | Puede |
|---|---|
| ADM, GES | Ver el formato, subir un archivo, revisarlo y cargarlo |
| TUT, PAR | No acceden (la tarjeta del Hub no se les muestra) |

## Pasos de la pantalla

0. **Lo que está cargado hoy:** la versión vigente de cada materia (la entrada más nueva de cada `plan + codigo`, sin las dadas de baja), con un selector por plan. En Moodle se lee de la plantilla de lista de la base ([`plantillas/materias`](../../data/moodle/plantillas/materias/)); en local se muestra el Plan 2024 de ejemplo y se actualiza al cargar.
1. **Formato:** un ejemplo del archivo (fila 1 con los encabezados y fila 2 con una materia) y una tabla con cada columna, si es obligatoria, qué valores acepta y un ejemplo. Botón para descargar una plantilla CSV. En local, botón "Probar con el Plan 2024".
2. **Subir el archivo:** zona para arrastrar o elegir un `.csv`. Nada se guarda todavía.
3. **Revisión:** totales (materias, listas, errores, advertencias), lista de problemas por fila y vista previa con el estado de cada materia. Filtro "Con problemas".
4. **Carga:** el botón principal se habilita solo sin errores. Cada fila es una entrada nueva en Materias con `estado = vigente` y `cambio = Carga desde <archivo>`.

## Formato del CSV

Columnas: `plan, codigo, nombre, anio, cuatrimestre, duracion, tipo, creditos, horas, desbloquea`.

- Primera fila con los encabezados. El orden es libre, se acepta `año` por `anio` y las columnas que sobran se ignoran (con aviso).
- Separador coma, punto y coma o tabulación, detectado de la primera línea.
- UTF-8 (con o sin BOM). Si el archivo trae caracteres inválidos, se relee como Windows-1252 y se avisa.
- `desbloquea`: `codigo:cuatrimestre` separados por coma, por ejemplo `INGM102:2, INGF101:2`.

## Reglas de validación

| Nivel | Regla |
|---|---|
| Error | Columnas obligatorias faltantes (no se revisa nada más) |
| Error | `plan` fuera de 2024 · 2003; `codigo` vacío o con caracteres que no sean letras y números; `nombre` vacío |
| Error | `anio` fuera de 1–5; `cuatrimestre` fuera de 1–10; `duracion` o `tipo` fuera de sus opciones; `creditos` u `horas` no numéricos |
| Error | Anual que empieza en el cuatrimestre 10 |
| Error | `plan + codigo` repetido (vale la primera fila) |
| Error | Ítem de `desbloquea` sin el formato `codigo:cuatrimestre`, que no existe en el mismo plan del archivo, que se apunta a sí mismo, sin cuatrimestre o con un cuatrimestre distinto al de su fila |
| Advertencia | `anio` no coincide con el cuatrimestre (`ceil(cuatrimestre / 2)`) |
| Advertencia | Materia de `desbloquea` que empieza antes de que termine la que la desbloquea, o repetida |

Los cuatrimestres faltantes o distintos en `desbloquea` se pueden **completar automáticamente** con el de la fila de cada materia. Después se puede descargar el CSV corregido.

## Escritura en Moodle

Usa el formulario nativo de `mod/data/edit.php?d=<dataid>` (igual que Preguntas): ubica cada campo por su etiqueta y guarda una entrada por fila, en orden, mostrando el avance. Si una falla, se corta y dice cuántas se guardaron.

## Pendientes

- Crear la base Materias en Moodle con `crear_base.js`, cargarle las plantillas de `data/moodle/plantillas/materias/` y sincronizar `bases.materias.dataid`. Mientras sea `null`, la carga solo se simula.
- Reemplazar `Carga_Materias_Primero` (d=118): decidir dónde va su `Umbral` y la marca `esCritica`.
- Plan 2003: falta el documento oficial.
