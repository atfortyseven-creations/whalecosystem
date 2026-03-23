export const scamEducationModules = [
    {
        id: "scam-prevention-mastery",
        title: "XXIV. Máxima Seguridad Institucional y Prevención de Exploits Multicapa",
        description: "Análisis forense exhaustivo de vectores de ataque asimétricos, ofuscación criptográfica y protección patrimonial on-chain. 20 Módulos de Máxima Perfección.",
        articles: [
            {
                id: "blockchain-address-poisoning",
                title: "1. Blockchain Address Poisoning: Anatomía del Ataque de Colisión de Hashes",
                description: "Disección técnica, matemática y heurística de la suplantación de identidad algorítmica y el envenenamiento de historiales de transacciones en la EVM.",
                readTime: 450,
                content: `<div class="academy-article">
                    <section>
                        <h2>I. Introducción a la Ingeniería Social Algorítmica</h2>
                        <p>El ecosistema de la Web3, al prescindir de intermediarios fiduciarios, transfiere la carga absoluta de la seguridad operacional al individuo o institución custodio. Entre las amenazas más sofisticadas que explotan la cognición humana en la lectura de datos en bruto, destaca el <strong>Blockchain Address Poisoning (Envenenamiento de Direcciones)</strong>.</p>
                        
                        <p>A diferencia de los exploits de contratos inteligentes que aprovechan vulnerabilidades lógicas (como la reentrancia o los desbordamientos matemáticos), el <em>Address Poisoning</em> no ataca la criptografía subyacente de la red, sino que explota heurísticas de interfaz de usuario (UI), sesgos cognitivos de validación humana y la maleabilidad del registro on-chain. Es un ataque asimétrico, donde el costo de despliegue para el atacante es marginal frente a la pérdida catastrófica potencial para la víctima.</p>

                        <div class="diagram-container">
                            <svg viewBox="0 0 800 250" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="700" height="170" fill="none" stroke="#222" />
                                
                                <text x="400" y="30" fill="#fff" text-anchor="middle" font-weight="bold">Topología del Engaño Visual</text>

                                <!-- Legitimate Address -->
                                <rect x="80" y="70" width="640" height="40" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" />
                                <text x="100" y="95" fill="#4d94ff" font-family="monospace">0x</text>
                                <text x="125" y="95" fill="#fff" font-family="monospace" font-weight="bold">A1b2...C3d4</text>
                                <text x="350" y="95" fill="#4d94ff" font-family="monospace">...b5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2...</text>
                                <text x="640" y="95" fill="#fff" font-family="monospace" font-weight="bold">D5e6</text>
                                
                                <!-- Poisoned Address -->
                                <rect x="80" y="140" width="640" height="40" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" />
                                <text x="100" y="165" fill="#ff4d4d" font-family="monospace">0x</text>
                                <text x="125" y="165" fill="#fff" font-family="monospace" font-weight="bold">A1b2...C3d4</text>
                                <text x="350" y="165" fill="#ff4d4d" font-family="monospace">...X9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2...</text>
                                <text x="640" y="165" fill="#fff" font-family="monospace" font-weight="bold">D5e6</text>

                                <rect x="125" y="55" width="220" height="140" fill="none" stroke="#4dff88" stroke-dasharray="2,2" />
                                <text x="235" y="210" fill="#4dff88" font-size="12" text-anchor="middle">Prefijo Idéntico (Generación Meticulosa)</text>

                                <rect x="635" y="55" width="50" height="140" fill="none" stroke="#4dff88" stroke-dasharray="2,2" />
                                <text x="660" y="210" fill="#4dff88" font-size="12" text-anchor="middle">Sufijo Idéntico</text>

                            </svg>
                            <p class="diagram-caption">Figura 1: El vector de engaño explota la truncación común en interfaces de billeteras (ej. 0xA1b2...D5e6).</p>
                        </div>
                    </section>

                    <section>
                        <h2>II. Fundamentos Cripto-Matemáticos: Generación de Direcciones Vanity</h2>
                        <p>Para comprender la magnitud de la amenaza, es imperativo diseccionar cómo un atacante logra crear una dirección visualmente indistinguible del destino legítimo de la víctima.</p>
                        <h3>1. La Termodinámica de la Función Keccak-256</h3>
                        <p>En la Ethereum Virtual Machine (EVM), una dirección es invariablemente de 20 bytes (160 bits), derivada de los últimos 20 bytes del hash Keccak-256 de la clave pública ECDSA subyacente. Matemáticamente: <code>Address = keccak256(PublicKey)[12:32]</code>.</p>
                        <p>Generar un par de claves cuya dirección resultante comience o termine con caracteres específicos requiere fuerza bruta computacional pura. Encontrar una dirección completamente idéntica a otra requeriría iterar 2¹⁶⁰ posibilidades, lo cual es termodinámicamente imposible con la computación clásica actual. Sin embargo, no se busca una colisión total, sino una <strong>colisión parcial</strong>.</p>
                        
                        <h3>2. Perfilado de Granjas de GPUs (Vanity Profiling)</h3>
                        <p>Los atacantes emplean clusters masivos de GPUs de alta concurrencia o ASICs especializados ejecutando algoritmos optimizados de derivación elíptica como <code>profanity</code> (ahora obsoleto por vulnerabilidades propias) o variantes privadas de <code>vanityeth</code>. Si asumimos que buscan hacer coincidir los primeros 4 y los últimos 4 caracteres hexadecimales (total 8 caracteres = 32 bits de entropía), el tiempo esperado de colisión es trivial:</p>
                        
                        <div class="prose-aztec-block" style="background: rgba(0,0,0,0.3); padding: 20px; border-left: 4px solid #4d94ff; margin: 20px 0;">
                            <p style="font-family: monospace; color: #4d94ff;">Probabilidad = 1 / 16^N (donde N = número de caracteres a igualar)</p>
                            <p style="font-family: monospace; color: #4d94ff;">Esfuerzo para 8 caracteres: ~4.29 mil millones de hashes.</p>
                            <p style="font-family: monospace; color: #4d94ff;">Capacidad RTX 4090: ~200 MH/s (200 millones de hashes/segundo).</p>
                            <p style="font-family: monospace; color: #4dff88;"><strong>Tiempo de resolución por objetivo (un atacante): ~21 segundos.</strong></p>
                        </div>
                        <p>Esta asimetría temporal confirma que la creación masiva de direcciones maliciosas a escala industrial es no solo posible, sino económicamente altamente rentable dada la baja inversión de capital y energía requerida.</p>
                    </section>

                    <section>
                        <h2>III. Taxonomía de los Vectores de Ataque</h2>
                        <p>El *Address Poisoning* no es monolítico. Existen variaciones vectoriales adaptadas a las defensas y umbrales de alerta de los exploradores de bloques y monitores de riesgo institucionales.</p>

                        <h3>1. El Vector <em>Zero-Value Transfer</em> (Interferencia Nula)</h3>
                        <p>Es la morfología de ataque más fundamental. Tras detectar una transacción legítima de alto valor entre la Billetera A (víctima) y la Billetera B (destino de confianza), el atacante ejecuta un script automatizado que inmediatamente lanza una transferencia de valor cero (0 ETH / 0 USDT) "desde" la billetera maliciosa B' (la dirección Vanity generada) "hacia" la billetera víctima A, o viceversa, adulterando el origen usando funciones de delegación maliciosa como <code>transferFrom</code> sin autorización estricta en ciertos tokens no estándar.</p>
                        <p><strong>El Objetivo Clínico:</strong> Colocar la dirección maliciosa B' en la parte superior del historial de transacciones de la billetera de la víctima. Cuando la víctima copie la dirección de su propio historial para la siguiente transferencia legítima masiva al destino de confianza, copiará erróneamente la dirección B' del atacante.</p>

                        <h3>2. El Vector <em>Tiny Transfer / Dusting</em> (Resonancia Magnética)</h3>
                        <p>Dado que ciertos exploradores o billeteras filtran transferencias de valor cero para mitigar el <em>spam</em> visual, atacantes más solventes utilizan transferencias parasitarias infinitesimales. Envían, por ejemplo, 0.000001 USDT o fracciones céntimas de ETH.</p>
                        <p>Este vector elude los filtros de SPAM básicos, ya que hay transferencia de valor demostrable on-chain. Además, puede activar notificaciones "positivas" en el dispositivo del usuario, generando una perturbadora sensación de confirmación ("He recibido USDT, es de ese swap que acabo de hacer"), anclando psicológicamente la dirección fraudulenta en el subconsciente operativo del usuario.</p>

                        <div class="diagram-container">
                            <svg viewBox="0 0 800 280" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="30" width="700" height="230" fill="none" stroke="#333" />
                                
                                <text x="100" y="60" fill="#fff" font-weight="bold">Historial de Transacciones (Timeline Visual)</text>

                                <!-- Legitimate TX -->
                                <circle cx="80" cy="100" r="10" fill="#4dff88" />
                                <text x="110" y="105" fill="#4dff88" font-family="monospace">TX Legítima: 10,000 USDT → 0x1A2...9Z8X</text>
                                <text x="650" y="105" fill="#aaa" font-size="12">- hace 2 horas</text>

                                <!-- Trigger Event -->
                                <line x1="80" y1="110" x2="80" y2="150" stroke="#555" stroke-dasharray="2,2" />
                                
                                <!-- Alert: Attacker Observer -->
                                <rect x="300" y="125" width="200" height="25" fill="#ffca28" rx="4" />
                                <text x="400" y="142" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">ATACANTE MONITOREA MEMPOOL</text>

                                <!-- Poison TX -->
                                <circle cx="80" cy="180" r="10" fill="#ff4d4d" />
                                <text x="110" y="185" fill="#ff4d4d" font-family="monospace">Ataque Poison: 0 USDT ← 0x1A2...9z8X</text>
                                <text x="650" y="185" fill="#aaa" font-size="12">- hace 1 min</text>

                                <!-- Victim Action -->
                                <path d="M110 210 L150 250 L300 250" fill="none" stroke="#fff" stroke-width="2" marker-end="url(#arrowhead)" />
                                <text x="320" y="255" fill="#fff" font-style="italic">Víctima copia el destino fraudulento del historial reciente.</text>

                            </svg>
                            <p class="diagram-caption">Figura 2: Dinámica espacio-temporal de un ataque de Zero-Value inyectado en el historial de UI post-transacción legítima.</p>
                        </div>

                        <h3>3. El Vector <em>Token Counterfeit</em> (Suplantación Total de Entidades)</h3>
                        <p>Para maximizar la opacidad y evitar el gasto de gas en tokens legítimos (el cual varía drásticamente en momentos de congestión de la red), atacantes avanzados despliegan <strong>Contratos Maliciosos de Tokens Falsificados (Fake ERC-20s)</strong> con firmas sintéticas y parámetros robados.</p>
                        <ul>
                            <li><strong>Spoofing Semántico:</strong> El token de ataque comparte el nombre, el Ticker (símbolo, ej. USDT) y los decimales del activo legítimo.</li>
                            <li><strong>Auditoría Criptográfica Falseada:</strong> Emiten eventos genéricos de la Interfaz Estándar ERC-20 (<code>Transfer(from, to, value)</code>) con valores adulterados. Pueden obligar on-chain a que la operación de transferencia desde su billetera maliciosa indique masivas cantidades de liquidez sin poseer respaldo real, perturbando severamente rastreadores de portfolio (como Zapper, Zerion o DeBank) que no verifican a fondo la liquidez cruzada de los AMMs al fijar precios, mostrando ganancias ficticias en el saldo de la víctima.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>IV. Anatomía Forense Post-Explotación</h2>
                        <p>Cuando un fondo institucional o ballena es víctima de un <em>Address Poisoning</em>, los fondos son direccionados a la billetera vanity del atacante. El análisis forense subsiguiente revela estrategias operativas altamente homogeneizadas y estructuradas.</p>
                        
                        <h3>Fases de Extracción de Capital:</h3>
                        <ol>
                            <li><strong>Aislamiento y Consolidación:</strong> Los fondos contaminados se recogen rápidamente hacia carteras de nivel medio ('Aggregator Wallets') para preparar la ofuscación jurisdiccional y evitar congelamiento atómico en bloque (como la blacklist nativa de Tether/USDT mediada por orden judicial).</li>
                            <li><strong>Fragmentación mediante Swaps Descentralizados (DEX Hops):</strong> Uso agresivo de agregadores cross-chain no permisionados. El bot cambia masivamente los USDT o USDC a activos de difícil incautación y extrema volatilidad (ej. ETH nativo) a sabiendas de que los emisores centralizados no pueden blacklistar ETH y sus derivados gas.</li>
                            <li><strong>Ofuscación Avanzada (Mixers y CEXs no-KYC):</strong> El capital atomizado en ETH es vertido hacia mezcladores como Tornado Cash (a pesar del riesgo OFAC) o direccionado mediante enjambres granulares hacia plataformas de intercambio extrajeras de jurisdicción gris con laxitud en la aplicación de normativas Anti-Lavado de Dinero (AML), consolidando las pérdidas a un nivel prácticamente irrecuperable.</li>
                        </ol>
                    </section>

                    <section>
                        <h2>V. Arquitectura de Defensa Institucional (Protección Extrema)</h2>
                        <p>La mitigación contra el <em>Address Poisoning</em> exige la completa aniquilación de los hábitos precarios de los usuarios no informados. La defensa debe migrar del pánico preventivo a la sistematicidad procesal blindada.</p>
                        
                        <div class="prose-aztec-block" style="background: rgba(0,0,0,0.3); padding: 20px; border-left: 4px solid #4dff88; margin: 20px 0;">
                            <h3 style="color: #4dff88; margin-top: 0;">Directiva Permanente Alpha: Cero Confianza en Historiales (Zero-Trust UI)</h3>
                            <p><strong>Bajo NINGUNA circunstancia, operante o institucional, debe copiarse una dirección del historial de transferencias nativas del explorador de bloques, wallet o terminal financiera. El historial no es seguro.</strong></p>
                        </div>

                        <h3>1. Confirmación Cripto-Visual de Espectro Completo</h3>
                        <p>La verificación heurística no puede limitarse a los primeros 4 y últimos 4 caracteres. Los auditores de transferencia exigen la verificación manual de secciones aleatorias en el cuerpo hexadecimal interno de la dirección.</p>
                        <p>Ejemplo Analítico Seguro: Al validar <code>0xa905...8D94f31Ca5a5a9E7...1b4A</code>, no validar solo <code>0xa905</code> y <code>1b4A</code>. Forzar el enfoque en <code>8D94</code> y <code>Ca5a</code> interiores. Las divergencias se revelan instantáneamente en las capas interiores inescrutables.</p>

                        <h3>2. Contabilidad de Contactos Duros (Whitelist/Address Books)</h3>
                        <p>El uso de la Libreta de Direcciones ('Address Book') de las carteras de hardware (Ledger, Trezor) o soluciones multi-firma institucional (Safe) previene ataques en su raíz. Las direcciones comprobadas off-chain deben registrarse permanentemente bajo nombres de usuario inmutables. El envío de capital exige que el operador simplemente asigne un envío a "_BÓVEDA-FRÍA-L2_" sin la necesidad de copiar un hash manualmente.</p>

                        <h3>3. ENS Resolvers (Ethereum Name Service y Alternativas DNS)</h3>
                        <p>Trasladar la carga del hexágono matemático abstracto hacia el lenguaje alfabético (e.g., <code>fondo_matriz_whale.eth</code>). Estos dominios están garantizados criptográficamente contra el secuestro de dominios DNS clásicos (ICANN). Los atacantes no pueden registrar un <code>.eth</code> homógrafo fácilmente si las mayúsculas/minúsculas o la puntuación difieren de manera estructurada.</p>

                        <h3>4. Ensayos de Prueba (Micro-Transacciones Tester)</h3>
                        <p>Frente al riesgo extremo, las transacciones masivas de millones de dólares no son despachadas holísticamente. Se inicia un canal seguro realizando un micropago (<code>0.001 ETH</code>) o ('Pinging'). Solo tras recabar confirmación directa multisensorial/fiduciaria del poseedor de la contraparte mediante canal seguro alternativo (Signal/Reunión presencial), se establece luz verde para la liquidez profunda. El costo transaccional (GAS) del micropago es considerado una prima de seguro irrisoria en términos absolutos del flujo de caja de la gran estructura contable.</p>
                    </section>
                </div>`
            }
        ]
    }
];
