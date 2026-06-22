import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function signHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json({ error: "Sözleşme ID'si gerekli." }, { status: 400 });
    }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, userId: session.user.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
    }

    if (contract.status === "ACTIVE" && contract.signedAt) {
      return NextResponse.json({ error: "Bu sözleşme zaten imzalanmış." }, { status: 409 });
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "ACTIVE",
        signedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Sözleşme başarıyla imzalandı." });
  } catch (error) {
    console.error("Contract sign error:", error);
    return NextResponse.json({ error: "Sözleşme imzalanırken hata oluştu." }, { status: 500 });
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, signHandler);
