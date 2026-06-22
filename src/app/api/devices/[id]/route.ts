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
    const device = await prisma.device.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!device) {
      return NextResponse.json({ error: "Cihaz bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error("Device GET error:", error);
    return NextResponse.json({ error: "Cihaz alınırken hata oluştu." }, { status: 500 });
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

    const existing = await prisma.device.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Cihaz bulunamadı." }, { status: 404 });
    }

    const { name, isTrusted, status } = body;

    const updated = await prisma.device.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isTrusted !== undefined && { isTrusted }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Device PATCH error:", error);
    return NextResponse.json({ error: "Cihaz güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.device.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Cihaz bulunamadı." }, { status: 404 });
    }

    await prisma.device.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Cihaz silindi." });
  } catch (error) {
    console.error("Device DELETE error:", error);
    return NextResponse.json({ error: "Cihaz silinirken hata oluştu." }, { status: 500 });
  }
}
