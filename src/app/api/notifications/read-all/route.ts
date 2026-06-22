import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function readAllHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error("Notifications read-all error:", error);
    return NextResponse.json({ error: "Bildirimler güncellenirken hata oluştu." }, { status: 500 });
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, readAllHandler);
