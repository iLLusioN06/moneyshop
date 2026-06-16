"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, EmptyState } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Receipt, ArrowLeft, CheckCircle2, AlertCircle, X,
  Zap, Droplets, Flame, Wifi, Phone, Shield, Repeat, CreditCard,
  Clock, Sparkles, Wallet, Search,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinancialAccount, Transaction } from "@/types";

// ─── Fatura Tipleri ─────────────────────────────────────────────────────────
const billTypes = [
  { id: "electric", label: "Elektrik", icon: Zap, gradient: "from-yellow-500 to-amber-600", headerGradient: "from-yellow-500/10 via-yellow-500/5 to-transparent", accent: "text-yellow-500" },
  { id: "water", label: "Su", icon: Droplets, gradient: "from-blue-500 to-cyan-600", headerGradient: "from-blue-500/10 via-blue-500/5 to-transparent", accent: "text-blue-500" },
  { id: "gas", label: "Doğalgaz", icon: Flame, gradient: "from-orange-500 to-red-600", headerGradient: "from-orange-500/10 via-orange-500/5 to-transparent", accent: "text-orange-500" },
  { id: "internet", label: "İnternet", icon: Wifi, gradient: "from-purple-500 to-violet-600", headerGradient: "from-purple-500/10 via-purple-500/5 to-transparent", accent: "text-purple-500" },
  { id: "phone", label: "Telefon", icon: Phone, gradient: "from-emerald-500 to-teal-600", headerGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", accent: "text-emerald-500" },
  { id: "insurance", label: "Sigorta", icon: Shield, gradient: "from-red-500 to-rose-600", headerGradient: "from-red-500/10 via-red-500/5 to-transparent", accent: "text-red-500" },
  { id: "subscription", label: "Abonelik", icon: Repeat, gradient: "from-indigo-500 to-purple-600", headerGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent", accent: "text-indigo-500" },
  { id: "other", label: "Diğer", icon: Receipt, gradient: "from-gray-500 to-slate-600", headerGradient: "from-gray-500/10 via-gray-500/5 to-transparent", accent: "text-gray-500" },
];

// ─── Başarılı İşlem ─────────────────────────────────────────────────────────
function SuccessView({ onBack, title, message, onNew }: {
  onBack: () => void; title: string; message: string; onNew: () => void;
}) {
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Geri
      </button>
      <div className="max-w-md mx-auto text-center py-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-profit/10 animate-ping opacity-25" style={{ animationDuration: '1.5s' }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-profit to-emerald-500 flex items-center justify-center shadow-lg shadow-profit/20 animate-[scale-in_0.3s_ease-out]">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2 animate-[slide-up_0.3s_ease-out]">{title}</h2>
        <p className="text-sm text-text-muted mb-8 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.1s' }}>{message}</p>
        <div className="flex gap-3 justify-center animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.2s' }}>
          <Button onClick={onNew} className="group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Yeni Ödeme
          </Button>
          <Button variant="outline" onClick={onBack}>Ana Sayfa</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Ödeme Formu ────────────────────────────────────────────────────────────
function PaymentForm({
  billType, billLabel, billIcon: Icon, billGradient, billHeaderGradient, onBack,
}: {
  billType: string; billLabel: string; billIcon: React.ElementType; billGradient: string; billHeaderGradient: string; onBack: () => void;
}) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) { setAccounts(data.data); if (data.data.length > 0) setAccountId(data.data[0].id); }
    } catch { setError("Hesaplar alınamadı."); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!accountId) { setFieldErrors({ accountId: "Lütfen hesap seçin" }); return; }
    if (!amount || parseFloat(amount) <= 0) { setFieldErrors({ amount: "Geçerli bir tutar girin" }); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) { setFieldErrors({ amount: "Yetersiz bakiye" }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), billType, referenceNumber: referenceNumber.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Ödeme başarısız."); setIsSubmitting(false); return; }
      setSuccess(true); setAmount(""); setReferenceNumber("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        onBack={onBack}
        title="Ödeme Başarılı!"
        message={`${billLabel} ödendi.`}
        onNew={() => { setSuccess(false); setAmount(""); setReferenceNumber(""); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Geri
      </button>

      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${billHeaderGradient} border-b border-border`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${billGradient} flex items-center justify-center shadow-md`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{billLabel} Ödemesi</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Fatura ödemenizi gerçekleştirin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Ödeme Hesabı</label>
              <select
                className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.accountId ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border bg-surface text-text-primary focus:ring-secondary/30 focus:border-secondary/50"}`}
                value={accountId}
                onChange={(e) => { setAccountId(e.target.value); setFieldErrors({}); }}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, a.currency)})</option>
                ))}
              </select>
              {fieldErrors.accountId && <p className="mt-1 text-xs text-danger">{fieldErrors.accountId}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Tutar" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors({}); }} icon={<Wallet className="w-4 h-4" />} required error={fieldErrors.amount} />
              <Input label="Abone/Referans No (isteğe bağlı)" type="text" placeholder="Müşteri numarası" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} icon={<Search className="w-4 h-4" />} />
            </div>

            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss animate-[fade-in_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}

            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary shadow-md group" isLoading={isSubmitting}>
              <Receipt className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {billLabel} Öde
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Fatura Seçim Ekranı ────────────────────────────────────────────────────
function PaymentSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-md">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Ödemeler</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">Fatura ve ödeme işlemlerinizi gerçekleştirin</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {billTypes.map((bt, idx) => {
            const Icon = bt.icon;
            return (
              <button
                key={bt.id}
                onClick={() => onSelect(bt.id)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface border-2 border-border hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-[slide-up_0.3s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bt.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-text-primary group-hover:text-secondary transition-colors">{bt.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Ana Controller ─────────────────────────────────────────────────────────
function PaymentsContent() {
  const router = useRouter();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [recentPayments, setRecentPayments] = useState<Transaction[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const fetchRecentPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?limit=5");
      const data = await res.json();
      if (data.success) setRecentPayments(data.data.filter((t: Transaction) => t.type === "EXPENSE"));
    } catch { /* ignore */ }
    finally { setPaymentsLoading(false); }
  }, []);

  useEffect(() => { fetchRecentPayments(); }, [fetchRecentPayments]);

  const handleBack = () => setSelectedBill(null);

  if (selectedBill) {
    const bill = billTypes.find((b) => b.id === selectedBill);
    if (bill) {
      return (
        <PaymentForm billType={bill.id} billLabel={bill.label} billIcon={bill.icon} billGradient={bill.gradient} billHeaderGradient={bill.headerGradient} onBack={handleBack} />
      );
    }
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
        <h2 className="text-2xl font-bold text-text-primary">Ödemeler</h2>
        <p className="text-sm text-text-muted mt-1">Fatura ve ödeme işlemlerinizi yönetin</p>
      </div>
      </div>

      <PaymentSelection onSelect={setSelectedBill} />

      {/* Son Ödemeler */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-text-muted" />
            Son Ödemeler
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-surface-tertiary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-surface-tertiary rounded" />
                    <div className="h-3 w-1/4 bg-surface-tertiary rounded" />
                  </div>
                  <div className="h-4 w-16 bg-surface-tertiary rounded" />
                </div>
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Henüz ödeme yapılmamış"
              description="Fatura ödemeleriniz burada görünecek."
              gradient="from-secondary to-indigo-600"
            />
          ) : (
            <div className="divide-y divide-border">
              {recentPayments.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-surface-tertiary/50 transition-colors group animate-[slide-up_0.2s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-loss/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Receipt className="w-4 h-4 text-loss" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{tx.description || "Ödeme"}</p>
                      <p className="text-xs text-text-muted">{formatDate(new Date(tx.date), "relative")}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-loss whitespace-nowrap ml-2">-{formatCurrency(Math.abs(tx.amount))}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page Export ────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <PaymentsContent />
      </ErrorBoundary>
    </div>
  );
}
