/**
 * Gestión centralizada de estado en localStorage para RutaLibre.
 * Maneja QuotaExceededError, folios RL-AAAA-NNNNNN y respaldos JSON.
 */
import {
  REPORTES_DEMO,
  AVISOS_DEMO,
  PLAN_TRABAJO_INICIAL,
  PERFILES_RAPIDOS
} from './datos-demo.js';

const STORAGE_KEY = 'rutalibre_estado_v1';

function clonar(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function crearEstadoInicial() {
  return {
    rolActivo: 'ciudadano',
    perfilRapidoActivo: null,
    perfil: {
      necesidades: [],
      otroTexto: '',
      configRuta: ['evitarEscalones', 'preferirRampasElevadores'],
      distanciaMaxM: 800,
      preferenciaRuta: 'accesible'
    },
    a11y: {
      textoGrande: false,
      altoContraste: false,
      lecturaVozAlta: false,
      accesoSinVision: false,
      guiaPorVoz: false,
      reducirAnimaciones: false
    },
    reportes: clonar(REPORTES_DEMO),
    avisos: clonar(AVISOS_DEMO),
    favoritos: ['lug_salud', 'lug_biblioteca'],
    rutasGuardadas: [],
    planTrabajo: clonar(PLAN_TRABAJO_INICIAL),
    consecutivoFolio: 104
  };
}

let estado = cargarDesdeStorage();
const listeners = new Set();

function cargarDesdeStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return crearEstadoInicial();
    const parsed = JSON.parse(raw);
    const base = crearEstadoInicial();
    return {
      ...base,
      ...parsed,
      perfil: { ...base.perfil, ...(parsed.perfil || {}) },
      a11y: { ...base.a11y, ...(parsed.a11y || {}) },
      reportes: Array.isArray(parsed.reportes) ? parsed.reportes : base.reportes,
      avisos: Array.isArray(parsed.avisos) ? parsed.avisos : base.avisos,
      favoritos: Array.isArray(parsed.favoritos) ? parsed.favoritos : base.favoritos,
      rutasGuardadas: Array.isArray(parsed.rutasGuardadas) ? parsed.rutasGuardadas : base.rutasGuardadas,
      planTrabajo: Array.isArray(parsed.planTrabajo) ? parsed.planTrabajo : base.planTrabajo
    };
  } catch (err) {
    console.warn('No se pudo leer el estado guardado, usando datos de demostración:', err);
    return crearEstadoInicial();
  }
}

export function getEstado() {
  return estado;
}

export function suscribirEstado(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notificar(onError) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (err) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      if (typeof onError === 'function') {
        onError('El almacenamiento del navegador está lleno (QuotaExceededError). Exporta tus reportes o borra datos antiguos.');
      }
      window.dispatchEvent(new CustomEvent('rutalibre:quota-error'));
    } else {
      console.error('Error al guardar estado:', err);
    }
  }
  for (const fn of listeners) {
    try { fn(estado); } catch (e) { console.error(e); }
  }
}

export function actualizarEstado(mutator, onError) {
  mutator(estado);
  notificar(onError);
}

export function generarFolio() {
  const anio = new Date().getFullYear();
  estado.consecutivoFolio = (estado.consecutivoFolio || 100) + 1;
  const num = String(estado.consecutivoFolio).padStart(6, '0');
  notificar();
  return `RL-${anio}-${num}`;
}

export function aplicarPerfilRapido(clave) {
  const preset = PERFILES_RAPIDOS[clave];
  if (!preset) return;
  actualizarEstado((s) => {
    s.perfilRapidoActivo = clave;
    s.perfil.necesidades = [...preset.necesidades];
    s.perfil.configRuta = [...preset.configRuta];
    if (preset.a11y) {
      s.a11y = { ...s.a11y, ...preset.a11y };
    }
  });
}

export function exportarEstadoJSON() {
  const payload = {
    aplicacion: 'RutaLibre',
    version: '1.0-demo',
    exportadoEn: new Date().toISOString(),
    reportes: estado.reportes,
    favoritos: estado.favoritos,
    rutasGuardadas: estado.rutasGuardadas,
    perfil: estado.perfil
  };
  return JSON.stringify(payload, null, 2);
}

export function importarEstadoJSON(textoJSON) {
  const parsed = JSON.parse(textoJSON);
  if (!parsed || !Array.isArray(parsed.reportes)) {
    throw new Error('El archivo JSON no contiene una lista válida de reportes de RutaLibre.');
  }
  actualizarEstado((s) => {
    const porFolio = new Map(s.reportes.map((r) => [r.folio, r]));
    for (const rep of parsed.reportes) {
      if (rep && rep.folio && rep.categoria) {
        porFolio.set(rep.folio, rep);
      }
    }
    s.reportes = Array.from(porFolio.values());
    if (Array.isArray(parsed.favoritos)) {
      s.favoritos = Array.from(new Set([...s.favoritos, ...parsed.favoritos]));
    }
    if (Array.isArray(parsed.rutasGuardadas)) {
      s.rutasGuardadas = parsed.rutasGuardadas;
    }
  });
}

export function restablecerDemo() {
  estado = crearEstadoInicial();
  notificar();
}

export function borrarTodosDatosLocales() {
  localStorage.removeItem(STORAGE_KEY);
  estado = crearEstadoInicial();
  estado.reportes = [];
  estado.favoritos = [];
  estado.rutasGuardadas = [];
  notificar();
}
