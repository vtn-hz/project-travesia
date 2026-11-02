# Modelos

Qué calcula cada modelo, de dónde saca los datos y quién lo usa. Se leen en el orden en que fluyen los datos: **datos → trayectoria → criticidad**.

```
docs/models/
├── INDICADORES_NO_IMPLEMENTADOS.md ← indicadores que quedan fuera por las limitaciones de Moodle
├── datos/          ← cómo se guarda la información
│   └── MODELO_SIMPLIFICADO_MOODLE.md
├── trayectoria/    ← dónde está el alumno y qué lo traba (sale del plan y de las notas)
│   ├── MODELO_UBICACION_Y_ATRASO.md
│   └── MODELO_CRITICIDAD_POR_CORRELATIVAS.md
└── criticidad/     ← índice de 0 a 100 y semáforo (sale de las encuestas y de las notas de 1.er año)
    ├── MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md
    ├── MODELO_CRITICIDAD_ENCUESTAS.md
    └── MODELO_CRITICIDAD_NOTAS_PRIMERO.md
```

## Mapa

| Grupo | Modelo | Qué calcula | Datos de entrada | Quién lo usa | Estado |
|---|---|---|---|---|---|
| Datos | [Modelo simplificado para Moodle](datos/MODELO_SIMPLIFICADO_MOODLE.md) | Las 12 bases de Moodle, sus campos, relaciones y reglas | — | Todas las secciones que leen o escriben bases | Propuesta. Creadas: Materias, Encuestas, Respuestas y Criticidad |
| Trayectoria | [Ubicación y atraso](trayectoria/MODELO_UBICACION_Y_ATRASO.md) | Cuatrimestre equivalente, diferencia con el recorrido nominal, pendientes anteriores e inactividad | Materias aprobadas, ingreso y plan | Nada publicado todavía (el [tablero](../specs/tablero-estudiantes.md) no aplica los modelos) | Propuesta |
| Trayectoria | [Criticidad por correlativas](trayectoria/MODELO_CRITICIDAD_POR_CORRELATIVAS.md) | Qué materias pendientes traban más (puntaje S por materia) | Plan de estudios y correlativas | Nada publicado todavía | Propuesta |
| Criticidad | [Índice de Criticidad Estudiantil (ICE)](criticidad/MODELO_INDICE_CRITICIDAD_ESTUDIANTIL.md) | Fundamento y versión objetivo: 10 preguntas y 4 subíndices ponderados | Encuesta cuatrimestral y notas | Nadie: es la referencia del modelo de encuestas | Propuesta, sin calibrar |
| Criticidad | [Puntaje de criticidad de las encuestas](criticidad/MODELO_CRITICIDAD_ENCUESTAS.md) | **Versión vigente:** índice de 0 a 100 de cada envío | Respuestas de las Encuestas Inicial y Cuatrimestral, con los puntos de la base Encuestas | `CriticidadEncuesta` (Tools v4, base Criticidad, [ADR-007](../decisions/007-encuestas-respuestas-y-criticidad.md)) | **En uso en Moodle**, con valores provisorios |
| Criticidad | [Índice de las notas de 1.er año](criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md) | ICm por materia e ICG de 0 a 100 por estudiante | CargaParcialesPrimero y CargaMateriasPrimero | Dashboard de 1.er año (sin guardar) e `IndiceNotasPrimero` con `CriticidadNotas` (Tools v4, base Criticidad, fuente `notas_1ro`) | Provisorio: fórmula del equipo, sin validar |

## Solapamientos conocidos

Están para resolver; mientras tanto, cada modelo sigue con su definición.

- **ICE y encuestas** calculan lo mismo con dos fórmulas distintas. Manda el de encuestas, que es el que corre.
- **Avance curricular:** Ubicación lo mide en materias (cuatrimestre equivalente), encuestas e ICE en créditos.
- **Inactividad:** en Ubicación son los cierres seguidos sin actividad; en encuestas, no haber cursado materias el cuatrimestre anterior.
- **Correlativas** todavía usa C, el "cuatrimestre actual"; Ubicación propone reemplazarlo por el cuatrimestre equivalente. También difieren en dónde ubican las materias anuales (inicio o fin).
- **Semáforo:** 40/70 en ICE, encuestas y la base Criticidad; 40/65 en el Dashboard de 1.er año; 40/80 en el [detalle del estudiante](../specs/detalle-estudiante.md).
- **1.er año:** el Dashboard (ICm/ICG, [modelo](criticidad/MODELO_CRITICIDAD_NOTAS_PRIMERO.md)), el Listado de 1.er año (alertas por umbral) y el requerimiento (% de aprobación) usan tres criterios distintos.
