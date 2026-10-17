# ADR-003: Paleta de Colores

- **Estado:** Pendiente
- **Fecha:** 2026-10-16
- **Refs:** `paletas.html` (vista previa eliminada del repo el 2026-10-17; las opciones quedan documentadas en este ADR)

## Contexto

La paleta de colores actual (Sky/Teal/Purple) fue heredada del prototipo inicial. Se decidió evaluar alternativas antes de aplicarla al resto del sistema. La paleta no tiene que ser idéntica a la de section_sample actual; cada sección puede variar en estilo visual (no solo colores).

## Opciones presentadas

| ID | Nombre | Primario | Secundario | Terciario | Vibe |
|----|--------|----------|------------|-----------|------|
| A | Actual | Sky `#0284c7` | Teal `#0d9488` | Purple `#7e22ce` | Fría, limpia, profesional |
| B | Académica | Indigo `#4f46e5` | Amber `#d97706` | Emerald `#059669` | Institucional, cálida |
| C | Moderna | Blue `#2563eb` | Rose `#e11d48` | Slate `#475569` | Minimalista, alto contraste |
| D | Vibrante | Cyan `#0891b2` | Orange `#ea580c` | Violet `#7c3aed` | Energética, juvenil |
| E | Clásica Universitaria | Navy `#1e3a5f` | Gold `#b8860b` | Forest `#2d6a4f` | Tradicional, prestigiosa |
| F | Costera | Marine `#0369a1` | Coral `#f97316` | Sage `#65a30d` | Mar del Plata, oceánica |
| G | Neutra | Slate `#1e293b` | Blue `#2563eb` | Zinc `#71717a` | Sobria; el color queda reservado al semáforo |
| H | Tinta | Ink `#1e3a8a` | Cyan `#0e7490` | Violet `#6d28d9` | Profunda; sin tonos que se confundan con el semáforo |

### Estilos visuales (independientes de la paleta)

| ID | Estilo | Rasgos | Uso sugerido |
|----|--------|--------|--------------|
| E1 | Plano con borde (actual) | Borde 2px, sin sombra | Referencia |
| E2 | Elevado suave | Sin borde, sombras difusas, radios grandes | Pantallas del alumno |
| E3 | Acento lateral | Barra de color a la izquierda, botones con contorno | Institucional / docentes |
| E4 | Cabecera de color | Franja superior de color por tarjeta | Menús con muchos módulos |
| E5 | Neo-brutalista | Borde negro grueso, sombra sólida | Diferenciación en pantallas del alumno |
| E6 | Denso en lista | Filas con divisores | Paneles de docentes y gestión |

**Criterio clave:** el semáforo (rojo/amarillo/verde) es el dato principal del sistema. Las paletas con acentos rojos, naranjas o amarillos (B, C, D, F) compiten con él.

## Decisión

**Pendiente de selección.**

Se presentó `paletas.html` con vista previa de las 8 paletas y los 6 estilos visuales (eliminado después; los valores quedan en las tablas de este ADR). También se estableció que los estilos CSS (border-radius, sombras, tipografía, layout) pueden variar entre secciones — no están fijados.

## Consecuencias

- Hasta que se seleccione, las nuevas secciones deben usar una paleta placeholder o la actual (A).
- Una vez elegida, se actualizará `RULES.md` con los colores definitivos.
