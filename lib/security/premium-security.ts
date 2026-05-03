import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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
// SECURITY LAYER 2: Subscription Verification — NATIVE SOVEREIGN
// ============================================

export async function verifyPremiumAccess(userId: string): Promise<{
  valid: boolean;
  tier: 'FREE' | 'PREMIUM' | 'TRIAL' | 'SOVEREIGN';
  expiresAt?: Date;
}> {
  try {
    // 1. Native DB TIER check (One-time payments and Sovereign tier)
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId },
      select: { tier: true }
    });

    if (user?.tier === 'SOVEREIGN' || user?.tier === 'HUMAN') {
       return { valid: true, tier: 'SOVEREIGN' };
    }

    // 2. Subscription check from native DB
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
        details: JSON.stringify(details) || null,
        severity: details.severity || 'INFO',
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
  // AuditLog table does not exist in schema.prisma — log to native Log model
  try {
    await prisma.log.create({
      data: {
        level: 'info',
        message: `AUDIT: ${log.action} on ${log.resource}`,
        source: 'premium-security',
        metadata: {
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          data: log.metadata || {},
          ip: log.ip,
          userAgent: log.userAgent,
        },
      },
    });
  } catch (error) {
    console.error('[SECURITY] Audit log failed:', error);
  }
}

// ============================================
// SECURITY LAYER 9: Request Validation — SOVEREIGN SIWE
// ============================================

export async function validateSecureRequest(
  req: NextRequest,
  requiredTier: 'FREE' | 'PREMIUM' = 'FREE'
): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  // SOVEREIGN: Use SIWE session token as primary auth mechanism
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    return { valid: false, error: 'Unauthorized' };
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
