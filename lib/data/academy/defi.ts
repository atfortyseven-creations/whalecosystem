export const defiModules = [
    {
        id: "defi",
    title: "VI. DeFi: Anatomía de los Protocolos Descentralizados",
    description: "Análisis técnico y económico de las primitivas financieras que están reemplazando a la banca tradicional. 20 Módulos de Máxima Perfección.",
    articles: [
        {
            id: "aave-money-markets-efficiency",
            title: "1. Aave: El Motor de Mercado Monetario y la Eficiencia del Capital",
            description: "Mercados de préstamos con colateralización variable y tasas de interés algorítmicas.",
            readTime: 230,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Pooling de Liquidez Institucional</h2>
                    <p>Aave revolucionó el sector al pasar de un modelo P2P a un modelo de reserva (pool-based). Los usuarios depositan activos que se convierten en aTokens portadores de intereses. La seguridad del protocolo reside en su Factor de Salud (Health Factor), una métrica forense que determina el riesgo de liquidación instantánea ante la volatilidad del mercado.</p>
                </section>
            </div>`
        },
        {
            id: "curve-stablecoin-liquidity",
            title: "2. Curve Finance: El Corazón de la Liquidez de Stablecoins",
            description: "Análisis de la invariante Stableswap y la eficiencia en el intercambio de activos vinculados.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Minimizando el Deslizamiento en Pegged Assets</h2>
                    <p>Curve utiliza una curva de enlace (bonding curve) optimizada para activos que deben valer lo mismo (ej: USDC/DAI). Su diseño PhD permite realizar intercambios multimillonarios con un deslizamiento (slippage) cercano a cero, convirtiéndose en la infraestructura de liquidez base para todo el ecosistema de stablecoins.</p>
                </section>
            </div>`
        },
        {
            id: "defi-aggregators-optimization",
            title: "3. DeFi Aggregators: Optimizando el Rendimiento (1inch, Paraswap)",
            description: "Enrutamiento inteligente de órdenes y la fragmentación de la liquidez.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Algoritmo Pathfinder</h2>
                    <p>Los agregadores escanean múltiples DEXs en tiempo real para dividir una sola operación en varias rutas óptimas. Esta orquestación técnica garantiza que el usuario institucional siempre obtenga el mejor precio posible, mitigando el impacto de la fragmentación de liquidez on-chain.</p>
                </section>
            </div>`
        },
        {
            id: "derivatives-synthetic-assets",
            title: "4. Derivados y Activos Sintéticos: De dYdX a Synthetix",
            description: "Exposición a mercados globales sin salir de la blockchain: Futuros y opciones on-chain.",
            readTime: 250,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Apalancamiento Descentralizado</h2>
                    <p>Los derivados permiten a los traders especular sobre la dirección de los precios con capital prestado directamente de contratos inteligentes. El analista PhD diferencia entre modelos de order-book off-chain (dYdX) y modelos de contraparte centralizada por colateral (Synthetix), evaluando los riesgos de solvencia sistémica en cada uno.</p>
                </section>
            </div>`
        },
        {
            id: "future-of-defi-rwa",
            title: "5. El Futuro de DeFi: Integración Institucional y RWA",
            description: "Hacia una economía global inmutable: La fusión de las finanzas tradicionales y on-chain.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Convergencia de Dos Mundos</h2>
                    <p>La siguiente frontera es la tokenización de activos del mundo real (RWA), como bonos del tesoro, bienes raíces y facturas comerciales. Al traer estos activos a la blockchain, DeFi no solo escala en capital, sino que adquiere una utilidad económica que trasciende la especulación criptográfica pura.</p>
                </section>
            </div>`
        },
        {
            id: "lending-borrowing-v2-isolated-markets",
            title: "6. Lending & Borrowing v2: Capital Eficiencia y Mercados Aislados",
            description: "Evolución de los préstamos: De la colateralización cruzada a los silos de riesgo controlados.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Aislamiento de Riesgo Sistémico</h2>
                    <p>Los nuevos protocolos de préstamos (como Silo o Morpho) permiten crear mercados aislados para activos específicos. Esto evita que la caída de un token exótico comprometa la liquidez de todo el protocolo, permitiendo una gestión de riesgo granular de nivel institucional.</p>
                </section>
            </div>`
        },
        {
            id: "liquidity-amms-uniswap-v3",
            title: "7. Liquidez y AMMs: De Uniswap v2 a Concentrated Liquidity (v3)",
            description: "La evolución del creador de mercado automático: Maximizando el retorno por cada dólar depositado.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Liquidez Concentrada: Rangos de Precisión</h2>
                    <p>Uniswap v3 introdujo la capacidad de depositar liquidez en rangos de precios específicos. Esta innovación PhD permite que un LP (Liquidity Provider) obtenga la misma rentabilidad con una fracción del capital, pero a costa de un mayor riesgo de <em>Impermanent Loss</em> si el precio sale del rango definido.</p>
                </section>
            </div>`
        },
        {
            id: "liquity-decentralized-stability",
            title: "8. Liquity: Estabilidad Descentralizada y LUSD",
            description: "Análisis del protocolo de préstamos con interés cero y liquidaciones instantáneas.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Préstamos con Interés 0%</h2>
                    <p>Liquity se diferencia por no cobrar intereses recurrentes, cargando solo una comisión de apertura única. Su stablecoin, LUSD, está respaldada exclusivamente por ETH, utilizando un mecanismo de redención directa que garantiza un suelo de precio robusto y una descentralización inmutable.</p>
                </section>
            </div>`
        },
        {
            id: "makerdao-central-bank-dai",
            title: "9. MakerDAO: El Banco Central de la Blockchain (DAI)",
            description: "Emisión de moneda estable mediante sobrecolateralización y gobernanza descentralizada.",
            readTime: 260,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Protocolo de Reserva Soberano</h2>
                    <p>MakerDAO es el protocolo pionero de stablecoins. Mediante las Posiciones de Deuda Colateralizada (CDPs), ahora llamadas Vaults, los usuarios emiten DAI bloqueando activos. Su motor de liquidación y los parámetros de riesgo gestionados por la DAO actúan como una política monetaria algorítmica incesante.</p>
                </section>
            </div>`
        },
        {
            id: "mev-protection-shielding",
            title: "10. MEV Protection: Blindando el Protocolo contra el Saneamiento",
            description: "Defensa contra ataques sándwich y front-running en la ejecución de transacciones.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Extracción de Valor y su Mitigación</h2>
                    <p>El MEV (Maximal Extractable Value) puede erosionar las ganancias de los usuarios de DeFi. Protocolos de protección como Flashbots o CowSwap utilizan subastas privadas de transacciones y coincidencias de intenciones (Intents) para asegurar que el valor se quede en el usuario y no en los bots de arbitraje.</p>
                </section>
            </div>`
        },
        {
            id: "prediction-markets-polymarket",
            title: "11. Mercados de Predicción: De Augur a Polymarket",
            description: "La sabiduría de las masas on-chain: Especulación sobre eventos del mundo real.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Oráculos de Verdad Social</h2>
                    <p>Los mercados de predicción permiten a los usuarios apostar sobre el resultado de elecciones, deportes o noticias. Su valor forense reside en que suelen ser indicadores más precisos que las encuestas tradicionales, ya que los participantes tienen incentivos financieros directos para ser honestos.</p>
                </section>
            </div>`
        },
        {
            id: "nexus-mutual-on-chain-insurance",
            title: "12. On-chain Insurance: Mutuas de Riesgo y Cobertura (Nexus Mutual)",
            description: "Protección contra fallos de contratos inteligentes y hacks de protocolos.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Capital de Riesgo Compartido</h2>
                    <p>El seguro en DeFi funciona mediante mutuas donde los miembros aportan capital para cubrir riesgos específicos. Las reclamaciones se votan de forma descentralizada, creando una red de seguridad que permite a las instituciones desplegar capital con mayor confianza en entornos adversos.</p>
                </section>
            </div>`
        },
        {
            id: "rebase-tokens-algorithmic-stables",
            title: "13. Rebase Tokens y Stablecoins Algorítmicas",
            description: "Análisis de la expansión y contracción elástica del suministro monetario.",
            readTime: 170,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Suministros Elásticos</h2>
                    <p>Los Rebase tokens (como Ampleforth) ajustan el balance de todas las carteras proporcionalmente para mantener un precio objetivo. El analista PhD estudia estos modelos como experimentos de política monetaria pura, advirtiendo sobre los riesgos de espirales de muerte en modelos no colateralizados.</p>
                </section>
            </div>`
        },
        {
            id: "rwa-tokenization-real-economy",
            title: "14. RWA: Real World Assets y la Tokenización de la Economía Real",
            description: "Inyectando liquidez global en activos físicos y financieros tradicionales.",
            readTime: 230,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Digitalización del Valor Físico</h2>
                    <p>Los RWA permiten que un edificio en Nueva York o un bono del tesoro de EE. UU. se convierta en un token divisible y negociable 24/7. Esta infraestructura forense requiere puentes legales y oráculos de identidad (KYC) para cumplir con las normativas institucionales sin perder la eficiencia on-chain.</p>
                </section>
            </div>`
        },
        {
            id: "stablecoins-overcollateralization-models",
            title: "15. Stablecoins: De USDT a los Modelos de Sobrecolateralización",
            description: "Diseño de la estabilidad: Garantías fiduciarias vs. garantías criptográficas.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Espectro de la Estabilidad</h2>
                    <p>Existen tres tipos principales de stablecoins: Fiat-backed (USDC/USDT), Crypto-backed (DAI/LUSD) y Algorítmicas. Cada una ofrece un equilibrio diferente entre descentralización, escalabilidad y robustez del <em>peg</em>, siendo la sobrecolateralización el estándar de oro para la seguridad PhD.</p>
                </section>
            </div>`
        },
        {
            id: "synthetix-infinite-liquidity",
            title: "16. Synthetix: Liquidez Infinita y Swaps Atómicos",
            description: "Creación de activos sintéticos (Synths) respaldados por una deuda colectiva.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Modelo de Counterparty de Deuda</h2>
                    <p>En Synthetix, no existe un comprador y vendedor directo; los usuarios operan contra el pool de stakers del protocolo. Esto permite una 'liquidez infinita' teórica para el intercambio entre diferentes activos sintéticos, eliminando el deslizamiento a cambio de asumir el riesgo de la fluctuación de la deuda global.</p>
                </section>
            </div>`
        },
        {
            id: "defi-stack-composability",
            title: "17. The DeFi Stack: Anatomía de la Componibilidad",
            description: "Capas de valor: Desde el settlement hasta las interfaces de agregación de usuario.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Money Legos: La Integración Vertical</h2>
                    <p>DeFi se construye en capas: 1. Capa de Liquidación (Ethereum). 2. Capa de Activos (ETH/Stablecoins). 3. Capa de Protocolos (Lending/DEX). 4. Capa de Aplicación (Interfaces). Entender esta jerarquía es vital para el análisis de riesgos cruzados y la detección de fallos en cascada.</p>
                </section>
            </div>`
        },
        {
            id: "vetokenomics-governance-incentives",
            title: "18. veTokenomics: Gobernanza y Alineación de Incentivos (veCurve)",
            description: "El modelo Vote-Escrowed: Bloqueo de capital como prueba de compromiso a largo plazo.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Alineando Protocolo y Poseedor</h2>
                    <p>El modelo 've' obliga a los usuarios a bloquear sus tokens por periodos de tiempo (hasta 4 años) para obtener poder de voto y mayores recompensas. Este mecanismoPhD reduce la presión de venta y asegura que quienes toman las decisiones de gobernanza tengan la mayor exposición al éxito futuro del protocolo.</p>
                </section>
            </div>`
        },
        {
            id: "yearn-finance-vaults-optimization",
            title: "19. Yearn Finance: Bóvedas de Estrategia Agnostic de Gas",
            description: "Automatización de la búsqueda de rendimientos máximos mediante contratos inteligentes.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Optimizador de Rendimiento</h2>
                    <p>Yearn actúa como un fondo de cobertura automatizado. Las bóvedas (Vaults) mueven el capital entre diferentes protocolos de préstamos y farming para maximizar el retorno neto, diluyendo los costos de gas entre miles de usuarios y simplificando la experiencia de inversión institucional.</p>
                </section>
            </div>`
        },
        {
            id: "yield-farming-liquidity-mining",
            title: "20. Yield Farming y Liquidity Mining: La Era del Crecimiento Explosivo",
            description: "Incentivos de emisión de tokens para atraer liquidez temprana y descentralización de la red.",
            readTime: 250,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Subsidio a la Liquidez</h2>
                    <p>El Yield Farming consiste en depositar activos para recibir recompensas en el token nativo del protocolo. Esta táctica, popularizada en el 'DeFi Summer' de 2020, permite una distribución rápida de la gobernanza, aunque introduce retos forenses de sostenibilidad y gestión de la inflación del token.</p>
                </section>
            </div>`
        }
    ]
}
];
