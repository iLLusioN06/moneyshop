// =============================================
// MoneyShop - Change Phone API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const changePhoneSchema = z
  .object({
    newPhone: z
      .string()
      .min(10, "Telefon numarası en az 10 karakter olmalıdır.")
      .regex(/^\+?\d+$/, "Telefon numarası yalnızca rakam ve başında + içerebilir."),
    password: z.string().min(1, "Mevcut parola zorunludur."),
  })
  .strict();

async function changePhoneHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const validated = changePhoneSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, phone: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Sosyal giriş yapan kullanıcılar telefon değiştiremez." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Geçersiz parola." }, { status: 401 });
    }

    if (validated.newPhone === user.phone) {
      return NextResponse.json(
        { error: "Yeni telefon numarası mevcut numara ile aynı olamaz." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone: validated.newPhone },
    });

    return NextResponse.json({
      success: true,
      message: "Telefon numaranız güncellendi.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Change Phone error:", error);
    return NextResponse.json(
      { error: "Telefon numarası değiştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 300_000 }, changePhoneHandler);
