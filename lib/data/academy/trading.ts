export const tradingModules = [
    {
        id: "advanced-trading",
        title: "X. Estrategias de Trading Avanzado en Mercados Cripto",
        description: "Análisis técnico, gestión de riesgo y estrategias institucionales. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "on-chain-analytics",
                title: "1. Análisis On-Chain: El Telescopio del Mercado",
                description: "SOPR, NVT y Realized Cap.",
                readTime: 60,
                content: "<h2>Edge de Información</h2><p>El análisis on-chain permite ver el comportamiento real de las ballenas y los minoristas. Métricas como el MVRV indican si el mercado está sobrevalorado o infravalorado respecto al coste promedio de adquisición, ofreciendo señales de entrada y salida macro precisas.</p>"
            },
            {
                id: "funding-rate-arbitrage",
                title: "2. Arbitraje de Funding Rate",
                description: "Cobrando intereses a los especuladores.",
                readTime: 50,
                content: "<h2>El Pago del Tiempo</h2><p>Cuando el mercado está muy eufórico, los largos pagan a los cortos una comisión cada 8 horas. Abrir una posición corta hedgeada permite cobrar este funding rate, obteniendo APYs que a veces superan el 100% en momentos de locura.</p>"
            },
            {
                id: "trading-bot-architectures",
                title: "3. Arquitecturas de Bots: APIs y Latencia",
                description: "Automatizando la ejecución institucional.",
                readTime: 55,
                content: "<h2>Velocidad de Ejecución</h2><p>Los bots de trading usan APIs para conectar con exchanges. La seguridad de las API Keys (restringiendo IPs y retiros) y la proximidad física al servidor del exchange son factores diferenciadores en el trading de alta frecuencia.</p>"
            },
            {
                id: "basis-trading-crypto",
                title: "4. Basis Trading: Cash and Carry",
                description: "Arbitraje entre Spot y Futuros.",
                readTime: 50,
                content: "<h2>Rendimiento Seguro</h2><p>Comprar en spot y vender en futuros con vencimiento lejano permite capturar la prima de futuros. Es una estrategia de bajo riesgo que genera rendimientos estables en dólares, muy usada por fondos institucionales en mercados alcistas.</p>"
            },
            {
                id: "market-cycles",
                title: "5. Ciclos de Mercado: El Reloj del Halving",
                description: "Acumulación, euforia y capitulación.",
                readTime: 50,
                content: "<h2>Psicología de Masas</h2><p>Bitcoin se mueve en ciclos de 4 años marcados por el halving. Identificar la fase de 'Depresión' para comprar y la 'Euforia' para vender es la estrategia más rentable a largo plazo, requiriendo una disciplina emocional extrema.</p>"
            },
            {
                id: "copy-trading-pros-cons",
                title: "6. Copy Trading: Automatización y Riesgos",
                description: "Siguiendo líderes en exchanges centralizados.",
                readTime: 40,
                content: "<h2>Delegando la Decisión</h2><p>Permite replicar las operaciones de un trader exitoso. El riesgo es la latencia (tú entras peor que el líder) y la falta de transparencia en la gestión de riesgo del trader original, lo que puede llevar a liquidaciones conjuntas.</p>"
            },
            {
                id: "order-book-dynamics",
                title: "7. Dinámicas del Order Book: Spread y Profundidad",
                description: "Microestructura del mercado cripto.",
                readTime: 45,
                content: "<h2>Guerra de Órdenes</h2><p>Entender la profundidad de mercado (Depth) y el spread entre compra y venta es crucial para ejecutar órdenes grandes sin desplazar el precio (Slippage). Las ballenas usan TWAP y VWAP para entrar sin alertar al mercado.</p>"
            },
            {
                id: "future-institutional-etf-era",
                title: "8. El Futuro: La Era del ETF Institucional",
                description: "Cómo Wall Street cambió para siempre a Bitcoin.",
                readTime: 80,
                content: "<h2>Madurez del Activo</h2><p>La llegada de los ETFs de BlackRock y Fidelity significa menor volatilidad, mayor liquidez y una correlación más estrecha con los mercados tradicionales. Bitcoin ha pasado de ser un experimento a ser un componente del 401(k) global.</p>"
            },
            {
                id: "delta-neutral-strategies",
                title: "9. Estrategias Delta-Neutral: Ganar sin Dirección",
                description: "Farming y Arbitraje sin riesgo de precio.",
                readTime: 55,
                content: "<h2>Inmunidad al Precio</h2><p>Mediante el balanceo exacto de posiciones largas y cortas, el trader busca ganar solo comisiones de trading o funding rates. Es la base de protocolos como Ethena, permitiendo obtener 'yield' sin preocuparse por si el mercado sube o baja.</p>"
            },
            {
                id: "crypto-taxes",
                title: "10. Fiscalidad de Criptoactivos",
                description: "Cumplimiento en IRPF y Plusvalías.",
                readTime: 50,
                content: "<h2>Realidad Regulatoria</h2><p>Cada swap es un hecho imponible. Entender la diferencia entre rendimientos del capital (staking) y ganancias patrimoniales (trading) es vital para evitar multas y optimizar la rentabilidad neta tras impuestos en jurisdicciones como España.</p>"
            },
            {
                id: "risk-management",
                title: "11. Gestión de Riesgo Cuantitativa",
                description: "Kelly Criterion y Position Sizing.",
                readTime: 55,
                content: "<h2>Sobreviviendo a la Volatilidad</h2><p>La clave no es ganar siempre, sino no arruinarse nunca. Usar el Kelly Criterion para dimensionar posiciones y mantener stop-loss técnicos inamovibles separa a los profesionales de los apostadores que desaparecen en el primer crash.</p>"
            },
            {
                id: "grid-trading-volatility",
                title: "12. Grid Trading: Ganando en Lateral",
                description: "Automatización de compra y venta en rangos.",
                readTime: 45,
                content: "<h2>Cosechando Oscilaciones</h2><p>El grid trading coloca órdenes de compra y venta escalonadas. En mercados que no tienen tendencia clara, esta estrategia 'ordeña' la volatilidad diaria, acumulando pequeñas ganancias en cada rebote y caída del rango.</p>"
            },
            {
                id: "hft-high-frequency-crypto",
                title: "13. HFT: High-Frequency Trading en Cripto",
                description: "Compitiendo en milisegundos.",
                readTime: 65,
                content: "<h2>Carrera Tecnológica</h2><p>El HFT en cripto se basa en arbitraje de micro-latencias entre exchanges. Requiere infraestructura masiva y algoritmos optimizados para capturar centavos millones de veces al día, una arena reservada para market makers profesionales.</p>"
            },
            {
                id: "liquidations-engine",
                title: "14. Liquidaciones y el Motor de Liquidación",
                description: "Cómo los exchanges cierran tus posiciones.",
                readTime: 50,
                content: "<h2>Efecto Dominó</h2><p>Cuando el margen cae, el exchange toma el control y vende a mercado. Las cascadas de liquidación son las responsables de las mechas largas en los gráficos, ofreciendo oportunidades de compra de alta convexidad para quienes tienen liquidez lista.</p>"
            },
            {
                id: "mev-for-traders",
                title: "15. MEV para Traders: Evitando el Sándwich",
                description: "Cómo los bots extraen valor de tus swaps.",
                readTime: 50,
                content: "<h2>Protegiendo el Swap</h2><p>Los bots MEV ven tus transacciones en el mempool antes de confirmarse. Usar RPCs privados (Flashbots) y ajustar el slippage manualmente es esencial para que tu capital no sea 'ordeñado' por buscadores automatizados.</p>"
            },
            {
                id: "options-crypto",
                title: "16. Opciones: Calls, Puts y Volatilidad",
                description: "Hedge institucional y Volatilidad Implícita.",
                readTime: 55,
                content: "<h2>Opcionalidad Pura</h2><p>Las opciones permiten cubrir carteras contra cisnes negros o apostar por la volatilidad misma (Straddles). El mercado de opciones en Deribit dicta a menudo la dirección del precio spot mediante el 'Max Pain' en los vencimientos masivos.</p>"
            },
            {
                id: "psychology-fear-greed",
                title: "17. Psicología del Trading: Miedo y Codicia",
                description: "El control emocional como herramienta técnica.",
                readTime: 50,
                content: "<h2>Tú eres tu Peor Enemigo</h2><p>El Fear & Greed Index mide el sentimiento colectivo. Comprar en pánico extremo ('Sangre en las calles') y vender en euforia extrema es la regla de oro que casi nadie es capaz de cumplir por falta de control emocional.</p>"
            },
            {
                id: "stablecoin-yield-trading",
                title: "18. Stablecoin Yield Farming como Trading",
                description: "Maximizando el retorno del efectivo.",
                readTime: 50,
                content: "<h2>El Refugio Rentable</h2><p>En bear markets, la mejor estrategia es el yield en stablecoins. Mover capital entre Aave, Maker y nuevos protocolos permite superar la inflación y preparar el capital para la siguiente fase de acumulación del ciclo.</p>"
            },
            {
                id: "quantitative-trading-indicators",
                title: "19. Trading Cuantitativo e Indicadores",
                description: "RSI, Medias Móviles y MACD en Cripto.",
                readTime: 45,
                content: "<h2>Señales en el Ruido</h2><p>Si bien el análisis técnico no es infalible, los indicadores cuantitativos ayudan a identificar condiciones de sobrecompra o sobreventa. La confluencia de múltiples indicadores aumenta la probabilidad de éxito en entradas técnicas.</p>"
            },
            {
                id: "whale-tracking-smart-money",
                title: "20. Whale Tracking: Siguiendo al Smart Money",
                description: "Analizando wallets de +$10M.",
                readTime: 60,
                content: "<h2>Copiar a los Grandes</h2><p>Rastrear las wallets de fondos conocidos (Jump, Paradigm) permite anticipar narrativas. Si las ballenas acumulan una altcoin pequeña, suele preceder a un aumento de volumen y precio impulsado por marketing posterior.</p>"
            }
        ]
    }
];
