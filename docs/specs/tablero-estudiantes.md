# Especificación: Tablero de Criticidad

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/tablero_estudiantes/content.html`
- **Acceso:** tarjeta "🚦 Tablero de Criticidad" del [menú inicial](../../section/menu_inicial/content.html)
- **Roles:** ADM, GES y TUT. Solo **TUT y ADM** pueden asignar estados.
- **Requerimientos:** Req 2 (alerta por omisión), Req 4 (semáforos), Req 5 (dashboard docente) y Req 10 (gestión de estados)
- **Estado:** desarrollado en local con datos de prueba. **No publicado en Moodle.**

## Dos estados por estudiante

| Estado | Quién lo define | Cómo |
|---|---|---|
| 🤖 **Estado calculado** | El sistema | Se genera solo, al cierre evaluado, con los criterios configurados |
| ✋ **Estado asignado** | Un tutor o un administrador (Req 10) | Se elige a mano, con un motivo obligatorio (por ejemplo, el resultado de una entrevista) |

- **Estado vigente:** si hay estado asignado, manda el asignado; si no, manda el calculado. La tabla se ordena por el estado vigente y el calculado se muestra atenuado cuando hay uno asignado.
- El estado asignado se puede **quitar** ("Quitar el estado asignado"), y entonces vuelve a mandar el calculado.
- Cada asignación queda en un **historial** con el estado, el motivo, el autor y la fecha.

Elegimos los nombres **calculado / asignado** porque cada uno dice de dónde sale el estado. "Automático / manual" describe el mecanismo, pero no quién toma la decisión.

## Criterios del estado calculado

> **Los criterios de los modelos (`MODELO_UBICACION_Y_ATRASO` y `MODELO_CRITICIDAD_POR_CORRELATIVAS`) todavía no se aplican.** Por ahora solo se usan los criterios que están en los requerimientos.

| Etapa | Criterio | Estado |
|---|---|---|
| 1.er año | Sin notas de parciales cargadas | ⚪ Sin calcular |
| 1.er año | Aprobó menos del 20 % de las materias esperadas (Req 4) | 🔴 |
| 1.er año | Entre el 20 % y el 60 % | 🟡 |
| 1.er año | Más del 60 % | 🟢 |
| 2.º año en adelante | No respondió la encuesta del período (Req 2) | 🟡 |
| 2.º año en adelante | Respondió la encuesta | ⚪ Sin calcular: criterio pendiente de definir |

Las materias esperadas de 1.er año son 3 al terminar el 1.er cuatrimestre y 7 al terminar el 2.º (`ESPERADAS_PRIMER_ANIO`). Los umbrales están en `UMBRALES`, al principio del script.

## Qué muestra

1. **Resumen por estado vigente:** total, 🔴, 🟡, 🟢, ⚪ y ✋ (con estado asignado). Cada tarjeta filtra la tabla.
2. **Filtros:** nombre, estado vigente, etapa y cohorte, y **exportar a CSV** (con los dos estados y sus motivos).
3. **Tabla:** estudiante, cohorte, estado calculado y estado asignado (con su autor).
4. **Detalle:** las dos tarjetas de estado (la vigente marcada), el historial y el formulario **Asignar estado** (solo TUT y ADM).

## Datos de prueba

Son los **6 integrantes de Zhakyz** (ver [EQUIPO_ZHAKYZ](../context/EQUIPO_ZHAKYZ.md)), con datos académicos **ficticios**, identificados por su id de usuario de Moodle:

| Integrante | Etapa | Calculado | Asignado |
|---|---|---|---|
| Luca Zuanetti | 1.er año (6 de 7) | 🟢 | — |
| Gian Luca Distefano | 1.er año (1 de 3) | 🟡 | — |
| Santiago Nicolás Yanosky | 1.er año (1 de 7) | 🔴 | — |
| Valentino Hernández Pascual | 1.er año (sin notas) | ⚪ | — |
| Nicolás Gabriel Zuviria | 2.º año+ (sin encuesta 2026-2) | 🟡 | 🔴 por Valentino Hernández Pascual |
| Nahuel Spikerman | 2.º año+ (respondió la encuesta) | ⚪ | 🟢 por Luca Zuanetti |

## Bases a crear en Zhakyz (con confirmación, según RULES)

Mientras `CMID_ESTUDIANTES` y `CMID_ASIGNACIONES` valgan `null`, o cuando el archivo se abre en local, se usan los datos de prueba y se muestra un aviso.

**Estudiantes.** Una entrada por estudiante. La plantilla de lista expone cada campo como `data-*`:

```html
<div class="zk-registro" data-usuario="[[usuario]]" data-nombre="[[nombre]]" data-cohorte="[[cohorte]]"
     data-etapa="[[etapa]]" data-cuatrimestre-cursado="[[cuatrimestre_cursado]]"
     data-aprobadas-primer-anio="[[aprobadas_primer_anio]]" data-notas-cargadas="[[notas_cargadas]]"
     data-encuesta="[[encuesta]]"></div>
```

**Asignaciones.** Campos `usuario`, `nivel` (`rojo`, `amarillo`, `verde` o `auto` para quitar) y `motivo`. La plantilla es la misma, con `data-autor="##user##"` y `data-fecha="##timeadded##"`. Sus `field_<id>` se cargan en `CAMPOS_ASIGNACIONES`.

## Pendientes

- Definir el criterio calculado para 2.º año en adelante. Pueden servir los modelos y el IRD de las encuestas.
- Aplicar los modelos cuando se decida.
- Crear las bases en Zhakyz (requiere confirmación) y cargar sus CMID.
- Detectar el rol en Moodle (por grupos).
