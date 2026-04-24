"use client";

import React from "react";
import { OptimizedLocalLottie } from "./OptimizedLocalLottie";
import { SovereignFooter } from "./SovereignFooter";
import { Scan } from "lucide-react";

// Pre-defined list of lottie files matching the narrative sections.
// This preserves the "zero build-time bloat" since these are just string paths
// and they are fetched on-demand at runtime by OptimizedLocalLottie.
const MANIFESTO_LOTTIES = [
  "Earth globe rotating with Seamless loop animation.json",
  "DeeWork About Blockchain.json",
  "Crypto coins.json",
  "Big Data Analytics.json",
  "Isometric data analysis.json",
  "A Female Employee is Reading Financial Statements.json",
  "enterprice.json",
  "Manufacturing Industry Working Staff.json",
  "Business Analysis.json",
  "Browser Loading.json",
  "Abstract Isometric Loader #1.json",
  "Trade.json",
  "Online Payment.json",
  "Payments.json",
  "website.json",
  "Share.json",
  "History.json",
  "Search for value.json",
  "Business plan.json",
  "Business.json",
  "Virtual Education.json",
  "Distance Learning.json",
  "Geography.json",
  "Bitcoin touch.json",
  "Invest - Trade - concept.json",
  "BlockChain.json"
];

const IMMERSIVE_PAGES = [
  {
    title: "I. El Origen del Sistema: Eliminando la Asimetría",
    paragraphs: [
      "El ecosistema financiero descentralizado nació con la promesa de la transparencia. Sin embargo, la realidad demostró lo contrario: los grandes capitales operan con una ventaja informativa abrumadora, moviendo millones a través de redes y contratos privados antes de que el mercado minorista pueda reaccionar.",
      "Para resolver esta disparidad, creamos Sovereign Terminal. Nuestra directiva fundacional fue clara: construir una infraestructura capaz de leer, decodificar y analizar el comportamiento de estos gigantes directamente desde la blockchain, sin depender de servidores centralizados ni oráculos manipulables.",
      "Comenzamos desarrollando algoritmos de indexación en tiempo real. No nos bastaba con observar el volumen superficial; necesitábamos identificar exactamente la procedencia del capital, sus rotaciones internas y su destino final, capturándolo desde la mempool antes de su ejecución irreversible."
    ]
  },
  {
    title: "II. Filtrado Estocástico y Privacidad Absoluta",
    paragraphs: [
      "Las cadenas de bloques generan un volumen masivo de ruido diario. Los exploradores convencionales se limitan a listar transferencias ininteligibles. Nosotros, en cambio, diseñamos un motor de indexación que filtra matemáticamente ese ruido, aislando únicamente las anomalías críticas que impactan la liquidez global.",
      "Implementamos tecnología de pruebas de Conocimiento Cero (ZK-SNARKs) para garantizar la privacidad matemática pura. Nuestros operadores pueden consultar movimientos y billeteras específicas sin revelar jamás sus estrategias de vigilancia al sistema. Una infraestructura verdaderamente impenetrable.",
      "Esta arquitectura modular nos permitió expandir nuestro rastreo desde Ethereum hacia redes de escalabilidad (Rollups) y puentes inter-cadena, detectando movimientos tácticos horas antes de que la liquidez consolide su destino."
    ]
  },
  {
    title: "III. Consolidación de la Red de Inteligencia",
    paragraphs: [
      "Con el núcleo operativo establecido, el siguiente paso fue interpretar los datos. Integramos modelos heurísticos avanzados para desofuscar y etiquetar entidades oscuras. Hoy, nuestro sistema identifica automáticamente miles de plataformas, fondos institucionales y atacantes conocidos.",
      "Cuando una entidad intenta camuflar su capital fragmentándolo en cientos de billeteras menores, nuestro motor algorítmico agrupa esas transacciones y revela la firma conductual subyacente, exponiendo la magnitud real de la maniobra.",
      "Sovereign Terminal es hoy el estándar definitivo de inteligencia en cadena. Proveemos la infraestructura necesaria para operar con la misma precisión, velocidad y claridad que las élites financieras globales, asegurando la verdadera soberanía técnica."
    ]
  }
];

// ── 50 Historic Catastrophic Crypto & Finance Events ──────────────────────
const HISTORIC_EVENTS = [
  { date: "Oct 1929", code: "BLACK-001", title: "Crac del 29 — Jueves Negro", text: "La desintegración del 89% del Dow Jones Industrial Average en tres años, evaporando garantías hipotecarias y aniquilando 14 millones de empleos en EE.UU. El mayor colapso bursátil del siglo XX, preludio directo de la Gran Depresión global." },
  { date: "Aug 1971", code: "NIXON-002", title: "Nixon Shock — Fin del Patrón Oro", text: "Richard Nixon suprime unilateralmente la convertibilidad dólar-oro, destruyendo el sistema Bretton Woods. El orden monetario mundial mutó hacia una flotación libre de monedas fiduciarias sin respaldo intrínseco. El mayor reajuste del poder de compra global del siglo moderno." },
  { date: "Oct 1987", code: "BLACK-003", title: "Lunes Negro 1987 — Colapso Algorítmico", text: "El Dow Jones cae un 22.6% en un solo día. Los programas de 'portfolio insurance' disparan ventas en cascada por lógica algorítmica. Primer crash causado sistemáticamente por software automatizado, premonición directa de los flash crashes del siglo XXI." },
  { date: "Sep 1992", code: "SOROS-004", title: "La Ruptura del Sistema Monetario Europeo", text: "George Soros apostó $10B contra la libra esterlina forzando su expulsión del ERM. La devaluación forzosa del Banco de Inglaterra acumuló pérdidas de £3.4B en un solo día. Demostración empírica de que los especuladores privados pueden superar la capacidad de defensa de los bancos centrales soberanos." },
  { date: "Dec 1994", code: "PESO-005", title: "Crisis del Peso Mexicano — El Error de Diciembre", text: "La devaluación abrupta del peso desencadenó una fuga de capitales salvaje desde los mercados emergentes. El efecto Tequila infectó los mercados de Argentina, Brasil y el Sudeste Asiático. El FMI requirió un rescate de $50B para evitar el default soberano completo." },
  { date: "Jul 1997", code: "ASIA-006", title: "Crisis Financiera Asiática", text: "El colapso del baht tailandés detonó un contagio que colapsó las monedas de Indonesia, Corea del Sur y Malasia. El FMI impuso ajustes de austeridad que exterminaron clases medias enteras. El PIB de Indonesia cayó un 13.7% en un año: el mayor contracción económica desde la Segunda Guerra Mundial en la región." },
  { date: "Aug 1998", code: "RUSIA-007", title: "Default Soberano de Rusia", text: "Moscow repudió $40B en deuda gubernamental interna (GKOs), devaluó el rublo y moratorizó los pagos a acreedores privados extranjeros. El colapso arrastró al hedge fund LTCM al borde del abismo sistémico, requiring una operación de rescate coordinada por la Fed de New York para evitar el contagio global." },
  { date: "Sep 1998", code: "LTCM-008", title: "La Implosión de Long-Term Capital Management", text: "Un fondo con dos premios Nobel en su consejo directivo perdió $4.6B en semanas por el colapso de sus modelos matemáticos de arbitraje. La Fed orquestó un rescate privado de $3.65B de 14 bancos para evitar que su liquidación forzada colapsara los mercados de bonos globales." },
  { date: "Mar 2000", code: "DOTCOM-009", title: "Estallido de la Burbuja Punto-Com", text: "El NASDAQ pierde el 78% de su valor entre 2000 y 2002. Empresas valoradas en miles de millones sin ingresos reales se evaporan en meses. Webvan, Pets.com y Boo.com queman $2T en capital especulativo. El mayor destructor de riqueza tecnológica del milenio hasta la llegada de las ICOs." },
  { date: "Sep 2001", code: "911-010", title: "Cierre de la Bolsa de Nueva York Post-11S", text: "La NYSE cierra durante 6 días hábiles consecutivos, el período más largo desde 1933. Al reabrir, el Dow Jones pierde $1.4T en valor de mercado en una sola semana. El primer evento terrorista con consecuencias sistémicas sobre la arquitectura financiera global moderna." },
  { date: "Sep 2008", code: "LEH-011", title: "Quiebra de Lehman Brothers", text: "La mayor bancarrota corporativa de la historia: $613B en deuda. El colapso del banco de inversión con 158 años de historia congeló el crédito interbancario mundial en cuestión de horas, provocando el mayor rescate financiero gubernamental de la historia: $700B solo en EE.UU." },
  { date: "Oct 2008", code: "BAIL-012", title: "El Rescate TARP — Socialización de Pérdidas Privadas", text: "El gobierno estadounidense inyecta $700B en bancos privados insolventes con dinero de los contribuyentes. La paradoja fundacional del capitalismo moderno: los beneficios son privados, los colapsos son públicos. El evento que inspiró directamente el Bloque Génesis de Bitcoin con el mensaje de Satoshi." },
  { date: "Jan 2009", code: "BTC-013", title: "Génesis de Bitcoin — El Bloque 0", text: "Satoshi Nakamoto embute en el primer bloque de la cadena un mensaje periodístico sobre el segundo rescate de los bancos británicos, declarando la guerra a la finanza centralizada. El nacimiento de la primera moneda digital verdaderamente descentralizada, inalterable y sin custodio central." },
  { date: "May 2010", code: "PIZZA-014", title: "La Pizza de Bitcoin — 10,000 BTC", text: "Laszlo Hanyecz paga 10,000 BTC por dos pizzas, la primera transacción comercial documentada en Bitcoin. Al precio máximo histórico alcanzado en 2024, esa pizza equivaldría a $680 millones. El evento de asignación de valor más mítico en la historia de la economía digital." },
  { date: "Mar 2013", code: "CYPRUS-015", title: "Crisis Bancaria de Chipre — Corralito Digital", text: "El BCE y el FMI imponen un 'bail-in' sobre los depósitos bancarios chipriotas superiores a €100,000. El gobierno graba con un 9.9% los ahorros de los ciudadanos para salvar los bancos. La demanda de Bitcoin se disparó 300% en Europa en 72 horas." },
  { date: "Apr 2013", code: "BTC-016", title: "Primer Gran Crash de Bitcoin — $266 a $50", text: "El primer mercado bajista severo de Bitcoin. El precio colapsa desde $266 a $50 en horas tras la sobrecarga del exchange Mt. Gox durante un pico de demanda sin precedentes. El primer crash generado por infraestructura centralizada deficiente en un mercado descentralizado." },
  { date: "Feb 2014", code: "GOXZERO-017", title: "Mt. Gox Colapsa — 850,000 BTC Robados", text: "El exchange que procesaba el 70% del volumen global de Bitcoin anuncia la pérdida de 850,000 BTC (≈$450M en ese momento). Las claves privadas fueron extraídas durante años sin detección. El evento fundacional que demostró que la custodia centralizada es irreconciliable con la soberanía criptográfica." },
  { date: "Aug 2015", code: "CHINA-018", title: "Lunes Negro Chino — Flash Crash del Shanghai Composite", text: "El índice bursátil de Shanghái pierde el 8.49% en un día, borrando $3.2T en valor de mercado. El gobierno chino interviene con compras masivas de emergencia. El evento provocó una cadena de colapsos globales que afectó a 19 bolsas en un mismo día." },
  { date: "Jun 2016", code: "DAO-019", title: "El Ataque al DAO y el Hard Fork de Ethereum", text: "Un atacante drena 3.6 millones de ETH explotando una vulnerabilidad de reentrada en el contrato The DAO. La comunidad de Ethereum decide revertir la cadena mediante hard fork, dividiendo el ecosistema en ETH y ETC. La primera crisis existencial de la gobernanza descentralizada." },
  { date: "Jan 2018", code: "ICO-020", title: "El Gran Estallido ICO — Fin del Boom", text: "El mercado de ICOs alcanza $6.3B recaudados en 2017 para colapsar un 90%+ en 2018. Proyectos sin productos reales ni equipos verificables evaporan miles de millones. La SEC emite advertencias masivas y cierra operaciones fraudulentas. El eco moderno de la burbuja punto-com." },
  { date: "Dec 2017", code: "BCASH-021", title: "La Gran Bifurcación de Bitcoin — BCH vs BTC", text: "La guerra civil de Bitcoin culmina en el hard fork que genera Bitcoin Cash. La disputa sobre el tamaño del bloque divide a la comunidad, los mineros y los exchanges. El precio de BTC colapsa 45% en tres semanas, demostrando la fragilidad geopolítica de la gobernanza descentralizada." },
  { date: "Nov 2018", code: "BCHSV-022", title: "La Guerra de Hashing BCH/BSV", text: "Craig Wright y Roger Ver lanzan una guerra de minería destructiva para imponer su versión del protocolo. El costo de la 'guerra de hash' destruye miles de millones de rentabilidad de mineros, con ambas cadenas sufriendo reorganizaciones y cero confirmaciones durante días." },
  { date: "Mar 2020", code: "COVIDCRASH-023", title: "Jueves Negro Covid — Bitcoin cae 50% en 24h", text: "El 12 de marzo de 2020, Bitcoin pierde el 50% de su valor en un solo día de trading, cayendo de $8,000 a $4,000. Las liquidaciones en cascada de posiciones apalancadas en derivados destruyeron $1B en menos de una hora. El mayor crash porcentual en un solo día desde 2013." },
  { date: "Apr 2021", code: "TURKEY-024", title: "Colapso de la Lira Turca — Fuga hacia Crypto", text: "La lira turca pierde el 44% de su valor en 2021 tras la decisión del presidente Erdoğan de despedir al gobernador del banco central. El volumen de trading de USDTRY en exchanges de crypto se dispara 1,200%. La primera hiperinflación soberana donde el refugio masivo fue digital." },
  { date: "May 2021", code: "CHINABAN-025", title: "China Prohíbe Todas las Transacciones Crypto", text: "Beijing prohíbe a instituciones financieras procesar transacciones de criptomonedas y fuerza el cierre de operaciones de minado. El hashrate global de Bitcoin colapsa un 50%. El mayor choque regulatorio de la historia del mercado, demostrando la resiliencia descentralizada: la red se recuperó en 3 meses." },
  { date: "May 2022", code: "LUNA-026", title: "El Colapso de Terra/LUNA — $60B Evaporados", text: "El algoritmo de la stablecoin UST colapsa en espiral de muerte. LUNA pasa de $80 a $0.0001 en 72 horas. $60B en capitalización se evaporan, arrastran decenas de fondos de venture capital y causan el contagio más devastador en el ecosistema DeFi de la historia." },
  { date: "Jun 2022", code: "3AC-027", title: "Insolvencia de Three Arrows Capital", text: "El hedge fund criptográfico más grande del mundo colapsa con $3.5B en deudas. Su exposición masiva a LUNA y a productos de rendimiento estructurado tipo stETH/ETH trigger margin calls imposibles de cubrir. El efecto dominó destruyó a Voyager Digital, BlockFi y Genesis en semanas." },
  { date: "Jun 2022", code: "CELSIUS-028", title: "Celsius Bloquea los Retiros — 1.7M Usuarios Atrapados", text: "La plataforma de préstamos congela todos los retiros, swaps y transferencias. 1.7 millones de usuarios no pueden acceder a sus fondos durante meses en pleno proceso de bancarrota. La mayor captura de capital minorista de la historia del crédito criptográfico." },
  { date: "Nov 2022", code: "FTX-029", title: "El Colapso de FTX — El Escándalo Maestro", text: "Sam Bankman-Fried diseña una arquitectura opaca donde Alameda Research accede libremente a los depósitos de clientes de FTX. $8B en fondos de usuarios son utilizados para trading propio. El mayor fraude corporativo desde Enron, terminando con SBF arrestado en las Bahamas." },
  { date: "Nov 2022", code: "CONTAGIO-030", title: "El Contagio Post-FTX — BlockFi, Genesis, Gemini", text: "La quiebra de FTX inicia una reacción en cadena. BlockFi declara bancarrota con $1.2B de exposición a FTX. Genesis congela retiros. Gemini suspende su producto Earn. El mercado pierde $200B en capitalización en dos semanas. La mayor crisis de confianza sistémica en la historia del ecosistema." },
  { date: "Mar 2023", code: "SVB-031", title: "Colapso de Silicon Valley Bank — Detonante Bancario", text: "SVB colapsa en 48 horas con $175B en depósitos, la segunda mayor quiebra bancaria en historia americana. Circle (USDC) revela $3.3B atrapados en SVB. USDC desacopla al $0.87, generando pánico en todo DeFi. El contagio financiero tradicional invade el ecosistema descentralizado." },
  { date: "Jan 2024", code: "ETFBUY-032", title: "Aprobación ETF Bitcoin Spot EE.UU. — El Gran Influx", text: "La SEC aprueba los primeros ETFs de Bitcoin spot en EE.UU. tras años de resistencia. BlackRock, Fidelity y Invesco absorben $12B en los primeros 30 días. El mayor flujo de capital institucional hacia un activo digital en la historia financiera moderna." },
  { date: "Apr 2024", code: "HALVING-033", title: "Cuarto Halving de Bitcoin — Recompensa a 3.125 BTC", text: "El nuevo halving reduce la emisión de Bitcoin a 3.125 BTC por bloque. Por primera vez, las comisiones de transacción superan la recompensa en bloque durante el período de alta congestión, marcando la transición estructural hacia una economía de fees pura." },
  { date: "Mar 2020", code: "BITMEX-034", title: "BitMEX Liquidaciones — $1B en 1 Hora", text: "Durante el crash del COVID, BitMEX procesa $1B en liquidaciones forzadas en menos de 60 minutos, acelerando el colapso del mercado. La plataforma luego es acusada por el DOJ de operar sin licencia AML. El caso paradigmático del riesgo de los exchanges derivativos sin regulación." },
  { date: "May 2010", code: "FLASH-035", title: "Flash Crash de 2010 — 1,000 Puntos en Minutos", text: "El Dow Jones cae casi 1,000 puntos en minutos por algoritmos de HFT en reacción en cadena. El evento expuso la fragilidad sistémica del mercado de valores moderno dominado por trading algorítmico. La SEC implementó circuit breakers tras el evento." },
  { date: "Feb 2021", code: "GAME-036", title: "GameStop Gamma Squeeze — r/WallStreetBets vs Hedge Funds", text: "Pequeños inversores coordinados en Reddit ejecutan un short squeeze masivo contra fondos de cobertura. GameStop sube 2,400% en semanas. Melvin Capital pierde $6.8B. Robinhood suspende las compras, exponiendo cómo la regulación protege al capital institucional frente al minorista." },
  { date: "Aug 2022", code: "TORNADO-038", title: "Sanción de Tornado Cash por la OFAC", text: "El gobierno de EE.UU. sanciona por primera vez contratos inteligentes inmutables en cadena. El desarrollador Roman Storm fue arrestado. La acción marca el inicio de la era de represalia regulatoria sobre privacidad criptográfica." },
  { date: "May 2022", code: "BEANSTALK-039", title: "Hack de Beanstalk — $182M por Flash Loan Governance Attack", text: "Un atacante ejecuta un préstamo flash de $1B, adquiere temporalmente el control de la gobernanza del protocolo en una única transacción y drena $182M en activos. El ataque más sofisticado en DeFi hasta la fecha." },
  { date: "Mar 2022", code: "RONIN-040", title: "Hack del Ronin Bridge — $625M Robados", text: "Hackers vinculados al grupo Lazarus de Corea del Norte comprometen 5 de 9 validadores del puente Ronin de Axie Infinity. $625M en ETH y USDC son robados. El mayor hack de la historia DeFi demostró que la descentralización no es binaria sino espectral." },
  { date: "Oct 2021", code: "SQUID-041", title: "Squid Game Token — Rug Pull de $3.4M", text: "Un token SQUID basado en la popular serie Netflix colapsa 99.99% en segundos cuando sus creadores ejecutan un rug pull. El token subió 2,400% en horas antes del colapso. El caso más emblemático del ciclo de pump-and-dump alimentado por tendencias culturales virales." },
  { date: "Dec 2021", code: "JUNO-042", title: "Crisis de Gobernanza de Juno Network", text: "La comunidad de Juno vota confiscar 3.3M tokens de un solo whale wallet sospechoso. La propuesta se ejecuta en blockchain y luego se descubre que afecta en parte a una wallet equivocada. La primera 'censura descentralizada' documentada en la historia del DAO." },
  { date: "Nov 2022", code: "BINANCE-043", title: "CZ Revela Insolvencia FTX — El Tweet Catalizador", text: "CZ de Binance publica en Twitter la decisión de liquidar las posiciones de FTT. En 24 horas, $6.3B son retirados de FTX. El evento digital más costoso de la historia: un tweet que desencadenó la mayor corrida bancaria crypto jamás registrada." },
  { date: "Jun 2023", code: "SEC-044", title: "La SEC Demanda a Binance y Coinbase", text: "La SEC presenta cargos contra los dos mayores exchanges del mundo en días consecutivos, calificando docenas de tokens como securities no registrados. El impacto regulatorio borra $100B en capitalización. El inicio del período de mayor presión regulatoria coordinada sobre crypto." },
  { date: "Aug 2023", code: "XRP-045", title: "XRP No Es Security para Retail — Victoria Parcial", text: "La jueza Analisa Torres dictamina que las ventas de XRP al público no constituyen ofertas de securities bajo la ley Howey. La primera victoria legal de peso de la industria contra la SEC, reabriendo debates sobre la taxonomía regulatoria de activos digitales." },
  { date: "Dec 2023", code: "BINDEPART-046", title: "CZ Se Declara Culpable — Multa de $4.3B a Binance", text: "Changpeng Zhao se declara culpable de violaciones AML y es sentenciado a 4 meses de prisión. Binance paga la mayor multa de la historia crypto: $4.3B al DOJ/FinCEN. El intercambio de mayor volumen del mundo es forzado a reestructurarse bajo supervisión federal." },
  { date: "Mar 2024", code: "MEME-047", title: "El Ciclo MEME 2024 — Dogwifhat y BOME", text: "El mercado de los memecoins alcanza $65B de capitalización total. Dogwifhat sube 10,000%. Book of Meme captura $1B de market cap en 48 horas desde su lanzamiento. La mayor burbuja especulativa de activos sin utilidad intrínseca de la historia moderna del trading." },
  { date: "Oct 2024", code: "EIGEN-048", title: "EigenLayer y el Riesgo Sistémico del Restaking", text: "EigenLayer lanza su token EIGEN con polémicas restricciones de transferibilidad. La promesa del restaking genera $15B en depósitos pero su modelo económico circular genera preocupaciones sistémicas que evocan directamente los CDOs colateralizados de la crisis de 2008." },
  { date: "Nov 2024", code: "HYPERLIQ-049", title: "$200M Whale Exploit en Hyperliquid", text: "Un operador acumula una posición de $200M en JELLY ejecutando manipulación del precio fundacional y forzando al protocolo a asumir pérdidas sistémicas. El vault HLP pierde millones en horas. Revela la fragilidad de los DEX perpetuos con liquidez insuficiente en vaults primarios." },
  { date: "Apr 2025", code: "TRUMP-050", title: "Aranceles Trump 2025 — Crypto Pierde $1T en Semanas", text: "El presidente Trump anuncia aranceles del 145% sobre importaciones chinas. El mercado crypto pierde $1T en capitalización en 10 días. Bitcoin cae de $109,000 a $74,000. La primera demostración escala masiva de que los activos digitales son altamente correlados con la geopolítica macroeconómica." },
];

const LEFT_SIDEBAR_CONTENT = [
  {
    title: "Desfalco de Mt. Gox (2014)",
    text: "El paroxismo originario de la fragilidad del custodio centralizado. Al delegar la custodia de ochocientas cincuenta mil unidades de Bitcoin a una infraestructura de servidores tradicional con bases de datos SQL mutables, la asimetría de seguridad derivó en la sustracción silente y prolongada del setenta por ciento del volumen global. Postulado fundacional absoluto: la posesión algorítmica fidedigna es inexistente fuera de las claves privadas criptográficas."
  },
  {
    title: "Espiral de Muerte de Terra/LUNA (2022)",
    text: "La demostración empírica del fracaso matemático de las stablecoins algorítmicas subcolateralizadas. Fomentados por reservas de fe en lugar de inmutabilidad matemática sobredimensionada, los anclajes de valor colapsaron bajo presión hiperbólica, evaporando sesenta mil millones de capital fiduciario en setenta y dos horas. Revela crudamente que la economía cibernética no sobrevive al apalancamiento sin anclas tangibles en capa cero."
  },
  {
    title: "Colapso del Imperio FTX (2022)",
    text: "El cenit global de la opacidad institucional en el siglo XXI. Operando tras una falsa cortina de regulación, la rehipotecación algorítmica del capital de los usuarios mediante 'puertas traseras' en el código base tradicional facilitó la dilapidación abismal de reservas. Esta implosión sistemática purificó el ecosistema, evidenciando que sin herramientas de transparencia on-chain y liquidación determinista, los oráculos humanos caen en depravación."
  },
  {
    title: "La Caída de Celsius Network (2022)",
    text: "El espejismo del rendimiento perpétuo. La rehipotecación en cascada de activos minoristas en protocolos exóticos sin contingencia de liquidez desembocó en insolvencia matemática inmediata. Evidencia taxativa de que la opacidad del balance off-chain invariablemente enmascara riesgos catastróficos si no hay respaldos deterministas públicamente auditables."
  },
  {
    title: "El Cisma de Tornado Cash (2022)",
    text: "Intervención a nivel estado en la capa de protocolo. La sanción a contratos inteligentes inmutables por la OFAC demostró la latencia coercitiva de las jurisdicciones fiduciarias sobre desarrolladores de código abierto. Un preludio a la batalla final por la privacidad algorítmica, demostrando que verdaderas redes criptográficas requieren ofuscación irremediablemente cifrada."
  },
  {
    title: "Saturación del Consenso Central (2024)",
    text: "El monopolio progresivo de la validación. Plataformas dominantes de Liquid Staking aglomeraron cotas críticas del poder confirmatorio de la red principal, evidenciando la inherente vulnerabilidad paulatina del Proof-of-Stake frente a carteles oligopólicos de capitalización. Un recordatorio drástico de que los ecosistemas de élite tienden hacia asimetrías de poder cuasi-feudales de no mediar sistemas de corrección."
  }
];

const RIGHT_SIDEBAR_CONTENT = [
  {
    title: "Bifurcación de The DAO (2016)",
    text: "El evento de fisura más profundo en la axiomática del 'Código es Ley'. Tras la recolección masiva de Ether en la naciente Máquina Virtual de Ethereum, un ataque por reentrada de funciones drenó severamente el contrato maestro. La corrección requirió una amputación brutal mediante bifurcación dura (Hard Fork), alterando para siempre la génesis de la red y exponiendo la inmadurez biológica de la lógica computacional inmutable pura."
  },
  {
    title: "Extracción del Ronin Bridge (2022)",
    text: "El siniestro absoluto por la ilusión de la descentralización. Un puente de escalabilidad cedió más de seiscientos millones de dólares porque su autoridad matemática residía en un esquema M-de-N extremadamente precario (cinco de nueve validadores). Al comprometer las firmas mediante vectores de ataque de ingeniería social corporativa, se desmanteló por completo la narrativa subyacente de seguridad distribuida real."
  },
  {
    title: "La Fisura de Wormhole (2022)",
    text: "El clímax de vulnerabilidad en la topología poli-cadena (Cross-chain). Mediante la falsificación algorítmica de atestaciones y la elusión de validaciones triviales en los contratos inteligentes de puenteo, la arquitectura sufrió una sustracción inmediata de gran magnitud sin contramedidas reactivas posibles. Concluyendo definitivamente que los vectores poli-cadena elevan la entropía sistémica exponencialmente si no se auditan a prueba de abismos."
  },
  {
    title: "La Anomalía Nomad (2022)",
    text: "Decadencia técnica en puentes de enrutamiento cross-chain. Una configuración paramétrica nula de variables en la rutina de validación de Merkle permitió el primer saqueo masivo de extracción colectiva descentralizada ('crowdsourced'). Una advertencia draconiana testificando empíricamente que cualquier abstracción superflua en la criptografía transfiere valor infinito directamente al vacío basal."
  },
  {
    title: "Desacoplamiento de USDC (2023)",
    text: "El contagio residual del mecanismo de reserva fraccionaria clásica. La sobredependencia de tesorería hacia entidades fiduciarias (Silicon Valley Bank) socavó temporalmente la paridad absoluta de la stablecoin hegemónica del ecosistema. Una comprobación taxativa: toda conjunción vinculante, por sutil que fuese, con las fallas de la banca analógica expone a la arquitectura on-chain al caos externo."
  },
  {
    title: "El Vacío de Iron Finance (2021)",
    text: "La histeria irracional del arbitraje de sobreestabilización colateral. Un diseño tokenómico defectuoso detonó un bucle de retroalimentación puramente entrópico e hiperbólico, hundiendo el capital líquido y diluyendo el token de gobernanza en una deflación precipitada y letal. El suceso cristaliza de nuevo que el capital altamente eficiente es completamente agnóstico ante la narrativa carente de resiliencia empírica probada."
  }
];

export function ImmersiveManifestoLanding({ onOpenScanner }: { onOpenScanner?: () => void } = {}) {
  
  return (
    <div className="min-h-[100dvh] bg-[#FDFCF8] text-[#1a1a1a] selection:bg-black selection:text-white font-sans w-full relative overflow-clip">

      <div className="relative z-10 w-full max-w-[1750px] mx-auto px-5 sm:px-8 flex justify-center gap-12 xl:gap-24 pb-16">
        
        {/* Left Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto no-scrollbar pb-12">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tracto I: Opacidad y Ruina
            </h3>
          </div>
          <div className="flex flex-col gap-24">
            {LEFT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 1).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

        {/* Central Immersive Manifesto */}
        <main className="w-full max-w-[850px] shrink-0 py-12 sm:py-16 flex flex-col gap-16 sm:gap-24">
          
          <header className="flex flex-col gap-6 text-center mb-8">
          <h1 className="text-[32px] md:text-[42px] font-serif text-black leading-tight tracking-tight">
            En la búsqueda de la <br/><span className="italic font-light">transparencia</span>
          </h1>
          <div className="flex justify-center -mt-2 mb-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-black/30">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6">
            Documento fundacional sobre la abstracción matemática pura, los mecanismos criptográficos de 
            conocimiento cero y los paradigmas heurísticos deterministas que cimentan la infraestructura global inmutable.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {IMMERSIVE_PAGES.map((page, pageIndex) => (
            <section key={pageIndex} className="flex flex-col relative w-full">
              <div className="w-full border-b-[1.5px] border-black pb-3 mb-6 flex items-end">
                <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
                  {page.title}
                </h2>
              </div>
              
              {/* Stack Data Grid - Dense and tightly packed */}
              <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
                {page.paragraphs.map((para, pIndex) => {
                   const globalIndex = (pageIndex * 3) + pIndex;
                   const lottieFile = MANIFESTO_LOTTIES[globalIndex % MANIFESTO_LOTTIES.length];

                   return (
                     <div key={pIndex} tabIndex={0} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden focus:outline-none cursor-pointer">
                       
                       {/* Lottie fixed block on the left (solid stack integration) */}
                       <div className="w-full sm:w-[320px] bg-[#f5f4ef] flex items-center justify-center p-8 sm:p-6 border-b sm:border-b-0 sm:border-r border-black/10 shrink-0 relative overflow-hidden transition-colors duration-500 group-hover:bg-[#f0efe9]">
                          <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] grayscale mix-blend-multiply opacity-85 transition-transform duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
                             <OptimizedLocalLottie filename={lottieFile} />
                          </div>
                       </div>
                       
                       {/* Text Content */}
                       <div className="flex-1 p-5 sm:p-6 md:p-8 flex items-start">
                          <span className="font-mono text-[10px] text-black/30 tracking-widest mr-3 sm:mr-6 select-none flex-shrink-0 mt-[2px]">
                             [{String(pageIndex + 1).padStart(2, '0')}.{String(pIndex + 1).padStart(2, '0')}]
                          </span>
                          <p className="font-serif text-[12px] sm:text-[13px] text-[#222] leading-[1.8] text-justify w-full">
                             {para}
                          </p>
                       </div>

                     </div>
                   );
                })}
               </div>
            </section>
          ))}
        </div>

        {/* ─── Public Akashic Ledger Zero-Mock Sample ─── */}
        <PublicAkashicLedgerSample />

        {/* ─── Scanner Direct Handshake Documentation ─── */}
        <ScannerDocumentation />

        {/* ─── 50 Historic Catastrophic Events Chronicle ─── */}
        <CatastropheChronicle />

        </main>

        {/* Right Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto no-scrollbar pb-12">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tracto II: Entropía Central
            </h3>
          </div>
          <div className="flex flex-col gap-24">
            {RIGHT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 4).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

      </div>

      {/* Floating Scanner Panel - ABOVE MobileNavBar (z-[200] > z-[100]) */}
      {onOpenScanner && (
        <div className="fixed bottom-0 left-0 w-full flex flex-col pointer-events-none z-[200]">
           <div className="h-16 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent w-full pointer-events-none" />
           {/* Full dock bar — pointer-events-auto so taps reach the button */}
           <div className="w-full bg-[#FDFCF8] border-t border-black/10 flex justify-center py-3 pointer-events-auto" style={{ paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 64px))' }}>
             <button
               type="button"
               onClick={onOpenScanner}
               className="px-10 py-3 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-3 rounded-none select-none touch-manipulation"
               style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
             >
               <Scan size={13} />
               Session Log &amp; Scan
             </button>
           </div>
        </div>
      )}

      {/* ─── Sovereign Footer (full-bleed, outside max-width container) ─── */}
      <div className="relative z-10">
        <SovereignFooter />
      </div>

    </div>
  );
}

function CatastropheChronicle() {
  return (
    <section
      className="w-full max-w-[850px] shrink-0 pt-12 pb-16 flex flex-col"
      aria-label="Crónica de Eventos Históricos Catastróficos"
    >
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end gap-4">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
          CRÓNICA HISTÓRICA — 50 Eventos que Detonaron el Orden Financiero
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-black border border-black border-t-0 shadow-sm">
        {HISTORIC_EVENTS.map((ev, i) => (
          <div
            key={ev.code}
            className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden cursor-default hover:bg-[#f5f4ef] transition-colors duration-300"
          >
            {/* Date / Code pill */}
            <div className="w-full sm:w-[160px] bg-[#f5f4ef] group-hover:bg-[#eceae3] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-4 shrink-0 transition-colors duration-300">
              <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">{ev.date}</span>
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/60 group-hover:text-black transition-colors duration-300">{ev.code}</span>
            </div>
            {/* Content */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col gap-1.5">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">
                [{String(i + 1).padStart(2, '0')}] {ev.title}
              </span>
              <p className="font-serif text-[12px] sm:text-[13px] text-[#333] leading-[1.8] text-justify">
                {ev.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PublicAkashicLedgerSample() {
  const [feed, setFeed] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/akashic/verify')
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.results) setFeed(d.results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full max-w-[850px] shrink-0 pt-12 pb-4 flex flex-col">
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end justify-between">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black flex items-center gap-2">
          <Scan size={14} /> Akashic Ledger — Public Audit Sample
        </h2>
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#00C076] animate-pulse">
          Live Feed Active
        </span>
      </div>
      <div className="flex flex-col gap-[1px] bg-black border border-black border-t-0 shadow-sm">
        {loading ? (
          <div className="bg-[#fdfbf6] p-8 flex justify-center text-[10px] font-mono uppercase tracking-widest text-black/40">
            Syncing Sovereign Consensus...
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-[#fdfbf6] p-8 flex justify-center text-[10px] font-mono uppercase tracking-widest text-black/40">
            Awaiting $50M+ Threshold Crossings
          </div>
        ) : (
          feed.map((entry, i) => (
            <div key={i} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden hover:bg-[#f5f4ef] transition-colors duration-300">
              <div className="w-full sm:w-[160px] bg-[#f5f4ef] group-hover:bg-[#eceae3] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-4 shrink-0 transition-colors duration-300">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1">{entry.chain}</span>
                <span className="font-mono text-[11px] font-black tracking-wider text-black group-hover:text-[#D4AF37] transition-colors duration-300">
                  ${(entry.amountUsd / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-2 justify-center">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/50">
                    ID: AKASHIC-{entry.id}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#00C076] flex items-center gap-1">
                    <Scan size={10} /> Verified
                  </span>
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] text-[#555] break-all leading-relaxed bg-black/5 p-2 border border-black/10 selection:bg-black selection:text-white">
                  SHA256: {entry.storedHash}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-black/40">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <a 
                    href={`/status`} 
                    target="_blank"
                    className="font-mono text-[8px] uppercase tracking-widest text-black hover:underline"
                  >
                    View Infrastructure Status →
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ScannerDocumentation() {
  return (
    <section className="w-full max-w-[850px] shrink-0 pt-12 pb-16 flex flex-col gap-8">
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
          Arquitectura del Escáner y Conexión Soberana
        </h2>
      </div>
      <div className="flex flex-col gap-6 font-serif text-[13px] text-[#222] leading-relaxed text-justify">
        <p>
          Nuestro escáner de autenticación no es un simple lector de códigos QR; es un puente criptográfico directo (Direct Handshake) entre su dispositivo móvil soberano y la terminal web. Cuando escanea el código, su billetera firma matemáticamente un desafío de sesión único.
        </p>
        <p>
          Este diseño elimina la necesidad de contraseñas, correos electrónicos o bases de datos centralizadas. Toda la autorización ocurre puramente a través de criptografía de curva elíptica (ECDSA), garantizando que solo el poseedor genuino de las llaves privadas pueda acceder al nivel institucional del sistema.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col border border-black/10 bg-white p-2 shadow-sm">
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mb-2 border-b border-black/10 pb-1">Mobile Panel</span>
            <img src="/dashboard-bg.jpg" alt="Mobile Panel" className="w-full h-auto aspect-video object-cover grayscale mix-blend-multiply opacity-80" />
          </div>
          <div className="flex flex-col border border-black/10 bg-white p-2 shadow-sm">
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mb-2 border-b border-black/10 pb-1">Whale Post</span>
            <img src="/official-whale-vector.png" alt="Whale Post" className="w-full h-auto aspect-video object-contain grayscale mix-blend-multiply opacity-80" />
          </div>
          <div className="flex flex-col border border-black/10 bg-white p-2 shadow-sm">
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mb-2 border-b border-black/10 pb-1">Verified Ledger</span>
            <img src="/landing-bg.jpg" alt="Verified Ledger" className="w-full h-auto aspect-video object-cover grayscale mix-blend-multiply opacity-80" />
          </div>
          <div className="flex flex-col border border-black/10 bg-white p-2 shadow-sm">
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mb-2 border-b border-black/10 pb-1">Audit Logs</span>
            <img src="/peakpx.jpg" alt="Audit Logs" className="w-full h-auto aspect-video object-cover grayscale mix-blend-multiply opacity-80" />
          </div>
        </div>
      </div>
    </section>
  );
}
