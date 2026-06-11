"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAccounts } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  notes: string | null;
  account: { id: string; name: string };
}

interface PortfolioSummary {
  totalCost: number;
  totalCurrent: number;
  totalProfit: number;
  profitPercent: number;
  typeBreakdown: Record<string, { cost: number; current: number }>;
}

const typeLabels: Record<string, string> = {
  STOCK: "Hisse Senedi",
  CRYPTO: "Kripto Para",
  COMMODITY: "Emtia",
  FUND: "Fon",
  OTHER: "Diğer",
};

const typeColors: Record<string, string> = {
  STOCK: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CRYPTO: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  COMMODITY: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  FUND: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function PortfolioContent() {
  const { data: accounts } = useAccounts();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formAccountId, setFormAccountId] = useState("");
  const [formName, setFormName] = useState("");
  const [formSymbol, setFormSymbol] = useState("");
  const [formType, setFormType] = useState("STOCK");
  const [formShares, setFormShares] = useState("");
  const [formBuyPrice, setFormBuyPrice] = useState("");
  const [formCurrentPrice, setFormCurrentPrice] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Price refresh
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);

  // Auto price lookup
  const [autoPriceLoading, setAutoPriceLoading] = useState(false);
  const [autoPriceResult, setAutoPriceResult] = useState<{
    price: number;
    name: string;
    currency: string;
  } | null>(null);
  const [autoPriceError, setAutoPriceError] = useState("");
  const priceLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/investments");
      const data = await res.json();
      if (data.success) {
        setInvestments(data.data ?? []);
        setSummary(data.summary ?? null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Portföy verileri alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true);
    try {
      const res = await fetch("/api/investments/prices", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLastPriceUpdate(new Date().toLocaleString("tr-TR"));
        fetchPortfolio(); // refresh with updated prices
      }
    } catch {
      // silent
    } finally {
      setRefreshingPrices(false);
    }
  };

  // Auto price lookup on symbol change (debounced)
  useEffect(() => {
    if (priceLookupTimer.current) clearTimeout(priceLookupTimer.current);

    const symbol = formSymbol.trim();
    if (!symbol || symbol.length < 1) {
      setAutoPriceResult(null);
      setAutoPriceError("");
      return;
    }

    priceLookupTimer.current = setTimeout(async () => {
      setAutoPriceLoading(true);
      setAutoPriceError("");
      try {
        const res = await fetch(
          `/api/investments/prices?symbol=${encodeURIComponent(symbol)}&type=${formType}&validate=true`
        );
        const data = await res.json();
        if (data.success && data.valid) {
          setAutoPriceResult({ price: data.price, name: data.name || "", currency: "USD" });
          setAutoPriceError("");
          // Auto-fill the buy price if empty
          if (!formBuyPrice) {
            setFormBuyPrice(data.price.toString());
          }
        } else {
          setAutoPriceResult(null);
          setAutoPriceError("Sembol bulunamadı");
        }
      } catch {
        setAutoPriceResult(null);
        setAutoPriceError("Sorgulanamadı");
      } finally {
        setAutoPriceLoading(false);
      }
    }, 800);

    return () => {
      if (priceLookupTimer.current) clearTimeout(priceLookupTimer.current);
    };
  }, [formSymbol, formType]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: formAccountId,
          name: formName,
          symbol: formSymbol.toUpperCase(),
          type: formType,
          shares: parseFloat(formShares),
          buyPrice: parseFloat(formBuyPrice),
          currentPrice: formCurrentPrice ? parseFloat(formCurrentPrice) : parseFloat(formBuyPrice),
          notes: formNotes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        resetForm();
        fetchPortfolio();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yatırımı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/investments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchPortfolio();
    } catch {
      // silent
    }
  };

  const resetForm = () => {
    setFormAccountId("");
    setFormName("");
    setFormSymbol("");
    setFormType("STOCK");
    setFormShares("");
    setFormBuyPrice("");
    setFormCurrentPrice("");
    setFormNotes("");
  };

  const investAccounts = accounts?.filter(
    (a: { type: string }) => a.type === "INVESTMENT" || a.type === "CHECKING"
  );

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Yatırım Portföyü</h2>
        <p className="text-sm text-text-muted mt-1">
          Yatırımlarınızı takip edin ve yönetin
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-text-muted">Toplam Maliyet</p>
              <p className="text-xl font-bold text-text-primary mt-1">
                {formatCurrency(summary.totalCost, "TRY")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-text-muted">Güncel Değer</p>
              <p className="text-xl font-bold text-text-primary mt-1">
                {formatCurrency(summary.totalCurrent, "TRY")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-text-muted">Kar/Zarar</p>
              <div className="flex items-center gap-2 mt-1">
                {summary.totalProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-profit" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-loss" />
                )}
                <span className={`text-xl font-bold ${summary.totalProfit >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(summary.totalProfit, "TRY")}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-text-muted">Getiri Oranı</p>
              <span className={`text-xl font-bold mt-1 ${summary.profitPercent >= 0 ? "text-profit" : "text-loss"}`}>
                %{summary.profitPercent.toFixed(2)}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Yatırım
          </Button>
          <Button variant="outline" onClick={fetchPortfolio}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sayfayı Güncelle
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {lastPriceUpdate && (
            <span className="text-xs text-text-muted">
              Son güncelleme: {lastPriceUpdate}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPrices}
            disabled={refreshingPrices || investments.length === 0}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshingPrices ? "animate-spin" : ""}`} />
            {refreshingPrices ? "Güncelleniyor..." : "Fiyatları Güncelle"}
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Yatırım Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Hesap</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  >
                    <option value="">Hesap Seçin</option>
                    {investAccounts?.map((acc: { id: string; name: string }) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Tür</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  >
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Yatırım Adı</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="Örn: Apple Inc."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Sembol</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formSymbol}
                      onChange={(e) => setFormSymbol(e.target.value)}
                      required
                      placeholder="Örn: AAPL"
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-border bg-surface text-text-primary text-sm"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {autoPriceLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                      ) : autoPriceResult ? (
                        <CheckCircle2 className="w-4 h-4 text-profit" />
                      ) : autoPriceError ? (
                        <XCircle className="w-4 h-4 text-loss" />
                      ) : null}
                    </div>
                  </div>
                  {autoPriceResult && (
                    <p className="text-xs text-profit mt-1">
                      <Search className="w-3 h-3 inline mr-1" />
                      {autoPriceResult.name}: {formatCurrency(autoPriceResult.price, autoPriceResult.currency)}
                    </p>
                  )}
                  {autoPriceError && (
                    <p className="text-xs text-loss mt-1">{autoPriceError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Miktar (Adet)</label>
                  <input
                    type="number"
                    step="any"
                    value={formShares}
                    onChange={(e) => setFormShares(e.target.value)}
                    required
                    min="0"
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Alış Fiyatı</label>
                  <input
                    type="number"
                    step="any"
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(e.target.value)}
                    required
                    min="0"
                    placeholder="150.00"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Güncel Fiyat (opsiyonel)</label>
                  <input
                    type="number"
                    step="any"
                    value={formCurrentPrice}
                    onChange={(e) => setFormCurrentPrice(e.target.value)}
                    min="0"
                    placeholder="Alış fiyatı ile aynı"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Not (opsiyonel)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="İsteğe bağlı not"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ekle
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Holdings List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="w-12 h-12 text-loss mb-4" />
            <p className="text-text-muted">{error}</p>
          </CardContent>
        </Card>
      ) : investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BarChart3 className="w-12 h-12 text-text-muted/40 mb-4" />
            <p className="text-text-muted">Henüz yatırım eklenmemiş.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const totalCost = inv.shares * inv.buyPrice;
            const totalCurrent = inv.shares * inv.currentPrice;
            const profit = totalCurrent - totalCost;
            const profitPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;

            return (
              <Card key={inv.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary">{inv.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[inv.type] || typeColors.OTHER}`}>
                          {typeLabels[inv.type] || inv.type}
                        </span>
                        <span className="text-xs text-text-muted font-mono">{inv.symbol}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span>{inv.shares} adet</span>
                        <span>Alış: {formatCurrency(inv.buyPrice, inv.currency)}</span>
                        <span>Güncel: {formatCurrency(inv.currentPrice, inv.currency)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">Toplam: {formatCurrency(totalCurrent, inv.currency)}</span>
                        <span className={`text-xs font-medium flex items-center gap-1 ${profit >= 0 ? "text-profit" : "text-loss"}`}>
                          {profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {profit >= 0 ? "+" : ""}{formatCurrency(profit, inv.currency)} (%{profitPct.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-loss transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <ErrorBoundary>
      <PortfolioContent />
    </ErrorBoundary>
  );
}
