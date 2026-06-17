// =============================================
// MoneyShop - 2FA Giriş Doğrulama
// =============================================
// Pending token ile 2FA kodunu doğrular ve JWT oluşturur.
// =============================================

import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { twoFactorVerifyLoginSchema, validateRequest } from "@/lib/validations";
import {
  consumePendingAuth,
  verifyTotpToken,
  verifySmsCode,
  verifyBackupCode,
} from "@/lib/two-factor";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(twoFactorVerifyLoginSchema, body);
    if (!parsed.success) return parsed.response;

    const { pendingToken, code, isBackupCode } = parsed.data;

    // Pending token'ı doğrula
    const pending = await consumePendingAuth(pendingToken);
    if (!pending) {
      return NextResponse.json(
        { error: "Oturum süresi doldu. Lütfen tekrar giriş yapın." },
        { status: 410 }
      );
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: pending.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA aktif değil." },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Yedek kod ile doğrulama
      if (!user.twoFactorBackupCodes) {
        return NextResponse.json(
          { error: "Yedek kod bulunamadı." },
          { status: 400 }
        );
      }

      const updatedCodes = verifyBackupCode(code, user.twoFactorBackupCodes);
      if (updatedCodes === null) {
        return NextResponse.json(
          { error: "Hatalı yedek kod." },
          { status: 400 }
        );
      }

      // Kullanılan yedek kodu listeden çıkar
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: updatedCodes || null },
      });

      verified = true;
    } else if (user.twoFactorMethod === "AUTHENTICATOR") {
      // TOTP kodu doğrulama
      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { error: "2FA yapılandırması eksik." },
          { status: 400 }
        );
      }

      verified = await verifyTotpToken(code, user.twoFactorSecret);
    } else if (user.twoFactorMethod === "SMS") {
      // SMS kodu doğrulama
      verified = await verifySmsCode(user.id, code);
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Hatalı doğrulama kodu." },
        { status: 400 }
      );
    }

    // ─── JWT oluştur ───
    const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    const sessionToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.image,
      },
      secret: AUTH_SECRET,
      maxAge: 7 * 24 * 60 * 60, // 7 gün
      salt: cookieName,
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      details: { twoFactorMethod: user.twoFactorMethod, twoFactorVerified: true },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    // Response oluştur ve cookie'yi set et
    const response = NextResponse.json({
      success: true,
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("2FA verify-login error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
