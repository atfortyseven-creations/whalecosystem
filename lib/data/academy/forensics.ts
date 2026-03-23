export const forensicsModules = [
    {
        id: "evm-forensics",
        title: "I. Análisis Forense de la EVM",
        description: "Reconstrucción del estado on-chain y metodologías de disección de transacciones a nivel de bytecode. 20 Módulos de Máxima Perfección.",
        articles: [
            {
                id: "yul-assembly",
                title: "1. Análisis Forense de Yul (Assembly)",
                description: "Ingeniería inversa de opcodes y manipulación de bajo nivel de la memoria. Metodologías de inyección y detección de backdoors.",
                readTime: 450,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Lenguaje de las Sombras: Arquitectura Yul</h2>
                        <p>Yul es el lenguaje ensamblador intermedio de la EVM. Permite un control granular sobre el stack y la memoria, permitiendo optimizaciones de gas que el analista forense debe desglosar para detectar lógicas ocultas. En un entorno institucional, el uso de Yul no es solo una elección de rendimiento, sino a menudo un vector para ocultar <strong>backdoors</strong> que eluden los escaneos estáticos de Solidity.</p>
                        
                        <div class="technical-deep-dive">
                            <h3>Gestión del Puntero de Memoria Libre (0x40)</h3>
                            <p>El primer paso en cualquier análisis forense de bytecode es verificar cómo el contrato gestiona el slot <code>0x40</code>. La mayoría de los exploits de memoria ocurren cuando un atacante logra corromper este puntero para sobrescribir áreas críticas del estado.</p>
                            <pre><code>// Auditoría de Slot de Memoria Libre en Yul
assembly {
    // 1. Cargar el puntero de memoria libre 
    let freeMem := mload(0x40) 
    
    // 2. Proteger el segmento contra desbordamientos
    if gt(add(freeMem, 64), 0xffffffff) { revert(0, 0) }
    
    // 3. Escribir dato atómico
    mstore(freeMem, 0x123)     
    
    // 4. Actualizar puntero de forma segura
    mstore(0x40, add(freeMem, 32)) 
}</code></pre>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Opcodes Críticos y Forense de Bajo Nivel</h2>
                        <p>Para la reconstrucción de un ataque, el analista debe rastrear la secuencia de opcodes. El uso de <code>EXTCODEHASH</code> permite verificar si una dirección de destino ha sido modificada (por ejemplo, mediante <code>CREATE2</code>) antes de ejecutar una llamada.</p>
                        
                        <div class="forensic-table">
                            <table>
                                <thead>
                                    <tr><th>Opcode</th><th>Gas</th><th>Riesgo Forense</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><code>DELEGATECALL</code></td><td>700+</td><td>Inyección de contexto externa (Crítico)</td></tr>
                                    <tr><td><code>SLOAD</code></td><td>2100*</td><td>Lectura de estado sensible / Oráculo</td></tr>
                                    <tr><td><code>SSTORE</code></td><td>20000*</td><td>Manipulación de balance / Ownership</td></tr>
                                    <tr><td><code>CREATE2</code></td><td>32000</td><td>Despliegue de contratos mutables (Metamorphic)</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <p>Un analista experto busca el patrón <code>PUSH1 0x00 / MSTORE / PUSH1 0x20 / PUSH1 0x00 / RETURN</code>. Esta secuencia es la firma de un contrato que devuelve un valor estático, a menudo usado como "Dummy" en oráculos manipulados.</p>
                    </section>

                    <section class="pro-section">
                        <h2>III. Metodología de Des-compilación Manual</h2>
                        <p>Cuando las herramientas fallan, el analista recurre a la disección del flujo de control. Identificar los <code>JUMPDEST</code> es vital para mapear las funciones del contrato. Una técnica avanzada consiste en inyectar eventos de log en el bytecode (<code>LOG1</code>, <code>LOG2</code>) para rastrear el valor del stack en tiempo real durante una simulación atómica.</p>
                    </div>`
            },
            {
                id: "gas-optimization",
                title: "2. Anatomía del Gas y Termodinámica EVM",
                description: "Optimización computacional extrema: De la termodinámica de opcodes a la manipulación del límite de bloque.",
                readTime: 420,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Termodinámica de la EVM</h2>
                        <p>El Gas es el mecanismo de defensa de la Ethereum Virtual Machine contra el problema de la parada (*Halting Problem*). Cada instrucción tiene un costo predecible en gas que refleja la carga computacional o el costo de I/O sobre el disco del estado global.</p>
                        
                        <div class="technical-box">
                            <strong>Principio de la Paridad de Estado:</strong>
                            <p>El estado (Storage) es el recurso más caro. El opcode <code>SSTORE</code> penaliza fuertemente la creación de nuevo estado (20k gas) pero ofrece devoluciones (*Gas Refunds*) al borrar estado (poniéndolo a cero), incentivando la limpieza continua de la blockchain.</p>
                        </div>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 300" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="700" height="200" fill="none" stroke="#555" />
                                <text x="400" y="40" fill="#fff" text-anchor="middle" style="font-weight: bold;">Espectro de Costes (EVM Opcode Gas Schedule)</text>
                                
                                <rect x="80" y="80" width="200" height="140" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="180" y="70" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">STORAGE</text>
                                <text x="180" y="120" fill="#fff" text-anchor="middle">SSTORE (Init) = 20k</text>
                                <text x="180" y="145" fill="#fff" text-anchor="middle">SSTORE (Mod) = 2.9k</text>
                                <text x="180" y="170" fill="#fff" text-anchor="middle">SLOAD = 2.1k</text>
                                
                                <rect x="300" y="80" width="200" height="140" fill="rgba(255,215,0,0.1)" stroke="#ffd700" stroke-width="2" />
                                <text x="400" y="70" fill="#ffd700" text-anchor="middle" style="font-weight: bold;">MEMORIA / HASH</text>
                                <text x="400" y="120" fill="#fff" text-anchor="middle">KECCAK256 = 30 + 6/word</text>
                                <text x="400" y="145" fill="#fff" text-anchor="middle">MLOAD = 3</text>
                                <text x="400" y="170" fill="#fff" text-anchor="middle">MSTORE = 3</text>
                                
                                <rect x="520" y="80" width="200" height="140" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="620" y="70" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">CÁLCULO (CPU)</text>
                                <text x="620" y="120" fill="#fff" text-anchor="middle">ADD/SUB = 3</text>
                                <text x="620" y="145" fill="#fff" text-anchor="middle">MUL/DIV = 5</text>
                                <text x="620" y="170" fill="#fff" text-anchor="middle">EXP = 10 + 50/byte</text>
                            </svg>
                            <p class="diagram-caption">Figura 6: Gradiente de consumo y cuellos de botella termodinámicos en la EVM.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Optimización Extrema en Protocolos Institucionales</h2>
                        <p>Los contratos de alto grado recurren invariablemente a optimizaciones de nivel ensamblador para reducir latencia y costo. Al deshabilitar los controles de <code>Underflow/Overflow</code> (presentes desde Solidity 0.8.0), los bucles de alta frecuencia se vuelven radicalmente eficientes.</p>
                        <pre><code>// Optimización No Segura (*Unchecked*) de bucle: Ahorro de ~200 gas por iteración
uint256 length = data.length;
for (uint256 i = 0; i < length;) {
    _process(data[i]);
    unchecked { i++; } // Elude el pre-cálculo O(1) de límites
}</code></pre>
                        <p><strong>Riesgo Forense:</strong> Un bloque <code>unchecked</code> abusado intencionalmente o por ignorancia es la principal causa documentada de drenaje de fondos por overflows inversos (provocando que el balance salte del 0 al <code>uint256.max</code>).</p>
                    </section>
                </div>`
            },
            {
                id: "proxy-patterns",
                title: "3. Arquitecturas Modificables (Proxy Patterns)",
                description: "Ingeniería de actualización y colisiones de almacenamiento: De EIP-1967 al Diamond Standard.",
                readTime: 480,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Slot de Implementación: La Anatomía del EIP-1967</h2>
                        <p>La seguridad de un Proxy depende enteramente de la segregación de su almacenamiento. Para evitar colisiones con las variables de estado de la implementación, el estándar EIP-1967 define slots específicos derivados de hashes keccak256, situados en el extremo superior del espacio de storage (casi 2^256).</p>
                        
                        <div class="technical-box">
                            <strong>Slot Crítico de Implementación:</strong>
                            <code class="block">0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc</code>
                            <p>Este valor es <code>keccak256("eip1967.proxy.implementation") - 1</code>. Cualquier intento de una implementación de escribir en este slot resultará en la toma de control del ruteo del proxy.</p>
                        </div>

                        <pre><code>// Auditoría Forense: Detección de Colisión de Slots
// Un analista busca variables declaradas en el Slot 0 de la implementación
// que coincidan con el Slot 0 del Proxy (Admin/Ownership).
assembly {
    let impl := sload(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)
    if iszero(impl) { revert(0, 0) }
}</code></pre>
                    </section>

                    <section class="pro-section">
                        <h2>II. UUPS vs Transparent: Matriz de Riesgo Institucional</h2>
                        <p>La arquitectura <strong>Transparent Proxy</strong> utiliza un contrato Admin para discernir la autoridad, mientras que <strong>UUPS</strong> traslada la lógica de actualización a la propia implementación.</p>
                        
                        <div class="comparison-grid">
                            <div class="grid-item">
                                <h3>Transparent</h3>
                                <ul>
                                    <li>Mayor coste de Gas por call (+700)</li>
                                    <li>Inmune a colisiones de selectores</li>
                                    <li>Seguridad pasiva elevada</li>
                                </ul>
                            </div>
                            <div class="grid-item">
                                <h3>UUPS</h3>
                                <ul>
                                    <li>Gasto mínimo de Gas</li>
                                    <li>Riesgo de "Brick" (congelación)</li>
                                    <li>Requiere lógica de upgrade en impl</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>III. Diamond Standard (EIP-2535): La Fragmentación de la Soberanía</h2>
                        <p>Para protocolos que exceden el límite de 24KB, el Diamond Standard mapea selectores de función a múltiples "Facets". El riesgo forense aquí se desplaza al ruteo de 4 bytes.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <defs>
                                    <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#4d94ff;stop-opacity:0.2" />
                                        <stop offset="100%" style="stop-color:#4d94ff;stop-opacity:0.05" />
                                    </linearGradient>
                                </defs>
                                <polygon points="400,30 480,110 400,190 320,110" fill="url(#diamondGrad)" stroke="#4d94ff" stroke-width="2" />
                                <text x="400" y="115" fill="#fff" text-anchor="middle" style="font-size: 14px; font-weight: bold;">DIAMOND PROXY</text>
                                
                                <path d="M480 110 L600 60" stroke="#4dff88" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrowhead)" />
                                <text x="620" y="65" fill="#4dff88" style="font-size: 11px;">Facet: SwapLogic.sol</text>
                                
                                <path d="M480 110 L600 160" stroke="#4dff88" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrowhead)" />
                                <text x="620" y="165" fill="#4dff88" style="font-size: 11px;">Facet: Governance.sol</text>
                                
                                <path d="M320 110 L200 110" stroke="#ff4d4d" stroke-width="3" marker-end="url(#arrowhead)" />
                                <text x="100" y="115" fill="#ff4d4d" style="font-size: 12px; font-weight: bold;">INYECCIÓN MALICIOSA (🚨)</text>
                            </svg>
                            <p class="diagram-caption">Figura 14: Vector de compromiso mediante manipulación de DiamondCut (Selector Hijacking).</p>
                        </div>
                        
                        <p>Un analista debe auditar la función <code>diamondCut</code>. Si el administrador es una EOA o una Multisig sin timelock, el protocolo puede ser secuestrado en un solo bloque mediante la sustitución de una Facet crítica por una que contenga una puerta trasera de drenaje de fondos.</p>
                    </section>
                </div>`
            },
            {
                id: "signature-replay",
                title: "4. Ataques de Replay de Firmas (EIP-712)",
                description: "Criptografía de mensajes firmados, maleabilidad ECDSA y la protección matemática EIP-712.",
                readTime: 380,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Geometría de la Firma Offline</h2>
                        <p>Las firmas criptográficas <em>Off-Chain</em> (Gasless) permiten autorizar liquidez sin desembolsar comisiones de red inmediatas. Sin embargo, si la firma no se ancla firmemente a las dimensiones espacio-temporales de la red (Chain ID) y la entidad (Dirección), un atacante la replicará como si fuese un cheque en blanco.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="250" height="120" fill="none" stroke="#4d94ff" stroke-width="2" />
                                <text x="175" y="80" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">ORIGIN (Mainnet)</text>
                                <text x="175" y="110" fill="#fff" text-anchor="middle">Msg: "Transfer 50K USDC"</text>
                                <text x="175" y="140" fill="#4dff88" text-anchor="middle">Signature (v, r, s)</text>
                                
                                <path d="M300 110 L480 110" stroke="#ff4d4d" stroke-width="3" stroke-dasharray="4" marker-end="url(#arrowhead)" />
                                <text x="390" y="100" fill="#ff4d4d" text-anchor="middle" style="font-size: 11px;">REPLAY ATTACK</text>
                                
                                <rect x="500" y="50" width="250" height="120" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="625" y="80" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">DESTINATION (Optimism)</text>
                                <text x="625" y="110" fill="#fff" text-anchor="middle">Msg: "Transfer 50K USDC"</text>
                                <text x="625" y="140" fill="#4dff88" text-anchor="middle">Signature VALID (Identical)</text>
                                <text x="625" y="160" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">Double-Spend Executed</text>
                            </svg>
                            <p class="diagram-caption">Figura 10: Ataque de réplica entre cadenas por falta de anclaje de ChainID de Capa 2.</p>
                        </div>
                    </section>
                    
                    <section class="pro-section">
                        <h2>II. Blindaje mediante TypeData (EIP-712)</h2>
                        <p>El estándar EIP-712 de Ethereum introduce la magia del <code>DOMAIN_SEPARATOR</code>. Actúa como un muro de contención criptográfico que empareja irremediablemente el Hash del Mensaje con el nombre del protocolo, la cadena exacta, y la dirección del verificador.</p>
                        
                        <pre><code>// Implementación Profesional del Domain Separator
bytes32 public constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

bytes32 public immutable DOMAIN_SEPARATOR;

constructor() {
    DOMAIN_SEPARATOR = keccak256(abi.encode(
        DOMAIN_TYPEHASH,
        keccak256(bytes("Sovereign Intelligence")),
        keccak256(bytes("1.0.0")),
        block.chainid,    // [!] Defensa contra Cross-Chain Replay
        address(this)     // [!] Defensa contra Cross-Contract Replay
    ));
}</code></pre>
                        
                        <h3>Maleabilidad de la Firma (ECDSA Malleability)</h3>
                        <p>El análisis más sofisticado revela fallos en el valor <code>s</code>. En la matemática de las curvas elípticas, para cualquier firma legítima <code>(v, r, s)</code>, también existe una firma simétrica <code>(v', r, N - s)</code> que es numéricamente distinta pero matemáticamente válida. Si el contrato admite cualquier <code>s</code>, el atacante puede invalidar el <em>Nonce</em> gastándolo primero. Solo firmas de la *mitad inferior* de la curva son seguras según EIP-2.</p>
                    </section>
                </div>`
            },
            {
                id: "frontrunning-arbitrage",
                title: "5. Back-Running y Arbitraje Atómico Institucional",
                description: "Extracción de Maximizador de Valor (MEV) mediante Searchers e infraestructura Flashbots.",
                readTime: 450,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Arquitectura Avanzada de Back-Running</h2>
                        <p>El **Back-running** consiste en inyectar una transacción de forma paramétrica inmediatamente *después* de una transacción gigantesca de una Ballena. No compite por el gas o la prioridad máxima del bloque, sino que analiza el estado futuro alterado que generará la ballena y prepara la orden perfecta para barrer los desequilibrios de precios.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="90" width="180" height="70" fill="rgba(77,148,255,0.2)" stroke="#4d94ff" stroke-width="2" />
                                <text x="140" y="125" fill="#fff" text-anchor="middle" style="font-weight:bold;">TX_0: Whale Drop</text>
                                <text x="140" y="145" fill="#4d94ff" text-anchor="middle" style="font-size: 11px;">$10M ETH Dump (Slippage 5%)</text>
                                
                                <path d="M230 125 L340 125" stroke="#fff" marker-end="url(#arrowhead)" stroke-width="2" stroke-dasharray="4" />
                                
                                <rect x="340" y="90" width="200" height="70" fill="rgba(255,166,0,0.2)" stroke="#ffa600" stroke-width="2" />
                                <text x="440" y="125" fill="#fff" text-anchor="middle" style="font-weight:bold;">TX_1: DEX Imbalance</text>
                                <text x="440" y="145" fill="#ffa600" text-anchor="middle" style="font-size: 11px;">Price ETH = $2,500 📉</text>
                                
                                <path d="M540 125 L600 125" stroke="#fff" marker-end="url(#arrowhead)" stroke-width="2" stroke-dasharray="4" />

                                <rect x="600" y="50" width="150" height="150" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="675" y="125" fill="#4dff88" text-anchor="middle" style="font-weight:bold;">TX_2: MEV Bot</text>
                                <text x="675" y="145" fill="#fff" text-anchor="middle" style="font-size: 11px;">Buy Deep Discount</text>
                                <text x="675" y="165" fill="#4dff88" text-anchor="middle" style="font-size: 11px;">Sell to Binance Arbc</text>
                            </svg>
                            <p class="diagram-caption">Figura 11: Encapsulación secuencial atómica (Bundling) post-dump.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. The Builder Entity y Flashbots Bundle</h2>
                        <p>Los MEV Searchers (las granjas de servidores que rastrean estas oportunidades) no emiten transacciones públicas. Si lo hicieran, el Mempool P2P les copiaría la orden y perderían el dinero (*Generalized Front-runner Bots*). Institucionalmente, construyen paquetes llamados <strong>Bundles</strong>.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Poder Arquitectónico del Bundle</th>
                                        <th>Mitigación de Riesgos Forenses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Orden Aleatorio Prohibido:</strong> Estructura fija de ejecución.</td>
                                        <td>Si otra persona mueve el bloque antes, el bundle aborta. Cero pérdidas.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Reversiones Simuladas:</strong> Si el balance PnL final es 0, hacer Revert.</td>
                                        <td>El Bot nunca pierde Gas (*Gasless failures*). Flashbots ignora TX inválidas.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <pre><code>// Pseudocódigo Cuántico de Smart Contract Arbitrador
function executeFlashArbitrage(bytes memory payload) external {
    uint256 balanceBefore = weth.balanceOf(address(this));
    
    // Ejecuta el flujo dictado por el servidor Off-Chain
    (bool success, ) = targetDex.call(payload);
    require(success, "Routing failed");
    
    // Mecanismo "Revert o Gana"
    uint256 balanceAfter = weth.balanceOf(address(this));
    require(balanceAfter > balanceBefore + MIN_PROFIT, "Negative PnL: Abort Atómico");
    
    // Paga al minero (Builder) el 90% del profit vía transferencia de bloque (coinbase)
    block.coinbase.transfer(profit * 90 / 100); 
}</code></pre>
                    </section>
                </div>`
            },
            {
                id: "dos-attacks",
                title: "6. Denegación de Servicio (DoS) Estructural",
                description: "Vulnerabilidades por agotamiento de recursos y bloqueos de lógica lógica.",
                readTime: 210,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Agotamiento del Block Gas Limit (Gas Poisoning)</h2>
                        <p>Un contrato puede quedar permanentemente inoperable si una función crítica (e.g., distribución de recompensas o liquidación masiva) itera sobre un array que crece sin límites orgánicos. El analista forense debe auditar las estructuras de datos dinámicas en busca de "venenos de gas" donde el coste de ejecución teórica supere el límite duro del bloque de Ethereum (actualmente ~30M de gas), haciendo que el protocolo entre en un estado de congelación criptográfica.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Vector de Crecimiento</th>
                                        <th>Costo Marginal</th>
                                        <th>Punto de Ruptura (DoS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Iteración de <code>address[]</code> + Transferencia Externa</td>
                                        <td>~7,500 a 10,000 gas/it</td>
                                        <td>~3,000 elementos</td>
                                    </tr>
                                    <tr>
                                        <td>Iteración de <code>uint256[]</code> + Múltiples SLOAD/SSTORE</td>
                                        <td>~25,000 gas/it</td>
                                        <td>~1,200 elementos</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="700" height="40" fill="#333" stroke="#555" stroke-width="2" />
                                <rect x="50" y="50" width="550" height="40" fill="rgba(255,77,77,0.4)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="400" y="75" fill="#fff" text-anchor="middle" style="font-weight: bold;">Gas consumed by unbounded loop iteration N</text>
                                <line x1="600" y1="20" x2="600" y2="120" stroke="#ff4d4d" stroke-width="3" stroke-dasharray="6" />
                                <text x="610" y="110" fill="#ff4d4d" style="font-weight: bold; font-size: 12px;">BLOCK GAS LIMIT REACHED (TRANSACTION REVERTS CONSTANTLY)</text>
                                
                                <path d="M400 90 L400 140" stroke="#4d94ff" marker-end="url(#arrowhead)" stroke-width="2" />
                                <rect x="250" y="145" width="300" height="50" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="400" y="175" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">FONDOS CONGELADOS PERPETUAMENTE</text>
                            </svg>
                            <p class="diagram-caption">Figura 12: Bloqueo de ejecución irreversible por crecimiento asintótico de estructuras de datos.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Patrón Institucional Pull-Over-Push (Aislamiento de Fallos)</h2>
                        <p>Para mitigar el DoS por reversión forzada (e.g., un receptor malicioso que implementa un <code>fallback()</code> que siempre hace <code>revert</code>), la arquitectura institucional exige el patrón <strong>Pull Payment</strong>. En lugar de que el contrato "empuje" (Push) fondos o tokens a una lista iterativa de usuarios, el estado del protocolo solo emite recibos contables, y cada actor debe reclamar su parte individualmente (Pull). Esto acoraza al contrato, garantizando que el fallo intencionado de un solo actor hostil no secuestre la ejecución lógica para el resto de la bóveda.</p>
                    </section>
                </div>`
            },
            {
                id: "tx.origin-abuse",
                title: "7. El Engaño Phishing de tx.origin",
                description: "Suplantación de identidad mediante la manipulación de la cadena de llamadas del sistema.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Anatomía de la Suplantación de la Raíz Ejecutora</h2>
                        <p>En la arquitectura de la Ethereum Virtual Machine, existen dos apuntadores contextuales sobre el llamante de una función: <code>msg.sender</code> (el emisor directo, que puede ser un contrato proxy u otra lógica) y <code>tx.origin</code> (la raíz absoluta, siempre una entidad criptográfica humana o EOA que firmó la transacción inicial). Usar <code>tx.origin</code> para validaciones de autorización institucionales es la negligencia fundamental que permite la Suplantación por Cadena de Llamadas (Call Chain Spoofing).</p>
                        
                        <pre><code>// 🚨 CÓDIGO VULNERABLE INSTITUCIONALMENTE
function withdrawAll() external {
    // Si la wallet de la víctima (EOA) originó la transacción, pasa la validación,
    // INCLUSO si la llamada real a withdrawAll() la está haciendo un smart contract malicioso intermedio.
    require(tx.origin == owner, "Acceso Denegado: Suplantacion"); 
    payable(owner).transfer(address(this).balance);
}</code></pre>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 240" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="80" cy="120" r="40" fill="rgba(77,148,255,0.2)" stroke="#4d94ff" stroke-width="2" />
                                <text x="80" y="125" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Victim EOA</text>
                                <text x="80" y="100" fill="#fff" text-anchor="middle" style="font-size: 10px;">tx.origin</text>
                                
                                <path d="M125 90 L275 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="200" y="80" fill="#fff" text-anchor="middle" style="font-size: 11px;">1. Phishing Interaction</text>
                                
                                <rect x="290" y="60" width="180" height="120" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="380" y="115" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Attacker Contract</text>
                                <text x="380" y="135" fill="#fff" text-anchor="middle" style="font-size: 10px;">(Toma el control del flujo)</text>
                                
                                <path d="M475 90 L615 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="545" y="80" fill="#fff" text-anchor="middle" style="font-size: 11px;">2. Internal Call</text>
                                
                                <rect x="630" y="60" width="150" height="120" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="705" y="115" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Target Vault</text>
                                <text x="705" y="135" fill="#fff" text-anchor="middle" style="font-size: 10px;">Validates tx.origin ✅</text>
                                <text x="705" y="155" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">FUNDS DRAINED 🚨</text>
                            </svg>
                            <p class="diagram-caption">Figura 16: Flujo de manipulación cruzada explotando la persistencia de tx.origin en todo el árbol de llamadas.</p>
                        </div>
                    </section>
                    <section class="pro-section">
                        <h2>II. Excepción Permitida: Defensa contra Contratos Intermedios</h2>
                        <p>La única aplicación legítima en auditoría de grado bancario para <code>tx.origin</code> es construir una muralla de fuego técnica contra cualquier interacción que no provenga directamente de una firma humana. La aserción <code>require(tx.origin == msg.sender)</code> garantiza herméticamente que la entidad que interactúa es estrictamente un humano y anula el acceso a cualquier Flash Loan, Aggregator o Smart Contract intermediario.</p>
                    </section>
                </div>`
            },
            {
                id: "uninitialized-proxies",
                title: "8. Explotación de Proxies no Inicializados",
                description: "Análisis de seguridad en la fase de despliegue de implementaciones modulares.",
                readTime: 230,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Paradoja de la Implementación Soberana</h2>
                        <p>En el diseño de arquitecturas delegadas (Proxies), la lógica pura del protocolo reside en un contrato de <strong>Implementación (Logic Contract)</strong>. Puesto que el proxy invoca constructores en su propio contexto de almacenamiento mediante <code>delegatecall</code>, el contrato lógico base queda inherentemente desinicializado y vulnerable como una carcasa vacía. Si no se sella tras su despliegue, un atacante puede invocar la función <code>initialize()</code> directamente sobre la Implementación, tomando posesión absoluta de la lógica subyacente.</p>
                        
                        <pre><code>// Sello Profesional de Implementaciones (OpenZeppelin >4.6.0)
/// @custom:oz-upgrades-unsafe-allow constructor
constructor() {
    // Al bloquear la inicialización en el constructor de la lógica,
    // se asegura matemáticamente que nadie, nunca, podrá inicializar el contrato lógico directamente.
    _disableInitializers(); 
}</code></pre>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Protocolo de Autodestrucción en Cascada (The Nomad / UUPS Vector)</h2>
                        <p>En un modelo asimétrico como UUPS, la gobernanza de actualización reside en la propia Implementación de la Lógica. Si un atacante asume el estado de propietario de dicha implementación (debido a la omisión mencionada en la fase I), posee la autorización suficiente para invocar una actualización o ejecutar operaciones arbitrarias. El escuadrón forense analiza especialmente el vector de <code>delegatecall</code> inyectado con un <code>selfdestruct</code>.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 180" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="200" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="150" y="70" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Proxy Factory</text>
                                <text x="150" y="90" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Contiene $100M TVL)</text>
                                <text x="150" y="110" fill="#fff" text-anchor="middle" style="font-size: 11px;">Ruta -> Impl Logic</text>
                                
                                <path d="M250 90 L450 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="3" stroke-dasharray="4" />
                                <text x="350" y="80" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 11px;">Delegatecall Ruteado a Vacío</text>
                                
                                <rect x="450" y="40" width="300" height="100" fill="rgba(255,77,77,0.2)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="600" y="80" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Implementation Logic</text>
                                <text x="600" y="100" fill="#fff" text-anchor="middle" style="font-size: 12px;">DESTROYED via SELFDESTRUCT 🗑️</text>
                                <text x="600" y="120" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">Fallback Reverts. All assets frozen permanently.</text>
                            </svg>
                            <p class="diagram-caption">Figura 17: Colapso sistémico catastrófico "Brick" por la eliminación del contrato fuente.</p>
                        </div>
                    </section>
                </div>`
            },
            {
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Liquidez Efímera y Emisión Atómica (EIP-3156)</h2>
                        <p>El **Flash Minting** representa un paradigma criptoeconómico donde un usuario puede acuñar (emitir) matemáticamente una cantidad infinita de tokens dentro del ciclo de vida de una sola transacción, asumiendo la quema o devolución atómica en la misma. A diferencia del <em>Flash Loan</em> que está limitado a las reservas estáticas de un pool (ej. Aave o Uniswap), un Flash Mint explota la elasticidad nativa del propio contrato del Token. Si el contrato implementa <code>ERC20FlashMint</code>, la liquidez es teóricamente infinita (<code>type(uint256).max</code>).</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Riesgo Forense: Subversión Democrática y Gobernanza</h2>
                        <p>El vector de ataque primario de un Flash Mint es el secuestro del poder de gobernanza. Muchos protocolos calculan el derecho de voto (Voting Power) leyendo el balance del usuario en bloque actual <code>balanceOf(user)</code>.</p>
                        
                        <div class="technical-box">
                            <strong>Flujo de Ataque del Préstamo de Gobernanza:</strong>
                            <ol>
                                <li>El atacante (Bot Inteligente) invoca <code>flashFee()</code> para conocer el costo de la emisión.</li>
                                <li>Emite 50 Millones de Tokens de Gobernanza (Flash Mint).</li>
                                <li>Vota una propuesta maliciosa (ej. <em>"Transferir toda la tesorería corporativa a la dirección del atacante"</em>).</li>
                                <li>Destruye los 50 Millones de Tokens (Quema) + Paga el Fee nominal. Todo en el mismo bloque Ethereum.</li>
                            </ol>
                        </div>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="180" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="140" y="80" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Block N (Start)</text>
                                <text x="140" y="105" fill="#fff" text-anchor="middle" style="font-size: 11px;">Attacker Balance: 0</text>
                                
                                <path d="M230 100 L320 100" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="275" y="90" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 10px;">FLASH MINT</text>
                                
                                <rect x="320" y="50" width="180" height="100" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" />
                                <text x="410" y="80" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">Block N (Mid-Execution)</text>
                                <text x="410" y="105" fill="#fff" text-anchor="middle" style="font-size: 11px;">Attacker Balance: 50M</text>
                                <text x="410" y="125" fill="#ffa600" text-anchor="middle" style="font-size: 11px;">VOTES "YES" ON PROPOSAL</text>
                                
                                <path d="M500 100 L590 100" stroke="#4dff88" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="545" y="90" fill="#4dff88" text-anchor="middle" style="font-weight: bold; font-size: 10px;">BURN</text>
                                
                                <rect x="590" y="50" width="180" height="100" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="680" y="80" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Block N (End)</text>
                                <text x="680" y="105" fill="#fff" text-anchor="middle" style="font-size: 11px;">Attacker Balance: 0</text>
                                <text x="680" y="125" fill="#fff" text-anchor="middle" style="font-size: 11px;">TREASURY DRAINED</text>
                            </svg>
                            <p class="diagram-caption">Figura 19: Distorsión estructural mediante la acuñación instantánea intra-bloque para elusión de votaciones.</p>
                        </div>
                        
                        <p><strong>Defensa Arquitectónica:</strong> Todo sistema de votación de grado institucional debe auditar <code>getPastVotes()</code> de OpenZeppelin, que consulta los Checkpoints estadísticos en bloques <em>anteriores</em> (e.g. <code>block.number - 1</code>), volviendo ciego al contrato frente a manipulaciones de balance presentes en el mismo bloque operativo.</p>
                    </section>
                </div>`
            },
            {
                id: "mempool-heuristics",
                title: "10. Heurísticas Avanzadas de Mempool",
                description: "Inteligencia predictiva y decodificación paramétrica de vectores de ataque en vuelo.",
                readTime: 460,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Red P2P y el Dark Forest (Bosque Oscuro)</h2>
                        <p>El Mempool (Memory Pool) no es una entidad central; es una red descentralizada de nodos que mantienen transacciones no confirmadas en RAM pura. En este ecosistema, conocido como el "Bosque Oscuro", los analistas forenses y los bots depredadores emplean heurísticas avanzadas de decodificación ABI en tiempo real. Monitorean la firma del calldata de las transacciones no ofuscadas buscando funciones como <code>swapExactTokensForETH</code> asociadas a grandes volúmenes de capital.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Arquitectura Anti-Forensics y Ofuscación Espacial (Flashbots)</h2>
                        <p>Para evadir la observación de Mempool Pública, las instituciones y los hackers profesionales utilizan <strong>Mempools Privadas</strong> e infraestructuras de subasta de bloque como <em>MEV-Boost / FlashbotsBuilder</em>. Esto significa que la transacción nunca se transmite al P2P; se envía directamente por API HTTPS al servidor del Block Builder. Cuando un analista está haciendo ingeniería inversa a un ataque crítico y descubre que la transacción no existe en los logs del mempool global, sabe inmediatamente que se trata de un <strong>Targeted Private Exploit</strong>.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 240" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="150" cy="120" r="100" fill="rgba(77,148,255,0.05)" stroke="#4d94ff" stroke-width="2" stroke-dasharray="8,4" />
                                <text x="150" y="50" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Public Mempool</text>
                                <circle cx="120" cy="90" r="6" fill="#fff" />
                                <circle cx="180" cy="110" r="6" fill="#fff" />
                                <circle cx="140" cy="160" r="6" fill="#ff4d4d" />
                                <text x="140" y="180" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">Frontrunner Bots 👁️</text>

                                <rect x="350" y="70" width="100" height="100" fill="none" stroke="#ffa600" stroke-width="4" rx="10" />
                                <text x="400" y="115" fill="#ffa600" text-anchor="middle" style="font-weight: bold; font-size: 12px;">MEV Builder</text>
                                <text x="400" y="135" fill="#fff" text-anchor="middle" style="font-size: 10px;">(Dark Node)</text>

                                <path d="M450 120 L600 120" stroke="#4dff88" marker-end="url(#arrowhead)" stroke-width="3" />
                                <rect x="620" y="70" width="140" height="100" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" rx="10" />
                                <text x="690" y="115" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Ethereum Block</text>
                                <text x="690" y="135" fill="#fff" text-anchor="middle" style="font-size: 10px;">Inclusion Garantizada</text>
                                
                                <path d="M400 30 Q400 -20 620 -20 Q700 -20 700 70" fill="none" stroke="#ff4d4d" stroke-dasharray="6,4" stroke-width="2" marker-end="url(#arrowhead)" />
                                <text x="550" y="0" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 11px;">Private RPC Relay (No P2P Gossip)</text>
                            </svg>
                            <p class="diagram-caption">Figura 18: Ruta de ofuscación de transacciones usando constructores de bloques privados.</p>
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
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Dinámica de Fluidos Criptoeconómicos</h2>
                        <p>La economía de un token opera bajo leyes hidrodinámicas de oferta y demanda programada. El <em>Circulating Supply</em> no es una cifra estática, sino una curva integral que obedece a contratos de <strong>Vesting</strong> (liberación paulatina). Las instituciones analizan la "Presión Metabólica de Venta": si el ritmo de emisión (Inflación/Desbloqueo) supera la capacidad de absorción de liquidez de los AMMs cruzados (como Uniswap V3), el precio colapsará matemáticamente independientemente del sentimiento de mercado.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 300" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <path d="M50 250 Q200 230 350 150 T700 50" fill="none" stroke="#4d94ff" stroke-width="4" />
                                <text x="700" y="40" fill="#4d94ff" style="font-weight: bold;">Supply Circulante (Curva de Emisión)</text>
                                
                                <line x1="200" y1="260" x2="200" y2="100" stroke="#ff4d4d" stroke-dasharray="4" stroke-width="2" />
                                <text x="200" y="280" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 11px;">TGE / Cliff Expiration</text>
                                
                                <rect x="450" y="160" width="160" height="40" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="530" y="185" fill="#4dff88" text-anchor="middle" style="font-weight: bold; font-size: 11px;">Mecanismo Sink (Burn/veToken Lock)</text>
                                
                                <path d="M530 210 L530 260" stroke="#4dff88" stroke-dasharray="2" stroke-width="3" marker-end="url(#arrowhead-green)" />
                                <text x="630" y="240" fill="#4dff88" style="font-size: 10px;">Presión Deflacionaria</text>
                                
                                <defs>
                                    <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#4dff88" />
                                    </marker>
                                </defs>
                            </svg>
                            <p class="diagram-caption">Figura 5: Geometría de la interacción entre la onda de emisión (Vesting) y los sumideros termodinámicos (Sinks).</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Patrón "Vote-Escrowed" (veTokens) y el Agujero Negro de Liquidez</h2>
                        <p>Para mitigar la toxicidad de las emisiones mercenarios (Farm & Dump), los arquitectos institucionales desarrollaron el modelo <strong>veTokenomics</strong> (popularizado por Curve Finance). Consiste en obligar a los usuarios a bloquear su capital por hasta 4 años a cambio de multiplicadores de rendimiento y poder de gobernanza. El analista evalúa la eficiencia de este <em>Sink</em> (Sumidero): si el protocolo logra que más del 50% de su circulante entre en un estado de parálisis criptográfica ('Locked'), se crea un choque de oferta (Supply Shock) que favorece monopolios de agregadores de retornos estratégicos como Convex.</p>
                    </section>
                </div>`
            },
            {
                id: "storage-slots",
                title: "12. Manipulación de Slots de Memoria y Colisiones",
                description: "Arquitectura del Storage Layout: De la herencia lineal a la colisión de mappings multi-capa.",
                readTime: 220,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Topografía del Memoria Ethereum (Storage Layout)</h2>
                        <p>A diferencia de la RAM convencional con malloc/free dinámico, el <em>Storage Root</em> de un Smart Contract en la EVM es una matriz estática gigantesca de $2^{256}$ slots pre-determinados. La asignación de variables sigue un orden de declaración estricto (0, 1, 2...). El analista de seguridad debe trazar la alineación de bytes: Solidity intentará empaquetar variables más pequeñas (ej. <code>uint128</code> y <code>uint128</code>) en un solo slot de 32 bytes de forma automática para ahorrar los 20,000 gas del <code>SSTORE</code>.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="300" height="40" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="200" y="75" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">[Slot 0] address owner (20 bytes)</text>
                                <text x="50" y="45" fill="#fff" style="font-size: 10px;">Packed Slot (20 bytes used, 12 available)</text>

                                <rect x="50" y="100" width="300" height="40" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="200" y="125" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">[Slot 1] mapping(address=>uint) balances</text>
                                
                                <path d="M350 120 L450 120" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="2" stroke-dasharray="4" />
                                
                                <rect x="450" y="100" width="300" height="60" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="600" y="125" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 11px;">Keccak256(key . Slot 1)</text>
                                <text x="600" y="145" fill="#fff" text-anchor="middle" style="font-size: 10px;">Derivación de Slot Dinámico</text>
                            </svg>
                            <p class="diagram-caption">Figura 4: Árbol de empaquetado lineal y derivación probabilística de mappings.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Catástrofe de Colisión en Contratos Proxies</h2>
                        <p>El error más devastador de la herencia profunda ocurre en arquitecturas actualizables (Proxies). Si un proxy lee la variable <code>owner</code> en su <code>Slot 0</code> interno, pero el contrato <em>Implementation</em> declara en su primera línea <code>uint256 totalAssets</code>, ambas lógicas colisionarán. Escribir en <code>totalAssets</code> sobrescribirá la dirección del administrador, tomando el control total del protocolo de facto. Esta es la razón técnica existencial por la que se inventó el <strong>EIP-1967</strong> y el paradigma del <strong>Diamond Storage</strong> estructurado vía punteros hash arbitrarios.</p>
                    </section>
                </div>`
            },
            {
                id: "fixed-point-math",
                title: "13. Pérdida de Precio Cuantitativa",
                description: "Aritmética de punto fijo y vulnerabilidades por errores de redondeo.",
                readTime: 210,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Desafío del Determinismo Decimal</h2>
                        <p>A diferencia de lenguajes tradicionales como C++ o Python, Solidity e Yul carecen de soporte nativo para números de punto flotante (<code>float</code>/<code>double</code>). El consenso distribuido de cientos de miles de nodos requiere determinismo absoluto; las variables de punto flotante de la CPU pueden arrojar mínimas discrepancias de nanosegundos debido a las arquitecturas de hardware subyacentes. En su lugar, la EVM emplea Aritmética Dinámica de Punto Fijo, escalando masivamente los números por magnitudes de <code>10^18</code> (Wei).</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Pérdida de Precio Cuantitativa (Precision Loss) en Pool Shares</h2>
                        <p>El vector de ataque matemático más lucrativo en DeFi es la pérdida de precisión por el orden de operaciones. Las matemáticas de punto fijo exigen que la multiplicación ocurra <strong>antes</strong> que la división (<code>(A * C) / B</code>) para preservar el numerador. Si el código ejecuta <code>(A / B) * C</code> y <code>A</code> es ligeramente menor a <code>B</code>, la división trunca automáticamente a cero en Solidity, vaporizando el valor resultante y abriendo la puerta a "Ataques de Donación de Bóveda" (Vault Donation Attacks - ERC4626).</p>
                        
                        <div class="diagram-container">
                            <pre style="text-align: left; display: inline-block; padding: 15px; background: #1a1a1a; border-left: 4px solid #ffca28; color: #e6e6e6; font-family: monospace; font-size: 13px;">
<span style="color: #6c757d;">// Análisis Forense de Vulnerabilidad en Cálculo de Acciones (Shares)</span>
<span style="color: #6c757d;">// Si user = 100 wei, assets = 1000 wei, supply = 1010 wei</span>

<span style="color: #ff4d4d; font-weight: bold;">// 🚨 VULNERABLE: Redondeo a Cero (Trucation)</span>
uint256 sharePrice = totalAssets / totalSupply; <span style="color: #ff4d4d;">// 1000 / 1010 = 0</span>
uint256 userShares = amount * sharePrice; <span style="color: #ff4d4d;">// 100 * 0 = 0 (Usuario pierde fondos)</span>

<span style="color: #4dff88; font-weight: bold;">// ✅ GRADO INSTITUCIONAL: Multiplicación Pre-Escalada</span>
uint256 userSharesSafe = (amount * totalSupply) / totalAssets;
<span style="color: #4dff88;">// (100 * 1010) / 1000 = 101000 / 1000 = 101 shares justificados</span>
                            </pre>
                            <p class="diagram-caption">Figura 8: Anatomía de truncamiento y prevención algorítmica de robos de precisión en Automated Market Makers (AMMs) y Vaults.</p>
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
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Ambigüedad de los 4 Bytes (Function Selector)</h2>
                        <p>La EVM carece de concepto de nombres de funciones estandarizadas (strings) en tiempo de ejecución. Identifica y rutea las llamadas internas interpretando estricta y únicamente los primeros 4 bytes generados al aplicar el hash criptográfico <code>Keccak256</code> a la firma de la función (e.g., el hash hexadecimal de <code>transfer(address,uint256)</code> es <code>0xa9059cbb</code>). Matemáticamente, 4 bytes solo ofrecen ~4.29 mil millones ($2^{32}$) de combinaciones. Resulta trivial programar diccionarios <em>Rainbow</em> para encontrar strings diferentes y maliciosos que generen el mismo hash de 4 bytes.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 180" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="220" height="40" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="160" y="65" fill="#4d94ff" text-anchor="middle" style="font-weight: bold; font-family: monospace;">withdrawAll()</text>
                                <path d="M270 60 L350 70" stroke="#fff" stroke-dasharray="2,2" />
                                
                                <rect x="50" y="100" width="220" height="40" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="160" y="125" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-family: monospace;">burnGovernance(uint)</text>
                                <path d="M270 120 L350 110" stroke="#fff" stroke-dasharray="2,2" />
                                
                                <rect x="350" y="60" width="150" height="60" fill="none" stroke="#ffa600" stroke-width="3" />
                                <text x="425" y="90" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">0x12345678</text>
                                <text x="425" y="110" fill="#fff" text-anchor="middle" style="font-size: 10px;">Selectores Colisionados</text>

                                <path d="M500 90 L600 90" stroke="#fff" stroke-width="3" marker-end="url(#arrowhead)" />
                                
                                <rect x="620" y="60" width="150" height="60" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="695" y="85" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Proxy Dispatcher</text>
                                <text x="695" y="105" fill="#fff" text-anchor="middle" style="font-size: 10px;">Rutea ciegamente</text>
                            </svg>
                            <p class="diagram-caption">Figura 14: Confusión de enrutador en arquitecturas Modulares/Proxy debido al truncamiento a 4 bytes.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Explotación del Fallback Fantasma en Proxies Ciegos</h2>
                        <p>Cuando un contrato invoca una función que <em>no existe</em> en el contrato destino (Target), la EVM activa automáticamente la función especial <code>fallback()</code> del Target (si la tiene). El ataque de <strong>Phantom Function</strong> se produce cuando un Vault delega lógicamente interacciones que asume seguras, pero el Target intercepta estas llamadas sin sentido ('Phantom') con un <code>fallback()</code> programado para cambiar estados críticos o extraer tokens ERC20 mediante <code>SafeERC20.safeTransfer</code> al no chocar con ningún revert natural de Solidity.</p>
                    </section>
                </div>`
            },
            {
                id: "evm-callstack",
                title: "15. Reconstrucción Determinista del Callstack",
                description: "Análisis exhaustivo de la jerarquía de ejecución: Opcodes, propagación de contexto y tracers atómicos.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Topología Ocular de la Ethereum Virtual Machine</h2>
                        <p>La EVM no es una CPU arquitectónicamente convencional (ej. x86, ARM), sino una rudimentaria pero resiliente "Máquina de Estados de Transitorio Semi-Estático" basada en una pila rígida de 256 bits y sin registros (Registers). Para los arquitectos forenses, el <strong>Callstack (Pila de Llamadas)</strong> es el electrocardiograma absoluto de la transacción. Rastrear sub-llamadas asíncronas no es trivial porque cada instrucción <code>CALL</code>, <code>DELEGATECALL</code> o <code>STATICCALL</code> genera un sub-universo concéntrico que hereda o aísla diferentes ramas de autoridad (Balance vs Storage).</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Opcodes Críticos y Herencia de Contexto (Context Propagation)</h2>
                        <p>Analizar transacciones mediante exploradores visuales básicos (Etherscan) invisibiliza la realidad matemática. Las herramientas forenses de grado Titan (como Tenderly, Phalcon o Foundry Traces) exponen el Callstack en bruto. El especialista debe buscar distorsiones en estas 3 directrices fundamentales:</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Opcode de Llamada</th>
                                        <th>Entorno de Almacenamiento Destino</th>
                                        <th>Preservación de msg.sender</th>
                                        <th>Riesgo Forense Primario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>CALL (0xF1)</code></td>
                                        <td>Se aísla. Modifica variables del Contrato Destino (Target).</td>
                                        <td>NO. El Target ve al Llamante Directo como Sender.</td>
                                        <td>Robo estándar, Reentrancia Básica.</td>
                                    </tr>
                                    <tr>
                                        <td><code>DELEGATECALL (0xF4)</code></td>
                                        <td><strong>Se fusiona. Modifica el Storage del Contrato Origen.</strong></td>
                                        <td><strong>SÍ.</strong> El Target finge que la llamada externa sigue intacta.</td>
                                        <td>Corrupción de Slots, Autodestrucción Ruteada.</td>
                                    </tr>
                                    <tr>
                                        <td><code>STATICCALL (0xFA)</code></td>
                                        <td>Se bloquea (Modo Lectura Inmutable).</td>
                                        <td>NO. Actúa como oráculo ciego.</td>
                                        <td>Lectura Interceptada, Manipulación de Precios AMM.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "cross-chain-reentrancy",
                title: "16. Reentrancy Read-Only y Cross-Chain",
                description: "Análisis de estados inconsistentes en oráculos y protocolos de interoperabilidad.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Falacia de la Seguridad en la Función "View" (Read-Only)</h2>
                        <p>El axioma más pernicioso e inexacto entre desarrolladores nivel medio es que las funciones mercadas con la etiqueta <code>view</code> o <code>pure</code> no acarrean riesgos de seguridad, ya que algorítmicamente no pueden modificar el estado global (<code>SSTORE</code>) de la blockchain. Sin embargo, en arquitecturas altamente acopladas como DeFi 3.0, la <strong>Reentrancia de Solo Lectura (Read-Only Reentrancy)</strong> demuestra cómo un atacante puede inducir a un Protocolo A a leer data asincrónica completamente falsa del Protocolo B.</p>
                    </section>
                    
                    <section class="pro-section">
                        <h2>II. Exposición Sincrónica del Invariante Hígado (Liquidity Pools)</h2>
                        <p>Cuando un protocolo elimina un nodo de liquidez (e.g., hacer un Withdraw de Curve Finance), el contrato envía los ethers o tokens envueltos al emisor <em>justo antes</em> de actualizar las constantes matemáticas internas (como <code>totalBalance</code>). En la ventana microscópica donde el Ether ha llegado a manos del atacante, pero el Protocolo no ha actualizado sus libros contables, el sistema se halla en un estado esquizofrénico inbalanceado.</p>
                        
                        <div class="technical-box">
                            <strong>Flujo Letal de ROR (Read-Only Reentrancy):</strong>
                            <ol>
                                <li>El protocolo de Liquidación Externa (Contract C) necesita saber el precio colateralizado de un activo para liquidar deudas, basándose en la fórmula <strong>Balance / Circulante</strong> del Pool B.</li>
                                <li><strong>Atacante llama a Pool B:</strong> Exige extraer liquidez, provocando que <code>Pool B</code> le transfiera 1000 ETH mediante una llamada de retorno al <code>fallback()</code> del hacker.</li>
                                <li><strong>Hacker Atrapa el Hilo en el Fallback:</strong> En su propia función de recibo (en lugar de finalizar), hace un alto y <em>pausa</em> el Pool B.</li>
                                <li><strong>Hacker Llama a Contract C:</strong> Exige liquidar una posición de un usuario colateralizado en la piscina. Contract C pregunta algorítmicamente "<code>view get_virtual_price()</code>" al Pool B.</li>
                                <li><strong>El Pool B devuelve una Mentira Matemática:</strong> Como el Pool B aún no restó algorítmicamente los 1000 ETH que ya despachó al Hacker (porque el hacker detuvo y anidó la ejecución a en su fallback), el <code>view</code> responde con un precio falsificado donde hay más fondos de los que realmente hay. El oráculo está corrompido, la transacción de liquidación roba las reservas colaterales del usuario inocente.</li>
                            </ol>
                        </div>
                    </section>
                </div>`
            },
            {
                id: "selfdestruct",
                title: "17. SELFDESTRUCT y Desestabilización de Balances",
                description: "Análisis forense de la inyección forzada de Ether: De la rotura de invariantes al post-Cancun.",
                readTime: 200,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Inyección Forzada de Estado y Bypass de Lógica</h2>
                        <p>El opcode <code>SELFDESTRUCT</code> fue diseñado en los albores de Ethereum para incentivar la limpieza de estado (reembolsando gas al destruir contratos obsoletos). Su mecánica letal consiste en que borra el <em>Bytecode</em> y <em>Storage</em> de un contrato y fuerza el envío de todo su balance de Ether a una dirección destino. Para el analista forense, este es el vector definitivo de <strong>Inyección de Balance</strong>, ya que bypassa completamente cualquier chequeo <code>receive()</code> o <code>fallback()</code> del receptor. El Ether simplemente "aparece" en la dirección destino, alterando su saldo de forma indetenible.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 180" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="100" cy="90" r="40" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="100" y="85" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Attacker</text>
                                <text x="100" y="105" fill="#fff" text-anchor="middle" style="font-size: 10px;">Contract</text>
                                
                                <path d="M145 90 L295 90" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="4" stroke-dasharray="6,4" />
                                <rect x="180" y="65" width="80" height="20" fill="#1a1a1a" />
                                <text x="220" y="80" fill="#ffa600" text-anchor="middle" style="font-size: 11px; font-weight: bold;">SELFDESTRUCT</text>
                                
                                <rect x="300" y="50" width="200" height="80" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="400" y="80" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Target Vault</text>
                                <text x="400" y="100" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Strict accounting game)</text>
                                
                                <rect x="530" y="40" width="250" height="100" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="2" />
                                <text x="655" y="65" fill="#fff" text-anchor="middle" style="font-weight: bold; font-family: monospace;">Variables del Target:</text>
                                <text x="655" y="85" fill="#ff4d4d" text-anchor="middle" style="font-family: monospace; font-size: 12px;">address(this).balance += 100</text>
                                <text x="655" y="105" fill="#4dff88" text-anchor="middle" style="font-family: monospace; font-size: 12px;">internalAccounting == 0</text>
                                <text x="655" y="125" fill="#ffa600" text-anchor="middle" style="font-family: monospace; font-size: 12px; font-weight: bold;">INVARIANTE ROTO 💥</text>
                            </svg>
                            <p class="diagram-caption">Figura 15: Ataque de inyección de Ether rompiendo las máquinas de estado interno de contabilidad.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Paradigma Post-Cancun (EIP-6780)</h2>
                        <p>Tras la actualización <em>Cancun</em>, el peligro existencial de la aniquilación de estado masiva se mitigó mediante el <strong>EIP-6780</strong>. Ahora, <code>SELFDESTRUCT</code> solo borrará datos si el contrato fue creado y destruido <em>en la misma transacción</em>. Sin embargo, <strong>la inyección de Ether sigue operativa en todos los casos</strong>. La heurística institucional manda que jamás se dependa de <code>address(this).balance</code> para el control de flujo lógico o aserciones estrictas (<code>===</code>).</p>
                    </section>
                </div>`
            },
            {
                id: "mev-dark-forest",
                title: "18. Sobreviviendo en el Bosque Oscuro: MEV Institucional",
                description: "Análisis espectral de Bundles, Searchers y la ecología de las subastas Flashbots.",
                readTime: 250,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Ecología de la Extracción Atómica (Maximal Extractable Value)</h2>
                        <p>El mempool público (Gossip Network) es un entorno de información profundamente asimétrica, similar a un piso de remates donde todos pueden ver las órdenes antes de ejecutarse. El <strong>MEV (Maximal Extractable Value)</strong> representa la plusvalía criptoeconómica que un Block Builder o Validator puede parasitar al reordenar, incluir o interceptar transacciones. Para las instituciones, este es un impuesto oculto letal: enviar un SWAP grande sin protección desencadena los algoritmos de los <em>Searchers</em> para succionar el deslizamiento (Slippage) del usuario mediante "Ataques Sándwich" atómicos.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="180" height="40" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="140" y="65" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Tx 1: Front-run (Buy)</text>

                                <rect x="50" y="90" width="180" height="40" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="140" y="115" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Tx 2: Victim SWAP</text>
                                
                                <rect x="50" y="140" width="180" height="40" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="140" y="165" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Tx 3: Back-run (Sell)</text>
                                
                                <path d="M250 110 L350 110" stroke="#fff" stroke-width="3" marker-end="url(#arrowhead)" />
                                
                                <rect x="360" y="60" width="180" height="100" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" rx="10" />
                                <text x="450" y="100" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">MEV BUNDLE</text>
                                <text x="450" y="120" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Flashbots Relay)</text>
                                
                                <path d="M550 110 L650 110" stroke="#4dff88" stroke-width="3" marker-end="url(#arrowhead)" />
                                
                                <rect x="660" y="80" width="100" height="60" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" rx="8" />
                                <text x="710" y="115" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Block N</text>
                            </svg>
                            <p class="diagram-caption">Figura 19: Arquitectura de un ataque Sandwich inyectado como un Bundle indivisible en la construcción del bloque.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Contra-Ataque: Order Flow Privado y MEV-Share</h2>
                        <p>La defensa institucional obliga a evacuar el "Bosque Oscuro". Los Quants utilizan <strong>RPCs Anti-MEV</strong> (MEV-Share, Flashbots Protect, MEV-Blocker) que ofuscan el rastro paramétrico y subastan la ejecución a Builders ciegos, retornando hasta el 90% del MEV capturable directamente al usuario final (Kickbacks). Un analista forense puede identificar un trader sofisticado simplemente notando la ausencia sistemática de firmas de sus transacciones en el <em>mempool daemon</em> público, operando exclusivamente mediante Shadow Order Flow.</p>
                    </section>
                </div>`
            },
            {
                id: "oracle-manipulation",
                title: "19. TWAP vs Spot: Guerra de Oráculos",
                description: "Estrategias de defensa contra la manipulación de precios intra-bloque.",
                readTime: 240,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Fragilidad Letal del Precio Spot (Current Price)</h2>
                        <p>Depender del precio interno e instantáneo (<code>currentPrice()</code>) de un Automated Market Maker (DEX) en la misma transacción es una negligencia existencial. Mediante orquestación de <strong>Flash Loans</strong> de cientos de millones de dólares, un atacante puede alterar masivamente el ratio de reservas reales de un pool <em>X*Y=K</em> en microsegundos, distorsionando temporalmente el "Precio" devuelto. El oráculo queda ciego ante esta aberración matemática temporal y permite liquidar las bóvedas sanas a precios hiper-colapsados.</p>
                        
                        <div class="technical-box">
                            <strong>Anatomía Forense de un Oracle Manipulation Attack (Spot):</strong>
                            <ol>
                                <li><code>FlashLoan(100M USDC)</code>: Atacante adquiere control armamentístico del mercado de préstamos Aave.</li>
                                <li><code>Swap 100M USDC -> Token_A</code>: Colapsa el inventario de Token_A en Uniswap, inflando su precio relativo a $500,000 artificiales.</li>
                                <li><code>TargetProtocol.deposit(Token_A) -> borrow(USDC)</code>: El Target lee el precio corrupto de Uniswap y percibe que Token_A vale $500k. Autoriza al hacker a pedir prestado $400k de la bóveda dando muy poca garantía falsa de Token_A.</li>
                                <li><code>Swap Reverse</code>: El hacker revierte el desequilibrio en el AMM perdiendo algo de fee.</li>
                                <li><code>Payback FlashLoan</code>: Repaga el Flash Loan inicial con un beneficio millonario limpio extraído del TargetProtocol que fue engañado.</li>
                            </ol>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Defensa Estructural: TWAP y Chainlink Aggregators</h2>
                        <p>La contramedida institucional contra la deformación instantánea es prohibir la dependencia de cotizaciones atómicas. Un analista audita que los protocolos dependan íntegramente de <strong>TWAP (Time-Weighted Average Price)</strong> de Uniswap V3, que suaviza los precios acumulativamente a lo largo de docenas de bloques, o del <strong>Decentralized Oracle Network (DON)</strong> de Chainlink, implementando validaciones <code>require(answeredInRound >= roundID)</code> para garantizar que el precio sea algorítmicamente fresco e inmune a las inyecciones intra-bloque.</p>
                    </section>
                </div>`
            },
            {
                id: "smart-contract-vulnerabilities",
                title: "20. Vectores Clínicos de Ataque a Contratos",
                description: "Disección técnica de la explotación: De la reentrancia multi-contrato al compromiso de invariantes.",
                readTime: 260,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Reentrancia Híbrida: Cross-Contract y Cross-Function</h2>
                        <p>La versión académica de la Reentrancia (robar fondos iterando <code>msg.sender.call()</code> recursivamente) está casi extinta debido al uso masivo del modificador <code>nonReentrant</code>. La mutación más avanzada que enfrentan las instituciones Tier-1 es la <strong>Cross-Contract Reentrancy</strong>. Ocurre cuando un ecosistema multicontrato confía ciegamente en estados compartidos (Shared State). El atacante manipula el Contrato A y hace "Pausa Asíncrona", invocando maliciosamente al Contrato B (ej. un módulo de márgenes o votación) que lee el estado de forma síncrona mientras el Contrato A todavía tiene anotaciones anticuadas y no consolidadas en sus ledgers.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Explotación del Compromiso de Estructuras (Invariant Breach)</h2>
                        <p>Las finanzas descentralizadas operan bajo Invariantes estrictos (ej. TokenSupply == PoolBalance). La disección forense persigue "Fugas de Estado" donde el orden de las operaciones internas traiciona la lógica de validación externa. El patrón de arquitectura más seguro y auditable exige el manifiesto <strong>Checks-Effects-Interactions (CEI)</strong>, complementado con mutexes (Candados Anti-Reentrancia) a <em>nivel global/institucional</em>, no solo aislados por función.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="200" height="120" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="150" y="80" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Contrato Principal (A)</text>
                                <text x="150" y="105" fill="#fff" text-anchor="middle" style="font-size: 11px;">1. Update Balance (Effects)</text>
                                <text x="150" y="125" fill="#fff" text-anchor="middle" style="font-size: 11px;">2. External Call 🚨</text>
                                <text x="150" y="145" fill="#555" text-anchor="middle" style="font-size: 11px;">3. Commit State (Nunca Clímax)</text>
                                
                                <path d="M250 120 L320 80" stroke="#ff4d4d" stroke-width="3" marker-end="url(#arrowhead)" stroke-dasharray="4" />
                                <text x="300" y="70" fill="#ff4d4d" style="font-size: 10px; font-weight: bold;">Re-Enter B</text>
                                
                                <rect x="350" y="50" width="180" height="120" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="440" y="80" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Contrato Malicioso</text>
                                <text x="440" y="115" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Atrapa la ejecución)</text>
                                
                                <path d="M530 80 L600 120" stroke="#ffa600" stroke-width="3" marker-end="url(#arrowhead)" />
                                <text x="560" y="100" fill="#ffa600" style="font-size: 10px; font-weight: bold;">Read State</text>
                                
                                <rect x="620" y="50" width="150" height="120" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="695" y="80" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Oráculo Aux (B)</text>
                                <text x="695" y="110" fill="#fff" text-anchor="middle" style="font-size: 11px;">Retorna Status(A)</text>
                                <text x="695" y="130" fill="#ff4d4d" text-anchor="middle" style="font-size: 11px;">[Error: State is Stale]</text>
                            </svg>
                            <p class="diagram-caption">Figura 20: Vector de ataque asimétrico Multi-Condicional mediante enmascaramiento de estados compartidos no-consolidados.</p>
                        </div>
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
