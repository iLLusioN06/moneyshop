import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Announcements GET error:", error);
    return NextResponse.json({ error: "Duyurular alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type, status, priority, targetUrl, startsAt, expiresAt } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik zorunludur." }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: type || "INFO",
        status: status || "DRAFT",
        priority: priority || 0,
        targetUrl: targetUrl || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Announcements POST error:", error);
    return NextResponse.json({ error: "Duyuru oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
