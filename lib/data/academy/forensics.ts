export const forensicsModules = [
    {
        id: "evm-forensics",
        title: "I. Análisis Forense de la EVM",
        description: "Reconstrucción del estado on-chain y metodologías de disección de transacciones a nivel de bytecode. 20 Módulos de Máxima Perfección.",
        articles: [
            {
                id: "yul-assembly",
                title: "1. Análisis Forense de Yul (Assembly)",
                description: "Ingeniería inversa de opcodes y manipulación de bajo nivel de la memoria.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Lenguaje de las Sombras</h2>
                        <p>Yul es el lenguaje ensamblador intermedio de la EVM. Permite un control granular sobre el stack y la memoria, permitiendo optimizaciones de gas que el analista forense debe desglosar para detectar lógicas ocultas. El uso de Yul elude las capas de seguridad de Solidity, lo que requiere una auditoría manual de cada <code>mload</code> y <code>mstore</code> para prevenir corrupciones accidentales o maliciosas del Free Memory Pointer.</p>
                        
                        <pre><code>// Auditoría de Slot de Memoria Libre en Yul
assembly {
    let freeMem := mload(0x40) // Cargar puntero actual
    mstore(freeMem, 0x123)     // Escribir dato
    mstore(0x40, add(freeMem, 32)) // Actualizar puntero
}</code></pre>
                    </section>

                    <section>
                        <h2>II. Opcodes y Forense de Bajo Nivel</h2>
                        <p>El analista debe estar familiarizado con opcodes como <code>CALLDATALOAD</code> y <code>EXTCODEHASH</code>. Estos permiten verificar el bytecode de contratos externos antes de interactuar con ellos, una técnica esencial para evitar Honeypots donde la dirección de destino parece legítima pero contiene lógica de robo encubierta.</p>
                    </section>
                </div>`
            },
            {
                id: "gas-optimization",
                title: "2. Anatomía del Gas y Rutinas de Ensamblador",
                description: "Optimización computacional extrema: De la termodinámica de opcodes a la eficiencia de Yul.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Termodinámica de la EVM</h2>
                        <p>El Gas es el mecanismo de defensa contra el problema de la parada (*Halting Problem*). Cada instrucción tiene un costo fijo en gas que refleja el esfuerzo de los nodos para mantener el consenso. Para el analista forense, el agotamiento de gas (*Out-of-Gas*) no es solo un error, sino un indicador de bucles maliciosos o de ineficiencia estructural en la lógica del contrato.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 300" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="700" height="200" fill="none" stroke="#555" />
                                <text x="400" y="40" fill="#fff" text-anchor="middle">Jerarquía de Costos (Opcode Gas Schedule)</text>
                                
                                <rect x="80" y="80" width="200" height="140" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" />
                                <text x="180" y="70" fill="#ff4d4d" text-anchor="middle">STORAGE (SSTORE)</text>
                                <text x="180" y="150" fill="#fff" text-anchor="middle">20,000 Gas</text>
                                
                                <rect x="300" y="80" width="200" height="140" fill="rgba(255,215,0,0.1)" stroke="#ffd700" />
                                <text x="400" y="70" fill="#ffd700" text-anchor="middle">ACCESS (SLOAD)</text>
                                <text x="400" y="150" fill="#fff" text-anchor="middle">2,100 Gas</text>
                                
                                <rect x="520" y="80" width="200" height="140" fill="rgba(77,255,136,0.1)" stroke="#4dff88" />
                                <text x="620" y="70" fill="#4dff88" text-anchor="middle">CALC (ADD/SUB)</text>
                                <text x="620" y="150" fill="#fff" text-anchor="middle">3 Gas</text>
                            </svg>
                            <p class="diagram-caption">Figura 6: Gradiente de consumo energético por tipo de operación en la EVM.</p>
                        </div>
                    </section>

                    <section>
                        <h2>II. Optimización de Bajo Nivel mediante Yul</h2>
                        <p>El compilador de Solidity no siempre genera el bytecode más eficiente. El uso de **Yul** permite eludir abstracciones costosas como los <code>overflow checks</code> automáticos (introducidos en 0.8.0), permitiendo una gestión directa del stack.</p>
                        <pre><code>// Optimización de bucle en Yul: Ahorro de ~200 gas por iteración
assembly {
    for { let i := 0 } lt(i, length) { i := add(i, 1) } {
        let val := mload(add(dataPtr, mul(i, 32)))
        sstore(add(storageSlot, i), val)
    }
}</code></pre>
                    </section>
                </div>`
            },
            {
                id: "proxy-patterns",
                title: "3. Arquitecturas Modificables (Proxy Patterns)",
                description: "Ingeniería de actualización y colisiones de almacenamiento: De EIP-1967 al Diamond Standard.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Slot de Implementación (EIP-1967)</h2>
                        <p>La seguridad de un Proxy depende enteramente de la segregación de su almacenamiento. Para evitar colisiones con las variables de estado de la implementación, el estándar EIP-1967 define slots específicos derivados de hashes keccak256, situados en el extremo superior del espacio de storage (casi 2^256). El slot principal <code>0x3608...</code> almacena la dirección lógica actual.</p>
                        <pre><code>// Cálculo determinista del slot de implementación
bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

// Auditoría Forense: Verificar que ninguna variable en la implementación
// comparta el índice de slot 0 con el Proxy.</code></pre>
                    </section>

                    <section>
                        <h2>II. UUPS vs Transparent: La Batalla del Gas y la Seguridad</h2>
                        <p>La arquitectura <strong>Transparent Proxy</strong> utiliza un contrato Admin para discernir si quien llama es el administrador (para actualizar) o un usuario (para ejecutar lógica), evitando colisiones de selectores. Por contra, <strong>UUPS (Universal Upgradeable Proxy Standard)</strong> traslada la lógica de actualización a la propia implementación. Esto reduce el costo de gas en cada llamada de usuario, pero introduce el riesgo crítico de \"ladrillo\" (*Brick*): si se despliega una implementación sin la función de actualización, el Proxy queda congelado para siempre.</p>
                    </section>

                    <section>
                        <h2>III. Diamond Standard (EIP-2535): Fragmentación de Lógica</h2>
                        <p>Para protocolos que exceden el límite de 24KB (Spurious Dragon), el Diamond Standard mapea selectores de función individuales a múltiples contratos llamados \"Facets\". El riesgo forense se traslada a la complejidad del ruteo. Un analista debe auditar la función <code>diamondCut</code>, ya que es el vector de inyección de código malicioso por excelencia en sistemas gobernados por multisigs comprometidas.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <polygon points="400,30 460,110 400,190 340,110" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="400" y="215" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Diamond Proxy (Router)</text>
                                
                                <path d="M430 110 L580 60" stroke="#aaa" marker-end="url(#arrowhead)" />
                                <text x="600" y="65" fill="#fff" style="font-size: 11px;">Facet A (Vault Logic)</text>
                                
                                <path d="M430 110 L580 160" stroke="#aaa" marker-end="url(#arrowhead)" />
                                <text x="600" y="165" fill="#fff" style="font-size: 11px;">Facet B (Governance)</text>
                                
                                <path d="M370 110 L250 110" stroke="#ff4d4d" stroke-dasharray="5,5" marker-end="url(#arrowhead)" />
                                <text x="180" y="115" fill="#ff4d4d" style="font-size: 11px; font-weight: bold;">Facet Malicioso (🚨)</text>
                            </svg>
                            <p class="diagram-caption">Figura 3: Inyección de lógica maliciosa mediante el esquema de ruteo de Diamond Facets.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "signature-replay",
                title: "4. Ataques de Replay de Firmas (EIP-712)",
                description: "Criptografía de mensajes firmados y la prevención de la reutilización de maleabilidad.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Naturaleza de las Firmas Offline</h2>
                        <p>Las firmas criptográficas permiten a los usuarios autorizar acciones sin realizar una transacción directa (Gasless). Sin embargo, si estas firmas no están vinculadas unívocamente a un contexto específico (Chain ID, Dirección del Contrato, Nonce), pueden ser capturadas y re-enviadas por un atacante en diferentes redes o múltiples veces en la misma.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="300" height="100" fill="none" stroke="#4d94ff" />
                                <text x="200" y="80" fill="#4d94ff" text-anchor="middle">Mensaje: \"Transfer 100\"</text>
                                <text x="200" y="110" fill="#4dff88" text-anchor="middle">Firma: {v, r, s}</text>
                                
                                <path d="M350 100 L450 100" stroke="#ff4d4d" stroke-width="2" marker-end="url(#arrowhead)" />
                                
                                <rect x="450" y="50" width="300" height="100" fill="none" stroke="#ff4d4d" />
                                <text x="600" y="80" fill="#ff4d4d" text-anchor="middle">Replay en L2 / Testnet</text>
                                <text x="600" y="110" fill="#fff" text-anchor="middle" style="font-size: 10px;">Firma válida pero contexto erróneo</text>
                            </svg>
                            <p class="diagram-caption">Figura 10: Vulnerabilidad de firma agnóstica al contexto (Replay Attack).</p>
                        </div>
                    </section>
                    
                    <section>
                        <h2>II. Blindaje mediante EIP-712 (Typed Data)</h2>
                        <p>El estándar EIP-712 introduce el <code>DOMAIN_SEPARATOR</code>, un hash que incluye el <code>chainId</code> y el <code>verifyingContract</code>. El analista forense debe verificar que el contrato no solo valide la firma, sino que su esquema de hash sea inmune a la maleabilidad de firmas (e.g., usando la librería ECDSA de OpenZeppelin para prevenir firmas <code>s</code> altas).</p>
                        <pre><code>bytes32 domainSeparator = keccak256(
    abi.encode(
        keccak256(\"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)\"),
        keccak256(bytes(\"WhaleAcademy\")),
        keccak256(bytes(\"1\")),
        block.chainid,
        address(this)
    )
);</code></pre>
                    </section>
                </div>`
            },
            {
                id: "frontrunning-arbitrage",
                title: "5. Back-Running y Arbitraje Libre de Riesgo",
                description: "Extracción de valor atómico tras eventos de oráculo o swaps masivos.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Mecánica del Back-Running</h2>
                        <p>El **Back-running** consiste en colocar una transacción inmediatamente después de una transacción objetivo. A diferencia del front-running, no compite por gas para estar antes, sino que aprovecha el desequilibrio de estado generado por la transacción precedente (e.g., una liquidación o un swap de gran volumen).</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="70" width="150" height="60" fill="rgba(77,148,255,0.2)" stroke="#4d94ff" />
                                <text x="125" y="105" fill="#fff" text-anchor="middle">TX 1: Whale Swap</text>
                                
                                <path d="M200 100 L300 100" stroke="#fff" marker-end="url(#arrowhead)" />
                                
                                <rect x="300" y="70" width="200" height="60" fill="rgba(77,255,136,0.2)" stroke="#4dff88" />
                                <text x="400" y="105" fill="#fff" text-anchor="middle">TX 2: Arbitrage (Searcher)</text>
                                
                                <text x="400" y="50" fill="#4dff88" text-anchor="middle" style="font-size: 12px;">Captura de Ineficiencia Atómica</text>
                            </svg>
                            <p class="diagram-caption">Figura 11: Ejecución secuencial para captura de valor sin riesgo de inventario.</p>
                        </div>
                    </section>

                    <section>
                        <h2>II. Searcher Strategy: Bundles y Flashbots</h2>
                        <p>Para garantizar que ninguna otra transacción se interponga entre la TX de la ballena y el arbitraje, los **Searchers** utilizan *Bundles*. Un bundle es un paquete de transacciones que se ejecutan de forma atómica y secuencial. Si el arbitraje no genera beneficio, el bundle entero se descarta, eliminando el riesgo de pérdida de gas por transacciones fallidas.</p>
                    </section>
                </div>`
            },
            {
                id: "dos-attacks",
                title: "6. Denegación de Servicio (DoS) Estructural",
                description: "Vulnerabilidades por agotamiento de recursos y bloqueos de lógica lógica.",
                readTime: 210,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Agotamiento del Block Gas Limit</h2>
                        <p>Un contrato puede quedar permanentemente inoperable si una función crítica (e.g., distribución de recompensas) itera sobre un array que crece sin límites. El analista forense debe identificar estos \"venenos de gas\" donde el coste de ejecución supera el límite del bloque, haciendo que la recuperación de fondos sea computacionalmente imposible.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="700" height="30" fill="#333" stroke="#555" />
                                <rect x="50" y="50" width="550" height="30" fill="rgba(255,77,77,0.4)" stroke="#ff4d4d" />
                                <text x="400" y="45" fill="#fff" text-anchor="middle" style="font-size: 12px;">Gas consumed by loop iteration N</text>
                                <line x1="600" y1="30" x2="600" y2="100" stroke="#ff4d4d" stroke-dasharray="4" />
                                <text x="610" y="90" fill="#ff4d4d" style="font-size: 10px;">BLOCK GAS LIMIT REACHED</text>
                            </svg>
                            <p class="diagram-caption">Figura 12: Bloqueo de ejecución por crecimiento ilimitado de estructuras de datos.</p>
                        </div>
                    </section>

                    <section>
                        <h2>II. El Patrón Pull sobre Push (Aislamiento de Errores)</h2>
                        <p>Para mitigar el DoS por reversión forzada (e.g., un receptor malicioso que siempre falla), el analista debe recomendar el patrón **Pull Payment**. En lugar de que el contrato \"empuje\" fondos a una lista de usuarios, cada usuario debe reclamar su parte individualmente. Esto garantiza que el fallo de un solo actor no bloquee el sistema para el resto de la red.</p>
                    </section>
                </div>`
            },
            {
                id: "tx.origin-abuse",
                title: "7. El Engaño Phishing de tx.origin",
                description: "Suplantación de identidad mediante la manipulación de la cadena de llamadas del sistema.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Identidad Global vs Identidad Directa</h2>
                        <p>La variable <code>tx.origin</code> siempre apunta a la EOA (Externally Owned Account) que inició la cadena de llamadas, mientras que <code>msg.sender</code> apunta al llamante inmediato. Un analista forense debe identificar contratos que utilicen <code>tx.origin</code> para autorización, ya que un atacante puede engañar al usuario para que interactúe con un contrato malicioso que a su vez llame al contrato víctima, suplantando la voluntad del usuario.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 180" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="100" cy="90" r="30" fill="none" stroke="#fff" />
                                <text x="100" y="95" fill="#fff" text-anchor="middle">EOA</text>
                                
                                <path d="M130 90 L270 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" />
                                <text x="200" y="80" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">Interaction</text>
                                
                                <rect x="300" y="60" width="150" height="60" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" />
                                <text x="375" y="95" fill="#ff4d4d" text-anchor="middle">Attacker Contract</text>
                                
                                <path d="M450 90 L590 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" />
                                <text x="520" y="80" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">Malicious Call</text>
                                
                                <rect x="620" y="60" width="150" height="60" fill="none" stroke="#4d94ff" />
                                <text x="695" y="95" fill="#4d94ff" text-anchor="middle">Victim: tx.origin == EOA</text>
                            </svg>
                            <p class="diagram-caption">Figura 16: Cadena de suplantación de identidad mediante escalada de tx.origin.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "uninitialized-proxies",
                title: "8. Explotación de Proxies no Inicializados",
                description: "Análisis de seguridad en la fase de despliegue de implementaciones modulares.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Implementación Desprotegida</h2>
                        <p>Los contratos Proxy delegan su lógica a un contrato de Implementación. Si este contrato no es \"inicializado\" directamente tras su despliegue, un atacante puede tomar posesión de él (Ownership) e invocar funciones destructivas. Este fallo fue el origen del exploit de Nomad Bridge, donde una inicialización defectuosa permitió la validación automática de cualquier mensaje malicioso.</p>
                    </section>

                    <section>
                        <h2>II. El Ataque de Autodestrucción Rápida</h2>
                        <p>En un modelo UUPS, si un atacante toma el mando de la implementación y ejecuta <code>delegatecall</code> hacia un contrato con <code>selfdestruct</code>, borrará el código de la implementación. Esto dejará al Proxy original (que contiene todos los fondos de los usuarios) apuntando a una dirección vacía, congelando el capital perpetuamente. El analista experto debe verificar que la implementación sea inmune incluso si es capturada.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 150" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="200" height="70" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" />
                                <text x="150" y="80" fill="#4d94ff" text-anchor="middle">Proxy (State)</text>
                                
                                <path d="M250 75 L450 75" stroke="#ff4d4d" marker-end="url(#arrowhead)" />
                                
                                <rect x="450" y="40" width="300" height="70" fill="rgba(255,77,77,0.2)" stroke="#ff4d4d" />
                                <text x="600" y="80" fill="#ff4d4d" text-anchor="middle">Implementation (Destroyed)</text>
                                <text x="600" y="100" fill="#fff" text-anchor="middle" style="font-size: 8px;">Zero Bytecode at address</text>
                            </svg>
                            <p class="diagram-caption">Figura 17: Rotura sistémica por destrucción de la lógica de delegación.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "flash-minting",
                title: "9. Flash Mints y Abusos de Elasticidad",
                description: "Generación de liquidez efímera para ataques de gobernanza y arbitraje estructural.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Liquidez Infinita en un Solo Bloque</h2>
                        <p>El **Flash Minting** permite emitir una cantidad arbitraria de tokens en una sola transacción, siempre que estos sean quemados (devueltos) al final de la misma. A diferencia del Flash Loan, que depende de un pool existente, el Flash Mint depende de la elasticidad programada del token (EIP-3156).</p>
                    </section>

                    <section>
                        <h2>II. Secuestro de Gobernanza mediante Inflación Atómica</h2>
                        <p>El riesgo más severo del Flash Minting es la suplantación de poder de voto. Un atacante puede \"acuñar\" millones de tokens de gobernanza, votar una propuesta maliciosa y quemar los tokens, todo antes de que cualquier monitor de mercado detecte la anomalía en el supply circulante. La defensa institucional requiere **Snapshots** de votos en bloques pasados para invalidar el capital efímero.</p>
                    </section>
                </div>`
            },
            {
                id: "mempool-heuristics",
                title: "10. Heurísticas Avanzadas de Mempool",
                description: "Inteligencia predictiva y decodificación de transacciones en vuelo.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Capa de Inteligencia Subterránea</h2>
                        <p>El mempool es el 'sistema nervioso' de Ethereum. Analizar las heurísticas de las transacciones pendientes permite anticipar movimientos masivos de liquidez y detectar ataques atómicos antes de que se confirmen. El analista forense utiliza esto para trazar el origen real de un exploit, a menudo oculto tras relays privados como Flashbots para evitar el front-running de otros bots.</p>
                    </section>

                    <section>
                        <h2>II. Clusterización de Actores y Bots</h2>
                        <p>Mediante el análisis de patrones de gas y firmas de datos, es posible clusterizar bots de arbitraje. Esto permite filtrar el ruido del mercado y centrar la atención en movimientos coordinados de \"Ballenas\" o en la preparación de ataques de gobernanza multi-bloque.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="400" cy="100" r="80" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-dasharray="5,5" />
                                <text x="400" y="30" fill="#fff" text-anchor="middle">Mempool Searcher Cloud</text>
                                
                                <circle cx="350" cy="80" r="10" fill="#ff4d4d" />
                                <circle cx="450" cy="120" r="10" fill="#ff4d4d" />
                                <circle cx="420" cy="70" r="10" fill="#ff4d4d" />
                                <text x="400" y="190" fill="#ff4d4d" text-anchor="middle">Ataques Detectados en Vuelo</text>
                            </svg>
                            <p class="diagram-caption">Figura 18: Monitoreo heurístico de transacciones pendientes para prevención de exploits.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "tokenomics-vesting",
                title: "11. Ingeniería Criptoeconómica: Vesting y Sinks",
                description: "Modelado de flujos: De la presión de venta a la termodinámica de los sumideros de tokens.",
                readTime: 210,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Termodinámica Criptográfica</h2>
                        <p>La economía de un token opera bajo leyes de oferta y demanda programada. El supply circulante no es una cifra estática, sino una curva dinámica. La ingeniería de **Vesting** busca alinear los incentivos de los fundadores con la maduración del ecosistema, evitando el colapso del precio durante los eventos de desbloqueo masivo.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 300" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <path d=\"M50 250 Q200 230 350 150 T700 50\" fill=\"none\" stroke=\"#4d94ff\" stroke-width=\"3\" />
                                <text x=\"700\" y=\"40\" fill=\"#4d94ff\" style=\"font-weight: bold;\">Supply Circulante</text>
                                
                                <line x1=\"200\" y1=\"260\" x2=\"200\" y2=\"210\" stroke=\"#ff4d4d\" stroke-dasharray=\"4\" />
                                <text x=\"200\" y=\"280\" fill=\"#ff4d4d\" text-anchor=\"middle\" style=\"font-size: 10px;\">TGE / Cliff End</text>
                                
                                <rect x=\"450\" y=\"180\" width=\"120\" height=\"30\" fill=\"rgba(77,255,136,0.1)\" stroke=\"#4dff88\" />
                                <text x=\"510\" y=\"170\" fill=\"#4dff88\" text-anchor=\"middle\" style=\"font-size: 10px;\">Mecanismo Sink (Burn/Lock)</text>
                                
                                <path d=\"M510 210 L510 250\" stroke=\"#4dff88\" stroke-dasharray=\"2\" marker-end=\"url(#arrowhead-green)\" />
                                
                                <defs>
                                    <marker id=\"arrowhead-green\" markerWidth=\"10\" markerHeight=\"7\" refX=\"0\" refY=\"3.5\" orient=\"auto\">
                                        <polygon points=\"0 0, 10 3.5, 0 7\" fill=\"#4dff88\" />
                                    </marker>
                                </defs>
                            </svg>
                            <p class=\"diagram-caption\">Figura 5: Interacción entre la emisión de tokens (Vesting) y los mecanismos de absorción de valor (Sinks).</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "storage-slots",
                title: "12. Manipulación de Slots de Memoria y Colisiones",
                description: "Arquitectura del Storage Layout: De la herencia lineal a la colisión de mappings multi-capa.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Determinismo del Storage Layout</h2>
                        <p>A diferencia de la RAM volátil, el almacenamiento en la EVM es un mapa persistente de 2^256 slots. La posición de cada variable está determinada por el orden de declaración. En contratos complejos, el riesgo de colisión de slots es una vulnerabilidad sistémica que puede corromper el estado global del protocolo.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="300" height="40" fill="none" stroke="#4d94ff" />
                                <text x="200" y="75" fill="#4d94ff" text-anchor="middle">Slot 0 (Owner ADR)</text>
                                
                                <rect x="50" y="100" width="300" height="40" fill="none" stroke="#4d94ff" />
                                <text x="200" y="125" fill="#4d94ff" text-anchor="middle">Slot 1 (Balance Mapping)</text>
                                
                                <path d="M350 75 L450 120" stroke="#ff4d4d" stroke-dasharray="3,3" marker-end="url(#arrowhead)" />
                                <text x="550" y="125" fill="#ff4d4d" style="font-size: 11px;">Riesgo: Sobrescritura en Herencia</text>
                            </svg>
                            <p class="diagram-caption">Figura 7: Visualización de la jerarquía de slots y riesgo de solapamiento por herencia mal estructurada.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "fixed-point-math",
                title: "13. Pérdida de Precio Cuantitativa",
                description: "Aritmética de punto fijo y vulnerabilidades por errores de redondeo.",
                readTime: 210,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Desafío del Determinismo Decimal</h2>
                        <p>Solidity no soporta números de punto flotante por razones de determinismo absoluto. Se utiliza aritmética de punto fijo, escalando los números por factores de 10^18 (Wei). Un error en el orden de operaciones <code>(A/B)*C</code> frente a <code>(A*C)/B</code> puede resultar en la pérdida total de precisión, un vector explotado en ataques de donación a protocolos de lending.</p>
                        
                        <div class="diagram-container">
                            <pre style="text-align: left; display: inline-block; padding: 15px; background: #1a1a1a; border-left: 4px solid #ffca28;">
// Análisis Forense de Precisión
uint256 sharePrice = totalAssets / totalSupply; // Peligro: Redondeo a cero si assets < supply
uint256 sharePriceSafe = (totalAssets * 1e18) / totalSupply; // Correcto: Escalado previo
                            </pre>
                            <p class="diagram-caption">Figura 8: Prevención de redondeo a cero en el cálculo de valor de acciones (Pool Shares).</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "phantom-functions",
                title: "14. Phantom Functions y Colisiones de Selector",
                description: "Análisis de ambigüedad en el ruteo de funciones y explotación de fallbacks.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Ambigüedad de los 4 Bytes</h2>
                        <p>La EVM identifica funciones mediante los primeros 4 bytes del keccak256 de su firma (e.g., <code>transfer(address,uint256)</code> -> <code>0xa9059cbb</code>). Dado que 4 bytes solo ofrecen 2^32 combinaciones, es trivial generar colisiones donde dos funciones con semántica distinta comparten el mismo identificador, permitiendo ataques de \"Función Fantasma\" en proxies mal configurados.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 150" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="150" height="50" fill="none" stroke="#4d94ff" />
                                <text x="125" y="80" fill="#4d94ff" text-anchor="middle">func_a()</text>
                                
                                <path d="M200 75 L300 75" stroke="#fff" />
                                <rect x="300" y="50" width="200" height="50" fill="rgba(255,77,77,0.2)" stroke="#ff4d4d" />
                                <text x="400" y="80" fill="#fff" text-anchor="middle">0x12345678</text>
                                
                                <path d="M500 75 L600 75" stroke="#fff" />
                                <rect x="600" y="50" width="150" height="50" fill="none" stroke="#4dff88" />
                                <text x="675" y="80" fill="#4dff88" text-anchor="middle">func_b()</text>
                            </svg>
                            <p class="diagram-caption">Figura 14: Colisión de selectores permitiendo el desvío de flujo de ejecución.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "evm-callstack",
                title: "15. Reconstrucción Determinista del Callstack",
                description: "Análisis exhaustivo de la jerarquía de ejecución: Opcodes, propagación de contexto y tracers atómicos.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Arquitectura de Bajo Nivel y Propagación de Contexto</h2>
                        <p>La Ethereum Virtual Machine (EVM) no es una CPU convencional, sino un motor de cambio de estado semi-estático guiado por una pila de 256 bits. Para el analista forense, el Callstack representa la genealogía de la autoridad en una transacción. Cada instrucción de llamada no solo transfiere flujo, sino que redefine la soberanía sobre el <strong>Storage</strong> (almacenamiento persistente) y el <strong>Balance</strong>.</p>
                    </section>
                </div>`
            },
            {
                id: "cross-chain-reentrancy",
                title: "16. Reentrancy Read-Only y Cross-Chain",
                description: "Análisis de estados inconsistentes en oráculos y protocolos de interoperabilidad.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Reentrancia en Funciones de Solo Lectura</h2>
                        <p>Contrario a la creencia popular, las funciones <code>view</code> pueden ser vectores de ataque. La **Reentrancia Read-Only** explota estados inconsistentes durante la ejecución de una transacción. Por ejemplo, en un AMM, tras retirar liquidez pero *antes* de actualizar el precio del oráculo, el contrato está en un estado desequilibrado. Un atacante puede consultar este precio erróneo desde un contrato tercero para ejecutar arbitrajes o liquidaciones injustas.</p>
                    </section>
                </div>`
            },
            {
                id: "selfdestruct",
                title: "17. SELFDESTRUCT y Desestabilización de Balances",
                description: "Análisis forense de la inyección forzada de Ether: De la rotura de invariantes al post-Cancun.",
                readTime: 200,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Inyección Forzada de Estado</h2>
                        <p>El opcode <code>SELFDESTRUCT</code> permite enviar Ether a cualquier dirección sin ejecutar sus funciones de recepción (<code>receive</code>/<code>fallback</code>). Para el analista, este es el vector principal para romper invariantes de balance como <code>address(this).balance == internalAccounting</code>, provocando un DoS estructural.</p>
                    </section>
                </div>`
            },
            {
                id: "mev-dark-forest",
                title: "18. Sobreviviendo en el Bosque Oscuro: MEV Institucional",
                description: "Análisis espectral de Bundles, Searchers y la ecología de las subastas Flashbots.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Ecología de la Extracción Atómica</h2>
                        <p>El mempool público es un entorno de información asimétrica. El **MEV (Maximal Extractable Value)** representa el beneficio que un minero o validador puede obtener mediante la inclusión, exclusión o reordenación de transacciones. Para un inversor institucional, el \"Bosque Oscuro\" es un riesgo de ejecución que puede degradar el rendimiento de una operación mediante *Sandwich Attacks* o *Front-running* agresivo.</p>
                    </section>
                </div>`
            },
            {
                id: "oracle-manipulation",
                title: "19. TWAP vs Spot: Guerra de Oráculos",
                description: "Estrategias de defensa contra la manipulación de precios intra-bloque.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Fragilidad del Precio Spot</h2>
                        <p>Depender del precio <code>currentPrice()</code> de un DEX es una vulnerabilidad crítica. Mediante Flash Loans, un atacante puede alterar masivamente el ratio de un pool en una sola transacción, distorsionando la percepción de valor del contrato víctima. El analista forense debe auditar si existe una ventana de arbitraje atómico que permita drenar colateral sobre-valorado artificialmente.</p>
                    </section>
                </div>`
            },
            {
                id: "smart-contract-vulnerabilities",
                title: "20. Vectores Clínicos de Ataque a Contratos",
                description: "Disección técnica de la explotación: De la reentrancia multi-contrato al compromiso de invariantes.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Reentrancia Cross-Contract y Cross-Function</h2>
                        <p>La reentrancia ya no se limita al robo de fondos vía <code>fallback()</code>. La variante más peligrosa en el panorama institucional es la <strong>Cross-Contract Reentrancy</strong>. Ocurre cuando un sistema depende de un estado compartido entre varios contratos. El atacante manipula el Contrato A (ej. un pool de liquidez) y, antes de que este actualice sus estados internos, invoca el Contrato B (ej. un oráculo o una bóveda) que lee el estado aún no sincronizado del Contrato A.</p>
                    </section>
                </div>`
            }
        ]
    },
    {
        id: "institutional-flow",
        title: "II. Dinámicas Estocásticas del Flujo Institucional",
        description: "Estudio profundo de la liquidez algorítmica y el flujo en AMMs. 20 Módulos de Máxima Perfección.",
        articles: [
            {
                id: "v2-aggregators",
                title: "1. Agregadores de Segunda Generación",
                description: "Optimización de rutas multi-hop y fragmentación de liquidez inteligente.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Más allá del Smart Order Routing (SOR)</h2>
                        <p>Los agregadores de primera generación simplemente buscaban el mejor precio en un solo paso. La segunda generación (vía 1inch Pathfinder o CoW Swap) utiliza algoritmos de búsqueda en grafos para fragmentar una sola orden en múltiples rutas y protocolos simultáneamente, minimizando el impacto de mercado total mediante la 'coincidencia de intenciones'.</p>
                    </section>
                </div>`
            },
            {
                id: "lp-statistical-arbitrage",
                title: "2. Arbitraje Estadístico en LPs",
                description: "Hedging y optimización de rangos basados en correlación y reversión a la media.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Provisión de Liquidez como Estrategia de Volatilidad</h2>
                        <p>Ser LP en un AMM es equivalente a vender una opción de volatilidad (Short Vol). El arbitraje estadístico permite a los LPs mitigar el riesgo de delta mediante el uso de derivados o la apertura de posiciones inversas en pools altamente correlacionados. El objetivo es capturar el 'Fee Income' mientras se mantiene una exposición neutral al mercado.</p>
                    </section>
                </div>`
            },
            {
                id: "liquidation-cascades-solvency",
                title: "3. Cascadas de Liquidación y Solvencia",
                description: "Análisis de riesgos sistémicos en protocolos de crédito y derivados.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Mecanismo de Liquidación</h2>
                        <p>En protocolos de Lending (Aave, Maker), la insolvencia se evita mediante subastas de liquidación activadas cuando el ratio de colateral cae por debajo del umbral crítico. El análisis forense de una cascada implica rastrear cómo una liquidación masiva genera slippage, el cual reduce el precio del colateral e induce nuevas liquidaciones en un bucle de retroalimentación negativa potente.</p>
                    </section>
                </div>`
            },
            {
                id: "liquidity-derivatives",
                title: "4. Derivados de Liquidez: LPs como Colateral",
                description: "Tokenización y reutilización de posiciones de liquidez en el ecosistema DeFi.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Reciclaje del Capital</h2>
                        <p>Los NFTs de Uniswap V3 o los tokens LP de Balancer no son solo recibos de depósito; representan derechos de flujo de caja que pueden ser colateralizados. Los 'Liquidity Derivatives' permiten a los fondos obtener préstamos contra sus posiciones de mercado, liberando liquidez sin cerrar sus rangos de provisión activos.</p>
                    </section>
                </div>`
            },
            {
                id: "institutional-future",
                title: "5. El Futuro del Flujo Institucional: Redes Privadas y Permissioned",
                description: "Convergencia entre regulación financiera y descentralización programable.",
                readTime: 300,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Capa de Cumplimiento (Compliance Layer)</h2>
                        <p>El futuro institucional de las criptofinanzas no reside en el mempool público, sino en redes 'permissioned' (ej. Canton Network, Hyperledger Bevel) y sub-redes privadas de Ethereum. Estas plataformas integran KYT (Know Your Transaction) y AML en el nivel de protocolo, garantizando que el capital solo interactúe con contrapartes verificadas sin perder las ventajas de la ejecución atómica.</p>
                    </section>
                </div>`
            },
            {
                id: "flash-liquidity",
                title: "6. Flash-Liquidity y EIP-1153 (Transient Storage)",
                description: "Nuevos paradigmas de eficiencia en gas mediante almacenamiento efímero.",
                readTime: 280,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Costo del Estado Permanente</h2>
                        <p>Historicamente, cada actualización de balance en un AMM requería un <code>SSTORE</code> costoso (20,000 gas). Con el EIP-1153 (Transient Storage), los protocolos como Uniswap V4 pueden gestionar 'Flash Accountancy', donde los balances netos se verifican solo al final de la transacción (Settlement), permitiendo swaps multi-hop con un costo marginal cercano a cero.</p>
                    </section>
                </div>`
            },
            {
                id: "toxic-vs-informed-flow",
                title: "7. Flujo Tóxico vs Flujo Informado",
                description: "Diferenciación de tipos de órdenes y su impacto en la rentabilidad de los LPs.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Anatomía del Flujo Informado</h2>
                        <p>El flujo informado proviene de actores que poseen una ventaja de datos (ej. conocimiento de un movimiento inminente en un CEX). En el momento en que este flujo llega al AMM, el LP se convierte en un 'vendedor forzado' a un precio desactualizado. El análisis forense detecta esto mediante la correlación entre swaps de gran volumen y cambios bruscos de volatilidad en segundos previos.</p>
                    </section>
                </div>`
            },
            {
                id: "counterparty-risk",
                title: "8. Gestión de Riesgos de Contraparte On-Chain",
                description: "Evaluación de la solvencia de protocolos y el riesgo de ejecución atómica.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Riesgo del Smart Contract</h2>
                        <p>En DeFi, la contraparte no es una persona, sino un código. El riesgo de contraparte se manifiesta en fallas lógicas, reentradas o manipulación de oráculos. Para una institución, la gestión de este riesgo implica auditorías en tiempo real y sistemas de 'Circuit Breakers' que desconecten el flujo de capital si se detectan anomalías en el estado del contrato.</p>
                    </section>
                </div>`
            },
            {
                id: "governance-risk",
                title: "9. Gobernanza y Riesgo Pro-Cíclico",
                description: "Vulnerabilidades estructurales en la toma de decisiones descentralizada.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Dilema de la Gobernanza</h2>
                        <p>Los protocolos DeFi se rigen por DAOs donde el poder de voto suele estar concentrado en grandes ballenas. El riesgo pro-cíclico surge cuando las decisiones de la gobernanza (como reducir colaterales en mercados alcistas) exacerban la volatilidad. Para un analista forense, esto implica monitorear la concentración de tokens de voto y los periodos de 'timelock' para anticipar cambios de política que puedan poner en riesgo la estabilidad sistémica.</p>
                    </section>
                </div>`
            },
            {
                id: "price-impact-slippage",
                title: "10. Impacto de Precio y Deslizamiento (Slippage)",
                description: "Análisis forense de la degradación del precio de ejecución en entornos de baja liquidez.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Fenómeno del Price Impact</h2>
                        <p>El Price Impact es la variación inmediata del precio causada por el volumen de una transacción. En un AMM de producto constante, este impacto es determinista: <code>Impacto = 1 - (k / (x + Δx) * y)</code>.</p>
                    </section>
                </div>`
            },
            {
                id: "il-vs-lvr",
                title: "11. Impermanent Loss vs. Loss-Versus-Rebalancing (LVR)",
                description: "Decodificación de las métricas de rentabilidad real para proveedores de liquidez.",
                readTime: 270,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. IL: El Espejismo de la Reversión</h2>
                        <p>El Impermanent Loss (IL) mide la diferencia de valor entre mantener activos en un pool frente a holdearlos en una billetera. Sin embargo, el IL asume que el precio eventualmente volverá al punto de entrada, una premisa peligrosa en mercados direccionales donde el 'loss' se vuelve permanente.</p>
                    </section>
                </div>`
            },
            {
                id: "jit-liquidity",
                title: "12. Just-In-Time (JIT) Liquidity",
                description: "Provisión de liquidez oportunista y extracción de fees en un solo bloque.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Mecánica del Francotirador de Liquidez</h2>
                        <p>JIT Liquidity es una forma sofisticada de MEV. Cuando un searcher detecta un swap grande en el mempool, añade una cantidad ingente de liquidez en un rango extremadamente estrecho un paso antes del swap, y la retira inmediatamente después (Burn) en el mismo bloque.</p>
                    </section>
                </div>`
            },
            {
                id: "price-discovery",
                title: "13. Mecanismos de Descubrimiento de Precios",
                description: "Dinámicas de convergencia de precios entre mercados off-chain and on-chain.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El AMM como Receptor de Precios</h2>
                        <p>En el estado actual, la mayoría de los AMMs son receptores de precios (Price Takers) de exchanges centralizados como Binance. El descubrimiento de precio ocurre mediante el arbitraje atómico que 'empuja' el precio del pool hacia el equilibrio global.</p>
                    </section>
                </div>`
            },
            {
                id: "mev-aware-amms",
                title: "14. MEV-Aware AMMs (McAMM)",
                description: "Diseño de protocolos que capturan y redistribuyen el valor extraíble (MEV) a los LPs.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Fin del Arbitraje Laissez-Faire</h2>
                        <p>Los McAMMs (MEV-Capturing AMMs) integran mecanismos de subasta en el propio contrato para que el valor del 'primer trade' de un bloque sea capturado por el protocolo en lugar de por searchers externos.</p>
                    </section>
                </div>`
            },
            {
                id: "market-microstructure",
                title: "15. Microestructura del Mercado y Tick Spacing",
                description: "Dinámicas de ejecución y latencia en el emparejamiento de órdenes discretas.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Física del Order Book On-Chain</h2>
                        <p>La microestructura de un AMM V3 se asemeja a un libro de órdenes centralizado (CLOB), pero con ejecución determinista por bloque. El Tick Spacing actúa como el 'step size' del mercado.</p>
                    </section>
                </div>`
            },
            {
                id: "inventory-optimization",
                title: "16. Optimización de Inventario para CREADORES DE MERCADO",
                description: "Gestión algorítmica del balance de activos para la provisión de liquidez sostenible.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Riesgo de Inventario en AMMs</h2>
                        <p>Un creador de mercado (Market Maker) en DeFi no es neutral; su inventario fluctúa con cada trade. La optimización de inventario consiste en ajustar los rangos de liquidez para incentivar trades que devuelvan la cartera al balance deseado (Skewing).</p>
                    </section>
                </div>`
            },
            {
                id: "undercollateralized-lending",
                title: "17. Protocolos de Préstamos Undercollateralized",
                description: "Sistemas de crédito institucional basados en identidad y reputación on-chain.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Evolución del Crédito DeFi</h2>
                        <p>Los préstamos tradicionales en DeFi requieren exceso de garantía (Overcollateralized). La nueva generación (Maple, Goldfinch) permite préstamos con garantías parciales o nulas para instituciones.</p>
                    </section>
                </div>`
            },
            {
                id: "re-staking-eigenlayer",
                title: "18. Re-staking y Seguridad Compartida (EigenLayer)",
                description: "Apalancamiento de la capa de seguridad de Ethereum para servicios auxiliares.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Seguridad como Servicio (SaaS)</h2>
                        <p>EigenLayer permite a los validadores de Ethereum reutilizar su ETH stakeado para asegurar otros protocolos (AVS - Actively Validated Services).</p>
                    </section>
                </div>`
            },
            {
                id: "algo-stablecoins",
                title: "19. Stablecoins Algorítmicas y Mecanismos de Estabilidad",
                description: "Dinámicas de oferta/demanda elástica y paridad descentralizada.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. La Paridad como Equilibrio Incentivado</h2>
                        <p>Las stablecoins algorítmicas (ej. FRAX, DAI) mantienen su paridad no solo con reservas, sino mediante incentivos de arbitraje.</p>
                    </section>
                </div>`
            },
            {
                id: "concentrated-liquidity-v3",
                title: "20. Teoría de Liquidez Concentrada (Uniswap V3)",
                description: "Optimización radical del capital mediante la segmentación de ticks y rangos de ejecución.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. El Paradigma de la Densidad de Liquidez</h2>
                        <p>En Uniswap V3, la liquidez no es una función global continua, sino un conjunto de posiciones discretas en rangos de precios. La fórmula fundamental <code>L = Δy / Δ√P</code> define la cantidad de activos necesarios para mover el precio.</p>
                    </section>
                </div>`
            }
        ]
    }
];
