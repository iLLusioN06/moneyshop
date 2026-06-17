// =============================================
// MoneyShop - Beneficiaries API (Alıcı Rehberi)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

// GET /api/beneficiaries - Alıcıları listele
async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const beneficiaries = await prisma.beneficiary.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, data: beneficiaries }, { headers: getCacheHeaders(60) });
  } catch (error) {
    console.error("Beneficiaries GET error:", error);
    return NextResponse.json(
      { error: "Alıcılar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/beneficiaries - Yeni alıcı oluştur
async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, email, iban, bankName, bankCode, accountNumber, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Alıcı adı zorunludur." }, { status: 400 });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        iban: iban || null,
        bankName: bankName || null,
        bankCode: bankCode || null,
        accountNumber: accountNumber || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: beneficiary }, { status: 201 });
  } catch (error) {
    console.error("Beneficiaries POST error:", error);
    return NextResponse.json(
      { error: "Alıcı oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
