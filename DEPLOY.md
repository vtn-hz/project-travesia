# Deploy

Qué está publicado en Moodle, qué está solo en local y qué está en revisión. Curso 1732 → sección **Zhakyz** (id 15647).

> **Última actualización:** 2026-10-19 (Hub republicado). Cada vez que se publica, se crea algo en Moodle o cambia el estado de una sección, se actualiza este archivo junto con la tabla 1 a 1 de [`RULES.md`](RULES.md).

## Estados

| Estado | Significado |
|---|---|
| **Publicado** | Está en Moodle y coincide con el repo |
| **Local** | Desarrollado y probado en local con datos de prueba. Sin publicar |
| **En revisión** | Desarrollado, pero con una decisión abierta que puede cambiarlo antes de publicar |
| **Propuesta** | Definido en el repo, todavía sin desarrollar ni crear en Moodle |
| **Solo en Moodle** | Lo creó el equipo directamente en Moodle y no tiene archivo en el repo |
| **Importado** | Lo creó el equipo directamente en Moodle y se trajo al repo sin cambios |

## Cómo está Zhakyz hoy en Moodle

```
Zhakyz (sección 15647)
├── Resumen: logo, nombre y lema                    Publicado
├── Hub (subsección 15706)
│   ├── Hub: menú inicial (cmid 59511)               Publicado
│   ├── Carga_Parciales_Primero: base (cmid 59521, d=117)   Importado
│   ├── Carga_Materias_Primero: base (cmid 59522, d=118)    Importado
│   └── Listado_Criticidad_Primero: página (cmid 59523)     Importado
├── Encuestas y Preguntas (subsección 15705)
│   ├── Preguntas: página (cmid 59506)               Publicado
│   └── Encuesta 1: encuesta (cmid 59508)            Solo en Moodle
├── Database (subsección 15700)
│   └── Preguntas: base de datos (cmid 59498, d=114) Publicado
├── Pruebas (subsección 15701)                       Solo en Moodle
│   └── BD_Prueba, Prueba_Cuestionario, Prueba_Encuesta, Prueba2, database testing
└── asdsad: encuesta (cmid 59541), fuera de las subsecciones   Solo en Moodle (parece una prueba)
```

## Secciones

| Sección | Archivo | Estado | En Moodle | Qué falta |
|---|---|---|---|---|
| Resumen de Zhakyz | [`section/resumen_zhakyz`](section/resumen_zhakyz/content.html) | **Publicado** | Resumen de la sección (2026-10-17) | Republicar: el repo agregó la marca `// @config` (mismos valores, sin cambio de comportamiento) |
| Menú inicial (Hub) | [`section/menu_inicial`](section/menu_inicial/content.html) | **Publicado** | Área de texto y medios "Hub" (cmid 59511) | Muestra datos de prueba y la vista ADM a cualquiera que entre, incluidos estudiantes, hasta detectar los roles. Las tarjetas sin sección publicada dicen "todavía no disponible". El bloque "Estado del sistema" está oculto (`MOSTRAR_ESTADO_SISTEMA = false`), y las tarjetas Preguntas y Encuestas también (`MOSTRAR_ENCUESTAS = false`), porque por ahora las preguntas son fijas. Última publicación: 2026-10-19 |
| Preguntas | [`section/encuestas_preguntas/preguntas`](section/encuestas_preguntas/preguntas/content.html) | **Publicado** | Página "Preguntas" (cmid 59506), conectada a la base 59498 | Republicar: el repo agregó la marca `// @config` (mismos valores) |
| Encuestas (armado) | [`section/encuestas_preguntas/encuestas`](section/encuestas_preguntas/encuestas/content.html) | **Local** | — | Crear la base Armado de encuestas y publicar |
| Listado de criticidad de 1.er año | [`section/listado_criticidad_primero`](section/listado_criticidad_primero/content.html) | **Importado** | Página "Listado_Criticidad_Primero" (cmid 59523), subsección Hub | No sigue RULES.md (Bootstrap, emojis, cmids fijos sin `// @config`). Se superpone con el Tablero de Criticidad: decidir si se unifica |
| Mis encuestas (responder) | [`section/encuestas_preguntas/responder`](section/encuestas_preguntas/responder/content.html) | **Local** | — | Crear las bases Armado de encuestas y Respuestas; definir el origen del DNI |
| Tablero de Criticidad | [`section/tablero_estudiantes`](section/tablero_estudiantes/content.html) | **Local** | — | Crear las bases (Estudiantes, Situación académica, Criticidad); detectar roles. Depende del ADR-005 |
| Detalle del estudiante | [`section/detalle_estudiante`](section/detalle_estudiante/content.html) | **En revisión** | — | Cargar en el navegador los datos de todos los estudiantes puede ser muy pesado ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)). El índice de criticidad de 0 a 100 es provisorio |
| Vista del estudiante (ejemplo) | [`section/section_sample`](section/section_sample/content.html) | **Local** | — | Ejemplo anterior al sistema de diseño (todavía con emojis). El acceso desde el menú está oculto (`MOSTRAR_VISTA_ALUMNO = false`) |

## Bases de datos de Moodle

Los ids de cada base (cmid y d) están en [`moodle.config.json`](moodle.config.json) → `bases`. El modelo completo está en [`MODELO_SIMPLIFICADO_MOODLE.md`](docs/models/MODELO_SIMPLIFICADO_MOODLE.md): 12 bases, que salen del [DER v2](docs/models/MODELO_DE_DATOS_V2.md).

| # | Base | Definición | Estado |
|---|---|---|---|
| 6 | Preguntas | [`data/moodle/BASE_ENCUESTAS.json`](data/moodle/BASE_ENCUESTAS.json) | **Publicado** (cmid 59498, d=114). Al modelo le faltan los campos `variable`, `por_materia` y el tipo `likert` |
| — | Carga_Parciales_Primero | [`data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json`](data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json) | **Importado** (cmid 59521, d=117). Una entrada por evaluación; en el modelo equivale a Situación académica |
| — | Carga_Materias_Primero | [`data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json`](data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json) | **Importado** (cmid 59522, d=118). Materia, `esCritica` y `Umbral`; en el modelo equivale a Materias |
| 7 | Armado de encuestas | [`data/moodle/BASE_ENCUESTAS_ARMADO.json`](data/moodle/BASE_ENCUESTAS_ARMADO.json) | **Propuesta** |
| 8 | Respuestas | [`data/moodle/BASE_RESPUESTAS.json`](data/moodle/BASE_RESPUESTAS.json) | **Propuesta** |
| 1–5, 9–12 | Plan de estudios, Períodos, Indicadores, Estudiantes, Situación académica, Criticidad, Alertas, Acompañamientos, Entrevistas | Solo en el modelo | **En revisión** ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)) |

## Decisiones abiertas que bloquean publicaciones

1. **Carga de datos en el navegador** ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)): bloquea el tablero, el detalle y la creación de las bases 1 a 5 y 9 a 12.
2. **Detección de roles en Moodle** (grupos ADM, GES, TUT, PAR): mientras no esté, el Hub y el tablero muestran la vista de administrador.
3. **Origen del DNI** del estudiante en Moodle: bloquea Mis encuestas.
4. **Banco de preguntas o preguntas por encuesta** (diferencia con el DER): puede cambiar Preguntas y Encuestas.
5. **Índice de criticidad de 0 a 100** y escala de las notas: afecta al detalle y a la base Criticidad.

## Cómo se publica

Siempre con la skill [`publicar-seccion`](.skills/publicar-seccion/SKILL.md):
1. simular;
2. pedir confirmación explícita al equipo;
3. publicar con `--confirmar`;
4. actualizar este archivo y la tabla de [`RULES.md`](RULES.md).
