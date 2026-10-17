

Proyecto Travesía

*Datos que acompañan caminos*

**Sistema de BI para la retención de estudiantes**

Especificación de requerimientos

Versión 1.1  
Historial de Versiones

| Fecha | Rev. | Descripción | Autor(es) |
| ----- | :---: | ----- | ----- |
| 27/03/2026 | 0.1 | Relevamiento inicial de requerimientos | Equipo docente AEEC |
| 07/04/2026 | 0.2 | Relevamiento en profundidad | Equipo docente AEEC |
| 11/04/2026 | 0.3 | Agrupamiento y detalle de requerimientos | Equipo docente AEEC |
| 14/04/2026 | 1.0 | Revisión global y presentación | Equipo docente AEEC |
| 06/10/2026 | 1.1 | Actualización de requerimientos | Zhakyz & Asociados |

# 

# 

# 

Índice

[**Introducción	4**](#introducción)

[Propósito	4](#propósito)

[Problema y oportunidad	4](#problema-y-oportunidad)

[Alcance	5](#alcance)

[Objetivos del Sistema/Solución	5](#objetivos-del-sistema/solución)

[Definiciones y abreviaturas	5](#definiciones-y-abreviaturas)

[**Descripción general	6**](#descripción-general)

[Funcionalidad	6](#funcionalidad)

[Características de usuario	7](#características-de-usuario)

[Documentación de usuario	7](#documentación-de-usuario)

[Entregables	7](#entregables)

[**Requerimientos específicos	8**](#requerimientos-específicos)

[Requerimientos Funcionales	9](#requerimientos-funcionales)

[Requerimientos No Funcionales	13](#requerimientos-no-funcionales)

[Requerimientos Operativos	13](#requerimientos-operativos)

# 

# Introducción {#introducción}

## Propósito {#propósito}

Este documento describe los requerimientos del **Sistema de BI para la Retención de Estudiantes** (SBIRE) para el diseño de un sistema que permita al equipo del Departamento de Industrial transformar datos fríos (notas) y percepciones subjetivas (encuestas) en acciones proactivas de tutoría que permitan mejorar los índices de finalización de la carrera de Ingeniería Industrial dentro de los tiempos previstos en el plan de estudios. Es decir que esta especificación brinda un marco de referencia para la presentación de la solución propuesta.

En particular, las especificaciones estarán centradas en las necesidades del equipo docente y de gestión del Departamento de Industrial de la Facultad de Ingeniería de la Universidad Nacional de Mar del Plata (FI-UNMdP).

Sin embargo, se debe considerar que la propuesta debe resultar escalable y aplicable a otros departamentos y carreras de características similares aunque no iguales.

Este requerimiento y el proyecto en sí, se desarrolla en el marco de la asignatura Administración Empresarial en la Economía del Conocimiento (AEEC) durante el primer cuatrimestre del año 2026, por lo cual la propuesta debe incluir los componentes conceptuales definidos y pautados en el marco de dicha asignatura.

### **Problema y oportunidad** {#problema-y-oportunidad}

Actualmente, la facultad enfrenta una tasa de deserción del **40% en el primer año**, principalmente asociada a materias básicas (Matemática, Física, etc). Asimismo, existe una deserción tardía en los **últimos años del 23%** por cambios de prioridades, por ejemplo. Como referencia pueden tomarse los resultados publicados por Morcela et al en 2023 y 2024\.

La información que se desea obtener tiene que ver principalmente con aquella que permite detectar los motivos de:

* **Deserción temprana** (quienes abandonan en el transcurso del primer año)

* **Deserción tardía** (quienes abandonan a partir de 4° año)

* **Carrera extendida** (quienes no abandonan pero dilatan la finalización de la carrera más allá del tiempo previsto en el plan de estudios, a veces también se denomina deserción intermitente)

La información sobre el estado de los estudiantes está fragmentada (diversas fuentes) en el Campus Virtual, archivos XLS / CSV de docentes y percepciones de estudiantes a partir de encuestas administradas periódicamente, lo que dificulta una **intervención proactiva** por parte del equipo de gestión académica de la facultad.

La necesidad a satisfacer es la generación de un dispositivo para el seguimiento de las trayectorias estudiantiles, a aplicarse en el Departamento de Ingeniería Industrial.

## Alcance {#alcance}

En este documento se definen los requerimientos funcionales y no funcionales del sistema, como usabilidad, desempeño, entre otros, desde la perspectiva de los distintos usuarios  que tendrá el sistema.

El sistema abarcará la gestión de datos e información sobre estudiantes en sus distintas etapas:

* **Carga de datos de estudiantes**: notas, situación de aprobación de asignaturas, datos personales y filiatorios, percepción sobre cursadas, gestión de comunicaciones.  
* **Procesamiento de datos**: cálculo automático de indicadores configurables, procesamiento inteligente de datos cualitativos.  
* **Visualización de información**: presentación de datos según el rol, configurables.

### **Objetivos del Sistema/Solución** {#objetivos-del-sistema/solución}

* Centralizar la información de las trayectorias académicas integrando datos cualitativos y cuantitativos.

* Categorizar a los estudiantes según su riesgo de abandono o deserción mediante un sistema de indicadores.

* Facilitar la gestión de entrevistas y tutorías para estudiantes en situación de criticidad.

## Definiciones y abreviaturas {#definiciones-y-abreviaturas}

| SBIRE | Sistema de BI para la Retención de Estudiantes |
| :---- | :---- |
| AEEC | Administración Empresarial en la Economía del Conocimiento |
| DII | Departamento de Ingeniería Industrial |
| TFI | Trabajo Final Integrador |

# Descripción general {#descripción-general}

El sistema debe ser accesible desde cualquier dispositivo que permita el acceso a Moodle. Debe permitir la reutilización de datos y ser interactivo.

## Funcionalidad {#funcionalidad}

El sistema debe incluir:

* Carga de datos de notas parciales de asignaturas de 1° año.

* Carga de datos de encuestas completadas por estudiantes:

  - Información básica (se carga al 2° año, por única vez aunque debe permitir actualizarse a demanda)

  - Información recurrente (se repite al finalizar cada cuatrimestre a partir de 2° año)

* Registro de planificación de entrevistas

* Carga de datos de entrevistas

* Configuración de indicadores definidos por el equipo gestor

* Procesamiento de datos a partir de los indicadores definidos por el equipo gestor

* Visualización de situación de cada estudiante a partir de semáforos, gráficos y otros

* Generación automática de alertas para facilitar el seguimiento de la trayectoria estudiantil:

  - Alerta temprana (según el grado de criticidad asignado a cada grupo de estudiantes)

  - Semáforo o similar (según las características de la trayectoria de cada grupo de estudiantes)

* Generación de reportes

## 

## Características de usuario {#características-de-usuario}

El sistema será utilizado por distintos tipos de usuarios vinculados a la gestión académica de la FI-UNMdP, así como también estudiantes de la carrera de Ingeniería Industrial. Estos usuarios participan en la carga, organización, análisis y evaluación de datos e información referida a la situación académica de cada estudiante, desempeñando roles específicos dentro del sistema:

* **\[ADM\] Administrador**: Responsable de la configuración general, permisos de usuarios, ajustes técnicos y mantenimiento de la plataforma. Podrá dar mantenimiento y crear nuevos formularios para la carga de datos y opciones de visualización de la información.

* **\[EST\] Estudiante:** Completan encuestas, visualizan su propio panel de indicadores y trayectoria.

* **\[GES\] Docente/Gestor Dpto. Industrial (Carga):** Responsables de subir notas desde archivos externos (XLS) y alimentar la base de datos estándar.

* **\[TUT\] Docente (Tutores/Entrevistadores):** Usuarios que consultan el *dashboard* para identificar a quién contactar y registran la planificación y el resultado de las entrevistas.

* **\[PAR\] Asesor Par:** Estudiantes avanzados que asisten a sus compañeros en riesgo.

## Documentación de usuario {#documentación-de-usuario}

El sistema debe contar con manuales y guías de uso accesibles para cada uno de los roles antes descritos.

Asimismo, se debe contar con la documentación correspondiente a las especificaciones funcionales y técnicas del sistema.

## 

## Entregables {#entregables}

Serán definidos por el equipo consultor, y acordados con el cliente, de acuerdo a las pautas definidas en el TFI de la asignatura AEEC.

# Requerimientos específicos {#requerimientos-específicos}

La siguiente tabla resume los requerimientos que luego se detallan, clasificándolos por etapa del evento que se debe gestionar.

| Requerimiento | Carga | Procesamiento | Visualización |
| ----- | :---: | :---: | :---: |
| Carga de datos de notas parciales de asignaturas de primer año. | ✅ | \- | \- |
| Carga de datos de encuestas completadas por estudiantes: Información básica (se carga al iniciar la carrera, por única vez) Información recurrente (se repite al finalizar cada cuatrimestre) | ✅ | \- | \- |
| Registro de planificación de entrevistas | ✅ | \- | ✅ |
| Carga de datos de entrevistas | ✅ | \- | \- |
| Configuración de indicadores definidos por el equipo gestor | \- | ✅ | \- |
| Procesamiento de datos a partir de los indicadores definidos por el equipo gestor | \- | ✅ | \- |
| Visualización de situación de cada estudiante a partir de semáforos, gráficos y otros | \- | ✅ | ✅ |
| Configuración de Reportes | \- | ✅ | ✅ |
| Configuración de estructura de Plan de Estudios | ✅ | \- | ✅ |

## 

## Requerimientos Funcionales {#requerimientos-funcionales}

1) **Gestión de Datos e Integración**

El sistema debe permitir la importación de datos de parciales y finales, inscriptos a cursadas, promocionados y habilitados, ausentes, desde el Campus o archivos XLS (o csv), utilizando DNI/Legajo como identificador.

1. **Importación parcial/final:**  
   El documento deberá estar en csv con el formato:   
   {dni,codigo\_materia,tipo\_examen\[parcial|final\],nota|fecha(dd-mm-YYYY)}  
     
   2. **Importación materias**  
      El documento deberá estar en csv con el formato:   
      {dni,codigo\_materia,estado\_cursada\[inscripto|promocion|habilitado\]|fecha(dd-mm-YYYY)}  
      

*El Docente/Gestor Dpto. Industrial (GES) debe ser capaz de subir notas de parciales.*

*El Docente/Gestor Dpto. Industrial (GES) debe ser capaz de establecer el estado del alumno en cada materia. (Habilitado, Promocionado, Desaprobado)*

Una vez importado los datos por el *GES*, el sistema deberá actualizar la correspondiente trayectoria del estudiante en cuestión.

Embeber páginas o contenidos: Capacidad de integrar o visualizar reportes en el  Campus Virtual de la FI-UNMdP.

2) **Módulo de Encuestas y Diagnóstico**

Creación de encuestas cortas por materia, establecimiento de frecuencia de administración y mecanismos de control de avance.

Alerta por Omisión: Si un estudiante no completa la encuesta, el sistema debe disparar una alerta de criticidad.

3) **Módulo de Preguntas**

   El Administrador (*ADM)* debe poder agregar preguntas a las encuestas. Los datos configurables de cada pregunta son:

   1. Título de la pregunta.

   2. Tipo de la pregunta (Múltiple choice (selección única) | Verdadero o Falso | Múltiple choice (selección múltiple))

   3. Opción(es) de la respuesta. (Título respuesta, valor de respuesta (criticidad))

      

	El Administrador (*ADM*) debe poder eliminar preguntas de una encuesta.

	El Administrador (*ADM*) debe poder editar preguntas de una encuesta.

4) **Inteligencia de Negocio (Semáforos y Alertas)**

El sistema debe aplicar reglas de negocio para pintar el estatus del estudiante:

Criterio 1° Año: Basado en el rendimiento en asignaturas básicas críticas, debe ser configurable (ej. orientativo para Análisis Matemático).

* Rojo: Aprobación \< 20% de las materias esperadas.  
* Amarillo: Aprobación entre 20% y 60%.  
* Verde: Aprobación \> 60%.

Criterio 2° Año en adelante (el avance no se mide concretamente en años pero puede asimilarse): Basado en campos cuantitativos (ej. aprobación de asignaturas) y cualitativos de la encuesta (disconformidad, retraso en años de cursada, cambios de prioridad laboral).

5) **Visualización y Reportes**

* ***Dashboard*** **Estudiante**: Panel con indicadores de su propia trayectoria.

* ***Dashboard*** **Docente/Equipo gestor**: Tablero de control con la lista de estudiantes en situación crítica para contactar.

* ***Informes de gestión:*** reportes con resumen de contenido y estadísticas.

* ***Dashboard Entrevistas:*** Panel donde se pueden ver las solicitudes de entrevistas, registrar entrevistas realizadas, visualizar registro histórico de entrevistas.

6) **Seguimiento de Trayectoria**

El sistema debe procesar los datos académicos y autoinformados para calcular, actualizar y visualizar de manera continua los siguientes indicadores:

* Retención de Primer Año: El sistema debe calcular la proporción de estudiantes que continúan activos al año siguiente sobre el total de ingresantes de la cohorte correspondiente.  
* Desgranamiento semestral: El sistema debe medir y graficar la caída progresiva de estudiantes activos por cohorte, evaluada semestre a semestre.  
* Avance curricular acumulado: El sistema debe calcular el porcentaje de materias aprobadas respecto a los créditos totales del plan de estudios por cohorte.  
* Índice de ritmo: El sistema debe comparar el avance real del estudiante contra el avance teórico esperado, teniendo en cuenta su fecha exacta de ingreso. Clasificándose en: al día / demorado (\>50% a los 5 años) / muy demorado (\<50%).

7) **Terminalidad**

El sistema debe procesar los datos académicos a largo plazo para medir los resultados finales de la trayectoria de cada cohorte, calculando los siguientes indicadores:

* Tasa de egreso por cohorte: El sistema debe calcular el porcentaje de egresados sobre el total de ingresantes de una misma cohorte, asegurando que el seguimiento sea individualizado para no mezclar generaciones  
* Egreso/Titulación: El sistema debe calcular y mostrar por separado el porcentaje de estudiantes egresados (cursaron todas las materias) y titulados (defensa o trámite final) sobre los ingresantes de cada cohorte.  
* Duración de la Carrera: El sistema debe calcular la cantidad de años reales que le toma a cada estudiante egresar respecto a la duración teórica del plan de estudios.  
* Permanencia terminal: El sistema debe identificar automáticamente a aquellos estudiantes con alto grado de avance, pero que no logran completar los requisitos finales para la titulación.  
* Tiempo en TPG: El sistema debe medir el tiempo transcurrido desde la fecha de aprobación de la última materia rendida hasta la fecha de aprobación del trabajo final o proyecto de grado.

8) **Cuellos de Botella**

El sistema debe procesar los datos curriculares para presentar las causas de abandono y rezago, identificando bloqueos estructurales dentro del plan de estudios. Para ello debe calcular los siguientes indicadores:

* Supervivencia académica: El sistema debe calcular la probabilidad de que un estudiante permanezca activo hasta un momento dado y estimar el riesgo de abandono por período académico.  
* Materias Críticas: El sistema debe detectar aquellas materias que concentran el mayor riesgo de abandono, cruzando los datos de rendimiento con los índices de recursado y la percepción de dificultad declarada por los estudiantes en las encuestas.

9) **Almacenamiento de cohorte**  
   El sistema debe almacenar sobre sus Estudiantes el año de ingreso y el cuatrimestre en el que ingresaron por primera vez (Primero | Segundo). Estos datos representarán al cohorte del Estudiante.  
10) **Gestión de Estados**  
    El Docente (Tutor) debe ser capaz de cambiar el estado de criticidad de los estudiantes (ya sea porque ya fue la entrevista o porque fue un estudiante cuya situación ya se conoce).

11) **Gestión de Entrevistas**  
    *El Docente (Tutor) debe poder acceder a el Dashboard de Entrevistas.*  
    *El Docente (Tutor) debe ser capaz de solicitar entrevistas a un Estudiante crítico.*  
    *El Docente (Tutor) debe poder registrar las entrevistas realizadas en el sistema.*  
    *El Docente (Tutor) debe poder aceptar solicitudes de entrevistas de un Estudiante.*  
    *El Docente (Tutor) debe poder ofrecer una contra-oferta a las solicitudes de entrevistas. (Si el Docente no puede realizar la entrevista en la fecha y hora pedida, puede enviar una contraoferta al Estudiante con una nueva fecha y hora).*  
    *El Asesor Par tiene los mismos permisos que el Docente (Tutor).*  
    *El Estudiante debe poder solicitar entrevistas al Docente (Tutor) o al Asesor Par.*

	*El Estudiante debe poder aceptar solicitudes de entrevistas.*

*El Estudiante debe poder ofrecer una contra-oferta a las solicitudes de entrevistas. (Si el Estudiante no puede realizar la entrevista en la fecha y hora pedida, puede enviar una contraoferta al Docente (Tutor) / Asesor Par con una nueva fecha y hora)*

## 

## Requerimientos No Funcionales {#requerimientos-no-funcionales}

1. **Proactividad**

El sistema no es solo de consulta; debe anticipar la deserción permitiendo programar entrevistas antes de que el estudiante abandone.

En caso de que la complejidad técnica de calendarizar agendar sea alta, al menos se deberá alertar sobre la necesidad de realizar estas acciones, pudiendo luego registrar lo agendado para guardar registro de la planificación.

2. **Tratamiento Diferenciado**

La lógica para un estudiante de 1er año (foco en contenido académico) es distinta a la de un estudiante de 2do a 5to año (foco en motivación y contexto personal). Se deberán establecer las lógicas de análisis, procesamiento y visualización de los datos y la información de manera tal que contemplen estas diferencias.

3. **Retención Histórica de Datos**

El sistema debe garantizar la persistencia de los registros históricos de cohortes, parciales y encuestas a largo plazo para poder calcular las métricas de “Índice de ritmo” y los modelos de supervivencia académica.

4. **Minimización de fricción en encuestas**

Dado que el monitoreo desde segundo año depende de las encuestas, éstas deben estar diseñadas para completarse en la menor cantidad de clics posibles, con el fin de disminuir el riesgo de no respuesta del formulario.

## Requerimientos Operativos {#requerimientos-operativos}

5. **Software**

El sistema debe ser de uso libre y gratuito, y compatible con la versión de Moodle instalada actualmente en la FI-UNMdP, asegurando que no se genera trabajo adicional de soporte o mantenimiento a las áreas técnicas correspondientes a la Facultad.

6. **Soporte técnico y mantenimiento**

El sistema debe contar con un módulo de soporte técnico accesible desde el perfil del usuario ADMINISTRADOR. Se deberá presentar una propuesta de atención y soporte post-implementación.

7. **Generación de estadísticas**

El sistema debe generar informes a partir de los indicadores establecidos para cada bloque de datos. Los reportes deben exportarse en formatos CSV y PDF.