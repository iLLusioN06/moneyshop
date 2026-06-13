// =============================================
// MoneyShop - Categories API (Liste & Oluşturma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/categories - Kategorileri listele
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Kategoriler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/categories - Yeni kategori oluştur
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { name, icon, color, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Kategori adı ve türü zorunludur." },
        { status: 400 }
      );
    }

    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz kategori türü. INCOME veya EXPENSE olmalıdır." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        icon: icon || "circle",
        color: color || "#94a3b8",
        type,
      },
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
