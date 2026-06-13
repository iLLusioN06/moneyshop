import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSmsCode } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";
import { verifyLoginCodeSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(verifyLoginCodeSchema, body);
    if (!parsed.success) return parsed.response;

    const { phone, code } = parsed.data;

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

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
