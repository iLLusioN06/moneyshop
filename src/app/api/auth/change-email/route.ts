// =============================================
// MoneyShop - Change Email API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const changeEmailSchema = z
  .object({
    newEmail: z.string().email("Geçerli bir e-posta adresi giriniz."),
    password: z.string().min(1, "Mevcut parola zorunludur."),
  })
  .strict();

async function changeEmailHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const validated = changeEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Sosyal giriş yapan kullanıcılar e-posta değiştiremez." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Geçersiz parola." }, { status: 401 });
    }

    if (validated.newEmail === user.email) {
      return NextResponse.json(
        { error: "Yeni e-posta adresi mevcut e-posta ile aynı olamaz." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: validated.newEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanımda." },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: validated.newEmail,
        emailVerified: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "E-posta adresiniz güncellendi. Yeni adresinize doğrulama e-postası gönderilecektir.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Change Email error:", error);
    return NextResponse.json(
      { error: "E-posta değiştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 300_000 }, changeEmailHandler);
