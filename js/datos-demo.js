/**
 * Datos de demostración y catálogos fijos de RutaLibre.
 * Todas las calles, lugares, avisos y dependencias son ficticios para demostración.
 */

export const ROLES_INFO = {
  ciudadano: {
    id: 'ciudadano',
    nombre: 'Ciudadano',
    resumen: 'Consulta mapa y rutas, reporta barreras con foto, voz o texto, revisa tus folios y guarda lugares.'
  },
  cuidador: {
    id: 'cuidador',
    nombre: 'Cuidador o acompañante',
    resumen: 'Configura las necesidades de accesibilidad de quien acompañas, guarda y comparte trayectos y usa lectura en voz alta.'
  },
  administrador: {
    id: 'administrador',
    nombre: 'Administrador (demostración)',
    resumen: 'Revisa todos los reportes de demostración, analiza fotos e IA, edita prioridad/estado y refleja cambios en Mis reportes.'
  }
};

export const OPCIONES_MOVILIDAD = [
  { id: 'sillaManual', etiqueta: 'Silla de ruedas manual' },
  { id: 'sillaElectrica', etiqueta: 'Silla de ruedas eléctrica' },
  { id: 'bastonAndadera', etiqueta: 'Bastón o andadera' },
  { id: 'muletas', etiqueta: 'Muletas' },
  { id: 'bajaVision', etiqueta: 'Baja visión' },
  { id: 'ceguera', etiqueta: 'Ceguera' },
  { id: 'sordera', etiqueta: 'Sordera o hipoacusia' },
  { id: 'cognitiva', etiqueta: 'Discapacidad intelectual o cognitiva (lectura fácil)' },
  { id: 'personaMayor', etiqueta: 'Persona mayor' },
  { id: 'carriola', etiqueta: 'Carriola' },
  { id: 'embarazo', etiqueta: 'Embarazo' },
  { id: 'lesionTemporal', etiqueta: 'Lesión temporal' }
];

export const CONFIG_RUTA_ASISTENCIA = [
  { id: 'evitarEscalones', etiqueta: 'Evitar escalones' },
  { id: 'evitarPendientes', etiqueta: 'Evitar pendientes fuertes' },
  { id: 'preferirRampasElevadores', etiqueta: 'Preferir rampas y elevadores' },
  { id: 'preferirSemaforoSonoro', etiqueta: 'Preferir cruces con semáforo sonoro' },
  { id: 'banquetasAnchas', etiqueta: 'Preferir banquetas anchas' },
  { id: 'distanciaMaximaActiva', etiqueta: 'Limitar distancia máxima a pie' },
  { id: 'descansosBancas', etiqueta: 'Preferir descansos con bancas' },
  { id: 'banoAccesibleDestino', etiqueta: 'Buscar baño accesible en el destino' },
  { id: 'guiaVozPasoAPaso', etiqueta: 'Guía por voz paso a paso' }
];

export const PERFILES_RAPIDOS = {
  sillaRuedas: {
    nombre: 'Silla de ruedas',
    necesidades: ['sillaManual'],
    configRuta: ['evitarEscalones', 'evitarPendientes', 'preferirRampasElevadores', 'banquetasAnchas', 'banoAccesibleDestino'],
    a11y: {}
  },
  bastonAndadera: {
    nombre: 'Bastón o andadera',
    necesidades: ['bastonAndadera'],
    configRuta: ['evitarEscalones', 'evitarPendientes', 'descansosBancas', 'distanciaMaximaActiva'],
    a11y: {}
  },
  bajaVision: {
    nombre: 'Baja visión o ceguera',
    necesidades: ['bajaVision'],
    configRuta: ['preferirSemaforoSonoro', 'banquetasAnchas', 'guiaVozPasoAPaso'],
    a11y: { textoGrande: true, altoContraste: true, guiaPorVoz: true }
  },
  carriola: {
    nombre: 'Carriola',
    necesidades: ['carriola'],
    configRuta: ['evitarEscalones', 'preferirRampasElevadores', 'banquetasAnchas'],
    a11y: {}
  },
  personaMayor: {
    nombre: 'Persona mayor',
    necesidades: ['personaMayor'],
    configRuta: ['evitarEscalones', 'evitarPendientes', 'descansosBancas', 'distanciaMaximaActiva', 'banoAccesibleDestino'],
    a11y: { textoGrande: true }
  }
};

export const CATEGORIAS_REPORTE = [
  'Banqueta dañada',
  'Rampa bloqueada',
  'Falta de rampa',
  'Escaleras sin alternativa',
  'Elevador fuera de servicio',
  'Obstrucción',
  'Cruce peligroso',
  'Transporte inaccesible',
  'Señalización insuficiente',
  'Otro'
];

export const ESTADOS_REPORTE = [
  'Recibido',
  'Canalizado',
  'En atención',
  'Resuelto',
  'Requiere más información'
];

export const DEPENDENCIAS_EJEMPLO = {
  'Banqueta dañada': 'Obras y banquetas municipales (ejemplo)',
  'Rampa bloqueada': 'Movilidad y tránsito local (ejemplo)',
  'Falta de rampa': 'Infraestructura peatonal (ejemplo)',
  'Escaleras sin alternativa': 'Accesibilidad urbana (ejemplo)',
  'Elevador fuera de servicio': 'Mantenimiento de estaciones (ejemplo)',
  'Obstrucción': 'Ordenamiento en vía pública (ejemplo)',
  'Cruce peligroso': 'Seguridad vial y semáforos (ejemplo)',
  'Transporte inaccesible': 'Operación de transporte público (ejemplo)',
  'Señalización insuficiente': 'Señalización e inclusión (ejemplo)',
  'Otro': 'Atención ciudadana general (ejemplo)'
};

/** Nodos del grafo urbano de demostración */
export const NODOS_MAPA = [
  { id: 'n_origen', nombre: 'Tu punto de partida [Calle ejemplo #1]', x: 110, y: 340, esOrigen: true },
  { id: 'n_cruce_sur', nombre: 'Esquina [Calle ejemplo y Sur]', x: 240, y: 340 },
  { id: 'n_centro_salud', nombre: 'Centro de Salud Comunitario [Calle ejemplo #12]', x: 240, y: 210 },
  { id: 'n_plaza', nombre: 'Plaza Cívica [Av. ejemplo #25]', x: 410, y: 210 },
  { id: 'n_escuela', nombre: 'Escuela Primaria Inclusiva [Calle ejemplo #40]', x: 410, y: 340 },
  { id: 'n_estacion', nombre: 'Estación de Transporte Norte [Av. ejemplo #45]', x: 580, y: 110 },
  { id: 'n_biblioteca', nombre: 'Biblioteca Pública [Calle ejemplo #30]', x: 580, y: 250 },
  { id: 'n_parque', nombre: 'Parque Central Inclusivo [Calle ejemplo #88]', x: 740, y: 250 },
  { id: 'n_mercado', nombre: 'Mercado Barrio Sur [Calle ejemplo #62]', x: 740, y: 360 }
];

/** Tramos (aristas bidireccionales) con atributos físicos reales para Dijkstra */
export const TRAMOS_MAPA = [
  {
    id: 't1', desde: 'n_origen', hacia: 'n_cruce_sur', distanciaM: 140,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: true,
    bancas: true, verificacion: 'Verificado',
    instruccion: 'Avanza por [Calle ejemplo] hacia la esquina Sur por banqueta ancha con rampa.'
  },
  {
    id: 't2', desde: 'n_cruce_sur', hacia: 'n_centro_salud', distanciaM: 160,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: true,
    bancas: false, verificacion: 'Verificado',
    instruccion: 'Cruza con semáforo sonoro y sigue recto hacia el Centro de Salud.'
  },
  {
    id: 't3', desde: 'n_cruce_sur', hacia: 'n_escuela', distanciaM: 210,
    escalones: 3, pendiente: 'media', ancho: 'angosta', rampa: false, semaforoSonoro: false,
    bancas: false, verificacion: 'Reportado por la comunidad',
    instruccion: 'Tramo con 3 escalones sin rampa frente a obra temporal.'
  },
  {
    id: 't4', desde: 'n_centro_salud', hacia: 'n_plaza', distanciaM: 190,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: true,
    bancas: true, verificacion: 'Verificado',
    instruccion: 'Continúa por [Av. ejemplo] con piso firme, bancas de descanso y rampas.'
  },
  {
    id: 't5', desde: 'n_plaza', hacia: 'n_escuela', distanciaM: 150,
    escalones: 0, pendiente: 'suave', ancho: 'media', rampa: true, semaforoSonoro: false,
    bancas: true, verificacion: 'Reportado por la comunidad',
    instruccion: 'Gira hacia el sur rumbo a la Escuela Primaria por rampa lateral.'
  },
  {
    id: 't6', desde: 'n_plaza', hacia: 'n_estacion', distanciaM: 230,
    escalones: 0, pendiente: 'fuerte', ancho: 'media', rampa: true, semaforoSonoro: false,
    bancas: false, verificacion: 'Reportado por la comunidad',
    instruccion: 'Subida con pendiente pronunciada hacia la Estación Norte.'
  },
  {
    id: 't7', desde: 'n_plaza', hacia: 'n_biblioteca', distanciaM: 180,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: true,
    bancas: true, verificacion: 'Verificado',
    instruccion: 'Camina por el corredor peatonal plano hacia la Biblioteca Pública.'
  },
  {
    id: 't8', desde: 'n_biblioteca', hacia: 'n_estacion', distanciaM: 170,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: true,
    bancas: false, verificacion: 'Verificado',
    instruccion: 'Toma el acceso con elevador y guía táctil hacia la Estación Norte.'
  },
  {
    id: 't9', desde: 'n_biblioteca', hacia: 'n_parque', distanciaM: 180,
    escalones: 0, pendiente: 'suave', ancho: 'ancha', rampa: true, semaforoSonoro: false,
    bancas: true, verificacion: 'Reportado por la comunidad',
    instruccion: 'Sigue recto por [Calle ejemplo] hacia el Parque Central.'
  },
  {
    id: 't10', desde: 'n_escuela', hacia: 'n_mercado', distanciaM: 340,
    escalones: 0, pendiente: 'suave', ancho: 'media', rampa: true, semaforoSonoro: false,
    bancas: false, verificacion: 'Sin información',
    instruccion: 'Tramo hacia Mercado Barrio Sur sin verificación reciente.'
  },
  {
    id: 't11', desde: 'n_parque', hacia: 'n_mercado', distanciaM: 140,
    escalones: 2, pendiente: 'media', ancho: 'angosta', rampa: false, semaforoSonoro: false,
    bancas: false, verificacion: 'Reportado por la comunidad',
    instruccion: 'Bajada con 2 escalones y banqueta angosta rumbo al mercado.'
  }
];

/** Puntos de interés y barreras iniciales */
export const LUGARES_DEMO = [
  {
    id: 'lug_salud',
    tipo: 'accesible',
    nodoId: 'n_centro_salud',
    nombre: 'Centro de Salud Comunitario',
    ubicacion: '[Calle ejemplo #12]',
    rampas: 'Rampa de pendiente suave en acceso principal',
    elevadores: '1 elevador activo hacia primer piso',
    banos: 'Baño amplio con barras de apoyo',
    escaleras: 'Con alternativa por rampa',
    superficie: 'Piso antiderrapante uniforme',
    obstaculos: 'Sin obstáculos reportados recientemente',
    accesos: 'Entrada principal al nivel de banqueta',
    info: 'Cuenta con señalización en alto relieve y módulo de atención preferente.',
    actualizado: '2026-11-20',
    verificacion: 'Verificado'
  },
  {
    id: 'lug_plaza',
    tipo: 'accesible',
    nodoId: 'n_plaza',
    nombre: 'Plaza Cívica [Av. ejemplo]',
    ubicacion: '[Av. ejemplo #25]',
    rampas: '4 rampas en esquinas',
    elevadores: 'No aplica (nivel de calle)',
    banos: 'Baño público accesible junto a caseta',
    escaleras: 'Solo en monumento central, resto plano',
    superficie: 'Adoquín nivelado',
    obstaculos: 'Puestos ambulantes en horario vespertino',
    accesos: 'Cruces con semáforo sonoro',
    info: 'Espacio abierto con bancas cada 40 metros.',
    actualizado: '2026-11-18',
    verificacion: 'Verificado'
  },
  {
    id: 'lug_biblioteca',
    tipo: 'accesible',
    nodoId: 'n_biblioteca',
    nombre: 'Biblioteca Pública Municipal',
    ubicacion: '[Calle ejemplo #30]',
    rampas: 'Rampa techada con pasamanos doble',
    elevadores: 'Elevador con audio y braille',
    banos: 'Baños accesibles en planta baja y piso 1',
    escaleras: 'Con alternativa por elevador',
    superficie: 'Concreto liso',
    obstaculos: 'Ninguno reportado',
    accesos: 'Puerta automática de ancho amplio',
    info: 'Acceso adaptado reportado y verificado por visitantes.',
    actualizado: '2026-11-22',
    verificacion: 'Verificado'
  },
  {
    id: 'lug_estacion',
    tipo: 'accesible',
    nodoId: 'n_estacion',
    nombre: 'Estación de Transporte Norte',
    ubicacion: '[Av. ejemplo #45]',
    rampas: 'Rampa de acceso norte',
    elevadores: 'Elevador norte activo; elevador sur en revisión',
    banos: 'Sin baño público dentro de estación',
    escaleras: 'Escaleras eléctricas y fijas con alternativa',
    superficie: 'Guía podotáctil continua',
    obstaculos: 'Posible fila en hora pico',
    accesos: 'Torniquete ancho para silla de ruedas y carriola',
    info: 'Accesibilidad reportada por la comunidad; verifica el estado del elevador sur.',
    actualizado: '2026-11-24',
    verificacion: 'Reportado por la comunidad'
  },
  {
    id: 'lug_parque',
    tipo: 'accesible',
    nodoId: 'n_parque',
    nombre: 'Parque Central Inclusivo',
    ubicacion: '[Calle ejemplo #88]',
    rampas: 'Accesos a nivel sin escalones',
    elevadores: 'No aplica',
    banos: 'Baño familiar accesible',
    escaleras: 'Sin escaleras en circuito principal',
    superficie: 'Andadores pavimentados anchos',
    obstaculos: 'Ninguno reportado',
    accesos: '3 entradas amplias',
    info: 'Áreas de descanso con sombra y juegos adaptados.',
    actualizado: '2026-11-15',
    verificacion: 'Reportado por la comunidad'
  },
  {
    id: 'lug_mercado',
    tipo: 'accesible',
    nodoId: 'n_mercado',
    nombre: 'Mercado Barrio Sur',
    ubicacion: '[Calle ejemplo #62]',
    rampas: 'Sin información todavía',
    elevadores: 'Sin información todavía',
    banos: 'Sin información todavía',
    escaleras: '2 escalones en entrada oeste',
    superficie: 'Irregular en pasillos laterales',
    obstaculos: 'Cajas y mercancía en banqueta exterior',
    accesos: 'Entrada principal estrecha',
    info: 'Faltan datos actualizados sobre accesibilidad interior.',
    actualizado: '2026-11-10',
    verificacion: 'Sin información todavía'
  },
  {
    id: 'bar_rampa_escuela',
    tipo: 'barrera',
    nodoId: 'n_escuela',
    nombre: 'Escaleras sin rampa frente a Escuela',
    ubicacion: '[Calle ejemplo #40]',
    rampas: 'Falta rampa en esquina sur',
    elevadores: 'No aplica',
    banos: 'No aplica',
    escaleras: '3 escalones altos sin alternativa directa',
    superficie: 'Banqueta rota en tramo de 6 metros',
    obstaculos: 'Escombro de obra ligera',
    accesos: 'Paso bloqueado para silla de ruedas y carriola',
    info: 'Se recomienda rodear por Plaza Cívica [Av. ejemplo #25].',
    actualizado: '2026-11-25',
    verificacion: 'Reportado por la comunidad'
  },
  {
    id: 'bar_cruce_mercado',
    tipo: 'barrera',
    nodoId: 'n_cruce_sur',
    nombre: 'Cruce con semáforo peatonal dañado',
    ubicacion: '[Calle ejemplo y Sur]',
    rampas: 'Rampa poniente con borde elevado',
    elevadores: 'No aplica',
    banos: 'No aplica',
    escaleras: 'No aplica',
    superficie: 'Desnivel en guarnición',
    obstaculos: 'Señal sonora intermitente',
    accesos: 'Cruzar con precaución',
    info: 'Pendiente de verificación tras reporte ciudadano de ejemplo.',
    actualizado: '2026-11-25',
    verificacion: 'Pendiente de verificación'
  }
];

export const AVISOS_DEMO = [
  {
    id: 'av-1',
    titulo: 'Obra de reparación de banqueta en [Calle ejemplo #40]',
    fecha: '2026-11-26',
    vigencia: 'Del 26 al 30 de noviembre (ficticio)',
    ubicacion: '[Calle ejemplo #40, tramo Escuela Primaria]',
    categoria: 'Banquetas bloqueadas',
    fuente: 'Fuente de demostración — Aviso ficticio',
    descripcion: 'Debido a trabajos de sustitución hidráulica y nivelación de guarniciones en el tramo sur de [Calle ejemplo #40], el paso peatonal lateral presenta reducción de ancho efectivo y desniveles temporales que imposibilitan la circulación continua en silla de ruedas.',
    explicacionSencilla: 'Están arreglando la banqueta en [Calle ejemplo #40]. El paso es muy angosto y no caben sillas de ruedas ni carriolas hasta el 30 de noviembre. Usa la calle paralela por Plaza Cívica.'
  },
  {
    id: 'av-2',
    titulo: 'Elevador sur en revisión en Estación de Transporte Norte',
    fecha: '2026-11-25',
    vigencia: 'Hasta nuevo aviso (ficticio)',
    ubicacion: '[Av. ejemplo #45, acceso sur]',
    categoria: 'Fallas de elevadores',
    fuente: 'Fuente de demostración — Aviso ficticio',
    descripcion: 'El equipo electromecánico de elevación vertical ubicado en el acceso sur de la Estación Norte se encuentra en mantenimiento preventivo por falla en sensor de puertas. El acceso norte opera con normalidad.',
    explicacionSencilla: 'El elevador del lado sur no funciona por mantenimiento. Puedes usar el elevador del lado norte que sí está funcionando.'
  },
  {
    id: 'av-3',
    titulo: 'Cierre vial por evento comunitario dominical',
    fecha: '2026-11-24',
    vigencia: 'Domingo de 08:00 a 14:00 h (ficticio)',
    ubicacion: '[Av. ejemplo entre #15 y #35]',
    categoria: 'Cierres y cambios temporales',
    fuente: 'Fuente de demostración — Aviso ficticio',
    descripcion: 'Se implementará restricción vehicular temporal con prioridad peatonal y desvío de rutas de autobús hacia [Calle ejemplo paralela]. Se habilitarán cruces a nivel con personal de apoyo.',
    explicacionSencilla: 'El domingo en la mañana no pasarán coches ni camiones por [Av. ejemplo]. Podrás caminar por ahí sin coches, pero los camiones pasarán por la calle paralela.'
  },
  {
    id: 'av-4',
    titulo: 'Mantenimiento en rampa de acceso a Mercado Barrio Sur',
    fecha: '2026-11-23',
    vigencia: '23 al 28 de noviembre (ficticio)',
    ubicacion: '[Calle ejemplo #62]',
    categoria: 'Problemas de movilidad',
    fuente: 'Fuente de demostración — Aviso ficticio',
    descripcion: 'La rampa de acceso oriente permanecerá acordonada por fraguado de concreto antiderrapante. El ingreso alterno presenta dos escalones sin rampa provisional.',
    explicacionSencilla: 'La rampa del mercado está recién reparada y cerrada mientras seca el cemento. La otra entrada tiene dos escalones.'
  }
];

export const REPORTES_DEMO = [
  {
    id: 'rep-demo-1',
    folio: 'RL-2026-000101',
    creadoEn: '2026-11-24T10:15:00-06:00',
    actualizadoEn: '2026-11-25T16:30:00-06:00',
    rolAutor: 'ciudadano',
    ubicacion: { x: 410, y: 340, texto: '[Calle ejemplo #40, esquina Sur]', fuente: 'ejemplo' },
    categoria: 'Rampa bloqueada',
    descripcion: 'Vehículo estacionado y material de obra bloquean la rampa peatonal en la esquina de la escuela (reporte de ejemplo).',
    fotoId: null,
    audioId: null,
    transcripcion: '',
    analisisIA: {
      categoria: 'Rampa bloqueada',
      prioridad: 'Alta',
      descripcion: 'Obstrucción física total de rampa peatonal junto a zona escolar.',
      dependenciaSugerida: 'Movilidad y tránsito local (ejemplo)',
      confianza: 'Alta (demostración)',
      personasAfectadas: 'Personas en silla de ruedas, carriolas y personas mayores'
    },
    editadoPorPersona: false,
    prioridad: 'Alta',
    estado: 'En atención',
    dependenciaSugerida: 'Movilidad y tránsito local (ejemplo)',
    historial: [
      { fecha: '2026-11-24T10:15:00-06:00', estado: 'Recibido', nota: 'Reporte registrado en modo demostración.' },
      { fecha: '2026-11-24T14:00:00-06:00', estado: 'Canalizado', nota: 'Asignado a canal de ejemplo.' },
      { fecha: '2026-11-25T16:30:00-06:00', estado: 'En atención', nota: 'Nota de ejemplo: en revisión de campo.' }
    ],
    confirmaciones: { siguePresente: 2, resuelto: 0 },
    notasAdmin: 'Ejemplo de seguimiento activo para demostración.'
  },
  {
    id: 'rep-demo-2',
    folio: 'RL-2026-000102',
    creadoEn: '2026-11-23T09:00:00-06:00',
    actualizadoEn: '2026-11-23T09:00:00-06:00',
    rolAutor: 'cuidador',
    ubicacion: { x: 580, y: 110, texto: '[Av. ejemplo #45, Estación Norte]', fuente: 'ejemplo' },
    categoria: 'Elevador fuera de servicio',
    descripcion: 'El elevador del acceso sur marca error en el tablero y no abre puertas (reporte de ejemplo).',
    fotoId: null,
    audioId: null,
    transcripcion: '',
    analisisIA: {
      categoria: 'Elevador fuera de servicio',
      prioridad: 'Alta',
      descripcion: 'Falla en elevador de estación de transporte que impide acceso sin escaleras.',
      dependenciaSugerida: 'Mantenimiento de estaciones (ejemplo)',
      confianza: 'Alta (demostración)',
      personasAfectadas: 'Usuarios de silla de ruedas, bastón y carriolas'
    },
    editadoPorPersona: true,
    prioridad: 'Alta',
    estado: 'Recibido',
    dependenciaSugerida: 'Mantenimiento de estaciones (ejemplo)',
    historial: [
      { fecha: '2026-11-23T09:00:00-06:00', estado: 'Recibido', nota: 'Reporte inicial de demostración.' }
    ],
    confirmaciones: { siguePresente: 1, resuelto: 0 },
    notasAdmin: ''
  },
  {
    id: 'rep-demo-3',
    folio: 'RL-2026-000103',
    creadoEn: '2026-11-20T12:20:00-06:00',
    actualizadoEn: '2026-11-22T17:10:00-06:00',
    rolAutor: 'ciudadano',
    ubicacion: { x: 240, y: 210, texto: '[Calle ejemplo #12, Centro de Salud]', fuente: 'ejemplo' },
    categoria: 'Señalización insuficiente',
    descripcion: 'Faltaba pintura amarilla de contraste en el borde del escalón lateral (reporte de ejemplo).',
    fotoId: null,
    audioId: null,
    transcripcion: '',
    analisisIA: {
      categoria: 'Señalización insuficiente',
      prioridad: 'Media',
      descripcion: 'Ausencia de señalización visual en desnivel peatonal.',
      dependenciaSugerida: 'Señalización e inclusión (ejemplo)',
      confianza: 'Media (demostración)',
      personasAfectadas: 'Personas con baja visión y personas mayores'
    },
    editadoPorPersona: false,
    prioridad: 'Media',
    estado: 'Resuelto',
    dependenciaSugerida: 'Señalización e inclusión (ejemplo)',
    historial: [
      { fecha: '2026-11-20T12:20:00-06:00', estado: 'Recibido', nota: 'Reporte de ejemplo creado.' },
      { fecha: '2026-11-21T11:00:00-06:00', estado: 'En atención', nota: 'Programado para pintura.' },
      { fecha: '2026-11-22T17:10:00-06:00', estado: 'Resuelto', nota: 'Franja de contraste aplicada (demostración).' }
    ],
    confirmaciones: { siguePresente: 0, resuelto: 3 },
    notasAdmin: 'Caso cerrado de demostración.'
  }
];

export const PLAN_TRABAJO_INICIAL = [
  { etapa: 'Planeación', actividad: 'Definir MVP y modelo de datos', descripcion: 'Lista MoSCoW, 8 secciones, 12 opciones, 9 configuraciones, esquemas y formato de folio.', responsable: '[Integrante 1 - Líder]', prioridad: 'Debe tener', horas: '2', fechaLimite: 'Día 1', dependeDe: '—', criterio: 'Alcance y esquemas cerrados', estado: 'Completado' },
  { etapa: 'Planeación', actividad: 'Cronograma, repositorio y riesgos', descripcion: 'Nombres reales, fechas, Git con ramas y plan B.', responsable: '[Integrante 1 - Líder]', prioridad: 'Debe tener', horas: '1', fechaLimite: 'Día 1', dependeDe: '—', criterio: 'Repo inicializado y riesgos', estado: 'Completado' },
  { etapa: 'Privacidad', actividad: 'Privacidad y ética', descripcion: 'Aviso de privacidad, permisos, limpieza EXIF, borrar datos y datos ficticios marcados.', responsable: '[Integrante 2 - A11y/JS]', prioridad: 'Debe tener', horas: '2', fechaLimite: 'Día 1', dependeDe: 'Modelo de datos', criterio: 'EXIF limpio y control total', estado: 'Completado' },
  { etapa: 'Diseño UX/UI', actividad: 'Identidad visual y accesibilidad WCAG 2.2 AA', descripcion: 'Paleta verificada, foco doble, contraste, íconos SVG y modos visuales.', responsable: '[Integrante 3 - UX/UI]', prioridad: 'Debe tener', horas: '3', fechaLimite: 'Día 1', dependeDe: 'MVP', criterio: 'Contraste >= 4.5:1 validado', estado: 'Completado' },
  { etapa: 'Desarrollo', actividad: 'Estructura index.html y styles.css', descripcion: 'Semántica es-MX, skip link, perfiles rápidos, menú, panel accesibilidad y responsive.', responsable: '[Integrante 3 - Frontend]', prioridad: 'Debe tener', horas: '4', fechaLimite: 'Día 1', dependeDe: 'Diseño UX/UI', criterio: 'HTML válido y responsive', estado: 'Completado' },
  { etapa: 'Desarrollo', actividad: 'IndexedDB y compresión de medios', descripcion: 'Guardar fotos y audio fuera de localStorage; reducir fotos y quitar EXIF.', responsable: '[Integrante 2 - JS]', prioridad: 'Debe tener', horas: '3', fechaLimite: 'Día 2', dependeDe: 'Estado central', criterio: 'Fotos y audio en IndexedDB', estado: 'Completado' },
  { etapa: 'Funcionalidades', actividad: 'Mapa SVG accesible y rutas Dijkstra', descripcion: 'Botones ↑↓←→ / +−, filtros, Cerca de ti, detalle y Dijkstra según perfil.', responsable: '[Integrante 1 - Full-Stack]', prioridad: 'Debe tener', horas: '5', fechaLimite: 'Día 2', dependeDe: 'Datos demo', criterio: 'Rutas varían según perfil', estado: 'Completado' },
  { etapa: 'Funcionalidades', actividad: 'Reportes, foto, voz, IA y Admin', descripcion: 'Flujo completo, folio RL-AAAA-NNNNNN, Mis reportes, Avisos, Ayuda y Panel admin.', responsable: '[Integrante 4 - IA/Full-Stack]', prioridad: 'Debe tener', horas: '6', fechaLimite: 'Día 2', dependeDe: 'Medios y estado', criterio: 'Sincronía Admin <-> Mis reportes', estado: 'Completado' },
  { etapa: 'Integración', actividad: 'Exportar, importar y restablecer datos', descripcion: 'Respaldo de reportes en JSON, exportar plan Markdown y reinicio de demo.', responsable: '[Integrante 2 - JS]', prioridad: 'Debería tener', horas: '2', fechaLimite: 'Día 3', dependeDe: 'Estado central', criterio: 'JSON y Markdown válidos', estado: 'Completado' },
  { etapa: 'Pruebas', actividad: 'Auditoría funcional y de accesibilidad', descripcion: 'Pruebas en localhost, teclado, 200%, contraste, axe/Lighthouse/WAVE/W3C y navegadores.', responsable: '[Integrante 4 - QA]', prioridad: 'Debe tener', horas: '3', fechaLimite: 'Día 3', dependeDe: 'Todas las funciones', criterio: 'Capturas y evidencia lista', estado: 'En proceso' },
  { etapa: 'Entrega', actividad: 'Pitch, demo y documentación', descripcion: 'README.md, LICENSE, guion 3-5 min, video respaldo y respuestas para jurado.', responsable: '[Equipo Error 404]', prioridad: 'Debe tener', horas: '3', fechaLimite: 'Día 3', dependeDe: 'Pruebas', criterio: 'Demo ensayada y publicada', estado: 'En proceso' }
];
