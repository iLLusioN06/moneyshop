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
    const referral = await prisma.referral.findFirst({
      where: { id, referrerId: session.user.id },
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referans bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: referral });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json({ error: "Referans alınırken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const referral = await prisma.referral.findFirst({
      where: { id, referrerId: session.user.id },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referans bulunamadı." }, { status: 404 });
    }

    if (referral.status === "COMPLETED") {
      return NextResponse.json({ error: "Tamamlanmış referans silinemez." }, { status: 400 });
    }

    await prisma.referral.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Referans silindi." });
  } catch (error) {
    console.error("Referral DELETE error:", error);
    return NextResponse.json({ error: "Referans silinirken hata oluştu." }, { status: 500 });
  }
}
