"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updatePrivacySettings(
  userId: string,
  field: string,
  value: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const profile = await (prisma as any).userPrivacyProfile.upsert({
      where: { userId },
      update: { [field]: value },
      create: { userId, [field]: value },
    });

    await (prisma as any).userSessionLog.create({
      data: {
        userId,
        sessionId: "session-" + Math.random().toString(36).substring(7),
        action: "PRIVACY_SETTINGS_UPDATE",
        entityType: "setting",
        entityId: field,
        ipAddress,
        userAgent,
        metadata: { newValue: value },
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error("Failed to update privacy settings", error);
    throw new Error("Settings update failed");
  }
}

export async function fetchPrivacySettings(userId: string) {
  try {
    const profile = await (prisma as any).userPrivacyProfile.findUnique({
      where: { userId }
    });
    return { success: true, profile };
  } catch (error) {
    console.error("Failed to fetch privacy settings", error);
    return { success: false, profile: null };
  }
}
