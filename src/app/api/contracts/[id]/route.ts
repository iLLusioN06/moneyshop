import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const contract = await prisma.contract.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error("Contract GET error:", error);
    return NextResponse.json({ error: "Sözleşme alınırken hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.contract.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
    }

    const { status, signedAt } = body;

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(signedAt !== undefined && { signedAt: signedAt ? new Date(signedAt) : null }),
        ...(status === "ACTIVE" && !existing.signedAt && { signedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Contract PATCH error:", error);
    return NextResponse.json({ error: "Sözleşme güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
    }

    await prisma.contract.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Sözleşme silindi." });
  } catch (error) {
    console.error("Contract DELETE error:", error);
    return NextResponse.json({ error: "Sözleşme silinirken hata oluştu." }, { status: 500 });
  }
}
