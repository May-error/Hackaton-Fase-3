/**
 * Mapa interactivo accesible en SVG + Detalle de destino + Ruta propuesta (Dijkstra).
 * Incluye controles de desplazamiento (↑ ↓ ← →) y zoom (+ −), cumpliendo WCAG 2.5.7.
 * Deja preparado un adaptador para futura integración con Leaflet/OpenStreetMap.
 */
import { LUGARES_DEMO, NODOS_MAPA, TRAMOS_MAPA } from './datos-demo.js';
import { getEstado, actualizarEstado } from './estado.js';
import { calcularRutaDijkstra } from './rutas.js';
import { hablarTexto, compartirTrayecto } from './voz.js';

/**
 * Adaptador preparado para futura conexión con Leaflet/OpenStreetMap.
 */
export const AdaptadorMapaExterno = {
  proveedor: 'SVG-Accesible-Local',
  listoParaLeaflet: true,
  convertirACoordenadasReales(nodo) {
    // Mapeo de ejemplo listo para sustituir por lat/lng reales
    return { lat: 19.4326 + (340 - nodo.y) * 0.0001, lng: -99.1332 + (nodo.x - 110) * 0.0001 };
  }
};

let vista = {
  panX: 0,
  panY: 0,
  zoom: 1,
  filtro: 'todos',
  busqueda: '',
  lugarSeleccionadoId: 'lug_salud',
  rutaActual: null,
  modoPanel: 'detalle', // 'detalle' | 'ruta'
  ubicacionUsuarioLabel: 'Tu punto de partida [Calle ejemplo #1]'
};

let callbacks = {
  onReportarLugar: null,
  onToast: null,
  onSolicitarPermiso: null
};

export function initMapa(opts = {}) {
  callbacks = { ...callbacks, ...opts };

  const inputBusq = document.getElementById('mapa-busqueda');
  const selectFiltro = document.getElementById('mapa-filtro');

  inputBusq?.addEventListener('input', (e) => {
    vista.busqueda = e.target.value.trim().toLowerCase();
    renderMapa();
  });

  selectFiltro?.addEventListener('change', (e) => {
    vista.filtro = e.target.value;
    renderMapa();
  });

  document.querySelectorAll('[data-map-pan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-map-pan');
      const paso = 45;
      if (dir === 'up') vista.panY -= paso;
      if (dir === 'down') vista.panY += paso;
      if (dir === 'left') vista.panX -= paso;
      if (dir === 'right') vista.panX += paso;
      renderSvgMapa();
    });
  });

  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    vista.zoom = Math.min(1.8, Number((vista.zoom + 0.2).toFixed(2)));
    renderSvgMapa();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    vista.zoom = Math.max(0.7, Number((vista.zoom - 0.2).toFixed(2)));
    renderSvgMapa();
  });

  document.getElementById('btn-map-reset')?.addEventListener('click', () => {
    vista.panX = 0;
    vista.panY = 0;
    vista.zoom = 1;
    renderSvgMapa();
  });

  document.getElementById('btn-usar-ubicacion-mapa')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      callbacks.onToast?.('Tu navegador no admite geolocalización. Usando punto de ejemplo.');
      return;
    }
    const pedir = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          vista.ubicacionUsuarioLabel = `Ubicación detectada (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) — vinculada a punto de ejemplo`;
          callbacks.onToast?.('Ubicación actualizada en el mapa de demostración.');
          renderPanelLateral();
        },
        () => {
          callbacks.onToast?.('No se obtuvo permiso de ubicación. Se mantiene el punto de ejemplo.');
        },
        { timeout: 6000 }
      );
    };
    if (callbacks.onSolicitarPermiso) {
      callbacks.onSolicitarPermiso({
        titulo: 'Permiso de ubicación',
        mensaje: 'RutaLibre pide tu ubicación solo para centrar tu punto de partida en este navegador. No se envía a ningún servidor.',
        onAceptar: pedir
      });
    } else {
      pedir();
    }
  });

  renderMapa();
}

function obtenerLugaresFiltrados() {
  const est = getEstado();
  return LUGARES_DEMO.filter((lug) => {
    if (vista.filtro === 'accesible' && lug.tipo !== 'accesible') return false;
    if (vista.filtro === 'barrera' && lug.tipo !== 'barrera') return false;
    if (vista.filtro === 'favoritos' && !est.favoritos.includes(lug.id)) return false;
    if (vista.busqueda) {
      const texto = `${lug.nombre} ${lug.ubicacion} ${lug.info}`.toLowerCase();
      if (!texto.includes(vista.busqueda)) return false;
    }
    return true;
  });
}

function getNodo(id) {
  return NODOS_MAPA.find((n) => n.id === id);
}

function renderSvgMapa() {
  const wrap = document.getElementById('mapa-svg-wrap');
  if (!wrap) return;

  const baseW = 860;
  const baseH = 440;
  const w = baseW / vista.zoom;
  const h = baseH / vista.zoom;
  const x = (baseW - w) / 2 + vista.panX;
  const y = (baseH - h) / 2 + vista.panY;

  const lugares = obtenerLugaresFiltrados();
  const origen = NODOS_MAPA[0];
  const rutaIds = vista.rutaActual && vista.rutaActual.reachable
    ? new Set(vista.rutaActual.pathEdges.map((t) => t.id))
    : new Set();

  const tramosSvg = TRAMOS_MAPA.map((t) => {
    const a = getNodo(t.desde);
    const b = getNodo(t.hacia);
    if (!a || !b) return '';
    const enRuta = rutaIds.has(t.id);
    const sinInfo = t.verificacion === 'Sin información';
    const stroke = enRuta ? '#1F4E9E' : sinInfo ? '#C2410C' : '#64748B';
    const width = enRuta ? 8 : 5;
    const dash = sinInfo ? 'stroke-dasharray="8 6"' : '';
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${stroke}" stroke-width="${width}" ${dash} stroke-linecap="round" />`;
  }).join('');

  const marcadoresSvg = lugares.map((lug) => {
    const n = getNodo(lug.nodoId);
    if (!n) return '';
    const seleccionado = lug.id === vista.lugarSeleccionadoId;
    const esBarrera = lug.tipo === 'barrera';
    const color = esBarrera ? '#C2410C' : '#047857';
    const anillo = seleccionado ? `<circle cx="${n.x}" cy="${n.y}" r="22" fill="none" stroke="#FACC15" stroke-width="5" />` : '';

    // Forma distinta además del color: triángulo para barrera, círculo/escudo para accesible
    const figura = esBarrera
      ? `<polygon points="${n.x},${n.y - 16} ${n.x - 15},${n.y + 13} ${n.x + 15},${n.y + 13}" fill="${color}" stroke="#0B1220" stroke-width="2" />
         <text x="${n.x}" y="${n.y + 9}" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="bold">!</text>`
      : `<circle cx="${n.x}" cy="${n.y}" r="15" fill="${color}" stroke="#0B1220" stroke-width="2" />
         <path d="M${n.x - 6} ${n.y} l4 4 l7 -8" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />`;

    return `
      <g class="map-marker-btn" tabindex="0" role="button" data-lugar-id="${lug.id}" aria-label="${lug.tipo === 'barrera' ? 'Barrera: ' : 'Lugar accesible: '}${lug.nombre}, ${lug.ubicacion}">
        ${anillo}
        ${figura}
        <rect x="${n.x - 68}" y="${n.y + 18}" width="136" height="20" rx="5" fill="#FFFFFF" stroke="#0B1220" stroke-width="1" />
        <text x="${n.x}" y="${n.y + 32}" text-anchor="middle" fill="#0B1220" font-size="11" font-weight="700">${lug.nombre.slice(0, 21)}</text>
      </g>
    `;
  }).join('');

  wrap.innerHTML = `
    <svg class="mapa-svg" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="Plano de demostración de calles ejemplo con puntos de accesibilidad y barreras">
      <rect x="-400" y="-400" width="1700" height="1300" fill="#E8F0F2" />
      <!-- Cuadrícula visual de calles ejemplo -->
      <g stroke="#CBD5E1" stroke-width="14">
        <line x1="60" y1="110" x2="800" y2="110" />
        <line x1="60" y1="210" x2="800" y2="210" />
        <line x1="60" y1="340" x2="800" y2="340" />
        <line x1="240" y1="60" x2="240" y2="400" />
        <line x1="410" y1="60" x2="410" y2="400" />
        <line x1="580" y1="60" x2="580" y2="400" />
        <line x1="740" y1="60" x2="740" y2="400" />
      </g>
      <text x="140" y="95" fill="#334155" font-size="12" font-weight="700">[Av. ejemplo Norte]</text>
      <text x="140" y="196" fill="#334155" font-size="12" font-weight="700">[Calle ejemplo Centro]</text>
      <text x="140" y="326" fill="#334155" font-size="12" font-weight="700">[Calle ejemplo Sur]</text>

      ${tramosSvg}

      <!-- Punto de origen del usuario -->
      <g aria-label="Tu ubicación de ejemplo">
        <circle cx="${origen.x}" cy="${origen.y}" r="14" fill="#1F4E9E" stroke="#FFFFFF" stroke-width="3" />
        <circle cx="${origen.x}" cy="${origen.y}" r="5" fill="#FFFFFF" />
        <text x="${origen.x}" y="${origen.y - 20}" text-anchor="middle" fill="#1F4E9E" font-size="12" font-weight="800">Tú (ejemplo)</text>
      </g>

      ${marcadoresSvg}
    </svg>
  `;

  wrap.querySelectorAll('[data-lugar-id]').forEach((el) => {
    const activar = () => {
      vista.lugarSeleccionadoId = el.getAttribute('data-lugar-id');
      vista.modoPanel = 'detalle';
      renderMapa();
    };
    el.addEventListener('click', activar);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activar();
      }
    });
  });
}

function renderListaCerca() {
  const ul = document.getElementById('lista-cerca-de-ti');
  const count = document.getElementById('contador-cerca');
  if (!ul || !count) return;

  const lugares = obtenerLugaresFiltrados();
  count.textContent = `${lugares.length} puntos`;

  if (!lugares.length) {
    ul.innerHTML = '<li class="text-muted">No se encontraron lugares con ese filtro o búsqueda.</li>';
    return;
  }

  ul.innerHTML = lugares.map((lug) => {
    const sel = lug.id === vista.lugarSeleccionadoId ? 'is-selected' : '';
    const badgeClass = lug.tipo === 'barrera' ? 'badge-coral' : 'badge-green';
    const badgeText = lug.tipo === 'barrera' ? 'Barrera' : 'Accesible';
    return `
      <li>
        <button type="button" class="near-item-btn ${sel}" data-select-near="${lug.id}">
          <span>
            <strong>${lug.nombre}</strong><br>
            <span class="text-sm text-muted">${lug.ubicacion} · ${lug.verificacion}</span>
          </span>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </button>
      </li>
    `;
  }).join('');

  ul.querySelectorAll('[data-select-near]').forEach((btn) => {
    btn.addEventListener('click', () => {
      vista.lugarSeleccionadoId = btn.getAttribute('data-select-near');
      vista.modoPanel = 'detalle';
      renderMapa();
    });
  });
}

function badgeVerificacion(verif) {
  if (verif === 'Verificado') return '<span class="badge badge-green">Verificado</span>';
  if (verif === 'Reportado por la comunidad') return '<span class="badge badge-blue">Reportado por la comunidad</span>';
  if (verif === 'Pendiente de verificación') return '<span class="badge badge-yellow">Pendiente de verificación</span>';
  return '<span class="badge badge-info">Sin información todavía</span>';
}

function renderPanelLateral() {
  const panel = document.getElementById('mapa-panel-detalle');
  if (!panel) return;

  const estado = getEstado();
  const lugar = LUGARES_DEMO.find((l) => l.id === vista.lugarSeleccionadoId) || LUGARES_DEMO[0];

  if (vista.modoPanel === 'ruta' && vista.rutaActual) {
    const r = vista.rutaActual;
    if (!r.reachable) {
      panel.innerHTML = `
        <span class="badge badge-red">Ruta no compatible</span>
        <h2 class="mt-sm">¿Puedo llegar a ${lugar.nombre}?</h2>
        <div class="alert alert-danger mt-sm">${r.puedoLlegar}. ${r.motivo}</div>
        <p class="text-sm text-muted">Puedes ajustar tus restricciones en <a href="#perfil">Perfil</a> o elegir otro destino.</p>
        <button type="button" class="btn btn-outline mt-sm" id="btn-volver-detalle">Volver al detalle</button>
      `;
      panel.querySelector('#btn-volver-detalle')?.addEventListener('click', () => {
        vista.modoPanel = 'detalle';
        vista.rutaActual = null;
        renderMapa();
      });
      return;
    }

    const alertasHtml = r.alerts.length
      ? r.alerts.map((a) => `<div class="alert alert-warning-soft">${a}</div>`).join('')
      : '<div class="alert alert-success">Los tramos registrados en este trayecto cuentan con datos compatibles con tu perfil.</div>';

    panel.innerHTML = `
      <span class="badge badge-blue">Ruta propuesta (Dijkstra)</span>
      <h2 class="mt-sm">¿Puedo llegar a ${lugar.nombre}?</h2>
      <p><strong>${r.puedoLlegar}</strong></p>
      <p class="text-sm text-muted">Desde: ${vista.ubicacionUsuarioLabel}</p>
      <div class="grid-2 mt-sm">
        <div class="metric-card"><strong>Distancia</strong><span class="metric-value">${r.totalDistanceM} m</span></div>
        <div class="metric-card"><strong>Tiempo estimado</strong><span class="metric-value">${r.estimatedMinutes} min</span></div>
      </div>
      <ul class="simple-list mt-sm text-sm">
        <li><strong>Rampas en trayecto:</strong> ${r.rampsCount} tramos con rampa</li>
        <li><strong>Escalones en trayecto:</strong> ${r.stairsCount}</li>
        <li><strong>Elevadores reportados en destino:</strong> ${r.elevatorsCount}</li>
        <li><strong>Barreras conocidas evitadas:</strong> ${r.stairsCount === 0 ? 'Sí' : 'Revisar alertas'}</li>
      </ul>
      <div class="mt-sm">${alertasHtml}</div>
      <h3 class="mt-md">Instrucciones paso a paso</h3>
      <ol class="simple-list text-sm">
        ${r.instructions.map((ins) => `<li>${ins}</li>`).join('')}
      </ol>
      <div class="btn-row mt-md">
        <button type="button" class="btn btn-primary" id="btn-guia-voz-ruta">Iniciar guía de voz</button>
        <button type="button" class="btn btn-outline" id="btn-guardar-ruta">Guardar ruta</button>
        <button type="button" class="btn btn-outline" id="btn-compartir-ruta">Compartir trayecto</button>
        <button type="button" class="btn btn-outline" id="btn-volver-mapa">Volver al mapa</button>
      </div>
    `;

    panel.querySelector('#btn-guia-voz-ruta')?.addEventListener('click', () => {
      const texto = `Ruta hacia ${lugar.nombre}. Distancia ${r.totalDistanceM} metros, tiempo estimado ${r.estimatedMinutes} minutos. ${r.alerts.join(' ')} ${r.instructions.join(' ')}`;
      if (!hablarTexto(texto)) {
        callbacks.onToast?.('Tu navegador no admite lectura por voz.');
      }
    });

    panel.querySelector('#btn-guardar-ruta')?.addEventListener('click', () => {
      actualizarEstado((s) => {
        s.rutasGuardadas.unshift({
          id: `ruta-${Date.now()}`,
          destino: lugar.nombre,
          ubicacion: lugar.ubicacion,
          distanciaM: r.totalDistanceM,
          minutos: r.estimatedMinutes,
          guardadaEn: new Date().toLocaleDateString('es-MX')
        });
      });
      callbacks.onToast?.('Ruta guardada en tu dispositivo.');
    });

    panel.querySelector('#btn-compartir-ruta')?.addEventListener('click', async () => {
      const resumen = `RutaLibre — Trayecto a ${lugar.nombre} (${lugar.ubicacion}): ${r.totalDistanceM} m (~${r.estimatedMinutes} min). ${r.puedoLlegar}.`;
      const res = await compartirTrayecto(`RutaLibre: ${lugar.nombre}`, resumen);
      if (res.metodo === 'copiado') callbacks.onToast?.('Trayecto copiado al portapapeles para compartir.');
      else if (res.metodo === 'webshare') callbacks.onToast?.('Trayecto compartido.');
      else if (res.metodo === 'manual') callbacks.onToast?.(res.texto);
    });

    panel.querySelector('#btn-volver-mapa')?.addEventListener('click', () => {
      vista.modoPanel = 'detalle';
      vista.rutaActual = null;
      renderMapa();
    });
    return;
  }

  // Vista Detalle de destino
  const esFav = estado.favoritos.includes(lugar.id);
  panel.innerHTML = `
    <div class="card-header-inline">
      <span class="badge ${lugar.tipo === 'barrera' ? 'badge-coral' : 'badge-green'}">
        ${lugar.tipo === 'barrera' ? 'Barrera reportada' : 'Destino de ejemplo'}
      </span>
      ${badgeVerificacion(lugar.verificacion)}
    </div>
    <h2 class="mt-sm">${lugar.nombre}</h2>
    <p class="text-sm text-muted"><strong>Ubicación:</strong> ${lugar.ubicacion} · Actualizado: ${lugar.actualizado}</p>
    <dl class="simple-list text-sm mt-sm">
      <div><strong>Rampas:</strong> ${lugar.rampas}</div>
      <div><strong>Elevadores:</strong> ${lugar.elevadores}</div>
      <div><strong>Baños:</strong> ${lugar.banos}</div>
      <div><strong>Escaleras:</strong> ${lugar.escaleras}</div>
      <div><strong>Superficie:</strong> ${lugar.superficie}</div>
      <div><strong>Obstáculos:</strong> ${lugar.obstaculos}</div>
      <div><strong>Accesos:</strong> ${lugar.accesos}</div>
      <div><strong>Información de accesibilidad:</strong> ${lugar.info}</div>
    </dl>
    <div class="btn-row mt-md">
      <button type="button" class="btn btn-primary" id="btn-como-llegar">Cómo llegar</button>
      <button type="button" class="btn btn-coral" id="btn-reportar-desde-lugar">Reportar problema</button>
      <button type="button" class="btn btn-outline" id="btn-guardar-lugar">${esFav ? 'Quitar de guardados' : 'Guardar lugar'}</button>
    </div>
  `;

  panel.querySelector('#btn-como-llegar')?.addEventListener('click', () => {
    const perfil = getEstado().perfil;
    vista.rutaActual = calcularRutaDijkstra('n_origen', lugar.nodoId, perfil);
    vista.modoPanel = 'ruta';
    renderMapa();
    if (getEstado().a11y.guiaPorVoz && vista.rutaActual.reachable) {
      hablarTexto(`Ruta lista hacia ${lugar.nombre}. ${vista.rutaActual.puedoLlegar}`);
    }
  });

  panel.querySelector('#btn-reportar-desde-lugar')?.addEventListener('click', () => {
    callbacks.onReportarLugar?.(lugar);
  });

  panel.querySelector('#btn-guardar-lugar')?.addEventListener('click', () => {
    actualizarEstado((s) => {
      if (s.favoritos.includes(lugar.id)) {
        s.favoritos = s.favoritos.filter((id) => id !== lugar.id);
        callbacks.onToast?.('Lugar quitado de favoritos.');
      } else {
        s.favoritos.push(lugar.id);
        callbacks.onToast?.('Lugar guardado en favoritos.');
      }
    });
    renderMapa();
  });
}

export function renderMapa() {
  renderSvgMapa();
  renderListaCerca();
  renderPanelLateral();
}
