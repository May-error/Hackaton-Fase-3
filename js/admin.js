/**
 * Panel Administrador (demostración).
 * Muestra métricas en vivo y permite editar categoría, prioridad, estado,
 * dependencia sugerida y notas, reflejándose inmediatamente en Mis reportes.
 */
import { CATEGORIAS_REPORTE, ESTADOS_REPORTE } from './datos-demo.js';
import { getEstado, actualizarEstado } from './estado.js';
import { obtenerFotoUrl, obtenerAudioUrl } from './medios.js';

let adminSeleccionadoId = null;
let filtroEstado = 'todos';
let filtroPrioridad = 'todos';
let onToastCb = null;

export function initAdmin({ onToast, onCambiarRolAdmin } = {}) {
  onToastCb = onToast;

  document.getElementById('btn-activar-rol-admin')?.addEventListener('click', () => {
    onCambiarRolAdmin?.();
  });

  document.getElementById('admin-filtro-estado')?.addEventListener('change', (e) => {
    filtroEstado = e.target.value;
    renderAdmin();
  });

  document.getElementById('admin-filtro-prioridad')?.addEventListener('change', (e) => {
    filtroPrioridad = e.target.value;
    renderAdmin();
  });

  renderAdmin();
}

function calcularTiempoPromedioHoras(reportes) {
  if (!reportes.length) return '0 h';
  let totalHoras = 0;
  for (const r of reportes) {
    const inicio = new Date(r.creadoEn).getTime();
    const fin = new Date(r.actualizadoEn || r.creadoEn).getTime();
    totalHoras += Math.max(1, (fin - inicio) / (1000 * 60 * 60));
  }
  return `${Math.round(totalHoras / reportes.length)} h`;
}

export function renderAdmin() {
  const est = getEstado();
  const bloqueo = document.getElementById('admin-bloqueo-rol');
  const contenido = document.getElementById('admin-contenido');
  if (!bloqueo || !contenido) return;

  const esAdmin = est.rolActivo === 'administrador';
  bloqueo.hidden = esAdmin;
  contenido.hidden = !esAdmin;
  if (!esAdmin) return;

  const reps = est.reportes;
  const total = reps.length;
  const recibidos = reps.filter((r) => r.estado === 'Recibido').length;
  const enAtencion = reps.filter((r) => r.estado === 'En atención' || r.estado === 'Canalizado').length;
  const pendientes = reps.filter((r) => r.estado !== 'Resuelto').length;
  const resueltos = reps.filter((r) => r.estado === 'Resuelto').length;
  const alta = reps.filter((r) => r.prioridad === 'Alta').length;
  const pctResueltos = total ? Math.round((resueltos / total) * 100) : 0;
  const tiempoProm = calcularTiempoPromedioHoras(reps);

  // Conteo por categoría
  const porCategoria = {};
  for (const r of reps) {
    porCategoria[r.categoria] = (porCategoria[r.categoria] || 0) + 1;
  }
  const topCategorias = Object.entries(porCategoria)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ') || 'Sin registros';

  document.getElementById('admin-metricas').innerHTML = `
    <div class="metric-card"><span>Total (demo)</span><span class="metric-value">${total}</span><span class="text-sm text-muted">Recibidos: ${recibidos} · Pendientes: ${pendientes}</span></div>
    <div class="metric-card"><span>En atención / canalizados</span><span class="metric-value">${enAtencion}</span><span class="text-sm text-muted">Prioridad alta: ${alta}</span></div>
    <div class="metric-card"><span>Resueltos</span><span class="metric-value">${pctResueltos}%</span><span class="text-sm text-muted">${resueltos} de ${total} reportes</span></div>
    <div class="metric-card"><span>Tiempo prom. por estado</span><span class="metric-value">${tiempoProm}</span><span class="text-sm text-muted">${topCategorias}</span></div>
  `;

  const filtrados = reps.filter((r) => {
    if (filtroEstado !== 'todos' && r.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'todos' && r.prioridad !== filtroPrioridad) return false;
    return true;
  });

  const listaEl = document.getElementById('admin-lista-reportes');
  if (!filtrados.length) {
    listaEl.innerHTML = '<div class="card"><p class="text-muted">No hay reportes con esos filtros.</p></div>';
  } else {
    listaEl.innerHTML = filtrados.map((r) => `
      <article class="card">
        <div class="card-header-inline">
          <strong>${r.folio}</strong>
          <span class="badge ${r.prioridad === 'Alta' ? 'badge-red' : r.prioridad === 'Media' ? 'badge-yellow' : 'badge-info'}">${r.prioridad}</span>
        </div>
        <h3 class="mt-sm">${r.categoria} — <span class="text-sm">${r.estado}</span></h3>
        <p class="text-sm text-muted">${r.ubicacion.texto}</p>
        <p class="text-sm">${r.descripcion}</p>
        <button type="button" class="btn btn-outline btn-sm mt-sm" data-admin-open="${r.id}">Gestionar reporte</button>
      </article>
    `).join('');

    listaEl.querySelectorAll('[data-admin-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        adminSeleccionadoId = btn.getAttribute('data-admin-open');
        renderDetalleAdmin();
      });
    });
  }

  if (adminSeleccionadoId) renderDetalleAdmin();
}

async function renderDetalleAdmin() {
  const panel = document.getElementById('admin-detalle-panel');
  const rep = getEstado().reportes.find((r) => r.id === adminSeleccionadoId);
  if (!panel || !rep) return;

  const fotoUrl = rep.fotoId ? await obtenerFotoUrl(rep.fotoId) : null;
  const audioUrl = rep.audioId ? await obtenerAudioUrl(rep.audioId) : null;

  panel.innerHTML = `
    <div class="card-header-inline">
      <h2>Gestionar ${rep.folio}</h2>
      <span class="badge badge-demo">Solo demostración</span>
    </div>
    <p class="text-sm text-muted">Ubicación: ${rep.ubicacion.texto} · Rol autor: ${rep.rolAutor}</p>
    ${fotoUrl ? `<img src="${fotoUrl}" alt="Evidencia del reporte ${rep.folio}" class="report-photo">` : '<p class="text-sm text-muted mt-sm">Sin fotografía adjunta.</p>'}
    ${audioUrl ? `<audio controls src="${audioUrl}" class="mt-sm full-width"></audio>` : ''}
    <div class="ai-banner mt-sm text-sm">
      <strong>Análisis original de IA / Demo:</strong><br>
      Categoría: ${rep.analisisIA?.categoria || 'N/A'} · Prioridad: ${rep.analisisIA?.prioridad || 'N/A'}<br>
      Editado por ciudadano: ${rep.editadoPorPersona ? 'Sí' : 'No'}
    </div>
    <form id="form-admin-editar" class="mt-md">
      <div class="field-group">
        <label for="adm-cat">Categoría</label>
        <select id="adm-cat">${CATEGORIAS_REPORTE.map((c) => `<option value="${c}" ${c === rep.categoria ? 'selected' : ''}>${c}</option>`).join('')}</select>
      </div>
      <div class="grid-2 mt-sm">
        <div class="field-group">
          <label for="adm-prio">Prioridad</label>
          <select id="adm-prio">${['Alta', 'Media', 'Baja'].map((p) => `<option value="${p}" ${p === rep.prioridad ? 'selected' : ''}>${p}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="adm-est">Estado</label>
          <select id="adm-est">${ESTADOS_REPORTE.map((s) => `<option value="${s}" ${s === rep.estado ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
      </div>
      <div class="field-group mt-sm">
        <label for="adm-dep">Dependencia sugerida (ejemplo)</label>
        <input type="text" id="adm-dep" value="${rep.dependenciaSugerida}">
      </div>
      <div class="field-group mt-sm">
        <label for="adm-notas">Notas del administrador</label>
        <textarea id="adm-notas" rows="3">${rep.notasAdmin || ''}</textarea>
      </div>
      <div class="btn-row mt-md">
        <button type="submit" class="btn btn-primary">Guardar cambios</button>
        <button type="button" class="btn btn-secondary" id="btn-adm-resolver">Marcar como resuelto</button>
      </div>
    </form>
  `;

  panel.querySelector('#form-admin-editar')?.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarCambiosAdmin(
      rep.id,
      panel.querySelector('#adm-cat').value,
      panel.querySelector('#adm-prio').value,
      panel.querySelector('#adm-est').value,
      panel.querySelector('#adm-dep').value,
      panel.querySelector('#adm-notas').value
    );
  });

  panel.querySelector('#btn-adm-resolver')?.addEventListener('click', () => {
    guardarCambiosAdmin(
      rep.id,
      panel.querySelector('#adm-cat').value,
      panel.querySelector('#adm-prio').value,
      'Resuelto',
      panel.querySelector('#adm-dep').value,
      panel.querySelector('#adm-notas').value || 'Marcado como resuelto en demostración.'
    );
  });
}

function guardarCambiosAdmin(id, categoria, prioridad, estadoNuevo, dependenciaSugerida, notasAdmin) {
  actualizarEstado((s) => {
    const target = s.reportes.find((r) => r.id === id);
    if (!target) return;
    target.categoria = categoria;
    target.prioridad = prioridad;
    target.estado = estadoNuevo;
    target.dependenciaSugerida = dependenciaSugerida;
    target.notasAdmin = notasAdmin;
    target.actualizadoEn = new Date().toISOString();
    target.historial.push({
      fecha: target.actualizadoEn,
      estado: estadoNuevo,
      nota: notasAdmin || 'Actualizado desde Panel Administrador (demo).'
    });
  });
  onToastCb?.('Cambios guardados y reflejados en Mis reportes.');
  renderAdmin();
  renderDetalleAdmin();
}
