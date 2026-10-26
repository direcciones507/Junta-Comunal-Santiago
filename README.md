# Junta Comunal de Santiago

Portal y administración de la Junta Comunal del corregimiento de Santiago, Veraguas. Código integrado de los PR #3, #4 y #5; no se ha fusionado `main` ni publicado un dominio institucional definitivo.

## Dos formas de revisión

- **GitHub Pages:** exportación estática del portal y demostración visual del panel. No ejecuta base de datos, autenticación ni cargas. `npm run preview:export` genera `pages-preview/` y `revision.json` con commit y huellas de archivos; solo contiene material autorizado.
- **Servidor institucional:** `npm start` ejecuta el portal, API y panel en Node 24+, con almacenamiento local persistente de referencia y acceso propio. No necesita una cuenta de ChatGPT. La activación en infraestructura gubernamental está pendiente y no se realiza en esta tarea.

## Desarrollo y pruebas

`npm ci`, `npm test`, `node tests/interaction-check.cjs`, `npm run dev`. Sin credenciales configuradas la web puede revisarse y el panel deniega operaciones. `/__preview/responsive` es una herramienta local de revisión de anchos de pantalla, excluida del host productivo.

## Configuración del servidor autorizado

Consultar [operación institucional](docs/servidor-institucional.md). Variables del entorno del servidor: `PUBLIC_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_SUBJECT`, `ADMIN_PASSWORD_HASH`, `JCS_DATA_DIRECTORY`, `NODE_ENV=production`. El repositorio no contiene contraseñas, credenciales ni sesiones. No usar contraseñas de pruebas ni colocar secretos en GitHub Pages.

El adaptador de Sites se conserva únicamente para compatibilidad con la vista temporal de desarrollo. El servidor institucional usa el adaptador propio y rechaza encabezados de identidad de ChatGPT. La integración gubernamental OIDC puede reemplazar el autenticador detrás de la misma interfaz.

## Contenido y evidencias

- [Investigación y fuentes](docs/investigacion-20261026.md).
- [Integración en GitHub y estado de las secciones](docs/integracion-github-20261026.md).
- [Material autorizado](docs/contenido-autorizado.md).

Conservar aprobación editorial, documentos y referencias. La imagen de parques es ilustrativa; no acredita una jornada ni una obra finalizada. No se ha acreditado fecha de fundación institucional.
