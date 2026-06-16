// =============================================
// MoneyShop - 2FA SMS Kodu Gönderme
// =============================================
// Kullanıcının telefonuna 2FA doğrulama kodu gönderir.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { storeSmsCode } from "@/lib/two-factor";
import { generateSmsCode, sendSms, buildVerificationSms } from "@/lib/sms";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });

    if (!user?.phone) {
      return NextResponse.json(
        { error: "Telefon numarası bulunamadı." },
        { status: 400 }
      );
    }

    // SMS kodu oluştur
    const code = generateSmsCode();

    // Kodu geçici olarak sakla
    storeSmsCode(session.user.id, code);

    // SMS gönder (formatlı mesaj)
    const message = buildVerificationSms(code);
    await sendSms(user.phone, message);

    return NextResponse.json({
      success: true,
      message: "SMS kodunuz gönderildi.",
      phone: user.phone.replace(/.(?=.{4})/g, "*"), // maskeli
    });
  } catch (error) {
    console.error("2FA send-sms error:", error);
    return NextResponse.json(
      { error: "SMS gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 3, windowMs: 60_000 }, handler);
