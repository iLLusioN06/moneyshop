// =============================================
// MoneyShop - 2FA Giriş Başlatma
// =============================================
// Şifre doğrulaması yapar, 2FA aktifse pending token döndürür.
// =============================================

import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { twoFactorInitLoginSchema, validateRequest } from "@/lib/validations";
import { createPendingAuthToken } from "@/lib/two-factor";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(twoFactorInitLoginSchema, body);
    if (!parsed.success) return parsed.response;

    const { email, password } = parsed.data;

    // Kullanıcıyı email veya kullanıcı adı ile bul
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        image: true,
        isActive: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
      },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          image: true,
          isActive: true,
          twoFactorEnabled: true,
          twoFactorMethod: true,
        },
      });
    }

    if (!user || !user.password || !user.isActive) {
      return NextResponse.json(
        { error: "E-posta veya parola hatalı." },
        { status: 401 }
      );
    }

    // Parola kontrolü
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "E-posta veya parola hatalı." },
        { status: 401 }
      );
    }

    // 2FA kontrolü
    if (user.twoFactorEnabled && user.twoFactorMethod) {
      const pendingToken = createPendingAuthToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        method: user.twoFactorMethod as "AUTHENTICATOR" | "SMS",
      });

      return NextResponse.json({
        twoFactorRequired: true,
        method: user.twoFactorMethod,
        pendingToken,
      });
    }

    // 2FA yok → normal giriş (istemci signIn("credentials") ile devam eder)
    return NextResponse.json({
      twoFactorRequired: false,
    });
  } catch (error) {
    console.error("2FA init-login error:", error);
    return NextResponse.json(
      { error: "Giriş yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
