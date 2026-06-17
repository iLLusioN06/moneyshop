import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSmsCode, hashSmsCode, sendSms } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { sendLoginCodeSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(sendLoginCodeSchema, body);
    if (!parsed.success) return parsed.response;

    const { email, password } = parsed.data;

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
      phone: user.phone.replace(/.(?=.{4})/g, "*"),
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
