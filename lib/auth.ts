import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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
