# ADR-002: Contenido y Estructura del Main Menu

- **Estado:** Aceptada
- **Fecha:** 2026-10-16
- **Refs:** [ESPECIFICACION_REQUERIMIENTOS_V1_1.md](../context/ESPECIFICACION_REQUERIMIENTOS_V1_1.md) (Reqs 1, 2, 5, 6, 9, 10, 11)

## Contexto

El main_menu es la pantalla de entrada del sistema Travesía. Necesitamos definir qué módulos muestra, para qué roles, y cómo se comporta adaptativamente.

## Decisión

### Menú unificado adaptativo por rol

Un solo HTML que detecta el rol del usuario (vía Moodle) y muestra/oculta tarjetas según corresponda.

### Contenido para ROL ESTUDIANTE (EST)

| # | Tarjeta | Descripción | Estado visual | Ref |
|---|---------|-------------|---------------|-----|
| 1 | **Encuesta Inicial** | Datos filiatorios, cohorte, año de ingreso. Única vez. | ✅ Completada / ⏳ Pendiente | Req 2, 9 |
| 2 | **Encuesta Cuatrimestral** | Percepción de cursada, situación personal. Periódica con ventana temporal. | ✅ / ⏳ / ❌ Vencida / 🔒 Cerrada | Req 2 |
| 3 | **Carga de Notas** | El alumno registra sus propias calificaciones parciales/finales. | Siempre disponible | Req 1 |
| 4 | **Dashboard Personal** | Enlace al panel con semáforo, avance curricular, índice de ritmo. | — | Req 5, 6 |
| 5 | **Solicitar Entrevista** | Solicitar entrevista a Tutor o Asesor Par. | — | Req 11 |
| 6 | **Mi Reporte** | Descargar reporte propio de trayectoria (CSV/PDF). | — | Req 5 |

### Semáforo de criticidad

Se muestra de forma **prominente** en el menú del alumno (no sutil). El alumno ve su propio estado de criticidad actual (🔴 / 🟡 / 🟢) basado en los criterios del Req 4.

### Contenido para ROLES NO-ALUMNO (GES, TUT, PAR, ADM)

| Tarjeta | Descripción | Roles | Ref |
|---------|-------------|-------|-----|
| **Sección Encuestas** | Acceso a editar Encuesta Inicial y Encuesta Cuatrimestral. La generación de encuestas está en desarrollo. | ADM, GES | Req 3 |
| **Dashboard Docente** | Tablero con lista de estudiantes en situación crítica. | TUT, GES, ADM | Req 5 |
| **Dashboard Entrevistas** | Solicitudes, historial, contra-ofertas. | TUT, PAR | Req 11 |
| **Importar Datos** | Carga masiva CSV/XLS de notas, inscriptos, estados. | GES | Req 1 |
| **Reportes** | Informes de gestión, exportación CSV/PDF. | GES, TUT, ADM | Req 5 |

### Indicadores de estado por tarjeta

Cada tarjeta del alumno muestra un badge visual con su estado:
- ✅ **Completada** — verde, acción ya realizada
- ⏳ **Pendiente** — amarillo/amber, acción requerida
- ❌ **Vencida** — rojo, no se completó a tiempo (genera alerta Req 2)
- 🔒 **Cerrada** — gris, fuera de período

## Consecuencias

- (+) Un solo archivo para todos los roles, menor mantenimiento.
- (+) El alumno tiene visibilidad completa de su situación desde la entrada.
- (-) Lógica de detección de rol agrega complejidad al JS.
- (-) Si se agregan más roles/módulos, el archivo crece.
