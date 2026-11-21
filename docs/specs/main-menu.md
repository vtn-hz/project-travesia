# Especificación: Main Menu

> Documento vivo — se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/section_sample/content.html`
- **Decisiones relacionadas:** [ADR-002](../decisions/002-main-menu-contenido.md), [ADR-003](../decisions/003-paleta-colores.md)
- **Última actualización:** 2026-10-16

> **Las tarjetas del Estudiante (EST) de esta spec quedaron reemplazadas** por la vista Mi Trayectoria y la Página Información personal ([spec](vista-estudiante.md), SCRUM-24, 2026-11-02). `section/section_sample` queda como ejemplo anterior y usa bases de otro equipo (no publicar).

---

## Propósito

Pantalla de entrada del sistema Travesía. Hub de navegación que adapta su contenido según el rol del usuario autenticado en Moodle.

## Roles y visibilidad

> **Rol en Moodle (2026-11-21, local):** el Hub ya no arranca fijo en ADM. Toma el rol que detecta el resumen de Zhakyz (grupo `Zhakyz_*`, "Cambiar rol a…" o rol del curso) y que publica en `<html data-zk-rol>` y en el evento `zk-rol`. Mientras se detecta no muestra tarjetas. Ver [ocultamiento por rol](ocultamiento-por-rol.md#102-hub).
>
> **Selector "Cambiar rol" (publicado el 2026-11-21):** arriba a la derecha, en lugar del chip del rol y de la barra oscura de vista previa. Ver [ocultamiento por rol §10.3](ocultamiento-por-rol.md#103-selector-cambiar-rol).
>
> **Aviso de datos de prueba y "Resumen del período" ocultos (2026-11-21, local):** `MOSTRAR_AVISO_PRUEBA = false` y `MOSTRAR_RESUMEN_PERIODO = false`. Los indicadores del resumen y la etiqueta "Cierre 2026-2" estaban escritos en el código (`RESUMEN`), no se calculaban. Ninguno de los dos hace consultas, así que ocultarlos no cambia la performance.
>
> **Rol GES retirado (2026-11-21):** el Hub ya no menciona al gestor (rol, saludo, chips y botón de vista previa). Plan de Estudios y Correlativas y el indicador "Sin encuesta" quedan solo para ADM.

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
│  [GES]  Sección Encuestas ·                            │
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

## Fecha simulada

Para pruebas, el sistema lee una fecha de referencia desde `mod_data` CMID 59405, parseando múltiples formatos. Si no encuentra, usa `new Date()`.
