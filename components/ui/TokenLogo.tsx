import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TokenLogoProps {
    symbol: string;
    address?: string;
    logoURI?: string | null;
    className?: string;
    fallbackClassName?: string;
}

export function resolveTokenLogo(asset: { symbol?: string; address?: string; logoURI?: string | null }) {
    if (asset.logoURI) return asset.logoURI;
    const sym = asset.symbol?.toUpperCase();
    if (sym === 'ETH' || asset.address === 'native') {
        return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
    }
    if (sym === 'USDC') {
        return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png';
    }
    if (sym === 'USDT') {
        return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png';
    }
    if (sym === 'WBTC') {
        return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png';
    }
    if (sym === 'DAI') {
        return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png';
    }
    if (asset.address && asset.address.startsWith('0x') && asset.address.length === 42) {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${asset.address}/logo.png`;
    }
    return null;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ symbol, address, logoURI, className, fallbackClassName }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
        setImgSrc(resolveTokenLogo({ symbol, address, logoURI }));
    }, [symbol, address, logoURI]);

    if (!imgSrc || hasError) {
        return (
            <div className={cn("flex items-center justify-center font-black uppercase tracking-tight bg-black/5  text-black/60 ", className, fallbackClassName)}>
                {typeof symbol === 'string' ? symbol.slice(0, 2) : '?'}
            </div>
        );
    }

    return (
        <img 
            src={imgSrc} 
            alt={symbol || 'Token'} 
            className={cn("object-contain", className)} 
            onError={() => setHasError(true)} 
        />
    );
};
