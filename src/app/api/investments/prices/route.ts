// =============================================
// MoneyShop - Market Data Price API
// =============================================
// GET  /api/investments/prices?symbol=AAPL&type=STOCK  → single price lookup
// POST /api/investments/prices                         → batch refresh for user's investments
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lookupPrice, lookupPrices, validateSymbol } from "@/lib/market-data";

// GET /api/investments/prices?symbol=AAPL&type=STOCK
// GET /api/investments/prices?symbol=BTC&type=CRYPTO
// GET /api/investments/prices?validate=true&symbol=AAPL&type=STOCK
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const type = (searchParams.get("type") || "STOCK").toUpperCase() as
      | "STOCK"
      | "CRYPTO"
      | "COMMODITY"
      | "FUND"
      | "FOREX"
      | "OTHER";
    const validate = searchParams.get("validate") === "true";

    if (!symbol) {
      return NextResponse.json({ error: "symbol parametresi gerekli." }, { status: 400 });
    }

    if (validate) {
      const result = await validateSymbol(symbol, type);
      return NextResponse.json({ success: true, ...result });
    }

    const result = await lookupPrice(symbol, type);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Prices GET error:", error);
    return NextResponse.json(
      { error: "Fiyat bilgisi alınamadı." },
      { status: 500 }
    );
  }
}

// POST /api/investments/prices
// Body: {}  → refreshes prices for all user's investments
// Body: { items: [{ symbol, type }] }  → custom batch lookup
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    let items: { symbol: string; type: "STOCK" | "CRYPTO" | "COMMODITY" | "FUND" | "FOREX" | "OTHER" }[];

    if (body.items && Array.isArray(body.items)) {
      // Custom batch lookup
      items = body.items;
    } else {
      // Refresh user's investments
      const investments = await prisma.investment.findMany({
        where: { userId: session.user.id },
        select: { symbol: true, type: true },
      });
      items = investments.map((inv) => ({
        symbol: inv.symbol,
        type: (inv.type as any) || "STOCK",
      }));
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        data: { results: [], timestamp: new Date().toISOString() },
      });
    }

    const data = await lookupPrices(items);

    // Update current prices in database for user's own investments
    if (!body.items) {
      for (const result of data.results) {
        if (result.price > 0) {
          await prisma.investment.updateMany({
            where: {
              userId: session.user.id,
              symbol: result.symbol,
            },
            data: { currentPrice: result.price },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Prices POST error:", error);
    return NextResponse.json(
      { error: "Fiyatlar güncellenemedi." },
      { status: 500 }
    );
  }
}
