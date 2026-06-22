import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function trustHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, trusted } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "Cihaz ID'si gerekli." }, { status: 400 });
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: session.user.id },
    });

    if (!device) {
      return NextResponse.json({ error: "Cihaz bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: { isTrusted: trusted !== false },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Device trust error:", error);
    return NextResponse.json({ error: "Cihaz güvenilirliği güncellenirken hata oluştu." }, { status: 500 });
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, trustHandler);
