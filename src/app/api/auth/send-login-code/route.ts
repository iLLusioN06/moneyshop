import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSmsCode, hashSmsCode, sendSms } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";

async function handler(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve parola zorunludur." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });

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

    // Varsa eski kodu temizle
    const existing = await prisma.pendingRegistration.findFirst({
      where: { email, name: "LOGIN" },
    });

    if (existing) {
      await prisma.pendingRegistration.delete({ where: { id: existing.id } });
    }

    // SMS kodu oluştur
    const smsCode = generateSmsCode();
    const hashedCode = hashSmsCode(smsCode);

    // Bekleyen kaydı oluştur (name="LOGIN" ile login olduğunu işaretle)
    await prisma.pendingRegistration.create({
      data: {
        name: "LOGIN",
        email,
        phone: user.phone,
        password: "",
        code: hashedCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // SMS gönder
    await sendSms(user.phone, smsCode);

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "SMS kodunuz gönderildi.",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Send login code error:", error);
    return NextResponse.json(
      { error: "Giriş kodu gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
