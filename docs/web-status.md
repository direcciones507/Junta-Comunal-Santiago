# Estado de la web — 20 de octubre de 2026

## Base revisada
PR #3, rama ad507/task-ca3c61cb-6633-49be-a272-bd6d0b1a8143, base de trabajo c4f829c. main solo contiene README.md. No existen avances web posteriores al PR #3 en otros PR encontrados.

Existían siete secciones, navegación por anclas, menú móvil, carrusel de textos y comprobaciones estáticas. No existían imágenes oficiales, servidor, persistencia, autenticación ni panel de contenidos. Las declaraciones color/background sobre :root son CSS válido; no eran un error.

## Mejoras
Fondo blanco conservado; jerarquía tipográfica, cabecera, tarjetas y espacio principal del carrusel mejorados. No se agregó una fila de fotos inferior ni contenido institucional inventado. Vista previa identificada y marcada noindex. Menú disponible sin JavaScript; cierre con Escape y al cambiar de tamaño; foco visible y enlace para saltar al contenido. Carrusel manual con flechas de teclado, indicador actual y anuncio accesible, sin rotación automática. Los espacios de fotografías siguen pendientes: no debe presentarse como un carrusel fotográfico terminado.

## Administración prevista (pendiente de implementar)
Reutilizar este repositorio y una única fuente de contenidos. Un administrador inicial autenticado podrá crear borradores, cargar fotografías, revisar y aprobar. Estados: borrador → en revisión → aprobado/publicado; rechazado vuelve a borrador. La web pública solo debe leer contenido aprobado. La aprobación y el control de acceso deberán aplicarse en servidor; no basta ocultar botones en JavaScript. Registrar autor, fechas, cambios y aprobación. Permitir retirar una publicación sin perder su historial.

Carga de fotos: selección múltiple, previsualización, texto alternativo, orden, compresión y validación de formato/tamaño en servidor. No admitir archivos ejecutables ni publicar originales automáticamente. Confirmar almacenamiento y presupuesto antes de provisionar recursos. No existe CMS que pueda reutilizarse todavía; evitar crear un segundo panel o depender de otro proyecto.

## Vista previa y publicación
No se encontró servicio Railway de la Junta entre los servicios revisados. Los proyectos restantes corresponden a productos excluidos del alcance; no se modificaron. No se provisionaron recursos ni se habilitó un dominio. No hay enlace HTTPS verificado. La página puede servirse como archivos estáticos; para una vista previa externa hace falta habilitar un alojamiento autorizado sin costo adicional comprobado. No usar producción de otros proyectos.

## Pendientes para completar
1. Incorporar fotografías autorizadas y textos alternativos al carrusel.
2. Validar textos, servicios, contacto, documentos e identidad institucional; no añadir autoridades sin fuente oficial.
3. Implementar la administración descrita con aprobación real y almacenamiento persistente dentro del mismo proyecto.
4. Habilitar vista previa HTTPS y verificar en tablet Android real; las emulaciones no sustituyen esa comprobación.
5. Aprobar el PR antes de fusionar; publicación institucional por separado.

## Pruebas de esta revisión
- `node --check app.js`: PASS.
- Comprobaciones existentes de siete destinos, anclas y controles: PASS.
- `node tests/interaction-check.cjs`: PASS (menú, Escape/foco, selección de enlace, cambio de tamaño; carrusel anterior/siguiente/ciclo/paginación/teclado/estado actual). Simulación DOM, no navegador.
- Playwright: no ejecutado; navegador ausente y descarga fallida (archivo truncado/no ZIP). No se afirma verificación visual, de diseño responsive o de Android real.
