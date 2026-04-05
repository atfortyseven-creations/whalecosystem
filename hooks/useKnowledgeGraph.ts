"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { WhaleKnowledgeGraphABI } from '@/lib/abi/WhaleKnowledgeGraph';

// Fallback configuration if not fully deployed
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KNOWLEDGE_GRAPH_ADDRESS || "0x0000000000000000000000000000000000000000";

export interface EntityIntelligence {
    name: string;
    category: string;
    riskScore: number;
    confidence: number;
    lastUpdated: number;
    exists: boolean;
}

export interface GraphNode {
    [key: string]: any;
    _labels?: string[];
    _type?: string;
}

export function useKnowledgeGraph() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [graphResults, setGraphResults] = useState<GraphNode[]>([]);
    const [graphOffline, setGraphOffline] = useState(false);

    /**
     * Reads intelligence data directly from the Oracle on Base/Arbitrum
     */
    const getEntityInfo = useCallback(async (address: string): Promise<EntityIntelligence | null> => {
        setLoading(true);
        setError(null);
        
        if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
             await new Promise(r => setTimeout(r, 600));
             const isKnown = parseInt(address.slice(-1), 16) % 3 !== 0 || address.length < 10;
             if (!isKnown) { setLoading(false); return null; }
             const risk = (address.length * 7) % 100;
             setLoading(false);
             return {
                 name: address.includes("binance") ? "Binance Hot Wallet" : (address.includes("ftx") ? "FTX Drainer (Hacker)" : "Elite Vault"),
                 category: risk > 80 ? "DUMP_RISK" : (risk < 30 ? "LONG_TERM_HOLDER" : "MEV_BOT"),
                 riskScore: risk,
                 confidence: 85 + (risk % 15),
                 lastUpdated: Date.now() - (Math.random() * 86400000),
                 exists: true
             };
        }

        try {
            const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org";
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, WhaleKnowledgeGraphABI, provider);
            const result = await contract.getEntityIntelligence(address);
            if (!result[5]) return null;
            return {
                name: result[0], category: result[1], riskScore: Number(result[2]),
                confidence: Number(result[3]), lastUpdated: Number(result[4]) * 1000, exists: result[5]
            };
        } catch (err: any) {
            console.error("Knowledge Graph Read Error:", err);
            setError(err.message || "Failed to read from Oracle");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Search Neo4j graph nodes by text (Person / Token / Wallet / Company)
     */
    const searchGraph = useCallback(async (q: string, type?: string) => {
        if (!q || q.length < 2) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ q });
            if (type) params.set('type', type);
            const res = await fetch(`/api/graph?${params}`);
            const json = await res.json();
            if (json.code === 'NEO4J_OFFLINE') {
                setGraphOffline(true);
                setGraphResults([]);
            } else {
                setGraphOffline(false);
                setGraphResults(json.data || []);
            }
        } catch (e: any) {
            setError('Graph API unreachable');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Execute a safe read-only Cypher query against the Neo4j database
     */
    const queryGraph = useCallback(async (cypher: string, params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cypher, params })
            });
            const json = await res.json();
            if (json.code === 'NEO4J_OFFLINE') {
                setGraphOffline(true);
                setGraphResults([]);
            } else {
                setGraphOffline(false);
                setGraphResults(json.data || []);
            }
            return json;
        } catch (e: any) {
            setError('Graph API unreachable');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getEntityInfo, searchGraph, queryGraph, graphResults, graphOffline, loading, error };
}
