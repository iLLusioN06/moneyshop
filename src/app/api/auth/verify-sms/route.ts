import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSmsCode } from "@/lib/sms";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";

function generateCardNumber(): string {
  const prefix = "5200";
  const rest = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
  return `${prefix}${rest}`;
}

function generateCvv(): string {
  return String(Math.floor(100 + Math.random() * 899));
}

async function handler(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Telefon ve SMS kodu zorunludur." },
        { status: 400 }
      );
    }

    // Bekleyen kaydı bul
    const pending = await prisma.pendingRegistration.findFirst({
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

    // Varsayılan MoneyShop Card oluştur (Standart)
    const now = new Date();
    const cardNumber = generateCardNumber();
    const cvv = generateCvv();

    await prisma.card.create({
      data: {
        userId: user.id,
        cardType: "STANDARD",
        cardNumber,
        cardHolderName: user.name || "Kullanıcı",
        expiryMonth: now.getMonth() + 1,
        expiryYear: now.getFullYear() + 5,
        cvv,
        status: "ACTIVE",
        dailyLimit: 5000,
        monthlyLimit: 50000,
        currency: "IQD",
      },
    });

    // Varsayılan kategorileri oluştur
    const defaultCategories = [
      { name: "Maaş", icon: "wallet", color: "#10b981", type: "INCOME" },
      { name: "Kira", icon: "home", color: "#3b82f6", type: "EXPENSE" },
      { name: "Faturalar", icon: "file-invoice", color: "#f59e0b", type: "EXPENSE" },
      { name: "Market", icon: "shopping-cart", color: "#ec4899", type: "EXPENSE" },
      { name: "Ulaşım", icon: "car", color: "#8b5cf6", type: "EXPENSE" },
      { name: "Sağlık", icon: "heart", color: "#ef4444", type: "EXPENSE" },
      { name: "Eğitim", icon: "book", color: "#06b6d4", type: "EXPENSE" },
      { name: "Eğlence", icon: "gamepad", color: "#f97316", type: "EXPENSE" },
      { name: "Yatırım", icon: "chart-line", color: "#6366f1", type: "INCOME" },
      { name: "Diğer Gelir", icon: "plus-circle", color: "#84cc16", type: "INCOME" },
      { name: "Diğer Gider", icon: "minus-circle", color: "#94a3b8", type: "EXPENSE" },
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

    return NextResponse.json(
      {
        success: true,
        message: "Hesabınız başarıyla oluşturuldu.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Verify SMS error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
