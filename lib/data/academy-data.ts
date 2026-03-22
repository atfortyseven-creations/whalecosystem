import { forensicsModules } from "./academy/forensics";
import { genesisModules } from "./academy/genesis";
import { disasterModules } from "./academy/disasters";
import { defiModules } from "./academy/defi";
import { layer2Modules } from "./academy/layer2";
import { securityModules } from "./academy/security";
import { nftDaoModules } from "./academy/nfts-daos";
import { tradingModules } from "./academy/trading";
import { macroModules } from "./academy/macro";
import { cryptographyModules } from "./academy/cryptography";
import { bridgesModules } from "./academy/bridges";
import { regulationModules } from "./academy/regulation";
import { advancedDefiModules } from "./academy/advanced-defi";
import { scamEducationModules } from "./academy/scam-education";
import { ecosystemModules } from "./academy/ecosystems";
import { aiWeb3Modules } from "./academy/ai-web3";
import { tokenomicsModules } from "./academy/tokenomics-advanced";
import { accountAbstractionModules } from "./academy/account-abstraction";
import { rwaInstitutionalModules } from "./academy/rwa-institutional";
import { depinModules } from "./academy/depin-infra";
import { darkWebHistoryModules } from "./academy/dark-web-history";
import { advancedAnalyticsModules } from "./academy/advanced-analytics";

export interface AcademyArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    readTime: number;
}

export interface AcademyModule {
    id: string;
    title: string;
    description: string;
    articles: AcademyArticle[];
}

// Academia Completa de Máxima Perfección: 460 artículos de conocimiento extremo sobre la EVM,
// DeFi, seguridad, criptografía, IA, RWA, DePIN, Tokenómica y Macroeconomía.
// Arquitectura modular e infinitamente escalable para usuarios VIP.
export const ACADEMY_MODULES: AcademyModule[] = [
    ...forensicsModules,          // I & II: 40 artículos
    ...advancedAnalyticsModules,  // III:    20 artículos
    ...genesisModules,            // IV:     20 artículos
    ...disasterModules,           // V:      20 artículos
    ...defiModules,               // VI:     20 artículos
    ...layer2Modules,             // VII:    20 artículos
    ...securityModules,           // VIII:   20 artículos
    ...nftDaoModules,             // IX:     20 artículos
    ...tradingModules,            // X:      20 artículos
    ...macroModules,              // XI:     20 artículos
    ...cryptographyModules,       // XII:    20 artículos
    ...bridgesModules,            // XIII:   20 artículos
    ...regulationModules,         // XIV:    20 artículos
    ...advancedDefiModules,       // XV:     20 artículos
    ...scamEducationModules,      // XVI:    20 artículos
    ...ecosystemModules,          // XVII:   20 artículos
    ...aiWeb3Modules,             // XVIII:  20 artículos
    ...tokenomicsModules,         // XIX:    20 artículos
    ...accountAbstractionModules, // XX:     20 artículos
    ...rwaInstitutionalModules,   // XXI:    20 artículos
    ...depinModules,              // XXII:   20 artículos
    ...darkWebHistoryModules,     // XXIII:  20 artículos
];

// Total Exacto: 460 Artículos de contenido técnico institucional en Español.
