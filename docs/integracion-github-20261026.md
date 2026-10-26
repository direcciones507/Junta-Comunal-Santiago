# Integración del portal y panel en GitHub

Fecha: 26 de octubre de 2026. Repositorio: `direcciones507/Junta-Comunal-Santiago`.

## Recuperación comprobada

- PR #3 real: abierto y sin fusionar; rama `ad507/task-ca3c61cb-6633-49be-a272-bd6d0b1a8143`, commit `673774eab048bc3fb4e58cb9658b2e20a1cf919f`.
- PR #4 real: contiene la primera administración. Su código forma parte de la ascendencia del PR #5.
- PR #5 real: rama `investigacion-institucional-20261026`; punto de partida `482b68f438bf894fdc21d3f43ef51f352488b2f6`. No era una promesa ni un enlace inexistente: sus archivos estaban en GitHub.
- Comparación con el código de Work revisado: index.html, styles.css, app.js, public-content.js, los tres archivos admin, server/index.mjs y db/schema.ts coincidían byte por byte. No se encontró una implementación principal que existiera exclusivamente en Work.
- GitHub Pages servía exactamente el index del PR #3 (huella SHA256 `2859b0449757101c3912f894bff188ced79fa09d911d00fa68b44701fdcd43b8`). La ejecución de Pages 39431187402 confirma esa rama y commit como origen de la vista anterior.

## Integración preparada

Se continúa el PR #5 con cambios aditivos, sin fusionar los PR anteriores, sin modificar `main` y sin sustituir la página institucional definitiva. El PR se presentará contra `main` para permitir revisar en un único conjunto el portal y panel heredados de #3/#4 más esta integración.

| Grupo | Archivos principales |
|---|---|
| Portal | `index.html`, `styles.css`, `app.js`, `public-content.js` |
| Imágenes autorizadas | `assets/logo-institucional.png`, `assets/parques-comunitarios.png` |
| Panel | `admin/index.html`, `admin/admin.js`, `admin/admin.css` |
| Acceso institucional | `admin/login.html`, `admin/login.js`, `server/institution-auth.mjs` |
| API y almacenamiento | `server/index.mjs`, `db/schema.ts`, `drizzle/`, `scripts/sqlite-adapter.mjs` |
| Ejecución independiente | `scripts/serve-institution.mjs`, `scripts/hash-admin-password.mjs`, `scripts/migrate-institution.mjs` |
| Vista de GitHub | `scripts/export-pages.mjs`, `admin/preview.js`; exportación reproducible con `revision.json` |
| Pruebas | `tests/admin.test.mjs`, `tests/institution-auth.test.mjs`, `tests/interaction-check.cjs`, `tests/responsive.html`, `tests/responsive.js` |
| Documentación | Investigación y fuentes anteriores, material autorizado, operación de servidor e informe de integración |

## Estado institucional

| Sección | Estado |
|---|---|
| Inicio | Presentación, accesos y antecedente ambiental con fuente; carrusel preparado, fotografías específicas pendientes |
| Quiénes somos | Antecedentes y reglamento conservados; misión, visión, fecha fundacional y organigrama siguen sin atribuir aprobación inexistente |
| Noticias | Módulo listo con aprobación; sin importar noticias antiguas como si fueran recientes |
| Proyectos | Ficha de limpieza/mantenimiento con texto e imagen autorizados; sin fechas ni estado inventado; solicitud futura identificada como no activa |
| Servicios | Mantenimiento de áreas verdes según información proporcionada; demás catálogo y requisitos pendientes |
| Transparencia | Reglamento, referencias y categorías conservados; panel admite PDF con aprobación |
| Contacto | Perfil y teléfono previamente documentados; dirección, horario habitual, correo y otras redes siguen pendientes |
| Identidad | Logo original conservado y encuadre compacto aplicado por CSS; no se generó otro logotipo |

## Pruebas y publicación

- Trece pruebas de integración PASS, incluyendo login propio sin ChatGPT, rechazo de encabezados falsos, sesión/cookies, revocación al salir, CSRF y limitación persistente de intentos.
- Pruebas existentes de menú/carrusel PASS. Sintaxis y compilación PASS.
- Navegador con ventanas internas de 390, 768 y 1366 px: logo y navegación inspeccionados, contenido sin desbordamiento horizontal en el contenedor principal; menú móvil abrió las siete secciones. Es revisión de anchos en navegador, no prueba física en Android.
- GitHub Pages publica solo estáticos: la copia del panel es una demostración expresamente señalada, no guarda ni solicita contraseñas. El panel real se ejecuta con `npm start` en infraestructura autorizada.
- La exportación lleva el commit y SHA256 de los archivos en `revision.json`, para cotejar la vista con GitHub.

El resultado de la publicación se documentará en el PR con el commit exacto de fuente, commit de vista y enlace comprobado. Si GitHub bloquea su construcción, no presentar un enlace antiguo como si contuviera los cambios nuevos.

## Nube gubernamental pendiente

Consultar `servidor-institucional.md`: identidad/cuenta institucional, infraestructura HTTPS autorizada, motor de base de datos, almacenamiento privado de objetos, migración revisada y respaldo/restauración. No se ejecutó ninguna transferencia de datos reales ni se configuró infraestructura productiva.

## Resultado verificado de publicación

- Código fuente integrado en GitHub: `1da2ad1df12537a82e0dc5890893d9beed54e9e3`, rama `investigacion-institucional-20261026`, PR #5 en borrador contra `main`.
- Vista nueva: https://direcciones507.github.io/Junta-Comunal-Santiago/revision-github-20261026/
- Demostración administrativa: https://direcciones507.github.io/Junta-Comunal-Santiago/revision-github-20261026/admin/
- Manifestación verificable de versión y huellas: https://direcciones507.github.io/Junta-Comunal-Santiago/revision-github-20261026/revision.json
- Commit que publica únicamente la subcarpeta de revisión en la rama de Pages existente: `8fdeba4afbd9a6634d56c1b831306d84cb4342ca`. No reemplaza el index anterior ni modifica main.
- Ejecución [Pages 40389290582](https://github.com/direcciones507/Junta-Comunal-Santiago/actions/runs/40389290582): SUCCESS. HTTP 200 y navegador real confirmaron logo, ficha de parques, fuentes y demostración administrativa.
- Se descargaron los nueve archivos del manifiesto (incluidos ambos PNG y la demostración del panel); sus SHA256 coincidieron con la exportación del commit fuente. El árbol de fuente de GitHub se comprobó recursivamente: 53 archivos, sin truncamiento, incluidos servidor, autenticador, migraciones y assets. La documentación de cierre puede añadir archivos posteriores sin cambiar el código de esa vista.
- CI general de GitHub: [ejecución 40389171551](https://github.com/direcciones507/Junta-Comunal-Santiago/actions/runs/40389171551) falló **antes de ejecutar pasos**, con anotación visible «The job was not started because your account is locked due to a billing issue». No se modificó facturación, no se contrataron runners ni se reintentó repetidamente. Esto se distingue de las trece pruebas locales aprobadas y del despliegue Pages exitoso.

La integración y vista GitHub están disponibles. La activación del panel operativo en la nube institucional sigue pendiente de infraestructura y credenciales autorizadas; GitHub Pages solo muestra su demostración visual. No se fusionaron los PR, no se trasladaron datos reales y no se publicó un dominio institucional definitivo.
