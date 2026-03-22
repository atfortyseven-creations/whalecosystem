import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function grantPremium() {
  const email = 'reymndbrn15@gmail.com';
  console.log(`\n🚀 Granting Premium Access to: ${email}`);
  console.log('-------------------------------------------');

  try {
    const client = await clerkClient();
    
    // 1. Find User in Clerk
    console.log('🔍 Searching for user in Clerk...');
    const clerkUsers = await client.users.getUserList({ emailAddress: [email] });
    
    if (clerkUsers.data.length === 0) {
      console.error(`❌ User with email ${email} not found in Clerk.`);
      console.log('💡 Tip: Ask the user to register first if they haven\'t.');
      return;
    }

    const clerkUser = clerkUsers.data[0];
    const clerkUserId = clerkUser.id;
    console.log(`✅ Found Clerk User: ${clerkUserId}`);

    // 2. Update Clerk Metadata
    console.log('🆙 Updating Clerk public metadata...');
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        subscriptionStatus: 'active',
        isVip: true,
        paymentType: 'lifetime_vip',
        tier: 'SOVEREIGN'
      },
    });
    console.log('✅ Clerk metadata updated.');

    // 3. Update/Create User in Prisma
    console.log('💾 Synchronizing with Prisma database...');
    const user = await prisma.user.upsert({
      where: { walletAddress: clerkUserId },
      update: {
        tier: 'SOVEREIGN',
        email: email,
      },
      create: {
        walletAddress: clerkUserId,
        email: email,
        tier: 'SOVEREIGN',
      },
    });
    console.log(`✅ Prisma User record ${user.walletAddress} updated/created with tier SOVEREIGN.`);

    // 4. Create/Update Subscription in Prisma
    console.log('📝 Creating/Updating Subscription record...');
    const subscription = await prisma.subscription.upsert({
      where: { 
        // We don't have a unique ID for subscription if we don't know it, 
        // so we'll just search for an existing one or create a new one.
        // Actually, schema doesn't have a unique constraint on userId for Subscription.
        // Let's check for an active one first.
        id: (await prisma.subscription.findFirst({ where: { userId: clerkUserId } }))?.id || 'new-sub'
      },
      update: {
        status: 'ACTIVE',
        tier: 'PREMIUM',
        expiresAt: new Date('2099-12-31'),
      },
      create: {
        userId: clerkUserId,
        status: 'ACTIVE',
        tier: 'PREMIUM',
        expiresAt: new Date('2099-12-31'),
      },
    });
    console.log(`✅ Subscription record updated: ${subscription.id}`);

    console.log('\n✨ MISSION ACCOMPLISHED: User successfully granted full platform access.');

  } catch (error) {
    console.error('❌ Error during grant process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantPremium();
