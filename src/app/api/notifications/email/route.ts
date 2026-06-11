// =============================================
// MoneyShop - E-posta Bildirim Ayarları API
// =============================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/email - Kullanıcının e-posta bildirim ayarlarını getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    let settings = await prisma.emailNotificationSetting.findUnique({
      where: { userId: session.user.id },
    });

    // Varsayılan ayarları döndür (kayıt yoksa)
    if (!settings) {
      settings = {
        id: "",
        userId: session.user.id,
        email: session.user.email || "",
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
    console.error("[email-settings] GET error:", error);
    return NextResponse.json({ success: false, error: "Ayarlar alınamadı." }, { status: 500 });
  }
}

// PUT /api/notifications/email - E-posta bildirim ayarlarını güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await request.json();
    const { email, enabled, onTransaction, onTransfer, onBudgetAlert, onMonthlyReport, onLargeTransaction } = body;

    // Email doğrulama
    if (email && typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Geçersiz e-posta adresi." }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (email !== undefined) data.email = email;
    if (enabled !== undefined) data.enabled = enabled;
    if (onTransaction !== undefined) data.onTransaction = onTransaction;
    if (onTransfer !== undefined) data.onTransfer = onTransfer;
    if (onBudgetAlert !== undefined) data.onBudgetAlert = onBudgetAlert;
    if (onMonthlyReport !== undefined) data.onMonthlyReport = onMonthlyReport;
    if (onLargeTransaction !== undefined) data.onLargeTransaction = onLargeTransaction;

    const settings = await prisma.emailNotificationSetting.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        email: email || session.user.email || "",
        enabled: enabled || false,
        onTransaction: onTransaction ?? true,
        onTransfer: onTransfer ?? true,
        onBudgetAlert: onBudgetAlert ?? true,
        onMonthlyReport: onMonthlyReport ?? false,
        onLargeTransaction: onLargeTransaction ?? true,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[email-settings] PUT error:", error);
    return NextResponse.json({ success: false, error: "Ayarlar kaydedilemedi." }, { status: 500 });
  }
}
