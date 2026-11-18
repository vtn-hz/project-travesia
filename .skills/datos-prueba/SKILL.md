---
name: datos-prueba
description: Genera, aplica en el campus y borra el conjunto de datos de prueba de 60 estudiantes ficticios (data/prueba): Estudiantes, Respuestas, CargaParcialesPrimero, Criticidad y Entrevistas. Usar cuando pidan "cargar los datos de prueba", "poblar las bases", "que el sistema parezca en uso", "borrar los datos de prueba" o regenerarlos. Siempre simula primero y escribe solo con confirmación explícita.
---

# Datos de prueba del campus

Qué hay y cómo se genera: [`data/prueba/README.md`](../../data/prueba/README.md). Las reglas de [`RULES.md`](../../RULES.md) están por encima de esta skill (regla 5 y su excepción para este conjunto).

## Reglas que no se negocian

1. **Simular siempre primero** y escribir solo con un pedido explícito de aplicar o de borrar **ahora**.
2. **Solo las 5 bases de Zhakyz** de `moodle.config.json`. Los scripts verifican que estén dentro de Zhakyz y la guardia de red solo deja pasar el alta (`mod/data/edit.php` con `rid=0`) en esas bases, y desaprobar o borrar los rid de la lista.
3. **El borrado nunca toca una entrada sin marca:** id de usuario 900000–900999 (en CargaParcialesPrimero, un DNI de `estudiantes.json` con el mismo nombre). Si un rid de `aplicado.json` no tiene la marca, avisa y no lo toca.
4. **`data/prueba/aplicado.json` es el registro** de lo creado (ref → base y rid). Se commitea después de aplicar y de borrar, así cualquiera del equipo puede borrar.
5. **Credenciales** solo por `MOODLE_USUARIO` y `MOODLE_CLAVE`, pedidas en el momento.

## Pasos

### Generar (local)

```bash
node data/prueba/generar.js --verificar <excluir.json>
```

`excluir.json` (`{ "nombres": [...], "dnis": [...] }`) se arma leyendo el campus en modo lectura: los participantes del curso y los DNI ya cargados en las bases. **No va al repo.** El generador falla si un nombre o un DNI coincide.

### Aplicar

```bash
# 1. Simular: cuántas entradas crearía y, con credenciales, revisión de solo lectura de los campos y las opciones de cada base
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/datos-prueba/aplicar.js
# 2. Con confirmación del equipo (se puede probar antes con --limite 5)
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/datos-prueba/aplicar.js --confirmar
```

- Orden: Estudiantes, Respuestas, CargaParcialesPrimero, Criticidad (su `rid_fuente` "@REF" se reemplaza por el rid real) y Entrevistas. Criticidad no empieza hasta que estén todas las Respuestas y notas.
- Desaprueba las 46 omisiones, como el cierre real (ADR-009). Las que Moodle no confirme quedan marcadas y se reintentan en la próxima corrida.
- Son ~1.150 altas: con el campus lento, entre 40 y 90 minutos. **Si se corta, volver a correr retoma** (nada se duplica: lo creado ya está en `aplicado.json`).
- Después: commitear `aplicado.json`, anotar en `DEPLOY.md` y revisar en el campus el Tablero, el Detalle, los Indicadores y Reportes.
- **Estado actual (ADR-011):** al final, con todo Criticidad aplicado, guarda en los campos nuevos de Estudiantes la última entrada automática de parciales y de encuesta de cada estudiante de prueba, con su rid real (`ActualizarEstadoActual` de Tools v10; la guardia solo deja editar las entradas de Estudiantes de prueba). Queda marcado en `aplicado.json` (`estado_actual`), así que también completa a los ya aplicados y no se repite. Necesita Tools v10 y los campos en la base.

### Borrar

```bash
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/datos-prueba/remover.js              # simula
MOODLE_USUARIO='…' MOODLE_CLAVE='…' NODE_PATH=$(npm root -g) node .skills/datos-prueba/remover.js --confirmar  # borra
```

- Junta los rid de `aplicado.json` y, de respaldo, toda entrada con marca (por ejemplo, omisiones que haya agregado un cierre de período). La simulación muestra cuántas hay en cada base y cuántas están fuera del registro.
- Borra al revés (Entrevistas, Criticidad, CargaParcialesPrimero, Respuestas, Estudiantes), vuelve a leer las bases y confirma que no quedó ninguna entrada con marca; recién ahí vacía `aplicado.json`.
- Las entradas borradas de una base **no van a la papelera**: para recuperarlas, se vuelve a aplicar.

## Si algo falla

- **"Falta el campo … en la base":** cambió el formulario de la base. Correr la simulación con credenciales: la revisión de campos dice qué no coincide.
- **"La base … tiene más entradas que las que lee Tools":** `LeerBase` llegó a su tope; no seguir hasta revisarlo.
- **Timeout del login:** reintentar (ver la memoria del proyecto sobre los timeouts del campus).
