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

    const documents = await prisma.kycDocument.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        fileName: true,
        rejectionReason: true,
        reviewedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("KYC GET error:", error);
    return NextResponse.json({ error: "KYC belgeleri alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { type, fileUrl, fileName, fileSize, mimeType, expiresAt } = body;

    if (!type || !fileUrl || !fileName) {
      return NextResponse.json({ error: "Tür, dosya URL'i ve dosya adı zorunludur." }, { status: 400 });
    }

    const existing = await prisma.kycDocument.findFirst({
      where: { userId: session.user.id, type, status: { in: ["PENDING", "APPROVED"] } },
    });

    if (existing) {
      return NextResponse.json({ error: "Bu türde zaten bir belge mevcut veya inceleniyor." }, { status: 409 });
    }

    const document = await prisma.kycDocument.create({
      data: {
        userId: session.user.id,
        type,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("KYC POST error:", error);
    return NextResponse.json({ error: "Belge yüklenirken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, createHandler);
