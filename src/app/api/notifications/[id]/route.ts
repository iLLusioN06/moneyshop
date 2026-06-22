import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Bildirim bulunamadı." }, { status: 404 });
    }

    const body = await req.json();
    const { isRead } = body;

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        ...(isRead !== undefined && {
          isRead,
          readAt: isRead ? new Date() : null,
        }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Notification PATCH error:", error);
    return NextResponse.json({ error: "Bildirim güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Bildirim bulunamadı." }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Bildirim silindi." });
  } catch (error) {
    console.error("Notification DELETE error:", error);
    return NextResponse.json({ error: "Bildirim silinirken hata oluştu." }, { status: 500 });
  }
}
