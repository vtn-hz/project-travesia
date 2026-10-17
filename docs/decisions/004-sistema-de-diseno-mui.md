# ADR-004: Sistema de diseño basado en la plantilla Dashboard de Material UI

- **Estado:** Aceptada
- **Fecha:** 2026-10-17
- **Reemplaza a:** [ADR-003](003-paleta-colores.md) (paleta de colores, pendiente)
- **Refs:** [skill `diseno-ui`](../../.skills/diseno-ui/SKILL.md), [tokens](../../.skills/diseno-ui/referencia/tokens.md), [`RULES.md`](../../RULES.md)

## Contexto

La elección de paleta (ADR-003) seguía pendiente, con 8 paletas y 6 estilos. Al revisar el menú inicial, el equipo marcó que los **emojis** le quitaban seriedad a un sistema de seguimiento de estudiantes en riesgo. Hacía falta un sistema de diseño completo (color, tipografía, componentes e íconos) y no solo una paleta.

## Opciones consideradas

1. **Elegir una de las paletas del ADR-003.** Resolvía el color, pero no los íconos, los componentes ni la tipografía.
2. **Kit "Material UI for Figma"** (Material clásico): completo, pero con radios de 4px, botones en mayúscula y una estética más antigua.
3. **Plantilla Dashboard de Material UI v9.5.0** (código abierto, MIT): pensada justamente para tableros, sobria, con grises azulados, tarjetas planas y radio de 8px.

## Decisión

**Opción 3**, complementada con el kit de Figma para los estados de interacción y los tamaños, y con **Material Icons Outlined** (Apache 2.0) para los íconos. Queda documentada en la skill `diseno-ui`:

- Tokens en `referencia/tokens.md`, con los valores HSL de la plantilla pasados a hexadecimal.
- **Sin emojis:** íconos SVG inline (`iconos.js`).
- Semáforo con punto y texto, con contraste AA verificado (entre 5,1 y 8,5).
- Una sola acción principal por pantalla, tarjetas planas con borde y botones en minúscula.

Adaptaciones a las restricciones de Moodle (`RULES.md`): todo inline con `!important`; Inter sin cargar desde afuera (cae a la fuente del sistema); ancho de 850px.

## Consecuencias

- (+) Aspecto serio y consistente, con un estándar reconocido.
- (+) Componentes listos para copiar y un muestrario visual para comparar.
- (+) Accesibilidad: estados con texto y contrastes verificados.
- (−) Hay que migrar las secciones existentes. `menu_inicial` ya está migrada; faltan `tablero_estudiantes` y `section_sample`.
- (−) Los íconos SVG agregan unos cientos de bytes por ícono a cada sección.
