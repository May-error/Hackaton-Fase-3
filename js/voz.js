/**
 * Módulo de voz (síntesis, reconocimiento, grabación) y Web Share API.
 * Prioriza voces es-MX y usa cualquier voz es-* como respaldo.
 */

let mediaRecorder = null;
let audioChunks = [];

export function soportaSintesis() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function soportaReconocimientoVoz() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function soportaGrabacionAudio() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

export function mensajeCompatibilidadVoz() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) {
    return 'En Firefox el dictado por voz no está disponible. Puedes grabar audio o escribir tu descripción.';
  }
  if (soportaReconocimientoVoz()) {
    return 'Dictado compatible en este navegador. Nota de privacidad: en Chrome/Edge el audio de dictado puede procesarse en servidores externos del navegador.';
  }
  return 'El dictado automático tiene soporte limitado en este navegador; siempre puedes escribir tu reporte.';
}

function seleccionarVozEspanol() {
  if (!soportaSintesis()) return null;
  const voces = window.speechSynthesis.getVoices() || [];
  const mx = voces.find((v) => v.lang && v.lang.toLowerCase().startsWith('es-mx'));
  if (mx) return mx;
  return voces.find((v) => v.lang && v.lang.toLowerCase().startsWith('es')) || null;
}

export function detenerLectura() {
  if (soportaSintesis()) {
    window.speechSynthesis.cancel();
  }
}

export function hablarTexto(texto, onEnd) {
  if (!soportaSintesis() || !texto) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'es-MX';
  const voz = seleccionarVozEspanol();
  if (voz) utter.voice = voz;
  utter.rate = 0.98;
  if (typeof onEnd === 'function') utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
  return true;
}

export function iniciarDictado({ onResultado, onError, onFin }) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    onError?.('Tu navegador no admite reconocimiento de voz. Usa el campo de texto.');
    return null;
  }
  const rec = new SpeechRec();
  rec.lang = 'es-MX';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    onResultado?.(transcript);
  };
  rec.onerror = (event) => {
    onError?.(`No se pudo completar el dictado (${event.error || 'error desconocido'}).`);
  };
  rec.onend = () => onFin?.();
  rec.start();
  return rec;
}

export async function iniciarGrabacionAudio() {
  if (!soportaGrabacionAudio()) {
    throw new Error('Tu navegador no permite grabar audio.');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) audioChunks.push(e.data);
  };
  mediaRecorder.start();
  return mediaRecorder;
}

export function detenerGrabacionAudio() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      reject(new Error('No hay una grabación activa.'));
      return;
    }
    const tracks = mediaRecorder.stream ? mediaRecorder.stream.getTracks() : [];
    mediaRecorder.onstop = () => {
      tracks.forEach((t) => t.stop());
      const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      resolve(blob);
    };
    mediaRecorder.stop();
  });
}

export async function compartirTrayecto(titulo, texto) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: texto, url });
      return { metodo: 'webshare', ok: true };
    } catch (e) {
      if (e && e.name === 'AbortError') return { metodo: 'cancelado', ok: false };
    }
  }
  try {
    await navigator.clipboard.writeText(`${titulo}\n${texto}\n${url}`);
    return { metodo: 'copiado', ok: true };
  } catch {
    return { metodo: 'manual', ok: false, texto: `${titulo} — ${texto}` };
  }
}

/**
 * Controlador de guía de voz paso a paso con comandos de voz ("parar", "seguir", "siguiente").
 */
export function crearGuiaPasoAPaso(pasos, { onPaso, onEstado } = {}) {
  let indice = 0;
  let pausado = false;
  let activo = false;
  let recComandos = null;

  function leerActual() {
    if (!activo || pausado) return;
    if (indice >= pasos.length) {
      activo = false;
      onEstado?.('Recorrido de voz finalizado.');
      detenerEscuchaComandos();
      return;
    }
    onPaso?.(indice, pasos[indice]);
    onEstado?.(`Leyendo paso ${indice + 1} de ${pasos.length}. Di "parar" o "seguir".`);
    hablarTexto(`Paso ${indice + 1} de ${pasos.length}. ${pasos[indice]}`, () => {
      if (activo && !pausado) {
        indice += 1;
        leerActual();
      }
    });
  }

  function iniciarEscuchaComandos() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || recComandos) return;
    recComandos = new SpeechRec();
    recComandos.lang = 'es-MX';
    recComandos.continuous = true;
    recComandos.interimResults = false;
    recComandos.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const cmd = (last?.[0]?.transcript || '').toLowerCase().trim();
      if (/parar|pausar|alto|detener/.test(cmd)) {
        pausar();
      } else if (/seguir|continuar|reanudar|avanzar/.test(cmd)) {
        seguir();
      } else if (/siguiente|próximo|proximo/.test(cmd)) {
        siguiente();
      }
    };
    recComandos.onend = () => {
      if (activo && recComandos) {
        try { recComandos.start(); } catch { /* ignorar */ }
      }
    };
    try { recComandos.start(); } catch { /* ignorar */ }
  }

  function detenerEscuchaComandos() {
    if (recComandos) {
      const r = recComandos;
      recComandos = null;
      try { r.stop(); } catch { /* ignorar */ }
    }
  }

  function iniciar() {
    indice = 0;
    pausado = false;
    activo = true;
    iniciarEscuchaComandos();
    leerActual();
  }

  function pausar() {
    if (!activo) return;
    pausado = true;
    detenerLectura();
    onEstado?.('Guía de voz en pausa. Di "seguir" para continuar.');
  }

  function seguir() {
    if (!activo) {
      iniciar();
      return;
    }
    if (pausado) {
      pausado = false;
      leerActual();
    }
  }

  function siguiente() {
    if (!activo) return;
    pausado = false;
    detenerLectura();
    indice = Math.min(pasos.length - 1, indice + 1);
    leerActual();
  }

  function detener() {
    activo = false;
    pausado = false;
    detenerLectura();
    detenerEscuchaComandos();
    onEstado?.('Guía de voz detenida.');
  }

  return { iniciar, pausar, seguir, siguiente, detener };
}
