"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  pair: string;
  rate: number;
  change: number;
  label: string;
}

const CRYPTO_SYMBOLS = [
  { symbol: "BTCUSDT", pair: "BTC/USD", label: "₿" },
  { symbol: "ETHUSDT", pair: "ETH/USD", label: "⟠" },
  { symbol: "SOLUSDT", pair: "SOL/USD", label: "◎" },
  { symbol: "XRPUSDT", pair: "XRP/USD", label: "✕" },
  { symbol: "ADAUSDT", pair: "ADA/USD", label: "₳" },
  { symbol: "DOTUSDT", pair: "DOT/USD", label: "●" },
  { symbol: "DOGEUSDT", pair: "DOGE/USD", label: "Ð" },
  { symbol: "AVAXUSDT", pair: "AVAX/USD", label: "▲" },
];

export function CurrencyMarquee() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const referencePrices = useRef<Record<string, number>>({});
  const referenceSet = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchAll() {
      let anySuccess = false;

      try {
        // ─── 1. Fiat (open.er-api.com) ───
        let usdToTry = 0;
        const fiatItems: TickerItem[] = [];

        try {
          const fiatRes = await fetch("https://open.er-api.com/v6/latest/USD", {
            signal: AbortSignal.timeout(8000),
          });
          if (fiatRes.ok) {
            const fiatData = await fiatRes.json();
            usdToTry = fiatData.rates?.["TRY"] ?? 0;

            if (usdToTry) {
              const fiatPairs: Record<string, string> = {
                "USD/TRY": "USD",
                "EUR/TRY": "EUR",
                "GBP/TRY": "GBP",
                "CHF/TRY": "CHF",
                "AED/TRY": "AED",
                "IQD/TRY": "IQD",
              };

              for (const [pair, currency] of Object.entries(fiatPairs)) {
                const crossRate =
                  currency === "USD"
                    ? usdToTry
                    : fiatData.rates?.[currency]
                      ? usdToTry / fiatData.rates[currency]
                      : 0;
                if (crossRate === 0) continue;

                const prev = referencePrices.current[pair] ?? crossRate;
                if (!referenceSet.current) referencePrices.current[pair] = crossRate;
                const change = prev !== 0 ? ((crossRate - prev) / prev) * 100 : 0;

                fiatItems.push({ pair, rate: crossRate, change, label: "" });
              }
              anySuccess = true;
            }
          }
        } catch {
          // fiat failed, continue with others
        }

        // ─── 2. Crypto (Binance) ───
        const cryptoItems: TickerItem[] = [];

        try {
          const symbols = JSON.stringify(CRYPTO_SYMBOLS.map((c) => c.symbol));
          const binanceRes = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (binanceRes.ok) {
            const data = await binanceRes.json();
            for (const c of CRYPTO_SYMBOLS) {
              const ticker = data.find(
                (t: { symbol: string }) => t.symbol === c.symbol
              );
              if (!ticker?.lastPrice) continue;
              cryptoItems.push({
                pair: c.pair,
                rate: parseFloat(ticker.lastPrice),
                change: parseFloat(ticker.priceChangePercent ?? "0"),
                label: c.label,
              });
              anySuccess = true;
            }
          }
        } catch {
          // crypto failed, continue
        }

        // ─── 3. Metals (metals.live) ───
        const metalsItems: TickerItem[] = [];

        try {
          const metalsRes = await fetch("https://api.metals.live/v1/spot/all", {
            signal: AbortSignal.timeout(6000),
          });
          if (metalsRes.ok) {
            const metalsData = await metalsRes.json();

            if (metalsData.gold && usdToTry) {
              const tryPrice = metalsData.gold * usdToTry;
              const prev = referencePrices.current["XAU/TRY"] ?? tryPrice;
              if (!referenceSet.current) referencePrices.current["XAU/TRY"] = tryPrice;
              const change = prev !== 0 ? ((tryPrice - prev) / prev) * 100 : 0;
              metalsItems.push({ pair: "XAU/TRY", rate: tryPrice, change, label: "🥇" });
              anySuccess = true;
            }
            if (metalsData.silver && usdToTry) {
              const tryPrice = metalsData.silver * usdToTry;
              const prev = referencePrices.current["XAG/TRY"] ?? tryPrice;
              if (!referenceSet.current) referencePrices.current["XAG/TRY"] = tryPrice;
              const change = prev !== 0 ? ((tryPrice - prev) / prev) * 100 : 0;
              metalsItems.push({ pair: "XAG/TRY", rate: tryPrice, change, label: "🥈" });
              anySuccess = true;
            }
          }
        } catch {
          // metals failed, continue
        }

        referenceSet.current = true;

        if (anySuccess) {
          setItems([...fiatItems, ...metalsItems, ...cryptoItems]);
          setHasError(false);
        } else {
          setHasError(true);
        }
      } catch {
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    intervalId = setInterval(fetchAll, 60_000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const displayItems = [...items, ...items];

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-border p-3">
        <div className="h-6 bg-surface-tertiary rounded animate-pulse" />
      </div>
    );
  }

  if (hasError && items.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-loss" />
          Piyasa verileri alınamadı
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="relative flex items-center h-12 overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        {/* Ticker label */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3 bg-surface border-r border-border">
          <span className="text-xs font-semibold text-text-primary whitespace-nowrap">
            📊 Piyasa
          </span>
        </div>

        {/* Marquee track */}
        <div className="flex items-center h-full ml-[76px] overflow-hidden">
          <div className="flex items-center gap-6 animate-marquee">
            {displayItems.map((item, i) => (
              <div
                key={`${item.pair}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {item.label && (
                  <span className="text-sm">{item.label}</span>
                )}
                <span className="text-xs font-semibold text-text-primary">
                  {item.pair}
                </span>
                <span className="text-sm font-mono font-medium text-text-primary">
                  {item.pair.endsWith("/TRY")
                    ? item.rate.toFixed(4)
                    : item.rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-xs ${
                    item.change >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
