// prisma/seed.ts
import { PrismaClient, IdentityTier, MarketStatus, ProposalStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Initiating Genesis Operation...')

    // 1. Crear el Arquitecto (TU USUARIO)
    // IMPORTANTE: Cambia 'admin_wallet_01' por tu wallet real si quieres ver esto logueado
    const admin = await prisma.user.upsert({
        where: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
        update: {},
        create: {
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            email: 'admin@humanidfi.com',
            tier: IdentityTier.SOVEREIGN, // Maximum tier
            reputation: 9000,
        },
    })
    console.log('👤 Usuario Soberano creado.')

    // 2. Inject Capital into Treasury (Make the charts go up)
    await prisma.treasurySnapshot.create({
        data: {
            totalValueLocked: 54000000.50, // $54 Millones
            circulatingSupply: 12000000,
            protocolRevenue: 350000.75,    // $350k ganados
        },
    })
    console.log('💰 Treasury funded.')

    // 3. Crear un Mercado Activo (Bitcoin)
    const market = await prisma.market.upsert({
        where: { slug: 'bitcoin-100k-2026' },
        update: {},
        create: {
            slug: 'bitcoin-100k-2026',
            question: 'Will Bitcoin hit $100k before Q3 2026?',
            category: 'Crypto',
            status: MarketStatus.ACTIVE,
            endDate: new Date('2026-06-30'),
            volume: 1500000,    // 1.5M Volumen
            liquidity: 500000,  // 500k Liquidez
        },
    })
    console.log('📈 Mercado de Bitcoin abierto.')

    // 4. Crear una Propuesta de Gobernanza
    await prisma.marketProposal.create({
        data: {
            question: 'Should we increase staking rewards?',
            description: 'Proposal to increase APY from 5% to 8% for Sovereign members.',
            outcomes: ["Yes", "No"],
            resolutionCriteria: 'Majority vote',
            category: 'Governance',
            creatorAddress: admin.walletAddress,
            creatorNullifier: 'nullifier-hash-secret-123',
            status: ProposalStatus.VOTING,
            votingEndsAt: new Date('2026-02-28'),
            votesFor: 150,
            votesAgainst: 20,
        }
    })
    console.log('🗳️ Propuesta de Gobernanza activa.')

    // 5. Crear una Noticia de Inteligencia (Intel)
    await prisma.intelItem.create({
        data: {
            source: 'Bloomberg AI',
            title: 'Regulatory Approval for Human-Fi likely in Q2',
            category: 'Regulation',
            url: 'https://bloomberg.com/crypto/human-fi',
            publishedAt: new Date(),
            sentimentScore: 0.85, // Muy positivo
            aiSummary: 'Fuentes internas confirman que la SEC ve con buenos ojos el modelo de identidad.',
        }
    })
    // 6. Inicializar Categorías del Foro Soberano
    const categoryCount = await (prisma as any).forumCategory.count();
    if (categoryCount === 0) {
        await (prisma as any).forumCategory.createMany({
            data: [
                { name: 'Announcements',    slug: 'announcements', description: 'Official network updates and protocol changes.',                         color: '#2D0A59', orderIndex: 1 },
                { name: 'Governance',       slug: 'governance',    description: 'Proposals, voting discussions, and treasury allocations.',              color: '#D4AF37', orderIndex: 2 },
                { name: 'Research & Alpha', slug: 'research',      description: 'High-level macro analysis, on-chain data, and institutional insights.',  color: '#0066FF', orderIndex: 3 },
                { name: 'Technical Support',slug: 'support',       description: 'Smart contract debugging, SDK assistance, and bug reports.',             color: '#E11D48', orderIndex: 4 },
            ]
        });
        console.log('🗂️  Forum categories initialized.')
    } else {
        console.log(`🗂️  Forum categories already exist (${categoryCount}) — skipping.`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
