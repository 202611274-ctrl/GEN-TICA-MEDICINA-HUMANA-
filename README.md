# Genética · Aula de práctica

Aplicación estática de estudio, en español, inspirada en Medicina Humana de la Universidad Ricardo Palma. Proyecto estudiantil independiente; no es una plataforma oficial de la universidad.

## Abrir y publicar

Abre `index.html` en un navegador, conservando las carpetas al lado. No requiere npm, Firebase, una API ni un proceso de compilación. Para PWA/offline y almacenamiento bajo un origen estable, sírvela por HTTPS (GitHub Pages) o localhost.

La guía visual completa está en `docs/GUIA_GITHUB.html`.

En GitHub: crea un repositorio público, sube el contenido de esta carpeta a la raíz y configura Settings → Pages → Deploy from a branch → main → /(root). No subas solamente el ZIP. Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Funciones implementadas

- Teoría y laboratorio, siete semanas de genética y anexo separado.
- Práctica con preguntas de una respuesta, varias respuestas y respuestas abiertas autoevaluadas.
- Orden aleatorio de opciones con corrección por índices estables.
- Contexto de casos, explicaciones, diferencias clave, notas de adaptación y referencias.
- Simulacro cronometrado con corrección diferida y nota objetiva sobre 20.
- Repaso por intervalos, favoritos, errores, progreso real y ruta de 21 días.
- Simuladores de cruces autosómicos, dosis CNV y selección de pruebas.
- Editor de preguntas, revisión de pendientes, importación JSON/CSV y Google Sheets CSV público con confirmación.
- Exportación de banco o `bank.js`, respaldo del estado y restauración validada.
- Service worker bajo el ámbito del proyecto. Sin conexión después de cargar recursos por HTTPS.
- Interfaz adaptable, navegación por teclado, respeto a reducción de movimiento y contraste intencional.

## Material incorporado

205 registros: 143 del banco de teoría, 51 de laboratorio y 11 de pizarras. De ellos, 178 están habilitados, 22 quedan pendientes y 5 son complementarios fuera de la Unidad I. Esto no representa 205 preguntas originales únicas de exámenes: el banco incluye adaptaciones, complementos y registros aún por confirmar.

Los materiales de teoría incluyen variantes normalizadas de exámenes 2021, 2022, 2023, 2024 y otras compilaciones. La procedencia se conserva por pregunta. Las tareas 4 y 7 completas no se recibieron. Los registros de pizarras no se habilitan hasta validar su texto y clave; no se publican fotos de las personas en clase.

El sílabo 2026-II sitúa la genética en semanas 1–7; la semana 8 es el examen. Las asignaciones de pizarras son temáticas, no confirmaciones de fecha.

La nomenclatura p.Trp57Ter se aclaró: Trp es el aminoácido de referencia sustituido por STOP, no el último aminoácido que necesariamente permanece. Se conservaron pendientes algunas claves sobre ClinGen, familiares y protocolos terapéuticos. Véanse fuentes y motivos por registro. No se afirma validación clínica integral del banco.

## Archivos

- `index.html`: entrada y estructura.
- `assets/style.css`: diseño y adaptación.
- `assets/core.js`: intervalos, validación y utilidades puras.
- `assets/app.js`: vistas, interacción y guardado local.
- `data/bank.js`: datos que carga la web, también al abrir el archivo local.
- `data/banco.json`: copia legible de los datos iniciales.
- `sw.js`, `manifest.webmanifest`, `assets/icon-*`: modo instalable/offline.
- `docs/GUIA_GITHUB.html`: instrucciones de publicación y uso.

## Ampliar datos

La interfaz descarga plantillas y valida las importaciones antes de aplicarlas. Esquema mínimo:

```json
{"id":"MI-Q-001","module":"teoria","week":3,"topic":"Herencia","type":"single","stem":"Pregunta…","options":["A","B"],"correct":[1],"answer":"B","explanation":"Por qué…","trap":"Qué distinguir…","source":"Clase / material","status":"active"}
```

`correct` empieza en cero. `module`: `teoria` o `laboratorio`. `type`: `single`, `multi`, `recall`; las pendientes también aceptan `pending`. `status`: `active`, `pending`, `annex`. `week`: 1–7; 0 para anexo. Para CSV, los arreglos se escriben como JSON en la celda.

Los IDs se conservan al actualizar una pregunta. Los datos importados no se ejecutan como HTML. Las importaciones reemplazan los IDs coincidentes tras confirmación y reinician sus fechas de repaso; conservan el historial anterior. Exportar bank.js incluye el banco compartible, sin notas privadas ni progreso. Sustituye `data/bank.js` y actualiza también `data/banco.json` si deseas que la copia legible siga al día.

## Guardado y límites

- localStorage es local al navegador, dispositivo y origen web. No se sincroniza automáticamente.
- El respaldo restaura preguntas, historial, notas, favoritos y plan. No reanuda sesiones en curso al importar; para retomarlas usa el mismo navegador.
- Se puede seguir una sesión después de recargar el navegador; el reloj del simulacro conserva su fecha límite.
- Un error se programa a 10 minutos. Respuestas correctas avanzan desde 1 a 3, 7 y más días según la valoración. Es un algoritmo sencillo propio, no FSRS ni una integración con Anki.
- Las respuestas abiertas son autoevaluadas y se excluyen de la nota objetiva.
- La selección de teoría y laboratorio usa únicamente material habilitado. Las pendientes no se puntúan.
- Las nuevas fuentes (audio, PPT, imágenes) deben transcribirse/revisarse fuera de esta aplicación. No incorpora un servicio de IA.
- Las consultas externas y Google Sheets necesitan conexión. El CSV debe ser público y accesible con CORS; también puede importarse descargándolo.
- Los puntos y la nota son indicadores de práctica, no predicción de la nota del curso.
- El repositorio y banco en GitHub Pages son públicos. No subas respaldos ni datos personales.

## Desarrollo local opcional

Desde esta carpeta: `python -m http.server 8080`. Abre `http://localhost:8080`.

Verifica sintaxis con `node --check assets/app.js` y `node --check assets/core.js`.

El código funciona sin dependencias externas ni fuentes remotas. Para cambios de recursos precargados, aumenta la versión de caché de `sw.js`. El servicio realiza solicitudes a la red cuando está disponible y usa la copia guardada al fallar la conexión. Las actualizaciones del trabajador se activan después de cerrar todas las pestañas anteriores.
