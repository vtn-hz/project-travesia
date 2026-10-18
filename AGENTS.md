# Instrucciones para agentes

Este archivo es para cualquier agente de IA que trabaje en el repo (Codex, Cursor, Gemini CLI, Copilot, Claude, etc.).

## Proyecto

**Proyecto Travesía · SBIRE**: Sistema de BI para la Retención de Estudiantes de Ingeniería Industrial (FI-UNMdP), embebido en Moodle. Lo desarrolla **Zhakyz & Asociados**: ver [`docs/context/EQUIPO_ZHAKYZ.md`](docs/context/EQUIPO_ZHAKYZ.md).

## Leer siempre primero

1. **[`RULES.md`](RULES.md)**: reglas obligatorias. Lo más importante:
   - En Moodle solo se puede modificar la sección **Zhakyz**. Las demás se leen y **nunca** se modifican.
   - "Desarrollar" es **siempre local**. Publicar en Moodle requiere **confirmación explícita** de cada cambio.
   - Relación 1 a 1 entre lo que está en Moodle y el repo.
   - Los datos de prueba son siempre los 6 integrantes del equipo, con datos ficticios.
   - Estilo de las secciones: HTML autocontenido, estilos inline con `!important` y vanilla JS en un IIFE.
   - Los ids de Moodle se cambian en `moodle.config.json` y se copian a las secciones con `node .skills/publicar-seccion/sincronizar_config.js` (líneas `// @config`).
2. **[`DEPLOY.md`](DEPLOY.md)**: qué está publicado en Moodle, qué está en local y qué está en revisión. Actualizarlo en cada publicación.
3. **[`docs/README.md`](docs/README.md)**: índice de la documentación (requerimientos, investigación, plataforma, modelos, ADRs y specs).

## Skills del proyecto

Procedimientos paso a paso para tareas que se repiten. Si una tarea coincide con una skill, **leé su `SKILL.md` y seguilo**.

| Skill | Cuándo usarla |
|---|---|
| [`.skills/crear-seccion`](.skills/crear-seccion/SKILL.md) | Crear o desarrollar una sección, tablero, panel o pantalla (`section/<nombre>/content.html`). Incluye una plantilla base |
| [`.skills/publicar-seccion`](.skills/publicar-seccion/SKILL.md) | Subir a Moodle una sección local (Página, Área de texto o resumen), **solo en la sección Zhakyz**, simulando primero y escribiendo únicamente con confirmación explícita. Incluye el script `publicar.js` |
| [`.skills/diseno-ui`](.skills/diseno-ui/SKILL.md) | Definir o revisar cómo se ve una sección: tokens (color, tipografía, espaciado), componentes, semáforo de riesgo e íconos SVG sin emojis. Basada en la plantilla Dashboard de Material UI. Incluye un muestrario visual |

## Estructura

```
section/<nombre>/content.html   ← cada pantalla que se pega en Moodle
section/<grupo>/<item>/content.html + seccion.json ← grupo = subsección de Moodle con varios ítems
docs/                           ← contexto, modelos, ADRs y specs
moodle.config.json              ← campus, curso, sección Zhakyz e ids de Moodle (única fuente)
data/                           ← datos para importar (plan de estudios) y definiciones de bases
assets/                         ← logos
.skills/                        ← procedimientos para agentes (Agent Skills)
```

## Commits

- En **inglés** y con **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`…).
- **Un commit por cambio lógico.**
- **Sin coautorías ni atribuciones a agentes de IA** (nada de `Co-Authored-By`, ni "Generated with…").
- No commitear, pushear ni publicar sin que el equipo lo pida.
