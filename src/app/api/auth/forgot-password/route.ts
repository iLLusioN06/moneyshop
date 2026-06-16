// =============================================
// MoneyShop - Parola Sıfırlama Talebi API
// =============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, validateRequest } from "@/lib/validations";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(forgotPasswordSchema, body);
    if (!parsed.success) return parsed.response;

    const { email } = parsed.data;

    // Güvenlik: E-posta var mı yok mu belli etmeden 200 dön
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (user) {
      // Eski token'ları temizle
      await prisma.passwordResetToken.deleteMany({
        where: { email },
      });

      // Yeni token oluştur (1 saat geçerli)
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 saat
        },
      });

      // E-posta gönder
      const resetLink = `${APP_URL}/reset-password?token=${token}`;
      const emailContent = buildPasswordResetEmail({
        to: email,
        userName: user.name || "Kullanıcı",
        resetLink,
      });

      await sendEmail({
        to: email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    }

    // Her durumda aynı mesajı dön (email var/yok belli olmasın)
    return NextResponse.json({
      success: true,
      message:
        "E-posta adresinize parola sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
