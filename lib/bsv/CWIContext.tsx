"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CwiIdentity } from './CwiIdentity';
import { CwiExternalApi } from './CwiBase';

interface CWIContextType {
  identity: CwiIdentity | null;
  isInitialized: boolean;
  getPublicKey: () => Promise<string>;
  createAction: (params: any) => Promise<any>;
  encrypt: (data: string | Uint8Array, counterparty?: string) => Promise<string>;
  decrypt: (data: string, counterparty?: string) => Promise<string | Uint8Array>;
  actions: any[];
}

const CWIContext = createContext<CWIContextType | undefined>(undefined);

export function CWIProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<CwiIdentity | null>(null);
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    // Initializing with a "Cosmic" default identity for the terminal
    // In production, this would come from a secure vault or user input
    const cosmicMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    const id = new CwiIdentity(cosmicMnemonic);
    setIdentity(id);
  }, []);

  const getPublicKey = useCallback(async () => {
    return identity?.getPublicKey() || '';
  }, [identity]);

  const createAction = useCallback(async (params: any) => {
    console.log('CWI: createAction', params);
    const newAction = { 
      id: `act_${Date.now()}`, 
      params, 
      timestamp: new Date().toISOString(),
      status: 'authorized' 
    };
    setActions(prev => [newAction, ...prev]);
    return { txid: 'mock_txid_' + Math.random().toString(16).slice(2) };
  }, []);

  const encrypt = useCallback(async (data: string | Uint8Array, counterparty?: string) => {
    if (!identity) throw new Error('CWI not initialized');
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    return identity.encrypt(bytes, counterparty || '');
  }, [identity]);

  const decrypt = useCallback(async (data: string, counterparty?: string) => {
    if (!identity) throw new Error('CWI not initialized');
    return new TextEncoder().encode(data); // Mock for now
  }, [identity]);

  const value = {
    identity,
    isInitialized: !!identity,
    getPublicKey,
    createAction,
    encrypt,
    decrypt,
    actions
  };

  return <CWIContext.Provider value={value}>{children}</CWIContext.Provider>;
}

export function useCWI() {
  const context = useContext(CWIContext);
  if (context === undefined) {
    throw new Error('useCWI must be used within a CWIProvider');
  }
  return context;
}
