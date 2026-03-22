export const genesisModules = [
    {
        id: "genesis",
    title: "IV. Orígenes y Filosofía Cypherpunk",
    description: "Estudio exhaustivo de los fundamentos ideológicos y los hitos técnicos que dieron nacimiento a la era de la descentralización. 20 Módulos de Máxima Perfección.",
    articles: [
        {
            id: "back-hashcash-pow-genesis",
            title: "1. Adam Back y Hashcash (1997)",
            description: "Prevención de Spam mediante el costo computacional: El ancestro directo de la minería.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Prueba de Trabajo como Filtro Anti-Abuso</h2>
                    <p>Hashcash fue diseñado originalmente para combatir el spam en correos electrónicos. Requería que el emisor realizara un cálculo costoso pero fácil de verificar. Satoshi tomó esta idea y la aplicó no al spam, sino a la construcción de un orden cronológico inmutable de transacciones.</p>
                </section>
            </div>`
        },
        {
            id: "bitcoin-v01-cpp-arch",
            title: "2. Arquitectura de Bitcoin v0.1: El Código Original",
            description: "Desglose técnico del software primigenio: Sockets, IRC y la base de datos BerkeleyDB.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Descubrimiento de Nodos vía IRC</h2>
                    <p>En la versión 0.1, no existían los nodos semilla ('DNS seeds') modernos. El software se conectaba automáticamente al canal <code>#bitcoin</code> en el servidor de IRC <em> freenode</em> para intercambiar direcciones IP con otros nodos. Esta dependencia de una infraestructura centralizada externa fue uno de los primeros puntos de fricción técnica que Satoshi y los primeros desarrolladores tuvieron que resolver para lograr una verdadera descentralización de red.</p>
                </section>
                <section>
                    <h2>II. El Motor de Persistencia: BerkeleyDB</h2>
                    <p>Antes de LevelDB, Bitcoin utilizaba BerkeleyDB (BDB) para almacenar el historial de transacciones y las claves privadas. BDB era conocido por su susceptibilidad a la corrupción de archivos si el nodo se cerraba de forma inesperada. Los analistas forenses de 'bitcoins perdidos' a menudo deben lidiar con estos archivos <code>wallet.dat</code> antiguos que requieren herramientas de recuperación específicas de la era 2009-2011.</p>
                </section>
            </div>`
        },
        {
            id: "bitcoin-pizza-day",
            title: "3. Bitcoin Pizza Day: El Primer Pago",
            description: "Las 10,000 pizzas de Laszlo Hanyecz y el nacimiento del valor de mercado.",
            readTime: 115,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Un Hito Gastronómico-Financiero</h2>
                    <p>El 22 de mayo de 2010, el programador Laszlo Hanyecz intercambió 10,000 BTC por dos pizzas de Papa John's. Fue la primera vez que Bitcoin se utilizó como medio de cambio por un bien físico, estableciendo un precio inicial de mercado de aproximadamente 0.004 USD por bitcoin.</p>
                </section>
                <section>
                    <h2>II. El Sacrificio por la Liquidez</h2>
                    <p>Aunque hoy esas pizzas valdrían cientos de millones de dólares, el acto de Laszlo fue fundamental para demostrar que Bitcoin tenía utilidad real. Sin transacciones pioneras como esta, Bitcoin habría permanecido como un experimento teórico sin valor económico extrínseco.</p>
                </section>
            </div>`
        },
        {
            id: "genesis-block",
            title: "4. El Bloque Génesis: Análisis del Bloque 0",
            description: "Arqueología técnica del primer bloque de Bitcoin y sus anomalías estructurales.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Anomalía del Bloque Cero</h2>
                    <p>El Bloque Génesis (hash <code>000000000019d6689c085ae165831e934ff763ae46a2a6c17...</code>) posee propiedades únicas. Técnicamente, su <code>prevHash</code> es una cadena de ceros, ya que no existe un bloque anterior. Además, los 50 BTC de recompensa coinbase están codificados de tal forma que no pueden ser gastados debido a que el bloque no reside en la base de datos de UTXOs estándar de las versiones más antiguas, creando una 'pila' eterna de valor inamovible.</p>
                </section>
                <section>
                    <h2>II. El Hash de 18 Ceros</h2>
                    <p>El nivel de dificultad inicial requería un hash con una cantidad específica de ceros a la izquierda. En el bloque génesis, Satoshi logró un hash con un número de ceros que excedía la dificultad requerida en ese momento, lo que algunos interpretan como una declaración de potencia computacional o simplemente un golpe de suerte matemática que marcó el ritmo del tiempo descentralizado.</p>
                </section>
            </div>`
        },
        {
            id: "infinite-value-incident-2010",
            title: "5. El Incidente del Valor Infinito (2010)",
            description: "Análisis del mayor bug en la historia de Bitcoin y la respuesta coordinada de Satoshi.",
            readTime: 160,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Desbordamiento de Enteros</h2>
                    <p>El 15 de agosto de 2010, un atacante explotó una vulnerabilidad de <em>integer overflow</em> para crear 184 mil millones de BTC en una sola transacción. El código no verificaba correctamente si la suma de los outputs desbordaba el límite de 64 bits, permitiendo una inflación infinita instantánea.</p>
                </section>
                <section>
                    <h2>II. La Bifurcación Suave de Emergencia</h2>
                    <p>Satoshi Nakamoto y la comunidad respondieron en menos de 5 horas. Publicaron una nueva versión del código que invalidaba los bloques del atacante. El "incidente de los 184 mil millones" es el ejemplo más claro de la resiliencia de Bitcoin y la capacidad de la red para auto-corregirse ante fallos catastróficos.</p>
                </section>
            </div>`
        },
        {
            id: "future-of-cypherpunk-ideology",
            title: "6. El Legado de Satoshi: Gobernanza Descentralizada",
            description: "Reflexiones finales sobre el triunfo de la soberanía individual.",
            readTime: 150,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Fin de los Intermediarios de Confianza</h2>
                    <p>Actualmente, el legado cypherpunk vive en cada nodo que valida una transacción de forma independiente. No dependemos de la buena fe de banqueros o políticos, sino de la inmutabilidad de las leyes matemáticas y criptográficas. Este es el acto supremo de soberanía individual en la historia humana.</p>
                </section>
            </div>`
        },
        {
            id: "cypherpunk-movement",
            title: "7. El Movimiento Cypherpunk: Privacidad y Resistencia",
            description: "Estudio de las bases ideológicas de la criptografía asimétrica como herramienta de liberación política.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Manifiesto de Eric Hughes (1993)</h2>
                    <p>El movimiento cypherpunk no nació de la codicia, sino de una necesidad ontológica: la preservación de la privacidad en una sociedad digital inminente. Eric Hughes postuló que "la privacidad es la capacidad de revelarse selectivamente al mundo". Esta distinción entre <em>privacidad</em> (lo que uno no quiere que el mundo sepa) y <em>secreto</em> (lo que uno no quiere que nadie sepa) es el pilar sobre el cual se construyeron los protocolos de anonimato modernos.</p>
                </section>
                <section>
                    <h2>II. La Tríada: Criptografía, Remitentes Anónimos y Dinero Digital</h2>
                    <p>Para Timothy C. May (autor de 'The Crypto Anarchist Manifesto'), la libertad requería tres herramientas tecnológicas: criptografía inquebrantable para las comunicaciones, 'remailers' para el anonimato del tráfico y, crucialmente, una forma de dinero digital que no pudiera ser rastreado ni confiscado por entidades centrales. Bitcoin es la culminación de esta visión de tres décadas.</p>
                </section>
            </div>`
        },
        {
            id: "ethereum-vision-2013",
            title: "8. Ethereum: De la Moneda a la Lógica de Estado",
            description: "La propuesta de Turing-Completitud como catalizador de la economía programable.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Dilema del Scripting Limitado</h2>
                    <p>Bitcoin utiliza 'Script', un lenguaje basado en pilas deliberadamente limitado para evitar bucles infinitos (ataques DoS). Vitalik Buterin argumentó que para crear aplicaciones financieras complejas (escrow, derivados, seguros), la blockchain necesitaba ser Turing-Completa. Ethereum introdujo el concepto de 'Gas' para resolver el Problema del Paro (Halting Problem) de Alan Turing, permitiendo cómputo arbitrario mediante un pago por recurso.</p>
                </section>
                <section>
                    <h2>II. La Transición a la Computación Universal</h2>
                    <p>Con Ethereum, la blockchain dejó de ser un simple libro mayor contable para convertirse en un registro de estado universal. Cada transacción no solo mueve saldo, sino que puede disparar cambios en miles de contratos interconectados, dando origen al concepto de 'Componibilidad' (Money Legos).</p>
                </section>
            </div>`
        },
        {
            id: "mining-evolution-asic",
            title: "9. Evolución de la Minería: CPU a ASIC",
            description: "La carrera armamentística por el Hasrate y la seguridad termodinámica.",
            readTime: 150,
            content: `<div class="academy-article">
                <section>
                    <h2>I. De la CPU al GPU</h2>
                    <p>En los inicios, cualquiera podía minar Bitcoin con un ordenador doméstico. Sin embargo, la búsqueda de eficiencia llevó a los mineros a utilizar tarjetas gráficas (GPUs), que son órdenes de magnitud más rápidas en el cálculo de hashes SHA-256. Este fue el primer paso hacia la profesionalización de la red.</p>
                </section>
                <section>
                    <h2>II. El Dominio de los ASICs</h2>
                    <p>Hoy, la minería se realiza exclusivamente con ASICs (Application-Specific Integrated Circuits), hardware diseñado con el único propósito de minar Bitcoin. Esta especialización ha elevado el Hashrate de la red a niveles que la hacen prácticamente invulnerable a ataques estatales, consolidando su seguridad termodinámica.</p>
                </section>
            </div>`
        },
        {
            id: "pioneers-finney-szabo",
            title: "10. Hal Finney y Nick Szabo",
            description: "Los arquitectos silenciosos: De Reusable Proof of Work a Bit Gold.",
            readTime: 135,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Hal Finney: El Primer Receptor</h2>
                    <p>Hal Finney, un eminente criptógrafo y desarrollador de PGP, fue la primera persona en ejecutar el software de Bitcoin después de Satoshi. El 12 de enero de 2009, recibió 10 BTC en la que fue la primera transacción de la historia. Su contribución técnica es incalculable, habiendo optimizado el código inicial y defendido la red en sus días más vulnerables.</p>
                </section>
                <section>
                    <h2>II. Nick Szabo y los Contratos Inteligentes</h2>
                    <p>Años antes de Bitcoin, Nick Szabo diseñó "Bit Gold", una propuesta de dinero digital que introdujo conceptos clave como el Proof-of-Work para la escasez digital. Aunque Bit Gold nunca se implementó, su arquitectura influyó directamente en Satoshi. Szabo es también el creador del término "Smart Contracts", visualizándolos como protocolos de software que ejecutan los términos de un acuerdo.</p>
                </section>
            </div>`
        },
        {
            id: "satoshi-disappearance-opsec",
            title: "11. La Desaparición de Satoshi: Un Acto de Diseño",
            description: "La retirada estratégica del fundador para lograr la descentralización total.",
            readTime: 210,
            content: `<div class="academy-article">
                <section>
                    <h2>I. 'He pasado a otras cosas'</h2>
                    <p>En abril de 2011, Satoshi Nakamoto cesó toda comunicación pública. Su desaparición no fue un accidente, sino un componente necesario del protocolo de gobernanza. Al eliminar al 'fundador', Bitcoin se convirtió en una tecnología sin dueño, inmune a presiones legales directas y forzada a evolucionar exclusivamente mediante el consenso social y técnico de sus usuarios.</p>
                </section>
            </div>`
        },
        {
            id: "block-size-war-ideology",
            title: "12. La Guerra del Tamaño del Bloque (2015-2017)",
            description: "Análisis del cisma entre SegWit y el aumento de capacidad on-chain.",
            readTime: 260,
            content: `<div class="academy-article">
                <section>
                    <h2>I. UASF: La Revolución de los Usuarios</h2>
                    <p>La "Guerra del Tamaño del Bloque" fue el campo de batalla donde se decidió el futuro de Bitcoin. El User-Activated Soft Fork (UASF) demostró que los usuarios que corren sus propios nodos tienen el poder final sobre los mineros y las corporaciones, consolidando el principio de que la descentralización requiere barreras de entrada bajas para la validación (nodos de 1MB).</p>
                </section>
            </div>`
        },
        {
            id: "cypherpunk-mailing-list-history",
            title: "13. La Lista de Correo Cypherpunk",
            description: "El epicentro intelectual donde se gestó la libertad digital.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Nexo de los Pioneros</h2>
                    <p>Nombres como Adam Back (Hashcash), Bram Cohen (BitTorrent) y Zooko Wilcox (Zcash) eran habituales en esta lista. Fue el laboratorio donde se debatieron los mecanismos de consenso más de una década antes de la publicación del Whitepaper de Bitcoin.</p>
                </section>
            </div>`
        },
        {
            id: "crypto-wars-pgp-export",
            title: "14. Las Crypto Wars de los 90s",
            description: "La lucha legal por exportar código como libertad de expresión.",
            readTime: 220,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Código es Libertad de Expresión</h2>
                    <p>Phil Zimmermann, creador de PGP, fue investigado por el gobierno de EE. UU. por 'exportación de armas' al publicar su código. El movimiento cypherpunk ganó esta guerra cuando los tribunales decidieron que el software es una forma de expresión protegida por la Primera Enmienda, permitiendo legalmente la existencia de Bitcoin hoy.</p>
                </section>
            </div>`
        },
        {
            id: "precursors-digicash-egold",
            title: "15. Los Precursores: DigiCash y e-Gold",
            description: "Lecciones aprendidas de los sistemas de dinero digital centralizados.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. David Chaum y las Firmas Ciegas</h2>
                    <p>DigiCash (1989) introdujo la privacidad absoluta mediante firmas ciegas (blind signatures), pero fracasó debido a su dependencia de una entidad central legalmente vulnerable. e-Gold demostró que un activo digital respaldado por valor real atraería inevitablemente el escrutinio estatal, validando la necesidad de Satoshi de un sistema sin 'cabeza' que cortar.</p>
                </section>
            </div>`
        },
        {
            id: "szabo-smart-contracts-theory",
            title: "16. Nick Szabo y la Teoría de los Smart Contracts",
            description: "Más allá del dinero: Automatización de acuerdos legales mediante protocolos.",
            readTime: 200,
            content: `<div class="academy-article">
                <section>
                    <h2>I. La Máquina de Vending como Metáfora</h2>
                    <p>Szabo comparó un Smart Contract con una máquina expendedora: una caja de seguridad que ejecuta automáticamente una transacción (dar un producto) si se cumplen las condiciones de entrada (introducir monedas). Esta visión transformó a la blockchain de un libro contable a una herramienta de automatización jurídica global.</p>
                </section>
            </div>`
        },
        {
            id: "satoshi-pgp-opsec",
            title: "17. Satoshi y la Criptografía de Clave Pública",
            description: "Análisis de la OPSEC de Nakamoto: El uso magistral de PGP y Tor en 2008.",
            readTime: 190,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Blindaje de Identidad mediante PGP</h2>
                    <p>Satoshi Nakamoto utilizó la clave PGP <code>0x1161B515</code> para firmar sus comunicaciones en la lista de correo de criptografía. Este método garantizaba que, a pesar de usar un seudónimo, su audiencia pudiera verificar la consistencia del emisor. La clave tenía un tamaño de 1024 bits (estándar en la época) y nunca reveló ninguna metainformación que pudiera trazar su ubicación física o identidad real.</p>
                </section>
                <section>
                    <h2>II. La Neutralidad de la Identidad Ausente</h2>
                    <p>La desaparición de Satoshi en 2011 fue un acto de diseño de protocolo humano. Al no existir un 'Dictador Benévolo', la red Bitcoin fue obligada a madurar mediante el consenso de sus participantes, evitando la centralización ideológica que plaga a otros proyectos de capa 1.</p>
                </section>
            </div>`
        },
        {
            id: "silk-road-forensics-birth",
            title: "18. Silk Road y el Nacimiento del Análisis Forense",
            description: "Cómo el mercado negro forzó el desarrollo de herramientas de rastreo on-chain.",
            readTime: 240,
            content: `<div class="academy-article">
                <section>
                    <h2>I. El Mito del Anonimato Total</h2>
                    <p>Ross Ulbricht y Silk Road demostraron que Bitcoin es seudónimo, no anónimo. La persistencia inmutable de la blockchain permitió a agencias como el FBI realizar análisis de grafos para trazar el flujo de fondos. De aquí nacieron empresas de inteligencia como Chainalysis, mercantilizando la transparencia nativa del protocolo.</p>
                </section>
            </div>`
        },
        {
            id: "wei-dai-bmoney-proposal",
            title: "19. Wei Dai y b-money",
            description: "La propuesta de un sistema de efectivo electrónico distribuido y anónimo.",
            readTime: 180,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Los Invariantes de Wei Dai</h2>
                    <p>En 1998, Wei Dai publicó la propuesta de 'b-money', que ya contenía la idea de que cada participante mantuviera una base de datos propia de saldos. Satoshi citó a Dai en la primera referencia de su Whitepaper, reconociendo el linaje intelectual de b-money en la arquitectura de Bitcoin.</p>
                </section>
            </div>`
        },
        {
            id: "twenty-one-million-supply",
            title: "20. ¿Por qué 21 Millones?",
            description: "La matemática de la escasez: Modelado de la política monetaria algorítmica.",
            readTime: 125,
            content: `<div class="academy-article">
                <section>
                    <h2>I. Escasez Programada</h2>
                    <p>La cifra de 21 millones no es arbitraria. Satoshi Nakamoto diseñó Bitcoin para ser un activo deflacionario, utilizando un modelo donde la recompensa por bloque se reduce a la mitad cada 210,000 bloques (aproximadamente 4 años), un evento conocido como "Halving".</p>
                </section>
                <section>
                    <h2>II. La Curva de Emisión Convergente</h2>
                    <p>Matemáticamente, la suma de la progresión geométrica de las recompensas tiende a 21 millones. Esta política monetaria inmutable contrasta radicalmente con el sistema fíat, donde la masa monetaria puede expandirse indefinidamente, diluyendo el valor del ahorro individual.</p>
                    <pre><code>Total Supply = 210,000 * (50 + 25 + 12.5 + 6.25 + ...) = 20,999,999.9769...</code></pre>
                </section>
            </div>`
        }
    ]
}
];
