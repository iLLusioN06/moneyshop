// =============================================
// MoneyShop - Döviz Kuru Servisi
// =============================================
// open.er-api.com üzerinden güncel kurları alır,
// 5 dakika boyunca cache'ler.
// =============================================

export const SUPPORTED_CURRENCIES = [
  "TRY",
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "AED",
  "IQD",
  "XAU", // Altın (gram)
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

interface CacheEntry {
  rates: Record<string, number>;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

/**
 * Tüm kurları USD bazında getir (daha sonra istenen baseCurrency'e çevrilir).
 * open.er-api.com ücretsiz, API key gerektirmez.
 */
async function fetchUSDRates(): Promise<Record<string, number>> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Exchange rate API returned ${res.status}`);
  }

  const data = await res.json();
  if (data.result !== "success" || !data.rates) {
    throw new Error("Invalid exchange rate response");
  }

  return data.rates as Record<string, number>;
}

/**
 * USD bazlı kurları al, cache'le.
 */
async function getUSDRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.rates;
  }

  const rates = await fetchUSDRates();

  // XAU (gram altın) için metals.live'dan al
  try {
    const metalsRes = await fetch("https://api.metals.live/v1/spot/gold", {
      signal: AbortSignal.timeout(6_000),
    });
    if (metalsRes.ok) {
      const goldUsdPerOunce = await metalsRes.json();
      // 1 ons = 31.1035 gram, gram altın fiyatı = ons fiyatı / 31.1035
      const goldUsdPerGram = goldUsdPerOunce / 31.1035;
      rates["XAU"] = goldUsdPerGram; // USD/gram
    }
  } catch {
    // XAU rate fail → skip
  }

  cache = { rates, timestamp: Date.now() };
  return rates;
}

/**
 * İstenen baseCurrency cinsinden tüm kur oranlarını döndürür.
 * Örn: getRates("TRY") → { USD: 36.5, EUR: 39.8, ... }
 *        (1 USD = 36.5 TRY, 1 EUR = 39.8 TRY)
 */
export async function getExchangeRates(
  baseCurrency: string = "TRY"
): Promise<Record<string, number>> {
  const usdRates = await getUSDRates();
  const baseToUsd = usdRates[baseCurrency];

  if (!baseToUsd || baseToUsd === 0) {
    throw new Error(`Unsupported base currency: ${baseCurrency}`);
  }

  // USD → baseCurrency çevrim oranları
  const rates: Record<string, number> = {};

  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === baseCurrency) {
      rates[currency] = 1;
      continue;
    }

    const rateToUsd = usdRates[currency];
    if (rateToUsd && rateToUsd > 0) {
      // 1 USD = X baseCurrency → 1 currency = (rateToUsd / baseToUsd) baseCurrency
      rates[currency] = rateToUsd / baseToUsd;
    }
  }

  return rates;
}

/**
 * Belirli bir tutarı kaynak birimden hedef birime çevir.
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === "TRY" && !rates[fromCurrency]) {
    // TRY her zaman 1
    return amount;
  }

  const rate = rates[fromCurrency];
  if (!rate || rate === 0) {
    return amount; // dönüşüm yoksa olduğu gibi bırak
  }

  return amount * rate;
}

/**
 * Cache'i temizle (manuel kullanım için)
 */
export function clearExchangeRatesCache(): void {
  cache = null;
}

/**
 * Son cache zamanını döndür (debug)
 */
export function getCacheAge(): number | null {
  return cache ? Date.now() - cache.timestamp : null;
}
