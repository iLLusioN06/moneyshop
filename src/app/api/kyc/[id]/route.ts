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
    const document = await prisma.kycDocument.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        type: true,
        status: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        rejectionReason: true,
        reviewedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("KYC Document GET error:", error);
    return NextResponse.json({ error: "Belge alınırken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.kycDocument.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!document) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });
    }

    if (document.status === "APPROVED") {
      return NextResponse.json({ error: "Onaylanmış belge silinemez." }, { status: 400 });
    }

    await prisma.kycDocument.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Belge silindi." });
  } catch (error) {
    console.error("KYC Document DELETE error:", error);
    return NextResponse.json({ error: "Belge silinirken hata oluştu." }, { status: 500 });
  }
}
