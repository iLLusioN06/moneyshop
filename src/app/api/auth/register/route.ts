import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSmsCode, hashSmsCode, sendSms } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    // Validasyon
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Geçerli bir cep telefonu numarası giriniz." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    // Telefon kontrolü (hem User hem PendingRegistration)
    const [userWithPhone, pendingWithPhone] = await Promise.all([
      prisma.user.findFirst({ where: { phone } }),
      prisma.pendingRegistration.findFirst({ where: { phone } }),
    ]);

    if (userWithPhone) {
      return NextResponse.json(
        { error: "Bu telefon numarası zaten kullanılıyor." },
        { status: 409 }
      );
    }

    // Varsa eski bekleyen kaydı temizle
    if (pendingWithPhone) {
      await prisma.pendingRegistration.delete({
        where: { id: pendingWithPhone.id },
      });
    }

    // SMS kodu oluştur
    const smsCode = generateSmsCode();
    const hashedSmsCode = hashSmsCode(smsCode);
    const hashedPassword = await hash(password, 12);

    // Bekleyen kaydı oluştur
    await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        code: hashedSmsCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 dakika
      },
    });

    // SMS gönder
    await sendSms(phone, smsCode);

    return NextResponse.json(
      {
        success: true,
        message: "SMS kodunuz gönderildi.",
        phone: phone.slice(-4), // son 4 hane
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 3, windowMs: 60_000 }, handler);
