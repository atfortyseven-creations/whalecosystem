import React, { createContext, useContext, useEffect, useState } from 'react';
import { PXE, createPXEClient, waitForPXE, AztecAddress } from '@aztec/aztec.js';

interface AztecContextType {
    pxe: PXE | null;
    isReady: boolean;
    error: string | null;
    walletAddress: AztecAddress | null;
}

const AztecContext = createContext<AztecContextType>({
    pxe: null,
    isReady: false,
    error: null,
    walletAddress: null,
});

export const AztecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pxe, setPxe] = useState<PXE | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<AztecAddress | null>(null);

    useEffect(() => {
        const initAztec = async () => {
            try {
                // Conectar al PXE local (Aztec Sandbox)
                const pxeClient = createPXEClient('http://localhost:8080');
                await waitForPXE(pxeClient, 10);
                setPxe(pxeClient);
                setIsReady(true);
                
                // En un entorno de producción, esto vendría de la wallet real del usuario
                // Por ahora, obtenemos las cuentas del sandbox
                const accounts = await pxeClient.getRegisteredAccounts();
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0].address);
                }
                
                console.log("🟢 Aztec PXE Connected & Ready");
            } catch (err: any) {
                console.error("🔴 Failed to connect to Aztec PXE:", err);
                setError(err.message || "Failed to initialize Aztec PXE");
            }
        };

        initAztec();
    }, []);

    return (
        <AztecContext.Provider value={{ pxe, isReady, error, walletAddress }}>
            {children}
        </AztecContext.Provider>
    );
};

export const useAztec = () => useContext(AztecContext);
