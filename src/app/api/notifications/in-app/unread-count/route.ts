// =============================================
// MoneyShop - In-App Unread Notification Count
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function unreadCountHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error("Unread Count GET error:", error);
    return NextResponse.json(
      { error: "Okunmamış bildirim sayısı alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 60, windowMs: 60_000 }, unreadCountHandler);
