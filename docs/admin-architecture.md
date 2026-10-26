# Administración institucional — rama de revisión, 26 de octubre de 2026

## Base y alcance
Se conserva la web del PR #3 (673774e): fondo blanco, azul/amarillo, siete secciones, navegación y carrusel manual. `main` no se modifica ni se fusiona. La vista previa privada existente se reutiliza; no se modifica GitHub Pages ni un dominio institucional. No hay llamadas a Direcciones507, LATAM, ReportaPA, LEVEIA ni Railway.

## Aplicación
`server/index.mjs` exporta un manejador estándar Fetch. `scripts/build.mjs` incorpora una lista explícita de recursos estáticos; jamás sirve el repositorio, variables, base de datos o archivos de desarrollo. El panel `/admin` utiliza la misma API que el sitio. No hay claves ni autorización en almacenamiento del navegador.

La vista privada usa el inicio de sesión administrado por Sites. Su política de acceso mantiene al propietario como único usuario permitido, sin grupos ni invitados. `ADMIN_EMAIL` (valor de configuración privado) limita la cuenta, y la tabla `administrator` fija su identificador estable en el primer acceso autenticado. Las peticiones sin identidad, incluso con acceso de servicio sin usuario, no administran contenidos. No hay registro de cuentas ni contraseña compartida.

IMPORTANTE: los encabezados `oai-authenticated-user-*` SOLO se confían detrás del gateway de Sites, que autentica al visitante y reemplaza encabezados de identidad. `AUTH_PROVIDER=sites` no debe activarse en un servidor expuesto directamente. Para la nube institucional se debe conectar un proveedor OIDC gubernamental/gateway verificado, eliminar encabezados entrantes falsificables y mapear el único sujeto autorizado. Hasta entonces la aplicación falla cerrada sin configuración. No se implementa ni promete todavía una integración gubernamental.

## Publicación y auditoría
Estados: borrador → revisión → aprobado → publicado. Son acciones separadas, comprobadas en servidor. Con un solo administrador, la misma persona revisa y aprueba; NO es separación de funciones entre dos personas. Todas las acciones incluyen actor, fecha y copia del contenido en el historial. Ediciones invalidan la aprobación. La copia publicada (`live`) permanece igual durante las ediciones; la API pública solo devuelve esas copias. Retirar y eliminar quitan inmediatamente la copia pública. Eliminar es archivado lógico, conserva historial; no hay purga.

Las escrituras tienen versión y comparación optimista dentro de una transacción. La sección activa es única por ancla. Se preservan las siete anclas y se aplican título, texto y fotografía aprobados. Los cuatro tipos de publicación aparecen en Noticias, identificados por tipo. Las diapositivas aprobadas tienen fotografía, título, texto alternativo y orden; carrusel manual accesible por teclado, sin reproducción automática. El texto adicional de una diapositiva queda guardado en el registro y en la exportación.

## Datos y fotografías
Vista privada: SQLite compatible con D1 para registros y almacenamiento de objetos R2 para imágenes, declarados en el manifiesto de alojamiento. No se crea un servicio Railway ni se contratan planes. Son adaptadores, no dependencias de dominio. Esquema Drizzle y migraciones SQL versionadas. El adaptador Node/SQLite de referencia está en `scripts/sqlite-adapter.mjs`, usado en pruebas. No ejecutar migraciones desde solicitudes de producción.

Fotografías: JPEG/PNG, máximo 3 MB cada una; navegador decodifica, reduce a 1600 px, reexporta JPEG y elimina EXIF. Servidor vuelve a validar firmas y tipo; rechaza SVG/HTML/ejecutables. Texto alternativo obligatorio. Los objetos con referencias solo en borradores requieren administrador; solo fotografías referenciadas en copias publicadas son públicas. No hay listado público de originales. Límite de revisión: 200 archivos/100 MB, sin eliminación física automática. Para producción se necesita política de retención y limpieza de cargas huérfanas; no se promete un antivirus ni inspección editorial automática.

Exportación administrativa JSON v1 incluye registros, versiones vivas, metadatos de imágenes y auditoría. Para una migración completa se deben exportar también los objetos por sus UUID desde el proveedor. La interfaz advierte que el JSON no incluye los bytes. No hay importación automática ni respaldo programado todavía. SQL es portable a SQLite; PostgreSQL requiere un adaptador y migración revisada. No hay dependencia rígida de Railway.

## Seguridad
Autorización en cada ruta administrativa y medios privados; sin CORS abierto. Mutaciones solo POST JSON (o bytes de foto), Origin idéntico y encabezado propio contra CSRF. Texto insertado con textContent, sin HTML arbitrario. CSP sin scripts inline/eval, no-sniff, no-store, frame denial, permisos de cámara/micrófono/geolocalización desactivados. TLS y sesiones se delegan al proveedor de identidad/alojamiento. Restricción a un usuario reduce superficie; no sustituye las políticas institucionales de MFA, auditoría centralizada y respuesta a incidentes.

## Revisión y puesta en producción
- Abrir `/admin` en la vista privada existente y acceder con la cuenta propietaria autorizada.
- Crear contenido, guardar, enviar a revisión, aprobar y publicar; comprobar `/`.
- Publicar aquí solo modifica esta vista privada; no publica en GitHub Pages ni dominio institucional.
- Autorizar y revisar PR antes de fusionar. Aprobación institucional separada para cualquier dominio público.
- Confirmar titular administrador, identidad institucional, MFA, fotografías/textos autorizados, infraestructura/costos, almacenamiento persistente, respaldos con ensayo de restauración y retención.
- Validar sobre dispositivos Android reales y requisitos de accesibilidad/seguridad gubernamentales. No se declara certificación.

## Operación y reversión
Conservar el despliegue estático anterior de la vista privada (versión 1) y versiones de servidor posteriores. Volver a una versión guardada NO debe borrar D1/R2. Migraciones son aditivas; no se revierten ni se vacían registros. Los datos de pruebas de navegador deben quedar identificados como PRUEBA y archivados al terminar. No colocar datos sensibles reales en esta vista de revisión.

## Desarrollo
Node 24. `npm ci`; `npm test`; `node tests/interaction-check.cjs`; `npm run build`. `npm run db:generate` genera migraciones desde `db/schema.ts`; revisar el SQL antes de publicar. `npm run dev` sirve la web y adaptador local sin fabricar identidad; para sesión real utilizar el enlace privado. Nunca subir `.data`, `.env` o node_modules.
