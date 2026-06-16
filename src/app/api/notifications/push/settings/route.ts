// =============================================
// MoneyShop - Push Bildirim Ayarları API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/push/settings - Kullanıcının push bildirim ayarlarını getir
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    let settings = await prisma.pushNotificationSetting.findUnique({
      where: { userId: session.user.id },
    });

    // Varsayılan ayarları döndür (kayıt yoksa)
    if (!settings) {
      settings = {
        id: "",
        userId: session.user.id,
        enabled: false,
        onTransaction: true,
        onTransfer: true,
        onBudgetAlert: true,
        onMonthlyReport: false,
        onLargeTransaction: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[push-settings] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Ayarlar alınamadı." },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/push/settings - Push bildirim ayarlarını güncelle
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { enabled, onTransaction, onTransfer, onBudgetAlert, onMonthlyReport, onLargeTransaction } = body;

    const data: Record<string, unknown> = {};
    if (enabled !== undefined) data.enabled = enabled;
    if (onTransaction !== undefined) data.onTransaction = onTransaction;
    if (onTransfer !== undefined) data.onTransfer = onTransfer;
    if (onBudgetAlert !== undefined) data.onBudgetAlert = onBudgetAlert;
    if (onMonthlyReport !== undefined) data.onMonthlyReport = onMonthlyReport;
    if (onLargeTransaction !== undefined) data.onLargeTransaction = onLargeTransaction;

    const settings = await prisma.pushNotificationSetting.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        enabled: enabled ?? false,
        onTransaction: onTransaction ?? true,
        onTransfer: onTransfer ?? true,
        onBudgetAlert: onBudgetAlert ?? true,
        onMonthlyReport: onMonthlyReport ?? false,
        onLargeTransaction: onLargeTransaction ?? true,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[push-settings] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Ayarlar kaydedilemedi." },
      { status: 500 }
    );
  }
}
