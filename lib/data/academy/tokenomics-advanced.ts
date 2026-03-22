export const tokenomicsModules = [
    {
        id: "advanced-tokenomics",
        title: "XIX. Tokenómica Avanzada y Gobernanza Institucional",
        description: "Diseño de sistemas económicos, curvas de emisión y gobernanza de incentivos. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "attention-economy-airdrop",
                title: "1. Airdrops y la Economía de la Atención",
                description: "Farming, Sybil attacks y retención de usuarios.",
                readTime: 50,
                content: "<h2>Incentivos Retroactivos</h2><p>Los airdrops son la herramienta de marketing más potente de Web3. Sin embargo, atraer 'capital mercenario' y granjas de bots (Sybil) es el mayor reto. Los protocolos modernos usan sistemas de puntos y verificación de humanidad para premiar el uso real.</p>"
            },
            {
                id: "fixed-vs-elastic-supply",
                title: "2. Curvas de Oferta: Fija frente a Elástica",
                description: "Modelos monetarios en la blockchain.",
                readTime: 45,
                content: "<h2>Moneda Dura vs Rebalanceo</h2><p>Mientras Bitcoin tiene una oferta fija (21M), otros protocolos usan 'rebase' para ajustar la oferta según el precio. Entender si el valor se captura en el precio del token o en la cantidad acumulada es vital para el inversor.</p>"
            },
            {
                id: "yield-derivatives-pendle",
                title: "3. Derivados de Rendimiento: El Futuro de las Tasas",
                description: "Estrategias con Pendle y el split de principal/yield.",
                readTime: 50,
                content: "<h2>Mercado de Tasas</h2><p>Poder separar el principal del rendimiento generado permite a los usuarios cubrirse contra bajadas de tipos o apostar por subidas. Es la base del mercado de renta fija en DeFi, esencial para que el capital institucional gestione sus flujos.</p>"
            },
            {
                id: "token-emission-inflation",
                title: "4. Dinámica de Emisión e Inflación",
                description: "FDV, Circulating Supply y modelos de vesting.",
                readTime: 55,
                content: "<h2>Dilución Programada</h2><p>El Fully Diluted Valuation (FDV) es la métrica clave para entender la valoración real de un proyecto a largo plazo. Un bajo circulante inicial permite subidas de precio rápidas (hype), pero condena al inversor retail a una dilución masiva cuando los VCs y el equipo desbloquean sus tokens (Unlocks).</p>"
            },
            {
                id: "vampire-attacks-incentives",
                title: "5. Diseño de Incentivos y Vampire Attacks",
                description: "La guerra por la liquidez de Sushiswap vs Uniswap.",
                readTime: 55,
                content: "<h2>Robando el Capital</h2><p>Un 'Vampire Attack' incentiva a los LP de un protocolo rival para que migren sus fondos prometiendo mayores recompensas. Diseñar defensas contra estos ataques mediante programas de fidelidad es vital en un mercado altamente competitivo.</p>"
            },
            {
                id: "future-ai-optimized-incentives",
                title: "6. El Futuro: Incentivos Optimizados por IA",
                description: "Hacia una economía de ajuste dinámico.",
                readTime: 85,
                content: "<h2>Tokenómica Viva</h2><p>Agentes de IA ajustarán las tasas de interés y las emisiones de tokens en tiempo real basándose en la intensidad de uso de la red. Esto permite que el protocolo sea elástico y auto-sostenible, respondiendo a las condiciones cambiantes del mercado sin intervención humana.</p>"
            },
            {
                id: "treasury-diversification-risk",
                title: "7. Gestión y Diversificación de Tesorería",
                description: "Evitando el riesgo del token nativo.",
                readTime: 50,
                content: "<h2>Balancín Financiero</h2><p>Mantener el 100% de la tesorería en el token propio es peligroso (efecto espejo). Los protocolos exitosos diversifican en stables y ETH para poder financiar el desarrollo durante los bear markets sin hundir el precio de su propio token.</p>"
            },
            {
                id: "liquidity-bootstrapping-ido",
                title: "8. IDOs y LBPs: Distribución Justa",
                description: "Subastas holandesas y Liquidity Bootstrapping Pools.",
                readTime: 45,
                content: "<h2>Evitando el Dump de Bots</h2><p>Las LBPs permiten un descubrimiento de precio orgánico al empezar con un precio alto que decae con el tiempo. Esto desincentiva a los bots de primera línea y permite que los inversores reales entren a una valoración que consideran justa.</p>"
            },
            {
                id: "onchain-auctions-mechanics",
                title: "9. Mecánicas de Subastas On-Chain",
                description: "Subastas holandesas, inglesas y selladas.",
                readTime: 50,
                content: "<h2>Descubrimiento de Precio</h2><p>Las subastas eliminan la ventaja de los bots en lanzamientos. La subasta holandesa (precio que baja hasta que se agota el stock) es el estándar de oro para lanzamientos justos de NFTs y tokens de alta demanda.</p>"
            },
            {
                id: "governance-minimization",
                title: "10. Minimización de Gobernanza: El Ideal Inmutable",
                description: "Reduciendo el factor humano en los protocolos.",
                readTime: 55,
                content: "<h2>Código como Ley</h2><p>La gobernanza es un riesgo de seguridad. Minimizarla significa que el protocolo funciona de forma autónoma con parámetros preestablecidos. Protocolos como Uniswap o Liquity buscan este ideal para ser infraestructuras neutrales e imparables.</p>"
            },
            {
                id: "revenue-share-models",
                title: "11. Modelos de Revenue Share vs Gobernanza",
                description: "¿De dónde viene el valor bruto del token?",
                readTime: 50,
                content: "<h2>Reparto de Beneficios</h2><p>Muchos tokens ahora pasan de ser 'solo gobernanza' a repartir los fees del protocolo a los stakers (ej. GMX). Este modelo alinea al holder con el éxito comercial de la plataforma, acercándose a la estructura de una acción tradicional.</p>"
            },
            {
                id: "smart-contract-vesting-models",
                title: "12. Modelos de Vesting Programático",
                description: "Automatizando la confianza entre equipo e inversores.",
                readTime: 45,
                content: "<h2>Liberación por Código</h2><p>A diferencia de los contratos legales, el vesting on-chain is imparable y transparente. Permite que el mercado anticipe exactamente cuándo entrará nueva oferta, evitando sorpresas y malas praxis de los insiders.</p>"
            },
            {
                id: "protocol-owned-liquidity",
                title: "13. Protocol Owned Liquidity (POL)",
                description: "Del modelo Olympus DAO a la sostenibilidad real.",
                readTime: 55,
                content: "<h2>Liquidez de Alquiler vs Propia</h2><p>En lugar de pagar a los proveedores (mercenarios) con tokens inflacionarios, el protocolo compra su propia liquidez. Esto garantiza que la liquidez no abandone el proyecto en momentos de crisis, creando una base financiera sólida.</p>"
            },
            {
                id: "buybacks-vs-burns-accounting",
                title: "14. Recompras vs Quemaduras: Análisis Contable",
                description: "¿Qué es mejor para la estructura de capital?",
                readTime: 50,
                content: "<h2>Impacto en el Precio</h2><p>Mientras la quema reduce supply de forma permanente, la recompra (buyback) permite al protocolo tener tokens en tesorería para futuros incentivos. Ambos mecanismos devuelven valor pero tienen implicaciones fiscales y contables distintas.</p>"
            },
            {
                id: "seigniorage-stablecoin-lessons",
                title: "15. Señoreaje y Lecciones de Estables Algorítmicas",
                description: "Analizando la caída de UST (Terra/Luna).",
                readTime: 60,
                content: "<h2>La Fragilidad de la Confianza</h2><p>Las estables algorítmicas dependen de la confianza en un token volátil. Cuando el pánico llega, el 'esquema de señoreaje' puede entrar en una espiral de muerte. Entender la diferencia entre colateral real y colateral reflexivo es la lección más cara de DeFi.</p>"
            },
            {
                id: "burn-deflationary-eip1559",
                title: "16. Sinks de Valor y Quema Programada",
                description: "El modelo deflacionario y EIP-1559.",
                readTime: 50,
                content: "<h2>Escasez Algorítmica</h2><p>La quema de tokens (burn) reduce la oferta total, actuando como una recompra de acciones descentralizada. Ethereum, con EIP-1559, quema una parte de las comisiones en cada transacción, permitiendo que la red sea deflacionaria en momentos de alta actividad.</p>"
            },
            {
                id: "staking-restaking-eigenlayer",
                title: "17. Staking y Re-staking: El Coste de la Seguridad",
                description: "Apilando capas de riesgo y rendimiento.",
                readTime: 65,
                content: "<h2>Seguridad como Servicio</h2><p>EigenLayer permite usar el ETH stakeado para asegurar otras redes. Esto aumenta el APY pero introduce el riesgo de 'Slashing' en cascada. Es la industrialización de la seguridad de Ethereum para alimentar nuevos protocolos.</p>"
            },
            {
                id: "regulatory-tokenomics-fair-launch",
                title: "18. Tokenómica Regulatoria y Fair Launch",
                description: "Evitando la clasificación como Security.",
                readTime: 65,
                content: "<h2>Cumplimiento por Diseño</h2><p>Un 'Fair Launch' (sin preventa a VCs, sin tokens para el equipo) es la mejor defensa legal. Diseñar sistemas que parezcan más una cooperativa que una empresa es el reto de los arquitectos económicos modernos.</p>"
            },
            {
                id: "token-utility-access-insurance",
                title: "19. Utilidad del Token: Acceso y Seguros",
                description: "Más allá de la pura especulación.",
                readTime: 45,
                content: "<h2>Valor de Uso</h2><p>Tokens que sirven como 'tíquet de entrada' a servicios premium o que actúan como fondo de seguro (backstop) en caso de exploit. La utilidad real crea una demanda base que soporta el precio independientemente de la narrativa de mercado.</p>"
            },
            {
                id: "curve-wars-vetokenomics",
                title: "20. veTokenomics: Guerras de Liquidez",
                description: "Incentivos Vote-Escrowed (ve) y Curve Wars.",
                readTime: 65,
                content: "<h2>Compromiso a Largo Plazo</h2><p>El modelo 've' obliga a los usuarios a bloquear sus tokens (ej. 4 años) para obtener poder de voto. Esto alinea incentivos y evita que el capital mercenario abandone el protocolo, creando un mercado secundario de 'sobornos' (bribes) por el control de la liquidez.</p>"
            }
        ]
    }
];
