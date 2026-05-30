import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TokenLogoProps {
    symbol: string;
    name?: string;
    address?: string;
    logoURI?: string | null;
    className?: string;
    fallbackClassName?: string;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ symbol, name, logoURI, className, fallbackClassName }) => {
    const s = symbol?.toLowerCase() || '';
    const n = name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '';

    // Build fallback chain
    const sources: string[] = [];
    if (logoURI && (logoURI.startsWith('http') || logoURI.startsWith('/'))) {
        sources.push(logoURI);
    }
    
    // 1. High priority: the exact local quantum folder file naming convention
    if (n && s) {
        sources.push(`/system-shots/logostoken/${n}-${s}-logo.png`);
    }

    // 2. Specific Overrides
    const overrides: Record<string, string> = {
        'eth': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
        'usdc': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png',
        'usdt': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
        'dai': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dai.png',
        'link': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png',
        'aave': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/aave.png',
        'crv': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/crv.png',
        'mkr': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/mkr.png',
        'arb': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/arb.png',
        'pol': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png',
        'matic': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png',
        'op': 'https://assets.coincap.io/assets/icons/op@2x.png',
        'pepe': 'https://assets.coincap.io/assets/icons/pepe@2x.png',
        'shib': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/shib.png',
        'btc': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
        'usde': 'https://assets.coincap.io/assets/icons/usde@2x.png',
    };
    if (s && overrides[s]) {
        sources.push(overrides[s]);
    }

    // 3. Fallback: coincap by ticker
    if (s) {
        sources.push(`https://assets.coincap.io/assets/icons/${s}@2x.png`);
    }

    const [srcIndex, setSrcIndex] = useState(0);

    useEffect(() => {
        setSrcIndex(0);
    }, [symbol, name, logoURI]);

    if (srcIndex >= sources.length || sources.length === 0) {
        return (
            <div className={cn("flex items-center justify-center font-black uppercase tracking-tight bg-black text-white", className, fallbackClassName)}>
                {typeof symbol === 'string' ? symbol.slice(0, 2) : '?'}
            </div>
        );
    }

    return (
        <img 
            src={sources[srcIndex]} 
            alt={symbol || 'Token'} 
            className={cn("object-contain", className)} 
            onError={() => setSrcIndex(i => i + 1)} 
        />
    );
};
