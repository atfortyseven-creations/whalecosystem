# PLAN DE EMPRESA  HUMANITY LEDGER
## Solicitud de Financiación: CDTI NEOTEC + ENISA Jóvenes Emprendedores
### Versión 2.1 | Abril 2026 | CONFIDENCIAL

---

## 1. RESUMEN EJECUTIVO

**Empresa:** Humanity Ledger SL (en constitución)
**Sector:** Ciberseguridad / Identidad Digital Soberana / Inteligencia Blockchain
**Tecnología:** Zero-Trust Authentication + On-Chain Analytics + eIDAS 2.0
**Mercado objetivo:** Fondos DeFi, DAOs, exchanges, reguladores europeos, gestores de activos digitales
**Financiación solicitada:** 250,000 (CDTI NEOTEC) + 75,000 (ENISA) = **325,000**
**Uso de fondos:** Auditoría de seguridad (15%), Desarrollo técnico (45%), Equipo (25%), Go-to-market (15%)

### Propuesta de Valor en Una Frase
> *"La única infraestructura de autenticación e inteligencia on-chain Zero-Trust, compatible con eIDAS 2.0, que detecta movimientos de ballenas institucionales en tiempo real con garantías criptográficas absolutas."*

---

## 2. PROBLEMA Y OPORTUNIDAD

### 2.1 El Problema

El ecosistema blockchain carece de infraestructura de identidad y autenticación que cumpla simultáneamente con:
- Estándares de ciberseguridad institucional (NIST, ENISA)
- Regulación europea de identidad digital (eIDAS 2.0)
- Soberanía de datos del usuario (GDPR, privacidad por diseño)
- Trazabilidad auditable de movimientos on-chain en tiempo real

Las soluciones actuales presentan tres deficiencias críticas:
1. **Fragmentación:** Las herramientas de análisis (Nansen, Arkham) y las de identidad (Civic, Identity) son incompatibles
2. **Centralización:** Todas las plataformas líderes almacenan datos en servidores de terceros, violando GDPR
3. **Falta de certificación:** Ninguna solución Web3 tiene alineación documentada con eIDAS 2.0 o NIST 800-207

### 2.2 El Mercado

| Segmento | TAM (2026) | CAGR | Cuota objetivo Y3 |
|---|---|---|---|
| DeFi Analytics & Analytics | $2,100M | 28% | 0.4% ($8.4M) |
| Web3 Identity & Authentication | $890M | 42% | 0.6% ($5.3M) |
| Blockchain Security Tools | $1,450M | 35% | 0.3% ($4.3M) |
| Digital Identity EU (post-eIDAS 2.0) | $3,200M | 51% | 0.05% ($1.6M) |
| **Total Addressable Market** | **$7,640M** | **34%** | **$19.6M** |

### 2.3 La Oportunidad Regulatoria

La implementación de eIDAS 2.0 (Regulation EU 2024/1183) crea una ventana de oportunidad única:
- Todos los servicios públicos europeos deben aceptar identidades digitales certificadas antes de **2026**
- El mercado de infraestructura de identidad digital en la UE crecerá de 890M a 3,200M entre 2024-2028
- Los actores blockchain que demuestren alineación eIDAS 2.0 tendrán ventaja competitiva masiva sobre rivales no-europeos (Coinbase, Nansen, Arkham  todos estadounidenses)

---

## 3. SOLUCIÓN  HUMANITY LEDGER

### 3.1 Arquitectura Técnica (Diferenciación)

Humanity Ledger integra en una sola plataforma soberana:

**Capa 1  Identidad Soberana (TitaniumGate):**
- Autenticación EIP-191 ECDSA (firma de cartera Ethereum  sin contraseñas)
- Protocolo Zero-Trust: cada request verificado criptográficamente, no hay confianza implícita
- Compatible con eIDAS 2.0 Level of Assurance Substantial

**Capa 2  Inteligencia On-Chain:**
- Motor Z-Score propietario: detecta ballenas institucionales con score de convicción 0-100
- Análisis termodinámico EVM: modela flujos de capital como sistemas físicos de energía
- Grafo Neo4j de entidades: 103 micro-sectores, actualización en tiempo real (< 900ms latencia)

**Capa 3  Audit Trail Institucional:**
- Registro inmutable HMAC-SHA256 con cadena de hashes (compatible ENISA audit requirements)
- No-repudiación criptográfica de todas las acciones de usuarios
- `verifyAuditTrailIntegrity()`: verificación matemática de ausencia de manipulación

### 3.2 Ventajas Competitivas

| Factor | Humanity Ledger | Nansen | Arkham | Dune Analytics |
|---|---|---|---|---|
| Zero-Trust nativo |  |  |  |  |
| eIDAS 2.0 alineado |  |  |  |  |
| Datos soberanos (no third-party) |  |  |  |  |
| Audit trail criptográfico |  |  |  |  |
| Motor de identidad integrado |  |  |  |  |
| Open-source parcial estratégico |  |  |  |  |
| Cumplimiento GDPR nativo |  | ️ |  | ️ |

---

## 4. MODELO DE NEGOCIO

### 4.1 Fuentes de Ingresos

**Ingresos Recurrentes (SaaS B2B):**

| Plan | Precio Mensual | Incluye | Target Cliente |
|---|---|---|---|
| STANDARD | 500/mes | 50k API calls, 5 wallets vigiladas | DeFi traders, analistas |
| PRO | 2,000/mes | 500k API calls, 50 wallets, dashboard completo | Fondos pequeños, DAOs |
| ELITE | 10,000/mes | Ilimitado, API privada, SLA 99.9% | Fondos institucionales, exchanges |
| Enterprise NODE | 15,000 + 500/mes | Nodo dedicado, datos en infraestructura propia | Bancos, reguladores |

**Ingresos de Licencia (B2B Enterprise):**
- Licencia API para integradores: 5,000-20,000/año
- White-label del motor de detección de ballenas: 30,000-100,000/implementación

**Consultoría de Seguridad:**
- Auditoría Zero-Trust para proyectos Web3: 15,000-50,000/proyecto
- Implementación eIDAS 2.0: 25,000-75,000/proyecto

**Financiación Pública:**
- CDTI NEOTEC: 250,000-325,000 (no dilutiva)
- ENISA Jóvenes Emprendedores: 75,000-300,000
- Digital Europe Programme (consorcio): 500,000-2,000,000

---

## 5. PROYECCIONES FINANCIERAS (5 AÑOS)

### Hipótesis Clave
- Conversión de usuarios beta (25 usuarios)  30% PRO/ELITE en Y1
- Crecimiento orgánico: 3 nuevos clientes PRO/mes a partir de M6
- Ticket medio inicial: 2,500/mes (mix de planes)
- Churn rate: 5% mensual (decreciente hasta 2% en Y3)

### Proyección Conservadora

| Métricas | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| Clientes activos | 15 | 45 | 120 | 280 | 550 |
| ARR (SaaS) | 40,000 | 200,000 | 600,000 | 1,500,000 | 3,500,000 |
| Ingresos consultoría | 20,000 | 60,000 | 150,000 | 300,000 | 500,000 |
| Grants/Subvenciones | 325,000 | 100,000 | 50,000 | 0 | 0 |
| **Ingresos Totales** | **385,000** | **360,000** | **800,000** | **1,800,000** | **4,000,000** |
| Gastos Operativos | 280,000 | 320,000 | 550,000 | 1,000,000 | 2,000,000 |
| **EBITDA** | **105,000** | **40,000** | **250,000** | **800,000** | **2,000,000** |
| Margen EBITDA | 27% | 11% | 31% | 44% | 50% |

### Proyección Ambiciosa

| Métricas | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| ARR (SaaS) | 150,000 | 600,000 | 2,000,000 | 5,000,000 | 12,000,000 |
| **Ingresos Totales** | **500,000** | **760,000** | **2,200,000** | **5,300,000** | **12,500,000** |
| **EBITDA** | **170,000** | **200,000** | **900,000** | **2,800,000** | **7,500,000** |

---

## 6. PLAN DE USO DE FONDOS (325,000)

| Categoría | Importe | % | Detalle |
|---|---|---|---|
| Desarrollo técnico | 146,250 | 45% | 2 desarrolladores senior 18 meses + infraestructura cloud |
| Equipo (fundador + primeras contrataciones) | 81,250 | 25% | Salario fundador 12 meses + 1 hire (DevSecOps) |
| Auditoría de seguridad | 48,750 | 15% | Hacken + Nethermind Security (externas) |
| Marketing y go-to-market | 32,500 | 10% | Conferencias (EthCC, DevConnect), contenido técnico |
| Legal y constitución | 16,250 | 5% | Constitución SL, registro PI, NDAs, DPIA |

---

## 7. EQUIPO

**[Nombre Fundador]  Fundador & CTO**
- Arquitecto principal del System Network Architecture
- Diseñador del Motor EVM Thermodynamico y TitaniumGate
- Experiencia: [X años] en desarrollo blockchain y seguridad Web3
- GitHub: [URL] | LinkedIn: [URL]

**Incorporaciones planificadas (con financiación):**
- **DevSecOps Engineer** (M3): Especialista en Kubernetes, pentest, CI/CD de seguridad
- **Business Development** (M6): Foco en clientes institucionales y fundraising europeo
- **Cryptography Researcher** (M9): ZK-SNARKs, eIDAS 2.0 implementación

---

## 8. ESTRATEGIA DE GO-TO-MARKET

### Fases de Comercialización

**Fase A  Validación (Meses 1-6):**
- Beta cerrada 25-35 usuarios seleccionados (cryptographers, analistas on-chain)
- Conseguir primeros 5 clientes PRO/ELITE de pago
- Publicar whitepaper técnico IEEE/ACM y 3 artículos técnicos en Mirror/Substack
- Presentar en 1 conferencia europea (EthCC Paris, DevConnect)

**Fase B  Lanzamiento Controlado (Meses 6-12):**
- Apertura de waitlist pública con acceso por invitación
- Partnership con 2-3 fondos DeFi europeos como early adopters
- Lanzar programa de referidos institucionales (comisión 15%)

**Fase C  Escala (Meses 12-24):**
- Integración con EUDI Wallet para autenticación cruzada
- Lanzamiento API pública (REST + WebSocket)
- Inicio de proceso de certificación ENISA EUDI Cybersecurity

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Competidor con más recursos entra el mercado | Media | Alto | Velocidad + PI registrada + comunidad europea |
| Regulación adversa a wallets Ethereum en UE | Baja | Alto | Alineación eIDAS 2.0 como ventaja regulatoria |
| Adopción más lenta de lo proyectado | Alta | Medio | Ingresos de consultoría como colchón; reducción de burn |
| Fallo técnico en producción | Baja | Alto | Chaos Engineering + circuit breakers + external audit |
| No obtención de grants | Media | Medio | Bootstrap viable desde M6 con primeros clientes |

---

## 10. HITOS CLAVE Y CRONOGRAMA

| Hito | Fecha | Indicador |
|---|---|---|
| Constitución SL | Septiembre 2026 | Escritura notarial |
| Registro PI (6 módulos) | Mayo 2026 | Número de registro |
| Auditoría externa completada | Agosto 2026 | Informe Hacken |
| Beta cerrada completada | Julio 2026 | NPS  70 |
| Primer cliente ELITE | Octubre 2026 | Contrato firmado |
| Solicitud CDTI NEOTEC | Mayo 2026 | Número expediente |
| Solicitud ENISA | Junio 2026 | Número expediente |
| ARR 100,000 | Diciembre 2026 | Facturación acumulada |
| Ronda seed (si procede) | Q1 2027 | 300,000-500,000 |

---

*Confidencial  Para distribución limitada a evaluadores de CDTI/ENISA y asesores designados*
*Versión: 2.1 | Abril 2026 | Humanity Ledger SL (en constitución)*
