# RutaLibre — "La ciudad, para todas las personas."

**Equipo:** Error 404  
**Reto:** Reto 2 — "Ciudad para todas y todos"  
**ODS:** 11 — Ciudades y comunidades sostenibles  
**Licencia:** MIT ([LICENSE](LICENSE))

---

## Objetivo y Descripción

**RutaLibre** es una plataforma web accesible diseñada en español de México para ayudar a las personas a desplazarse por la ciudad de manera más informada. Permite consultar barreras urbanas y lugares con accesibilidad reportada, calcular rutas adaptadas a distintas necesidades de movilidad, generar reportes ciudadanos mediante fotografía, voz o texto, revisar avisos simplificados y dar seguimiento a cada folio.

---

## Tecnologías Utilizadas

- **HTML5** semántico (`lang="es-MX"`).
- **CSS3** responsive con variables, modo texto grande (200 %), alto contraste y `prefers-reduced-motion`.
- **JavaScript (ES6+ modular)** organizado en `js/` sin dependencias externas de compilación.
- **LocalStorage** para preferencias, perfil, folios, reportes, favoritos, rutas y plan editable.
- **IndexedDB** (`js/medios.js`) para almacenar fotografías comprimidas y notas de voz sin saturar `localStorage`.
- **APIs del navegador:** Geolocalización, `<canvas>` (compresión JPEG ≤1024 px al 70 % y eliminación de EXIF/GPS), Web Speech API (`speechSynthesis`, `SpeechRecognition`), `MediaRecorder` y Web Share API.
- **Gemini AI (`js/ia.js`):** integración opcional en sesión con fallback automático a **Modo Demostración**.

---

## Estructura de Archivos

```text
Hackaton-Fase-3/
├── index.html              # Punto de entrada principal
├── styles.css              # Diseño accesible WCAG 2.2 AA y responsive
├── js/
│   ├── main.js             # Arranque, router #hash y eventos globales
│   ├── estado.js           # Estado central en localStorage y respaldos JSON
│   ├── medios.js           # IndexedDB, compresión de foto y limpieza EXIF
│   ├── mapa.js             # Mapa SVG accesible, controles ↑↓←→ / +− y Cerca de ti
│   ├── rutas.js            # Grafo urbano y algoritmo de Dijkstra por perfil
│   ├── reportes.js         # Flujo de reporte, folios RL-AAAA-NNNNNN y Mis reportes
│   ├── voz.js              # Síntesis es-MX/es-*, dictado, grabación y Web Share
│   ├── ia.js               # Integración Gemini (JSON, timeout 15s) y modo demo
│   ├── admin.js            # Panel administrador sincronizado con Mis reportes
│   └── datos-demo.js       # Catálogos, lugares [Calle ejemplo], tramos y avisos
├── assets/
│   └── images/             # logo.svg y favicon.svg
├── docs/
│   └── screenshots/        # Capturas de pantalla de verificación
├── PLAN_DE_TRABAJO.md      # Plan de trabajo editable en Markdown
├── README.md               # Documentación del proyecto
└── LICENSE                 # Licencia MIT
```

---

## Roles de Usuario

1. **Ciudadano:** explora mapa y rutas, busca destinos, reporta barreras (foto/voz/texto), revisa folios, confirma si una barrera continúa o fue resuelta, consulta avisos y guarda lugares.
2. **Cuidador o acompañante:** configura necesidades de la persona acompañada, consulta rutas, comparte trayectos, usa lectura en voz alta y guarda lugares o rutas.
3. **Administrador (demostración):** accede al panel separado con métricas en vivo, revisa evidencias y análisis de IA, edita categoría, prioridad, dependencia `(ejemplo)`, estado y notas; todo cambio se refleja al instante en **Mis reportes**.

---

## Funciones Principales y Accesibilidad (WCAG 2.2 AA)

- **Barra de accesibilidad:** Texto grande, Alto contraste, Lectura en voz alta, Acceso sin visión (activable solo bajo solicitud para no interferir con NVDA/VoiceOver/TalkBack), Guía por voz y Reducir animaciones.
- **5 Perfiles rápidos** después del selector de rol + **Perfil completo** con 12 opciones de movilidad y 9 configuraciones de ruta.
- **Contraste verificado y foco doble:** Anillo de foco `2 px #0B1220` interno y `3 px #FACC15` externo. El amarillo `#FACC15` nunca se usa como texto ni borde sobre fondos claros.
- **Mapa accesible y Dijkstra:** Navegable con teclado y botones de desplazamiento/zoom (`↑ ↓ ← →`, `+ −`). Advierte explícitamente cuando un tramo tiene estado *"Sin información"*.
- **Privacidad:** Aviso de privacidad en lectura fácil, permisos explícitos antes de cámara/micrófono/ubicación, eliminación de EXIF/GPS en fotografías y botón **"Borrar todos mis datos"**.

---

## Integración con Gemini

- El nombre del modelo (`gemini-2.5-flash`) se define en una única constante en `js/ia.js`.
- Se utiliza en: **A)** análisis editable de reportes (JSON estructurado), **B)** simplificación de avisos urbanos y **C)** asistente de ayuda.
- No hay claves API incrustadas en el código fuente. De forma predeterminada opera en **Modo Demostración**, con campo opcional en **Perfil** para probar una clave temporal durante la sesión (con límite de 15 segundos y respaldo automático si falla o no hay red).

---

## Instalación y Cómo Ejecutar

> **Importante:** No abras `index.html` haciendo doble clic (`file://`), porque los módulos ES (`type="module"`), cámara, micrófono, geolocalización e IndexedDB requieren ejecutarse desde `localhost` o `HTTPS`.

Ejecuta un servidor local en la carpeta del proyecto con cualquiera de estas opciones:

```bash
# Opción 1: Node.js
npx serve .

# Opción 2: Python 3
python -m http.server 8080
```

En Windows (sin Python ni Node instalados) también puedes usar el servidor HTTP incluido en PowerShell o desplegar directamente la carpeta en **GitHub Pages** o **Netlify**.

Luego abre en Google Chrome o Microsoft Edge: `http://localhost:8080`.

---

## Cómo Utilizar

1. Elige un **Rol activo** arriba o usa uno de los **5 Perfiles rápidos**.
2. Entra a **Mapa**, selecciona un destino en *Cerca de ti* y presiona **Cómo llegar** para calcular la ruta con Dijkstra.
3. Entra a **Reportar**, adjunta foto o descripción, presiona **Analizar reporte**, ajusta si lo deseas y envía para recibir tu folio `RL-AAAA-NNNNNN`.
4. Cambia al rol **Administrador (demostración)** para gestionar reportes y observa la actualización inmediata en **Mis reportes**.

---

## Datos de Demostración y Limitaciones

- Todos los lugares (`[Calle ejemplo]`), avisos (*Fuente de demostración — Aviso ficticio*) y dependencias (`(ejemplo)`) son **ficticios**.
- **Sin backend real:** los reportes no se envían a dependencias gubernamentales reales y permanecen únicamente en el navegador donde se crearon.
- **Compatibilidad de voz:** el reconocimiento de voz (`SpeechRecognition`) funciona de forma óptima en Chrome y Edge, es limitado en Safari y no está disponible en Firefox (donde se mantiene el respaldo de texto y grabación).
- **Emergencias:** el botón 911 es únicamente informativo y no realiza ni simula llamadas.

---

## Plan de Trabajo

Consulta [PLAN_DE_TRABAJO.md](PLAN_DE_TRABAJO.md) o la pestaña **Plan de trabajo** dentro de la aplicación web.
