// =============================================
// MoneyShop - Market Data Provider
// =============================================
// Default: yahoo-finance2 (free, no API key needed)
// Optional: Finnhub (requires FINNHUB_API_KEY env var)
// Supports: STOCK, CRYPTO, COMMODITY, FUND, FOREX
// =============================================

import yahooFinance from "yahoo-finance2";

// ─── Types ───────────────────────────────────────────────

export type AssetType = "STOCK" | "CRYPTO" | "COMMODITY" | "FUND" | "FOREX" | "OTHER";

export interface PriceResult {
  symbol: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  name: string;
  source: "yahoo" | "finnhub" | "coingecko" | "fallback";
  error?: string;
}

export interface PriceBatchResult {
  results: PriceResult[];
  timestamp: string;
}

// ─── Symbol Mapping ──────────────────────────────────────

/**
 * Converts our internal symbols to provider-specific symbols.
 */
function toYahooSymbol(symbol: string, type: AssetType): string {
  switch (type) {
    case "CRYPTO":
      // Yahoo uses XXX-USD format for crypto
      return symbol.includes("-") ? symbol : `${symbol.toUpperCase()}-USD`;
    case "FOREX":
      // Yahoo uses XXXYYY=X format for forex
      return symbol.includes("=") ? symbol : `${symbol.toUpperCase()}=X`;
    default:
      return symbol.toUpperCase();
  }
}

function toFinnhubSymbol(symbol: string, type: AssetType): string {
  switch (type) {
    case "CRYPTO":
      return `BINANCE:${symbol.toUpperCase()}USDT`;
    case "FOREX":
      return `OANDA:${symbol.toUpperCase()}`;
    default:
      return symbol.toUpperCase();
  }
}

// ─── Yahoo Finance Provider ──────────────────────────────

interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  shortName?: string;
  longName?: string;
  symbol?: string;
}

async function lookupYahoo(
  symbol: string,
  type: AssetType
): Promise<PriceResult | null> {
  try {
    const yahooSymbol = toYahooSymbol(symbol, type);
    const raw = await yahooFinance.quote(yahooSymbol);
    const quote = raw as unknown as YahooQuote;

    if (!quote || !quote.regularMarketPrice) {
      // Try alternative: for crypto, try without -USD suffix
      if (type === "CRYPTO" && symbol.includes("-")) {
        const altSymbol = symbol.split("-")[0];
        const rawAlt = await yahooFinance.quote(altSymbol);
        const altQuote = rawAlt as unknown as YahooQuote;
        if (altQuote?.regularMarketPrice) {
          return {
            symbol,
            price: altQuote.regularMarketPrice,
            currency: altQuote.currency || "USD",
            change: altQuote.regularMarketChange ?? 0,
            changePercent: altQuote.regularMarketChangePercent ?? 0,
            name: altQuote.shortName || altQuote.longName || symbol,
            source: "yahoo",
          };
        }
      }
      return null;
    }

    return {
      symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency || "USD",
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      name: quote.shortName || quote.longName || symbol,
      source: "yahoo",
    };
  } catch (err) {
    console.warn(`[market-data] Yahoo lookup failed for ${symbol}:`, err);
    return null;
  }
}

// ─── Finnhub Provider ────────────────────────────────────

const FINNHUB_BASE = "https://finnhub.io/api/v1";

async function lookupFinnhub(
  symbol: string,
  type: AssetType
): Promise<PriceResult | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  try {
    const finnhubSymbol = toFinnhubSymbol(symbol, type);

    // Quote endpoint
    const res = await fetch(
      `${FINNHUB_BASE}/quote?symbol=${finnhubSymbol}&token=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.c || data.c === 0) return null;

    return {
      symbol,
      price: data.c,
      currency: type === "CRYPTO" ? "USD" : "USD",
      change: data.d ?? 0,
      changePercent: data.dp ?? 0,
      name: symbol.toUpperCase(),
      source: "finnhub",
    };
  } catch (err) {
    console.warn(`[market-data] Finnhub lookup failed for ${symbol}:`, err);
    return null;
  }
}

// ─── CoinGecko Provider (Crypto only, no API key) ────────

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function lookupCoinGecko(symbol: string): Promise<PriceResult | null> {
  try {
    // CoinGecko uses IDs, not symbols. Try simple price endpoint with symbol lookup.
    const res = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const entry = data[symbol.toLowerCase()];
    if (!entry?.usd) return null;

    return {
      symbol,
      price: entry.usd,
      currency: "USD",
      change: entry.usd_24h_change ?? 0,
      changePercent: 0,
      name: symbol.toUpperCase(),
      source: "coingecko",
    };
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────

/**
 * Lookup current price for a single investment.
 * Tries providers in order: Finnhub (if configured) → Yahoo → CoinGecko (crypto only)
 */
export async function lookupPrice(
  symbol: string,
  type: AssetType = "STOCK"
): Promise<PriceResult> {
  // Try Finnhub first if API key is configured
  if (process.env.FINNHUB_API_KEY) {
    const finnhubResult = await lookupFinnhub(symbol, type);
    if (finnhubResult) return finnhubResult;
  }

  // Try Yahoo Finance
  const yahooResult = await lookupYahoo(symbol, type);
  if (yahooResult) return yahooResult;

  // For crypto, try CoinGecko as fallback
  if (type === "CRYPTO") {
    const cgResult = await lookupCoinGecko(symbol);
    if (cgResult) return cgResult;
  }

  // All providers failed
  return {
    symbol,
    price: 0,
    currency: "USD",
    change: 0,
    changePercent: 0,
    name: symbol.toUpperCase(),
    source: "fallback",
    error: `Fiyat alınamadı: "${symbol}" için uygun veri kaynağı yok.`,
  };
}

/**
 * Batch lookup prices for multiple investments.
 */
export async function lookupPrices(
  items: { symbol: string; type: AssetType }[]
): Promise<PriceBatchResult> {
  const results = await Promise.all(
    items.map((item) => lookupPrice(item.symbol, item.type))
  );

  return {
    results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate a symbol by looking up its price.
 * Returns true if the symbol returned a valid price.
 */
export async function validateSymbol(
  symbol: string,
  type: AssetType = "STOCK"
): Promise<{ valid: boolean; name?: string; price?: number }> {
  const result = await lookupPrice(symbol, type);
  if (result.error || result.price === 0) {
    return { valid: false };
  }
  return { valid: true, name: result.name, price: result.price };
}
