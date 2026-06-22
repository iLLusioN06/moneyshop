import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fee = await prisma.fee.findUnique({ where: { id } });

    if (!fee) {
      return NextResponse.json({ error: "Ücret bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("Fee GET error:", error);
    return NextResponse.json({ error: "Ücret alınırken hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.fee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ücret bulunamadı." }, { status: 404 });
    }

    const { name, type, calculationType, rate, minFee, maxFee, currency, tierRules, isActive, description } = body;

    const updated = await prisma.fee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(calculationType !== undefined && { calculationType }),
        ...(rate !== undefined && { rate }),
        ...(minFee !== undefined && { minFee }),
        ...(maxFee !== undefined && { maxFee }),
        ...(currency !== undefined && { currency }),
        ...(tierRules !== undefined && { tierRules }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Fee PATCH error:", error);
    return NextResponse.json({ error: "Ücret güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.fee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ücret bulunamadı." }, { status: 404 });
    }

    await prisma.fee.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: "Ücret devre dışı bırakıldı." });
  } catch (error) {
    console.error("Fee DELETE error:", error);
    return NextResponse.json({ error: "Ücret silinirken hata oluştu." }, { status: 500 });
  }
}
