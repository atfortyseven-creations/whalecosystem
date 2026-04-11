import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Sync with AuthUser table (only known schema fields)
      try {
        const existingUser = await prisma.authUser.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.authUser.create({
            data: {
              email: user.email,
              // AuthUser schema: id, email, walletAddress, recoveryEmail, encryptedPrivateKey, createdAt, updatedAt
              // No 'name', 'verified', or 'passwordHash' columns exist in schema.prisma
            },
          });
        }
      } catch (error) {
        console.error("Error syncing AuthUser:", error);
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // On initial sign in
      if (trigger === 'signIn' || (user && account)) {
        try {
          const sessionId = crypto.randomUUID();
          token.sessionId = sessionId;

          const headersList = await headers();
          const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

          // Find AuthUser to link — Session schema: sessionToken, userId, expiresAt, ipAddress
          const authUser = await prisma.authUser.findUnique({
            where: { email: token.email! }
          });

          if (authUser) {
             await prisma.session.create({
               data: {
                 sessionToken: sessionId,
                 userId: authUser.id,   // Session.userId — correct schema column
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

        // Session schema has no relation to AuthUser. Verify session exists in DB.
        try {
          const dbSession = await prisma.session.findUnique({
            where: { sessionToken: token.sessionId as string },
          });

          if (!dbSession) {
            return {} as any;
          }

          // Enrich with user email from token (already present in JWT)
          session.user = {
            ...session.user,
            email: token.email ?? session.user?.email,
          };
        } catch (e) {
          console.error("Session verification failed", e);
        }
      }
      return session;
    },
  },
};

// ========================================
// Authentication Helper Functions
// ========================================

import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit verification code
 */
import crypto from 'crypto';

export function generateVerificationCode(): string {
  const code = crypto.randomInt(100000, 999999);
  return code.toString();
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number
 */
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}



