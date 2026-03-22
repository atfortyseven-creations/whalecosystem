export const advancedAnalyticsModules = [
    {
        id: "advanced-analytics",
    title: "III. Arquitectura Profunda y Opcode Analytics",
    description: "Inmersión en las entrañas de la EVM: Opcodes, gestión de memoria y auditoría de bajo nivel. 20 Módulos de Máxima Perfección.",
    articles: [
        {
            id: "access-lists-eip-2930",
            title: "1. Access Lists (EIP-2930)",
            description: "Mitigación de riesgos de gas en slots 'cold': Estructura de pre-acceso institucional.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Necesidad de Access Lists</h2>
                    <p>Con el EIP-2929, el costo de las instrucciones <code>SLOAD</code> y <code>EXT*</code> aumentó para slots 'fríos'. El EIP-2930 introdujo las Access Lists: una lista de direcciones y slots que se pre-cargan, reduciendo el costo de acceso posterior y evitando que contratos que dependían de costos de gas fijos se volvieran inoperables (DoS por gas).</p>
                </section>
            </div>`
        },
        {
            id: "transient-storage-tload",
            title: "2. Almacenamiento Transitorio (TLOAD/TSTORE)",
            description: "Control de estado efímero: La solución al reentrancy y la eficiencia de gas en EIP-1153.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Fin del Almacenamiento Permanente para Flags</h2>
                    <p>Tradicionalmente, para prevenir reentrancy, los desarrolladores usaban slots de almacenamiento (SSTORE) que persistían después de la transacción, resultando en un gasto de gas innecesario. Los opcodes <code>TLOAD</code> y <code>TSTORE</code> permiten manejar un estado que se limpia automáticamente al finalizar la transacción, optimizando drásticamente los circuitos de auditoría forense.</p>
                </section>
            </div>`
        },
        {
            id: "warm-cold-storage-eip-2929",
            title: "3. Almacenamiento Warm vs Cold (EIP-2929)",
            description: "Dinamismo del costo de gas: Cómo la EVM penaliza el acceso a slots no cacheados.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Mapa de Calor del Estado</h2>
                    <p>Tras el EIP-2929, la EVM diferencia entre slots 'fríos' (primera vez accedidos en la TX) y 'calientes' (ya en memoria). Esta distinción es vital para analistas forenses, ya que ataques de agotamiento de gas suelen explotar el acceso masivo a slots fríos para incrementar el costo computacional sin realizar cambios reales en el estado.</p>
                </section>
            </div>`
        },
        {
            id: "blobs-eip-4844-da-forensics",
            title: "4. Blobs y EIP-4844: Forense de Disponibilidad de Datos",
            description: "Análisis de la nueva capa de datos efímeros para Layer 2 y su impacto en la escalabilidad.",
            readTime: 250,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Paradigma de los Binary Large Objects (Blobs)</h2>
                    <p>Los Blobs permiten que los Rollups publiquen datos en Ethereum sin competir por el gas de ejecución. Estos datos no son accesibles por la EVM (son 'opacos'), pero su existencia es verificable mediante compromisos de KZG. Para la forense institucional, esto significa que debemos auditar la disponibilidad de datos fuera del estado de cuenta tradicional de Ethereum.</p>
                </section>
            </div>`
        },
        {
            id: "calldata-vs-memory-loading",
            title: "5. Calldata vs Memory: La Estrategia de Carga",
            description: "Optimización de costos de entrada: Por qué leer de calldata es 10x más eficiente.",
            readTime: 170,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Calldata es Inmutable y Económico</h2>
                    <p>Muchos contratos copian los argumentos de entrada a <code>Memory</code> innecesariamente. <code>Calldata</code> es una región de memoria de solo lectura que no cuesta gas de expansión. Los analistas de opcodes buscan patrones donde se use <code>CALLDATALOAD</code> en lugar de <code>MLOAD</code> para asegurar la máxima eficiencia en la ingestión de datos institucionales.</p>
                </section>
            </div>`
        },
        {
            id: "create2-deterministic-deploy",
            title: "6. CREATE2: Despliegue Determinista",
            description: "Análisis del opcode de despliegue con salt: De counterfactuals a exploits de predicción.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Dominio de la Dirección: init_code + salt</h2>
                    <p>A diferencia de <code>CREATE</code> (basado en el nonce del emisor), <code>CREATE2</code> permite calcular la dirección de un contrato antes de que sea desplegado. Esta propiedad es la base de las carteras inteligentes (Account Abstraction) y de sistemas de puentes, pero también de 'address poisoning' avanzado si no se audita correctamente el <code>salt</code>.</p>
                </section>
            </div>`
        },
        {
            id: "merkle-to-verkle-trees",
            title: "7. De Merkle Trees a Verkle Trees",
            description: "La evolución de la prueba de estado: Testigos sin estado y la reducción del ancho de banda.",
            readTime: 300,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Problema del Tamaño de los Testigos</h2>
                    <p>Los Merkle-Patricia Trees requieren 'testigos' cada vez más grandes para probar una pieza del estado. Los Verkle Trees utilizan compromisos polinómicos (Vector Commitments) que permiten pruebas de tamaño constante independientemente de la profundidad. Este es el pilar de la era <em>Stateless</em> de Ethereum.</p>
                </section>
            </div>`
        },
        {
            id: "delegatecall-shared-context",
            title: "8. Delegatecall y el Contexto Compartido",
            description: "Forense de la vulnerabilidad más peligrosa: Cuando el código ajeno controla tu almacenamiento.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Identidad Prestada: msg.sender y Almacenamiento</h2>
                    <p><code>DELEGATECALL</code> ejecuta el código de un contrato B en el contexto del contrato A. Esto significa que el código de B tiene acceso total a los slots de almacenamiento de A y mantiene el <code>msg.sender</code> original. Un error en la alineación de variables de almacenamiento (Storage Layout) es la causa #1 de toma de control de protocolos DeFi.</p>
                </section>
            </div>`
        },
        {
            id: "gas-schedule-economics-eip-2929",
            title: "9. Economía del Gas Schedule y EIP-2929",
            description: "Análisis del equilibrio termodinámico de la EVM: Costos de opcodes y prevención de DoS.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Precio de la Seguridad</h2>
                    <p>El gas no es dinero; es un medidor de recursos computacionales. El EIP-2929 re-ajustó los costos para reflejar el tiempo real de acceso a los datos en los nodos. Entender la tabla de costos de opcodes permite predecir ataques de 'gas-intensive transactions' que buscan retrasar la propagación de bloques en la red institucional.</p>
                </section>
            </div>`
        },
        {
            id: "push0-opcode-eip-3855",
            title: "10. El Opcode PUSH0 (EIP-3855)",
            description: "Optimización de bytecode: Reduciendo el desperdicio de gas en el despliegue de contratos.",
            readTime: 140,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Cero como Constante Ubicua</h2>
                    <p>Históricamente, para poner un <code>0</code> en el stack, se usaba <code>PUSH1 00</code>, costando 3 gas y 2 bytes de código. El nuevo opcode <code>PUSH0</code> reduce esto a 2 gas y 1 byte. Aunque parece trivial, en contratos institucionales masivos, esto puede ahorrar miles de dólares en gas de despliegue total anual.</p>
                </section>
            </div>`
        },
        {
            id: "stack-vs-memory-anatomy",
            title: "11. El Stack vs Memory: La Anatomía del Ejecutor",
            description: "Análisis de la arquitectura basada en pilas: De registros de 256 bits a la memoria volátil.",
            readTime: 230,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Stack de 1024 Niveles</h2>
                    <p>La EVM es una máquina virtual de pilas (stack-based). Casi todos los opcodes operan sobre los registros superiores de 256 bits. Si una función intenta acceder a un elemento más profundo que la posición 16, lanza 'Stack Too Deep'. Aquí es donde entra <code>Memory</code>, un array de bytes expandible linealmente que sirve como el área de trabajo temporal del ejecutor.</p>
                </section>
            </div>`
        },
        {
            id: "eof-future-evm-format",
            title: "12. EOF: El Futuro del Formato EVM (EIP-3540)",
            description: "Separación de código y datos: Hacia una EVM más segura y fácil de auditar.",
            readTime: 260,
            content: `<div class="academy-article">
                <section>
                    <h2>I. EVM Object Format (EOF)</h2>
                    <p>Actualmente, el código y los datos en un contrato están mezclados. EOF introduce un formato de contenedor estructurado que impide la ejecución accidental de datos y permite validaciones en tiempo de despliegue. Esto reduce drásticamente las superficies de ataque de inyección de bytecode y facilita la auditoría estática inmersiva.</p>
                </section>
            </div>`
        },
        {
            id: "memory-expansion-quadratic-cost",
            title: "13. Expansión de Memoria y el Costo Cuadrático",
            description: "Prevención de ataques de memoria: Por qué el gas explota después de los primeros 724 bytes.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Curva del Costo de Expansión</h2>
                    <p>La memoria en la EVM es 'barata' al principio, pero el costo aumenta cuadráticamente con el tamaño total asignado. Esta medida previene que un atacante reserve gigabytes de memoria en los nodos de la red, asegurando la estabilidad operativa del sistema ante transacciones maliciosas de gran escala.</p>
                </section>
            </div>`
        },
        {
            id: "bytecode-size-limit-eip-170",
            title: "14. Límite de Tamaño de Bytecode (EIP-170)",
            description: "La restricción de los 24KB: Estrategias de fragmentación y contratos proxy.",
            readTime: 150,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Límite de los 24,576 Bytes</h2>
                    <p>El EIP-170 introdujo un límite estricto al tamaño de los contratos (24KB) para evitar ataques de lectura de estado excesiva durante la validación del bloque. Para protocolos complejos de Aztec Network, esto obliga al uso de arquitecturas de Diamante (EIP-2535) o delegación modular para extender la lógica sin comprometer la red.</p>
                </section>
            </div>`
        },
        {
            id: "memory-vs-storage-atomic-persistence",
            title: "15. Memoria vs Storage: La Persistencia Atómica",
            description: "La dicotomía fundamental de la EVM: Volatilidad de ejecución vs inmutabilidad del estado.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Almacenamiento: El Disco Duro de 256 bits</h2>
                    <p>El <code>Storage</code> es un almacén persistente de clave-valor. Cada slot tiene 32 bytes y su modificación es el proceso más caro de la red (SSTORE). Por el contrario, <code>Memory</code> se limpia tras cada llamada. La eficiencia forense reside en minimizar las escrituras en almacenamiento mediante el uso intensivo de la memoria volátil durante el cómputo intermedio.</p>
                </section>
            </div>`
        },
        {
            id: "precompiles-cryptographic-acceleration",
            title: "16. Precompiles: Criptografía Acelerada (0x01-0x0A)",
            description: "Puentes hacia el hardware: ECDSA, SHA256 y pruebas ZK integradas en el protocolo.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Contratos Nativos en Direcciones Fijas</h2>
                    <p>Algunas operaciones (como la recuperación de claves <code>ecrecover</code> o emparejamientos elípticos para ZK) son demasiado caras para ejecutarse como bytecode normal. La EVM usa 'Precompiles': funciones escritas en el lenguaje nativo del cliente (Geth/Nethermind) que residen en direcciones del 0x01 al 0x0A, permitiendo criptografía de alto rendimiento a bajo costo.</p>
                </section>
            </div>`
        },
        {
            id: "returndatacopy-calldatacopy-semantics",
            title: "17. Returndatacopy vs Calldatacopy (EIP-211)",
            description: "Gestión de buffers de entrada y salida: Cómo la EVM maneja datos de longitud dinámica.",
            readTime: 160,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Captura de la Salida de Sub-llamadas</h2>
                    <p>Antes de <code>RETURNDATASIZE</code> y <code>RETURNDATACOPY</code>, los contratos debían pre-asignar espacio para la respuesta de una sub-llamada. Ahora, la EVM permite manejar respuestas de longitud arbitraria de forma dinámica, facilitando la auditoría de protocolos de interoperabilidad y puentes institucionales.</p>
                </section>
            </div>`
        },
        {
            id: "selfdestruct-eip-6780-nerf",
            title: "18. SELFDESTRUCT y el EIP-6780",
            description: "El opcode que se negó a morir: Cómo se limitó el borrado de contratos en Dencun.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Fin de las Limpiezas de Estado Masivas</h2>
                    <p><code>SELFDESTRUCT</code> permitía borrar un contrato y recibir un reembolso de gas. Debido a los Verkle Trees, esta funcionalidad se rompió. Con el EIP-6780, el opcode ahora solo funciona si se llama en la misma transacción en la que se creó el contrato, eliminando su uso como mecanismo de 'pausa' o 'actualización' en contratos antiguos.</p>
                </section>
            </div>`
        },
        {
            id: "staticcall-state-immutability",
            title: "19. Staticcall y la Inmutabilidad del Estado (EIP-214)",
            description: "Seguridad de solo lectura: Protegiendo el almacenamiento durante consultas externas.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Consultas sin Efectos Secundarios</h2>
                    <p><code>STATICCALL</code> es idéntico a <code>CALL</code>, pero lanza una excepción si el contrato llamado intenta realizar un <code>SSTORE</code> o cualquier cambio de estado. Es la herramienta principal para implementar 'Vistas' seguras y evitar que un contrato malicioso modifique el balance durante una auditoría en tiempo real.</p>
                </section>
            </div>`
        },
        {
            id: "bytecode-verification-sourcify-rigor",
            title: "20. Verificación de Bytecode vs Fuente (Sourcify)",
            description: "Forense de la verdad única: Asegurando que el código desplegado coincide con el auditado.",
            readTime: 270,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Hash del Metadato</h2>
                    <p>Al compilar Solidity, se añade un hash IPFS al final del bytecode. Herramientas como Sourcify verifican no solo el código, sino los metadatos exactos (versión del compilador, optimizaciones). Para la transparencia absoluta, un analista forense nunca confía en el código pegado en un explorador; siempre verifica el bytecode contra el artefacto de compilación original.</p>
                </section>
            </div>`
        }
    ]
}
];
