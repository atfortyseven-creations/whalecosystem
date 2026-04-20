import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

/**
 * SOVEREIGN AUTH UTILITIES
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Institutional requirement: min 8 chars, 1 uppercase, 1 number
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function generateVerificationCode(): string {
  // Secure 6-digit numeric pin
  const { randomInt } = require('crypto');
  return randomInt(100000, 1000000).toString();
}

/**
 * SOVEREIGN AUTH CONFIGURATION (High Pro 3.1)
 * 
 * PURGED: Google, Email, and Password providers.
 * Only SIWE and QR Handshake identities are supported to ensure 
 * 100% non-custodial sovereignty.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Providers are managed manually via SIWE and QR-Sync endpoints
    // to maintain absolute decoupling from third-party identity silos.
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,  // Refresh session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: 'human.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // On initial sign in
      if (trigger === 'signIn' || (user && account)) {
        try {
          const sessionId = crypto.randomUUID();
          token.sessionId = sessionId;

          const headersList = await headers();
          const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

          // Link to AuthUser if it exists (provisioned via SIWE or QR Sync)
          const authUser = await prisma.authUser.findFirst({
            where: { 
               OR: [
                 { email: token.email || 'REDACTED' },
                 { walletAddress: (token as any).address || '0x' }
               ]
            }
          });

          if (authUser) {
             await prisma.session.create({
               data: {
                 sessionToken: sessionId,
                 userId: authUser.id,
                 expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                 ipAddress: ip,
               }
             });
          }
        } catch (error) {
          console.error("Error creating session record:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionId) {
        // @ts-ignore
        session.sessionId = token.sessionId;

        try {
          const dbSession = await prisma.session.findUnique({
            where: { sessionToken: token.sessionId as string },
          });

          if (!dbSession) {
            return {} as any;
          }

          // Use address from token/session if available
          session.user = {
            ...session.user,
            address: (token as any).address || (session as any).address,
          } as any;
        } catch (e) {
          console.error("Session verification failed", e);
        }
      }
      return session;
    },
  },
};
