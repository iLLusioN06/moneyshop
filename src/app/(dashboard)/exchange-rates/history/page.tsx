"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Input, EmptyState, Badge } from "@/components/ui";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExchangeRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  previousRate?: number;
  changePercent?: number;
  createdAt: string;
}

export default function ExchangeRatesHistoryPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [base, setBase] = useState("USD");
  const [quote, setQuote] = useState("IQD");

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/exchange-rates/history?base=${base}&quote=${quote}`);
      const data = await res.json();
      if (data.success) setRates(data.data);
    } catch {} finally { setIsLoading(false); }
  }, [base, quote]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Döviz Kuru Geçmişi</h2>
          <p className="text-sm text-text-muted mt-1">Kur değişimlerini takip edin</p>
        </div>
        <button onClick={fetchRates} className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input label="Temel" value={base} onChange={(e) => setBase(e.target.value.toUpperCase())} className="w-24" />
            <ArrowUpDown className="w-5 h-5 text-text-muted mt-5" />
            <Input label="Hedef" value={quote} onChange={(e) => setQuote(e.target.value.toUpperCase())} className="w-24" />
            <Button className="mt-5" onClick={fetchRates}>Sorgula</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Card key={i}><CardContent className="p-3"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/4" /></CardContent></Card>)}</div>
      ) : rates.length === 0 ? (
        <Card><EmptyState icon={TrendingUp} title="Veri yok" description={`${base}/${quote} için kur geçmişi bulunamadı.`} /></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {rates.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-tertiary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-text-primary">{Number(r.rate).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                      <p className="text-xs text-text-muted">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.changePercent !== null && r.changePercent !== undefined && (
                      <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", r.changePercent > 0 ? "bg-profit/10 text-profit" : r.changePercent < 0 ? "bg-loss/10 text-loss" : "bg-surface-tertiary text-text-muted")}>
                        {r.changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        %{Math.abs(r.changePercent).toFixed(2)}
                      </span>
                    )}
                    <Badge className="text-xs bg-surface-tertiary text-text-muted" size="sm">{r.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
