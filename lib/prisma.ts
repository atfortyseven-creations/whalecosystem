import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// ─────────────────────────────────────────────────────────────────────────────
// COSMIC ENTITY TYPE BRIDGE
// The Prisma client was generated before CosmicEntity was added to the schema.
// This type declaration makes the TypeScript compiler aware of prisma.cosmicEntity
// so that all forge services compile correctly right now.
// Once `npx prisma generate` is run the generated types supersede this cast.
// ─────────────────────────────────────────────────────────────────────────────

type CosmicEntityRecord = {
  id: string;
  seedHash: string;
  whaleEventId: string | null;
  tier: string;
  amountUSD: number;
  chain: string;
  generatorType: string;
  status: string;
  artMetadata: Prisma.JsonValue | null;
  musicMetadata: Prisma.JsonValue | null;
  biotechMetadata: Prisma.JsonValue | null;
  worldSimMetadata: Prisma.JsonValue | null;
  agentMetadata: Prisma.JsonValue | null;
  contractAddress: string | null;
  hiveEnergyAtBirth: number;
  evolutionCount: number;
  parentEntityId: string | null;
  beneficiaryAddr: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CosmicEntityWhereInput = Partial<{
  id: string;
  seedHash: string;
  status: string | { in: string[] };
  tier: string;
  chain: string;
  amountUSD: number;
}>;

type CosmicEntityWhereUniqueInput = { id?: string; seedHash?: string };

type CosmicEntityAggregateArgs = {
  where?: CosmicEntityWhereInput;
  _sum?: Partial<Record<'amountUSD' | 'hiveEnergyAtBirth' | 'evolutionCount', boolean>>;
  _count?: boolean | Partial<Record<keyof CosmicEntityRecord, boolean>>;
  _avg?: Partial<Record<'amountUSD' | 'hiveEnergyAtBirth', boolean>>;
};

type CosmicEntityDelegate = {
  findMany(args?: {
    where?: CosmicEntityWhereInput;
    orderBy?: Partial<Record<keyof CosmicEntityRecord, 'asc' | 'desc'>>;
    take?: number;
    skip?: number;
  }): Promise<CosmicEntityRecord[]>;
  findUnique(args: { where: CosmicEntityWhereUniqueInput }): Promise<CosmicEntityRecord | null>;
  findFirst(args?: { where?: CosmicEntityWhereInput; orderBy?: Partial<Record<keyof CosmicEntityRecord, 'asc' | 'desc'>> }): Promise<CosmicEntityRecord | null>;
  create(args: { data: Omit<Partial<CosmicEntityRecord>, 'id' | 'createdAt' | 'updatedAt'> }): Promise<CosmicEntityRecord>;
  update(args: { where: CosmicEntityWhereUniqueInput; data: Partial<CosmicEntityRecord> }): Promise<CosmicEntityRecord>;
  updateMany(args: { where?: CosmicEntityWhereInput; data: Partial<CosmicEntityRecord> }): Promise<Prisma.BatchPayload>;
  delete(args: { where: CosmicEntityWhereUniqueInput }): Promise<CosmicEntityRecord>;
  deleteMany(args?: { where?: CosmicEntityWhereInput }): Promise<Prisma.BatchPayload>;
  count(args?: { where?: CosmicEntityWhereInput }): Promise<number>;
  aggregate(args: CosmicEntityAggregateArgs): Promise<{
    _sum: { amountUSD: number | null; hiveEnergyAtBirth: number | null; evolutionCount: number | null };
    _count: { _all: number };
    _avg: { amountUSD: number | null; hiveEnergyAtBirth: number | null };
  }>;
};

// ─────────────────────────────────────────────────────────────────────────────
// WALLET INTELLIGENCE TYPE BRIDGE
// WalletIntelligence was added to schema.prisma but npx prisma generate
// has not been run yet. This bridge makes the TypeScript compiler aware of
// prisma.walletIntelligence immediately, without regenerating the client.
// ─────────────────────────────────────────────────────────────────────────────

type WalletIntelligenceRecord = {
  id: string;
  address: string;
  forensics: Prisma.JsonValue | null;
  category: string | null;
  updatedAt: Date;
  createdAt: Date;
};

type WalletIntelligenceDelegate = {
  findMany(args?: {
    where?: Partial<{ address: string | { in: string[] }; category: string }>;
    select?: Partial<Record<keyof WalletIntelligenceRecord, boolean>>;
    orderBy?: Partial<Record<keyof WalletIntelligenceRecord, 'asc' | 'desc'>>;
    take?: number;
    skip?: number;
  }): Promise<Partial<WalletIntelligenceRecord>[]>;
  findUnique(args: {
    where: { id?: string; address?: string };
    select?: Partial<Record<keyof WalletIntelligenceRecord, boolean>>;
  }): Promise<Partial<WalletIntelligenceRecord> | null>;
  upsert(args: {
    where: { address: string };
    create: Partial<WalletIntelligenceRecord>;
    update: Partial<WalletIntelligenceRecord>;
  }): Promise<WalletIntelligenceRecord>;
  count(args?: { where?: Partial<{ address: string; category: string }> }): Promise<number>;
};

/** PrismaClient augmented with models not yet reflected in the generated client */
type SovereignPrismaClient = PrismaClient & {
  cosmicEntity: CosmicEntityDelegate;
  walletIntelligence: WalletIntelligenceDelegate;
};

function getProductionUrl(): string | undefined {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;

    try {
        const urlObj = new URL(rawUrl);
        if (urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:') {
            // Force PgBouncer
            urlObj.searchParams.set('pgbouncer', 'true');
            // Safe Institutional limit: 10 connections per instance prevents starvation
            urlObj.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '10');
            // Aggressive TCP timeout
            urlObj.searchParams.set('connect_timeout', '10');
            // Max time a connection can be held in the pool
            urlObj.searchParams.set('pool_timeout', '15');
            // Kill queries taking longer than 8s to prevent total DB lockup
            urlObj.searchParams.set('statement_timeout', '8000');
        }
        return urlObj.toString();
    } catch {
        return rawUrl;
    }
}

function createPrismaClient(): PrismaClient {
    const url = process.env.NODE_ENV === 'production' ? getProductionUrl() : undefined;

    const client = new PrismaClient({
        datasources: url ? { db: { url } } : undefined,
        log: process.env.NODE_ENV === 'production' 
            ? [{ level: 'error', emit: 'event' }] 
            : ['query', 'error', 'warn'],
    });

    // Sovereign error filter: suppress P1009 (table not in DB yet) which floods logs
    // during the window between schema push and migration. Log all other errors normally.
    if (process.env.NODE_ENV === 'production') {
        (client as any).$on('error', (e: any) => {
            const msg: string = e?.message || '';
            // Suppress schema-lag errors that are self-healing via /api/admin/sync-db
            const isSchemaBehind =
                msg.includes('does not exist in the current database') || // table/column missing
                msg.includes('P1009') ||
                msg.includes('P2021') || // table does not exist
                msg.includes('P2022') || // column does not exist
                msg.includes('42703') || // PostgreSQL raw: column does not exist
                msg.includes('Invalid `prisma.'); // Validation error thrown during try/catch fallbacks
            if (!isSchemaBehind) {
                console.error('[PRISMA] DB Error:', msg.length > 500 ? msg.slice(0, 500) + '...' : msg);
            }
        });
    }

    return client;
}

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as unknown as SovereignPrismaClient;

// Always store the singleton globally, even in production, to prevent Serverless/Edge connection explosions
(globalForPrisma as unknown as { prisma: SovereignPrismaClient }).prisma = prisma;

export default prisma;
