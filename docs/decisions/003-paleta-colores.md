# ADR-003: Paleta de Colores

- **Estado:** Pendiente
- **Fecha:** 2026-10-16
- **Refs:** [paletas.html](../../paletas.html)

## Contexto

La paleta de colores actual (Sky/Teal/Purple) fue heredada del prototipo inicial. Se decidió evaluar alternativas antes de aplicarla al resto del sistema. La paleta no tiene que ser idéntica a la del main_menu actual; cada sección puede variar en estilo visual (no solo colores).

## Opciones presentadas

| ID | Nombre | Primario | Secundario | Terciario | Vibe |
|----|--------|----------|------------|-----------|------|
| A | Actual | Sky `#0284c7` | Teal `#0d9488` | Purple `#7e22ce` | Fría, limpia, profesional |
| B | Académica | Indigo `#4f46e5` | Amber `#d97706` | Emerald `#059669` | Institucional, cálida |
| C | Moderna | Blue `#2563eb` | Rose `#e11d48` | Slate `#475569` | Minimalista, alto contraste |
| D | Vibrante | Cyan `#0891b2` | Orange `#ea580c` | Violet `#7c3aed` | Energética, juvenil |
| E | Clásica Universitaria | Navy `#1e3a5f` | Gold `#b8860b` | Forest `#2d6a4f` | Tradicional, prestigiosa |
| F | Costera | Marine `#0369a1` | Coral `#f97316` | Sage `#65a30d` | Mar del Plata, oceánica |

## Decisión

**Pendiente de selección.**

Se presentó `paletas.html` con vista previa interactiva de las 6 opciones. También se estableció que los estilos CSS (border-radius, sombras, tipografía, layout) pueden variar entre secciones — no están fijados.

## Consecuencias

- Hasta que se seleccione, las nuevas secciones deben usar una paleta placeholder o la actual (A).
- Una vez elegida, se actualizará `RULES.md` con los colores definitivos.
