// =============================================
// MoneyShop - Delete Account API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Mevcut parola zorunludur."),
    confirmText: z
      .string()
      .refine((val) => val === "HESABIMI_SIL", {
        message: "Onay metni 'HESABIMI_SIL' olmalıdır.",
      }),
  })
  .strict();

async function deleteAccountHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const validated = deleteAccountSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin hesapları silinemez." },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Sosyal giriş yapan kullanıcılar hesap silemez." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Geçersiz parola." }, { status: 401 });
    }

    // Aktif bakiyesi olan hesaplar varsa engelle
    const accountsWithBalance = await prisma.financialAccount.findMany({
      where: { userId: session.user.id, balance: { gt: 0 } },
    });

    if (accountsWithBalance.length > 0) {
      return NextResponse.json(
        {
          error: "Hesabınızda bakiye bulunan finansal hesaplar var. Önce bakiyenizi çekin veya transfer edin.",
        },
        { status: 400 }
      );
    }

    // PENDING transferleri varsa engelle
    const pendingTransfers = await prisma.transaction.count({
      where: { userId: session.user.id, status: "PENDING", type: "TRANSFER" },
    });

    if (pendingTransfers > 0) {
      return NextResponse.json(
        { error: "Bekleyen transferleriniz var. Önce transferlerin tamamlanmasını bekleyin." },
        { status: 400 }
      );
    }

    // Cascade ile tüm ilişkili veriler silinir
    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({
      success: true,
      message: "Hesabınız başarıyla silindi.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Delete Account error:", error);
    return NextResponse.json(
      { error: "Hesap silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 3, windowMs: 600_000 }, deleteAccountHandler);
