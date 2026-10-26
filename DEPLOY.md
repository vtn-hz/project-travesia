# Deploy

Qué está publicado en Moodle, qué está solo en local y qué está en revisión. Curso 1732 → sección **Zhakyz** (id 15647).

> **Última actualización:** 2026-10-26 (en la Página Tools se desactivó la criticidad por avance curricular, en análisis: `creditos_aprobados` se copia con criticidad `null`). Antes, 2026-10-25 (se borró el ítem 8273 de la Cuatrimestral; el cuadro de créditos guarda su selección en las respuestas ocultas 8774 y 8775 y la recupera; antes, la Página Tools suma la herramienta LeerBase, todavía sin uso; la copia de respuestas se probó con un envío real de la Cuatrimestral; antes, se borraron de Moodle y del repo el banco de preguntas y el armado de encuestas: la Página Preguntas, la Encuesta 1 y la base Preguntas, porque las preguntas son fijas en las Encuestas de Moodle; y las Encuestas Inicial y Cuatrimestral pasaron a la subsección Encuestas y Preguntas; antes, publicados la subsección Utils con las Páginas Widgets, con su índice, y Tools, los widgets de las Encuestas Inicial y Cuatrimestral, la base Respuestas configurada con sus plantillas y los 5 ítems de copia de respuestas; falta probar un envío). Antes, 2026-10-24 (revisión de Moodle: el equipo borró Carga_Materias_Plan y cambió la Encuesta Inicial, ya traída al repo; se importó la Encuesta Cuatrimestral; copia de respuestas en local con el ADR-006 y se borró la página propia de encuestas). Cada vez que se publica, se crea algo en Moodle o cambia el estado de una sección, se actualiza este archivo junto con la tabla 1 a 1 de [`RULES.md`](RULES.md).

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
├── Plan de Estudios (subsección 15721)
│   └── Plan de Estudios: página (cmid 59718)       Publicado
├── Encuestas y Preguntas (subsección 15705)
│   ├── Encuesta Inicial: encuesta (cmid 59710)      Importado; ítem 8254 con el Cuadro de créditos (Utils) respuesta oculta 8774 (selección del cuadro) y copia de respuestas al final de cada página (8772, 8771, 8770, 8769) Publicados
│   └── Encuesta Cuatrimestral: encuesta (cmid 59712) Importado; ítems 8261 (Cuadro de créditos → respuesta oculta 8775), 8270 (Selector de materias → 8768) y 8773 (copia de respuestas) Publicados
├── Database (subsección 15700)
│   ├── Materias: base de datos (cmid 59717, d=152)  Publicado (95 materias)
│   └── Respuestas: base de datos (cmid 59940, d=166) Publicado (configurada; la escriben los ítems de copia)
├── Utils (subsección 15749, cm 59931)
│   ├── Widgets: página (cmid 59932)               Publicado
│   └── Tools: página (cmid 59941)                 Publicado
├── Pruebas (subsección 15701)                       Solo en Moodle
│   └── BD_Prueba, Prueba_Cuestionario, Prueba_Encuesta, Prueba2, database testing
└── asdsad: encuesta (cmid 59541), fuera de las subsecciones   Solo en Moodle (parece una prueba)
```

## Secciones

| Sección | Archivo | Estado | En Moodle | Qué falta |
|---|---|---|---|---|
| Resumen de Zhakyz | [`section/resumen_zhakyz`](section/resumen_zhakyz/content.html) | **Publicado** | Resumen de la sección (2026-10-17) | Republicar: el repo agregó la marca `// @config` (mismos valores, sin cambio de comportamiento) |
| Menú inicial (Hub) | [`section/menu_inicial`](section/menu_inicial/content.html) | **Publicado** | Área de texto y medios "Hub" (cmid 59511) | Muestra datos de prueba y la vista ADM a cualquiera que entre, incluidos estudiantes, hasta detectar los roles. Las tarjetas sin sección publicada dicen "todavía no disponible". El bloque "Estado del sistema" está oculto (`MOSTRAR_ESTADO_SISTEMA = false`). La tarjeta Plan de Estudios enlaza a su página (cmid 59718). Última publicación: 2026-10-19. Republicar: el 2026-10-25 se sacaron del repo las tarjetas Preguntas y Encuestas, que estaban ocultas; la versión de Moodle todavía las tiene en el código (ocultas, la de Preguntas apunta a la Página borrada) |
| Plan de Estudios | [`section/plan_estudios`](section/plan_estudios/content.html) | **Publicado** | Página "Plan de Estudios" (cmid 59718), subsección Plan de Estudios, conectada a la base Materias (d=152). La tarjeta del Hub enlaza a esta página | Ninguno. Cargados los dos planes (95 materias desde `PLANES_CARGA.csv`). Última publicación: 2026-10-19 |
| Encuesta Inicial · cuadro de créditos | [`section/encuesta_inicial`](section/encuesta_inicial/content.html) | **Publicado** | Ítem "Área de texto y medios" (id 8254) de la Encuesta "Encuesta Inicial" (cmid 59710), exportada en [`data/moodle/encuestas/ENCUESTA_INICIAL.xml`](data/moodle/encuestas/ENCUESTA_INICIAL.xml) | Desde 2026-10-25 es una copia del cargador de Utils (`CuadroCreditos` → pregunta 8253), que guarda su selección en la respuesta larga oculta 8774 (`seleccion_creditos`) y la recupera al volver a la página y reemplaza al cuadro propio, con la casilla de la PPS. El máximo de `creditos_aprobados` sigue en 223 (lo puso el equipo): un estudiante con más créditos (PPS, Plan 2003) no puede enviar; subirlo a 245 requiere confirmación. Revisar que el estudiante pueda ver la base Materias y la Página Widgets. No editar el ítem desde Moodle: el editor no muestra el script y al guardar lo borra |
| Encuesta Cuatrimestral · widgets | [`section/encuesta_cuatrimestral`](section/encuesta_cuatrimestral) | **Publicado** | Ítems 8261 ([`creditos`](section/encuesta_cuatrimestral/creditos/content.html): `CuadroCreditos` → pregunta 8262) y 8270 ([`materias`](section/encuesta_cuatrimestral/materias/content.html): `SelectorMaterias` → respuesta larga nueva 8768 `materias_cuatrimestre`) de la Encuesta "Encuesta Cuatrimestral" (cmid 59712), exportada en [`data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml`](data/moodle/encuestas/ENCUESTA_CUATRIMESTRAL.xml). Publicado el 2026-10-25 | El cuadro guarda su selección en la respuesta larga oculta 8775 (`seleccion_creditos`, creada el 2026-10-25) y la recupera al volver a la página. El ítem 8273 (respuesta corta vieja) se borró el 2026-10-25. Máximo de 8262: 235,5 (el Plan 2003 llega a 245). No editar los ítems desde Moodle |
| Listado de criticidad de 1.er año | [`section/listado_criticidad_primero`](section/listado_criticidad_primero/content.html) | **Importado** | Página "Listado_Criticidad_Primero" (cmid 59523), subsección Hub | No sigue RULES.md (Bootstrap, emojis, cmids fijos sin `// @config`). Se superpone con el Tablero de Criticidad: decidir si se unifica |
| Copia de respuestas de las encuestas | [`section/copia_encuestas`](section/copia_encuestas/content.html) | **Publicado** | 5 ítems "Área de texto y medios", uno al final de cada página: Encuesta Inicial 8772, 8771, 8770 y 8769 (este depende de trabaja = Si) y Encuesta Cuatrimestral 8773. Publicado el 2026-10-25 | Los 5 ítems son copias del cargador de tools: el código es la herramienta `CopiaRespuestas` de la Página Tools ([spec](docs/specs/copia-encuestas.md), [ADR-006](docs/decisions/006-versionado-de-encuestas.md)). Un cambio en la copia se publica solo en la Página Tools. Verificado en la vista previa: carga la herramienta y la estructura de páginas coincide. **Probado con un envío real de la Cuatrimestral** (2026-10-25, 2 versiones en la base: plan, materias aprobadas, créditos, materias cursadas con primera vez y dificultad, y DNI). Falta probar la Inicial. Sin una copia de la Inicial en la base, la Cuatrimestral no puntúa el avance (le falta el ingreso). No editar los ítems desde Moodle |
| Utils · Widgets (biblioteca) | [`section/utils/widgets`](section/utils/widgets/content.html) | **Publicado** | Subsección "Utils" (sección 15749, cm 59931), justo antes de Pruebas → Página "Widgets" (cmid 59932). Publicado el 2026-10-25 | Biblioteca de widgets compartidos como script muerto, con el índice de widgets (el del cargador en local) y cada widget con `#widget=<nombre>` en la dirección (índice publicado el 2026-10-25). La guía completa está en [`section/utils/README.md`](section/utils/README.md). Dos widgets: Cuadro de créditos, con las casillas de PPS (12,5 CG en 2024, sin créditos en 2003) y optativas (2003), y Selector de materias (materias cursadas el cuatrimestre anterior, con primera vez y dificultad, para el ítem 8270; guarda un JSON en la respuesta larga 8768). El cuadro guarda su selección en una respuesta oculta (`campoSeleccion`) y la recupera al volver a la página (2026-10-25). Falta el ADR (cambia la regla de archivo autocontenido). La Página es visible en el curso: los estudiantes la necesitan para que el cargador la lea |
| Utils · Tools (biblioteca) | [`section/utils/tools`](section/utils/tools/content.html) | **Publicado** | Subsección "Utils", después de Widgets → Página "Tools" (cmid 59941). Publicado el 2026-10-25 | Biblioteca de herramientas sin interfaz como script muerto, con su índice. Desde el 2026-10-26, `CopiaRespuestas` no puntúa el avance curricular (en análisis; el máximo queda en 30 en la Inicial y 70 en la Cuatrimestral). Herramientas: `CopiaRespuestas` y `LeerBase` (lee todas las páginas de una base; publicada el 2026-10-25, **ninguna vista la usa todavía**). La biblioteca avisa con el evento `zk-tools`. Visible en el curso por la misma razón que Widgets. Sin `\[`, `\(` ni `$$` en el código: el filtro de fórmulas de Moodle los toma como TeX y escapa toda la página |
| Utils · Cargador de tools | [`section/utils/cargador_tools`](section/utils/cargador_tools/content.html) | **Plantilla** | — (no se publica solo) | Lee la Página Tools y arranca la herramienta de `TOOL`. Su copia publicada es la copia de respuestas (5 ítems de las encuestas). En la encuesta que responde el estudiante no muestra errores |
| Utils · Cargador | [`section/utils/cargador`](section/utils/cargador/content.html) | **Plantilla** | — (no se publica solo: se copia en cada vista) | Lee la Página Widgets y crea el widget de su configuración (`WIDGET` y `CAMPO`). Sus copias publicadas: Encuesta Inicial 8254 y Encuesta Cuatrimestral 8261 y 8270. Si cambia, hay que actualizar las copias y volver a publicarlas |
| Tablero de Criticidad | [`section/tablero_estudiantes`](section/tablero_estudiantes/content.html) | **Local** | — | Crear las bases (Estudiantes, Situación académica, Criticidad); detectar roles. Depende del ADR-005 |
| Detalle del estudiante | [`section/detalle_estudiante`](section/detalle_estudiante/content.html) | **En revisión** | — | Cargar en el navegador los datos de todos los estudiantes puede ser muy pesado ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)). El índice de criticidad de 0 a 100 es provisorio |
| Entrevistas y Tutorías | [`section/entrevistas`](section/entrevistas/content.html) | **En revisión** | — (no publicar: ver [`README`](section/entrevistas/README.md)) | Modelo reducido: solo necesita las bases Acompañamientos y Entrevistas ([spec](docs/specs/entrevistas.md#datos-modelo-reducido-2-bases)), así que no depende del ADR-005. Falta crearlas y detectar roles y usuario de la sesión |
| Vista del estudiante (ejemplo) | [`section/section_sample`](section/section_sample/content.html) | **Local** | — | Ejemplo anterior al sistema de diseño (todavía con emojis). El acceso desde el menú está oculto (`MOSTRAR_VISTA_ALUMNO = false`) |

## Bases de datos de Moodle

Los ids de cada base (cmid y d) están en [`moodle.config.json`](moodle.config.json) → `bases`. El modelo completo está en [`MODELO_SIMPLIFICADO_MOODLE.md`](docs/models/MODELO_SIMPLIFICADO_MOODLE.md): 12 bases, que salen del [DER v2](docs/models/MODELO_DE_DATOS_V2.md).

| # | Base | Definición | Estado |
|---|---|---|---|
| — | Carga_Parciales_Primero | [`data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json`](data/moodle/BASE_CARGA_PARCIALES_PRIMERO.json) | **Importado** (cmid 59521, d=117). Una entrada por evaluación; en el modelo equivale a Situación académica |
| — | Carga_Materias_Primero | [`data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json`](data/moodle/BASE_CARGA_MATERIAS_PRIMERO.json) | **Importado** (cmid 59522, d=118). Materia, `esCritica` y `Umbral`; en el modelo equivale a Materias |
| 1 | Materias | [`data/moodle/BASE_MATERIAS.json`](data/moodle/BASE_MATERIAS.json) | **Publicado** (cmid 59717, d=152), con los planes 2024 y 2003 (95 materias) y plantillas con el estilo de Carga_Parciales_Primero. Reemplaza a Carga_Materias_Primero |
| 8 | Respuestas | [`data/moodle/BASE_RESPUESTAS.json`](data/moodle/BASE_RESPUESTAS.json) | **Publicado** (cmid 59940, d=166), creada el 2026-10-25 con los 8 campos y las plantillas de lista e individual de [`plantillas/respuestas`](data/moodle/plantillas/respuestas/) (la de añadir entrada queda la de Moodle). Configurada el 2026-10-25: requiere aprobación, sin edición de las aprobadas, sin comentarios y sin máximo. Plantillas actualizadas el mismo día: la lista muestra el JSON en una línea cortada con "…" (al hacer clic se abre formateado, con la plantilla Javascript personalizado) y no tiene la columna de estado de aprobación. Nadie tiene que aprobar entradas: una entrada aprobada la ven todos los estudiantes. La escriben los ítems de copia de las encuestas ([ADR-006](docs/decisions/006-versionado-de-encuestas.md)). Queda visible en Zhakyz: el campus no permite "disponible pero no mostrada"; con la aprobación, cada estudiante ve solo sus entradas |
| 2–5, 9–10 | Períodos, Indicadores, Estudiantes, Situación académica, Criticidad, Alertas | Solo en el modelo | **En revisión** ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)) |
| 11 | Acompañamientos | [`data/moodle/BASE_ACOMPANAMIENTOS.json`](data/moodle/BASE_ACOMPANAMIENTOS.json) | **Propuesta** (modelo reducido de entrevistas: copia nombres y cuenta del estudiante) |
| 12 | Entrevistas | [`data/moodle/BASE_ENTREVISTAS.json`](data/moodle/BASE_ENTREVISTAS.json) | **Propuesta**. Suma `propuestas_json` (contraofertas del Req 11) y quita `rid_alerta` |

## Decisiones abiertas que bloquean publicaciones

1. **Carga de datos en el navegador** ([ADR-005](docs/decisions/005-modelo-de-bases-moodle.md)): bloquea el tablero, el detalle y la creación de las bases 1 a 5, 9 y 10. Acompañamientos y Entrevistas no dependen de esta decisión (modelo reducido).
2. **Detección de roles en Moodle** (grupos ADM, GES, TUT, PAR): mientras no esté, el Hub y el tablero muestran la vista de administrador.
3. **Origen del DNI** del estudiante en Moodle. Propuesta del ADR-006: el nombre de usuario del campus (es el DNI), leído de `/login/change_password.php`; verificado con una cuenta del equipo, falta una de estudiante. Lo usa la copia de respuestas.
4. **Índice de criticidad de 0 a 100** y escala de las notas: afecta al detalle y a la base Criticidad.
5. **Modelo reducido de entrevistas** (solo Acompañamientos y Entrevistas, con copias de nombres y `propuestas_json` para las contraofertas) y **usuario de la sesión** en las páginas (`M.cfg.userId`, a verificar en el campus): afectan a Entrevistas y Tutorías.

## Cómo se publica

Siempre con la skill [`publicar-seccion`](.skills/publicar-seccion/SKILL.md):
1. simular;
2. pedir confirmación explícita al equipo;
3. publicar con `--confirmar`;
4. actualizar este archivo y la tabla de [`RULES.md`](RULES.md).
