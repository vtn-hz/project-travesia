# Zhakyz & Asociados

> Somos **Zhakyz & Asociados**, la consultora que desarrolla el **Proyecto Travesía**: el Sistema de BI para la Retención de Estudiantes (SBIRE) del Departamento de Ingeniería Industrial de la FI-UNMdP, en el marco del TFI de *Administración Empresarial en la Economía del Conocimiento* (AEEC).

## Identidad

| | |
|---|---|
| Nombre | **Zhakyz & Asociados** |
| Proyecto | Proyecto Travesía · Sistema de BI para la Retención de Estudiantes (SBIRE) |
| Cliente | Departamento de Ingeniería Industrial (DII) — FI-UNMdP |
| Versión de requerimientos a cargo | [v1.1 (06/10/2026)](requirements/ESPECIFICACION_REQUERIMIENTOS_V1_1.md) |

## Integrantes

Datos tomados del grupo **`2C2026-Zhakyz & Asociados`** de Moodle (curso 1732), consultado en modo lectura el 2026-10-17.

| Apellido, nombre | Nombre en Moodle | Usuario Moodle (id) | Rol en el curso |
|---|---|---:|---|
| Distefano, Gian Luca | GIAN LUCA DISTEFANO | 2806 | Profesor |
| Hernández Pascual, Valentino | VALENTINO HERNANDEZ PASCUAL | 2048 | Profesor |
| Spikerman, Nahuel | NAHUEL SPIKERMAN | 3623 | Profesor |
| Yanosky, Santiago Nicolás | SANTIAGO NICOLAS YANOSKY | 3751 | Profesor |
| Zuanetti, Luca | Luca Zuanetti | 3770 | Profesor |
| Zuviria, Nicolás Gabriel | NICOLAS GABRIEL ZUVIRIA | 3773 | Profesor y Estudiante |

- **Contacto:** los correos están en Moodle (*Participantes*, filtrando por el grupo). No se copian acá porque **este repositorio es público**.
- **Usuario para probar la vista del alumno:** Nicolás Zuviria es el único que además tiene rol **Estudiante** en el curso.
- **Datos de prueba:** toda la información de prueba del sistema usa a estos integrantes, con **datos académicos ficticios**.

## Logo

| Archivo | Uso |
|---|---|
| [`assets/LOGO_ZHAKYZ_ANIMADO.gif`](../../assets/LOGO_ZHAKYZ_ANIMADO.gif) | **Versión publicada en Moodle.** 800×450, 8 tonos de gris, 12,5 fps, 1,4 MB |
| [`assets/LOGO_ZHAKYZ_ANIMADO_ORIGINAL.gif`](../../assets/LOGO_ZHAKYZ_ANIMADO_ORIGINAL.gif) | GIF original generado con Gemini (1280×720, 25 fps, 7,6 MB) |
| [`assets/LOGO_ZHAKYZ.png`](../../assets/LOGO_ZHAKYZ.png) | Estático, fondo transparente y recortado: para encabezados y documentos |
| [`assets/LOGO_ZHAKYZ_ORIGINAL.png`](../../assets/LOGO_ZHAKYZ_ORIGINAL.png) | Estático original (fondo claro) |

Estilo: tinta japonesa (sumi-e) en blanco y negro, con un samurái en guardia y un corte de katana que atraviesa el nombre.

## Nuestro espacio en Moodle

| | |
|---|---|
| Curso | CURSO DE PRUEBA — `course/view.php?id=1732` (Campus Ingeniería UNMdP, Moodle 5.0.2) |
| Sección | **Zhakyz** — `course/section.php?id=15647` |
| Restricción | Visible solo para el grupo **`2C2026-Zhakyz & Asociados`** (id de grupo 4264) |
| Encabezado | Resumen de la sección con el logo animado, el nombre y el lema, con el mismo formato que usan Koru y GLASS GROUP. Publicado el 2026-10-17 |

### Regla de trabajo

**Solo modificamos la sección Zhakyz.** Las secciones de los demás equipos se consultan en modo lectura y nunca se editan. Tampoco se reutilizan sus bases de datos: ver la alerta 1 del [relevamiento](research/RELEVAMIENTO_OTROS_EQUIPOS.md).

## Lo que construimos

| Pieza | Archivo |
|---|---|
| Menú del equipo de seguimiento (ADM, GES, TUT, PAR) | [`section/menu_inicial/content.html`](../../section/menu_inicial/content.html) |
| Sección de ejemplo del alumno | [`section/section_sample/content.html`](../../section/section_sample/content.html) |
| Modelos de cálculo | [`docs/models/`](../models/) |
| Plan de estudios 2024 | [`data/plan_estudios/`](../../data/plan_estudios/README.md) |
| Decisiones de arquitectura | [`docs/decisions/`](../decisions/) |
