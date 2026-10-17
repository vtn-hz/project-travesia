# Especificación: Main Menu

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/section_sample/content.html`
- **Decisiones relacionadas:** [ADR-002](../decisions/002-main-menu-contenido.md), [ADR-003](../decisions/003-paleta-colores.md)
- **Última actualización:** 2026-10-16

---

## Propósito

Pantalla de entrada del sistema Travesía. Hub de navegación que adapta su contenido según el rol del usuario autenticado en Moodle.

## Roles y visibilidad

```
┌────────────────────────────────────────────────────────┐
│                     MAIN MENU                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [EST]  Semáforo prominente (🔴/🟡/🟢)                │
│         ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│         │ Encuesta │ │ Encuesta │ │  Carga   │        │
│         │ Inicial  │ │ Cuatri.  │ │ de Notas │        │
│         └──────────┘ └──────────┘ └──────────┘        │
│         ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│         │Dashboard │ │Solicitar │ │    Mi    │        │
│         │ Personal │ │Entrevista│ │ Reporte  │        │
│         └──────────┘ └──────────┘ └──────────┘        │
│                                                        │
│  [GES]  Importar Datos · Sección Encuestas ·           │
│  [TUT]  Dashboard Docente · Dashboard Entrevistas      │
│  [PAR]  Dashboard Entrevistas                          │
│  [ADM]  Todo + Sección Encuestas (editar/crear)        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Tarjetas del Estudiante (EST)

### 1. Encuesta Inicial
- **Frecuencia:** Única vez
- **Datos:** mail, año de ingreso (cohorte)
- **Estados:** ✅ Completada → deshabilitada | ⏳ Pendiente → CTA activo
- **Backend:** `mod_data` CMID 59387, campos 519 (mail), 520 (fecha), 552 (userid)

### 2. Encuesta Cuatrimestral
- **Frecuencia:** Cada cuatrimestre (Jun–Ago = 1°C, Dic–Mar = 2°C)
- **Estados:** ✅ Completada este período | ⏳ Pendiente | 🔒 Cerrada (fuera de período) | ❌ Vencida (no completó)
- **Backend:** `mod_data` CMID 59386, campos 522 (mail), 521 (fecha), 551 (userid)
- **Lógica temporal:** función `obtenerEstadoCuatrimestre()` + `esMismoPeriodo()`

### 3. Carga de Notas
- **Frecuencia:** Siempre disponible
- **Datos:** filas dinámicas materia + nota
- **Estado actual:** ⚠️ Solo muestra alert, NO guarda en Moodle todavía

### 4. Dashboard Personal
- **Destino:** Sección separada (enlace)
- **Contenido:** semáforo, avance curricular, índice de ritmo
- **Ref:** Reqs 5, 6

### 5. Solicitar Entrevista
- **Destino:** Formulario o sección de entrevistas
- **Flujo:** EST solicita → TUT/PAR acepta o contra-oferta
- **Ref:** Req 11

### 6. Mi Reporte
- **Acción:** Descarga de reporte de trayectoria propia (CSV/PDF)
- **Ref:** Req 5

## Semáforo de Criticidad

Mostrado de forma prominente para el alumno. Criterios (Req 4):

| Nivel | 1° Año | 2°+ Año |
|-------|--------|---------|
| 🟢 Verde | Aprobación > 60% materias esperadas | Indicadores cuanti + cuali positivos |
| 🟡 Amarillo | Aprobación 20%–60% | Indicadores mixtos |
| 🔴 Rojo | Aprobación < 20% | Indicadores críticos (disconformidad, retraso, cambio de prioridad) |

## Sección para roles no-alumno

### Sección Encuestas (ADM, GES)
- Editar Encuesta Inicial
- Editar Encuesta Cuatrimestral
- (Generación de encuestas: en desarrollo)

### Importar Datos (GES)
- Subir CSV: `{dni, codigo_materia, tipo_examen, nota, fecha}`
- Subir CSV: `{dni, codigo_materia, estado_cursada, fecha}`

## Fecha simulada

Para pruebas, el sistema lee una fecha de referencia desde `mod_data` CMID 59405, parseando múltiples formatos. Si no encuentra, usa `new Date()`.
