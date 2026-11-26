/**
 * Integración de Gemini AI + Modo Demostración automático.
 * - Nombre del modelo en una sola constante.
 * - Respuesta en JSON con timeout de 15 segundos.
 * - Sin claves expuestas en el código fuente.
 */
import { DEPENDENCIAS_EJEMPLO, CATEGORIAS_REPORTE } from './datos-demo.js';

export const GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 15000;
const SESSION_KEY = 'rutalibre_gemini_session_key';

export function getGeminiKey() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
}

export function setGeminiKey(key) {
  try {
    const clean = (key || '').trim();
    if (clean) sessionStorage.setItem(SESSION_KEY, clean);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignorar si sessionStorage está restringido
  }
}

async function llamarGeminiJSON(promptTexto, fotoDataUrl = null) {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('SIN_CLAVE');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const parts = [{ text: promptTexto }];
  if (fotoDataUrl && fotoDataUrl.startsWith('data:image/')) {
    const base64 = fotoDataUrl.split(',')[1];
    const mime = fotoDataUrl.substring(5, fotoDataUrl.indexOf(';')) || 'image/jpeg';
    parts.push({ inline_data: { mime_type: mime, data: base64 } });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!resp.ok) {
      throw new Error(`HTTP_${resp.status}`);
    }
    const data = await resp.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('RESPUESTA_VACIA');
    return JSON.parse(rawText);
  } finally {
    clearTimeout(timer);
  }
}

function analizarEnModoDemo({ categoriaUsuario, descripcion, tieneFoto }) {
  const texto = `${categoriaUsuario} ${descripcion}`.toLowerCase();
  let categoria = categoriaUsuario || 'Otro';
  let prioridad = 'Media';
  let personasAfectadas = 'Peatones y personas con movilidad reducida';

  if (/elevador|ascensor/.test(texto)) {
    categoria = 'Elevador fuera de servicio';
    prioridad = 'Alta';
    personasAfectadas = 'Personas en silla de ruedas, con carriola, bastón o personas mayores';
  } else if (/rampa.*(bloque|tapad|obstru|coche|auto|escombro)/.test(texto)) {
    categoria = 'Rampa bloqueada';
    prioridad = 'Alta';
    personasAfectadas = 'Personas en silla de ruedas y usuarios de carriola';
  } else if (/sin rampa|falta.*rampa/.test(texto)) {
    categoria = 'Falta de rampa';
    prioridad = 'Alta';
    personasAfectadas = 'Personas en silla de ruedas, andadera y carriolas';
  } else if (/escalera|escalon/.test(texto)) {
    categoria = 'Escaleras sin alternativa';
    prioridad = 'Alta';
    personasAfectadas = 'Personas en silla de ruedas, muletas, bastón y personas mayores';
  } else if (/cruce|semaforo|semáforo|peligros/.test(texto)) {
    categoria = 'Cruce peligroso';
    prioridad = 'Alta';
    personasAfectadas = 'Personas con baja visión, ceguera, sordera y movilidad lenta';
  } else if (/banqueta|bache|rota|agrietad/.test(texto)) {
    categoria = 'Banqueta dañada';
    prioridad = 'Media';
    personasAfectadas = 'Personas con bastón, andadera, baja visión o silla de ruedas';
  } else if (/transporte|camion|camión|autobus|autobús/.test(texto)) {
    categoria = 'Transporte inaccesible';
    prioridad = 'Alta';
    personasAfectadas = 'Personas en silla de ruedas y personas mayores';
  } else if (/señal|letrero|braille|sonor/.test(texto)) {
    categoria = 'Señalización insuficiente';
    prioridad = 'Media';
    personasAfectadas = 'Personas con baja visión, ceguera o sordera';
  } else if (/obstru|poste|basura|puesto/.test(texto)) {
    categoria = 'Obstrucción';
    prioridad = 'Media';
    personasAfectadas = 'Personas con ceguera, silla de ruedas y carriola';
  }

  if (!CATEGORIAS_REPORTE.includes(categoria)) categoria = 'Otro';

  const resumen = descripcion.trim()
    ? `${descripcion.trim()}${tieneFoto ? ' (con evidencia fotográfica adjunta)' : ''}`
    : `Posible incidente de ${categoria.toLowerCase()} reportado en vía pública.`;

  return {
    modo: 'demo',
    avisoFallback: '',
    categoria,
    prioridad,
    descripcion: resumen,
    dependenciaSugerida: DEPENDENCIAS_EJEMPLO[categoria] || DEPENDENCIAS_EJEMPLO.Otro,
    confianza: tieneFoto ? 'Media-Alta (modo demostración)' : 'Media (modo demostración)',
    personasAfectadas
  };
}

/**
 * A. Análisis de reporte con Gemini (o modo demostración si no hay clave, sin red o falla).
 */
export async function analizarReporteIA({ categoriaUsuario, descripcion, ubicacionTexto, fotoDataUrl }) {
  const demoBase = analizarEnModoDemo({
    categoriaUsuario,
    descripcion,
    tieneFoto: Boolean(fotoDataUrl)
  });

  if (!getGeminiKey()) {
    return demoBase;
  }

  const prompt = [
    'Eres un asistente de accesibilidad urbana en español de México para la app RutaLibre.',
    'Analiza el reporte (texto e imagen si existe). No inventes hechos ni identifiques personas, rostros ni placas de vehículos.',
    `Categorías válidas: ${CATEGORIAS_REPORTE.join(', ')}.`,
    `Prioridades válidas: Alta, Media, Baja.`,
    `Categoría elegida por la persona: "${categoriaUsuario}".`,
    `Ubicación referida: "${ubicacionTexto}".`,
    `Descripción: "${descripcion}".`,
    'Responde exclusivamente JSON válido con las llaves exactas:',
    '{"categoria": string, "prioridad": string, "descripcion": string, "dependenciaSugerida": string, "confianza": string, "personasAfectadas": string}',
    'La dependenciaSugerida debe ser genérica y terminar con " (ejemplo)".'
  ].join('\n');

  try {
    const res = await llamarGeminiJSON(prompt, fotoDataUrl);
    return {
      modo: 'gemini',
      avisoFallback: '',
      categoria: CATEGORIAS_REPORTE.includes(res.categoria) ? res.categoria : demoBase.categoria,
      prioridad: ['Alta', 'Media', 'Baja'].includes(res.prioridad) ? res.prioridad : demoBase.prioridad,
      descripcion: res.descripcion || demoBase.descripcion,
      dependenciaSugerida: res.dependenciaSugerida || demoBase.dependenciaSugerida,
      confianza: res.confianza || 'Generada por Gemini',
      personasAfectadas: res.personasAfectadas || demoBase.personasAfectadas
    };
  } catch (err) {
    const motivo = err.name === 'AbortError'
      ? 'Se superó el tiempo límite de 15 s.'
      : 'No fue posible conectar con Gemini en este momento.';
    return {
      ...demoBase,
      modo: 'demo-fallback',
      avisoFallback: `${motivo} Se utilizó el modo demostración automáticamente.`
    };
  }
}

/**
 * B. Simplificación de avisos urbanos en palabras sencillas.
 */
export async function simplificarAvisoIA(aviso) {
  if (!getGeminiKey()) {
    return {
      modo: 'demo',
      texto: aviso.explicacionSencilla
    };
  }

  const prompt = [
    'Explica este aviso urbano en español de México muy sencillo, con frases cortas y claras para cualquier persona.',
    'No inventes datos adicionales ni prometas accesibilidad si no aparece en el texto.',
    `Título: ${aviso.titulo}`,
    `Ubicación: ${aviso.ubicacion}`,
    `Vigencia: ${aviso.vigencia}`,
    `Texto original: ${aviso.descripcion}`,
    'Devuelve JSON: {"resumenSencillo": string}'
  ].join('\n');

  try {
    const res = await llamarGeminiJSON(prompt);
    return {
      modo: 'gemini',
      texto: res.resumenSencillo || aviso.explicacionSencilla
    };
  } catch {
    return {
      modo: 'demo-fallback',
      texto: `${aviso.explicacionSencilla} (Modo demostración por respaldo)`
    };
  }
}

/**
 * C. Asistente de ayuda sobre el uso de RutaLibre.
 */
export async function responderAyudaIA(pregunta) {
  const q = (pregunta || '').toLowerCase();
  let respuestaDemo = 'En RutaLibre puedes: 1) Configurar tus necesidades en Perfil, 2) Buscar destinos y rutas en Mapa, 3) Reportar barreras en Reportar y 4) Revisar tu folio en Mis reportes.';

  if (/report|folio|foto|voz/.test(q)) {
    respuestaDemo = 'Para reportar una barrera entra a la sección "Reportar", agrega una foto (sin rostros ni placas), indica la ubicación o usa tu GPS, describe el problema y presiona "Analizar reporte". Podrás corregir la sugerencia antes de enviar y recibirás un folio tipo RL-2026-000105.';
  } else if (/ruta|llegar|mapa|escalon|silla|rampa/.test(q)) {
    respuestaDemo = 'Para buscar una ruta entra a "Mapa", elige un destino de la lista "Cerca de ti" o busca por nombre y presiona "Cómo llegar". Si tienes un perfil activo (por ejemplo Silla de ruedas), el mapa evita escalones. Si faltan datos en un tramo, te mostraremos una alerta clara.';
  } else if (/perfil|accesibil|contraste|texto|voz/.test(q)) {
    respuestaDemo = 'En la barra superior puedes activar Texto grande, Alto contraste, Lectura en voz alta, Acceso sin visión, Guía por voz o Reducir animaciones. También puedes usar los 5 perfiles rápidos o ajustar las 12 opciones en la sección "Perfil".';
  } else if (/admin|administrador|estado/.test(q)) {
    respuestaDemo = 'El Panel Administrador es una vista de demostración. Cambia tu rol en el selector superior a "Administrador (demostración)" para ver métricas, revisar reportes y cambiar su estado; los cambios se reflejan al instante en "Mis reportes".';
  } else if (/privacidad|datos|borrar|seguro/.test(q)) {
    respuestaDemo = 'Tus datos se guardan solo en este navegador (LocalStorage e IndexedDB). Antes de guardar una foto, RutaLibre la comprime y elimina sus datos EXIF y GPS. Puedes borrar todo desde "Perfil" -> "Borrar todos mis datos".';
  }

  if (!getGeminiKey()) {
    return { modo: 'demo', texto: respuestaDemo };
  }

  const prompt = [
    'Eres el asistente de ayuda de RutaLibre (español de México, frases cortas y sencillas).',
    'Reglas estrictas: solo explica cómo usar RutaLibre. Nunca afirmes que una ruta es segura o un lugar es accesible sin datos. Nunca digas que los reportes llegan a gobierno real (es demostración).',
    `Pregunta de la persona: "${pregunta}"`,
    'Devuelve JSON: {"respuesta": string}'
  ].join('\n');

  try {
    const res = await llamarGeminiJSON(prompt);
    return {
      modo: 'gemini',
      texto: res.respuesta || respuestaDemo
    };
  } catch {
    return {
      modo: 'demo-fallback',
      texto: `${respuestaDemo} (Respuesta en modo demostración)`
    };
  }
}
