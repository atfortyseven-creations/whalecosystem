import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/neo4j';

export const dynamic = 'force-dynamic';

/**
 * GET /api/graph?q=vitalik
 * Returns an entity node + its direct relationships
 * 
 * POST /api/graph
 * body: { cypher: string, params?: object }
 * Executes a safe read-only Cypher query
 */

// Allowlist of read-only Cypher templates (prevents writes/destructive ops)
const SAFE_PREFIXES = ['MATCH', 'OPTIONAL MATCH', 'CALL', 'RETURN', 'WITH', 'UNWIND'];

function isSafeQuery(cypher: string): boolean {
    const upper = cypher.trim().toUpperCase();
    const start = upper.split(/\s/)[0];
    return SAFE_PREFIXES.includes(start) && 
        !upper.includes('CREATE') &&
        !upper.includes('DELETE') &&
        !upper.includes('MERGE') &&
        !upper.includes('SET') &&
        !upper.includes('REMOVE') &&
        !upper.includes('DROP');
}

function serializeRecord(record: any) {
    const obj: Record<string, any> = {};
    for (const key of record.keys) {
        const val = record.get(key);
        if (val && typeof val === 'object' && val.properties) {
            // Neo4j node/relationship
            obj[key] = { ...val.properties, _labels: val.labels || [], _type: val.type };
        } else if (val && typeof val.toNumber === 'function') {
            obj[key] = val.toNumber();
        } else {
            obj[key] = val;
        }
    }
    return obj;
}

// — GET: Quick entity search
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all'; // 'token' | 'wallet' | 'person' | 'company' | 'all'
    
    if (!q || q.length < 2) {
        return NextResponse.json({ error: 'Query too short (min 2 chars)' }, { status: 400 });
    }

    try {
        // Search across multiple node types
        const cypher = type === 'wallet'
            ? `MATCH (w:Wallet) WHERE toLower(w.address) CONTAINS toLower($q) RETURN w LIMIT 10`
            : type === 'token'
            ? `MATCH (t:Token) WHERE toLower(t.symbol) CONTAINS toLower($q) OR toLower(t.name) CONTAINS toLower($q) RETURN t LIMIT 10`
            : type === 'person'
            ? `MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($q) OR toLower(p.slug) CONTAINS toLower($q) RETURN p LIMIT 10`
            : `
                CALL {
                    MATCH (n:Person) WHERE toLower(n.name) CONTAINS toLower($q) RETURN n AS node, 'Person' AS label LIMIT 5
                    UNION
                    MATCH (n:Token) WHERE toLower(n.symbol) CONTAINS toLower($q) RETURN n AS node, 'Token' AS label LIMIT 5
                    UNION
                    MATCH (n:Wallet) WHERE toLower(n.address) CONTAINS toLower($q) RETURN n AS node, 'Wallet' AS label LIMIT 5
                    UNION
                    MATCH (n:Company) WHERE toLower(n.name) CONTAINS toLower($q) RETURN n AS node, 'Company' AS label LIMIT 5
                }
                RETURN node, label
                LIMIT 20
            `;

        const result = await runQuery(cypher, { q });
        const records = result.records.map(serializeRecord);
        return NextResponse.json({ ok: true, count: records.length, data: records });

    } catch (e: any) {
        // If Neo4j is not connected (not configured), return graceful empty
        console.warn('[Graph] Neo4j query failed:', e.message);
        return NextResponse.json({ ok: false, data: [], error: 'Graph database not available', code: 'NEO4J_OFFLINE' }, { status: 200 });
    }
}

// — POST: Execute custom read-only Cypher
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cypher, params = {} } = body;

        if (!cypher || typeof cypher !== 'string') {
            return NextResponse.json({ error: 'cypher field required' }, { status: 400 });
        }

        if (!isSafeQuery(cypher)) {
            return NextResponse.json({ 
                error: 'Only read-only MATCH queries are allowed via this endpoint',
                hint: 'Remove CREATE/DELETE/MERGE/SET operations'
            }, { status: 403 });
        }

        const result = await runQuery(cypher, params);
        const records = result.records.map(serializeRecord);
        
        return NextResponse.json({ 
            ok: true, 
            count: records.length, 
            data: records,
            summary: {
                nodesCreated: 0,
                queryType: 'READ',
                availableAfter: result.summary.counters.updates()
            }
        });

    } catch (e: any) {
        console.warn('[Graph] Cypher execution failed:', e.message);
        return NextResponse.json({ ok: false, data: [], error: e.message, code: 'NEO4J_OFFLINE' }, { status: 200 });
    }
}
