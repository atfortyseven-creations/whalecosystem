import prisma from '@/lib/db';
import { sendTelegramAlert } from './channels/telegram';

// Sovereign Network - Global Notification Dispatcher
// Absolute Perfection: Conditional Real-Time Routing

export async function dispatchAlert(event: any) {
    const { usdValue, tier } = event;

    // 1. Fetch eligible subscribers from DB
    // Optimization: In Phase 2/3, we filter only users whose settings allow this tier.
    const subscribers = await prisma.userSettings.findMany({
        where: {
            OR: [
                { telegramEnabled: true },
                { emailNotifications: true }
            ]
        },
        include: {
            user: true
        }
    });

    if (!subscribers.length) return;

    console.log(`🚀 [Dispatcher] Routing to ${subscribers.length} potential subscribers.`);

    // 2. Parallel Dispatch to All Channels
    const dispatchPromises = subscribers.map(async (settings) => {
        // --- Telegram Channel ---
        if (settings.telegramEnabled && settings.telegramChatId) {
            await sendTelegramAlert(settings.telegramChatId, event);
        }

        // --- Email Channel (Placeholder for Phase 3 Perfection) ---
        if (settings.emailNotifications && settings.user?.email) {
            // sendEmailAlert(settings.user.email, event);
        }
    });

    await Promise.allSettled(dispatchPromises);
}
