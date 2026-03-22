import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { clerkClient } from '@clerk/nextjs/server';

// ============================================
// SECURITY LAYER 1: Rate Limiting
// ============================================

export function rateLimit(
  identifier: string,
  tier: 'FREE' | 'PREMIUM' | 'CRITICAL' = 'FREE'
): { allowed: boolean; remaining: number; resetIn: number } {
  // EMERGENCY BYPASS
  return { allowed: true, remaining: 1000, resetIn: 0 };
}

// ============================================
// SECURITY LAYER 2: Subscription Verification
// ============================================

export async function verifyPremiumAccess(userId: string): Promise<{
  valid: boolean;
  tier: 'FREE' | 'PREMIUM' | 'TRIAL' | 'SOVEREIGN';
  expiresAt?: Date;
}> {
  try {
    // 1. ADMIN BYPASS
    if (process.env.ADMIN_EMAIL) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if (user?.primaryEmailAddress?.emailAddress === process.env.ADMIN_EMAIL) {
          return { valid: true, tier: 'PREMIUM' };
        }
      } catch (e) {}
    }

    // 2. CHECK LEGENDARY DB TIER (One-time payments)
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId },
      select: { tier: true }
    });

    if (user?.tier === 'SOVEREIGN' || user?.tier === 'HUMAN') {
       return { valid: true, tier: 'SOVEREIGN' };
    }

    // 3. LEGACY SUBSCRIPTION CHECK (Recurring)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gte: new Date() },
      },
    });
    
    if (!subscription) return { valid: false, tier: 'FREE' };
    return { valid: true, tier: 'PREMIUM', expiresAt: subscription.expiresAt };
  } catch (error) {
    return { valid: false, tier: 'FREE' };
  }
}

// ============================================
// SECURITY LAYER 6: CSRF Protection
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

export function generateCSRFToken(userId: string): string {
  const timestamp = Date.now();
  const randomData = crypto.randomBytes(32).toString('hex');
  const payload = `${userId}:${timestamp}:${randomData}`;
  const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
  const signature = hmac.update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifyCSRFToken(token: string, userId: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    const [tokenUserId, timestamp] = payload.split(':');
    if (tokenUserId !== userId) return false;
    if (Date.now() - parseInt(timestamp) > 900000) return false;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    const expectedSignature = hmac.update(payload).digest('hex');
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

// ============================================
// SECURITY LAYER 8: Security Event Logging
// ============================================

export async function logSecurityEvent(
  event: string,
  details: any
): Promise<void> {
  console.error(`[SECURITY EVENT] ${event}`, details);
  try {
    await prisma.securityEvent.create({
      data: {
        type: event,
        ipAddress: details.ip || 'unknown',
        metadata: details || {},
        severity: details.severity || 'INFO',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[SECURITY] Failed to log security event:', error);
  }
}

export async function logAuditEvent(log: {
  userId: string;
  action: string;
  resource: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        metadata: log.metadata || {},
        ip: log.ip,
        userAgent: log.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[SECURITY] Audit log failed:', error);
  }
}

// ============================================
// SECURITY LAYER 9: Request Validation
// ============================================

export async function validateSecureRequest(
  req: NextRequest,
  requiredTier: 'FREE' | 'PREMIUM' = 'FREE'
): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  const { userId: clerkUserId } = getAuth(req);
  const web3Address = req.headers.get('x-web3-address');
  
  // 🔥 [LEGENDARY IDENTITY FUSION]
  let userId = clerkUserId;
  if (!userId && web3Address && /^0x[a-fA-F0-9]{40}$/.test(web3Address)) {
      userId = web3Address.toLowerCase();
  }

  console.log(`[AUTH-DEBUG] clerkUserId: ${clerkUserId}, web3Address: ${web3Address}, final userId: ${userId}`);
  
  if (!userId) {
    console.warn('[AUTH-DEBUG] No userId found in request');
    return { valid: false, error: 'Unauthorized' };
  }
  
  // Owner Bypass
  if (clerkUserId && process.env.ADMIN_EMAIL) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      if (user?.primaryEmailAddress?.emailAddress === process.env.ADMIN_EMAIL) {
        return { valid: true, userId };
      }
    } catch (e) {}
  }

  if (requiredTier === 'PREMIUM') {
    const access = await verifyPremiumAccess(userId);
    if (!access.valid) return { valid: false, error: 'Premium required' };
  }
  
  if (req.method !== 'GET') {
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, userId)) {
        return { valid: false, error: 'Invalid CSRF' };
    }
  }
  
  return { valid: true, userId };
}

export function watermarkData(data: any, userId: string): any {
  return { ...data, _ts: Date.now() };
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"\\]/g, '').trim().slice(0, 1000);
}

export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) || /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
}

