# Índice de Criticidad Estudiantil (ICE)

- **Estado:** propuesta. Los pesos todavía no están calibrados.
- **Qué calcula:** la criticidad de cada estudiante desde 2.º año en una escala de 0 a 100, combinando las notas registradas por la facultad con una encuesta cuatrimestral que responde el propio estudiante.
- **Relación con los otros modelos:** [ubicación y atraso](MODELO_UBICACION_Y_ATRASO.md) y [criticidad por correlativas](MODELO_CRITICIDAD_POR_CORRELATIVAS.md) pueden aportar el término académico; ver [Pendientes](#pendientes).

Este modelo responde a lo que falta definir en el documento de trabajo sobre trayectorias en Ingeniería. Tiene tres partes:
1. **10 preguntas clave** para la encuesta cuatrimestral que responde el estudiante desde 2.º año;
2. el **indicador formal** al que apunta cada pregunta;
3. una **fórmula estandarizada** para calcular el ICE.

---

## 1. Diez preguntas para la encuesta cuatrimestral y los indicadores a los que apuntan

Las preguntas se basan en las dimensiones que identifica la literatura del área: crítica, académica, laboral, vocacional y contextual. La columna **Variable** es el nombre con el que cada respuesta entra en la fórmula. Sirve tanto si las preguntas se cargan en la base Preguntas como si quedan fijas en el código de la encuesta (ver [sección 4](#4-ponderación-configurable)).

| # | Eje | Variable | Indicador |
|---|---|---|---|
| 1 | Avance y ritmo | `avance_curricular` | Avance curricular acumulado (%) |
| 2 | Avance y ritmo | `ritmo` | Índice de ritmo / trayectoria desacoplada |
| 3 | Avance y ritmo | `recursa_basicas` | Dificultad y recursado en materias críticas |
| 4 | Avance y ritmo | `bloqueo_correlativas` | Bloqueo por correlatividades |
| 5 | Inserción laboral | `horas_trabajo` | Intensidad de la trayectoria laboral paralela |
| 6 | Inserción laboral | `inicio_laboral` | Momento de inserción laboral |
| 7 | Compromiso y hábitos | `duda_vocacional` | Estabilidad de metas y compromiso académico |
| 8 | Compromiso y hábitos | `horas_estudio` | Hábitos de estudio y autonomía |
| 9 | Acontecimientos vitales y tramo final | `suceso_vital` | Vulnerabilidad por acontecimientos vitales |
| 10 | Acontecimientos vitales y tramo final | `estado_pfg` | Tiempo entre fin de cursada y egreso |

### Eje 1: avance, ritmo y cuellos de botella académicos

1. **¿Cuántas materias o créditos tenés aprobados de forma definitiva al inicio de este cuatrimestre, respecto del total que exige el plan de estudios?**
   - *Opciones / registro:* valor numérico (créditos o materias aprobadas / créditos teóricos esperados a la fecha).
   - *Indicador:* **Avance curricular acumulado (%)**. Se puede comparar con el nodo raíz encontrado con árboles de decisión: tener aprobado menos del 38,97 % de los créditos al 6.º semestre es un umbral crítico de desvinculación.
2. **Considerando el año en que ingresaste a la carrera, ¿cómo definís tu avance actual en el cursado?**
   - *Opciones:*
     - Al día: curso las materias del año que me corresponde.
     - Demorado: menos de 2 años de retraso, o más del 50 % de la carrera aprobada.
     - Muy demorado: más de 2 años de retraso, o menos del 50 % aprobado a los 5 años.
   - *Indicador:* **Índice de ritmo / trayectoria desacoplada**. Mide la diferencia entre la cronología teórica del plan de estudios y la trayectoria real del estudiante.
3. **¿Estás recursando alguna materia de ciencias básicas (Álgebra, Análisis Matemático, Física o Química), o rendiste alguna desaprobada más de dos veces?**
   - *Opciones:* No / Sí, una materia / Sí, dos o más materias.
   - *Indicador:* **Dificultad y recursado en materias críticas**. Las ciencias básicas de los primeros semestres concentran la mayor tasa de riesgo (*hazard*) y son la principal causa de desgranamiento temprano en ingeniería.
4. **¿Hay materias que no pudiste cursar este cuatrimestre solo porque te falta una correlativa?**
   - *Opciones:* No / Sí, 1 materia bloqueada / Sí, 2 o más materias bloqueadas.
   - *Indicador:* **Bloqueo por correlatividades y cuello de botella estructural**. Evalúa si la estructura de requisitos frena el avance del estudiante hacia los años superiores, más allá de su voluntad.

### Eje 2: inserción laboral y gestión del tiempo

5. **¿Trabajás actualmente? ¿Cuántas horas por semana, en promedio?**
   - *Opciones:* No trabajo (0 h) / Tiempo parcial (menos de 20 h por semana) / Media jornada o más (20 a 35 h por semana) / Jornada completa (35 h o más por semana).
   - *Indicador:* **Intensidad de la trayectoria laboral paralela**. La incompatibilidad de horarios y el exceso de carga laboral reducen el tiempo efectivo de estudio y aumentan el rezago académico.
6. **Si trabajás, ¿en qué momento de la carrera empezaste?**
   - *Opciones:* No trabajo / Empecé en 1.º o 2.º año / Empecé en 3.º o 4.º año / Empecé en el tramo final (5.º año, o debiendo solo el trabajo final).
   - *Indicador:* **Momento de inserción laboral (temprana o tardía)**. La evidencia en ingeniería muestra que trabajar desde el inicio de la carrera se asocia fuertemente con trayectorias lentas y demoradas. En cambio, empezar a trabajar en el tramo final es habitual y compatible con la graduación.

### Eje 3: compromiso académico, metas y hábitos

7. **Durante el último cuatrimestre, ¿pensaste en abandonar la carrera o cambiarte a otra, o tenés dudas sobre seguir en Ingeniería Industrial?**
   - *Opciones:* escala de 1 (totalmente decidido a graduarme) a 5 (dudas serias, pienso abandonar o cambiar).
   - *Indicador:* **Estabilidad de metas y compromiso académico**. Los estudios en Ingeniería Industrial señalan el cambio de metas y la pérdida de compromiso como el factor subjetivo de mayor impacto en la decisión de abandonar (tamaño del efecto $d = 1{,}01$).
8. **¿Cuántas horas por semana, en promedio, estudiás por tu cuenta fuera del horario de clases?**
   - *Opciones:* Más de 15 h / Entre 8 y 14 h / Menos de 8 h / Casi nada (solo antes de los parciales).
   - *Indicador:* **Hábitos de estudio, autonomía y disciplina de trabajo**. La falta de disciplina y de hábitos de estudio autónomo aparece una y otra vez como causa directa del bajo rendimiento en ingeniería.

### Eje 4: acontecimientos vitales y tramo final

9. **En los últimos meses, ¿viviste algún acontecimiento importante que haya afectado tu rendimiento?** Por ejemplo: problemas de salud propios o familiares, un nacimiento, una mudanza, una emergencia en el hogar o una crisis económica severa.
   - *Opciones:* No / Sí, con impacto leve / Sí, con impacto severo en mi disponibilidad para estudiar.
   - *Indicador:* **Vulnerabilidad por acontecimientos vitales**. En cohortes de ingeniería seguidas durante 5 años, el 67 % de los estudiantes muy demorados reporta sucesos que alteraron su vida, frente a solo el 20 % de los que cursan al día.
10. **(Solo con 70 % de avance o más, o con la cursada terminada) ¿En qué estado está tu Proyecto Final de Grado (PFG) o tu Práctica Profesional Supervisada?**
    - *Opciones:* No me corresponde todavía / No iniciado / Tema propuesto sin avance / En desarrollo / Terminado, falta la defensa.
    - *Indicador:* **Tiempo entre fin de cursada y egreso / permanencia sin titulación**. Sigue el principal cuello de botella del final de las carreras de ingeniería, donde la reglamentación del PFG suele alargar la duración real de la carrera en más de un año.

---

## 2. Fórmula del Índice de Criticidad Estudiantil (ICE)

El $ICE_i$ combina las calificaciones registradas por la facultad con las respuestas del estudiante en una sola medida, en una escala de **0 a 100 puntos**. Más puntaje significa más criticidad, es decir, más riesgo de que el estudiante abandone.

$$ICE_i = w_A \cdot C_{\text{acad}} + w_L \cdot C_{\text{lab}} + w_V \cdot C_{\text{voc}} + w_S \cdot C_{\text{vit}}$$

Los pesos siguen el orden de importancia que muestran las fuentes ($\sum w = 1$):

| Peso | Dimensión | Por qué |
|---|---|---|
| $w_A = 0{,}40$ | Académica y curricular | Es el peso mayor porque el avance y la aprobación de las ciencias básicas son los predictores objetivos más fuertes |
| $w_L = 0{,}20$ | Laboral y temporal | Factor externo que hace más lento el cursado en ingeniería |
| $w_V = 0{,}20$ | Vocacional y hábitos | Refleja el peso de las actitudes y del cambio de metas que muestra el marco de competencias |
| $w_S = 0{,}20$ | Socio-vital y tramo final | Junta los acontecimientos vitales graves y el estancamiento en el PFG |

### Cálculo de cada subíndice (cada uno de 0 a 100)

**1. Subíndice académico ($C_{\text{acad}}$)**

$$C_{\text{acad}} = 40 \cdot \left(1 - \frac{\text{Créditos aprobados}}{\text{Créditos teóricos esperados}}\right) + 30 \cdot R_{\text{básicas}} + 30 \cdot B_{\text{correlat}}$$

- **Créditos aprobados / créditos esperados:** si el cociente es menor que 0,3897 (el umbral crítico de García Lambert), el primer término vale su máximo, 40 puntos.
- **$R_{\text{básicas}}$, recursado de básicas:** 0 si no recursa, 0,5 si recursa 1 materia crítica, 1 si recursa 2 o más.
- **$B_{\text{correlat}}$, bloqueo por correlativas:** 0 sin materias trabadas, 0,5 con 1 trabada, 1 con 2 o más.

**2. Subíndice laboral ($C_{\text{lab}}$)**

$$C_{\text{lab}} = H_{\text{trabajo}} \cdot M_{\text{inicio}}$$

- **$H_{\text{trabajo}}$, carga horaria:** 0 si no trabaja; 40 si trabaja menos de 20 h; 70 si trabaja de 20 a 35 h; 100 si trabaja 35 h o más.
- **$M_{\text{inicio}}$, factor según cuándo empezó a trabajar:**
  - en 1.º o 2.º año: 1 (riesgo máximo de que la carrera se atrase);
  - en 3.º o 4.º año: 0,7;
  - en 5.º año o en el tramo final: 0,4 (empezar tarde es habitual en ingeniería y no implica riesgo de abandono temprano);
  - no trabaja: 0.

**3. Subíndice vocacional y de hábitos ($C_{\text{voc}}$)**

$$C_{\text{voc}} = 60 \cdot \frac{\text{Duda vocacional} - 1}{4} + 40 \cdot H_{\text{estudio}}$$

- **Duda vocacional:** la respuesta de la pregunta 7, en la escala de 1 a 5.
- **$H_{\text{estudio}}$, falta de estudio por su cuenta:** 0 con más de 15 h por semana; 30 con 8 a 14 h; 70 con menos de 8 h; 100 si no estudia por su cuenta.

**4. Subíndice socio-vital y de tramo final ($C_{\text{vit}}$)**

- Para estudiantes de 2.º a 4.º año:

  $$C_{\text{vit}} = V_{\text{suceso}}$$

  **$V_{\text{suceso}}$** vale 0 sin acontecimientos, 50 con impacto leve y 100 con un acontecimiento grave.
- Para estudiantes en el tramo final (70 % de avance o más):

  $$C_{\text{vit}} = 0{,}50 \cdot V_{\text{suceso}} + 0{,}50 \cdot P_{\text{PFG}}$$

  **$P_{\text{PFG}}$, atraso en el trabajo final:** 0 si está defendido o en la redacción final; 50 si terminó la cursada y el PFG lleva más de 1 año de atraso; 100 si terminó la cursada y el PFG está frenado o sin inscribir.

---

## 3. Semáforo de criticidad

El puntaje del $ICE_i$ ubica a cada estudiante en uno de tres niveles de seguimiento:

| Rango del ICE | Semáforo | Situación | Acción de la institución |
|:---|:---:|:---|:---|
| **0 a 39** | **Verde** | Riesgo bajo, trayectoria regular | Seguimiento habitual cada cuatrimestre |
| **40 a 69** | **Amarillo** | Riesgo moderado, trayectoria atrasada respecto del plan | Alerta por correlativas, derivación a tutorías de ciencias básicas y sugerencia de ajustar cuántas materias cursa |
| **70 a 100** | **Rojo** | Criticidad alta, riesgo inminente de abandono | Convocatoria prioritaria del Gabinete o la Dirección de Carrera, entrevista personal, análisis de la compatibilidad con el trabajo y plan de contingencia académico |

### Indicadores por carrera o cohorte

Para ver qué tan crítico es el conjunto de los estudiantes se calculan dos indicadores resumen:

1. **Índice medio de criticidad ($\overline{ICE}$):** el promedio del $ICE_i$ de todos los estudiantes activos de una cohorte o de un año lectivo.
2. **Tasa de alumnado crítico ($TAC$):** el porcentaje de estudiantes en la zona roja.

   $$TAC = \frac{\text{Estudiantes con } ICE \ge 70}{\text{Total de estudiantes activos relevados}} \times 100$$

Así se cruzan, de forma sistemática, los datos de rendimiento de la facultad con lo que el estudiante informa cada cuatrimestre, que es lo que se necesita para anticipar los problemas en las trayectorias de ingeniería.

---

## 4. Ponderación configurable

### Qué es fijo y qué se configura

- **Fijo (en el código del motor):** las fórmulas de los cuatro subíndices de la sección 2, el valor de cada opción de respuesta y, si así se decide, las preguntas mismas. Cambiar una fórmula o agregar un subíndice requiere programarlo.
- **Configurable (en una base de datos):** **cuánto pesa cada subíndice en la suma final** y los umbrales del semáforo.

La operación final es siempre una suma ponderada:

$$ICE_i = \sum_{m} \frac{p_m}{100} \cdot C_m \qquad \text{con} \qquad \sum_{m} p_m = 100$$

donde $C_m$ es cada subíndice (de 0 a 100) y $p_m$ su porcentaje.

### Valores de cada opción (fijos)

Son los que usan las fórmulas de la sección 2. Si las preguntas quedan en el código, esta tabla es la referencia para programarlas.

| Variable | Término | Opción → valor |
|---|---|---|
| `avance_curricular` | Créditos aprobados / esperados | Cociente de 0 a 1. Por debajo de 0,3897 el término vale el máximo (40) |
| `ritmo` | (informativo, no entra en la fórmula) | Al día / Demorado / Muy demorado |
| `recursa_basicas` | $R_{\text{básicas}}$ | No → 0 · Sí, una → 0,5 · Sí, dos o más → 1 |
| `bloqueo_correlativas` | $B_{\text{correlat}}$ | No → 0 · 1 bloqueada → 0,5 · 2 o más → 1 |
| `horas_trabajo` | $H_{\text{trabajo}}$ | No trabajo → 0 · Menos de 20 h → 40 · 20 a 35 h → 70 · 35 h o más → 100 |
| `inicio_laboral` | $M_{\text{inicio}}$ | No trabajo → 0 · 1.º o 2.º año → 1 · 3.º o 4.º año → 0,7 · Tramo final → 0,4 |
| `duda_vocacional` | Duda vocacional | Escala de 1 a 5 (el valor elegido) |
| `horas_estudio` | $H_{\text{estudio}}$ | Más de 15 h → 0 · 8 a 14 h → 30 · Menos de 8 h → 70 · Casi nada → 100 |
| `suceso_vital` | $V_{\text{suceso}}$ | No → 0 · Impacto leve → 50 · Impacto severo → 100 |
| `estado_pfg` | $P_{\text{PFG}}$ | Defendido o en redacción final → 0 · PFG demorado más de 1 año → 50 · Frenado o sin inscribir → 100 |

**Corrección de escala en $C_{\text{voc}}$:** tal como está escrita en la sección 2, la fórmula multiplica $40 \cdot H_{\text{estudio}}$ con $H_{\text{estudio}}$ de 0 a 100, lo que daría hasta 4000. Para que el subíndice quede entre 0 y 100, el motor usa $H_{\text{estudio}}/100$ (0; 0,30; 0,70; 1), como hacen $R_{\text{básicas}}$ y $B_{\text{correlat}}$ en $C_{\text{acad}}$.

### Base "Ponderaciones"

Una entrada por subíndice en cada versión, más una entrada para la suma final (`ICE`).

| Campo | Tipo | Requerido | Qué guarda |
|---|---|---|---|
| `version` | number | sí | Versión de la ponderación (1, 2…) |
| `modelo` | menu (`C_acad`, `C_lab`, `C_voc`, `C_vit`, `ICE`) | sí | A qué subíndice aplica la entrada |
| `nombre` | text | sí | Nombre en palabras |
| `formula` | text | sí | La fórmula del subíndice, para mostrarla. Es fija: la calcula el motor |
| `variables` | text | no | Variables que usa, separadas por coma |
| `peso` | number | no | Porcentaje que aporta a la suma final (0 a 100). Vacío en `ICE` |
| `umbral_amarillo` | number | no | Solo en `ICE` |
| `umbral_rojo` | number | no | Solo en `ICE` |
| `documento` | text | sí | Dónde se explica el modelo (este archivo) |
| `estado` | menu (`borrador`, `publicada`, `retirada`) | sí | |
| `vigente_desde` | text (fecha) | sí | Desde cuándo se usa |

**Versión 1** (los pesos de la sección 2):

| version | modelo | nombre | formula | variables | peso |
|---|---|---|---|---|---|
| 1 | `C_acad` | Subíndice académico | `40·(1 − aprobados/esperados) + 30·R_básicas + 30·B_correlat` | `avance_curricular`, `recursa_basicas`, `bloqueo_correlativas` | 40 |
| 1 | `C_lab` | Subíndice laboral | `H_trabajo × M_inicio` | `horas_trabajo`, `inicio_laboral` | 20 |
| 1 | `C_voc` | Subíndice vocacional y de hábitos | `60·(duda − 1)/4 + 40·H_estudio` | `duda_vocacional`, `horas_estudio` | 20 |
| 1 | `C_vit` | Subíndice socio-vital y de tramo final | `V_suceso` (con avance ≥ 70 %: `0,5·V_suceso + 0,5·P_PFG`) | `suceso_vital`, `estado_pfg` | 20 |
| 1 | `ICE` | Índice de Criticidad Estudiantil | `ICE = 40 % C_acad + 20 % C_lab + 20 % C_voc + 20 % C_vit` | — | — (umbrales 40 y 70) |

### Reglas

- **Nunca se edita una versión.** Para cambiar un porcentaje se cargan todas las entradas de nuevo con la `version` siguiente. La anterior queda guardada.
- **Una versión se publica solo si los pesos suman 100.** Lo controla la página antes de guardar.
- **Vigente:** la versión `publicada` más alta cuya `vigente_desde` ya llegó.
- **La fórmula de la entrada `ICE` no se escribe a mano:** la arma la página con los pesos de las demás entradas de esa versión.
- **Histórico:** cada cálculo guardado en la base Criticidad registra la `version` de la ponderación y el valor de cada subíndice. Así un ICE viejo se puede explicar aunque después cambien los pesos.
- **Un subíndice nuevo** (por ejemplo, la [criticidad por correlativas](MODELO_CRITICIDAD_POR_CORRELATIVAS.md)) primero se programa en el motor. Después entra como una entrada más, y puede arrancar con peso 0 hasta que se decida usarlo.

### Ejemplo de cálculo

Un estudiante de 3.er año, con estas respuestas y datos:

| Subíndice | Datos | Valor |
|---|---|---|
| $C_{\text{acad}}$ | 50 % de avance, recursa 1 básica, sin bloqueos: $40 \cdot 0{,}5 + 30 \cdot 0{,}5 + 0$ | 35 |
| $C_{\text{lab}}$ | Trabaja de 20 a 35 h desde 1.er año: $70 \cdot 1$ | 70 |
| $C_{\text{voc}}$ | Duda 3, estudia de 8 a 14 h: $60 \cdot 2/4 + 40 \cdot 0{,}30$ | 42 |
| $C_{\text{vit}}$ | Sin acontecimientos | 0 |

$$ICE = 0{,}40 \cdot 35 + 0{,}20 \cdot 70 + 0{,}20 \cdot 42 + 0{,}20 \cdot 0 = 14 + 14 + 8{,}4 + 0 = 36{,}4$$

Queda en **verde** (por debajo de 40). Con la versión 2 de ejemplo (laboral 25 %, vocacional 15 %), el mismo estudiante da $14 + 17{,}5 + 6{,}3 + 0 = 37{,}8$.

---

## Pendientes

- **Calibrar los pesos.** Una opción es simular el cálculo con tres perfiles típicos de estudiantes de Ingeniería Industrial antes de cargar los pesos en la base Ponderaciones.
- **Confirmar la corrección de escala de $C_{\text{voc}}$** ($H_{\text{estudio}}/100$) con quien propuso la fórmula.
- **Preguntas en la base o en el código.** Si quedan fijas en el código, la base Preguntas no se usa para la encuesta cuatrimestral, y la tabla de valores de la sección 4 es la referencia.
- **Fuente de las preguntas 1, 3 y 4.** El avance, el recursado de básicas y las correlativas trabadas también se pueden **calcular** con las notas de la facultad (Situación académica) y el plan de estudios ([criticidad por correlativas](MODELO_CRITICIDAD_POR_CORRELATIVAS.md)). Hay que decidir si gana el dato de la facultad o el del estudiante.
- **Pregunta 6.** El momento en que empezó a trabajar se puede deducir del historial de encuestas: es el primer cuatrimestre en que respondió que trabaja. Si se deduce, la pregunta se puede sacar.
- **Escala del semáforo.** Las bandas 40 y 70 no coinciden con las del índice provisorio del [detalle del estudiante](../specs/detalle-estudiante.md), que usa 40 y 80. Hay que unificarlas.
