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
├── models/                ← Modelos de cálculo propios (fórmulas, reglas, casos de prueba)
│   ├── MODELO_UBICACION_Y_ATRASO.md
│   ├── MODELO_CRITICIDAD_POR_CORRELATIVAS.md
│   ├── MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md ← ICE: encuesta cuatrimestral + fórmula de 0 a 100
│   ├── MODELO_DE_DATOS_V2.md      ← DER del SBIRE (23 entidades)
│   └── MODELO_SIMPLIFICADO_MOODLE.md ← El DER llevado a 12 bases de Moodle
├── decisions/             ← Registros de Decisiones (ADR)
│   ├── 001-arquitectura-general.md
│   ├── 002-main-menu-contenido.md
│   ├── 003-paleta-colores.md
│   ├── 004-sistema-de-diseno-mui.md
│   └── 005-modelo-de-bases-moodle.md
├── specs/                 ← Especificaciones vivas por sección
│   ├── main-menu.md
│   ├── tablero-estudiantes.md
│   ├── detalle-estudiante.md
│   ├── preguntas.md
│   ├── encuestas.md
│   └── responder-encuesta.md
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
Modelos de cálculo diseñados por el equipo: definición, fórmulas, ejemplos y
supuestos. Nombres `MODELO_<QUE_CALCULA>.md`. Se citan desde specs y ADRs.

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
- [Modelo de ubicación y atraso](models/MODELO_UBICACION_Y_ATRASO.md) — Cuatrimestre equivalente, deuda e inactividad
- [Modelo de criticidad por correlativas](models/MODELO_CRITICIDAD_POR_CORRELATIVAS.md) — Qué materias pendientes traban más
- [Índice de Criticidad Estudiantil (ICE)](models/MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md) — 10 preguntas de la encuesta cuatrimestral y la fórmula de 0 a 100
- [Plan de estudios 2024](../data/plan_estudios/README.md) — Materias y correlativas listas para importar
- [Reglas de desarrollo](../RULES.md) — Convenciones de código
