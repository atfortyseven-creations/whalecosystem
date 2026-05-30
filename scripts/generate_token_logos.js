const fs = require('fs');
const path = require('path');

const LOGO_DIR = path.join(__dirname, '../public/system-shots/logostoken');
const OUT_FILE = path.join(__dirname, '../lib/data/allowed-tokens.ts');

function generateTokenLogos() {
    if (!fs.existsSync(LOGO_DIR)) {
        console.error('Logo directory not found!');
        return;
    }

    const files = fs.readdirSync(LOGO_DIR);
    
    // The logo format seems to be {name}-{symbol}-logo.png or just {symbol}.png.
    // Let's create a robust mapping by parsing the filename.
    const logoMap = {};
    
    files.forEach(file => {
        if (!file.endsWith('.png') && !file.endsWith('.svg')) return;
        
        let symbol = null;
        
        // Common format: name-symbol-logo.png or just symbol-logo.png
        // E.g. bitcoin-btc-logo.png -> btc
        // E.g. tether-usdt-logo.png -> usdt
        // E.g. polygon-matic-logo.png -> matic
        // E.g. ethereum-eth-logo-colored.svg -> eth
        const parts = file.replace('.png', '').replace('.svg', '').split('-');
        
        // Let's try to find the symbol. It's usually the part before 'logo'
        const logoIndex = parts.indexOf('logo');
        if (logoIndex > 0) {
            symbol = parts[logoIndex - 1];
        } else {
            // fallback: might just be name-symbol.png, we just guess or use the whole name if simple
            // We'll also just map by lowercase string matching later.
            symbol = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        }
        
        if (symbol) {
            logoMap[symbol.toUpperCase()] = `/system-shots/logostoken/${file}`;
        }
    });

    // Special hardcodes for known mismatches
    logoMap['POL'] = logoMap['MATIC'] || logoMap['POL']; // MATIC/POL
    logoMap['BTC'] = logoMap['BTC'];
    logoMap['ETH'] = logoMap['ETH'];
    logoMap['USDT'] = logoMap['USDT'];
    logoMap['USDC'] = logoMap['USDC'];
    logoMap['SOL'] = logoMap['SOL'];

    // Generate TS content
    const content = `// AUTO-GENERATED. DO NOT EDIT MANUALLY.
// Maps token symbols to their validated local logo paths.
export const ALLOWED_TOKEN_LOGOS: Record<string, string> = ${JSON.stringify(logoMap, null, 4)};

export function getValidatedLogo(symbol: string): string | null {
    if (!symbol) return null;
    return ALLOWED_TOKEN_LOGOS[symbol.toUpperCase()] || null;
}

export function isTokenAllowed(symbol: string): boolean {
    if (!symbol) return false;
    return !!ALLOWED_TOKEN_LOGOS[symbol.toUpperCase()];
}
`;

    fs.writeFileSync(OUT_FILE, content, 'utf8');
    console.log(`Generated allowed-tokens.ts with ${Object.keys(logoMap).length} tokens.`);
}

generateTokenLogos();
