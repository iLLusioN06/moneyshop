// =============================================
// MoneyShop - Admin SMS Send API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms, logSms } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";

// POST /api/admin/sms-send
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, async (req: Request) => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const body = await req.json();
    const { userIds, message } = body;

    if (!userIds?.length || !message?.trim()) {
      return NextResponse.json({ error: "Alıcı ve mesaj zorunludur." }, { status: 400 });
    }

    // Kullanıcıları bul
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        isActive: true,
        phone: { not: "" },
      },
      select: { id: true, phone: true, name: true },
    });

    let success = 0;
    let failed = 0;

    for (const user of users) {
      if (!user.phone) {
        failed++;
        continue;
      }

      try {
        const result = await sendSms(user.phone, message.trim());
        if (result.success) {
          success++;
          await logSms({
            userId: user.id,
            phone: user.phone,
            message: message.trim(),
            event: "ALERT",
            status: "SENT",
            sid: result.sid,
          });
        } else {
          failed++;
          await logSms({
            userId: user.id,
            phone: user.phone,
            message: message.trim(),
            event: "ALERT",
            status: "FAILED",
            error: result.error,
          });
        }
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      result: { success, failed },
    });
  } catch (error) {
    console.error("Admin SMS send error:", error);
    return NextResponse.json(
      { error: "SMS gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
});
