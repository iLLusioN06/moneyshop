import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function listHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (type) where.type = type;

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        version: true,
        status: true,
        signedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error("Contracts GET error:", error);
    return NextResponse.json({ error: "Sözleşmeler alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, version, content, expiresAt } = body;

    if (!title || !type || !content) {
      return NextResponse.json({ error: "Başlık, tür ve içerik zorunludur." }, { status: 400 });
    }

    const contract = await prisma.contract.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        type,
        version: version || "1.0",
        content,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    console.error("Contracts POST error:", error);
    return NextResponse.json({ error: "Sözleşme oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
