# Verificación de esta versión

Se superaron 15 comprobaciones de datos, lógica e integración simulada con Node.js:

- 205 registros con identificadores únicos, esquemas válidos y 178 activos.
- Claves consistentes después de mezclar opciones y corrección de conjuntos de respuestas múltiples.
- Intervalos de repaso y reinicio tras error.
- CSV con comillas, comas y saltos de línea; rechazo de archivos inválidos.
- Respaldo y restauración de progreso y apuntes.
- Renderizado de las vistas con un adaptador DOM controlado.
- Simuladores de cruce, CNV y selección de pruebas.
- Registro de una sola respuesta por intento; respuestas abiertas excluidas de la nota.
- Preguntas pendientes excluidas de prácticas.
- Simulacro con corrección diferida y contabilización de preguntas no respondidas.
- Filtros de errores y favoritos; guardado del plan y de apuntes.

Además se comprobó la sintaxis JavaScript y la existencia de los recursos locales.

La revisión visual y de interacción en un navegador real se interrumpió y no se completó. La instalación PWA, el uso offline, la importación de una hoja real de Google Sheets y la publicación efectiva en GitHub Pages quedan por comprobar en el navegador del usuario. No hay una web pública desplegada en esta entrega.

Para repetir las comprobaciones lógicas: `node tests/check.cjs` desde la carpeta del proyecto. El adaptador DOM simula eventos; no sustituye una prueba visual.
