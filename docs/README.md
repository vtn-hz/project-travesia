# Documentación — Proyecto Travesía

> Sistema de BI para la Retención de Estudiantes (SBIRE)  
> FI-UNMdP — Departamento de Ingeniería Industrial

## Estructura

```
docs/
├── README.md              ← este archivo (índice general)
├── context/               ← Contexto del proyecto (requerimientos, marco teórico)
│   ├── ESPECIFICACION_REQUERIMIENTOS_V1_1.md
│   └── INDICADORES_TRAYECTORIA_TERMINALIDAD.md
├── decisions/             ← Registros de Decisiones (ADR)
│   ├── 001-arquitectura-general.md
│   ├── 002-main-menu-contenido.md
│   └── 003-paleta-colores.md
├── specs/                 ← Especificaciones vivas por sección
│   └── main-menu.md
└── changelog.md           ← Log cronológico de todas las decisiones
```

## Convenciones

### Contexto (`context/`)
Todo lo relacionado al contexto del proyecto: especificación de requerimientos,
marco de indicadores y material de referencia. Nombres en `MAYUSCULA_SNAKE_CASE`.

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

- [Requerimientos](context/ESPECIFICACION_REQUERIMIENTOS_V1_1.md) — Especificación de requerimientos v1.1
- [Indicadores](context/INDICADORES_TRAYECTORIA_TERMINALIDAD.md) — Indicadores de trayectoria y terminalidad
- [Reglas de desarrollo](../RULES.md) — Convenciones de código
