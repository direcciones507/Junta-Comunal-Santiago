# Validación del panel — 26 de octubre de 2026

## Automatizada
- `npm test`: 7 pruebas de integración Node/SQLite PASS. Identidad ausente y ajena denegadas; fijación de un solo administrador; acceso de servicio sin identidad denegado; todos los tipos/secciones; aprobación obligatoria; copia publicada aislada de borradores; conflictos de versión; retiro/archivado con historial; CSRF; formatos y tamaños; medios privados/públicos; recursos y cabeceras.
- `node tests/interaction-check.cjs`: PASS para menú/carrusel existentes (simulación DOM).
- Sintaxis de app.js, public-content.js, admin/admin.js, server/index.mjs: PASS.
- `npm run build` y `git diff --check`: PASS. Worker Fetch con siete recursos permitidos; sin dependencias de runtime.

## Vista privada y navegador real
URL: https://junta-santiago-revision.peppydill512.chatgpt.site/admin

- Despliegue de revisión privado exitoso; política de acceso conserva solo al propietario. Cuenta real autenticada accedió al panel.
- Noticia PRUEBA: crear → guardar → revisión → aprobar → publicar; apareció realmente en Noticias. Editar guardó un nuevo borrador mientras la página conservó el título/texto publicado anterior.
- Fotografía de prueba PNG 800×450: selector, decodificación/optimización a JPEG, almacenamiento, vista previa con naturalWidth=800/naturalHeight=450, guardado/revisión/aprobación/publicación en carrusel. Imagen real cargada correctamente.
- Sección Nosotros PRUEBA: guardar/revisar/aprobar/publicar cambió el título en la misma sección. Las siete anclas permanecieron: inicio, nosotros, servicios, noticias, proyectos, transparencia, contacto.
- Las tres pruebas se archivaron al terminar; dejaron de ser contenido visible. Auditoría conserva sus acciones. No se publicaron como información institucional.
- No se declara validación en teléfonos/tabletas Android físicos. CSS adaptable implementado (700/1000 px en panel, 760/1050 px en sitio); falta aceptación en esos dispositivos y auditoría externa de accesibilidad/seguridad.
- Una interrupción de la herramienta de navegador durante carga fue recuperada; después se verificó la carga y visualización real.

## GitHub Actions
Ejecución 40327097777 del primer commit del PR #4: FAILURE sin pasos ejecutados. Anotación del check 121586485958: “The job was not started because your account is locked due to a billing issue.”

No es un fallo de estas pruebas ni un pase de CI. Se ejecutaron localmente y en el empaquetado de la vista privada. No se modificó facturación, no se contrataron runners, no se fusionó el PR. Para CI remoto será necesario que el propietario resuelva el bloqueo de la cuenta o autorice un runner aislado existente, sin usar otros proyectos.

## Pendientes antes de producción
Aprobación institucional, contenido/fotos oficiales, administrador e identidad gubernamental definitivos, revisión de alojamiento/persistencia/costos, respaldo de base y objetos con ensayo de restauración, política de retención y limpieza de fotos huérfanas, pruebas en dispositivos y revisión de seguridad institucional. JSON exporta registros/metadatos; las imágenes necesitan su propio respaldo. No hay dominio institucional publicado.
