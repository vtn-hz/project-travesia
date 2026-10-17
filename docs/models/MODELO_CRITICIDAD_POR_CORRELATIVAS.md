# Modelo de criticidad por suma ponderada de las materias que se traban

**Documento formal del modelo**

## 1. Objeto

Este documento define un modelo simple para medir qué tan crítica es una materia obligatoria pendiente de Ingeniería Industrial. El modelo **suma** un aporte por cada materia que la materia analizada traba, y cada aporte se **divide por la distancia en cuatrimestres** hasta esa materia. Una materia es crítica si la suma es mayor o igual a 1.

## 2. Notación

- **ℳ:** conjunto de materias obligatorias del plan. Se asume aprobado el curso de ingreso.
- **c(x):** cuatrimestre del plan en que se ubica la materia x, con c(x) ∈ {1, …, 10}.
- **C:** cuatrimestre actual del estudiante.
- **B(m):** conjunto de materias que traba la materia m, es decir, todas las que dependen de m directa o indirectamente. Cada una se cuenta una sola vez.
- **δ(d):** distancia en cuatrimestres desde el cuatrimestre actual hasta la materia d: δ(d) = c(d) − C.

## 3. Definición del modelo

### 3.1 Aporte de cada materia que se traba

Cada materia d ∈ B(m) aporta:

```
w(d) = 2        si δ(d) ≤ 0   (d es del cuatrimestre actual o de uno anterior)
w(d) = 1 / δ(d)  si δ(d) ≥ 1   (d es de un cuatrimestre posterior)
```

| Cuatrimestre de d respecto del actual | δ | Aporte w(d) |
|---|---:|---:|
| Actual o anterior | ≤ 0 | 2 |
| Siguiente | 1 | 1 |
| A 2 cuatrimestres | 2 | 1/2 |
| A 3 cuatrimestres | 3 | 1/3 |
| A 4 cuatrimestres | 4 | 1/4 |
| A δ cuatrimestres | δ | 1/δ |

### 3.2 Puntaje

```
S(m, C) = Σ w(d)     sobre todo d ∈ B(m)
```

Si m no traba ninguna materia, S(m, C) = 0.

### 3.3 Criterio de criticidad

```
m es crítica  ⟺  S(m, C) ≥ 1
```

## 4. Ejemplos

### 4.1 Análisis Matemático I con C = 1

Análisis I (cuatrimestre 1) traba 37 materias. Agrupadas por cuatrimestre:

| Cuatrimestre de las materias | Cantidad | δ | Aporte unitario | Subtotal |
|---:|---:|---:|---:|---:|
| 2 | 3 | 1 | 1 | 3.00 |
| 3 | 5 | 2 | 1/2 | 2.50 |
| 4 | 4 | 3 | 1/3 | 1.33 |
| 5 | 7 | 4 | 1/4 | 1.75 |
| 6 | 4 | 5 | 1/5 | 0.80 |
| 7 | 5 | 6 | 1/6 | 0.83 |
| 8 | 3 | 7 | 1/7 | 0.43 |
| 9 | 4 | 8 | 1/8 | 0.50 |
| 10 | 2 | 9 | 1/9 | 0.22 |
| **Total** | | | | **11.37** |

Como S ≥ 1, es crítica.

### 4.2 Fundamentos de Química según C

Química (cuatrimestre 1) traba 7 materias. Su puntaje a medida que avanza el cuatrimestre actual es:

| C | S(Química, C) | ¿Crítica? |
|---:|---:|---|
| 1 | 1.27 | sí |
| 2 | 1.63 | sí |
| 3 | 2.46 | sí |
| 4 | 4.20 | sí |
| 5 | 5.62 | sí |

Con C = 3, por ejemplo:

| Cuatrimestre de las materias | Cantidad | δ | Aporte unitario | Subtotal |
|---:|---:|---:|---:|---:|
| 4 | 1 | 1 | 1 | 1.00 |
| 5 | 1 | 2 | 1/2 | 0.50 |
| 7 | 1 | 4 | 1/4 | 0.25 |
| 8 | 2 | 5 | 1/5 | 0.40 |
| 9 | 1 | 6 | 1/6 | 0.17 |
| 10 | 1 | 7 | 1/7 | 0.14 |
| **Total** | | | | **2.46** |

### 4.3 Una materia que no es crítica: Tecnología de Control con C = 1

Tecnología de Control (cuatrimestre 8) traba 1 materia: Sustentabilidad, Higiene y Seguridad (cuatrimestre 9). Con C = 1, δ = 8 y el aporte es 1/8.

```
S = 1/8 = 0.13  <  1   →  no es crítica
```

## 5. Uso del modelo

Entre las materias disponibles del estudiante (con todas sus correlativas aprobadas), se ordenan de mayor a menor S. Las materias con S ≥ 1 son las críticas.

## 6. Pseudocódigo

```js
function S(m, C) {
  let total = 0;
  for (const d of materiasQueTraba(m)) {      // directas e indirectas, sin repetir
    const dist = cuat(d) - C;
    total += dist <= 0 ? 2 : 1 / dist;
  }
  return total;
}

const esCritica = (m, C) => S(m, C) >= 1;
```

## 7. Resultados

### 7.1 Cantidad de materias críticas según el cuatrimestre actual

Se supone que el estudiante aprobó todas las materias de cuatrimestres anteriores a C. Se evalúan las materias pendientes (sin las de Inglés).

| C | Materias pendientes | Materias críticas |
|---:|---:|---:|
| 1 | 42 | 14 |
| 2 | 39 | 11 |
| 3 | 35 | 9 |
| 4 | 30 | 4 |
| 5 | 26 | 6 |
| 6 | 19 | 2 |
| 7 | 14 | 2 |
| 8 | 9 | 2 |
| 9 | 6 | 0 |
| 10 | 2 | 0 |

### 7.2 Puntaje de cada materia con C = 1 (nada aprobado)

14 de 42 materias son críticas.

| Cuat | Materia | Traba (cantidad) | S | ¿Crítica? |
|---:|---|---:|---:|---|
| 1 | Análisis Matemático I | 37 | 11.37 | sí |
| 1 | Álgebra I- B | 21 | 7.41 | sí |
| 1 | Fundamentos de Química | 7 | 1.27 | sí |
| 2 | Análisis Matemático II | 29 | 6.77 | sí |
| 2 | Álgebra II | 9 | 2.00 | sí |
| 2 | Física A | 12 | 3.06 | sí |
| 2 | Fundamentos de la Programación | 1 | 0.13 | no |
| 3 | Física B- II | 7 | 1.22 | sí |
| 3 | Análisis Matemático III | 7 | 1.30 | sí |
| 3 | Probabilidad y Estadística | 20 | 3.72 | sí |
| 3 | Mecánica del Sólido | 7 | 1.19 | sí |
| 3 | Proyecto de Ingeniería Industrial I | 4 | 0.67 | no |
| 4 | Administración Estratégica | 17 | 2.93 | sí |
| 4 | Conceptos de Economía Industrial | 2 | 0.29 | no |
| 4 | Máquinas y Equipos Industriales I | 3 | 0.43 | no |
| 4 | Termodinámica Industrial | 3 | 0.43 | no |
| 5 | Administración de Operaciones | 12 | 1.81 | sí |
| 5 | Investigación Operativa A | 13 | 2.01 | sí |
| 5 | Gestión de la Tecnología y la Innovación | 1 | 0.11 | no |
| 5 | Tecnología de los Materiales | 2 | 0.25 | no |
| 5 | Ética, Legislación y Propiedad Intelectual en el Ejercicio Profesional | 2 | 0.28 | no |
| 5 | Mecánica de Fluidos | 3 | 0.43 | no |
| 5 | Proyecto de Ingeniería Industrial II | 3 | 0.42 | no |
| 6 | Planificación y Control de la Producción | 8 | 1.14 | sí |
| 6 | Investigación Operativa B | 3 | 0.43 | no |
| 6 | Sistemas de Representación para Ingeniería | 2 | 0.27 | no |
| 6 | Física Experimental A | 2 | 0.25 | no |
| 6 | Gestión de la Logística Integral y Cadena de Suministros | 1 | 0.13 | no |
| 7 | Diseño de Instalaciones y Procesos | 2 | 0.27 | no |
| 7 | Sistemas de Gestión y Mejora Continua | 2 | 0.25 | no |
| 7 | Comportamiento Organizacional y Relaciones del Trabajo | 1 | 0.11 | no |
| 7 | Gestión Comercial de las Organizaciones | 0 | 0.00 | no |
| 7 | Proyecto de Ingeniería Industrial III | 1 | 0.13 | no |
| 8 | Formulación y Evaluación de Proyectos | 1 | 0.13 | no |
| 8 | Introducción a los Procesos de Fabricación | 1 | 0.11 | no |
| 8 | Tecnología de Control | 1 | 0.13 | no |
| 9 | Sustentabilidad, Higiene y Seguridad | 0 | 0.00 | no |
| 9 | Desarrollo Económico y Comercio Internacional | 0 | 0.00 | no |
| 9 | Sistemas Informáticos de Gestión | 0 | 0.00 | no |
| 9 | Proyecto de Ingeniería Industrial IV | 0 | 0.00 | no |
| 10 | Gestión Integral del Mantenimiento | 0 | 0.00 | no |
| 10 | Empresas y Servicios Basadas en el Conocimiento | 0 | 0.00 | no |

## 8. Supuestos

1. El archivo de correlativas no indica el cuatrimestre de cada materia. Se dedujo del orden de la lista (3, 4, 6, 5, 7, 6, 6, 5, 5 y 5 materias por cuatrimestre) y se verificó que ninguna correlativa quede en el mismo cuatrimestre o en uno posterior. Debe confirmarse con el plan de estudios oficial.
2. Las materias anuales se ubican en el cuatrimestre donde empiezan.
3. Las materias de un cuatrimestre anterior al actual reciben el mismo aporte que las del actual (2).
4. Las cuatro materias de Inglés no se evalúan. Ninguna materia ajena a Inglés depende de ellas, por lo que no afectan el puntaje de las demás.
