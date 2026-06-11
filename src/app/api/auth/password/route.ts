// =============================================
// MoneyShop - Parola Değiştirme API
// =============================================

import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Validasyon
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mevcut parola ve yeni parola zorunludur." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Yeni parola en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Yeni parola, mevcut paroladan farklı olmalıdır." },
        { status: 400 }
      );
    }

    // Kullanıcıyı getir (password hash'ini almak için)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Parola değiştirme işlemi için uygun hesap bulunamadı." },
        { status: 400 }
      );
    }

    // Mevcut parolayı doğrula
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mevcut parola yanlış." },
        { status: 400 }
      );
    }

    // Yeni parolayı hash'le ve kaydet
    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Parolanız başarıyla güncellendi.",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Parola değiştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const PUT = withRateLimit({ maxRequests: 3, windowMs: 60_000 }, handler);
