// =============================================
// MoneyShop - 2FA Kurulum Başlatma
// =============================================
// TOTP secret + QR kod URL'si oluşturur.
// SMS yöntemi için sadece metot bilgisini döndürür.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { twoFactorSetupSchema, validateRequest } from "@/lib/validations";
import { generateTotpSecret, generateTotpUri, generateBackupCodes } from "@/lib/two-factor";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateRequest(twoFactorSetupSchema, body);
    if (!parsed.success) return parsed.response;

    const { method } = parsed.data;

    // Kullanıcının mevcut 2FA durumunu kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (user?.twoFactorEnabled) {
      return NextResponse.json(
        { error: "İki faktörlü doğrulama zaten aktif." },
        { status: 400 }
      );
    }

    if (method === "AUTHENTICATOR") {
      // Yeni TOTP secret oluştur
      const secret = generateTotpSecret();
      const otpauth = generateTotpUri(session.user.email || session.user.id, secret);

      // Yedek kodlar oluştur
      const backupCodes = generateBackupCodes();

      return NextResponse.json({
        success: true,
        method: "AUTHENTICATOR",
        secret,           // Ham secret (şifrelenmemiş) — kullanıcıya QR için
        otpauth,          // otpauth:// URI
        backupCodes: backupCodes.plain,
      });
    }

    if (method === "SMS") {
      // SMS yöntemi için ek bir kurulum gerekmez
      // Kullanıcının telefon numarası zaten kayıtlı
      const userWithPhone = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true },
      });

      return NextResponse.json({
        success: true,
        method: "SMS",
        phone: userWithPhone?.phone || "",
      });
    }

    return NextResponse.json(
      { error: "Geçersiz 2FA yöntemi." },
      { status: 400 }
    );
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Kurulum başlatılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
