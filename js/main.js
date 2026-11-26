/**
 * Módulo principal de RutaLibre: arranque, enrutador #hash con manejo de foco,
 * barra de accesibilidad, roles, perfiles rápidos, Perfil, Avisos, Ayuda y Plan de trabajo.
 */
import {
  ROLES_INFO,
  OPCIONES_MOVILIDAD,
  CONFIG_RUTA_ASISTENCIA,
  PERFILES_RAPIDOS,
  LUGARES_DEMO
} from './datos-demo.js';
import {
  getEstado,
  actualizarEstado,
  aplicarPerfilRapido,
  exportarEstadoJSON,
  importarEstadoJSON,
  restablecerDemo,
  borrarTodosDatosLocales,
  suscribirEstado
} from './estado.js';
import { limpiarTodosLosMedios } from './medios.js';
import { hablarTexto, detenerLectura, iniciarDictado, soportaReconocimientoVoz } from './voz.js';
import { simplificarAvisoIA, responderAyudaIA, getGeminiKey, setGeminiKey } from './ia.js';
import { initMapa, renderMapa } from './mapa.js';
import { initReportes, renderMisReportes, precargarUbicacionReporte } from './reportes.js';
import { initAdmin, renderAdmin } from './admin.js';

const SECCIONES_VALIDAS = ['inicio', 'mapa', 'reportar', 'mis-reportes', 'avisos', 'ayuda', 'perfil', 'admin', 'plan'];

function anunciarLive(texto) {
  const live = document.getElementById('live-status');
  if (live) live.textContent = texto;
}

function mostrarToast(mensaje) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = mensaje;
  container.appendChild(el);
  anunciarLive(mensaje);
  setTimeout(() => el.remove(), 4500);
}

function abrirDialogo({ titulo, cuerpoHtml, botones = [] }) {
  const dialog = document.getElementById('app-dialog');
  document.getElementById('dialog-titulo').textContent = titulo;
  document.getElementById('dialog-cuerpo').innerHTML = cuerpoHtml;
  const acciones = document.getElementById('dialog-acciones');
  acciones.innerHTML = '';

  botones.forEach((b) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = b.clase || 'btn btn-outline';
    btn.textContent = b.texto;
    btn.addEventListener('click', () => {
      dialog.close();
      b.onClick?.();
    });
    acciones.appendChild(btn);
  });

  dialog.showModal();
}

function solicitarPermisoExplicito({ titulo, mensaje, onAceptar }) {
  abrirDialogo({
    titulo,
    cuerpoHtml: `<p>${mensaje}</p>`,
    botones: [
      { texto: 'Cancelar', clase: 'btn btn-outline' },
      { texto: 'Continuar y permitir', clase: 'btn btn-primary', onClick: onAceptar }
    ]
  });
}

function navegarA(ruta, moverFoco = true) {
  const destino = SECCIONES_VALIDAS.includes(ruta) ? ruta : 'inicio';
  if (window.location.hash !== `#${destino}`) {
    window.location.hash = `#${destino}`;
  }

  document.querySelectorAll('.page-section').forEach((sec) => {
    const activa = sec.getAttribute('data-section') === destino;
    sec.hidden = !activa;
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('data-route') === destino);
  });

  // Cerrar menú móvil si estaba abierto
  const nav = document.getElementById('menu-principal');
  const toggle = document.getElementById('btn-menu-movil');
  nav?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');

  // Re-render específico de sección
  if (destino === 'mapa') renderMapa();
  if (destino === 'mis-reportes') renderMisReportes();
  if (destino === 'admin') renderAdmin();
  if (destino === 'inicio') renderInicioGuardados();
  if (destino === 'avisos') renderAvisos();
  if (destino === 'plan') renderPlanTrabajo();

  if (moverFoco) {
    const h1 = document.querySelector(`#sec-${destino} h1`);
    h1?.focus();
  }

  // "Acceso sin visión" habla solo si la persona lo activó explícitamente
  if (getEstado().a11y.accesoSinVision) {
    const h1Text = document.querySelector(`#sec-${destino} h1`)?.textContent || destino;
    hablarTexto(`Sección ${h1Text}`);
  }
}

function aplicarClasesA11y() {
  const { a11y } = getEstado();
  const root = document.documentElement;
  root.classList.toggle('a11y-large-text', Boolean(a11y.textoGrande));
  root.classList.toggle('a11y-high-contrast', Boolean(a11y.altoContraste));
  root.classList.toggle('a11y-reduced-motion', Boolean(a11y.reducirAnimaciones));

  document.querySelectorAll('[data-a11y-toggle]').forEach((btn) => {
    const key = btn.getAttribute('data-a11y-toggle');
    btn.setAttribute('aria-pressed', String(Boolean(a11y[key])));
  });

  const btnLectura = document.getElementById('btn-leer-pantalla');
  btnLectura?.setAttribute('aria-pressed', String(Boolean(a11y.lecturaVozAlta)));
}

function actualizarUIRolYPerfilesRapidos() {
  const est = getEstado();
  const select = document.getElementById('selector-rol');
  if (select) select.value = est.rolActivo;

  const navAdmin = document.getElementById('nav-item-admin');
  if (navAdmin) navAdmin.hidden = est.rolActivo !== 'administrador';

  const infoRol = ROLES_INFO[est.rolActivo] || ROLES_INFO.ciudadano;
  const resumenEl = document.getElementById('resumen-rol-activo');
  if (resumenEl) {
    resumenEl.innerHTML = `<strong>Rol actual: ${infoRol.nombre}</strong><br>${infoRol.resumen}`;
  }

  document.querySelectorAll('[data-set-role]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-role') === est.rolActivo));
  });

  const subPerfil = document.getElementById('perfil-subtitulo-rol');
  if (subPerfil) {
    subPerfil.textContent = est.rolActivo === 'cuidador'
      ? 'Modo Cuidador activo: configura las necesidades de la persona que acompañas.'
      : 'Configura tus necesidades de movilidad y preferencias. Todo se guarda en este navegador.';
  }

  document.querySelectorAll('[data-quick-profile]').forEach((btn) => {
    const key = btn.getAttribute('data-quick-profile');
    btn.setAttribute('aria-pressed', String(est.perfilRapidoActivo === key));
  });

  const badgePerfil = document.getElementById('quick-profile-status');
  if (badgePerfil) {
    badgePerfil.textContent = est.perfilRapidoActivo && PERFILES_RAPIDOS[est.perfilRapidoActivo]
      ? `Activo: ${PERFILES_RAPIDOS[est.perfilRapidoActivo].nombre}`
      : 'Personalizado';
  }
}

function renderInicioGuardados() {
  const est = getEstado();
  const favBox = document.getElementById('inicio-favoritos-lista');
  const rutasBox = document.getElementById('inicio-rutas-lista');

  if (favBox) {
    const favs = LUGARES_DEMO.filter((l) => est.favoritos.includes(l.id));
    favBox.innerHTML = favs.length
      ? `<ul class="simple-list">${favs.map((f) => `<li><strong>${f.nombre}</strong> — ${f.ubicacion}</li>`).join('')}</ul>`
      : '<p class="text-muted">Aún no guardas lugares favoritos desde el mapa.</p>';
  }

  if (rutasBox) {
    rutasBox.innerHTML = est.rutasGuardadas.length
      ? `<ul class="simple-list">${est.rutasGuardadas.map((r) => `<li><strong>${r.destino}</strong> (${r.distanciaM} m, ~${r.minutos} min) — ${r.guardadaEn}</li>`).join('')}</ul>`
      : '<p class="text-muted">Aún no guardas rutas desde el mapa.</p>';
  }
}

function renderFormularioPerfil() {
  const est = getEstado();
  const gridNec = document.getElementById('grid-necesidades');
  const gridCfg = document.getElementById('grid-config-ruta');
  if (!gridNec || !gridCfg) return;

  gridNec.innerHTML = OPCIONES_MOVILIDAD.map((op) => {
    const checked = est.perfil.necesidades.includes(op.id) ? 'checked' : '';
    return `
      <label class="check-card">
        <input type="checkbox" name="necesidad" value="${op.id}" ${checked}>
        <span>${op.etiqueta}</span>
      </label>
    `;
  }).join('');

  gridCfg.innerHTML = CONFIG_RUTA_ASISTENCIA.map((op) => {
    const checked = est.perfil.configRuta.includes(op.id) ? 'checked' : '';
    return `
      <label class="check-card">
        <input type="checkbox" name="configRuta" value="${op.id}" ${checked}>
        <span>${op.etiqueta}</span>
      </label>
    `;
  }).join('');

  document.getElementById('perfil-otro-texto').value = est.perfil.otroTexto || '';
  document.getElementById('perfil-distancia-max').value = String(est.perfil.distanciaMaxM ?? 800);
  document.getElementById('perfil-preferencia-ruta').value = est.perfil.preferenciaRuta || 'accesible';
}

function renderAvisos() {
  const container = document.getElementById('lista-avisos');
  if (!container) return;
  const avisos = getEstado().avisos;

  container.innerHTML = avisos.map((av) => `
    <article class="card">
      <div class="card-header-inline">
        <span class="badge badge-demo">${av.fuente}</span>
        <span class="text-sm text-muted">${av.fecha}</span>
      </div>
      <h2 class="mt-sm">${av.titulo}</h2>
      <p class="text-sm"><strong>Ubicación:</strong> ${av.ubicacion} · <strong>Vigencia:</strong> ${av.vigencia}</p>
      <p class="mt-sm">${av.descripcion}</p>
      <div class="ai-answer-box mt-sm" id="aviso-simple-${av.id}" hidden></div>
      <div class="btn-row mt-md">
        <button type="button" class="btn btn-outline btn-sm" data-aviso-escuchar="${av.id}">Escuchar</button>
        <button type="button" class="btn btn-primary btn-sm" data-aviso-simplificar="${av.id}">Explicar en palabras sencillas</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-aviso-escuchar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const av = avisos.find((x) => x.id === btn.getAttribute('data-aviso-escuchar'));
      if (av) hablarTexto(`${av.titulo}. Ubicación: ${av.ubicacion}. ${av.descripcion}`);
    });
  });

  container.querySelectorAll('[data-aviso-simplificar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-aviso-simplificar');
      const av = avisos.find((x) => x.id === id);
      const box = document.getElementById(`aviso-simple-${id}`);
      if (!av || !box) return;
      box.hidden = false;
      box.textContent = 'Generando explicación sencilla...';
      const res = await simplificarAvisoIA(av);
      box.innerHTML = `<strong>Explicación sencilla (${res.modo === 'gemini' ? 'Gemini' : 'Modo demostración'}):</strong> ${res.texto}`;
    });
  });
}

function renderPlanTrabajo() {
  const tbody = document.getElementById('tbody-plan-trabajo');
  if (!tbody) return;
  const filas = getEstado().planTrabajo;

  tbody.innerHTML = filas.map((f, i) => `
    <tr data-plan-idx="${i}">
      <td><input type="text" data-field="etapa" value="${f.etapa}" aria-label="Etapa fila ${i + 1}"></td>
      <td><input type="text" data-field="actividad" value="${f.actividad}" aria-label="Actividad fila ${i + 1}"></td>
      <td><input type="text" data-field="descripcion" value="${f.descripcion}" aria-label="Descripción fila ${i + 1}"></td>
      <td><input type="text" data-field="responsable" value="${f.responsable}" aria-label="Responsable fila ${i + 1}"></td>
      <td>
        <select data-field="prioridad" aria-label="Prioridad fila ${i + 1}">
          ${['Debe tener', 'Debería tener', 'Podría tener'].map((p) => `<option value="${p}" ${f.prioridad === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" data-field="horas" value="${f.horas}" aria-label="Horas fila ${i + 1}"></td>
      <td><input type="text" data-field="fechaLimite" value="${f.fechaLimite}" aria-label="Fecha límite fila ${i + 1}"></td>
      <td><input type="text" data-field="dependeDe" value="${f.dependeDe}" aria-label="Depende de fila ${i + 1}"></td>
      <td><input type="text" data-field="criterio" value="${f.criterio}" aria-label="Criterio fila ${i + 1}"></td>
      <td>
        <select data-field="estado" aria-label="Estado fila ${i + 1}">
          ${['Completado', 'En proceso', 'Pendiente'].map((s) => `<option value="${s}" ${f.estado === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('input, select').forEach((ctrl) => {
    ctrl.addEventListener('change', (e) => {
      const tr = e.target.closest('tr');
      const idx = Number(tr.getAttribute('data-plan-idx'));
      const field = e.target.getAttribute('data-field');
      actualizarEstado((s) => {
        if (s.planTrabajo[idx]) s.planTrabajo[idx][field] = e.target.value;
      });
      mostrarToast('Plan de trabajo actualizado en el navegador.');
    });
  });
}

function exportarPlanComoMarkdown() {
  const filas = getEstado().planTrabajo;
  const header = '| Etapa | Actividad | Descripción | Responsable | Prioridad | Horas est. | Fecha límite | Depende de | Criterio de terminado | Estado |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |';
  const rows = filas.map((f) => `| ${f.etapa} | ${f.actividad} | ${f.descripcion} | ${f.responsable} | ${f.prioridad} | ${f.horas} | ${f.fechaLimite} | ${f.dependeDe} | ${f.criterio} | ${f.estado} |`).join('\n');
  const md = `# Plan de Trabajo — RutaLibre\n\n${header}\n${rows}\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PLAN_DE_TRABAJO_exportado.md';
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast('Plan exportado como Markdown (.md).');
}

function inicializarEventosGlobales() {
  // Diálogo cerrar
  document.getElementById('dialog-cerrar')?.addEventListener('click', () => {
    document.getElementById('app-dialog').close();
  });

  // Menú móvil
  const btnMenu = document.getElementById('btn-menu-movil');
  const nav = document.getElementById('menu-principal');
  btnMenu?.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-open');
    btnMenu.setAttribute('aria-expanded', String(abierto));
  });

  // Selector de rol y tarjetas de rol en Inicio
  const cambiarRol = (nuevoRol) => {
    actualizarEstado((s) => { s.rolActivo = nuevoRol; });
    actualizarUIRolYPerfilesRapidos();
    renderAdmin();
    mostrarToast(`Rol cambiado a: ${ROLES_INFO[nuevoRol]?.nombre || nuevoRol}`);
  };

  document.getElementById('selector-rol')?.addEventListener('change', (e) => cambiarRol(e.target.value));
  document.querySelectorAll('[data-set-role]').forEach((btn) => {
    btn.addEventListener('click', () => cambiarRol(btn.getAttribute('data-set-role')));
  });

  // Perfiles rápidos (5 botones)
  document.querySelectorAll('[data-quick-profile]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const clave = btn.getAttribute('data-quick-profile');
      aplicarPerfilRapido(clave);
      aplicarClasesA11y();
      actualizarUIRolYPerfilesRapidos();
      renderFormularioPerfil();
      mostrarToast(`Perfil rápido "${PERFILES_RAPIDOS[clave].nombre}" aplicado.`);
    });
  });

  // Barra de accesibilidad
  document.querySelectorAll('[data-a11y-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-a11y-toggle');
      actualizarEstado((s) => { s.a11y[key] = !s.a11y[key]; });
      aplicarClasesA11y();
      if (key === 'accesoSinVision' && getEstado().a11y.accesoSinVision) {
        hablarTexto('Acceso sin visión activado. Se leerá el título al cambiar de sección.');
      }
    });
  });

  document.getElementById('btn-leer-pantalla')?.addEventListener('click', () => {
    const activo = !getEstado().a11y.lecturaVozAlta;
    actualizarEstado((s) => { s.a11y.lecturaVozAlta = activo; });
    aplicarClasesA11y();
    if (activo) {
      const secVisible = Array.from(document.querySelectorAll('.page-section')).find((s) => !s.hidden);
      const texto = secVisible ? secVisible.innerText.slice(0, 700) : 'RutaLibre, la ciudad para todas las personas.';
      hablarTexto(texto, () => {
        actualizarEstado((s) => { s.a11y.lecturaVozAlta = false; });
        aplicarClasesA11y();
      });
    } else {
      detenerLectura();
    }
  });

  document.getElementById('btn-inicio-escuchar')?.addEventListener('click', () => {
    hablarTexto('RutaLibre. La ciudad, para todas las personas. Consulta barreras urbanas, lugares con accesibilidad reportada, planea rutas adaptadas y reporta problemas de tu calle.');
  });

  // Formulario Perfil de accesibilidad
  document.getElementById('form-perfil')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const necesidades = Array.from(document.querySelectorAll('input[name="necesidad"]:checked')).map((el) => el.value);
    const configRuta = Array.from(document.querySelectorAll('input[name="configRuta"]:checked')).map((el) => el.value);
    const otroTexto = document.getElementById('perfil-otro-texto').value.trim();
    const distanciaMaxM = Number(document.getElementById('perfil-distancia-max').value);
    const preferenciaRuta = document.getElementById('perfil-preferencia-ruta').value;

    actualizarEstado((s) => {
      s.perfilRapidoActivo = null;
      s.perfil = { necesidades, otroTexto, configRuta, distanciaMaxM, preferenciaRuta };
    });
    actualizarUIRolYPerfilesRapidos();
    mostrarToast('Perfil de accesibilidad guardado en este navegador.');
  });

  // Gemini clave temporal de sesión
  const actualizarEstadoGeminiUI = () => {
    const el = document.getElementById('gemini-key-estado');
    if (el) {
      el.textContent = getGeminiKey()
        ? 'Clave temporal activa en esta sesión (Gemini habilitado).'
        : 'Actualmente en Modo Demostración (sin clave activa).';
    }
  };
  actualizarEstadoGeminiUI();

  document.getElementById('btn-guardar-gemini-key')?.addEventListener('click', () => {
    const val = document.getElementById('input-gemini-key').value;
    setGeminiKey(val);
    actualizarEstadoGeminiUI();
    mostrarToast(val.trim() ? 'Clave temporal guardada solo para esta sesión.' : 'Modo demostración activo.');
  });

  document.getElementById('btn-limpiar-gemini-key')?.addEventListener('click', () => {
    document.getElementById('input-gemini-key').value = '';
    setGeminiKey('');
    actualizarEstadoGeminiUI();
    mostrarToast('Se regresó al Modo Demostración.');
  });

  // Exportar / Importar / Restablecer / Borrar todo
  document.getElementById('btn-exportar-json')?.addEventListener('click', () => {
    const blob = new Blob([exportarEstadoJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutalibre-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast('Respaldo JSON exportado.');
  });

  document.getElementById('input-importar-json')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const txt = await file.text();
      importarEstadoJSON(txt);
      renderMisReportes();
      renderAdmin();
      mostrarToast('Reportes importados correctamente.');
    } catch (err) {
      mostrarToast(err.message || 'No se pudo importar el archivo JSON.');
    }
  });

  document.getElementById('btn-restablecer-demo')?.addEventListener('click', async () => {
    await limpiarTodosLosMedios();
    restablecerDemo();
    aplicarClasesA11y();
    actualizarUIRolYPerfilesRapidos();
    renderFormularioPerfil();
    renderMisReportes();
    renderAdmin();
    renderPlanTrabajo();
    mostrarToast('Datos de demostración restablecidos.');
  });

  document.getElementById('btn-borrar-todos-datos')?.addEventListener('click', () => {
    abrirDialogo({
      titulo: 'Borrar todos mis datos',
      cuerpoHtml: '<p>Esta acción eliminará tus reportes, fotos, audios, favoritos, rutas y preferencias guardadas en este navegador. ¿Deseas continuar?</p>',
      botones: [
        { texto: 'Cancelar', clase: 'btn btn-outline' },
        {
          texto: 'Sí, borrar todo',
          clase: 'btn btn-danger',
          onClick: async () => {
            await limpiarTodosLosMedios();
            borrarTodosDatosLocales();
            setGeminiKey('');
            aplicarClasesA11y();
            actualizarUIRolYPerfilesRapidos();
            renderFormularioPerfil();
            renderMisReportes();
            renderInicioGuardados();
            mostrarToast('Todos los datos locales fueron borrados.');
          }
        }
      ]
    });
  });

  // Ayuda: IA y botón 911 informativo
  document.getElementById('btn-ayuda-preguntar')?.addEventListener('click', async () => {
    const pregunta = document.getElementById('ayuda-pregunta-input').value.trim();
    if (!pregunta) return;
    const box = document.getElementById('ayuda-respuesta-box');
    box.hidden = false;
    box.textContent = 'Consultando ayuda...';
    const res = await responderAyudaIA(pregunta);
    box.innerHTML = `<strong>Respuesta (${res.modo === 'gemini' ? 'Gemini' : 'Modo demostración'}):</strong><p class="mt-sm">${res.texto}</p>`;
  });

  const btnAyudaVoz = document.getElementById('btn-ayuda-voz');
  if (btnAyudaVoz && !soportaReconocimientoVoz()) {
    btnAyudaVoz.disabled = true;
    btnAyudaVoz.title = 'Dictado por voz no disponible en este navegador';
  }
  btnAyudaVoz?.addEventListener('click', () => {
    solicitarPermisoExplicito({
      titulo: 'Permiso de micrófono para Ayuda',
      mensaje: 'Escucharemos tu pregunta para escribirla en el cuadro de ayuda.',
      onAceptar: () => {
        iniciarDictado({
          onResultado: (txt) => {
            document.getElementById('ayuda-pregunta-input').value = txt;
            document.getElementById('btn-ayuda-preguntar').click();
          },
          onError: (msg) => mostrarToast(msg)
        });
      }
    });
  });

  document.getElementById('btn-emergencia-911')?.addEventListener('click', () => {
    abrirDialogo({
      titulo: 'Información de Emergencia (911)',
      cuerpoHtml: `
        <div class="alert alert-danger">
          <strong>Número nacional de emergencias en México: 911</strong>
        </div>
        <p>Esta aplicación es un prototipo de demostración y <strong>no realiza ni simula llamadas telefónicas</strong>.</p>
        <p>Si estás en peligro o ante una emergencia médica o vial real, marca el <strong>911</strong> directamente desde tu teléfono.</p>
      `,
      botones: [{ texto: 'Entendido', clase: 'btn btn-primary' }]
    });
  });

  // Plan de trabajo
  document.getElementById('btn-exportar-plan-md')?.addEventListener('click', exportarPlanComoMarkdown);
  document.getElementById('btn-agregar-fila-plan')?.addEventListener('click', () => {
    actualizarEstado((s) => {
      s.planTrabajo.push({
        etapa: 'Nueva etapa',
        actividad: 'Nueva actividad',
        descripcion: 'Descripción breve',
        responsable: '[Nombre]',
        prioridad: 'Debería tener',
        horas: '1',
        fechaLimite: 'Día 3',
        dependeDe: '—',
        criterio: 'Verificado',
        estado: 'Pendiente'
      });
    });
    renderPlanTrabajo();
  });

  // Quota error listener global
  window.addEventListener('rutalibre:quota-error', () => {
    mostrarToast('Almacenamiento lleno (QuotaExceededError). Exporta o borra reportes antiguos.');
  });

  // Router #hash
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'inicio';
    navegarA(hash, true);
  });
}

// Arranque
document.addEventListener('DOMContentLoaded', () => {
  aplicarClasesA11y();
  actualizarUIRolYPerfilesRapidos();
  renderFormularioPerfil();
  renderInicioGuardados();
  renderAvisos();
  renderPlanTrabajo();

  initMapa({
    onToast: mostrarToast,
    onSolicitarPermiso: solicitarPermisoExplicito,
    onReportarLugar: (lugar) => {
      precargarUbicacionReporte(lugar);
      navegarA('reportar', true);
    }
  });

  initReportes({
    onToast: mostrarToast,
    onSolicitarPermiso: solicitarPermisoExplicito,
    onIrA: (ruta) => navegarA(ruta, true)
  });

  initAdmin({
    onToast: mostrarToast,
    onCambiarRolAdmin: () => {
      actualizarEstado((s) => { s.rolActivo = 'administrador'; });
      actualizarUIRolYPerfilesRapidos();
      renderAdmin();
      mostrarToast('Rol cambiado a Administrador (demostración).');
    }
  });

  suscribirEstado(() => {
    renderInicioGuardados();
  });

  inicializarEventosGlobales();

  const rutaInicial = window.location.hash.replace('#', '') || 'inicio';
  navegarA(rutaInicial, false);
});
