export const bridgesModules = [
    {
        id: "cross-chain-interoperability",
        title: "XIII. Bridges Cross-Chain: Interoperabilidad y Sus Peligros",
        description: "Arquitectura de los puentes, exploits devastadores y el futuro de la comunicación entre cadenas. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "intent-based-bridging",
                title: "1. Across y Puentes basados en Intenciones",
                description: "Sustituyendo la validación por capital.",
                readTime: 50,
                content: "<h2>Promesas Criptoeconómicas</h2><p>Protocolos como Across usan Solvers que adelantan los fondos al usuario instantáneamente. El Solver asume el riesgo de verificación para recibir el reembolso posterior. Esto elimina la espera de 7 días de los L2 y ofrece la mejor experiencia de usuario en términos de velocidad.</p>"
            },
            {
                id: "bridge-architecture",
                title: "2. Anatomía de un Bridge: Modelos de Transferencia",
                description: "Lock-and-mint vs. Liquidity Pools.",
                readTime: 50,
                content: "<h2>Moviendo Activos en el Vacío</h2><p>Las blockchains son islas. Los puentes conectan estos mundos mediante Lock-and-mint (bloqueo en origen, acuñación en destino) o pools de liquidez (intercambio directo). El riesgo principal es que el contrato de bloqueo en la capa base sea drenado, dejando a los wrapped tokens sin valor alguno.</p>"
            },
            {
                id: "axelar-gmp",
                title: "3. Axelar: General Message Passing (GMP)",
                description: "Programabilidad cross-chain completa.",
                readTime: 45,
                content: "<h2>Logica Distribuida</h2><p>Axelar va más allá de mover tokens; permite ejecutar funciones en otra cadena. Un contrato en Ethereum puede llamar a una función de gobernanza en Cosmos o desencadenar una compra en Solana de forma atómica y segura mediante su red de validadores.</p>"
            },
            {
                id: "stablecoin-bridges-cctp",
                title: "4. CCTP: Puentes Nativos para Stablecoins",
                description: "La solución de quema y acuñación de Circle.",
                readTime: 50,
                content: "<h2>Liquidez sin Puentes</h2><p>El Cross-Chain Transfer Protocol (CCTP) permite mover USDC quemando tokens en origen y acuñándolos en destino directamente por Circle. Elimina los wrapped tokens y el riesgo de puentes de terceros, unificando el dólar digital nativo en todo el ecosistema.</p>"
            },
            {
                id: "chainlink-ccip",
                title: "5. Chainlink CCIP: Seguridad Institucional",
                description: "Cross-Chain Interoperability Protocol.",
                readTime: 60,
                content: "<h2>El Estándar Bancario</h2><p>CCIP introduce una 'Risk Management Network' independiente que monitoriza el puente en busca de anomalías. Es la solución elegida por Swift e instituciones financieras para conectar la banca tradicional con las redes blockchain con garantías de seguridad de grado militar.</p>"
            },
            {
                id: "cosmos-ibc",
                title: "6. Cosmos e IBC: El Estándar de Comunicación",
                description: "TCP/IP para blockchains.",
                readTime: 50,
                content: "<h2>Interoperabilidad Nativa</h2><p>El Inter-Blockchain Communication (IBC) de Cosmos permite que cadenas soberanas intercambien datos sin intermediarios mediante Light Clients integrados. Es el modelo más robusto para un ecosistema de redes especializadas que mantienen su propia seguridad.</p>"
            },
            {
                id: "future-unified-liquidity",
                title: "7. El Futuro: Liquidez Fluida Unificada",
                description: "Hacia un mundo sin puentes visibles.",
                readTime: 75,
                content: "<h2>Abstracción de Cadenas</h2><p>El objetivo final es que el usuario no sepa qué cadena está usando. Mediante capas de mensajería invisibles y abstracción de cuenta, la liquidez fluirá instantáneamente como el agua de red doméstica, convirtiendo el ecosistema multichain en una sola computadora mundial.</p>"
            },
            {
                id: "nomad-case-study",
                title: "8. El Hack de Nomad: El Error del Cero",
                description: "Análisis técnico de un fallo catastrófico.",
                readTime: 55,
                content: "<h2>Configuración Fatal</h2><p>Una actualización dejó el hash de raíz vacío (0x00) como 'válido'. Cualquier transacción enviada al bridge era aprobada automáticamente. Fue el primer hackeo masivo donde gente común pudo participar simplemente replicando transacciones maliciosas previas.</p>"
            },
            {
                id: "bridge-oracle-problem",
                title: "9. El Problema del Oráculo en los Puentes",
                description: "Cómo saber qué pasó realmente 'al otro lado'.",
                readTime: 55,
                content: "<h2>Verdad Distorsionada</h2><p>Un puente es tan seguro como su fuente de información. Si el oráculo de un puente reporta un depósito falso, el bridge acuñará fondos de la nada. Los sistemas modernos usan multi-oráculos y retrasos de seguridad para mitigar fallos puntuales de un solo feed.</p>"
            },
            {
                id: "multisig-vs-pos-bridges",
                title: "10. Espectro de Descentralización: Multi-sig vs PoS",
                description: "Quién controla las llaves del puente.",
                readTime: 50,
                content: "<h2>La Ilusión de la Seguridad</h2><p>Muchos puentes 'descentralizados' son en realidad multi-sigs manejados por 5-9 personas. Los puentes PoS (como Axelar o Thorchain) usan una red de cientos de validadores con capital en riesgo para asegurar las transferencias, ofreciendo una resiliencia mucho mayor.</p>"
            },
            {
                id: "gravity-bridge",
                title: "11. Gravity Bridge y la Conexión ETH-Cosmos",
                description: "El canal de alta fidelidad.",
                readTime: 40,
                content: "<h2>Un puente de Hierro</h2><p>Gravity Bridge es un puente diseñado específicamente para conectar el ecosistema Cosmos con Ethereum. Usa un conjunto de validadores altamente seguros y minimiza la lógica del contrato para reducir la superficie de ataque, siendo uno de los puentes más estables y transitados.</p>"
            },
            {
                id: "bridge-guards-circuit-breakers",
                title: "12. Guards y Circuit Breakers: Frenos de Emergencia",
                description: "Gestión de crisis en tiempo real.",
                readTime: 45,
                content: "<h2>Pausando el Desastre</h2><p>Los puentes modernos incluyen 'Circuit Breakers' que limitan cuánto valor puede salir en una hora. Si un hacker intenta drenar todo, el sistema se pausa automáticamente, dando tiempo al equipo de seguridad para intervenir y salvar el capital restante.</p>"
            },
            {
                id: "ibc-beyond-cosmos",
                title: "13. IBC Expandido: Near, Polkadot y Ethereum",
                description: "La universalización del estándar de mensajería.",
                readTime: 50,
                content: "<h2>Protocolo Universal</h2><p>Aunque nació en Cosmos, IBC se está expandiendo. Proyectos como Landslide lo llevan a Avalanche y Union a Ethereum. La meta es que todas las redes hablen el mismo idioma criptográfico, eliminando la necesidad de puentes de terceros con sus propios supuestos de confianza.</p>"
            },
            {
                id: "relayer-incentives",
                title: "14. Incentivos de Relayers y Teoría de Juegos",
                description: "Haciendo que la mensajería sea rentable.",
                readTime: 50,
                content: "<h2>El Costo de la Comunicación</h2><p>Los relayers deben pagar gas en múltiples cadenas. Un puente sin un modelo económico sólido (tarifas que cubran gas + margen de riesgo) se detiene. El equilibrio de Nash entre relayers asegura que la red sea rápida y eficiente incluso bajo congestión.</p>"
            },
            {
                id: "layerzero-omnichain",
                title: "15. LayerZero y la Visión Omnichain",
                description: "Mensajería ultraligera cross-chain.",
                readTime: 55,
                content: "<h2>Puentes sin Estado</h2><p>LayerZero usa Oráculos y Relayers independientes para verificar transacciones. Su estándar OFT (Omnichain Fungible Token) permite que un token exista nativamente en múltiples cadenas sin necesidad de wrapping, eliminando el riesgo de fragmentación de liquidez.</p>"
            },
            {
                id: "bridge-exploits",
                title: "16. Los Mayores Exploits de Bridges",
                description: "Ronin, Wormhole y Nomad.",
                readTime: 60,
                content: "<h2>El Cementerio de Billones</h2><p>Ronin ($625M) fue un fallo de OPSEC; Wormhole ($320M) un error de lógica en la validación de firmas; Nomad ($190M) un error de configuración que permitió 'copiar y pegar' el robo. Los puentes son el vector de ataque más lucrativo debido a la alta concentración de valor.</p>"
            },
            {
                id: "cross-chain-mev",
                title: "17. MEV Cross-Chain: El Impuesto Invisible",
                description: "Arbitraje y Front-running entre redes.",
                readTime: 55,
                content: "<h2>Aprovechando la Latencia</h2><p>Los bots MEV monitorizan puentes para predecir movimientos de precio. Si una ballena mueve 10M de USDC a Solana, los bots compran el activo en Solana antes de que llegue el puente, extrayendo valor de la latencia inherente a la comunicación entre cadenas.</p>"
            },
            {
                id: "multichain-anyswap-failure",
                title: "18. Multichain: El CEO y el Riesgo de Custodia",
                description: "Cuando la centralización mata un proyecto.",
                readTime: 60,
                content: "<h2>Single Point of Failure Humano</h2><p>Multichain colapsó cuando su CEO desapareció (detenido en China) junto con las llaves de acceso a los nodos que custodiaban billones. Este evento subrayó la necesidad imperativa de MPC y descentralización real en la infraestructura de puentes.</p>"
            },
            {
                id: "lp-risks-in-bridges",
                title: "19. Riesgos de LP en Bridges de Liquidez",
                description: "Impermanent loss y desequilibrios de pool.",
                readTime: 45,
                content: "<h2>Desbalance del Lado del Mar</h2><p>Los proveedores de liquidez en puentes sufren cuando una cadena tiene mucha más demanda de salida que de entrada. Si el pool de USDT en Arbitrum se agota, el puente deja de funcionar para esa ruta. Los LPs deben gestionar este equilibrio activamente contra arbitrajistas.</p>"
            },
            {
                id: "zk-bridges-trustless",
                title: "20. ZK-Bridges: Interoperabilidad sin Confianza",
                description: "Usando pruebas matemáticas para puentear.",
                readTime: 65,
                content: "<h2>Cero Supuestos</h2><p>Los ZK-Bridges (Succinct, Electron) generan una prueba ZK de que un estado ocurrió en la cadena origen. La cadena destino solo verifica la prueba matemática, ahorrando gas de Light Client y eliminando la necesidad de confiar en validadores o relayers humanos.</p>"
            }
        ]
    }
];
