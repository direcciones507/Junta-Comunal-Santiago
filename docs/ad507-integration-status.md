# AD507 Developer: runner de Junta Comunal

Estado: pendiente de integración con el controlador Railway.

El workflow actual `junta-static-checks.yml` verifica archivos, sintaxis JavaScript, navegación y controles del carrusel en este repositorio público. La ejecución #39356129046 terminó correctamente.

Este workflow todavía no es el ejecutor remoto autenticado de AD507 Developer. No debe presentarse como tal.

Para activarlo se necesita comprobar que cada trabajo corresponda al repositorio, workflow, referencia y commit autorizados; asociar la respuesta a la tarea exacta; impedir que se ejecuten instrucciones de terceros sin aislamiento; y aplicar límites de consumo separados de LEVEIA.

Criterio de aceptación: una tarea iniciada desde el panel de AD507 Developer produce una comprobación verificable en el repositorio de la Junta, sin lanzar ejecuciones privadas en LEVEIA. El PR #3 no se fusiona ni se publica automáticamente.
