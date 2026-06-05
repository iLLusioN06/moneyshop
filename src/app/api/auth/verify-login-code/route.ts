import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSmsCode } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Telefon ve SMS kodu zorunludur." },
        { status: 400 }
      );
    }

    // Login kodunu bul (name="LOGIN" ile işaretli)
    const pending = await prisma.pendingRegistration.findFirst({
      where: { phone, name: "LOGIN" },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Kod bulunamadı. Lütfen tekrar giriş yapın." },
        { status: 404 }
      );
    }

    // Süre kontrolü
    if (new Date() > pending.expiresAt) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return NextResponse.json(
        { error: "SMS kodunun süresi doldu. Lütfen tekrar giriş yapın." },
        { status: 410 }
      );
    }

    // Kod kontrolü
    const hashedInput = hashSmsCode(code);
    if (hashedInput !== pending.code) {
      return NextResponse.json(
        { error: "Hatalı SMS kodu." },
        { status: 400 }
      );
    }

    // Temizle
    await prisma.pendingRegistration.delete({ where: { id: pending.id } });

    return NextResponse.json({
      success: true,
      message: "Doğrulama başarılı.",
    });
  } catch (error) {
    console.error("Verify login code error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
