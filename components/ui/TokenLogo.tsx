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
    if (asset.logoURI && asset.logoURI.startsWith('http')) return asset.logoURI;
    
    // Construct the URL to our new internal proprietary API
    const params = new URLSearchParams();
    if (asset.symbol) params.append('symbol', asset.symbol);
    if (asset.address) params.append('address', asset.address);
    
    return `/api/token-logo?${params.toString()}`;
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
