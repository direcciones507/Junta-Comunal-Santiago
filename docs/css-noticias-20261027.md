# Corrección CSS de revisión · 27 de octubre de 2026

Base: 8533fcd. Se conserva el trabajo de investigacion-institucional-20261026 y sus actividades recuperadas.

Único archivo funcional modificado: revision-github-20261026/styles.css.
Noticias ocupa el ancho completo; columnas CSS con break-inside:avoid y orden DOM intacto. Dos columnas desde 1101 px; una centrada hasta 1100 px. Se unifican bordes, márgenes y títulos; fotografías con altura automática y contain. Proyectos ocupa el mismo ancho disponible.

Pruebas en navegador con marcos de 390,768,1024,1440 px: sin overflow; 1,1,1,2 columnas; seis fotografías de noticias/proyectos cargadas. Todos los HTML, JS, textos, enlaces, fotografías y archivos raíz permanecen byte a byte intactos. No cambios ADMIN ni de servidor. No prueba física Android.

La vista estática existente no ejecuta el CMS. La compatibilidad con contenido dinámico se conserva por selectores .publication y #news-list, sin modificar JavaScript; no se ha probado aquí un servidor ADMIN activo.
