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
