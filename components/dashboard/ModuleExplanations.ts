export const MODULE_EXPLANATIONS: Record<string, { title: string, subtitle: string, overview: string, features: { title: string, desc: string }[] }> = {
    'dashboard': {
        title: 'OVERVIEW: CENTRO DE CONTROL MACROECONÓMICO',
        subtitle: 'SÍNTESIS ESTRUCTURAL Y TELEMETRÍA GLOBAL',
        overview: 'El epicentro operativo de Sovereign Terminal. Este entorno consolida en una única interfaz el estado del mercado global en tiempo real, operando como un centro neurálgico de inteligencia financiera. Procesa y traduce vectores críticos de fluctuación —desde inyecciones masivas de liquidez hasta disrupciones en la latencia de las redes L1— proporcionando al operador institucional una ventaja táctica inigualable basada en datos empíricos.\n\nMediante un procesamiento analítico continuo, este módulo filtra el ruido inherente de la blockchain para presentar métricas destiladas y precisas, garantizando que el diseño de estrategias se sustente exclusivamente en indicadores alfa purificados.',
        features: [
            { title: 'Convergencia Analítica', desc: 'Agregación algorítmica instantánea de las variaciones inter-mercado para reflejar de forma fidedigna el estado del ecosistema.' },
            { title: 'Monitor de Integridad RPC', desc: 'Evaluación exhaustiva de la latencia criptográfica (sub-milisegundos) y redundancia de las conexiones de los nodos globales.' },
            { title: 'Normalización de Métricas', desc: 'Las métricas clave son normalizadas y suavizadas dinámicamente según los picos de volatilidad detectados en el marco temporal activo.' }
        ]
    },
    'watchlist': {
        title: 'WATCHLIST: SEGUIMIENTO HEURÍSTICO DE ENTIDADES',
        subtitle: 'SISTEMA DE RADAR Y VIGILANCIA INSTITUCIONAL',
        overview: 'El módulo Watchlist trasciende el seguimiento tradicional de cotizaciones, operando como una infraestructura de vigilancia orientada al marcaje de clústeres institucionales y "Smart Money". Este entorno permite la clasificación técnica y el aislamiento de direcciones específicas, dotando al usuario de un sistema de alerta temprana ante perturbaciones on-chain significativas.\n\nAl establecer un cruce de datos entre el comportamiento histórico de la entidad observada y sus transferencias en tiempo real, este visor actúa como la primera línea defensiva frente a manipulaciones sistémicas o rotaciones masivas de capital.',
        features: [
            { title: 'Vigilancia Vectorial Independiente', desc: 'Mapeo ininterrumpido de entidades con integración directa al registro local, sin dependencia de bases de datos centralizadas de terceros.' },
            { title: 'Umbrales Predictivos de Alerta', desc: 'Configuración avanzada de fronteras y parámetros que desencadenan notificaciones ante el movimiento de capital institucional.' },
            { title: 'Filtrado de Ruido Transaccional', desc: 'Supresión proactiva de oscilaciones menores ("dusting attacks") para enfocar la visión exclusivamente en transferencias de alto impacto.' }
        ]
    },
    'news': {
        title: 'LIVE NEWS: TERMINAL DE INTELIGENCIA ESTRATÉGICA',
        subtitle: 'PARSEADO Y EVALUACIÓN DE SENTIMIENTO MEDIÁTICO',
        overview: 'Desarrollado para decodificar flujos masivos de información macroeconómica y eventos sociopolíticos globales. El módulo de Live News no es un simple agregador, sino una infraestructura basada en Procesamiento de Lenguaje Natural (NLP) diseñada para ponderar la relevancia sectorial procedente de las agencias globales de noticias (Bloomberg, Reuters y flujos de grado privado).\n\nEl sistema aísla e interpreta el impacto direccional de la semántica mediática sobre cualquier clase de activo. Esto permite al gestor anticipar patrones de acumulación o capitulación institucional mucho antes de que dichas noticias se materialicen formalmente en el Order Book.',
        features: [
            { title: 'Evaluación Cuantitativa de Sentimiento', desc: 'Medición de la polarización semántica y el impacto macroeconómico sobre las entidades informativas a nivel mundial.' },
            { title: 'Flujo Asíncrono Continuo', desc: 'Despliegue ininterrumpido de reportes financieros de última hora con máxima prioridad de sincronización web.' },
            { title: 'Depuración Semántica', desc: 'Algoritmos selectivos que descartan redundancias sensacionalistas para presevar exclusivamente la señal fundamental del mercado.' }
        ]
    },
    'gold': {
        title: 'TICKET MINT: ETIQUETA DORADA INSTITUCIONAL',
        subtitle: 'ACCESO A ARQUITECTURA PRIVILEGIADA Y RUTAS EXCLUSIVAS',
        overview: 'El nivel de acceso superior de Sovereign Terminal. Este enclave perimetrado alberga las herramientas paramétricas más exigentes, restringidas a entidades con estatus operativo Golden. Garantiza una infraestructura con ancho de banda no compartido, proporcionando resiliencia absoluta frente a latencias extremas o colapsos de proveedores públicos.\n\nDesbloqueando las capas subyacentes de la terminal, asegura permisos escalados que garantizan un aislamiento total (Zero-Knowledge) y acceso sin restricciones a los conductos de datos primarios, asegurando que las operaciones críticas jamás se detengan por limitaciones técnicas.',
        features: [
            { title: 'Vectores de Datos Dedicados', desc: 'Priorización absoluta en la asignación de nodos RPC corporativos, eliminando los clásicos cuellos de botella durante hiper-saturaciones.' },
            { title: 'Ofuscamiento y Privacidad (ZK)', desc: 'Activación de módulos de trazabilidad oculta basados en cifrado Zero-Knowledge para navegar sin exposición perimetral.' },
            { title: 'Eliminación de Restricciones (Rate Limits)', desc: 'Permisos absolutos para el despliegue de analíticas intensivas sin las barreras de limitación de solicitudes habituales.' }
        ]
    },
    'markets': {
        title: 'TOP MARKETS: PANÓPTICO MICROESTRUCTURAL',
        subtitle: 'ANÁLISIS FORENSE DE PROFUNDIDAD DE LIBRO Y LIQUIDEZ',
        overview: 'El visor Top Markets ejecuta una modelización analítica continua sobre los pares de trading más dominantes del mundo criptográfico. Operando como un escáner microestructural, se sumerge en el registro de órdenes (Order Book) para discernir empíricamente entre liquidez real, manipulación del libro ("Spoofing") o "Wash Trading".\n\nDescompone volumétricamente la arquitectura y resistencia de las posturas compradoras y vendedoras. Esto revela zonas de concentración de "Smart Money", niveles reales de soporte y resistencia (Bid/Ask Walls), e identifica con claridad quirúrgica hacia qué vectores geográficos fluye la dominancia financiera.',
        features: [
            { title: 'Radiografía del Order Book', desc: 'Identificación algorítmica de barreras ilusorias de capital diseñadas para orientar o atrapar al inversor minorista.' },
            { title: 'Cinemática de Capital', desc: 'Mapeo cuantitativo de los flujos netos inter-exchange (Netflows) y métricas direccionales del volumen global.' },
            { title: 'Corrección de Fragmentación', desc: 'Mitigación heurística de distorsiones en los precios al consolidar plataformas atomizadas en un solo índice métrico verdadero.' }
        ]
    },
    'newpairs': {
        title: 'NEW LISTINGS: ANÁLISIS DE CONTRATOS GÉNESIS',
        subtitle: 'AUDITORÍA SÍNCRONA DE ACTIVOS DE RECIENTE EMISIÓN',
        overview: 'El campo de pruebas donde los protocolos emergen a la red principal. Este sistema actúa como un periscopio hipersensible interconectado al mempool (EVM), interceptando la creación de contratos inteligentes (Contract Creation Events) y rastreando la provisión de liquidez inicial en Formadores de Mercado Automatizados (AMM).\n\nMediante una evaluación de riesgo algorítmica, examina métricas fundamentales de salud del token: renuncias de llaves maestras, quema de liquidez, y tasas engañosas ("Honeypot Diagnostics"), sirviendo de escudo analítico definitivo frente al fraude durante periodos primigenios de alta volatilidad.',
        features: [
            { title: 'Interceptación Mempool', desc: 'Detección en el instante cero: lectura forense del contrato antes o durante el bloque exacto de su inserción en la blockchain.' },
            { title: 'Diagnóstico Estructural de Riesgos', desc: 'Auditoría automática sobre la distribución de las billeteras fundadoras y el grado real de descentralización inicial.' },
            { title: 'Umbrales de Liquidez Funcional', desc: 'Filtra tokens inmateriales basándose exclusivamente en concentraciones de capital de lanzamiento económicamente serias.' }
        ]
    },
    'omniexplorer': {
        title: 'OMNI EXPLORER: MOTOR FORENSE MULTICADENA',
        subtitle: 'CARTOGRAFÍA Y DECODIFICACIÓN CRIPTOGRÁFICA UNIVERSAL',
        overview: 'El Omni Explorer reemplaza la fragmentación e ineficiencia de los navegadores de bloques convencionales. Constituye un ecosistema agnóstico capaz de interpretar arquitecturas procedentes de la red Ethereum (EVM), Bitcoin (UTXO) y otras L1, agrupadas bajo una interfaz purificada de ruidos visuales y distracciones.\n\nProporciona a las firmas analíticas capacidades avanzadas para desestructurar cualquier métrica referenciada (Hashes de Transacción, Bloques, Direcciones Contractuales), transformando el código de máquina bruto (Hex/Opcodes) en un diagrama lógico, transparente y apto para investigaciones o auditorías.',
        features: [
            { title: 'Detección de Cadena Dinámica', desc: 'Resolución e indexado automático de la red base (Target Network) partiendo únicamente de la heurística de entrada del hash.' },
            { title: 'Decodificación Legible Humana', desc: 'Traducción directa y sin fricciones de los "Call Datas" y metadatos hacia registros funcionales y claros.' },
            { title: 'Ergonomía de Aislamiento Visual', desc: 'Centralización de los deltas de saldo relevantes, eliminando la contaminación perimetral publicitaria inherente en exploradores gratuitos.' }
        ]
    },
    'brc': {
        title: 'BRC EXPLORER: INSPECTOR NATIVO DE BITCOIN',
        subtitle: 'SEGUIMIENTO METODOLÓGICO DE LA ECONOMÍA ORDINAL L1',
        overview: 'Una infraestructura tecnológica diseñada a medida para el escrutinio forense y la preservación del ledger unificado de Bitcoin. Interrumpe sistemáticamente los segmentos "Witness" de las operaciones (Taproot) para examinar la información adyacente subyacente, dotando de total visibilidad a las inscripciones Ordinals y los suministros del ecosistema BRC-20.\n\nMediante su motor de estado continuo, permite calcular capitalizaciones de mercado fragmentadas directamente sobre los satoshis legendarios, sin necesidad de interactuar con puentes de confianza cruzada (Bridges) ni depender del dictado de indexadores centralizados.',
        features: [
            { title: 'Extracción Nativa del Ledger de BTC', desc: 'Lectura directa de las transacciones sin procesar acopladas a los nodos de validación Bitcoin Core.' },
            { title: 'Telemetría de Abstracción BRC-20', desc: 'Representación rigurosa de las transferencias secundarias, saldos y retenciones institucionales en el protocolo subyacente.' },
            { title: 'Modelado UTXO Optimizado', desc: 'Examen de fragmentación del "polvo cósmico" de satoshis para facilitar auditorías y re-consolidación de billeteras institucionales.' }
        ]
    },
    'firehose': {
        title: 'WHALE FIREHOSE PRO: SISMÓGRAFO DE RED L1',
        subtitle: 'MONITORIZACIÓN EXTREMA Y EN DIRECTO DEDE EL MEMPOOL',
        overview: 'El componente de inteligencia más intenso de Sovereign Terminal. "Whale Firehose" se materializa como un conducto WebSockets de inyección directa que captura, parsea y escupe decenas de miles de eventos de la Red Principal (Global Blocks) cada segundo. \n\nConcebido para operadores de élite, requiere un dominio absoluto sobre el "ruido blanco" on-chain. Integra filtros paramétricos estrictos alojados en el lado del cliente (Local Computing) para discriminar operaciones polares pequeñas y revelar inequívocamente aquellas transferencias con volumen de grado masivo que impactarán los libros de órdenes en los próximos minutos.',
        features: [
            { title: 'Renderizado en Alta Frecuencia (Zero-Mock)', desc: 'Indexación asíncrona real desde el nodo EVM principal sin demoras añadidas, visualizando el historial transaccional verdadero.' },
            { title: 'Filtrado Atómico de Alta Escala', desc: 'Sistemas heurísticos de evasión que eliminan instantáneamente micro-movimientos para focalizar el radar en la actividad "Whale".' },
            { title: 'Telemetría Táctil y Estructurada', desc: 'Clasificación tabular automatizada (Tipo de Transferencia, Moneda Principal, Direccionalidad, Dólares Ajustados, Gwei).' }
        ]
    },
    'sov-intel': {
        title: 'SOVEREIGN INTEL: INTELIGENCIA DE SEGUNDA CAPA',
        subtitle: 'DESANONIMIZACIÓN Y PATRONES DE CONTRA-ESPIONAJE',
        overview: 'The sublimation of institutional profiling. Sovereign Intel works by crossing exhaustive deterministic databases with probabilistic behaviors, identifying with immense precision "Opaque Wallets" belonging to hedge funds, custodians, or large Market Makers.\n\nBy applying clustering models, it deploys an analytical framework capable of detecting the strategic repositioning of the so-called "Smart Money." It is fundamental for forecasting hidden distributions or massive Over-The-Counter (OTC) operations that retail participants are completely unaware of.',
        features: [
            { title: 'Modelos de Desanonimización', desc: 'Identificación semántica heurística correlacionando patrones de consumo de red, tiempos de emisión y puentes recurrentes.' },
            { title: 'Ruta Forense de Actividad OTC', desc: 'Detección exhaustiva de liquidaciones extremas realizadas peer-to-peer, evadiendo totalmente el rastro algorítmico convencional.' },
            { title: 'Diagramación de Acumulación Base', desc: 'Estudio intensivo de la balanza de un clúster determinado contrastando las salidas frente a las entradas durante un trimestre fiscal completo.' }
        ]
    },
    'inst-ledger': {
        title: 'INSTITUTIONAL LEDGER: EL REGISTRO AUDITABLE',
        subtitle: 'PERSISTENCIA, COMPLIANCE Y METRÍA HISTÓRICA',
        overview: 'El Registro Institucional (Ledger) es una plataforma inmutable y persistente en la que quedan asentadas, analizadas y archivadas las alteraciones monetarias macro-económicas (Large Value Events). Actuando como la memoria a largo plazo de Blockchain y una biblioteca de auditoría corporativa.\n\nPermite a analistas cuantitativos y equipos de Compliance retrotraerse en el tiempo matemático para verificar fluctuaciones críticas, documentar eventos excepcionales (Cisnes Negros) u obtener exportaciones íntegras libres de alteración requeridas para reportes KYC/AML, juntas accionistas y requerimientos legales internacionales.',
        features: [
            { title: 'Preservación Histórica Sin Fricción', desc: 'Trazabilidad determinista, ofreciendo los metadatos puros que enmarcaron perturbaciones volumétricas previas en el mercado.' },
            { title: 'Criterio de Búsqueda Multiparamétrico', desc: 'Herramientas de filtrado avanzadas basadas en umbrales de capital dolarizado, hashes nativos y estatus temporal.' },
            { title: 'Entregables Modulares', desc: 'Formatos tabulares depurados de máxima legibilidad técnica listos para revisión y auditoría fiscal.' }
        ]
    },
    'mass-transfer': {
        title: 'MASS TRANSFERS: MAPEO DE DISTRIBUCIÓN DE RESERVAS',
        subtitle: 'ANÁLISIS DE MIGRACIONES HACIA EXCHANGES CENTRALIZADOS',
        overview: 'A macro module exhaustively focused on tracking and notifying imminent redistributions of large global reserves (Hot/Cold Wallets). The system monitors deposit transitions to and from Centralized Exchanges, identifying the general climate and decisively anticipating disruptions in circulating inventory ("Supply Shocks").\n\nIt interprets large outflows or influx spikes with relentless heuristic logic: identifying whether hundreds of millions have aggressively entered Binance or OKX (selling pressure) or if they have been extracted to Self-Custody Wallets (imminent scarcity).',
        features: [
            { title: 'Clasificador Automático Multi-Categoría', desc: 'Distingue con rigor métrico ingresos netos a plataformas, rotación interna fría/caliente o traslados a staking protocolar.' },
            { title: 'Medidor de Agotamiento (Depletion Rates)', desc: 'Señales inmediatas informando de contracciones súbitas de reservas, propiciadoras típicas de severos "Short-Squeezes".' },
            { title: 'Trazabilidad Visual Tectónica', desc: 'Disposición monocromática de escala total ofreciendo densidades informativas insuperables por métrica cuadrada.' }
        ]
    },
    'graph': {
        title: 'ENTITY GRAPH: CARTOGRAFÍA RELACIONAL D3',
        subtitle: 'VISUALIZACIÓN MULTIMODAL MEDIANTE FUERZAS DIRIGIDAS',
        overview: 'La materialización de la inteligencia forense relacional. Translada aburridas filas alfanuméricas hacia representaciones espaciales dinámicas de teoría topológica de Grafos. Impulsado por algoritmos Force-Directed y lógicas Neo4j, revela los ejes ocultos entre entidades e instituciones de un solo vistazo.\n\nBajo este marco, los nodos (Wallets/Contracts) despliegan gravedad proporcional a su capital acumulado. Al aislar redes interconectadas y evaluar enlaces cruzados, el operador logra percibir ramificaciones para blanqueamiento de fondos (Money Laundering Hops), aglomeración piramidal de fondos corporativos o estructuras anidadas subrepticias.',
        features: [
            { title: 'Modelos Gravitacionales Dinámicos D3', desc: 'Los nodos financieros gravitan e interaccionan fluidamente basándose en la correlación monetaria inyectada o drenada entre ellos.' },
            { title: 'Centralidad y Analítica de Concentración', desc: 'La selección individualiza e inmoviliza vectores clave, revelando riesgo y proporción distributiva del saldo total retenido.' },
            { title: 'Rendimiento Inmersivo Garantizado', desc: 'Procesamiento vectorial hiperoptimizado garantizando fotogramas fijos sin cortes ni fallos de renderizado en análisis extensos.' }
        ]
    },
    'defi': {
        title: 'DEFI YIELDS: RASTREADOR DE RENTABILIDAD PURA',
        subtitle: 'DISECCIÓN ESTRATÉGICA DEL COMPORTAMIENTO PASIVO',
        overview: 'El puente maestro para monitorizar el comportamiento de la distribución pasiva institucional. Rastrea y compila en directo bóvedas (Vaults) y reservas de liquidez (Liquidity Pools) provenientes de los ecosistemas descentralizados sistémicos clave (tales como Aave, Curve Liquid Assets o Uniswap V3).\n\nSu finalidad reside en segregar analíticamente el rendimiento orgánico "Real Yield" procedente de la hiperinflación originada por las emisiones nocivas de los propios protocolos. Desnuda dónde y cómo el "Dinero Institucional" deposita resguardos masivos asumiendo riesgo impermanente marginal para asegurar intereses reales escalables.',
        features: [
            { title: 'Cálculos Duales Puros APY/APR', desc: 'Desmitificación absoluta de las rentabilidades exageradas abstrayendo el delta artificial inducido por subsidios algorítmicos ineficientes.' },
            { title: 'Verificación Estricta del Cierre de Valor (TVL)', desc: 'Auditoría sobre el espesor monetario de las carteras institucionales para detectar focos vulnerables a drenados repentinos.' },
            { title: 'Discrepancias Algorítmicas de Spread', desc: 'Señala de manera explícita brechas de liquidez de rendimiento aprovechables a lo largo del espectro multi-cadena.' }
        ]
    },
    'polymarket': {
        title: 'POLYMARKET: VISUALIZADOR DE ORÁCULOS DE PREDICCIÓN',
        subtitle: 'PROBABILIDAD MATEMÁTICA ANTE INCERTIDUMBRE POLÍTICA GLOBAL',
        overview: 'Una inserción del pulso probabilístico. Integra los valores predictivos más robustos provenientes del mercado asimétrico de predicciones de mayor tamaño: Polymarket. Este visor captura y transfiere la sabiduría agregada y la apuesta monetaria literal sobre decisiones socioeconómicas globales.\n\nBajo esta ventana analítica, la terminal disuelve especulaciones y narrativa pública en estadísticas crudas derivadas de dinero arriesgado ("Skin in the Game"). El mercado indica objetivamente el porcentaje exacto de que un acontecimiento de riesgo sistémico o hito fundacional ocurra, basándose inquebrantablemente en la liquidez subyacente.',
        features: [
            { title: 'Modelos Asignativos basados en Probabilidad', desc: 'Cristalización del spread especulativo en certezas asimétricas numéricas, libres de opinión analítica personal o periodística.' },
            { title: 'Evaluación del Momentum Subyacente', desc: 'Permite vislumbrar cómo choques drásticos monetarios en las redes asimétricas definen de antemano sentencias políticas cruciales.' },
            { title: 'Seguimiento Táctico Binario (Escenarios Sí/No)', desc: 'Mapeo riguroso de inflexiones a lo largo de lapsos pre-definidos marcados por altísimos niveles de presión social y económica.' }
        ]
    },
    'forge': {
        title: 'COSMIC FORGE: ENTORNOS SOBERANOS Y CLI',
        subtitle: 'NÚCLEO DE PROTOCOLIZACIÓN Y CONTROL DEL "CERO MOCK/FAKE"',
        overview: 'El verdadero yunque de comando reservado para el administrador total del clúster terminal. Cosmic Forge representa el acceso centralizado para inspeccionar y alterar parámetros de extracción internos. Es la única zona donde se otorga injerencia absoluta sobre cómo la terminal enruta, consulta e interactúa con el mundo exterior.\n\nSoberanía al máximo exponente: garantiza mediante su uso que todas las informaciones provienen de "Nodos RPC Transparentes", consolidando el mandato inquebrantable de "Zero-Mock Data". Permite ajustes finos sobre frecuencias de actualización (Polling), y variables de autenticación, transformando la plataforma entera en tu base de control.',
        features: [
            { title: 'Interfaz Integrada de Terminal', desc: 'Una simulación estructural que admite comandos avanzados para recargar conectores sin necesidad de interrumpir flujos L1 de mercado.' },
            { title: 'Confirmación y Dictamen Anti-Simulación', desc: 'Auditorías operacionales para asegurar y verificar que todos los datos transitorios están extraídos sin falsificaciones orgánicas ni estocásticas.' },
            { title: 'Modularidad Abierta Empresarial', desc: 'Diseñado fundamentalmente para pre-escalar y tolerar secuencias de fondo y futuras implementaciones robóticas automatizadas (Bots/Algos).' }
        ]
    },
    'portfolio': {
        title: 'MAIN PORTFOLIO: VISUALIZADOR DE PATRIMONIO ESTABLE',
        subtitle: 'AMALGAMA MACRO-ECONÓMICA DEL BALANCE GENERAL ABSOLUTO',
        overview: 'El punto logístico consolidado sobre tus recursos líquidos globales. "Main Portfolio" consolida la visión completa sobre las reservas criptográficas poseídas transversalmente. Mide tus tenencias resguardadas en stablecoins, almacenes rígidos (Hard-Assets multi-firma) e inversiones especulativas.\n\nConfiere la posibilidad al arquitecto y su mesa de negociación para equilibrar carteras de altísima envergadura, examinando la proporción matemática exacta de cada activo bajo una infraestructura hermética, encriptada vectorialmente en memoria terminal que nunca cede el trazado al alojamiento online de Sovereign Terminal.',
        features: [
            { title: 'Compilación Criptográfica Perimetral', desc: 'Integración estructural algorítmica sin vulnerar permisos de la Web3 (Read-Only Matrix) manteniendo llaves invioladas.' },
            { title: 'Arquitectura de Gráficos Circulares de Dominancia', desc: 'Distribución porcentual segmentada para observar la divergencia entre beneficios y activos en flotación negativa.' },
            { title: 'Control de Cobertura y Riesgo Sistémico', desc: 'Proyecta holísticamente la fragilidad o robustez frente a disrupciones inminentes del capital de terceros resguardado en protocolos descentralizados.' }
        ]
    },
    'live-port': {
        title: 'QUICK PORTFOLIO: MARCADOR ECONÓMICO LATERAL',
        subtitle: 'VIGILANCIA ASÍNCRONA DURANTE EJECUCIONES MULTITAREA',
        overview: 'Diseñado bajo la extrema premisa de funcionalidad periférica minimalista. El "Quick Portfolio" actúa como un indicador radial sin exigir recursos gráficos continuos masivos desde la GPU local.\n\nSu finalidad reside en mostrar imperceptiblemente balances vitales seleccionados mientras el campo de concentración principal y el procesador de datos abordan paneles de análisis profundo y heurísticas Forenses D3. Garantiza la supervisión atenta sin fisuras en panoramas concurrentes o inestables.',
        features: [
            { title: 'Línea de Inicialización Rápida y Limpia', desc: 'Ausencia total de renders innecesarios para entregar respuesta paramétrica transcurrido el décimo del segundo post-autenticación.' },
            { title: 'Rutas de Alto Impacto Aislado', desc: 'Priorización semántica del top accionario subyacente de la dirección conectada suprimiendo visibilidad genérica residual o polvorienta (Dust).' },
            { title: 'Cese Computacional al Colapso', desc: 'Cierre automático total de los listeners al no hallarse visible la ventana activa de este módulo, en pro de máxima rentabilidad de memoria y CPU.' }
        ]
    },
    'whale-port': {
        title: 'WHALE HOLDINGS: ESPEJO ANALÍTICO INSIDER',
        subtitle: 'PROYECCIÓN Y SUPERPOSICIÓN DE FONDOS CONTRARIOS',
        overview: 'El proyector holográfico de inversión adversaria por excelencia. Esta disciplina permite calcar y proyectar sobre la plataforma las carteras conocidas u opacas de instituciones dominantes y tesorerías gigantes.\n\nConstituye la Prueba Ácida del operador contemporáneo: observar, superponer y comparar al milímetro el comportamiento (Cost Basis / Token Allocation) de los grandes "Insiders" frente a las lógicas adoptadas por la mesa local. Aporta deducciones crudas destinadas puramente a mitigar errores a través del aprendizaje empírico modelado basándose en la élite interconectada de ballenas del sistema.',
        features: [
            { title: 'Copia Visual Institucional no-Operativa', desc: 'Ingreso foráneo heurístico para clonar la exposición de billeteras colosales en tableros gráficos amigables propios de la Terminal.' },
            { title: 'Trazas Longitudinales de Admisión y Costo Base', desc: 'Calcula con logaritmos precisos en qué zonas de precio de congestión estos administradores en silencio concentraron las grandes compras.' },
            { title: 'Evaluación de Diferenciales', desc: 'Confrontación empírica y visual de exposiciones al riesgo: confronta tu nivel distributivo frente al blindaje macro-estructural corporativo externo.' }
        ]
    },
    'vault': {
        title: 'SOVEREIGN VAULT: EL NÚCLEO ZERO-TRUST',
        subtitle: 'DEFENSA EN PROFUNDIDAD, ENCRIPTACIÓN Y MEMORIA AISLADA',
        overview: 'Sovereign Vault funge como la pieza maestra del engranaje en materia de auto-Soberanía estricta y arquitectura defensiva. Un confinamiento en la memoria virtual (Sandboxing In-Memory) diseñado para resguardar las credenciales criptográficas, configuraciones asimétricas de APIs corporativas u otra variante de parámetro ultrasensible dictada por el usuario o su mesa organizativa.\n\nNo confía en ninguna base de datos, servicio "Cloud" subyacente ni cookies obsoletas. Está cimentado bajo un paradigma "Security-by-Design". El cerrojo permanece clausurado hasta su acreditación mediante verificación paramétrica Web3, evadiendo ataques XSS (Cross Site Scripting) e inspecciones no autorizadas remotas.',
        features: [
            { title: 'Persistencia Volátil (RAM-Based Security)', desc: 'Integración estructural inamovible de bases criptográficas estables y cifradas que mueren irreparablemente si ocurriese una falla de conexión fortuita o recargas hostiles temporales.' },
            { title: 'Validación Criptográfica y Firma ECDSA', desc: 'Activación únicamente ejecutada al cruzar transacciones lógicas seguras por parte del conector MetaMask o proveedores soberanos Hardware-Based.' },
            { title: 'Inexistencia de Rastró Público o Registro Secundario', desc: 'Fomenta el lema "Conoce y Controla Tus Propias Llaves", anulando vectores centralizados históricamente explotados con devastación técnica en otras plataformas analíticas estándar.' }
        ]
    },
    'zk': {
        title: 'ZK SHIELD: BLINDAJE DE PRIVACIDAD AVANZADA',
        subtitle: 'PROTOCOLOS DE MITIGACIÓN RELACIONAL Y SYBIL-SAFE',
        overview: 'El escudo anti-trazamiento on-chain necesario para la preservación táctica del macro-analista. Toda operación y consulta web implica una potencial extracción relacional por corporativos de Análisis Forense de terceros. ZK Shield es el panel para activar barreras protectoras destinadas a asegurar una experiencia "Stealth" que obvia y enmascara la ruta del operador local respecto de su interacción hacia los nodos L1/L2.\n\nAdiciona algoritmos determinísticos probabilísticos (Spoofing & Enrutado Selectivo) encargados deliberadamente de difuminar ruidos telemétricos. Mitigando ataques de correlaciones de direcciones IP (Vulnerabilidades OPSEC comunes), permitiendo una inmersión forense anónima rigurosa e intransigente en materia de Seguridad Perimetral.',
        features: [
            { title: 'Enrutador Subterfugio Periférico', desc: 'División programada de múltiples peticiones cruzadas contra oráculos de precios y nodos RPC para encubrir intenciones analíticas directas y focales.' },
            { title: 'Supresión Telemetría Adversaria (Ad-Hoc Antivirus)', desc: 'Motor que filtra respuestas que intentasen recopilar correlaciones lógicas directas al usuario que observa el panorama del mercado institucional activamente.' },
            { title: 'Canales Seguros Listos para Pruebas de Cero Conocimiento', desc: 'Una directiva escalable hacia redes verdaderamente anónimas L2 (Rollups OP o ZK) sin alterar drásticamente la fluidez terminal.' }
        ]
    },
    'logs': {
        title: 'SESSION LOGS: AUDITORÍA BIDIRENCCIONAL SOC2',
        subtitle: 'INSPECTOR DE BITÁCORAS DE TRANSACCIONES OPERATORIAS',
        overview: 'El módulo supremo en garantía procesal operativa interna. Un control en tiempo real capaz de fiscalizar de principio a fin cada alteración local milimétrica sobre las variables del ecosistema. Desde los inicializadores Web3 de Wallet Handshake hasta intervenciones directas sobre conectores locales de la App o visualizadores gráficos profundos interactivos interceptados de reojo. \n\nA nivel corporativo e institucional es vital comprender exáctamente cuándo o a causa de qué se derivó una lectura crucial, por consiguiente provee una documentación algorítmica imborrable durante la sesión, constituyéndose como herramienta de revisión y depuración inmaculada fundamental en ambientes sin simulación asintótica de "Mock Data" alguna.',
        features: [
            { title: 'Trazabilidad de Clics y Consultas Forenses API', desc: 'Registros indexados milisegundo a milisegundo de eventos directos sin omitir cambios de panel o recálculo volumétrico derivado.' },
            { title: 'Inspección Longitudinal y Depuración Cruda', desc: 'Validación en sitio directo de posibles colapsos por cuellos de botella garantizando certeza empírica sobre los canales consumibles.' },
            { title: 'Informes Estructurados sin Corrupción de Archivos', desc: 'Despliegues aptos para examinación técnica meticulosa de forma clara y explícita, exenta de decoraciones redundantes o abstractas inútiles para un analista auditor.' }
        ]
    },
    'academy': {
        title: 'ACADEMY: BIBLIOTECA INSTITUCIONAL DE RIGOR',
        subtitle: 'CONCEPTUALIZACIÓN DOCTRINARIA Y MODELOS MENTALES CIENTÍFICOS',
        overview: 'La provisión inagotable de datos purificados estocásticamente debe venir respaldada por un grado superior del bagaje epistemológico subyacente. Academy conforma un repositorio asilado de interferencias macro-económicas centrado puramente en afinar los escudos doctrinales sobre las metodologías avanzadas.\n\nSoberanía Cognitiva plena: Este apartado fomenta un profundo entendimiento de ataques Flash Loans, ingeniería de Front-Running e iteraciones en Market-Making orgánico, inmunizando intelectualmente al gestor contra narrativas ficticias minoristas forjadas sobre emociones e ilusión transaccional. La ventaja del analista radica verdaderamente en asimilar que todos los rumbos económicos suceden programáticamente (Vía Hardware y Liquidez).',
        features: [
            { title: 'Currículum Formativo de Modelos Defensivos Criptográficos', desc: 'Clasificación pragmática rigurosa con capítulos dedicados y exentos a disecciones de las estructuras que dictan Web3 subyacente L1 y L2 por capas jerárquicas lógicas.' },
            { title: 'Taxonomía Forense Superior del Glosario Técnico Operacional', desc: 'Reducción contundente de malentendidos mediante homogenización global descriptiva asumiendo los mismos términos que entidades institucionales y peritos de ciber-inteligencia.' },
            { title: 'Visibilidad Pura y Cero-Impacto Viso-Distractivo', desc: 'Cápsula lectora diseñada específicamente impidiendo sangrados laterales con bordes estrictos sin degradados agresivos para asimilación concentrativamente absoluta.' }
        ]
    },
    'support': {
        title: 'SUPPORT: PROTOCOLO TÁCTICO DE COMUNICACIÓN DIRECTA',
        subtitle: 'ENLACES ESTRATÉGICOS E INTERVENCIONES LOGÍSTICAS DE CHOQUE',
        overview: 'Cuando el análisis logarítmico choca contra una distorsión algorítmica externa no resuelta, o sucede un cierre de nodo crítico a nivel continental (API Blackout), Sovereign Support establece automáticamente la línea roja corporativa para la intervención humana inmediata y efectiva de alta resolución técnica.\n\nEvita retrasos fatales posibilitando el contacto y comunicación vertical desde los terminales criptográficos directo hacia la gobernanza directiva del sistema; resolviendo fallas complejas, mitigando dudas operativas durante ejecuciones tácticas inusuales sin delegar información ni datos privados a mesas de servicio públicas externas vulnerables a manipulación técnica e infiltraciones lógicas en cadena cruzada.',
        features: [
            { title: 'Escalamiento Determinístico Simultáneo a Operadores (Ad-Hocles)', desc: 'Garantiza sin intermediar que pautas complejas logarítmicas atascadas o fallas locales lleguen directamente al centro de mandos resolutivos técnicos integrales.' },
            { title: 'Integridad Absoluta Cero Exposición Operacional Concreta y Conectiva (Zero Leak Contexture)', desc: 'Inmediata preservación y enmascaramiento transaccional si requiriese enviar captura local de un problema específico sin adjuntar ni revelar Seed Phrases o Tokens privados localizados.' },
            { title: 'Provisión Continua Documentada in Situ de Status y Avería Sistémica', desc: 'Tableros e informáticos adyacentes para validar proactiva e institucionamente eventos mundiales catastróficos que afecten temporalmente a todo el protocolo Web3 como conjunto subyacentes globales de oráculos caídos temporalmente con absoluta transparencia estricta rigurosa.' }
        ]
    }
};
