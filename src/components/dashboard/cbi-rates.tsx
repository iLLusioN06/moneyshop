"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Landmark,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface CBI_RATE {
  code: string;
  name: string;
  rate: number;
  date: string;
}

interface CBIRatesData {
  rates: CBI_RATE[];
  lastUpdate: string;
  cached: boolean;
  iqdBasis: {
    usdToIqd: number;
    iqdToUsd: number;
  };
}

interface CBIRatesProps {
  t: (key: string) => string;
}

// Öne çıkan para birimleri
const FEATURED_CURRENCIES = ["USD", "EUR", "TRY", "GBP", "SAR", "AED"];

function getRateChangeColor(rate: number): string {
  if (rate > 1) return "text-profit";
  if (rate < 1) return "text-loss";
  return "text-text-muted";
}

export default function CBIRates({ t }: CBIRatesProps) {
  const [data, setData] = useState<CBIRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCBIRates = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/cbi-rates");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Veri alınamadı");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchCBIRates();
    }, 0);
  }, [fetchCBIRates]);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-tertiary" />
          <div className="h-5 w-40 bg-surface-tertiary rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-surface-tertiary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <Landmark className="w-5 h-5 text-text-muted" />
          <h3 className="font-semibold text-text-primary">{t("cbi.title")}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => fetchCBIRates(true)}
          className="mt-3 text-sm text-secondary hover:underline"
        >
          {t("cbi.retry")}
        </button>
      </div>
    );
  }

  const featuredRates = data?.rates.filter((r) =>
    FEATURED_CURRENCIES.includes(r.code)
  ) || [];

  return (
    <div className="rounded-xl bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{t("cbi.title")}</h3>
            <p className="text-xs text-text-muted">{t("cbi.subtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => fetchCBIRates(true)}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
          title={t("cbi.refresh")}
        >
          <RefreshCw
            className={`w-4 h-4 text-text-muted ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* IQD Basis */}
      {data?.iqdBasis && data.iqdBasis.usdToIqd > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-text-primary">{t("cbi.iqdBasis")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">1 USD =</span>
            <span className="font-semibold text-secondary">
              {data.iqdBasis.usdToIqd.toLocaleString("tr-TR")} IQD
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-text-muted">1 IQD =</span>
            <span className="font-semibold text-secondary">
              {data.iqdBasis.iqdToUsd.toFixed(6)} USD
            </span>
          </div>
        </div>
      )}

      {/* Rates List */}
      <div className="space-y-2">
        {featuredRates.map((rate) => (
          <div
            key={rate.code}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-surface-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border">
                <span className="text-xs font-bold text-text-primary">{rate.code}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{rate.name}</p>
                <p className="text-xs text-text-muted">{rate.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">
                {rate.rate.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </p>
              <p className="text-xs text-text-muted">{t("cbi.perUSD")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Last Update */}
      {data?.lastUpdate && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {t("cbi.lastUpdate")}:{" "}
            {new Date(data.lastUpdate).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {data.cached && (
            <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
              {t("cbi.cached")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
