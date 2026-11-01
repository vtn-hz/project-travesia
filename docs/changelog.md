# Changelog — Proyecto Travesía

Registro cronológico de todas las decisiones de diseño y arquitectura.

| Fecha | ADR | Decisión | Estado |
|-------|-----|----------|--------|
| 2026-10-16 | [001](decisions/001-arquitectura-general.md) | HTML autocontenido, inline CSS con `!important`, vanilla JS en IIFE, integración vía `mod_data` | Aceptada |
| 2026-10-16 | [002](decisions/002-main-menu-contenido.md) | Menú unificado adaptativo por rol con 5 módulos para EST y sección Encuestas para roles no-alumno | Aceptada |
| 2026-10-16 | [003](decisions/003-paleta-colores.md) | Paleta de colores — 6 candidatas presentadas, pendiente de selección | Pendiente |
| 2026-10-17 | [003](decisions/003-paleta-colores.md) | Se suman paletas G–H y estilos visuales E1–E6 a la comparativa | Pendiente |
| 2026-10-17 | [003](decisions/003-paleta-colores.md) | Se elimina la vista previa `paletas.html`; las opciones quedan en el ADR | Pendiente |
| 2026-10-17 | [004](decisions/004-sistema-de-diseno-mui.md) | Sistema de diseño basado en la plantilla Dashboard de Material UI (skill `diseno-ui`), sin emojis; reemplaza al ADR-003 | Aceptada |
| 2026-10-17 | [005](decisions/005-modelo-de-bases-moodle.md) | Modelo de bases de Moodle para la criticidad y su historial; en revisión por el peso de la carga de datos en el frontend | Pendiente |
| 2026-10-24 | [006](decisions/006-versionado-de-encuestas.md) | Las Encuestas de Moodle quedan como están y un script copia cada envío, con su puntaje de criticidad, a la base Respuestas, que solo agrega entradas (Moodle guarda solo la última respuesta). Se descarta la página propia de encuestas | Aceptada |
| 2026-10-31 | — | Se retira el DER v2 (`MODELO_DE_DATOS_V2.md`): el modelo simplificado para Moodle queda como único modelo de datos, con las reglas y los pendientes que solo estaban en el DER | Aceptada |
| 2026-10-31 | — | Los modelos se agrupan en `docs/models/datos`, `trayectoria` y `criticidad` | Aceptada |
| 2026-11-01 | [005](decisions/005-modelo-de-bases-moodle.md) | Cambio de requerimientos: cada estudiante carga sus propias notas, así que todo estudiante tiene cuenta del campus y `id_usuario_moodle` pasa a ser obligatorio | Aceptada |
| 2026-11-01 | [007](decisions/007-encuestas-respuestas-y-criticidad.md) | Bases Encuestas (definición de cada versión con la criticidad de cada opción), Respuestas (solo lo respondido, por `item_id`) y Criticidad (una entrada por evento, automática o manual, con `fuente`, `rid_fuente`, `indice` e `indice_total`). Publicado el 2026-11-01 (Tools v4, bases Encuestas y Criticidad, Respuestas con los campos nuevos) | Aceptada |
| 2026-11-01 | [007](decisions/007-encuestas-respuestas-y-criticidad.md) | Guía para la carga de parciales de 1.er año por los estudiantes ([spec](specs/carga-parciales-primero.md)); Tools v5 local con `CriticidadNotas({ rid })` para una página propia | Aceptada |
