/**
 * WHALE ALERT NETWORK - INSTITUTIONAL CONSTANTS
 * 
 * Centralized registry for visual assets, identities, and system parameters.
 */

export const VISUAL_ASSETS = {
    WALLPAPER: '/patron-cosmico-4k.png',
    WAVES: '/olas-hokusai-4k.png',
    LOGO_MONOCHROME: '/official-whale-monochrome.png',
    LOGO_LEGENDARY: '/official-whale-legendary.png',
    WALLETS: {
        METAMASK: '/wallets/metamask.svg',
        COINBASE: '/wallets/coinbase.png',
        RAINBOW: '/wallets/rainbow.png',
        GENERIC: '/official-whale-monochrome.png', // Fallback
    }
};

export const SYSTEM_THEME = {
    BG: '#FAF9F6', // Institutional Ivory
    INK: '#050505',
    MUTED: 'rgba(5, 5, 5, 0.60)',
    ACCENT: '#00F2EA', // Cyan highlight
};

export const OWNER_EMAILS = [
    'atfortyseven2@gmail.com',
    'josemanx2000@gmail.com',
    'admin@polymarketwallet.com'
];

/**
 * [SECURITY] Whitelisted wallet addresses for administrative functions.
 * Universal connection is enabled, but these addresses retain elevated privileges.
 */
export const OWNER_WALLETS = [
    '0x66c5D65f7560e90967F57e753e19E92e62BC2390', // Primary Owner
];
