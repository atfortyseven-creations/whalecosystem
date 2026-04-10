import { prisma } from '@/lib/prisma';
import { 
  TransactionStatus, 
  type TransactionType, 
  type CreateTransactionData, 
  type TransactionMetadata 
} from './transactions';

export async function createTransaction(data: CreateTransactionData) {
  return prisma.transaction.create({
    data: {
      txHash: data.hash,
      type: data.type,
      status: data.status,
      fromAddress: data.from,
      toAddress: data.to,
      amount: parseFloat(data.value) || 0,
      token: data.tokenSymbol || 'ETH',
      timestamp: new Date(),
    },
  });
}

export async function getTransactionHistory(authUserId: string, options?: any) {
  const where: any = { 
    OR: [
      { fromAddress: authUserId },
      { toAddress: authUserId }
    ]
  };
  
  if (options?.type) {
    where.type = options.type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  return transactions.map((t: any) => ({
    ...t,
    hash: t.txHash,
    from: t.fromAddress,
    to: t.toAddress,
    value: t.amount.toString(),
    tokenSymbol: t.token
  }));
}

export async function getTransactionByHash(hash: string) {
  return prisma.transaction.findUnique({
    where: { txHash: hash },
  });
}

export async function updateTransactionStatus(
  hash: string,
  status: TransactionStatus,
  metadata?: Partial<TransactionMetadata>
) {
  return prisma.transaction.update({
    where: { txHash: hash },
    data: {
      status,
    },
  });
}

export async function getPendingTransactions(authUserId: string) {
  return prisma.transaction.findMany({
    where: {
      OR: [
        { fromAddress: authUserId },
        { toAddress: authUserId }
      ],
      status: TransactionStatus.PENDING,
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getTransactionStats(authUserId: string) {
  const baseWhere = {
    OR: [
      { fromAddress: authUserId },
      { toAddress: authUserId }
    ]
  };

  const [total, pending, confirmed, failed] = await Promise.all([
    prisma.transaction.count({ where: baseWhere }),
    prisma.transaction.count({ where: { ...baseWhere, status: TransactionStatus.PENDING } }),
    prisma.transaction.count({ where: { ...baseWhere, status: TransactionStatus.CONFIRMED } }),
    prisma.transaction.count({ where: { ...baseWhere, status: TransactionStatus.FAILED } }),
  ]);

  return { total, pending, confirmed, failed };
}

