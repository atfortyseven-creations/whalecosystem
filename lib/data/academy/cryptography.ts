export const cryptographyModules = [
    {
        id: "cryptography-fundamentals",
        title: "XII. Fundamentos Criptográficos de la Blockchain",
        description: "Las bases matemáticas intransigentes que hacen posible la confianza sin intermediarios: hashing, firmas digitales y criptografía de curvas elípticas. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "wallet-encryption-argon2",
                title: "1. Argon2 y Derivación de Llaves de Wallet",
                description: "Protección de frases semilla contra fuerza bruta.",
                readTime: 45,
                content: "<h2>Resistencia a ASICs</h2><p>Argon2 es el estándar moderno para hash de contraseñas. Al derivar la llave de una wallet cifrada, Argon2 usa memoria intensiva para que sea imposible atacar la contraseña mediante GPUs o ASICs, protegiendo tus fondos locales.</p>"
            },
            {
                id: "elliptic-curve-cryptography",
                title: "2. Criptografía de Curvas Elípticas (ECC)",
                description: "ECDSA, secp256k1 y derivación de llaves.",
                readTime: 55,
                content: "<h2>Asimetría de Poder</h2><p>Blockchain usa ECC por su eficiencia. La curva secp256k1 (y²=x³+7) genera llaves públicas multiplicando la privada por el punto G. El ECDLP garantiza que derivar la privada desde la pública sea computacionalmente imposible. Las direcciones son el hash de la pública truncada.</p>"
            },
            {
                id: "pqc-quantum-resistance",
                title: "3. Criptografía Post-Cuántica (PQC)",
                description: "Preparando Windows contra Sbor y Shor.",
                readTime: 55,
                content: "<h2>Resiliencia Futura</h2><p>Los ordenadores cuánticos (algoritmo de Shor) romperán ECDSA y RSA. La PQC usa problemas basados en retículos (Lattices) como Dilithium y Kyber, que son resistentes a ataques cuánticos, asegurando la longevidad de los activos digitales.</p>"
            },
            {
                id: "fhe-privacy",
                title: "4. FHE: Fully Homomorphic Encryption (FHE)",
                description: "Computación sobre datos cifrados.",
                readTime: 70,
                content: "<h2>El Santo Grial</h2><p>FHE permite procesar datos sin descifrarlos. Una red FHE (como Zama) puede ejecutar un contrato inteligente sobre datos privados, produzciendo un resultado cifrado que solo el dueño puede ver, manteniendo privacidad total en la ejecución.</p>"
            },
            {
                id: "bls-signatures",
                title: "5. Firmas BLS y Agregación de Validadores",
                description: "El corazón del Staking en Ethereum 2.0.",
                readTime: 45,
                content: "<h2>Consenso Masivo</h2><p>Boneh-Lynn-Shacham (BLS) permite agregar miles de firmas en una sola constante. Sin BLS, Ethereum no podría soportar cientos de miles de validadores, ya que el ancho de banda para verificar cada firma individual colapsaría la red.</p>"
            },
            {
                id: "schnorr-taproot",
                title: "6. Firmas Schnorr y el Upgrade Taproot (BIP-340)",
                description: "Linealidad y agregación de firmas en Bitcoin.",
                readTime: 50,
                content: "<h2>Eficiencia Lineal</h2><p>Schnorr (BIP-340) reemplaza ECDSA ofreciendo firmas más pequeñas y seguras. Su mayor ventaja es la agregación: múltiples firmantes de un multisig producen una firma indistinguible de una individual, mejorando la privacidad y reduciendo costos de datos.</p>"
            },
            {
                id: "hash-functions",
                title: "7. Funciones Hash Criptográficas: Pilares de Inmutabilidad",
                description: "SHA-256, Keccak-256 y resistencia a colisiones.",
                readTime: 45,
                content: "<h2>Huellas Digitales Matemáticas</h2><p>Una función hash es determinista, resistente a preimagen y colisiones, con efecto avalancha. SHA-256 (NSA) es el motor de Bitcoin; Keccak-256 (competición SHA-3) es el estándar de Ethereum. Los Merkle Trees permiten verificar el todo mediante las partes (Root) con eficiencia logarítmica.</p>"
            },
            {
                id: "lattice-based-cryptography",
                title: "8. Lattice: Criptografía basada en Retículos (Lattices)",
                description: "La frontera final del cifrado avanzado.",
                readTime: 80,
                content: "<h2>Geometría de la Privacidad</h2><p>La dureza de encontrar el vector más corto en un retículo de alta dimensión es la base de la criptografía post-cuántica y homomórfica. Es la matemática que dominará la seguridad financiera global en las próximas décadas.</p>"
            },
            {
                id: "consensus-mechanisms",
                title: "9. Mecanismos de Consenso: Arquitectura del Acuerdo",
                description: "PoW, PoS, BFT y Teoría de Juegos.",
                readTime: 55,
                content: "<h2>Resolviendo el Problema de los Generales Bizantinos</h2><p>PoW usa energía como ancla de realidad; PoS usa capital en riesgo (Slash). Protocolos BFT (Tendermint) ofrecen finalidad instantánea pero escalabilidad limitada. Avalanche usa muestreo probabilístico para lograr latencia de microsegundos.</p>"
            },
            {
                id: "merkle-mountain-ranges",
                title: "10. Merkle Mountain Ranges (MMR)",
                description: "Estructuras de datos para light clients.",
                readTime: 45,
                content: "<h2>Hojas Dinámicas</h2><p>A diferencia de los Merkle Trees estáticos, los MMR crecen eficientemente permitiendo añadir nuevos datos sin recalcular todo el árbol. Son fundamentales para protocolos como Mimblewimble y para sincronización ultra-rápida de nodos.</p>"
            },
            {
                id: "mpc-wallets",
                title: "11. Multi-Party Computation (MPC)",
                description: "Umbrales de seguridad sin Single Point of Failure.",
                readTime: 60,
                content: "<h2>Llaves Fragmentadas</h2><p>MPC permite que múltiples partes computen una firma sin que la llave privada completa exista nunca en un solo lugar. Es el estándar institucional para custodia, superando al multisig tradicional al ser agnóstico a la cadena y más privado.</p>"
            },
            {
                id: "digital-signatures-pki",
                title: "12. PKI y Certificados: Confianza vs. Descentralización",
                description: "TLS, CAs y el reemplazo por Blockchain.",
                readTime: 45,
                content: "<h2>Soberanía Identitaria</h2><p>La PKI tradicional depende de Autoridades Certificadoras (CAs) centralizadas. Blockchain (ENS, Handshake) propone un reemplazo descentralizado donde la propiedad se demuestra por posesión de llaves, eliminando intermediarios vulnerables a coerción estatal.</p>"
            },
            {
                id: "plonk-halo2",
                title: "13. PlonK y HALO2: El Renacimiento ZK",
                description: "Sistemas de prueba universales y sin trust setup.",
                readTime: 70,
                content: "<h2>Pruebas de Pruebas</h2><p>PlonK estandarizó las ZK-SNARKs universales. HALO2 (Zcash) eliminó la necesidad de ceremonias iniciales de confianza (Trusted Setup) mediante recursión, permitiendo blockchains infinitamente escalables y verificables en dispositivos móviles.</p>"
            },
            {
                id: "polynomial-commitments",
                title: "14. Polynomial Commitments y KZG",
                description: "La base del Proto-Danksharding.",
                readTime: 65,
                content: "<h2>Compresión de Datos</h2><p>KZG (Kate-Zaverucha-Goldberg) permite comprometerse a un polinomio y probar cualquier punto sin revelar el polinomio completo. Es vital para EIP-4844 en Ethereum, permitiendo que los L2s verifiquen datos masivos de forma ultra-eficiente.</p>"
            },
            {
                id: "primitives-salsa-chacha",
                title: "15. Primitivas: XOR, Salsa20 y ChaCha20",
                description: "Cifrado de flujo para máxima velocidad.",
                readTime: 40,
                content: "<h2>Velocidad de Cifrado</h2><p>Mientras que AES es estándar, ChaCha20 ofrece un rendimiento superior en software sin hardware dedicado. Entender estas primitivas y el uso de Nonces es crucial para la seguridad de las comunicaciones P2P en la red.</p>"
            },
            {
                id: "zero-knowledge-proofs",
                title: "16. Pruebas de Conocimiento Cero (ZKP)",
                description: "zk-SNARKs, STARKs y privacidad extrema.",
                readTime: 60,
                content: "<h2>Demostrar sin Revelar</h2><p>Las ZKPs permiten validar afirmaciones (edad, balance, validez de transacción) sin exponer los datos sensibles. SNARKs (Zcash) y STARKs (StarkWare) son la base de la escalabilidad y privacidad moderna. La recursión permite comprimir blockchains enteras en bytes.</p>"
            },
            {
                id: "shamir-secret-sharing",
                title: "17. Shamir Secret Sharing (SSS)",
                description: "Distribución de secretos mediante polinomios.",
                readTime: 40,
                content: "<h2>Fragmentos del Destino</h2><p>SSS divide un secreto (como una Seed Phrase) en N partes, requiriendo M para reconstruirlo. Basado en que M puntos definen un polinomio de grado M-1, permite una recuperación social robusta frente a pérdida o robo parcial.</p>"
            },
            {
                id: "sparse-merkle-trees",
                title: "18. Sparse Merkle Trees (SMT)",
                description: "Indexación de estado en Rollups.",
                readTime: 50,
                content: "<h2>Árboles Infinitos</h2><p>Los SMT representan un espacio de claves gigante (2^256) donde la mayoría de las hojas están vacías (hashes de cero). Permiten probar inclusiones y NO-inclusiones de forma eficiente, base de la gestión de estado en ZK-Rollups.</p>"
            },
            {
                id: "vdf-time-delay",
                title: "19. Verifiable Delay Functions (VDF)",
                description: "Introduciendo el tiempo determinista en la red.",
                readTime: 50,
                content: "<h2>Relojes Criptográficos</h2><p>Las VDFs garantizan que una computación tome un tiempo mínimo real, siendo imposible de acelerar mediante paralelismo. Se usan en Ethereum y Solana para prevenir ataques de manipulación de orden y generar aleatoriedad imparcial (vía RANDAO).</p>"
            },
            {
                id: "verkle-trees",
                title: "20. Verkle Trees y Vector Commitments",
                description: "El futuro del Statelessness en Ethereum.",
                readTime: 60,
                content: "<h2>Pruebas de Estado de un Solo Paso</h2><p>Los Verkle Trees usan Vector Commitments en lugar de hashes. Permiten generar pruebas mucho más pequeñas que los Merkle Trees, lo que permitirá a los nodos de Ethereum funcionar sin almacenar todo el estado (Stateless Clients).</p>"
            }
        ]
    }
];
