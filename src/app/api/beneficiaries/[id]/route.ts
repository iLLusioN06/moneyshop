// =============================================
// MoneyShop - Beneficiary Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/beneficiaries/:id - Tek alıcı getir
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const beneficiary = await prisma.beneficiary.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!beneficiary) {
      return NextResponse.json({ error: "Alıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: beneficiary });
  } catch (error) {
    console.error("Beneficiary GET error:", error);
    return NextResponse.json(
      { error: "Alıcı alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PATCH /api/beneficiaries/:id - Alıcı güncelle
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.beneficiary.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Alıcı bulunamadı." }, { status: 404 });
    }

    const { name, phone, email, iban, bankName, bankCode, accountNumber, isFavorite, notes } = body;

    const updated = await prisma.beneficiary.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(iban !== undefined && { iban: iban || null }),
        ...(bankName !== undefined && { bankName: bankName || null }),
        ...(bankCode !== undefined && { bankCode: bankCode || null }),
        ...(accountNumber !== undefined && { accountNumber: accountNumber || null }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Beneficiary PATCH error:", error);
    return NextResponse.json(
      { error: "Alıcı güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/beneficiaries/:id - Alıcı sil
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.beneficiary.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Alıcı bulunamadı." }, { status: 404 });
    }

    await prisma.beneficiary.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Alıcı silindi." });
  } catch (error) {
    console.error("Beneficiary DELETE error:", error);
    return NextResponse.json(
      { error: "Alıcı silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
