export const accountAbstractionModules = [
    {
        id: "account-abstraction-wallets",
        title: "XX. Account Abstraction y el Futuro de las Wallets",
        description: "EIP-4337, Smart Accounts, recuperación social y la muerte de las seed phrases. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "signature-abstraction-biometrics",
                title: "1. Abstracción de Firma: FaceID y Passkeys",
                description: "Usando biometría para asegurar tu capital.",
                readTime: 45,
                content: "<h2>Tu Cuerpo es tu Llave</h2><p>La abstracción de firma permite usar estándares Web2 como WebAuthn. Firma transacciones con el FaceID de tu iPhone o el lector de huellas de tu PC, eliminando la necesidad de gestionar claves privadas complejas manualmente.</p>"
            },
            {
                id: "intent-based-architectures",
                title: "2. Arquitecturas Basadas en Intenciones (Intents)",
                description: "Diciendo 'qué' quieres, no 'cómo' hacerlo.",
                readTime: 50,
                content: "<h2>Delegación Inteligente</h2><p>En lugar de firmar cada paso técnico, el usuario firma una 'Intención' (ej. 'quiero 1 ETH al mejor precio'). Un ecosistema de 'Solvers' compite para ejecutar esa orden de la forma más eficiente, optimizando rutas y gas automáticamente.</p>"
            },
            {
                id: "batching-transactions-efficiency",
                title: "3. Batching: Múltiples Acciones, una Firma",
                description: "Ahorrando tiempo y comisiones en cada operación.",
                readTime: 40,
                content: "<h2>Flujos de Trabajo Atómicos</h2><p>Con Account Abstraction puedes 'Approve', 'Swap' y 'Stake' en una sola firma. Esto elimina la necesidad de esperar confirmaciones entre pasos y reduce drásticamente el coste total de gas al empaquetar las operaciones.</p>"
            },
            {
                id: "bundlers-mempool-ecosystem",
                title: "4. Bundlers: Los Nuevos Actores del Ecosistema",
                description: "Cómo se procesan las UserOperations.",
                readTime: 45,
                content: "<h2>El Mercado del Orden</h2><p>Los Bundlers son los encargados de empaquetar las intenciones de los usuarios. Reciben incentivos para ser eficientes y rápidos, creando un nuevo nicho de infraestructura necesario para que la abstracción de cuenta sea escalable y resistente a la censura.</p>"
            },
            {
                id: "compliance-rbac-enterprise",
                title: "5. Cumplimiento y Control de Acceso (RBAC)",
                description: "Políticas de gasto para empresas y herencia.",
                readTime: 50,
                content: "<h2>Gobernanza de Fondos Personalizada</h2><p>Define quién puede gastar cuánto y en qué protocolos. Permite crear cuentas corporativas donde el tesorero tiene límites diarios y los socios deben firmar operaciones mayores, todo gestionado por código inmutable.</p>"
            },
            {
                id: "eip-4337-architecture",
                title: "6. EIP-4337: El Estándar Maestro",
                description: "Bundlers, EntryPoint y la arquitectura sin hard-fork.",
                readTime: 65,
                content: "<h2>Transacciones Abstractas</h2><p>EIP-4337 introduce las 'UserOperations'. Un 'Bundler' las agrupa y un 'EntryPoint' las valida. Esto permite que el usuario no necesite ETH para pagar gas y que la lógica de validación sea totalmente flexible y personalizable.</p>"
            },
            {
                id: "eip-7702-eoa-bridge",
                title: "7. EIP-7702: Convirtiendo Metamask en Smart Account",
                description: "El puente temporal hacia la abstracción total.",
                readTime: 60,
                content: "<h2>Upgrade para Todos</h2><p>EIP-7702 permite que las EOAs actuales (como las de Ledger o Metamask) actúen temporalmente como Smart Accounts. Esto trae las ventajas de AA a los millones de usuarios existentes sin forzarlos a crear nuevas carteras.</p>"
            },
            {
                id: "future-invisible-wallets",
                title: "8. El Futuro: La Wallet Invisible",
                description: "Hacia una integración total en la vida digital.",
                readTime: 75,
                content: "<h2>Blockchain como Capa de Fondo</h2><p>En el futuro, la 'wallet' como concepto desaparecerá. Tendremos identidades digitales soberanas que gestionan valor de forma invisible, segura y automática en cada interacción digital, democratizando el acceso a la banca global del siglo XXI.</p>"
            },
            {
                id: "eoa-vs-smart-accounts",
                title: "9. EOA vs Smart Accounts: El Fin de la Fricción",
                description: "Diferencia entre claves privadas puras y cuentas programables.",
                readTime: 50,
                content: "<h2>Adiós a las Seed Phrases</h2><p>Las Externally Owned Accounts (EOAs) tradicionales como Metamask dependen de una frase semilla. Las Smart Accounts trasladan la lógica a un Smart Contract, permitiendo que la seguridad no dependa de un solo papel, sino de políticas programables de recuperación y firma.</p>"
            },
            {
                id: "erc-6900-modular-smart-accounts",
                title: "10. ERC-6900: Wallets Modulares y Plugins",
                description: "Personalizando tu cuenta como si fueran apps de móvil.",
                readTime: 55,
                content: "<h2>Instalando Funciones</h2><p>El estándar de módulos permite añadir funcionalidades a tu wallet (como un plugin de herencia o un checker de riesgo) de forma segura. Tu cuenta evoluciona conmigo, permitiendo instalar o desinstalar lógicas sin migrar tus fondos.</p>"
            },
            {
                id: "dao-governance-smart-accounts",
                title: "11. Gobernanza de DAOs vía Smart Accounts",
                description: "Voto delegado y ejecución automática de propuestas.",
                readTime: 45,
                content: "<h2>Democracia Programable Real</h2><p>Las Smart Accounts permiten que los votos de una DAO se traduzcan en acciones directas on-chain de forma trustless. Elimina la necesidad de intermediarios humanos y acelera la ejecución de decisiones comunitarias complejas.</p>"
            },
            {
                id: "mpc-wallets",
                title: "12. MPC Wallets: Criptografía Threshold",
                description: "Partición de llaves y custodia institucional.",
                readTime: 60,
                content: "<h2>Claves que nunca se juntan</h2><p>Multi-Party Computation (MPC) permite firmar transacciones dividiendo la clave en fragmentos que nunca se unen en un solo sitio. Es el estándar de oro para la custodia institucional, combinando la seguridad de la descentralización con la eficiencia de una firma única.</p>"
            },
            {
                id: "privacy-stealth-accounts",
                title: "13. Privacidad y Stealth Accounts en AA",
                description: "Ocultando el rastro transaccional sin sacrificar usabilidad.",
                readTime: 55,
                content: "<h2>Privacidad por Defecto</h2><p>Integrar direcciones furtivas (stealth) en las Smart Accounts permite recibir fondos sin exponer tu saldo público o historial a ojos curiosos, manteniendo el cumplimiento normativo mediante llaves de visualización opcionales.</p>"
            },
            {
                id: "social-recovery-guardians",
                title: "14. Recuperación Social y Guardianes",
                description: "Cómo no perder tus fondos si pierdes tu dispositivo.",
                readTime: 50,
                content: "<h2>Seguridad Adaptativa</h2><p>La recuperación social permite configurar 'Guardianes' (amigos, otras wallets o instituciones) que pueden votar para rotar tu clave de acceso si la pierdes. Ya no hay un punto único de fallo: la soberanía digital se vuelve recuperable y segura.</p>"
            },
            {
                id: "session-keys-gaming-htf",
                title: "15. Session Keys: Gaming y Trading sin Fricción",
                description: "Permisos temporales para interacciones fluidas.",
                readTime: 50,
                content: "<h2>Firmas Automáticas Seguras</h2><p>Las llaves de sesión permiten otorgar permiso a un juego o aplicación para firmar transacciones de bajo valor durante un tiempo limitado. Juega o tradea sin que una ventana emergente de confirmación interrumpa tu flujo de trabajo cada segundo.</p>"
            },
            {
                id: "multichain-smart-accounts",
                title: "16. Smart Accounts Multi-Chain: Visión Unificada",
                description: "Manejando tus activos en todas las L2s desde un solo sitio.",
                readTime: 50,
                content: "<h2>Abstracción de Red</h2><p>El usuario no debería saber en qué red está operando. Las Smart Accounts multi-chain sincronizan estados y permisos entre redes, permitiendo una experiencia de 'cuenta única' que fluye entre Ethereum, Optimism y Arbitrum sin esfuerzo.</p>"
            },
            {
                id: "onchain-subscriptions-recurring",
                title: "17. Suscripciones y Pagos Recurrentes",
                description: "El Netflix de la Web3 es posible gracias a AA.",
                readTime: 50,
                content: "<h2>Pagos Automáticos Sin Permiso</h2><p>Permite autorizar pagos mensuales de forma automática hacia un servicio sin tener que firmar cada mes. Es la pieza que falta para que los modelos de negocio SaaS (Software as a Service) funcionen nativamente en la blockchain.</p>"
            },
            {
                id: "gasless-transactions-paymasters",
                title: "18. Transacciones Sin Gas y Paymasters",
                description: "Dejando que la aplicación pague por el usuario.",
                readTime: 45,
                content: "<h2>Eliminando la Barrera del Token Nativo</h2><p>Los 'Paymasters' permiten que un tercero (el protocolo o un sponsor) pague el gas de la transacción. El usuario puede interactuar con DeFi sin tener que comprar ETH previamente, usando USDC para el gas o disfrutando de periodos gratuitos.</p>"
            },
            {
                id: "waas-magic-privy-onboarding",
                title: "19. Wallet-as-a-Service (WaaS): El Puente Web2.5",
                description: "Onboarding con Email y redes sociales.",
                readTime: 45,
                content: "<h2>Abstracción Total de la Crypto</h2><p>Servicios como Privy o Magic permiten crear una wallet segura con un simple login de Google. El usuario interactúa con la blockchain sin saberlo, mientras que en el fondo se genera una Smart Account protegida por MPC.</p>"
            },
            {
                id: "secure-enclave-hybrid-wallets",
                title: "20. Wallets Híbridas y Secure Enclave",
                description: "Seguridad de Hardware en tu Smartphone.",
                readTime: 50,
                content: "<h2>Bóvedas en el Chip</h2><p>Integrar las Smart Accounts con el Secure Enclave del móvil garantiza que la llave privada nunca salga del hardware físico del dispositivo, combinando la facilidad de uso de una app móvil con la seguridad de una Ledger.</p>"
            }
        ]
    }
];
