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

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;

    const fees = await prisma.fee.findMany({
      where,
      orderBy: { type: "asc" },
    });

    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    console.error("Fees GET error:", error);
    return NextResponse.json({ error: "Ücretler alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, calculationType, rate, minFee, maxFee, currency, tierRules, description } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Ücret adı ve türü zorunludur." }, { status: 400 });
    }

    const fee = await prisma.fee.create({
      data: {
        name: name.trim(),
        type,
        calculationType: calculationType || "FIXED",
        rate: rate || 0,
        minFee: minFee || 0,
        maxFee: maxFee || null,
        currency: currency || "TRY",
        tierRules: tierRules || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error) {
    console.error("Fees POST error:", error);
    return NextResponse.json({ error: "Ücret oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
