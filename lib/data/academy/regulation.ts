export const regulationModules = [
    {
        id: "regulation-compliance",
        title: "XIV. Regulación Global de Criptoactivos: Navegar el Marco Legal",
        description: "MiCA, la SEC, AML y la política del internet del valor. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "aml-travel-rule",
                title: "1. AML: La 'Travel Rule' y el Fin del Anonimato",
                description: "Recomendación 16 del GAFI.",
                readTime: 45,
                content: "<h2>Transparencia Radical</h2><p>Exige que los VASPs (Virtual Asset Service Providers) intercambien información de identificación del originador y el beneficiario. Esto crea un 'sistema de mensajería' paralelo a la blockchain para cumplir con las normas bancarias tradicionales.</p>"
            },
            {
                id: "consumer-protection-disclosures",
                title: "2. Consumer: Protección al Consumidor y Transparencia",
                description: "Prevenir fraudes mediante la información.",
                readTime: 50,
                content: "<h2>Advertencias de Riesgo</h2><p>La regulación exige que los proyectos publiquen 'Whitepapers' veraces y adviertan sobre la volatilidad extrema. El objetivo es que el inversor retail comprenda que el capital invertido en cripto puede perderse en su totalidad.</p>"
            },
            {
                id: "cross-border-enforcement",
                title: "3. Cross-Border: Ejecución Transfronteriza y Arbitraje",
                description: "Cripto no conoce fronteras, la ley sí.",
                readTime: 55,
                content: "<h2>Justicia Global</h2><p>La cooperación entre agencias como el FBI, Interpol y Europol es clave para perseguir el crimen on-chain. Los estafadores intentan esconderse en jurisdicciones sin extradición, pero el rastreo de la blockchain es permanente y público.</p>"
            },
            {
                id: "dex-regulation-challenges",
                title: "4. DEX: El Reto de Regular los DEXs",
                description: "¿Se puede sancionar a un protocolo sin dueño?",
                readTime: 55,
                content: "<h2>Regulación de Interfaz</h2><p>Los reguladores intentan controlar los DEXs a través de las interfaces web (frontend) y de los proveedores de RPC, ya que los contratos inteligentes en sí mismos son imborrables y no tienen una sede física para recibir notificaciones legales.</p>"
            },
            {
                id: "ripple-xrp-case",
                title: "5. El Caso Ripple (XRP) y su Sentencia Histórica",
                description: "Ventas institucionales vs Mercado secundario.",
                readTime: 55,
                content: "<h2>Precedente Judicial</h2><p>La jueza Torres determinó que XRP no es un valor en sí mismo cuando se vende en exchanges a minoristas, pero sí cuando se vende directamente a instituciones. Una victoria parcial para la industria que limita el alcance punitivo de la SEC.</p>"
            },
            {
                id: "future-global-treaty-value",
                title: "6. El Futuro: Tratado Global del Internet del Valor",
                description: "Hacia una gobernanza mundial de la blockchain.",
                readTime: 75,
                content: "<h2>Bretton Woods Digital</h2><p>La necesidad de un estándar global que regule el flujo de activos digitales entre naciones. El objetivo final es un marco que fomente la interoperabilidad legal tanto como la técnica, asegurando que el internet del valor sea seguro y libre.</p>"
            },
            {
                id: "fatf-global-standards",
                title: "7. El Papel del GAFI (FATF) en la Estandarización",
                description: "Cómo nace la regulación global.",
                readTime: 50,
                content: "<h2>Poder Blando</h2><p>El GAFI no dicta leyes, pero sus 'listas grises' y 'listas negras' fuerzan a los países a adoptar regulaciones estrictas. Ignorar sus recomendaciones puede significar el aislamiento del sistema financiero internacional de una nación.</p>"
            },
            {
                id: "howey-test-classification",
                title: "8. El Test de Howey y la Clasificación de Tokens",
                description: "La jurisprudencia de 1946 aplicada a la Web3.",
                readTime: 50,
                content: "<h2>Expectativa de Beneficio</h2><p>Un contrato de inversión existe si hay una inversión de dinero en una empresa común con una expectativa razonable de beneficios derivados del esfuerzo de otros. Aplicar esta lógica de la era industrial a redes descentralizadas es el nudo jurídico actual.</p>"
            },
            {
                id: "taxation-staking-defi",
                title: "9. Fiscalidad de Staking y DeFi",
                description: "Cómo declarar rendimientos autogenerados.",
                readTime: 50,
                content: "<h2>Renta de Capital Mobiliario</h2><p>Recibir nuevos tokens por validar o aportar liquidez se considera ingreso en el momento de la recepción. La complejidad contable de rastrear miles de micro-transacciones DeFi requiere software especializado para evitar problemas con Hacienda.</p>"
            },
            {
                id: "digital-identity-kyc-onchain",
                title: "10. Identidad Digital y KYC On-Chain",
                description: "Verificando al usuario sin exponer sus datos.",
                readTime: 55,
                content: "<h2>Privacidad con Cumplimiento</h2><p>Usando Zero-Knowledge Proofs, un usuario puede demostrar que es mayor de edad o que no está en una lista de sanciones sin revelar su nombre o dirección real. Es el futuro de la regulación que respeta los derechos individuales.</p>"
            },
            {
                id: "kyc-aml-defi",
                title: "11. KYC, AML y FATF: Estándares Globales",
                description: "La lucha contra el lavado de dinero.",
                readTime: 45,
                content: "<h2>Vigilancia Transaccional</h2><p>El GAFI (FATF) impone la 'Travel Rule', obligando a los exchanges a compartir datos de los usuarios en cada transferencia. El reto es cómo aplicar esto a carteras de auto-custodia sin vulnerar la privacidad fundamental de la blockchain.</p>"
            },
            {
                id: "sec-crypto-war",
                title: "12. La SEC y la Guerra de los Valores",
                description: "Howey Test y la postura de Gary Gensler.",
                readTime: 55,
                content: "<h2>¿Security o Commodity?</h2><p>La SEC argumenta que la mayoría de los tokens son valores no registrados. Esta postura ha llevado a litigios masivos contra Coinbase y Binance, creando una incertidumbre que está forzando a muchas empresas a migrar a jurisdicciones más amigables como Singapur o Dubái.</p>"
            },
            {
                id: "mica-europe",
                title: "13. MiCA: El Marco Histórico de la UE",
                description: "La primera regulación integral del mundo.",
                readTime: 55,
                content: "<h2>Reglas Claras para Europa</h2><p>MiCA armoniza la regulación de criptoactivos en toda la Unión Europea. Define licencias para exchanges, requisitos estrictos para emisores de stablecoins (ARTs y EMTs) y establece normas de protección al inversor que sirven de modelo para el resto del mundo.</p>"
            },
            {
                id: "sro-self-regulatory-orgs",
                title: "14. Organizaciones de Autorregulación (SROs)",
                description: "La industria estableciendo sus propias normas.",
                readTime: 45,
                content: "<h2>Policiía Interna</h2><p>Grupos industriales crean estándares de conducta y mejores prácticas antes de que los legisladores impongan reglas más rígidas. Las SROs ayudan a limpiar el mercado de malos actores y a profesionalizar la imagen del sector ante el público.</p>"
            },
            {
                id: "global-adoption-landscape",
                title: "15. Panorama Global: Hubs y Prohibiciones",
                description: "Suiza, Singapur y el veto de China.",
                readTime: 45,
                content: "<h2>Geopolítica del Código</h2><p>Mientras Suiza (Zug) y Emiratos Árabes se posicionan como paraísos de innovación, China mantiene una prohibición estricta pero lidera en CBDCs. La competencia entre naciones por atraer capital y talento cripto definirá el mapa económico del siglo XXI.</p>"
            },
            {
                id: "mining-environmental-regulation",
                title: "16. Regulación Ambiental de la Minería",
                description: "ESG y el consumo energético de PoW.",
                readTime: 50,
                content: "<h2>Sostenibilidad Cripto</h2><p>Muchos gobiernos condicionan la minería al uso de excedentes renovables. La regulación busca que Bitcoin no solo sea dinero duro, sino que se integre en la red eléctrica como un estabilizador de demanda flexible y sostenible.</p>"
            },
            {
                id: "stablecoin-reserves-regulation",
                title: "17. Regulación de Stablecoins y Reservas",
                description: "Evitando el próximo colapso tipo Terra/Luna.",
                readTime: 55,
                content: "<h2>Respaldo Verificable</h2><p>Los reguladores exigen que las stablecoins estén respaldadas 1:1 por activos líquidos (cash y bonos del tesoro) y que se sometan a auditorías mensuales. Las stablecoins algorítmicas están bajo la lupa tras el desastre de UST.</p>"
            },
            {
                id: "institutional-custody-requirements",
                title: "18. Requisitos de Custodia Institucional",
                description: "Segregar fondos y solvencia probada.",
                readTime: 50,
                content: "<h2>Seguridad de Grado Bancario</h2><p>Para que los fondos de pensiones entren en cripto, exigen custodios regulados que mantengan los activos segregados de su propio balance, evitando situaciones como el colapso de FTX donde se mezclaron los fondos de los clientes.</p>"
            },
            {
                id: "smart-contract-liability",
                title: "19. Responsabilidad Legal en Smart Contracts",
                description: "¿Quién responde por un bug en el código?",
                readTime: 55,
                content: "<h2>Derecho Programable</h2><p>Si un contrato inteligente falla y se pierden fondos, ¿es culpa del desarrollador, de la DAO o de los validadores? La creación de marcos de responsabilidad limitada para DAOs es esencial para la madurez del sector jurídico-tecnológico.</p>"
            },
            {
                id: "tornado-cash-ban-privacy",
                title: "20. Tornado Cash: Privacidad vs Seguridad Nacional",
                description: "Sanciones de la OFAC a código inmutable.",
                readTime: 60,
                content: "<h2>Código como Arma</h2><p>La sanción a Tornado Cash marca la primera vez que EE.UU. sanciona un conjunto de contratos inteligentes (código) en lugar de una persona o entidad. El debate sobre si el código es 'libertad de expresión' (Free Speech) llega a las cortes supremas.</p>"
            }
        ]
    }
];
