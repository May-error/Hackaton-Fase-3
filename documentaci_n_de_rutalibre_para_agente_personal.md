# RutaLibre - Documentación Funcional y Técnica para Agente Personal

## 1. Visión General y Propósito
**RutaLibre** es una aplicación móvil de movilidad urbana accesible e inclusiva bajo el lema *"La ciudad, para todas las personas"*. Su objetivo principal es permitir que personas con diversas discapacidades o necesidades específicas de movilidad puedan desplazarse con seguridad, autonomía y confianza por la ciudad. 

La aplicación combina mapas colaborativos, alertas urbanas en tiempo real, asistencia por Inteligencia Artificial (impulsada por **Gemini**), navegación adaptada y protocolos de emergencia multimodales.

---

## 2. Perfiles de Usuario y Personalización de Barreras
Al configurar la app, el usuario define su perfil seleccionando una o más condiciones de movilidad. El sistema filtra rutas, alertas y riesgos basándose en estas selecciones:

*   **Silla de ruedas:** Evita escalones, busca rampas funcionales y elevadores activos.
*   **Bastón o andadera:** Evita desniveles pronunciados y banquetas rotas.
*   **Baja visión o ceguera:** Prioriza rutas con guías táctiles, cruces con señalización sonora y activa asistencia descriptiva por voz.
*   **Carriola:** Busca rampas y evita pasos estrechos.
*   **Persona mayor:** Optimiza rutas evitando distancias excesivamente largas o trayectos sin puntos de descanso.
*   **Personas con Sordoceguera:** Activa un modo de interacción basado exclusivamente en tacto, vibración y dispositivos Braille.

---

## 3. Funcionalidades Principales

### 3.1. Planificación de Rutas y Validación de Destinos ("¿Puedo llegar?")
*   **Evaluación previa a la salida:** Antes de iniciar un viaje, la app confirma si el destino es accesible para el perfil del usuario (ej. *"Sí puedes llegar en silla de ruedas, por una ruta sin escalones"*).
*   **Información detallada del destino:** Muestra datos verificados por la comunidad sobre la infraestructura del lugar (ej. entrada sin escalones, estado de elevadores internos, disponibilidad de baños accesibles) con marca de tiempo de la última verificación.
*   **Enrutamiento Inteligente:** Si la ruta más corta presenta una barrera (ej. una rampa bloqueada), la app recalcula automáticamente una ruta alternativa segura, indicando la diferencia de tiempo y distancia (ej. *"4 min más que la ruta corta, pero puedes recorrerla completa"*).
*   **Indicaciones granulares:** Especifica detalles como caminar por banquetas anchas, cruzar en semáforos con rampas en ambos lados o usar accesos laterales sin escalones.
*   **Compartir trayecto:** Permite enviar el recorrido en tiempo real a terceros.

### 3.2. Mapa Interactivo y Reportes Ciudadanos con IA (Gemini)
*   **Visualización de estado:** El mapa muestra puntos verificados como **Accesibles** (verde) y **Barreras** (rojo/naranja con nivel de riesgo: ej. *Riesgo alto*).
*   **Creación de reportes sin escribir:** Los usuarios pueden reportar obstáculos en 3 pasos: tomar una foto, agregar ubicación automática y grabar una nota de voz (ej. *"Hay un puesto encima de la rampa y no puedo bajar a cruzar"*).
*   **Procesamiento con Gemini:** La IA analiza la foto y el audio del usuario para estructurar automáticamente el reporte:
    *   Clasifica la barrera (ej. *Rampa obstruida*).
    *   Evalúa el nivel de riesgo (ej. *Alto: impide cruzar*).
    *   Determina a qué perfil afecta (ej. *Silla de ruedas*).
    *   Identifica la dependencia gubernamental o entidad responsable (ej. *Vía pública*, *Transporte*, *Obras públicas*).
    *   Redacta un resumen claro del problema.
*   **Seguimiento de folios:** Cada reporte genera un folio (ej. `#RL-0427`) con una barra de progreso de 4 estados: *Recibido → Canalizado a la dependencia → En atención → Resuelto*. Cuando se marca como resuelto, los usuarios pueden validar si *"Sigue arreglado"* o si *"Volvió a fallar"*.

### 3.3. Avisos de Zona en Lenguaje Sencillo
*   Traduce boletines complejos de obras públicas o fallas en el transporte a un formato claro, directo y accionable bajo tres preguntas: **Qué pasa**, **Hasta cuándo** y **Qué hacer** (incluyendo alternativas cercanas y distancias).
*   Cuenta con lectura en voz alta (*Escuchar*) y opción para consultar el aviso oficial original.

### 3.4. Rutas Conocidas y Alertas Proactivas en Segundo Plano
*   La app aprende las rutas habituales del usuario (ej. *Casa → Trabajo* de lunes a viernes a las 8:00, o *Casa → Centro de salud*).
*   Monitorea estas rutas en segundo plano cruzando la ubicación con reportes nuevos de la comunidad o de la ciudad.
*   Si detecta un obstáculo nuevo en una ruta frecuente (ej. una obra cerrada a 200 metros), alerta al usuario sin necesidad de que abra la aplicación, ofreciendo opciones rápidas para **Desviarse** o **Pedir ayuda**.

---

## 4. Modos Avanzados de Accesibilidad

### 4.1. Modo Ciego / Acceso por Voz
*   **Compatibilidad total:** Optimizado para lectores de pantalla como VoiceOver y TalkBack con etiquetas claras.
*   **Control por voz:** Navegación mediante comandos naturales (*"Llévame a casa"*, *"¿Qué hay enfrente?"*, *"Reporta un problema"*).
*   **Visión artificial en tiempo real (Gemini):** Al apuntar la cámara mientras se camina, Gemini describe el entorno y advierte obstáculos inmediatos (ej. *"En 30 metros hay un puesto sobre la banqueta. Sigue por la orilla derecha"*).
*   **Guía háptica y auditiva:** Combina instrucciones paso a paso con vibraciones preventivas antes de cada giro o barrera.

### 4.2. Modo Sordoceguera ("Sin ver, sin oír, sin hablar")
*   **Salida de información táctil:** Compatible con **líneas Braille** conectadas y patrones de vibración diferenciados en teléfono y reloj inteligente:
    *   *Vas bien*
    *   *Gira*
    *   *Detente: barrera adelante*
    *   *Cambio en tu ruta de siempre* (ej. vibración *largo-corto-largo*).
*   **Gestos rápidos:**
    *   Tocar con dos dedos la pantalla: inicia ruta a casa.
    *   Agitar el teléfono: solicita ayuda.
*   **Tarjeta de asistencia para transeúntes:** Muestra en pantalla un mensaje de alto contraste para personas cercanas: *"Soy una persona sordociega. No veo ni escucho. Por favor, toque mi hombro y ayúdeme a cruzar la calle. Puede escribir con su dedo letras grandes en la palma de mi mano."*

---

## 5. Sistema de Ayuda y Protocolos de Emergencia
*   **Asistente de Ayuda:** Permite realizar preguntas por voz sobre el uso de la app o contactar directamente por teléfono con soporte humano en horarios establecidos.
*   **Contactos de Emergencia y Guía-Intérprete:** Permite registrar contactos principales y personas de apoyo.
*   **Disparadores rápidos de emergencia (sin abrir la app):**
    1.  **2 toques en la parte trasera del teléfono:** Llama al contacto principal y envía la ubicación en tiempo real.
    2.  **Agitar el teléfono:** Ideal para sordoceguera; envía ubicación y vibra para confirmar el envío.
    3.  **5 pulsaciones al botón de encendido:** Activa el SOS del sistema operativo (llama al 911 y notifica a contactos).