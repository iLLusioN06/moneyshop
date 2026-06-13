import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { hashSmsCode } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import {
  generateCardNumber,
  generateCvv,
  encryptCardNumber,
  encryptCvv,
} from "@/lib/card-utils";
import { verifySmsSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateRequest(verifySmsSchema, body);
    if (!parsed.success) return parsed.response;

    const { phone, code, pendingToken: clientPendingToken } = parsed.data;

    // Bekleyen kaydı bul (pendingToken varsa onunla, yoksa telefonla)
    const pending = clientPendingToken
      ? await prisma.pendingRegistration.findUnique({
          where: { pendingToken: clientPendingToken },
        })
      : await prisma.pendingRegistration.findFirst({
          where: { phone },
        });

    if (!pending) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı. Lütfen tekrar kayıt olun." },
        { status: 404 }
      );
    }

    // Süre kontrolü
    if (new Date() > pending.expiresAt) {
      await prisma.pendingRegistration.delete({
        where: { id: pending.id },
      });
      return NextResponse.json(
        { error: "SMS kodunun süresi doldu. Lütfen tekrar kayıt olun." },
        { status: 410 }
      );
    }

    // Kod kontrolü
    const hashedInputCode = hashSmsCode(code);
    if (hashedInputCode !== pending.code) {
      return NextResponse.json(
        { error: "Hatalı SMS kodu." },
        { status: 400 }
      );
    }

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        password: pending.password,
      },
    });

    // Varsayılan MoneyShop Card oluştur (Standart) — encrypted + Luhn-valid
    const now = new Date();
    const plainCardNumber = generateCardNumber();
    const plainCvv = generateCvv();

    await prisma.card.create({
      data: {
        userId: user.id,
        cardType: "STANDARD",
        cardNumber: encryptCardNumber(plainCardNumber),
        cardHolderName: user.name || "Kullanıcı",
        expiryMonth: now.getMonth() + 1,
        expiryYear: now.getFullYear() + 5,
        cvv: encryptCvv(plainCvv),
        status: "ACTIVE",
        dailyLimit: 5000,
        monthlyLimit: 50000,
        currency: "IQD",
      },
    });

    // Varsayılan kategorileri oluştur
    const defaultCategories = [
      { name: "Maaş", icon: "wallet", color: "#10b981", type: "INCOME" as const },
      { name: "Kira", icon: "home", color: "#3b82f6", type: "EXPENSE" as const },
      { name: "Faturalar", icon: "file-invoice", color: "#f59e0b", type: "EXPENSE" as const },
      { name: "Market", icon: "shopping-cart", color: "#ec4899", type: "EXPENSE" as const },
      { name: "Ulaşım", icon: "car", color: "#8b5cf6", type: "EXPENSE" as const },
      { name: "Sağlık", icon: "heart", color: "#ef4444", type: "EXPENSE" as const },
      { name: "Eğitim", icon: "book", color: "#06b6d4", type: "EXPENSE" as const },
      { name: "Eğlence", icon: "gamepad", color: "#f97316", type: "EXPENSE" as const },
      { name: "Yatırım", icon: "chart-line", color: "#6366f1", type: "INCOME" as const },
      { name: "Diğer Gelir", icon: "plus-circle", color: "#84cc16", type: "INCOME" as const },
      { name: "Diğer Gider", icon: "minus-circle", color: "#94a3b8", type: "EXPENSE" as const },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
    });

    // Bekleyen kaydı temizle
    await prisma.pendingRegistration.delete({
      where: { id: pending.id },
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: user.id,
      action: "REGISTER",
      entity: "USER",
      entityId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    // ─── Otomatik giriş için JWT oluştur ───
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

    // Session token'ı cookie olarak set et
    const response = NextResponse.json(
      {
        success: true,
        message: "Hesabınız başarıyla oluşturuldu.",
      },
      { status: 201 }
    );

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Verify SMS error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
