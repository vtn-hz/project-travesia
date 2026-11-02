# Entrevistas y Tutorías

> **Publicado en Moodle** el 2026-11-01: Página "Entrevistas y Tutorías" (cmid 60198) en la subsección Hub de Zhakyz. Se abre desde el botón "Abrir agenda" de la tarjeta Entrevistas y Tutorías del Hub, y el resumen de Zhakyz la oculta del listado del curso (fuera del modo edición).

| | |
|---|---|
| Archivo | [`content.html`](content.html) |
| Estado | **Publicado** |
| En Moodle | Página cmid 60198 (`paginas.entrevistas`), conectada a la base Entrevistas (cmid 60197, d=202) en la subsección Database |
| Especificación | [`docs/specs/entrevistas.md`](../../docs/specs/entrevistas.md) |
| Base | [`BASE_ENTREVISTAS.json`](../../data/moodle/BASE_ENTREVISTAS.json), con su plantilla de lista en [`data/moodle/plantillas/entrevistas/`](../../data/moodle/plantillas/entrevistas/) |

## Cómo guarda los datos

- Cada entrevista es una entrada de la base Entrevistas con sus **involucrados** (DNI, nombre y cuenta del estudiante; tipo, cuenta y nombre del acompañante), su estado y sus fechas. No hay base de asignaciones: Acompañamientos se eliminó el 2026-11-01.
- El acompañante es el usuario de la sesión que pide la entrevista (`M.cfg.userId` y el nombre del menú de usuario de Moodle).
- Todos los roles ven todas las entrevistas, y no se puede pedir otra a un DNI que ya tiene una activa.
- **Quién pide:** un tutor o asesor par escribe el nombre y el DNI del estudiante; un estudiante (rol EST) escribe el nombre del tutor o asesor par destinatario. El estudiante ve solo sus entrevistas. En Moodle el rol EST todavía no se detecta: por ahora solo se ve en la vista previa local.
- La Página lee la base desde `/mod/data/view.php`. La plantilla de lista es una tabla con el formato de la base Materias (una fila `tr.zk-registro` con `data-rid` por entrevista); cada campo va como texto en un elemento con `data-campo="…"`, y los que no se muestran (cuentas, `propuestas_json` y `acciones_json`) van en una celda oculta. **No usar atributos `data-*` para los campos:** Moodle no escapa las comillas del texto y un JSON o un motivo con comillas corta el atributo. Si se cambia la plantilla, subirla con `node .skills/publicar-seccion/subir_plantillas.js --clave entrevistas`.
- Para guardar, usa los `field_<id>` de la base (`CAMPOS_ENTREVISTAS`, 1339 a 1353). Si se recrean los campos, hay que actualizarlos.

## Pendiente

1. **Detección de roles** por grupo (ADM, TUT, PAR): hasta entonces todos entran como ADM y pueden gestionar cualquier entrevista.
2. **Lado del estudiante** (pedir, aceptar o contraofertar): no entra en el modelo reducido.

## Cómo verla en local

Abrir `content.html` en el navegador (`file://` o Live Server). Aparece la barra de vista previa para ver como ADM, TUT o PAR, con datos de prueba de los integrantes de Zhakyz. Lo que se guarda queda solo en la pantalla.
