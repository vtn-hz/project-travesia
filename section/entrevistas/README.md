# Entrevistas y Tutorías

> **No publicado en Moodle. En revisión.**
> Esta sección existe solo en el repo. No se sube a Moodle hasta que el equipo termine de revisarla y pida publicarla en forma explícita ([`RULES.md`](../../RULES.md), regla 3).

| | |
|---|---|
| Archivo | [`content.html`](content.html) |
| Estado | **En revisión**: desarrollada y probada en local con datos de prueba |
| En Moodle | Nada: sin Página, sin bases y sin ids (`paginas.entrevistas`, `bases.acompanamientos` y `bases.entrevistas` están en `null` en [`moodle.config.json`](../../moodle.config.json)) |
| Especificación | [`docs/specs/entrevistas.md`](../../docs/specs/entrevistas.md) |
| Bases propuestas | [`BASE_ACOMPANAMIENTOS.json`](../../data/moodle/BASE_ACOMPANAMIENTOS.json) y [`BASE_ENTREVISTAS.json`](../../data/moodle/BASE_ENTREVISTAS.json) (modelo reducido, sin crear) |

## Qué falta revisar antes de publicar

1. **Modelo reducido de dos bases** (Acompañamientos y Entrevistas), con copias de nombres en Acompañamientos.
2. **Campo nuevo `propuestas_json`** para las contraofertas del Req 11 (no está en el modelo simplificado).
3. **Usuario de la sesión** en Moodle (`M.cfg.userId`) y **detección de roles** por grupo (ADM, TUT, PAR).
4. **Lado del estudiante** (pedir, aceptar o contraofertar): no entra en el modelo reducido.

## Cómo verla

Abrir `content.html` en el navegador (`file://` o Live Server). Aparece la barra de vista previa para ver como ADM, TUT o PAR, con datos de prueba de los integrantes de Zhakyz al 19/10/2026. Lo que se guarda queda solo en la pantalla.

## Para publicarla (cuando se apruebe)

Seguir la skill [`publicar-seccion`](../../.skills/publicar-seccion/SKILL.md): crear las dos bases, cargar sus ids en `moodle.config.json`, correr `sincronizar_config.js`, simular, pedir confirmación y actualizar [`DEPLOY.md`](../../DEPLOY.md), la tabla de [`RULES.md`](../../RULES.md) y este archivo.
