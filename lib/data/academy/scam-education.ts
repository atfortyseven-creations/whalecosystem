export const scamEducationModules = [
    {
        id: "scam-education",
        title: "XVI. Enciclopedia del Fraude Cripto: Reconocer y Sobrevivir los Peores Esquemas",
        description: "Análisis profundo de los esquemas más sofisticados del ecosistema. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "malicious-contracts-backdoors",
                title: "1. Backdoors en Smart Contracts: El Código Venenoso",
                description: "Lógica oculta en protocolos auditados.",
                readTime: 60,
                content: "<h2>Trampas Matemáticas</h2><p>Funciones como delegatecall() usadas incorrectamente pueden permitir a un atacante tomar control total de un contrato. A veces el equipo deja una backdoor 'para emergencias' que termina siendo usada para drenar los fondos.</p>"
            },
            {
                id: "cloud-mining-fake-hashrate",
                title: "2. Cloud Mining y Hashrate Falso",
                description: "Vendiendo máquinas que no existen.",
                readTime: 50,
                content: "<h2>Potencia Fantasma</h2><p>Plataformas que ofrecen alquilar potencia de minado para generar BTC pasivo. En el 99.9% de los casos, no hay hardware real; los pagos iniciales se hacen con el dinero de otros usuarios hasta que el sitio cierra repentinamente.</p>"
            },
            {
                id: "deepfake-ai-scams",
                title: "3. Deepfakes y Fraude con IA",
                description: "Elon Musk y Vitalik falsos en vivo.",
                readTime: 40,
                content: "<h2>Realidad Sintética</h2><p>Videos generados por IA de personalidades famosas promocionando 'regalos' (giveaways) de cripto en YouTube o Twitter. Si mueven los labios de forma extraña o la oferta suena demasiado buena, es un video falso diseñado para robarte.</p>"
            },
            {
                id: "dusting-attacks-privacy",
                title: "4. Dusting Attacks: El Rastreo Silencioso",
                description: "Pequeñas cantidades con grandes riesgos.",
                readTime: 40,
                content: "<h2>Polvo Espía</h2><p>El atacante envía cantidades ínfimas (micro-satoshis) a miles de direcciones. Si el usuario intenta mover ese 'polvo', el atacante puede desanonimizar las wallets vinculadas mediante análisis de grafos de transacciones.</p>"
            },
            {
                id: "future-of-scams-metaverse-ai",
                title: "5. El Futuro: Scams en el Metaverso y por IA",
                description: "Nuevas fronteras del fraude digital.",
                readTime: 75,
                content: "<h2>Ingeniería Social 2.0</h2><p>Scams donde avatares de IA te seducen en realidades virtuales o donde IAs personalizadas estudian tu comportamiento para lanzarte ataques de phishing perfectos. La educación continua es la única vacuna contra el fraude en la era digital.</p>"
            },
            {
                id: "fake-exchanges-withdrawal-fees",
                title: "6. Exchanges Falsos y Tasas de Retiro",
                description: "Atrapando capital en plataformas fantasma.",
                readTime: 50,
                content: "<h2>Plataformas Prisión</h2><p>Sitios web que imitan exchanges serios. Permiten depositar fácilmente, pero al intentar retirar, piden pagar 'impuestos' o 'seguros' inexistentes. Cada pago solo lleva a otra excusa para pedir más dinero.</p>"
            },
            {
                id: "exit-scams-soft-rugs",
                title: "7. Exit Scams y Soft Rugs: El Abandono Lento",
                description: "Cuando el equipo deja de trabajar.",
                readTime: 40,
                content: "<h2>Muerte por Inacción</h2><p>A diferencia del rug pull violento, el soft rug es gradual. El equipo vende sus tokens lentamente, deja de actualizar el código y desaparece de redes sociales, drenando el valor del proyecto de forma menos detectable legalmente.</p>"
            },
            {
                id: "malicious-permit-signatures",
                title: "8. Firmas 'Permit' Maliciosas: El Drenado Invisible",
                description: "Aprobaciones off-chain de alto riesgo.",
                readTime: 55,
                content: "<h2>Firmas sin Gas</h2><p>Usando el estándar EIP-2612, un sitio malicioso te hace firmar un mensaje off-chain. Esta firma permite al atacante ejecutar un 'permit' y vaciar tus tokens sin que tú hayas hecho una transacción on-chain visible.</p>"
            },
            {
                id: "giveaway-scams-send-1-get-2",
                title: "9. Giveaway Scams: 'Envía 1, Recibe 2'",
                description: "La estafa más vieja de internet en cripto.",
                readTime: 35,
                content: "<h2>El Doble de Nada</h2><p>Promesas de que si envías BTC a una dirección, te devolverán el doble como parte de una 'promoción'. Nadie regala dinero. Una vez que envías los fondos, son irrecuperables por la naturaleza inmutable de la blockchain.</p>"
            },
            {
                id: "ponzi-schemes-history",
                title: "10. Grandes Ponzis: OneCoin y PlusToken",
                description: "La insostenibilidad del retorno garantizado.",
                readTime: 50,
                content: "<h2>Dinámicas Piramidales</h2><p>Esquemas que pagan a viejos inversores con dinero de nuevos. OneCoin ($4B+) y PlusToken ($6B) son los ejemplos más devastadores. Si el rendimiento es garantizado y depende de referidos, es un Ponzi.</p>"
            },
            {
                id: "honeypots-unsellable-tokens",
                title: "11. HoneyPots: El Token que No Se Puede Vender",
                description: "Atrapando inversores en una calle sin salida.",
                readTime: 50,
                content: "<h2>Solo Entrada, No Salida</h2><p>Un contrato que permite comprar tokens pero cuya función transfer() falla deliberadamente si el emisor no es el owner. Ves cómo el precio sube, pero eres incapaz de realizar ganancias. Tu capital queda atrapado para siempre.</p>"
            },
            {
                id: "fake-liquidity-wash-trading",
                title: "12. Liquidez Falsa en DEXs: Creando Confianza",
                description: "Bots que compran y venden en segundos.",
                readTime: 45,
                content: "<h2>Actividad Artificial</h2><p>Proyectos que usan bots para simular miles de transacciones por minuto. Esto atrae a los bots de tendencia y a inversores reales que ven 'momentum', ocultando que no hay usuarios reales detrás del proyecto.</p>"
            },
            {
                id: "romance-scams-pig-butchering",
                title: "13. Pig Butchering: El Scam Sentimental",
                description: "Ingeniería social a largo plazo.",
                readTime: 55,
                content: "<h2>Engorde y Matanza</h2><p>El estafador construye una relación de confianza durante meses antes de sugerir una 'inversión' en una plataforma falsa. Las víctimas pierden sus ahorros de vida tras ver ganancias ficticias que nunca pueden retirar sin pagar 'tasas' adicionales infinitas.</p>"
            },
            {
                id: "pump-and-dump-mechanics",
                title: "14. Pump and Dump: Manipulación en Microcaps",
                description: "Grupos de Telegram y ballenas coordinadas.",
                readTime: 45,
                content: "<h2>Inflado y Vaciado</h2><p>Grupos organizados eligen un token de baja liquidez, lo compran primero y luego incitan a la masa a comprar ('Pump'). Cuando el precio sube, los organizadores venden masivamente ('Dump'), dejando a los minoristas con pérdidas del 90%.</p>"
            },
            {
                id: "reentrancy-defi-exploits",
                title: "15. Re-entrancy: El Fallo que Mató a The DAO",
                description: "Explotando la ejecución recursiva.",
                readTime: 55,
                content: "<h2>Bucle Infinito de Robo</h2><p>El atacante llama a una función que le transfiere fondos, y antes de que el contrato actualice su balance, vuelve a llamar a la función. Esto permite retirar fondos una y otra vez hasta vaciar el vault. Es el error de programación más caro de la historia.</p>"
            },
            {
                id: "rug-pull-identification",
                title: "16. Rug Pulls: Anatomía del Engaño",
                description: "Indicadores de liquidez y contratos.",
                readTime: 55,
                content: "<h2>Robo Planificado</h2><p>Un Rug Pull ocurre cuando los desarrolladores retiran la liquidez de un proyecto tras atraer inversores. Detectarlos requiere analizar si la liquidez está bloqueada (via Unicrypt/Team Finance) y si el contrato tiene funciones maliciosas como mint() sin límites.</p>"
            },
            {
                id: "telegram-discord-bot-scams",
                title: "17. Scams en Telegram y Discord: El Peligro del DM",
                description: "Bots maliciosos e ingeniería social.",
                readTime: 45,
                content: "<h2>Soporte Falso</h2><p>Cualquier 'Soporte Técnico' que te contacte primero por MD es un scammer. Nunca compartas pantalla, nunca descargues archivos '.exe' y nunca escribas tu frase semilla en un bot de validación de servidor.</p>"
            },
            {
                id: "sim-swapping-2fa-risks",
                title: "18. SIM Swapping: El Robo de Identidad Móvil",
                description: "Bypass de seguridad telefónica.",
                readTime: 45,
                content: "<h2>Control Telefónico</h2><p>El atacante convence a la operadora de transferir tu número a su SIM. Con acceso a tus SMS, resetea tus contraseñas de exchanges. Defensa: NUNCA uses SMS como 2FA; usa Google Authenticator o llaves físicas Yubikey.</p>"
            },
            {
                id: "vanity-address-clipboard",
                title: "19. Vanity Attacks y Clipboard Hijacking",
                description: "Malware que cambia tus direcciones.",
                readTime: 45,
                content: "<h2>Copia y Pega Fatal</h2><p>Virus que detectan cuando copias una dirección cripto y la reemplazan en el portapapeles por una del atacante visualmente similar (Address Poisoning). Verifica siempre los caracteres finales de la dirección antes de enviar.</p>"
            },
            {
                id: "nft-wash-trading-scams",
                title: "20. Wash Trading en NFTs: El Volumen Falso",
                description: "Manipulando precios de colecciones.",
                readTime: 50,
                content: "<h2>Espejismos de Demanda</h2><p>Los creadores compran y venden sus propios NFTs entre wallets propias para inflar el precio y el volumen. El inversor desprevenido compra pensando que hay interés real, solo para descubrir que no hay liquidez de salida real.</p>"
            }
        ]
    }
];
