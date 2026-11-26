/**
 * Flujo completo de Reportar barrera -> Revisión de análisis de IA -> Confirmación (Folio)
 * y sección Mis reportes con seguimiento, filtros y confirmaciones comunitarias.
 */
import { CATEGORIAS_REPORTE, DEPENDENCIAS_EJEMPLO } from './datos-demo.js';
import { getEstado, actualizarEstado, generarFolio } from './estado.js';
import { comprimirFotoSinExif, guardarFoto, obtenerFotoUrl, guardarAudio, obtenerAudioUrl } from './medios.js';
import {
  mensajeCompatibilidadVoz,
  soportaReconocimientoVoz,
  iniciarDictado,
  iniciarGrabacionAudio,
  detenerGrabacionAudio
} from './voz.js';
import { analizarReporteIA } from './ia.js';

let borrador = {
  fotoBlob: null,
  fotoDataUrl: null,
  fotoMeta: '',
  audioBlob: null,
  audioUrlPreview: null,
  transcripcion: '',
  ubicacion: { x: 410, y: 340, texto: '', fuente: 'manual' },
  analisis: null
};

let filtroMisReportes = 'todos';
let reporteDetalleId = null;

let deps = {
  onToast: null,
  onIrA: null,
  onSolicitarPermiso: null
};

export function precargarUbicacionReporte(lugar) {
  const input = document.getElementById('reporte-ubicacion-texto');
  const estadoEl = document.getElementById('reporte-ubicacion-estado');
  if (input && lugar) {
    input.value = `${lugar.nombre} — ${lugar.ubicacion}`;
    borrador.ubicacion = { x: 410, y: 210, texto: input.value, fuente: 'mapa-ejemplo' };
    if (estadoEl) estadoEl.textContent = 'Ubicación cargada desde el mapa de ejemplo.';
  }
}

export function initReportes(opts = {}) {
  deps = { ...deps, ...opts };

  // Aviso compatibilidad voz
  const avisoVoz = document.getElementById('voz-compatibilidad-aviso');
  if (avisoVoz) avisoVoz.textContent = mensajeCompatibilidadVoz();
  const btnDictar = document.getElementById('btn-transcribir-voz');
  if (btnDictar && !soportaReconocimientoVoz()) {
    btnDictar.disabled = true;
    btnDictar.title = 'Reconocimiento de voz no disponible en este navegador';
  }

  // Llenar selector editable en revisión IA
  const selectIaCat = document.getElementById('ia-edit-categoria');
  if (selectIaCat) {
    selectIaCat.innerHTML = CATEGORIAS_REPORTE.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  // Foto
  const inputFoto = document.getElementById('input-foto-reporte');
  const btnQuitarFoto = document.getElementById('btn-quitar-foto');
  const wrapFoto = document.getElementById('preview-foto-wrap');
  const imgFoto = document.getElementById('preview-foto-img');
  const metaFoto = document.getElementById('preview-foto-meta');

  inputFoto?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const procesada = await comprimirFotoSinExif(file);
      borrador.fotoBlob = procesada.blob;
      borrador.fotoDataUrl = procesada.dataUrl;
      borrador.fotoMeta = `Reducida a ${procesada.width}×${procesada.height} px (${procesada.sizeKB} KB JPEG). Metadatos EXIF y GPS eliminados.`;
      imgFoto.src = procesada.dataUrl;
      metaFoto.textContent = borrador.fotoMeta;
      wrapFoto.hidden = false;
      btnQuitarFoto.hidden = false;
    } catch (err) {
      deps.onToast?.(err.message || 'No se pudo procesar la foto.');
    }
  });

  btnQuitarFoto?.addEventListener('click', () => {
    borrador.fotoBlob = null;
    borrador.fotoDataUrl = null;
    borrador.fotoMeta = '';
    if (inputFoto) inputFoto.value = '';
    wrapFoto.hidden = true;
    btnQuitarFoto.hidden = true;
  });

  // Ubicación
  document.getElementById('btn-ubicacion-auto')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      deps.onToast?.('Geolocalización no disponible. Escribe una referencia manual.');
      return;
    }
    const pedir = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const txt = `[Calle ejemplo] (coord. aproximadas ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          document.getElementById('reporte-ubicacion-texto').value = txt;
          document.getElementById('reporte-ubicacion-estado').textContent = 'Ubicación automática capturada.';
          borrador.ubicacion = { x: 240, y: 210, texto: txt, fuente: 'gps' };
        },
        () => {
          deps.onToast?.('No se obtuvo permiso de ubicación. Puedes escribirla manualmente.');
        },
        { timeout: 6000 }
      );
    };
    deps.onSolicitarPermiso?.({
      titulo: 'Permiso para usar tu ubicación',
      mensaje: 'RutaLibre usará tu ubicación solo para llenar la referencia de este reporte en tu navegador.',
      onAceptar: pedir
    });
  });

  document.getElementById('btn-ubicacion-mapa')?.addEventListener('click', () => {
    const txt = '[Calle ejemplo #40, frente a Escuela Primaria]';
    document.getElementById('reporte-ubicacion-texto').value = txt;
    document.getElementById('reporte-ubicacion-estado').textContent = 'Punto de ejemplo seleccionado.';
    borrador.ubicacion = { x: 410, y: 340, texto: txt, fuente: 'mapa-ejemplo' };
  });

  // Grabación de audio y dictado
  const btnGrabar = document.getElementById('btn-grabar-voz');
  const btnDetener = document.getElementById('btn-detener-voz');
  const btnReproducir = document.getElementById('btn-reproducir-voz');
  const audioPreview = document.getElementById('audio-preview');
  const vozEstado = document.getElementById('voz-estado');

  btnGrabar?.addEventListener('click', () => {
    const iniciar = async () => {
      try {
        await iniciarGrabacionAudio();
        btnGrabar.disabled = true;
        btnDetener.disabled = false;
        vozEstado.textContent = 'Grabando nota de voz...';
      } catch (err) {
        vozEstado.textContent = err.message || 'No se pudo acceder al micrófono.';
      }
    };
    deps.onSolicitarPermiso?.({
      titulo: 'Permiso de micrófono',
      mensaje: 'El micrófono se usará solo para grabar tu nota de voz dentro de este navegador.',
      onAceptar: iniciar
    });
  });

  btnDetener?.addEventListener('click', async () => {
    try {
      const blob = await detenerGrabacionAudio();
      borrador.audioBlob = blob;
      if (borrador.audioUrlPreview) URL.revokeObjectURL(borrador.audioUrlPreview);
      borrador.audioUrlPreview = URL.createObjectURL(blob);
      audioPreview.src = borrador.audioUrlPreview;
      audioPreview.hidden = false;
      btnGrabar.disabled = false;
      btnDetener.disabled = true;
      btnReproducir.disabled = false;
      vozEstado.textContent = 'Nota de voz guardada en el borrador.';
    } catch (err) {
      vozEstado.textContent = err.message;
    }
  });

  btnReproducir?.addEventListener('click', () => {
    audioPreview?.play();
  });

  btnDictar?.addEventListener('click', () => {
    const iniciar = () => {
      vozEstado.textContent = 'Escuchando dictado...';
      iniciarDictado({
        onResultado: (txt) => {
          borrador.transcripcion = txt;
          const desc = document.getElementById('reporte-descripcion');
          desc.value = desc.value ? `${desc.value} ${txt}` : txt;
          vozEstado.textContent = `Transcripción añadida: "${txt}"`;
        },
        onError: (msg) => { vozEstado.textContent = msg; },
        onFin: () => { /* listo */ }
      });
    };
    deps.onSolicitarPermiso?.({
      titulo: 'Permiso de micrófono para dictado',
      mensaje: 'Tu navegador escuchará tu voz para convertirla en texto. En Chrome/Edge el audio puede procesarse en servidores del navegador.',
      onAceptar: iniciar
    });
  });

  // Paso 1 -> Paso 2 (Analizar reporte)
  const formReporte = document.getElementById('form-reporte');
  formReporte?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ubicacionTexto = document.getElementById('reporte-ubicacion-texto').value.trim();
    const categoriaUsuario = document.getElementById('reporte-categoria').value;
    const descripcion = document.getElementById('reporte-descripcion').value.trim();
    const errorBox = document.getElementById('reporte-form-error');

    if (!ubicacionTexto || !descripcion) {
      errorBox.textContent = 'Por favor escribe una ubicación de referencia y describe lo que está pasando.';
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;
    borrador.ubicacion.texto = ubicacionTexto;

    const btnAnalizar = document.getElementById('btn-analizar-reporte');
    btnAnalizar.disabled = true;
    btnAnalizar.querySelector('span').textContent = 'Analizando...';

    try {
      const resultado = await analizarReporteIA({
        categoriaUsuario,
        descripcion,
        ubicacionTexto,
        fotoDataUrl: borrador.fotoDataUrl
      });
      borrador.analisis = resultado;
      mostrarPasoRevisionIA(resultado);
    } finally {
      btnAnalizar.disabled = false;
      btnAnalizar.querySelector('span').textContent = 'Analizar reporte';
    }
  });

  // Botones Paso 2
  document.getElementById('btn-ia-corregir')?.addEventListener('click', () => mostrarPasoReporte(1));
  document.getElementById('btn-ia-regresar')?.addEventListener('click', () => mostrarPasoReporte(1));

  // Envío final -> Paso 3
  document.getElementById('form-confirmar-ia')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const catFinal = document.getElementById('ia-edit-categoria').value;
    const prioFinal = document.getElementById('ia-edit-prioridad').value;
    const depFinal = document.getElementById('ia-edit-dependencia').value.trim() || DEPENDENCIAS_EJEMPLO[catFinal] || DEPENDENCIAS_EJEMPLO.Otro;
    const ubiFinal = document.getElementById('ia-edit-ubicacion').value.trim();
    const descFinal = document.getElementById('ia-edit-descripcion').value.trim();

    const a = borrador.analisis;
    const editado = a && (catFinal !== a.categoria || prioFinal !== a.prioridad || descFinal !== a.descripcion || depFinal !== a.dependenciaSugerida);

    const id = `rep-${Date.now()}`;
    let fotoId = null;
    let audioId = null;

    try {
      if (borrador.fotoBlob) {
        fotoId = `foto-${id}`;
        await guardarFoto(fotoId, borrador.fotoBlob, { width: 1024 });
      }
      if (borrador.audioBlob) {
        audioId = `audio-${id}`;
        await guardarAudio(audioId, borrador.audioBlob);
      }
    } catch (err) {
      deps.onToast?.(err.message);
    }

    const folio = generarFolio();
    const ahora = new Date().toISOString();
    const nuevoReporte = {
      id,
      folio,
      creadoEn: ahora,
      actualizadoEn: ahora,
      rolAutor: getEstado().rolActivo,
      ubicacion: { ...borrador.ubicacion, texto: ubiFinal },
      categoria: catFinal,
      descripcion: descFinal,
      fotoId,
      audioId,
      transcripcion: borrador.transcripcion,
      analisisIA: a,
      editadoPorPersona: Boolean(editado),
      prioridad: prioFinal,
      estado: 'Recibido',
      dependenciaSugerida: depFinal,
      historial: [{ fecha: ahora, estado: 'Recibido', nota: 'Reporte guardado localmente en demostración.' }],
      confirmaciones: { siguePresente: 0, resuelto: 0 },
      notasAdmin: ''
    };

    actualizarEstado((s) => {
      s.reportes.unshift(nuevoReporte);
    }, (msg) => deps.onToast?.(msg));

    mostrarConfirmacion(nuevoReporte);
    limpiarBorrador();
    renderMisReportes();
  });

  // Filtros Mis reportes
  document.querySelectorAll('[data-filtro-reporte]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filtro-reporte]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filtroMisReportes = btn.getAttribute('data-filtro-reporte');
      renderMisReportes();
    });
  });

  renderMisReportes();
}

function mostrarPasoReporte(paso) {
  document.getElementById('form-reporte').hidden = paso !== 1;
  document.getElementById('vista-revision-ia').hidden = paso !== 2;
  document.getElementById('vista-confirmacion-reporte').hidden = paso !== 3;
  document.querySelectorAll('[data-step-pill]').forEach((el) => {
    el.classList.toggle('is-active', Number(el.getAttribute('data-step-pill')) === paso);
  });
}

function mostrarPasoRevisionIA(res) {
  const badge = document.getElementById('ia-modo-badge');
  if (res.modo === 'gemini') badge.textContent = 'Sugerencia generada con Gemini';
  else if (res.modo === 'demo-fallback') badge.textContent = 'Modo demostración (respaldo automático)';
  else badge.textContent = 'Análisis en modo demostración';

  document.getElementById('ia-personas-afectadas').textContent = res.personasAfectadas;
  document.getElementById('ia-confianza').textContent = res.avisoFallback ? `${res.confianza} — ${res.avisoFallback}` : res.confianza;

  const miniWrap = document.getElementById('ia-foto-mini-wrap');
  const miniImg = document.getElementById('ia-foto-mini');
  if (borrador.fotoDataUrl) {
    miniImg.src = borrador.fotoDataUrl;
    miniWrap.hidden = false;
  } else {
    miniWrap.hidden = true;
  }

  document.getElementById('ia-edit-categoria').value = res.categoria;
  document.getElementById('ia-edit-prioridad').value = res.prioridad;
  document.getElementById('ia-edit-dependencia').value = res.dependenciaSugerida;
  document.getElementById('ia-edit-ubicacion').value = borrador.ubicacion.texto;
  document.getElementById('ia-edit-descripcion').value = res.descripcion;

  mostrarPasoReporte(2);
}

function mostrarConfirmacion(rep) {
  const box = document.getElementById('vista-confirmacion-reporte');
  box.innerHTML = `
    <span class="badge badge-green">Reporte registrado localmente</span>
    <h2 class="mt-sm">Folio: ${rep.folio}</h2>
    <div class="alert alert-warning-soft mt-sm">
      <strong>Aviso de demostración:</strong> Este reporte se guardó únicamente en este navegador. No fue enviado a ninguna dependencia gubernamental real.
    </div>
    <ul class="simple-list mt-sm">
      <li><strong>Fecha:</strong> ${new Date(rep.creadoEn).toLocaleString('es-MX')}</li>
      <li><strong>Ubicación:</strong> ${rep.ubicacion.texto}</li>
      <li><strong>Categoría:</strong> ${rep.categoria}</li>
      <li><strong>Resumen:</strong> ${rep.descripcion}</li>
      <li><strong>Estado inicial:</strong> ${rep.estado}</li>
    </ul>
    <div class="btn-row mt-md">
      <button type="button" class="btn btn-primary" id="btn-conf-ver">Ver reporte</button>
      <button type="button" class="btn btn-outline" id="btn-conf-lista">Mis reportes</button>
      <button type="button" class="btn btn-outline" id="btn-conf-otro">Reportar otra barrera</button>
    </div>
  `;

  box.querySelector('#btn-conf-ver')?.addEventListener('click', () => {
    reporteDetalleId = rep.id;
    deps.onIrA?.('mis-reportes');
    renderMisReportes();
  });
  box.querySelector('#btn-conf-lista')?.addEventListener('click', () => {
    deps.onIrA?.('mis-reportes');
  });
  box.querySelector('#btn-conf-otro')?.addEventListener('click', () => {
    mostrarPasoReporte(1);
  });

  mostrarPasoReporte(3);
}

function limpiarBorrador() {
  borrador = {
    fotoBlob: null,
    fotoDataUrl: null,
    fotoMeta: '',
    audioBlob: null,
    audioUrlPreview: null,
    transcripcion: '',
    ubicacion: { x: 410, y: 340, texto: '', fuente: 'manual' },
    analisis: null
  };
  document.getElementById('form-reporte')?.reset();
  document.getElementById('preview-foto-wrap').hidden = true;
  document.getElementById('btn-quitar-foto').hidden = true;
  document.getElementById('audio-preview').hidden = true;
  document.getElementById('voz-estado').textContent = '';
}

function renderBarraAvance(estadoActual) {
  const pasos = ['Recibido', 'Canalizado', 'En atención', 'Resuelto'];
  const idx = pasos.indexOf(estadoActual);
  return `
    <div class="progress-track" aria-label="Avance: ${estadoActual}">
      ${pasos.map((p, i) => {
        let cls = '';
        if (estadoActual === 'Requiere más información' && i === 0) cls = 'is-current';
        else if (i < idx) cls = 'is-done';
        else if (i === idx) cls = 'is-current';
        return `<span class="progress-step ${cls}">${p}</span>`;
      }).join('')}
    </div>
  `;
}

export function renderMisReportes() {
  const listaEl = document.getElementById('lista-mis-reportes');
  const detalleEl = document.getElementById('detalle-mi-reporte');
  if (!listaEl || !detalleEl) return;

  const reportes = getEstado().reportes.filter((r) => filtroMisReportes === 'todos' || r.estado === filtroMisReportes);

  if (!reportes.length) {
    listaEl.innerHTML = '<div class="card"><p class="text-muted">No hay reportes en este filtro.</p></div>';
    detalleEl.hidden = true;
    return;
  }

  listaEl.innerHTML = reportes.map((r) => `
    <article class="card">
      <div class="card-header-inline">
        <strong>${r.folio}</strong>
        <span class="badge ${r.estado === 'Resuelto' ? 'badge-green' : r.prioridad === 'Alta' ? 'badge-red' : 'badge-blue'}">${r.estado}</span>
      </div>
      <h3 class="mt-sm">${r.categoria}</h3>
      <p class="text-sm text-muted">${r.ubicacion.texto} · ${new Date(r.creadoEn).toLocaleDateString('es-MX')}</p>
      <p class="text-sm">${r.descripcion}</p>
      <p class="text-sm text-muted"><strong>Canal sugerido:</strong> ${r.dependenciaSugerida}</p>
      ${renderBarraAvance(r.estado)}
      <div class="btn-row mt-sm">
        <button type="button" class="btn btn-outline btn-sm" data-ver-rep="${r.id}">Abrir detalle</button>
      </div>
    </article>
  `).join('');

  listaEl.querySelectorAll('[data-ver-rep]').forEach((btn) => {
    btn.addEventListener('click', () => {
      reporteDetalleId = btn.getAttribute('data-ver-rep');
      renderDetalleMiReporte();
    });
  });

  if (reporteDetalleId) renderDetalleMiReporte();
}

async function renderDetalleMiReporte() {
  const detalleEl = document.getElementById('detalle-mi-reporte');
  const rep = getEstado().reportes.find((r) => r.id === reporteDetalleId);
  if (!rep) {
    detalleEl.hidden = true;
    return;
  }

  const fotoUrl = rep.fotoId ? await obtenerFotoUrl(rep.fotoId) : null;
  const audioUrl = rep.audioId ? await obtenerAudioUrl(rep.audioId) : null;

  detalleEl.hidden = false;
  detalleEl.innerHTML = `
    <div class="card-header-inline">
      <h2>Detalle ${rep.folio}</h2>
      <span class="badge badge-info">${rep.prioridad}</span>
    </div>
    <p class="text-sm text-muted">Estado actual: <strong>${rep.estado}</strong></p>
    <p class="mt-sm">${rep.descripcion}</p>
    <p class="text-sm"><strong>Ubicación:</strong> ${rep.ubicacion.texto}</p>
    <p class="text-sm"><strong>Dependencia sugerida:</strong> ${rep.dependenciaSugerida}</p>
    ${rep.notasAdmin ? `<div class="alert mt-sm"><strong>Nota de seguimiento:</strong> ${rep.notasAdmin}</div>` : ''}
    ${fotoUrl ? `<img src="${fotoUrl}" alt="Fotografía del reporte ${rep.folio}" class="report-photo">` : ''}
    ${audioUrl ? `<audio controls src="${audioUrl}" class="mt-sm full-width"></audio>` : ''}
    <h3 class="mt-md">Confirmación comunitaria</h3>
    <p class="text-sm">Sigue presente: <strong>${rep.confirmaciones.siguePresente}</strong> · Resuelto: <strong>${rep.confirmaciones.resuelto}</strong></p>
    <div class="btn-row mt-sm">
      <button type="button" class="btn btn-outline btn-sm" id="btn-conf-continua">Confirmar que continúa</button>
      <button type="button" class="btn btn-primary btn-sm" id="btn-conf-resuelto">Confirmar que fue resuelto</button>
    </div>
    <div class="field-group mt-md">
      <label for="input-extra-info-rep">Agregar información al reporte</label>
      <input type="text" id="input-extra-info-rep" placeholder="Ejemplo: Hoy sigue obstruida la esquina.">
      <button type="button" class="btn btn-outline btn-sm mt-sm" id="btn-guardar-extra-info">Guardar actualización</button>
    </div>
  `;

  detalleEl.querySelector('#btn-conf-continua')?.addEventListener('click', () => {
    actualizarEstado((s) => {
      const target = s.reportes.find((x) => x.id === rep.id);
      if (target) target.confirmaciones.siguePresente += 1;
    });
    deps.onToast?.('Confirmaste que la barrera continúa.');
    renderDetalleMiReporte();
  });

  detalleEl.querySelector('#btn-conf-resuelto')?.addEventListener('click', () => {
    actualizarEstado((s) => {
      const target = s.reportes.find((x) => x.id === rep.id);
      if (target) {
        target.confirmaciones.resuelto += 1;
        target.estado = 'Resuelto';
        target.actualizadoEn = new Date().toISOString();
      }
    });
    deps.onToast?.('Confirmaste que fue resuelto.');
    renderMisReportes();
  });

  detalleEl.querySelector('#btn-guardar-extra-info')?.addEventListener('click', () => {
    const val = detalleEl.querySelector('#input-extra-info-rep').value.trim();
    if (!val) return;
    actualizarEstado((s) => {
      const target = s.reportes.find((x) => x.id === rep.id);
      if (target) {
        target.descripcion += ` | Actualización: ${val}`;
        target.actualizadoEn = new Date().toISOString();
      }
    });
    deps.onToast?.('Información agregada al reporte.');
    renderMisReportes();
  });
}
