# Plan de Trabajo — RutaLibre

**Proyecto:** RutaLibre  
**Equipo:** Error 404  
**Reto:** Reto 2 — "Ciudad para todas y todos" (ODS 11: Ciudades y comunidades sostenibles)  
**Frase principal:** *"La ciudad, para todas las personas."*

> Nota: También puedes editar esta tabla dentro de la sección **Plan de trabajo** en la aplicación y descargar una copia actualizada con el botón **Exportar como Markdown**.

| Etapa | Actividad | Descripción | Responsable | Prioridad | Horas est. | Fecha límite | Depende de | Criterio de terminado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Planeación | Definir MVP y modelo de datos | Lista MoSCoW, 8 secciones, 12 opciones, 9 configuraciones, esquemas y formato de folio. | [Integrante 1 - Líder] | Debe tener | 2 h | Día 1 | — | Alcance y esquemas cerrados | Completado |
| Planeación | Cronograma, repositorio y riesgos | Nombres reales, fechas, Git con ramas y plan B. | [Integrante 1 - Líder] | Debe tener | 1 h | Día 1 | — | Repo inicializado y riesgos | Completado |
| Privacidad | Privacidad y ética | Aviso de privacidad, permisos, limpieza EXIF, borrar datos y datos ficticios marcados. | [Integrante 2 - A11y/JS] | Debe tener | 2 h | Día 1 | Modelo de datos | EXIF limpio y control total | Completado |
| Diseño UX/UI | Identidad visual y accesibilidad WCAG 2.2 AA | Paleta verificada, foco doble, contraste, íconos SVG y modos visuales. | [Integrante 3 - UX/UI] | Debe tener | 3 h | Día 1 | MVP | Contraste >= 4.5:1 validado | Completado |
| Desarrollo | Estructura `index.html` y `styles.css` | Semántica `es-MX`, skip link, perfiles rápidos, menú, panel accesibilidad y responsive. | [Integrante 3 - Frontend] | Debe tener | 4 h | Día 1 | Diseño UX/UI | HTML válido y responsive | Completado |
| Desarrollo | IndexedDB y compresión de medios | Guardar fotos y audio fuera de `localStorage`; reducir fotos y quitar EXIF. | [Integrante 2 - JS] | Debe tener | 3 h | Día 2 | Estado central | Fotos y audio en IndexedDB | Completado |
| Funcionalidades | Mapa SVG accesible y rutas Dijkstra | Botones ↑↓←→ / +−, filtros, Cerca de ti, detalle y Dijkstra según perfil. | [Integrante 1 - Full-Stack] | Debe tener | 5 h | Día 2 | Datos demo | Rutas varían según perfil | Completado |
| Funcionalidades | Reportes, foto, voz, IA y Admin | Flujo completo, folio `RL-AAAA-NNNNNN`, Mis reportes, Avisos, Ayuda y Panel admin. | [Integrante 4 - IA/Full-Stack] | Debe tener | 6 h | Día 2 | Medios y estado | Sincronía Admin <-> Mis reportes | Completado |
| Integración | Exportar, importar y restablecer datos | Respaldo de reportes en JSON, exportar plan Markdown y reinicio de demo. | [Integrante 2 - JS] | Debería tener | 2 h | Día 3 | Estado central | JSON y Markdown válidos | Completado |
| Pruebas | Auditoría funcional y de accesibilidad | Pruebas en localhost, teclado, 200%, contraste, axe/Lighthouse/WAVE/W3C y navegadores. | [Integrante 4 - QA] | Debe tener | 3 h | Día 3 | Todas las funciones | Capturas y evidencia lista | En proceso |
| Entrega | Pitch, demo y documentación | `README.md`, `LICENSE`, guion 3-5 min, video respaldo y respuestas para jurado. | [Equipo Error 404] | Debe tener | 3 h | Día 3 | Pruebas | Demo ensayada y publicada | En proceso |
