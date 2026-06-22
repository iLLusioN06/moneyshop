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
    const base = searchParams.get("base") || "USD";
    const quote = searchParams.get("quote") || "IQD";
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const rates = await prisma.exchangeRate.findMany({
      where: { baseCurrency: base, quoteCurrency: quote },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error("Exchange rates history GET error:", error);
    return NextResponse.json({ error: "Kur geçmişi alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { baseCurrency, quoteCurrency, rate, source } = body;

    if (!baseCurrency || !quoteCurrency || rate === undefined) {
      return NextResponse.json({ error: "Temel para birimi, hedef para birimi ve kur zorunludur." }, { status: 400 });
    }

    const latest = await prisma.exchangeRate.findFirst({
      where: { baseCurrency, quoteCurrency },
      orderBy: { createdAt: "desc" },
    });

    const changePercent = latest
      ? ((Number(rate) - Number(latest.rate)) / Number(latest.rate)) * 100
      : null;

    const exchangeRate = await prisma.exchangeRate.create({
      data: {
        baseCurrency,
        quoteCurrency,
        rate,
        source: source || "manual",
        previousRate: latest?.rate || null,
        changePercent: changePercent ? Math.round(changePercent * 100) / 100 : null,
      },
    });

    return NextResponse.json({ success: true, data: exchangeRate }, { status: 201 });
  } catch (error) {
    console.error("Exchange rates POST error:", error);
    return NextResponse.json({ error: "Kur oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
