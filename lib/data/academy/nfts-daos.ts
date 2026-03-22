export const nftDaoModules = [
    {
        id: "nfts-daos",
        title: "IX. NFTs, DAOs y la Economía de la Propiedad Digital",
        description: "Estándares ERC-721 y ERC-1155, mecánicas de gobernanza descentralizada y la evolución de la propiedad. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "generative-art-blocks",
                title: "1. Arte Generativo: Art Blocks y la Estética de Código",
                description: "Cuando el algoritmo es el artista.",
                readTime: 50,
                content: "<h2>Belleza Algorítmica</h2><p>Art Blocks revolucionó el arte digital al generar la obra en el momento del minteo usando el hash de la transacción como semilla. Esto garantiza que cada pieza de una colección sea única pero comparta un ADN visual coherente definido por el código del artista.</p>"
            },
            {
                id: "sybil-attacks-governance",
                title: "2. Ataques Sybil y Defensa de Gobernanza",
                description: "Protegiendo la voluntad de la mayoría.",
                readTime: 55,
                content: "<h2>Una Persona, Un Voto?</h2><p>En el anonimato de la blockchain, es fácil crear 1,000 cuentas. Las DAOs usan Proof of Personhood (Gitcoin Passport, Worldcoin) o Quadratic Voting para mitigar ataques donde una ballena o un bot controla el resultado de las votaciones.</p>"
            },
            {
                id: "bitcoin-ordinals-brc20",
                title: "3. Bitcoin: Ordinals y BRC-20: NFTs en Bitcoin",
                description: "Inscripciones nativas en la red madre.",
                readTime: 55,
                content: "<h2>Bitcoin no es solo Dinero</h2><p>La teoría de los Ordinals permite inscribir datos (imágenes, texto) directamente en satoshis individuales. A diferencia de Ethereum, los datos están 100% on-chain en Bitcoin, creando una nueva clase de 'artefactos digitales' permanentes e inmutables.</p>"
            },
            {
                id: "legal-dao-status",
                title: "4. DAO: Estatus Legal de las DAOs: El Modelo Wyoming",
                description: "Protección jurídica de los miembros.",
                readTime: 60,
                content: "<h2>Código y Ley</h2><p>Wyoming fue el primer estado en reconocer a las DAOs como entidades legales (LLC). Esto ofrece protección de responsabilidad limitada a los participantes, permitiendo que las DAOs interactúen con el mundo legal tradicional y abran cuentas bancarias.</p>"
            },
            {
                id: "dao-frameworks-aragon",
                title: "5. DAO: Frameworks: Aragon y DAOStack",
                description: "Herramientas para crear organizaciones en segundos.",
                readTime: 45,
                content: "<h2>DAOs Listas para Usar</h2><p>Aragon permite desplegar una DAO con plantillas predefinidas para votaciones, finanzas y membresía. Estos frameworks estandarizan la gobernanza, permitiendo que pequeños grupos se coordinen globalmente con seguridad criptográfica desde el día uno.</p>"
            },
            {
                id: "dao-treasury-management",
                title: "6. DAO: Gestión de Tesorería en DAOs",
                description: "Diversificación y comités profesionales.",
                readTime: 55,
                content: "<h2>Bancos Comunitarios</h2><p>Las DAOs gestionan billones en sus tesorerías. La transición de 'holdear el token nativo' a diversificar en stablecoins y RWA es vital para la supervivencia a largo plazo y para financiar el desarrollo continuo del protocolo.</p>"
            },
            {
                id: "dao-mechanics",
                title: "7. DAO: Mecánicas de DAOs: El Gobierno por Token",
                description: "Compound Governor y Snapshot.",
                readTime: 55,
                content: "<h2>Democracia Programada</h2><p>Las DAOs eliminan las jerarquías tradicionales. Mediante tokens de gobernanza, los usuarios votan propuestas que el código ejecuta automáticamente. El reto reside en evitar la plutocracia (gobierno de los más ricos) y fomentar la participación activa.</p>"
            },
            {
                id: "dynamic-nfts-dnft",
                title: "8. Dynamic NFTs: Metadatos Evolutivos",
                description: "NFTs que cambian según oráculos externos.",
                readTime: 50,
                content: "<h2>Token Vivo</h2><p>Los dNFTs cambian su apariencia o propiedades basándose en datos reales (via Chainlink). Un NFT de un jugador de fútbol que mejora sus estadísticas on-chain según su rendimiento en la vida real, abriendo puertas a juegos y marketing interactivo.</p>"
            },
            {
                id: "future-ai-daos",
                title: "9. El Futuro: DAOs Gestionadas por IA",
                description: "Hacia la autonomía total del capital.",
                readTime: 75,
                content: "<h2>Organizaciones Conscientes</h2><p>Agentes de IA que analizan datos de mercado, ejecutan swaps y proponen cambios de gobernanza más rápido que cualquier humano. El 'Endgame' son organizaciones autónomas que operan 24/7 sin intervención humana, optimizando su propio tesoro.</p>"
            },
            {
                id: "nft-standards",
                title: "10. Estándares NFT: ERC-721 y ERC-1155",
                description: "Unicidad y multi-tokens on-chain.",
                readTime: 45,
                content: "<h2>Propiedad Digital Inmutable</h2><p>Los NFTs permiten registrar la propiedad única de activos digitales. Mientras ERC-721 se enfoca en items individuales, ERC-1155 permite gestionar colecciones masivas (fungibles y no fungibles) en un solo contrato, optimizando drásticamente el gas para juegos y metaversos.</p>"
            },
            {
                id: "nft-lending-financialization",
                title: "11. Financialización: Préstamos con NFTs",
                description: "BendDAO, NFTfi y el uso de JPEGs como colateral.",
                readTime: 50,
                content: "<h2>Liquidez de Activos Ilíquidos</h2><p>Plataformas de lending permiten pedir prestado ETH usando NFTs valiosos como garantía. Esto introduce riesgos de liquidación en cascada si el 'floor price' cae bruscamente, como se vio en las crisis de liquidez de 2022.</p>"
            },
            {
                id: "gaming-blockchain",
                title: "12. GameFi: Economías Play-to-Earn",
                description: "Axie Infinity y la sostenibilidad económica.",
                readTime: 45,
                content: "<h2>Jugar para Ganar</h2><p>Axie demostró que el gaming puede ser una fuente de ingresos, pero también reveló la fragilidad de los modelos inflacionarios. El futuro del gaming on-chain pasa por economías donde el valor provenga de la diversión y la utilidad, no solo de la entrada de nuevos usuarios.</p>"
            },
            {
                id: "nft-market-history",
                title: "13. Historia del Mercado: De Punks a Bored Apes",
                description: "Ciclos de euforia y utilidad social.",
                readTime: 50,
                content: "<h2>Evolución de Status</h2><p>Desde los CryptoPunks (2017) como experimento artístico hasta el BAYC (2021) como club social exclusivo. El mercado ha transicionado de la pura especulación visual a la búsqueda de utilidad real, IP comercial y acceso a comunidades cerradas.</p>"
            },
            {
                id: "nft-royalties-war",
                title: "14. La Guerra de los Royalties: Blur vs OpenSea",
                description: "El derecho del artista en el mercado secundario.",
                readTime: 50,
                content: "<h2>Disrupción de Incentivos</h2><p>Los marketplaces compiten por volumen eliminando las comisiones para artistas. Esto ha forzado a los creadores a buscar nuevas formas de monetización, como pases de acceso o mints pagados, cambiando el contrato social original de los NFTs.</p>"
            },
            {
                id: "fat-protocols-vs-apps",
                title: "15. La Tesis del Fat Protocol en la Era NFT",
                description: "¿Dónde se captura el valor realmente?",
                readTime: 55,
                content: "<h2>Captura de Valor</h2><p>Históricamente, el valor se quedaba en la capa base (ETH/BTC). Con los NFTs, la capa de aplicación (marketplaces, marcas) está capturando una porción cada vez mayor del valor económico, desafiando la tesis original de Joel Monegro.</p>"
            },
            {
                id: "metagovernance-aggregators",
                title: "16. Metagobernanza y Agregadores",
                description: "Votando con el capital de otros.",
                readTime: 50,
                content: "<h2>Poder Acumulado</h2><p>Protocolos como Convex o Paladin acumulan tokens de gobernanza para influir en las decisiones de otros protocolos. La metagobernanza permite optimizar rendimientos a nivel sistémico pero centraliza el poder de decisión en manos de unos pocos agregadores.</p>"
            },
            {
                id: "fractional-nfts",
                title: "17. NFTs Fraccionados: Propiedad Colectiva",
                description: "Dividiendo un Punk en un millón de tokens.",
                readTime: 45,
                content: "<h2>Democratización del Lujo</h2><p>La fraccionalización permite que miles de personas posean una parte de un NFT extremadamente caro (como un Doge original). Transforma un activo no-fungible en muchos tokens fungibles ERC-20, facilitando el descubrimiento de precios y el acceso minorista.</p>"
            },
            {
                id: "on-chain-reputation",
                title: "18. Sistemas de Reputación On-Chain",
                description: "Más allá del balance de cuenta.",
                readTime: 50,
                content: "<h2>Crédito Social Descentralizado</h2><p>La historia de tus transacciones, votos y contribuciones forma tu perfil reputacional. Protocolos como Orange o Lens usan estos datos para otorgar acceso privilegiado o mejores tasas de préstamo basadas en tu comportamiento histórico.</p>"
            },
            {
                id: "soulbound-tokens-sbt",
                title: "19. Soulbound Tokens (SBT): Identidad No Transferible",
                description: "El currículum vitae de la Web3.",
                readTime: 55,
                content: "<h2>Tokens que no se Venden</h2><p>Propuestos por Vitalik Buterin, los SBTs son NFTs que no pueden ser transferidos tras ser recibidos. Se usan para representar logros, certificaciones educativas o reputación en DAOs, formando la base de una sociedad descentralizada.</p>"
            },
            {
                id: "metaverse-real-estate",
                title: "20. Tierra en el Metaverso: Valor del Espacio Digital",
                description: "Decentraland, Sandbox y la escasez virtual.",
                readTime: 50,
                content: "<h2>Ubicación, Ubicación, Ubicación</h2><p>Comprar parcelas NFT en mundos virtuales. El valor no reside en el 'terreno' (que es infinito), sino en la atención y la proximidad a hubs comerciales o eventos sociales dentro del ecosistema del metaverso específico.</p>"
            }
        ]
    }
];
