// =============================================
// MoneyShop - Accounts API (Tekil İşlemler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/accounts/[id] - Hesap detayı
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

    const account = await prisma.financialAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Hesap bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error("Account GET error:", error);
    return NextResponse.json(
      { error: "Hesap alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/[id] - Hesap güncelle (sadece admin)
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

    // Hesabın kullanıcıya ait olduğunu kontrol et
    const existing = await prisma.financialAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Hesap bulunamadı." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, type, balance, currency, icon, color, isActive } = body;

    const account = await prisma.financialAccount.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(balance !== undefined && { balance }),
        ...(currency !== undefined && { currency }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error("Account PUT error:", error);
    return NextResponse.json(
      { error: "Hesap güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Hesap sil (soft delete, sadece admin)
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

    const existing = await prisma.financialAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Hesap bulunamadı." },
        { status: 404 }
      );
    }

    // Soft delete - hesabı pasif yap
    await prisma.financialAccount.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Hesap devre dışı bırakıldı.",
    });
  } catch (error) {
    console.error("Account DELETE error:", error);
    return NextResponse.json(
      { error: "Hesap silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
