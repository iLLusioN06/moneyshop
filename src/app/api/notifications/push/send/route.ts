// =============================================
// MoneyShop - Push Bildirim Gönderme API
// =============================================
// Sadece ADMIN kullanıcılar tarafından test amaçlı kullanılabilir.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPushToAllSubscriptions } from "@/lib/push-notifications";

// POST /api/notifications/push/send - Test push bildirimi gönder (sadece admin)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Sadece admin kullanıcılar test push gönderebilir
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlem için admin yetkisi gerekiyor." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || "MoneyShop Test Bildirimi";
    const bodyText = body.body || "Bu bir test push bildirimidir.";

    const sent = await sendPushToAllSubscriptions({
      title,
      body: bodyText,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      url: "/dashboard",
      tag: "test-notification",
      data: { type: "test" },
    });

    return NextResponse.json({
      success: true,
      message: `${sent} cihaza push bildirimi gönderildi.`,
      data: { sent },
    });
  } catch (error) {
    console.error("[push-send] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Push bildirimi gönderilemedi." },
      { status: 500 }
    );
  }
}
