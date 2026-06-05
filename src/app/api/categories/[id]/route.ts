// =============================================
// MoneyShop - Categories API (Tekil İşlemler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/categories/[id] - Kategori detayı
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Category GET error:", error);
    return NextResponse.json(
      { error: "Kategori alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Kategori güncelle (sadece admin)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, icon, color, type } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(type !== undefined && { type }),
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Kategori sil (sadece admin)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }

    // Varsayılan kategoriler silinemez
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Varsayılan kategoriler silinemez." },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Kategori silindi.",
    });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
