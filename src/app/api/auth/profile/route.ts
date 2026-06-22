// =============================================
// MoneyShop - Profil API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, validateRequest } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

// Profil bilgilerini getir
export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        dateOfBirth: true,
        tcKimlik: true,
        address: true,
        identityNumber: true,
        _count: {
          select: {
            accounts: true,
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Profil bilgileri alınamadı." },
      { status: 500 }
    );
  }
});

// Profil güncelle
export const PUT = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, async (req: Request) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateRequest(updateProfileSchema, body);
    if (!parsed.success) return parsed.response;

    const { name, image } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(image !== undefined ? { image: image || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil başarıyla güncellendi.",
      data: updated,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
});
