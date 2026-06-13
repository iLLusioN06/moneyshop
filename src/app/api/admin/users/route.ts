// =============================================
// MoneyShop - Admin Kullanıcı Yönetimi API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, UserRole } from "@prisma/client";

// Admin rolü kontrolü
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return false;
  }
  return session;
}

// GET /api/admin/users - Kullanıcıları listele
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status === "active") where.isActive = true;
    if (status === "suspended") where.isActive = false;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              accounts: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Şifresiz kullanıcı verisi döndür
    const safeUsers = users.map((u) => ({
      ...u,
      password: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Kullanıcı güncelle (rol değiştir, aktiflik durumu)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gereklidir." },
        { status: 400 }
      );
    }

    // Kendini güncellemeye çalışıyorsa engelle
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Kendinizi güncelleyemezsiniz." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role) {
      const validRoles: UserRole[] = ["USER", "MODERATOR", "ADMIN"];
      if (!validRoles.includes(role as UserRole)) {
        return NextResponse.json(
          { error: "Geçersiz rol." },
          { status: 400 }
        );
      }
      updateData.role = role;
    }
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek alan bulunamadı." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
