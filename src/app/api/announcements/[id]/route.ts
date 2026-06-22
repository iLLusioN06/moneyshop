import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });

    if (!announcement) {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Announcement GET error:", error);
    return NextResponse.json({ error: "Duyuru alınırken hata oluştu." }, { status: 500 });
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

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }

    const { title, content, type, status, priority, targetUrl, startsAt, expiresAt } = body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(targetUrl !== undefined && { targetUrl }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Announcement PATCH error:", error);
    return NextResponse.json({ error: "Duyuru güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Duyuru silindi." });
  } catch (error) {
    console.error("Announcement DELETE error:", error);
    return NextResponse.json({ error: "Duyuru silinirken hata oluştu." }, { status: 500 });
  }
}
