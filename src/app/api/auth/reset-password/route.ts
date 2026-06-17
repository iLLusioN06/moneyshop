// =============================================
// MoneyShop - Parola Sıfırlama (Token ile) API
// =============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, validateRequest } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";
import { hash } from "bcryptjs";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(resetPasswordSchema, body);
    if (!parsed.success) return parsed.response;

    const { token, password } = parsed.data;

    // Token'ı bul
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş bağlantı." },
        { status: 400 }
      );
    }

    // Süresi dolmuş mu?
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "Bu bağlantının süresi dolmuş. Lütfen yeni bir sıfırlama talebi oluşturun." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Parolayı güncelle
    const hashedPassword = await hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Kullanılmış token'ı temizle
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({
      success: true,
      message: "Parolanız başarıyla sıfırlandı. Yeni parolanızla giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 900_000 }, handler);
