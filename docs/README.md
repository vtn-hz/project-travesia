# Documentación — Proyecto Travesía

> Sistema de BI para la Retención de Estudiantes (SBIRE)  
> FI-UNMdP — Departamento de Ingeniería Industrial

## Estructura

```
docs/
├── README.md              ← este archivo (índice general)
├── context/               ← Contexto del proyecto (insumos externos, no se diseñan acá)
│   ├── EQUIPO_ZHAKYZ.md   ← Quiénes somos, logo y nuestra sección en Moodle
│   ├── requirements/      ← Lo que pide el cliente
│   │   └── ESPECIFICACION_REQUERIMIENTOS_V1_1.md
│   ├── research/          ← Investigación: bibliografía y benchmark
│   │   ├── INDICADORES_TRAYECTORIA_TERMINALIDAD.md
│   │   └── RELEVAMIENTO_OTROS_EQUIPOS.md
│   └── platform/          ← Restricciones y capacidades de Moodle
│       └── MOODLE_SECCIONES_Y_HERRAMIENTAS.md
├── models/                ← Modelos propios: datos, trayectoria y criticidad
│   ├── README.md          ← Mapa: qué calcula cada modelo, con qué datos y quién lo usa
│   ├── datos/             ← Cómo se guarda la información
│   │   └── MODELO_SIMPLIFICADO_MOODLE.md ← Modelo de datos: 12 bases de Moodle
│   ├── trayectoria/       ← Dónde está el alumno y qué lo traba (sale del plan y de las notas)
│   │   ├── MODELO_UBICACION_Y_ATRASO.md
│   │   └── MODELO_CRITICIDAD_POR_CORRELATIVAS.md
│   └── criticidad/        ← Puntaje de 0 a 100 y semáforo (sale de las encuestas)
│       ├── MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md ← ICE: fundamento y versión objetivo
│       ├── MODELO_CRITICIDAD_ENCUESTAS.md ← Versión vigente: la que aplican las tools de Moodle
│       └── MODELO_CRITICIDAD_NOTAS_PRIMERO.md ← Índice de las notas de 1.er año (ICm/ICG)
├── decisions/             ← Registros de Decisiones (ADR)
│   ├── 001-arquitectura-general.md
│   ├── 002-main-menu-contenido.md
│   ├── 003-paleta-colores.md
│   ├── 004-sistema-de-diseno-mui.md
│   ├── 005-modelo-de-bases-moodle.md
│   ├── 006-versionado-de-encuestas.md
│   └── 007-encuestas-respuestas-y-criticidad.md
├── specs/                 ← Especificaciones vivas por sección
│   ├── main-menu.md
│   ├── tablero-estudiantes.md
│   ├── detalle-estudiante.md
│   ├── plan-estudios.md
│   ├── encuesta-inicial.md
│   ├── copia-encuestas.md
│   ├── carga-parciales-primero.md
│   └── entrevistas.md
└── changelog.md           ← Log cronológico de todas las decisiones
```

## Convenciones

### Contexto (`context/`)
Todo lo relacionado al contexto del proyecto: material que viene de afuera y
condiciona el diseño. Nombres en `MAYUSCULA_SNAKE_CASE`.
- `requirements/`: especificación del cliente (versionada en el nombre: `_V1_1`).
- `research/`: bibliografía, indicadores y relevamiento de otros equipos.
- `platform/`: cómo funciona Moodle y qué herramientas hay.

### Modelos (`models/`)
Modelos diseñados por el equipo: definición, fórmulas, ejemplos y supuestos.
Nombres `MODELO_<QUE_CALCULA>.md`, agrupados por tema:
- `datos/`: el modelo de datos (las bases de Moodle).
- `trayectoria/`: ubicación, atraso y correlativas, a partir del plan y de las notas.
- `criticidad/`: el puntaje de 0 a 100 y su semáforo, a partir de las encuestas.

Se citan desde specs y ADRs.

### Decisiones (`decisions/`)
Registros de Decisión de Arquitectura (ADR) numerados secuencialmente.
Cada archivo sigue el formato:
- **Título y número**
- **Estado**: `aceptada` | `pendiente` | `rechazada` | `reemplazada por ADR-XXX`
- **Fecha**
- **Contexto**: por qué surgió la necesidad
- **Opciones**: alternativas consideradas
- **Decisión**: qué se eligió y por qué
- **Consecuencias**: impacto de la decisión

### Especificaciones (`specs/`)
Documentos vivos que se actualizan a medida que se refinan los requerimientos.
Describen el **qué** de cada sección/módulo: contenido, roles, comportamiento, estados.

### Changelog (`changelog.md`)
Log cronológico plano con todas las decisiones, una línea por entrada.
Sirve como vista rápida de la historia del proyecto.

## Referencia

- [Equipo Zhakyz](context/EQUIPO_ZHAKYZ.md) — Quiénes somos, logo y nuestra sección en Moodle
- [Requerimientos](context/requirements/ESPECIFICACION_REQUERIMIENTOS_V1_1.md) — Especificación de requerimientos v1.1
- [Indicadores](context/research/INDICADORES_TRAYECTORIA_TERMINALIDAD.md) — Indicadores de trayectoria y terminalidad
- [Relevamiento de otros equipos](context/research/RELEVAMIENTO_OTROS_EQUIPOS.md) — Qué hicieron las demás consultoras
- [Moodle](context/platform/MOODLE_SECCIONES_Y_HERRAMIENTAS.md) — Secciones, herramientas y patrones de integración
- [Mapa de los modelos](models/README.md) — Qué calcula cada uno, con qué datos y quién lo usa
- [Modelo de datos](models/datos/MODELO_SIMPLIFICADO_MOODLE.md) — Las 12 bases de Moodle, con sus campos y reglas
- [Modelo de ubicación y atraso](models/trayectoria/MODELO_UBICACION_Y_ATRASO.md) — Cuatrimestre equivalente, deuda e inactividad
- [Modelo de criticidad por correlativas](models/trayectoria/MODELO_CRITICIDAD_POR_CORRELATIVAS.md) — Qué materias pendientes traban más
- [Índice de Criticidad Estudiantil (ICE)](models/criticidad/MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md) — 10 preguntas de la encuesta cuatrimestral y la fórmula de 0 a 100
- [Puntaje de criticidad de las encuestas](models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md) — Versión vigente: los puntos de cada respuesta, de 0 a 100
- [Índice de las notas de 1.er año](models/criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md) — ICm por materia e ICG por estudiante
- [ADR-007](decisions/007-encuestas-respuestas-y-criticidad.md) — Bases Encuestas, Respuestas y Criticidad
- [Carga de parciales de 1.er año](specs/carga-parciales-primero.md) — Guía para el apartado donde los estudiantes suben sus notas, y cómo se calcula su criticidad
- [Plan de estudios 2024](../data/plan_estudios/README.md) — Materias y correlativas listas para importar
- [Reglas de desarrollo](../RULES.md) — Convenciones de código
