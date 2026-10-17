# ADR-001: Arquitectura General del Frontend

- **Estado:** Aceptada
- **Fecha:** 2026-10-16
- **Refs:** [RULES.md](../../RULES.md), [content.html](../../section/main_menu/content.html)

## Contexto

El sistema se embebe dentro del Campus Virtual Moodle de la FI-UNMdP. Moodle impone su propio CSS, JS y layout. No se puede instalar plugins ni modificar el servidor. La solución debe funcionar insertando HTML en actividades `mod_data` o bloques HTML.

## Opciones consideradas

1. **Framework externo (React/Vue)** — Requiere build, hosting separado, complejidad innecesaria.
2. **CSS externo + JS separado** — Moodle puede bloquear `<link>` y `<script src>` en contenido HTML embebido.
3. **HTML autocontenido con inline CSS y JS embebido** — Funciona dentro de las restricciones de Moodle.

## Decisión

Opción 3: cada sección es un **único archivo `.html` autocontenido**.

### Reglas derivadas

- **Estilos**: 100% inline en atributos `style=""`, cada propiedad con `!important` para vencer el CSS de Moodle.
- **CSS dinámico**: solo `@keyframes` se inyecta en `<head>` vía JS (lo mínimo indispensable).
- **JavaScript**: un único bloque `<script>` al final, envuelto en IIFE `(function(){ ... })()`.
- **Sin dependencias externas**: vanilla JS puro, sin jQuery, sin frameworks, sin CDNs.
- **Integración Moodle**: lectura/escritura a `mod_data` vía `fetch` + `FormData`, usando `M.cfg.sesskey`, `M.cfg.wwwroot`, `M.cfg.userId`.
- **Secciones delimitadas**: comentarios HTML en mayúsculas (`<!-- NOMBRE -->`) y separadores JS (`// -----`).
- **IDs semánticos**: patrón `{tipo}-{seccion}[-{variante}]` en español sin tildes.

## Consecuencias

- (+) Funciona sin configuración de servidor, se pega directamente en Moodle.
- (+) Sin dependencias que mantener, sin builds.
- (-) Archivos largos (800+ líneas por sección).
- (-) Sin reutilización de componentes entre secciones (cada HTML es isla).
- (-) Inline CSS es verbose y dificulta temas globales.
