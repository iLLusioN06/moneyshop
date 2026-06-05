// =============================================
// MoneyShop - Accounts API (Liste & Oluşturma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/accounts - Kullanıcının hesaplarını listele
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const accounts = await prisma.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json(
      { error: "Hesaplar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Yeni hesap oluştur (sadece admin)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, balance, currency, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Hesap adı zorunludur." },
        { status: 400 }
      );
    }

    const account = await prisma.financialAccount.create({
      data: {
        userId: session.user.id,
        name,
        type: type || "CHECKING",
        balance: balance || 0,
        currency: currency || "TRY",
        icon: icon || null,
        color: color || null,
      },
    });

    return NextResponse.json(
      { success: true, data: account },
      { status: 201 }
    );
  } catch (error) {
    console.error("Accounts POST error:", error);
    return NextResponse.json(
      { error: "Hesap oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
