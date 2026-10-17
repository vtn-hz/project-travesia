# Documentación — Proyecto Travesía

> Sistema de BI para la Retención de Estudiantes (SBIRE)  
> FI-UNMdP — Departamento de Ingeniería Industrial

## Estructura

```
docs/
├── README.md              ← este archivo (índice general)
├── decisions/             ← Registros de Decisiones (ADR)
│   ├── 001-arquitectura-general.md
│   ├── 002-main-menu-contenido.md
│   └── 003-paleta-colores.md
├── specs/                 ← Especificaciones vivas por sección
│   └── main-menu.md
└── changelog.md           ← Log cronológico de todas las decisiones
```

## Convenciones

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

- [Requerimientos](../PROJECT_CONTEXT_11.md) — Especificación de requerimientos v1.1
- [Reglas de desarrollo](../RULE.md) — Convenciones de código
