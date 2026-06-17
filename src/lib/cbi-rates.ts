// =============================================
// MoneyShop - CBI (Central Bank of Iraq) Kurları
// =============================================
// Irak Merkez Bankası'ndan güncel kurları çeker.
// https://cbi.iq resmi web sitesinden veri alınır.
// =============================================

interface CBICacheEntry {
  rates: CBI_RATE[];
  timestamp: number;
  lastUpdate: string;
}

export interface CBI_RATE {
  code: string;        // Para birimi kodu (USD, EUR, GBP, TRY, etc.)
  name: string;        // Para birimi adı
  rate: number;        // 1 USD = X birim
  date: string;        // Kur tarihi
}

let cbiCache: CBICacheEntry | null = null;
const CBI_CACHE_TTL = 30 * 60 * 1000; // 30 dakika

/**
 * CBI resmi web sitesinden kurları çek.
 * CBI genellikle JSON formatında veri yayınlar.
 */
async function fetchCBIRawData(): Promise<{ rates: CBI_RATE[]; lastUpdate: string }> {
  // CBI API endpoint - Alternatif olarak cached bir endpoint kullanılır
  const endpoints = [
    "https://api.cbi.iq/en/exchangerate",
    "https://cbi.iq/en/exchangerate",
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          "User-Agent": "MoneyShop/1.0",
          "Accept": "application/json, text/xml, */*",
        },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();

      // JSON yanıtı
      if (contentType.includes("json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        const data = JSON.parse(text);
        return parseCBIJSON(data);
      }

      // XML yanıtı
      if (contentType.includes("xml") || text.includes("<?xml") || text.includes("<exchange")) {
        return parseCBIXML(text);
      }
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }

  // Tüm endpointler başarısızsa fallback kullan
  console.warn("CBI API erişilemedi, fallback kurlar kullanılıyor:", lastError?.message);
  return getCBIFallback();
}

/**
 * CBI JSON yanıtını ayrıştır
 */
function parseCBIJSON(data: unknown): { rates: CBI_RATE[]; lastUpdate: string } {
  const rates: CBI_RATE[] = [];
  let lastUpdate = new Date().toISOString();

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.code && item.rate) {
        rates.push({
          code: String(item.code).toUpperCase(),
          name: String(item.name || item.code),
          rate: parseFloat(String(item.rate)) || 0,
          date: String(item.date || new Date().toISOString()),
        });
      }
    }
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj.data && Array.isArray(obj.data)) {
      for (const item of obj.data as Record<string, unknown>[]) {
        if (item.code && item.rate) {
          rates.push({
            code: String(item.code).toUpperCase(),
            name: String(item.name || item.code),
            rate: parseFloat(String(item.rate)) || 0,
            date: String(item.date || new Date().toISOString()),
          });
        }
      }
    }
    if (obj.lastUpdate) {
      lastUpdate = String(obj.lastUpdate);
    }
  }

  return { rates, lastUpdate };
}

/**
 * CBI XML yanıtını ayrıştır
 */
function parseCBIXML(xml: string): { rates: CBI_RATE[]; lastUpdate: string } {
  const rates: CBI_RATE[] = [];
  let lastUpdate = new Date().toISOString();

  // Basit XML parsing (regex ile)
  const rateMatches = xml.match(/<rate[^>]*>[\s\S]*?<\/rate>/gi) || [];
  const dateMatch = xml.match(/<lastupdate[^>]*>([^<]+)<\/lastupdate>/i);

  if (dateMatch) {
    lastUpdate = dateMatch[1];
  }

  for (const rateBlock of rateMatches) {
    const codeMatch = rateBlock.match(/<currency[^>]*>([^<]+)<\/currency>/i);
    const rateValueMatch = rateBlock.match(/<rate[^>]*>([^<]+)<\/rate>/i);
    const nameMatch = rateBlock.match(/<name[^>]*>([^<]+)<\/name>/i);

    if (codeMatch && rateValueMatch) {
      rates.push({
        code: codeMatch[1].toUpperCase(),
        name: nameMatch?.[1] || codeMatch[1],
        rate: parseFloat(rateValueMatch[1]) || 0,
        date: lastUpdate,
      });
    }
  }

  return { rates, lastUpdate };
}

/**
 * CBI fallback kurları (API erişilemezse kullanılır)
 * Bu değerler yaklaşık değerlerdir ve düzenli olarak güncellenmelidir.
 */
function getCBIFallback(): { rates: CBI_RATE[]; lastUpdate: string } {
  const now = new Date().toISOString();

  // Yaklaşık CBI kurları (1 USD = X birim)
  const fallbackRates: CBI_RATE[] = [
    { code: "USD", name: "US Dollar", rate: 1.0, date: now },
    { code: "EUR", name: "Euro", rate: 0.92, date: now },
    { code: "GBP", name: "British Pound", rate: 0.79, date: now },
    { code: "TRY", name: "Turkish Lira", rate: 36.5, date: now },
    { code: "SAR", name: "Saudi Riyal", rate: 3.75, date: now },
    { code: "AED", name: "UAE Dirham", rate: 3.67, date: now },
    { code: "KWD", name: "Kuwaiti Dinar", rate: 0.31, date: now },
    { code: "BHD", name: "Bahraini Dinar", rate: 0.38, date: now },
    { code: "OMR", name: "Omani Rial", rate: 0.38, date: now },
    { code: "QAR", name: "Qatari Riyal", rate: 3.64, date: now },
  ];

  return { rates: fallbackRates, lastUpdate: now };
}

/**
 * CBI kurlarını al (cache'li)
 */
export async function getCBIRates(): Promise<{
  rates: CBI_RATE[];
  lastUpdate: string;
  cached: boolean;
}> {
  // Cache kontrolü
  if (cbiCache && Date.now() - cbiCache.timestamp < CBI_CACHE_TTL) {
    return {
      rates: cbiCache.rates,
      lastUpdate: cbiCache.lastUpdate,
      cached: true,
    };
  }

  // Yeni veri çek
  const { rates, lastUpdate } = await fetchCBIRawData();

  // Cache'i güncelle
  cbiCache = {
    rates,
    timestamp: Date.now(),
    lastUpdate,
  };

  return { rates, lastUpdate, cached: false };
}

/**
 * Belirli bir para biriminin CBI kurunu al
 */
export async function getCBIRateForCurrency(
  currencyCode: string
): Promise<CBI_RATE | null> {
  const { rates } = await getCBIRates();
  return rates.find(
    (r) => r.code.toUpperCase() === currencyCode.toUpperCase()
  ) || null;
}

/**
 * IQD cinsinden USD kurunu al (Irak Dinarı için özel)
 */
export async function getIQDRate(): Promise<number> {
  const { rates } = await getCBIRates();
  // IQD genellikle USD'ye endekslenir
  // CBI'da IQD/USD kuru genellikle sabittir veya çok az değişir
  const iqdRate = rates.find((r) => r.code === "IQD");
  if (iqdRate) {
    return iqdRate.rate;
  }

  // Fallback: Bilinen yaklaşık değer (1 USD ≈ 1460 IQD)
  return 1460;
}

/**
 * Cache'i temizle
 */
export function clearCBICache(): void {
  cbiCache = null;
}

/**
 * Cache yaşını al
 */
export function getCBICacheAge(): number | null {
  return cbiCache ? Date.now() - cbiCache.timestamp : null;
}
