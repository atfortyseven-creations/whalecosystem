export const layer2Modules = [
    {
        id: "layer2",
    title: "VII. Layer 2: La Solución al Trilema de la Escalabilidad",
    description: "Análisis profundo de las arquitecturas de escalado: Rollups, ZK-proofs y la transición hacia un ecosistema modular. 20 Módulos de Máxima Perfección.",
    articles: [
        {
            id: "app-chains-sovereign-app-specific",
            title: "1. App-Chains: La Soberanía de la Aplicación Específica",
            description: "Cadenas diseñadas para un solo propósito: Máxima optimización y control de recursos.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Fin de la Competencia por el Gas</h2>
                    <p>Las App-Chains (como las de Cosmos o el SDK de Polygon) permiten que una plataforma tenga su propia infraestructura sin competir por el espacio de bloque con otras aplicaciones. Esta soberanía técnica PhD garantiza un rendimiento predecible y la capacidad de personalizar la lógica de gas y gobernanza para las necesidades específicas del protocolo.</p>
                </section>
            </div>`
        },
        {
            id: "based-rollups-l1-settlement",
            title: "2. Based Rollups: La Liquidación Directa en L1",
            description: "Delegando la secuenciación a la red principal: Simplicidad y herencia de seguridad total.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Eliminando el Secuenciador Propio</h2>
                    <p>Los Based Rollups no operan sus propios secuenciadores. En su lugar, delegan esta tarea a los validadores de Ethereum L1. Esto simplifica drásticamente la arquitectura del rollup y elimina el riesgo de centralización del secuenciador, heredando la resistencia a la censura y la vitalidad de la red más segura del mundo de forma nativa.</p>
                </section>
            </div>`
        },
        {
            id: "blast-mantle-high-performance-l2",
            title: "3. Blast, Mantle y el L2 High-Performance Market",
            description: "Estrategias de rendimiento nativo y optimización de datos en las nuevas capas de ejecución.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Generación de Rendimiento Nativo</h2>
                    <p>Nuevas L2 como Blast han introducido el concepto de yield nativo para ETH y stablecoins directamente en el puente (bridge). Este enfoquePhD incentiva la retención de liquidez al derivar beneficios del staking de L1 y protocolos RWA, transformando el rollup de una simple capa de ejecución en un motor de crecimiento financiero autónomo.</p>
                </section>
            </div>`
        },
        {
            id: "calldata-compression-blobs-phd",
            title: "4. Calldata Compression, State Diffs y la Economía Post-Blobs",
            description: "Maximizando la eficiencia de L1: Algoritmos avanzados y el mercado dinámico de Blobs.",
            readTime: 360,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Algoritmos de Compresión de Diccionario (Zstandard)</h2>
                    <p>El coste de los rollups está dominado por la publicación de datos en L1. Se emplean algoritmos de compresión avanzada como *Zstandard* o *Brotli*, adaptados a la estructura de las transacciones de Ethereum. Al utilizar diccionarios pre-entrenados con datos históricos on-chain, los rollups pueden reducir el tamaño del calldata hasta en un 50-70%, permitiendo una reducción directa de las comisiones.</p>
                </section>
            </div>`
        },
        {
            id: "celestia-da-modular-dawn",
            title: "5. Celestia y el Amanecer de la Disponibilidad de Datos Modular",
            description: "La primera red de DA dedicada: Separando el consenso de la disponibilidad.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Muestreo de Disponibilidad de Datos (DAS)</h2>
                    <p>Celestia permite que los nodos verifiquen que los datos del bloque están disponibles sin tener que descargar el bloque completo. Mediante el uso de códigos de borrado (Erasure Coding), los nodos ligeros pueden obtener garantías estadísticas de seguridad, multiplicando la capacidad de la red para procesar transacciones sin aumentar los requisitos de hardware.</p>
                </section>
            </div>`
        },
        {
            id: "eip-4844-blobs-scaling",
            title: "6. EIP-4844: Blobs y el Escalado Transaccional",
            description: "Proto-Danksharding: La actualización que redujo los costes de L2 en un 90%.",
            readTime: 260,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Introducción del Espacio de Blobs</h2>
                    <p>El EIP-4844 introdujo un nuevo tipo de transacción que permite adjuntar 'blobs' de datos temporales a los bloques de Ethereum. Estos datos no son procesados por la EVM, lo que reduce drásticamente el coste de publicación para los rollups, liberando la capacidad de ejecución de la L1 y permitiendo que las L2 alcancen una escala planetaria con comisiones de céntimos.</p>
                </section>
            </div>`
        },
        {
            id: "endgame-million-tps-invisible-phd",
            title: "7. El Endgame: Un Millón de TPS y la Invisibilidad de la Infraestructura",
            description: "La culminación del escalado: Cuando la blockchain se convierte en el aire de la economía digital.",
            readTime: 360,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Escalado Fractal Infinito</h2>
                    <p>El *Endgame* de la escalabilidad no es una sola cadena, sino un océano de miles de capas especializadas (L2, L3, App-chains) cuyos estados se agregan recursivamente. Mediante la compresión de pruebas, la red principal de Ethereum puede validar la actividad económica de todo un planeta en un solo bloque, superando la capacidad de cualquier red de pagos centralizada actual.</p>
                </section>
            </div>`
        },
        {
            id: "blockchain-trilemma-theoretical",
            title: "8. El Trilema de la Escalabilidad: El Marco Teórico",
            description: "Análisis del equilibrio entre descentralización, seguridad y escalabilidad.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Límite de las Cadenas Monolíticas</h2>
                    <p>El Trilema de la Blockchain postula que es imposible maximizar las tres propiedades simultáneamente en una sola capa. Las redes monolíticas suelen sacrificar la descentralización (nodos pesados) para ganar velocidad. La respuesta forense PhD a este conflicto es la arquitectura modular, donde las tareas se dividen en capas independientes para alcanzar la eficiencia total.</p>
                </section>
            </div>`
        },
        {
            id: "fast-soft-finality-l1-preconfs-phd",
            title: "9. Finalidad Rápida, Finalidad Suave y Pre-confirmaciones de L1",
            description: "Grados de certeza en la confirmación: Análisis de la latencia y la seguridad atómica.",
            readTime: 360,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Finalidad Suave (Soft-finality)</h2>
                    <p>La finalidad suave es la confirmación inmediata que recibes de un secuenciador de L2. Es una promesa de inclusión. Sin embargo, en un entorno centralizado, existe el riesgo de reorg interno. El analista PhD diferencia entre la "confirmación de usuario" y la "liquidación criptográfica", entendiendo que la seguridad definitiva reside en la L1.</p>
                </section>
            </div>`
        },
        {
            id: "interoperability-bridges-glue",
            title: "10. Interoperabilidad y Puentes: El Pegamento del Ecosistema",
            description: "Conectando archipiélagos de liquidez: Protocolos de transferencia de mensajes de confianza mínima.",
            readTime: 230,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Puentes de Validez vs Puentes de Confianza</h2>
                    <p>La fragmentación de la liquidez es el mayor obstáculo de las L2. Los puentes de validez (heredados de ZK-Rollups) permiten mover activos sin intermediarios, mientras que los puentes basados en oráculos requieren confianza. El analista PhD prioriza soluciones de 'Zero-Knowledge interoperability' que permitan la componibilidad atómica entre cadenas.</p>
                </section>
            </div>`
        },
        {
            id: "lightning-network-bitcoin-giant",
            title: "11. Lightning Network: El Gigante Dormido de Bitcoin",
            description: "Canales de pago estatales: Escalado off-chain con liquidación final en Bitcoin.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Red de Canales Bi-direccionales</h2>
                    <p>Lightning permite transacciones instantáneas y casi gratuitas mediante el uso de contratos HTLC (Hashed Timelock Contracts). Al realizar miles de pagos fuera de la cadena y solo liquidar el balance final en la blockchain de Bitcoin, LN permite que la red se convierta en un sistema de pagos global sin saturar su capa de seguridad básica.</p>
                </section>
            </div>`
        },
        {
            id: "modular-vs-monolithic-war",
            title: "12. Modular vs Monolítico: La Guerra de Arquitecturas",
            description: "Análisis comparativo de los modelos de escalado: De Solana a Ethereum.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Especialización de Capas</h2>
                    <p>Mientras que las cadenas monolíticas intentan resolver todo (ejecución, DA, consenso) en una capa, el enfoque modular divide estas tareas. Esto permite que cada capa se optimice al extremo. Un analista PhD valora la resiliencia de la modularidad, ya que permite reemplazar componentes (como la DA) sin comprometer la seguridad de la ejecución.</p>
                </section>
            </div>`
        },
        {
            id: "optimistic-rollups-fraud-proofs",
            title: "13. Optimistic Rollups: El Juego de Pruebas de Fraude (Fraud Proofs)",
            description: "Seguridad mediante el desafío: Optimismo económico con vigilancia activa.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Periodo de Desafío (Challenge Period)</h2>
                    <p>Los Optimistic Rollups asumen que todas las transacciones son válidas, a menos que alguien demuestre lo contrario. Esto requiere un periodo de retiro de 7 días para permitir que los vigilantes (watchers) publiquen pruebas de fraude. Su seguridad PhD reside en la teoría de juegos: basta con un solo nodo honesto en todo el mundo para garantizar la integridad de la red.</p>
                </section>
            </div>`
        },
        {
            id: "parallelized-evm-monad-sei",
            title: "14. Parallelized EVMs: De Monad a Sei v2",
            description: "Rompiendo el cuello de botella secuencial: Ejecución concurrente de transacciones.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Ejecución No-Bloqueante</h2>
                    <p>La EVM tradicional procesa transacciones una por una. Las EVM paralelizadas utilizan algoritmos de concurrencia optimista para procesar múltiples transacciones simultáneamente en diferentes núcleos del procesador. Esto permite alcanzar miles de TPS manteniendo la compatibilidad total con el código existente de Solidity, marcando un hito en la eficiencia forense de nodos.</p>
                </section>
            </div>`
        },
        {
            id: "proof-markets-distributed-verification-phd",
            title: "15. Proof Markets: La Economía de la Generación de Pruebas ZK",
            description: "Descentralizando el Prover: Aceleración por hardware y mercados de computación distribuida.",
            readTime: 360,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Aceleración ZK: FPGAs y ASICs</h2>
                    <p>Generar pruebas ZK es el proceso computacional más intenso del ecosistema. Los *Proof Markets* (como Succinct o Nil Foundation) permiten que una red de operadores compita por generar la prueba más rápida y barata. Esta infraestructura es el cimiento de la finalidad instantánea, permitiendo que la "verdad matemática" se genere con gran rapidez.</p>
                </section>
            </div>`
        },
        {
            id: "recursive-zk-proofs-scaling",
            title: "16. Recursive ZK Proofs y la Hiper-escalabilidad Fractal",
            description: "Pruebas que validan otras pruebas: La clave para la agregación infinita de transacciones.",
            readTime: 250,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Compresión Criptográfica Infinita</h2>
                    <p>La recursión permite que un ZK-SNARK verifique la validez de múltiples ZK-SNARKs anteriores. Esto permite 'empaquetar' la actividad de miles de bloques en una sola prueba master. Es la tecnología que permite las Layer 3 y Layer 4, donde toda una red de redes se liquida en un solo punto de entrada en la L1.</p>
                </section>
            </div>`
        },
        {
            id: "decentralized-sequencing-phd-rigor",
            title: "17. Secuenciación Descentralizada: Resiliencia y Gobernanza del Orden",
            description: "Eliminando el punto único de fallo: Análisis de redes de secuenciación compartida.",
            readTime: 360,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Redes de Secuenciación Compartida (Shared Sequencers)</h2>
                    <p>La centralización de los secuenciadores en las L2 actuales representa un riesgo. La secuenciación descentralizada propone redes como Espresso o Astria, donde múltiples nodos independientes compiten por ordenar transacciones. Al distribuir esta autoridad, los rollups heredan una resistencia a la censura superior y una garantía de vitalidad.</p>
                </section>
            </div>`
        },
        {
            id: "shared-sequencers-atomic-sync",
            title: "18. Shared Sequencers: Sincronización Global Atómica",
            description: "Uniendo rollups fragmentados mediante un ordenamiento común de transacciones.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Componibilidad Cross-Rollup Síncrona</h2>
                    <p>Los secuenciadores compartidos permiten que transacciones en diferentes capas se procesen de forma atómica. Esto significa que un swap en el Rollup A y un depósito en el Rollup B pueden confirmarse simultáneamente, eliminando la latencia de los puentes tradicionales y creando la ilusión de una sola cadena unificada de alta velocidad.</p>
                </section>
            </div>`
        },
        {
            id: "validiums-hybrid-rollups",
            title: "19. Validiums y Rollups Híbridos: Optimización de Costes Externos",
            description: "DA fuera de la cadena con validez on-chain: El equilibrio entre coste y seguridad extrema.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Dilema de la Disponibilidad Externa</h2>
                    <p>Los Validiums utilizan pruebas ZK para la ejecución pero almacenan los datos fuera de la L1. Esto permite las comisiones más bajas del mercado, ideales para juegos o redes sociales. El analista PhD evalúa estos modelos basándose en la robustez del DAC (Data Availability Committee) y las garantías de recuperación de fondos ante fallos del operador.</p>
                </section>
            </div>`
        },
        {
            id: "zk-rollups-validity-proofs",
            title: "20. ZK-Rollups: La Verdad Matemática (Validity Proofs)",
            description: "Pruebas de conocimiento cero: Finalidad instantánea y compresión de estado soberana.",
            readTime: 280,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Pruebas de Validez vs Desafíos</h2>
                    <p>A diferencia de los Optimistics, los ZK-Rollups adjuntan una prueba matemática a cada lote de transacciones que garantiza su corrección. Esto permite retirar fondos a la L1 instantáneamente, ya que la red principal no necesita 'esperar' para verificar fraudes, solo validar la prueba criptográfica innegable.</p>
                </section>
            </div>`
        }
    ]
}
];
