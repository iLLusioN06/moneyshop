// =============================================
// MoneyShop - CBI Exchange Rates API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";
import { getCBIRates, getIQDRate, type CBI_RATE } from "@/lib/cbi-rates";

interface CBIResponse {
  success: boolean;
  data: {
    rates: CBI_RATE[];
    lastUpdate: string;
    cached: boolean;
    iqdBasis: {
      usdToIqd: number;
      iqdToUsd: number;
    };
  };
}

async function handler(_req: Request): Promise<NextResponse<CBIResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli.", success: false, data: { rates: [], lastUpdate: "", cached: false, iqdBasis: { usdToIqd: 0, iqdToUsd: 0 } } },
        { status: 401 }
      );
    }

    const { rates, lastUpdate, cached } = await getCBIRates();
    const iqdRate = await getIQDRate();

    return NextResponse.json(
      {
        success: true,
        data: {
          rates,
          lastUpdate,
          cached,
          iqdBasis: {
            usdToIqd: iqdRate,
            iqdToUsd: 1 / iqdRate,
          },
        },
      },
      { headers: getCacheHeaders(300) } // 5 dakika cache
    );
  } catch (error) {
    console.error("CBI Rates GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "CBI kurları alınırken bir hata oluştu.",
        data: { rates: [], lastUpdate: "", cached: false, iqdBasis: { usdToIqd: 0, iqdToUsd: 0 } },
      },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
