# Especificación: Entrevistas y Tutorías

> Documento vivo: se actualiza a medida que se refinan los requerimientos.

- **Archivo:** `section/entrevistas/content.html`
- **Acceso:** tarjeta "Entrevistas y Tutorías" del [menú inicial](../../section/menu_inicial/content.html) (en local, `btn-entrevistas`). Con `#usuario=<id de Moodle>` abre la solicitud con ese estudiante elegido (para enlazarla desde el tablero o el detalle).
- **Roles:** ADM, TUT y PAR. GES no entra. La vista del estudiante (pedir entrevista, aceptar o contraofertar desde su lado) es otra sección y queda fuera del modelo reducido (ver Pendientes).
- **Requerimientos:** Req 5 (Dashboard Entrevistas: solicitudes, registro de realizadas e histórico), Req 11 (gestión de entrevistas) y RNF 1 (proactividad: programar antes de que el estudiante abandone).
- **Estado:** **en revisión**, desarrollado en local con datos de prueba. **No publicado en Moodle** y no se publica hasta terminar la revisión ([`README` de la sección](../../section/entrevistas/README.md)).

## Qué ve cada rol

| Rol | Entrevistas que ve | Puede gestionar |
|---|---|---|
| **ADM** | Todas, con filtro por acompañante | Todas |
| **TUT** | Las de los estudiantes que tiene asignados como tutor | Las suyas |
| **PAR** | Las de los estudiantes que acompaña como asesor par (Req 11: mismos permisos que el tutor) | Las suyas |

"Asignados" sale de la base **Acompañamientos** (11): cada entrada une un estudiante con su tutor o su asesor par. En la vista previa local, TUT es Valentino Hernández Pascual y PAR es Nahuel Spikerman. En Moodle será el usuario de la sesión (`M.cfg.userId`, a verificar en el campus) junto con la detección de roles por grupo.

"Ver detalle del estudiante" solo aparece para ADM y TUT, porque el [detalle](detalle-estudiante.md) no incluye a PAR.

## Pantalla

1. **Resumen** (cada tarjeta filtra la tabla): Por responder · Falta resultado · Programadas · Esperando · Realizadas.
2. **Pestañas Agenda / Historial**, búsqueda por estudiante, filtro de acompañante (solo ADM) y la acción principal **Solicitar entrevista**.
3. **Tabla:** estudiante (para ADM, con su acompañante; para asesor par, con la materia), fecha, origen, estado y la acción que corresponde. No se muestra el nivel de riesgo: el modelo reducido no lee Criticidad. En la agenda van arriba las que piden una respuesta o el resultado; en el historial, la más reciente primero.
4. **Modal de la entrevista:** estado, estudiante, acompañante, origen, motivo, la línea de tiempo de fechas propuestas (con las contraofertas y sus mensajes), el resultado y las acciones acordadas, y las acciones posibles.

## Estados

En la base se guarda el `estado` del modelo. Lo que se muestra se calcula (regla 5 del modelo simplificado: lo que se puede calcular no se guarda):

| Se muestra | Estado guardado | Condición | Acciones |
|---|---|---|---|
| **Por responder** | `solicitada` | La última fecha la propuso el estudiante | Aceptar fecha · Proponer otra fecha · Rechazar |
| **Esperando al estudiante** | `solicitada` | La última fecha la propuso el acompañante | Cambiar la fecha · Cancelar solicitud |
| **Programada** | `programada` | La fecha acordada todavía no pasó | Registrar resultado · Reprogramar · Cancelar |
| **Falta resultado** | `programada` | La fecha acordada ya pasó | Registrar resultado · No asistió |
| Realizada · No asistió · Rechazada · Cancelada | igual | — | Solo lectura (en las realizadas, el estado de cada acción acordada se puede actualizar) |

- **Aceptar** pasa a `programada` con la última fecha propuesta.
- **Proponer otra fecha / Reprogramar** agrega una propuesta del acompañante y vuelve a `solicitada`.
- **Registrar resultado:** fecha en que se hizo (no futura), resultado obligatorio y acciones acordadas (tipo de derivación, descripción y fecha de seguimiento). Pasa a `realizada`.
- **Rechazar, cancelar y no asistió** piden un comentario opcional, que se guarda en `resultado`.
- Después de una entrevista realizada, el modal invita a asignar el estado de criticidad en el detalle del estudiante (Req 10).
- En la vista previa local, "Esperando al estudiante" tiene un botón para simular que el estudiante acepta.

Colores (skill `diseno-ui`): naranja = te toca actuar; azul = programada; gris = esperando o cerrada sin entrevista; verde = realizada; rojo = no asistió. Siempre punto + texto.

## Datos: modelo reducido (2 bases)

La sección funciona con **solo dos bases** de la sección Zhakyz, sin depender de Estudiantes, Criticidad ni Alertas. Así se puede crear y publicar sin esperar la decisión del [ADR-005](../decisions/005-modelo-de-bases-moodle.md) sobre la carga de datos.

```
Acompañamientos (11) ──rid──< Entrevistas (12)
  dni, id_usuario_estudiante, nombre_estudiante        rid_acompanamiento, dni (copia)
  id_usuario_acompanante, nombre_acompanante           estado, fechas, resultado
  tipo (tutor | asesor_par), materia, fechas           propuestas_json, acciones_json
```

| Base | Definición | Uso en la página |
|---|---|---|
| **Acompañamientos** | [`BASE_ACOMPANAMIENTOS.json`](../../data/moodle/BASE_ACOMPANAMIENTOS.json) | Lectura. Decide qué entrevistas ve cada TUT y PAR, y da los nombres |
| **Entrevistas** | [`BASE_ENTREVISTAS.json`](../../data/moodle/BASE_ENTREVISTAS.json) | Lectura y edición (una entrada por entrevista; cambia de estado) |

### Diferencias con el modelo simplificado

| Modelo simplificado | Modelo reducido | Por qué |
|---|---|---|
| El nombre y la cuenta del estudiante salen de **Estudiantes** (por `dni`) | Acompañamientos guarda `id_usuario_estudiante` y `nombre_estudiante` | No depender de la base Estudiantes |
| El nombre del acompañante sale del perfil del campus | Acompañamientos guarda `nombre_acompanante` | Una base de Moodle no puede mostrar el nombre de otro usuario, y leer perfiles agrega consultas |
| Entrevistas tiene `rid_alerta` | Se quita | No hay base Alertas. `originada_por` es solo `tutor` o `estudiante` en los dos modelos |
| Contraofertas: no previstas | `propuestas_json` | Req 11 |
| El nivel de riesgo sale de **Criticidad** | No se muestra | No hay base Criticidad |

Las claves siguen siendo las del modelo (`dni` como clave del estudiante, `rid_acompanamiento`, `tipo_derivacion` y `fecha_compromiso` en las acciones). Cuando existan las demás bases, el paso al modelo completo es aditivo: se vuelve a sumar `rid_alerta` y se leen los nombres de Estudiantes y el riesgo de Criticidad, sin migrar entradas.

**Costo de las copias:** si cambia el nombre de alguien, hay que corregirlo en sus acompañamientos. Lo carga el ADM y son pocas entradas por persona.

Ids en [`moodle.config.json`](../../moodle.config.json): `bases.acompanamientos`, `bases.entrevistas` y `paginas.entrevistas` (todos en `null`). Los `field_<id>` de Entrevistas van en `CAMPOS_ENTREVISTAS`, al principio del script.

### Reglas que controla la página

- Un TUT ve los acompañamientos con `tipo = tutor` e `id_usuario_acompanante` igual a su cuenta; un PAR, los de `tipo = asesor_par`.
- Solo se piden entrevistas en acompañamientos **vigentes** (sin `fecha_hasta` o con una fecha que todavía no llegó). Las de un acompañamiento finalizado se siguen viendo.
- "Ver detalle del estudiante" necesita `id_usuario_estudiante`. Si falta, avisa.

## Datos de prueba (al 19/10/2026)

Los DNI son marcadores (`prueba-<id>`), no documentos reales.

| Estudiante | Acompañante | Entrevistas |
|---|---|---|
| Nicolás Zuviria | Valentino Hernández Pascual (tutor) | Realizada el 06/10, con dos acciones (coincide con el detalle) · Programada el 27/10 |
| Nahuel Spikerman | Luca Zuanetti (tutor) | Realizada el 10/10, tras una contraoferta (coincide con el detalle) · Cancelada en septiembre |
| Santiago Yanosky | Valentino Hernández Pascual (tutor) | No asistió el 13/10 · Por responder: el estudiante contraofertó el 23/10 |
| Gian Luca Distefano | Nahuel Spikerman (asesor par, Análisis Matemático I) | Falta resultado (16/10) · Por responder (la pidió el estudiante) |
| Luca Zuanetti | Valentino Hernández Pascual (tutor) | Esperando al estudiante (22/10) |
| Valentino Hernández Pascual | Luca Zuanetti (tutor, finalizado el 15/10) | Ninguna; no aparece al solicitar |

## Pendientes

- Crear las bases Acompañamientos y Entrevistas en la sección Zhakyz y cargar sus ids y los `field_<id>`.
- Validar con el equipo el modelo reducido y el campo `propuestas_json`.
- Usuario de la sesión y rol en Moodle (`M.cfg.userId` y grupos).
- **Lado del estudiante (Req 11):** con permisos de `mod_data`, un estudiante solo edita sus propias entradas y no puede leer una base del equipo. Para que pida, acepte o contraoferte hace falta una tercera base donde solo agregue entradas, con "Requiere aprobación", o un mensaje de Moodle. Queda fuera del modelo reducido.
- Enlazar "Solicitar entrevista" desde el tablero y el detalle (`#usuario=<id>`).
