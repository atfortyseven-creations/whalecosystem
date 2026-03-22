import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from 'crypto';
import { validateUserSettings, validatePartialSettings, getDefaultUserSettings } from "@/lib/settings-validation";
import { validateSecureRequest } from "@/lib/security/premium-security";

const OWNER_EMAILS = [
  'atfortyseven2@gmail.com',
  'josemanx2000@gmail.com'
];

// ============================================================================
// GET /api/user/settings - Load user settings
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const secValidation = await validateSecureRequest(request);
    if (!secValidation.valid) {
      return NextResponse.json({ error: secValidation.error }, { status: 401 });
    }
    const userId = secValidation.userId!;

    let dbUser = null;
    try {
      dbUser = await (prisma as any).user.findUnique({
        where: { walletAddress: userId },
        include: { settings: true }
      });
    } catch (dbError: any) {
      console.warn(`[SETTINGS-GET-WARN] Database check failed (likely table missing): ${dbError.message}`);
      // Fall through to default settings
    }

    // Return default settings if user/settings don't exist yet or DB failed
    if (!dbUser || !dbUser.settings) {
      console.log(`[SETTINGS-GET] Returning default settings for ${userId}`);
      return NextResponse.json({
        success: true,
        settings: getDefaultUserSettings(),
        meta: null
      });
    }

    const settings = dbUser.settings;
    
    console.log(`[SETTINGS-GET] Successfully retrieved settings for ${userId}`);

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        contacts: typeof settings.contacts === 'string' 
          ? JSON.parse(settings.contacts as string) 
          : settings.contacts,
        notificationsConfig: typeof settings.notificationsConfig === 'string'
          ? JSON.parse(settings.notificationsConfig as string)
          : settings.notificationsConfig,
      },
      meta: {
        version: settings.version,
        lastSyncAt: settings.lastSyncAt,
        syncHash: settings.syncHash,
      },
    });
  } catch (error: any) {
    console.error('[SETTINGS-GET-FAILURE] Fatal Error:', {
      error: error.message,
      stack: error.stack,
      requestUrl: request.url
    });
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/user/settings - Full settings update with validation & audit
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const secValidation = await validateSecureRequest(request);
    if (!secValidation.valid) {
      return NextResponse.json({ error: secValidation.error }, { status: 401 });
    }
    const userId = secValidation.userId!;

    const data = await request.json();

    // Validate incoming data
    const validation = validatePartialSettings(data);
    const { clerkClient } = await import('@clerk/nextjs/server');
    const user = await (await clerkClient()).users.getUser(userId).catch(() => null);
    const isOwner = OWNER_EMAILS.includes(user?.primaryEmailAddress?.emailAddress || '');

    if (!validation.success) {
      console.error(`[SETTINGS-VALIDATION-ERROR] User: ${userId} (${user?.primaryEmailAddress?.emailAddress})`, validation.errors?.issues);
      
      // Architect Bypass: Log error but don't block
      if (!isOwner) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.errors?.issues },
          { status: 400 }
        );
      }
      console.log(`[GOD-MODE] Architect detected. Ignoring validation errors to ensure service continuity.`);
    }

    // Ensure User exists
    const dbUser = await prisma.user.upsert({
        where: { walletAddress: userId },
        update: { lastActive: new Date() },
        create: { walletAddress: userId, tier: 'GHOST' },
        include: { settings: true }
    });

    const normalizedData = JSON.stringify(data, Object.keys(data).sort());
    const newHash = createHash('md5').update(normalizedData).digest('hex');

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const updateData: any = {
      ...data,
      syncHash: newHash,
      lastSyncAt: new Date(),
      updatedAt: new Date(),
    };

    // [FIX] Prisma handles Json columns as objects, no need to stringify
    if (data.contacts) updateData.contacts = data.contacts;
    if (data.notifications) {
      updateData.notificationsConfig = data.notifications;
      delete updateData.notifications;
    }

    // [SENIOR-LEVEL] Atomic Transaction
    // Ensures Settings Update AND Audit Log happen together or not at all.
    const result = await prisma.$transaction(async (tx) => {
        // [LEGENDARY PERSISTENCE] Optimistic Locking Check
        // If version is provided, ensure we are not overwriting a newer state
        if (data.version && dbUser.settings && dbUser.settings.version > data.version) {
            throw new Error(`CONFLICT: Database has a newer version (${dbUser.settings.version}) than provided (${data.version})`);
        }

        const settings = await tx.userSettings.upsert({
            where: { userId: dbUser.walletAddress },
            update: {
                ...updateData,
                version: { increment: 1 },
            },
            create: {
                user: { connect: { walletAddress: dbUser.walletAddress } },
                ...updateData,
                version: 1,
            },
        });

        await tx.userSettingsHistory.create({
            data: {
                settingsId: settings.id,
                authUserId: dbUser.walletAddress,
                changeType: dbUser.settings ? 'UPDATE' : 'CREATE',
                previousValue: dbUser.settings ? (dbUser.settings as any) : undefined,
                newValue: data,
                fullSnapshot: (settings as any),
                ipAddress,
                userAgent,
            },
        });

        return settings;
    });

    const settings = result;

    return NextResponse.json({ 
      success: true, 
      settings: {
        ...settings,
        contacts: typeof settings.contacts === 'string' ? JSON.parse(settings.contacts as string) : settings.contacts,
        notificationsConfig: typeof settings.notificationsConfig === 'string' ? JSON.parse(settings.notificationsConfig as string) : settings.notificationsConfig,
      },
      meta: {
        version: settings.version,
        lastSyncAt: settings.lastSyncAt,
        syncHash: settings.syncHash,
      }
    });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/user/settings - Partial update (single or multiple fields)
// ============================================================================

export async function PATCH(request: NextRequest) {
  let userId: string | undefined;
  let data: any = {};

  try {
    const secValidation = await validateSecureRequest(request);
    if (!secValidation.valid) {
      return NextResponse.json({ error: secValidation.error }, { status: 401 });
    }
    userId = secValidation.userId!;

    data = await request.json();
    const validation = validatePartialSettings(data);
    const { clerkClient } = await import('@clerk/nextjs/server');
    const user = await (await clerkClient()).users.getUser(userId).catch(() => null);
    const isOwner = OWNER_EMAILS.includes(user?.primaryEmailAddress?.emailAddress || '');

    if (!validation.success) {
      console.error(`[SETTINGS-PATCH-VALIDATION] User: ${userId}`, validation.errors?.issues);
      if (!isOwner) {
        return NextResponse.json({ error: "Validation failed", details: validation.errors?.issues }, { status: 400 });
      }
      console.log(`[GOD-MODE] Architect detected. Proceeding with partial patch despite validation warnings.`);
    }

    const dbUser = await prisma.user.findUnique({
      where: { walletAddress: userId },
      include: { settings: true },
    });

    if (!dbUser || !dbUser.settings) {
      return NextResponse.json({ error: "Settings not initialized. Use PUT first." }, { status: 400 });
    }

    const currentSettings = dbUser.settings;
    const mergedSettings = { ...currentSettings, ...data };
    const normalizedData = JSON.stringify(mergedSettings, Object.keys(mergedSettings).sort());
    const newHash = createHash('md5').update(normalizedData).digest('hex');

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const updateData: any = {
      ...data,
      syncHash: newHash,
      lastSyncAt: new Date(),
      updatedAt: new Date(),
      version: { increment: 1 },
    };

    // [FIX] Prisma handles Json columns as objects
    if (data.contacts) updateData.contacts = data.contacts;
    if (data.notifications) {
        updateData.notificationsConfig = data.notifications;
        delete updateData.notifications;
    }

    // [SENIOR-LEVEL] Atomic Transaction & Bulk Insert
    // We update the settings and create ALL audit entries in a single atomic commit.
    // If any part fails, the database rolls back completely. 
    // [LEGENDARY PERSISTENCE] Optimistic Locking Check
    if (data.version && currentSettings.version > data.version) {
        return NextResponse.json({ 
            error: "Conflict Detected", 
            details: "Your settings session is outdated. Please refresh to sync with newer cloud state.",
            currentVersion: currentSettings.version,
            providedVersion: data.version
        }, { status: 409 });
    }

    const changedFields = Object.keys(data).filter(k => k !== 'version');
    
    const result = await prisma.$transaction(async (tx) => {
        const settings = await tx.userSettings.update({
            where: { userId: dbUser.walletAddress },
            data: updateData,
        });

        // Optimization: Prepare all history entries first
        if (changedFields.length > 0) {
            await tx.userSettingsHistory.createMany({
                data: changedFields.map(field => ({
                    settingsId: settings.id,
                    authUserId: dbUser.walletAddress,
                    field,
                    changeType: 'UPDATE',
                    previousValue: (currentSettings as any)[field] ?? undefined,
                    newValue: data[field],
                    fullSnapshot: (settings as any),
                    ipAddress,
                    userAgent,
                }))
            });
        }
        
        return settings;
    });

    const settings = result;

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        contacts: typeof settings.contacts === 'string' ? JSON.parse(settings.contacts as string) : settings.contacts,
        notificationsConfig: typeof settings.notificationsConfig === 'string' ? JSON.parse(settings.notificationsConfig as string) : settings.notificationsConfig,
      },
      meta: {
        version: settings.version,
        lastSyncAt: settings.lastSyncAt,
        syncHash: settings.syncHash,
        updatedFields: changedFields,
      }
    });
  } catch (error: any) {
    console.error('[SETTINGS-PATCH-FAILURE] Fatal Error:', {
        userId,
        error: error.message,
        stack: error.stack,
        data: JSON.stringify(data)
    });
    return NextResponse.json({ 
        error: "Internal Server Error", 
        details: error.message,
        code: error.code // Prisma error codes are useful
    }, { status: 500 });
  }
}

