# ADR-008: ¿Reemplazar la Encuesta Inicial por la Información personal?

- **Estado:** pendiente (pregunta abierta)
- **Fecha:** 2026-11-03
- **Consulta:** "Preguntas 03/11", primera pregunta, en el documento de requerimientos del equipo
- **Mientras tanto:** quedan **las dos encuestas** como están. Mi Trayectoria muestra la Inicial y la Cuatrimestral desde 2.º año ([spec](../specs/vista-estudiante.md)).

## Pregunta

¿Es viable reemplazar la Encuesta Inicial por la carga de los datos personales del alumno, y habilitar la Encuesta Cuatrimestral para todos los años?

## Contexto

Con la Página Información personal (SCRUM-24, base Estudiantes), la Encuesta Inicial (v2) quedó casi sin preguntas propias:

| Pág. | Ítem | Variable | Dónde más está | Situación |
|---|---|---|---|---|
| 1 | 8253 + 8774 | `creditos_aprobados`, `seleccion_creditos` | Cuatrimestral (8262 + 8775), en cada período, con el mismo cuadro | Repetida |
| 2 | 8257 | `año_cohorte` | Estudiantes → `anio_ingreso` | Repetida |
| 2 | 8258 | `cuatri_cohorte` | Estudiantes → `cuatrimestre_ingreso` | Repetida |
| 3 | 8259 | `trabaja` | Cuatrimestral (8265), en cada período | Repetida |
| 4 | 8260 | `inicio_laboral` | Cuatrimestral (8266), con 7 opciones | Repetida e incompleta: la Inicial solo ofrece "antes de ingresar" y "en 1.er año", pero se habilita desde 2.º año |

**Criticidad de la Inicial.** Con el avance curricular desactivado, solo puntúa lo laboral: `puntaje_maximo` = 30 (trabaja 10 + inicio laboral 20). El índice solo puede valer **0** (no trabaja), **33** (trabaja y no responde el inicio) o **100** (trabaja y lo responde). En la Cuatrimestral, el mismo dato pesa unos 21 puntos de 100 (15 de 70). Si se promedian las dos encuestas, cualquier estudiante que trabaja queda con un piso de 50.

## Opciones

| Opción | Qué cambia | A favor | En contra |
|---|---|---|---|
| **A. Las dos encuestas, como hoy** | Nada | Sin cambios en Moodle | Se pregunta dos veces lo mismo; la Inicial distorsiona la criticidad de quien trabaja |
| **B. Información personal en lugar de la Inicial, Cuatrimestral para todos los años** | Se retira la Inicial y la Cuatrimestral se habilita también en 1.er año | Una sola encuesta; el ingreso sale de Estudiantes | En 1.er año, ver "Si se elige B" |
| **C. Información personal en lugar de la Inicial, Cuatrimestral desde 2.º año** | Se retira la Inicial; la Cuatrimestral sigue como hoy | Una sola encuesta, sin tocar 1.er año (criticidad solo por notas) | En 1.er año no se pregunta la situación laboral |

### Si se elige B: qué hay que resolver en 1.er año

- **Ingresante en su primer cuatrimestre:** no cursó nada "el cuatrimestre anterior", marca "No cursé" y suma los 35 puntos de inactividad (el peor caso del bloque).
- **Proyecto Final:** no aplica. Si el estudiante elige "No iniciado" en lugar de "No aplica", suma 10.
- **Criticidad de 1.er año:** hoy sale solo de las notas de parciales. Hay que definir si la Cuatrimestral se suma a ese índice o si en 1.er año solo junta datos.

## Qué habría que cambiar si se retira la Inicial (B o C)

- **Mi Trayectoria:** sacar la tarjeta de la Inicial y su acción principal.
- **Moodle:** esconder la Encuesta Inicial (cmid 59710). Es un cambio en el campus y requiere confirmación.
- **Avance curricular** (cuando se reactive): la cohorte sale de Estudiantes y no de la Inicial (`tools/content.html`, bloque comentado).
- **Criticidad de 2.º año en adelante:** sale solo de la Cuatrimestral. Para el tablero, definir si es la última o un promedio de las últimas.
- **Historial:** las respuestas viejas de la Inicial se conservan en Respuestas, y sus entradas en Criticidad también.
- **Documentos:** [spec de la Encuesta Inicial](../specs/encuesta-inicial.md), [modelo de criticidad de las encuestas](../models/criticidad/MODELO_CRITICIDAD_ENCUESTAS.md), [copia de encuestas](../specs/copia-encuestas.md), [vista del estudiante](../specs/vista-estudiante.md) y [`DEPLOY.md`](../../DEPLOY.md).

## Decisión

Pendiente de la respuesta a la consulta del 03/11.
