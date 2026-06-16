// =============================================
// MoneyShop - Döviz Kurları API
// =============================================

import { NextResponse } from "next/server";
import { getExchangeRates, SUPPORTED_CURRENCIES } from "@/lib/exchange-rates";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const baseCurrency = searchParams.get("base") || "TRY";

    if (!SUPPORTED_CURRENCIES.includes(baseCurrency as never)) {
      return NextResponse.json(
        { error: `Desteklenmeyen para birimi: ${baseCurrency}` },
        { status: 400 }
      );
    }

    const rates = await getExchangeRates(baseCurrency);

    return NextResponse.json({
      success: true,
      data: {
        base: baseCurrency,
        rates,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Exchange rates error:", error);
    return NextResponse.json(
      { error: "Döviz kurları alınamadı." },
      { status: 500 }
    );
  }
}
