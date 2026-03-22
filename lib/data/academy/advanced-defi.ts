export const advancedDefiModules = [
    {
        id: "advanced-defi-protocols",
        title: "XV. DeFi Institucional: Restaking, Tasas de Interés y Derivados de Liquidez",
        description: "La frontera más avanzada del DeFi: EigenLayer, Pendle y USDe. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "convex-yield-aggregation",
                title: "1. Convex Finance: Maximización de CRV",
                description: "El agregador de las Curve Wars.",
                readTime: 50,
                content: "<h2>Capa de Eficiencia</h2><p>Convex permite obtener el máximo rendimiento de Curve sin bloquear CRV individualmente por 4 años. Ha creado un estándar de liquidez sobre el que se asientan protocolos de stablecoins y derivados.</p>"
            },
            {
                id: "eigenda-modular-da",
                title: "2. EigenDA: La Primera AVS",
                description: "Disponibilidad de datos bajo demanda.",
                readTime: 50,
                content: "<h2>Escalando Blobs</h2><p>EigenDA usa el stake de Ethereum a través de EigenLayer para ofrecer una capa de disponibilidad de datos ultra-barata para Rollups, compitiendo con Celestia mediante la seguridad nativa heredada de ETH.</p>"
            },
            {
                id: "eigenlayer-restaking",
                title: "3. EigenLayer y el Restaking",
                description: "Segunda capa de seguridad criptoeconómica.",
                readTime: 60,
                content: "<h2>Alquilando Seguridad</h2><p>EigenLayer permite reutilizar el ETH en staking para asegurar otros protocolos (AVS). Esto optimiza el capital pero introduce riesgos de slashing correlacionado. Es la infraestructura base de la nueva economía de confianza de Ethereum.</p>"
            },
            {
                id: "institutional-staking-kyc",
                title: "4. El Futuro: Staking Institucional y KYC",
                description: "Compliance en la capa de consenso.",
                readTime: 80,
                content: "<h2>Consenso Regulado</h2><p>La entrada de bancos y fondos requiere validadores que cumplan con normativas AML/KYC. El futuro verá la coexistencia de pools públicos y pools 'permisionados' para grandes capitales soberanos.</p>"
            },
            {
                id: "ethena-synthetic-dollar",
                title: "5. Ethena y el USDe: Dólar Sintético",
                description: "Basis trading y Delta Neutro.",
                readTime: 50,
                content: "<h2>Internet Bond</h2><p>USDe mantiene su paridad mediante una posición corta de futuros perpetuos contra un colateral largo de stETH. Genera rendimiento del funding rate y del staking, ofreciendo una 'stable' de alto retorno basada en trading real.</p>"
            },
            {
                id: "ethena-reserve-fund",
                title: "6. Ethena: El Fondo de Reserva",
                description: "Protección contra funding negativo.",
                readTime: 50,
                content: "<h2>Búfer de Estabilidad</h2><p>USDe cuenta con un fondo de reserva nutrido por parte del rendimiento generado. Su función es cubrir los pagos de funding rate cuando el mercado se vuelve bajista, manteniendo la solvencia del sistema.</p>"
            },
            {
                id: "frax-ether-dual-model",
                title: "7. Frax Ether: El Modelo Dual (frxETH/sfrxETH)",
                description: "Maximizando el retorno de staking.",
                readTime: 50,
                content: "<h2>Separación Smart</h2><p>Frax divide su ETH en un token de liquidez (frxETH) y uno de rendimiento (sfrxETH). Esto permite que quienes solo quieren liquidez subsidien el rendimiento de quienes bloquean el capital, logrando APYs superiores.</p>"
            },
            {
                id: "gearbox-leverage",
                title: "8. Gearbox: Apalancamiento On-Chain",
                description: "Credit Accounts para farming masivo.",
                readTime: 60,
                content: "<h2>Multiplicando el Rendimiento</h2><p>Gearbox permite abrir 'Cuentas de Crédito' donde el usuario puede apalancar sus activos hasta 10x para hacer farming en otros protocolos, manteniendo la custodia descentralizada mediante contratos proxy.</p>"
            },
            {
                id: "lrt-governance",
                title: "9. Gobernanza de LRTs y Selección de AVS",
                description: "Decidiendo dónde va la seguridad.",
                readTime: 55,
                content: "<h2>Riesgo Delegado</h2><p>Los LRTs (EtherFi, Renzo) actúan como curadores de riesgo, decidiendo qué AVSs asegurar. Su gobernanza es crítica, ya que una mala selección puede resultar en pérdidas masivas de capital para los depositantes.</p>"
            },
            {
                id: "karak-multi-asset-restaking",
                title: "10. Karak: Restaking Multi-Activo",
                description: "Expandiendo la seguridad más allá de ETH.",
                readTime: 55,
                content: "<h2>Cualquier Activo, Cualquier Red</h2><p>Karak permite que no solo ETH, sino también stablecoins y otros activos de alta liquidez sean utilizados como colateral para asegurar servicios, compitiendo con la visión solo-ETH de EigenLayer.</p>"
            },
            {
                id: "liquid-staking-protocols",
                title: "11. Liquid Staking: Lido y Rocket Pool",
                description: "LSTs y descentralización del consenso.",
                readTime: 50,
                content: "<h2>Liquidez del Stake</h2><p>Los LSTs permiten usar el valor del ETH bloqueado en staking dentro de DeFi. Lido domina el mercado con stETH, mientras que Rocket Pool ofrece una alternativa más descentralizada mediante su red de minipools de 8 ETH.</p>"
            },
            {
                id: "morpho-shared-liquidity",
                title: "12. Morpho: Evolución del Lending",
                description: "Eficiencia P2P sobre Aave y Compound.",
                readTime: 55,
                content: "<h2>Mejores Tasas</h2><p>Morpho Blue permite crear mercados de préstamos aislados y ultra-eficientes, permitiendo que prestamistas y prestatarios coincidan directamente para ahorrar el spread que tradicionalmente se queda el protocolo.</p>"
            },
            {
                id: "pendle-yield-derivatives",
                title: "13. Pendle Finance: Tasas de Interés",
                description: "PT, YT y trading de rendimiento.",
                readTime: 55,
                content: "<h2>Tokenizando el Tiempo</h2><p>Pendle divide activos en Principal (PT) y Rendimiento (YT). Permite fijar tasas de interés (comprando PT a descuento) o especular sobre el rendimiento (comprando YT con apalancamiento), replicando los IRS de la banca tradicional.</p>"
            },
            {
                id: "puffer-slash-protection",
                title: "14. Puffer Finance: Protección contra Slash",
                description: "Anti-slashing vía Secure Enclaves.",
                readTime: 55,
                content: "<h2>Staking Seguro</h2><p>Puffer utiliza hardware seguro (SGX) para garantizar que los validadores no puedan firmar bloques conflictivos que resulten en slashing, permitiendo que usuarios con menos capital operen nodos seguros.</p>"
            },
            {
                id: "radiant-omnichain-money-markets",
                title: "15. Radiant Capital: Préstamos Omnichain",
                description: "Liquidez fluida vía LayerZero.",
                readTime: 55,
                content: "<h2>Sin Fronteras</h2><p>Radiant permite depositar colateral en una cadena y pedir prestado en otra de forma atómica. Es el primer money market que unifica la liquidez de todo el ecosistema L2 para maximizar la eficiencia.</p>"
            },
            {
                id: "defi-insurance",
                title: "16. Seguros: Nexus Mutual y Gestión de Riesgo",
                description: "Cobertura de smart contracts.",
                readTime: 40,
                content: "<h2>Mitigación de Hacks</h2><p>Nexus Mutual funciona como una mutualidad descentralizada que cubre riesgos de fallos en el código. Es vital para institucionales que necesitan asegurar capital contra el riesgo tecnológico inherente a DeFi.</p>"
            },
            {
                id: "swell-pearl-ecology",
                title: "17. Swell y el Ecosistema de Perlas",
                description: "Liquid Staking verticalmente integrado.",
                readTime: 45,
                content: "<h2>Incentivos de Capa</h2><p>Swell integra su LST nativo con un sistema de puntos (Pearls) y su propio L2 futuro, buscando capturar todo el valor desde el staking hasta la ejecución de transacciones del usuario.</p>"
            },
            {
                id: "symbiotic-permissionless-restaking",
                title: "18. Symbiotic: Restaking sin Permiso",
                description: "La alternativa modular y abierta.",
                readTime: 55,
                content: "<h2>Flexibilidad Total</h2><p>A diferencia de EigenLayer, Symbiotic permite que cualquier protocolo defina sus propios parámetros de colateral y slashing sin pasar por un proceso centralizado, fomentando una explosión de servicios de seguridad.</p>"
            },
            {
                id: "yield-farming-lrt-points",
                title: "19. Yield Farming 2.0: Puntos y LRTs",
                description: "La nueva era de la retención de liquidez.",
                readTime: 50,
                content: "<h2>Economía de la Atención</h2><p>El uso de sistemas de puntos off-chain para incentivar el depósito en LRTs ha reemplazado al liquidity mining tradicional, permitiendo que los protocolos construyan comunidad antes de lanzar un token.</p>"
            },
            {
                id: "yield-stripping-swaps",
                title: "20. Yield Stripping y Swaps Avanzados",
                description: "Mecánica profunda de Pendle V2.",
                readTime: 65,
                content: "<h2>Matemática Financiera</h2><p>Entender la convergencia de PT a su valor par al vencimiento y el decay de YT es fundamental para estrategias cuantitativas de arbitraje de tasas DeFi entre diversos protocolos de restaking.</p>"
            }
        ]
    }
];
