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
    if (asset.logoURI && (asset.logoURI.startsWith('http') || asset.logoURI.startsWith('/'))) {
        return asset.logoURI;
    }
    
    // Fallbacks
    if (asset.address && asset.address !== 'native' && asset.address.length === 42) {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${asset.address}/logo.png`;
    }

    if (asset.symbol === 'ETH') return 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880';
    if (asset.symbol === 'POL') return 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png';
    if (asset.symbol === 'USDC') return 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png';
    if (asset.symbol === 'USDT') return 'https://assets.coingecko.com/coins/images/325/small/Tether.png';
    if (asset.symbol === 'AAVE') return 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png';
    if (asset.symbol === 'LINK') return 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png';
    if (asset.symbol === 'DAI') return 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png';
    if (asset.symbol === 'CRV') return 'https://assets.coingecko.com/coins/images/12124/small/Curve.png';
    if (asset.symbol === 'MKR') return 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png';
    if (asset.symbol === 'ARB') return 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png';

    if (asset.symbol) {
        return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset.symbol.toLowerCase()}.png`;
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
            <div className={cn("flex items-center justify-center font-black uppercase tracking-tight bg-black text-white", className, fallbackClassName)}>
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
