/**
 * Cálculo de rutas accesibles usando un grafo de nodos/tramos y el algoritmo de Dijkstra.
 * Ajusta los costos según el perfil de accesibilidad activo y detecta tramos sin datos.
 */
import { NODOS_MAPA, TRAMOS_MAPA } from './datos-demo.js';

function costoTramoParaPerfil(tramo, perfil) {
  const nec = new Set(perfil.necesidades || []);
  const cfg = new Set(perfil.configRuta || []);
  const usaRuedas = nec.has('sillaManual') || nec.has('sillaElectrica') || nec.has('carriola');

  // Si usa silla de ruedas/carriola o pidió evitar escalones, un tramo con escalones queda bloqueado
  if ((usaRuedas || cfg.has('evitarEscalones')) && tramo.escalones > 0) {
    return Infinity;
  }

  let costo = tramo.distanciaM;

  if (cfg.has('evitarPendientes') && tramo.pendiente === 'fuerte') {
    if (usaRuedas) return Infinity;
    costo *= 2.4;
  } else if (tramo.pendiente === 'media') {
    costo *= 1.15;
  }

  if ((usaRuedas || cfg.has('banquetasAnchas')) && tramo.ancho === 'angosta') {
    costo *= 2.2;
  }

  if (cfg.has('preferirRampasElevadores') && !tramo.rampa) {
    costo *= 1.8;
  }

  if ((nec.has('ceguera') || nec.has('bajaVision') || cfg.has('preferirSemaforoSonoro')) && tramo.semaforoSonoro) {
    costo *= 0.85; // Beneficia cruces con semáforo sonoro
  }

  if (cfg.has('descansosBancas') && tramo.bancas) {
    costo *= 0.9;
  }

  if (tramo.verificacion === 'Sin información') {
    costo *= perfil.preferenciaRuta === 'corta' ? 1.1 : 1.7;
  }

  return costo;
}

export function calcularRutaDijkstra(origenId, destinoId, perfil) {
  const nodosPorId = new Map(NODOS_MAPA.map((n) => [n.id, n]));
  if (!nodosPorId.has(origenId) || !nodosPorId.has(destinoId)) {
    return { reachable: false, motivo: 'Origen o destino no encontrado.' };
  }

  // Construir lista de adyacencia bidireccional
  const ady = new Map();
  NODOS_MAPA.forEach((n) => ady.set(n.id, []));
  for (const tramo of TRAMOS_MAPA) {
    const peso = costoTramoParaPerfil(tramo, perfil);
    if (peso < Infinity) {
      ady.get(tramo.desde).push({ vecino: tramo.hacia, peso, tramo });
      ady.get(tramo.hacia).push({ vecino: tramo.desde, peso, tramo });
    }
  }

  const dist = new Map();
  const prev = new Map();
  const visitado = new Set();

  NODOS_MAPA.forEach((n) => dist.set(n.id, Infinity));
  dist.set(origenId, 0);

  while (visitado.size < NODOS_MAPA.length) {
    let actual = null;
    let mejorDist = Infinity;
    for (const [id, d] of dist.entries()) {
      if (!visitado.has(id) && d < mejorDist) {
        mejorDist = d;
        actual = id;
      }
    }
    if (!actual || mejorDist === Infinity) break;
    if (actual === destinoId) break;
    visitado.add(actual);

    for (const edge of ady.get(actual) || []) {
      if (visitado.has(edge.vecino)) continue;
      const alt = mejorDist + edge.peso;
      if (alt < dist.get(edge.vecino)) {
        dist.set(edge.vecino, alt);
        prev.set(edge.vecino, { nodo: actual, tramo: edge.tramo });
      }
    }
  }

  if (dist.get(destinoId) === Infinity) {
    return {
      reachable: false,
      puedoLlegar: 'No se encontró una ruta continua compatible con tu perfil',
      motivo: 'Los tramos disponibles tienen escalones o pendientes fuertes bloqueadas por tus preferencias.'
    };
  }

  const pathNodes = [];
  const pathEdges = [];
  let cursor = destinoId;
  while (cursor) {
    pathNodes.unshift(nodosPorId.get(cursor));
    const step = prev.get(cursor);
    if (!step) break;
    pathEdges.unshift(step.tramo);
    cursor = step.nodo;
  }

  const totalDistanceM = pathEdges.reduce((acc, t) => acc + t.distanciaM, 0);
  const velocidadMMin = (perfil.necesidades || []).includes('personaMayor') || (perfil.necesidades || []).includes('bastonAndadera') ? 45 : 60;
  const estimatedMinutes = Math.max(2, Math.round(totalDistanceM / velocidadMMin));
  const stairsCount = pathEdges.reduce((acc, t) => acc + t.escalones, 0);
  const rampsCount = pathEdges.filter((t) => t.rampa).length;
  const hasUnknownSegments = pathEdges.some((t) => t.verificacion === 'Sin información');
  const hasSteepSegments = pathEdges.some((t) => t.pendiente === 'fuerte');

  const alerts = [];
  if (hasUnknownSegments) {
    alerts.push('No tenemos datos suficientes de este tramo. Ve con precaución o repórtalo.');
  }
  if (hasSteepSegments) {
    alerts.push('La ruta incluye al menos un tramo con pendiente pronunciada.');
  }
  if ((perfil.configRuta || []).includes('distanciaMaximaActiva') && perfil.distanciaMaxM > 0 && totalDistanceM > perfil.distanciaMaxM) {
    alerts.push(`El recorrido (${totalDistanceM} m) supera tu límite cómodo de ${perfil.distanciaMaxM} m.`);
  }

  const puedoLlegar = hasUnknownSegments
    ? 'Puedes llegar con precaución (datos incompletos en un tramo)'
    : 'Sí, ruta sugerida según los datos disponibles';

  return {
    reachable: true,
    puedoLlegar,
    origenId,
    destinoId,
    pathNodes,
    pathEdges,
    totalDistanceM,
    estimatedMinutes,
    stairsCount,
    rampsCount,
    elevatorsCount: destinoId === 'n_estacion' || destinoId === 'n_biblioteca' || destinoId === 'n_centro_salud' ? 1 : 0,
    hasUnknownSegments,
    alerts,
    instructions: pathEdges.map((t, i) => `${i + 1}. ${t.instruccion} (${t.distanciaM} m, estado: ${t.verificacion})`)
  };
}
