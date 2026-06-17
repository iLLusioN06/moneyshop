// =============================================
// MoneyShop - 2FA Kurulum Doğrulama
// =============================================
// TOTP/SMS kodunu doğrular, secret'ı şifreler ve kaydeder.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { twoFactorVerifySetupSchema, validateRequest } from "@/lib/validations";
import {
  verifyTotpTokenRaw,
  encryptSecret,
  storeSmsCode,
  verifySmsCode,
} from "@/lib/two-factor";
import { generateSmsCode } from "@/lib/sms";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateRequest(twoFactorVerifySetupSchema, body);
    if (!parsed.success) return parsed.response;

    const { method, secret, code } = parsed.data;

    if (method === "AUTHENTICATOR") {
      if (!secret) {
        return NextResponse.json(
          { error: "Secret anahtarı gerekli." },
          { status: 400 }
        );
      }

      // TOTP kodunu doğrula (ham secret ile)
      const isValid = await verifyTotpTokenRaw(code, secret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Hatalı doğrulama kodu. Lütfen tekrar deneyin." },
          { status: 400 }
        );
      }

      // Secret'ı şifrele ve kaydet
      const encryptedSecret = encryptSecret(secret);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: encryptedSecret },
      });

      // Denetim günlüğü
      const meta = getRequestMetadata(req);
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        entityId: session.user.id,
        details: { twoFactorSetup: "AUTHENTICATOR", status: "verified" },
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "Doğrulama başarılı. İki faktörlü doğrulama aktif edilebilir.",
      });
    }

    if (method === "SMS") {
      // SMS kodunu sunucu tarafında doğrula
      if (!code) {
        return NextResponse.json(
          { error: "SMS doğrulama kodu zorunludur." },
          { status: 400 }
        );
      }

      const codeValid = await verifySmsCode(session.user.id, code);
      if (!codeValid) {
        return NextResponse.json(
          { error: "SMS doğrulama kodu hatalı veya süresi dolmuş." },
          { status: 400 }
        );
      }

      // Denetim günlüğü
      const meta = getRequestMetadata(req);
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        entityId: session.user.id,
        details: { twoFactorSetup: "SMS", status: "verified" },
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "SMS doğrulaması başarılı. İki faktörlü doğrulama aktif edilebilir.",
      });
    }

    return NextResponse.json(
      { error: "Geçersiz 2FA yöntemi." },
      { status: 400 }
    );
  } catch (error) {
    console.error("2FA verify-setup error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
