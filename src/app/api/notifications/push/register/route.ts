// =============================================
// MoneyShop - Push Bildirim Aboneliği API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/push/register - Push bildirim aboneliği oluştur/kaydet
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, p256dh, auth: authSecret } = body;

    if (!endpoint || !p256dh || !authSecret) {
      return NextResponse.json(
        { success: false, error: "Eksik abonelik bilgileri (endpoint, p256dh, auth gereklidir)." },
        { status: 400 }
      );
    }

    // Aynı endpoint varsa güncelle, yoksa oluştur
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth: authSecret,
        userAgent: request.headers.get("user-agent") || null,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authSecret,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // Push bildirim ayarları yoksa varsayılanla oluştur
    await prisma.pushNotificationSetting.upsert({
      where: { userId: session.user.id },
      update: {},
      create: {
        userId: session.user.id,
        enabled: true,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: { id: subscription.id },
    });
  } catch (error) {
    console.error("[push-register] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Abonelik kaydedilemedi." },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/push/register - Push bildirim aboneliğini kaldır
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = body.endpoint;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: "Silinecek aboneliğin endpoint bilgisi gerekli." },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: "Abonelik kaldırıldı." });
  } catch (error) {
    console.error("[push-register] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Abonelik kaldırılamadı." },
      { status: 500 }
    );
  }
}
