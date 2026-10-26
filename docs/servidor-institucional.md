# Servidor institucional y futura nube gubernamental

## Alcance implementado

`npm start` utiliza Node 24+, el mismo portal, API y panel. Incluye un autenticador propio que no depende de ChatGPT: cuenta administrativa única configurada en el entorno, contraseña derivada mediante scrypt, sesiones aleatorias almacenadas solo como huellas en SQL, vencimiento de ocho horas, cierre de sesión que revoca el token, cookies HttpOnly/Secure/SameSite Strict y control CSRF por origen canónico y encabezado de aplicación. Los intentos de acceso tienen una ventana persistente de cinco intentos en quince minutos. No existe registro público ni contraseña inicial.

Referencias técnicas consultadas: [Node crypto](https://nodejs.org/api/crypto.html) y [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Se utiliza scrypt N=131072, r=8, p=1, sal aleatoria de 16 bytes y comparación de tiempo constante. Las pruebas usan una cuenta desechable de ejemplo, que no se instala en el servidor.

## Activación futura, no ejecutada

1. La institución designa un administrador y un responsable de infraestructura. Configura HTTPS y un directorio/volumen persistente privado; no guardar base ni objetos en el directorio público.
2. Definir en el gestor de secretos del host `PUBLIC_ORIGIN` (origen HTTPS exacto sin barra final), `ADMIN_EMAIL`, `ADMIN_SUBJECT` (identificador estable), `ADMIN_PASSWORD_HASH`, `JCS_DATA_DIRECTORY` y `NODE_ENV=production`.
3. Generar el hash con `node scripts/hash-admin-password.mjs`, entregando la contraseña por stdin desde un mecanismo privado. No pasar la contraseña por argumentos del shell, no subir hash/clave a GitHub y no reutilizar la contraseña personal de GitHub o ChatGPT.
4. Respaldar SQL y archivos antes de una instalación existente. Ejecutar migraciones explícitamente mediante `node scripts/migrate-institution.mjs`; en producción exige `JCS_MIGRATION_APPROVED=1`. El arranque productivo no aplica migraciones automáticamente.
5. Ejecutar el proceso como usuario sin privilegios detrás de un proxy TLS, con acceso restringido a su volumen. Aplicar controles institucionales de cifrado, monitoreo, actualizaciones y recuperación.
6. Revisar acceso, carga de archivos, aprobación, publicación y recuperación con material de prueba. La contraseña no se configura ni se envía en esta tarea.

El modo HTTP local solo se permite explícitamente mediante `JCS_ALLOW_LOCAL_HTTP=1` y un origen local. Nunca usarlo para producción. El modo QA admite encuadre del portal público solo en el host local sin autenticación; el servidor productivo y el manejador de la API conservan bloqueo de encuadre.

## Conexión a infraestructura gubernamental

| Componente | Referencia en el repositorio | Pendiente institucional |
|---|---|---|
| Identidad | `AUTHENTICATOR(request) → {subject,email}` | Integrar OIDC/gateway gubernamental verificado si está disponible; sustituir el adaptador propio, conservar administrador único |
| Base de datos | SQL SQLite y migraciones Drizzle; adaptador de pruebas/Node | Confirmar motor admitido. PostgreSQL requiere un adaptador y migración revisados; no es un cambio de URL automático |
| Imágenes y PDF | Interfaz `BUCKET.put/get/delete`; Node usa directorio privado | Conectar almacenamiento de objetos institucional o volumen persistente, límites y retención |
| Publicaciones | Borrador, revisión, aprobación, copia publicada e historial | Confirmar responsables, criterios editoriales y recuperación |
| Respaldos | Exportación JSON existente y archivos del volumen | Respaldar SQL coherente y bytes de todos los objetos; cifrado, retención y ensayo de restauración |
| Dominio/TLS | Origen canónico por configuración | Dominio autorizado, certificado y proxy del entorno estatal |

La aplicación no confía en encabezados de identidad enviados por el visitante cuando usa el proveedor institucional. La compatibilidad `AUTH_PROVIDER=sites` solo corresponde al gateway de la vista temporal, nunca a un servidor expuesto directamente.

## Relevo de administrador

Cambiar correo/contraseña en el gestor de secretos, revocar las sesiones activas por mantenimiento y conservar el identificador institucional estable y la auditoría. Si cambia el identificador, revisar también la vinculación de la tabla `administrator` mediante un procedimiento autorizado. No borrar ni recrear la base. El relevo no necesita acceso a la cuenta personal de ChatGPT del administrador anterior.

## Límites

El código está preparado y probado localmente; no se ha creado un servidor, contratado almacenamiento, copiado información real, emitido credenciales ni conectado la nube gubernamental. Faltan revisión de seguridad institucional, política de MFA/OIDC, respaldos verificados y aceptación en dispositivos físicos. Los controles básicos de PDF no sustituyen antivirus ni sanitización completa.
