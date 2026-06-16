"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  HandCoins, Landmark, CreditCard, Banknote, Copy, Check,
  ArrowLeft, CheckCircle2, AlertCircle, X,
  Wallet, ChevronRight, Sparkles,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";
import { formatCurrency } from "@/lib/utils";
import type { FinancialAccount } from "@/types";
import DekontActions from "@/components/dekont-actions";

// ─── Seçenek Konfigürasyonu ────────────────────────────────────────────────
const depositOptions = [
  {
    id: "iban",
    title: t("deposit.iban"),
    description: "Kendi adınıza tanımlı IBAN numaranıza havale/EFT yaparak hesabınıza para yatırın.",
    icon: Landmark,
    gradient: "from-emerald-500 to-teal-600",
    accent: "text-emerald-500",
    bgAccent: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
    features: ["7/24 işlem", "1-3 iş günü", "Limit yok"],
  },
  {
    id: "card",
    title: t("deposit.card"),
    description: "Kredi kartı veya banka kartınızla anında para yatırın.",
    icon: CreditCard,
    gradient: "from-blue-500 to-indigo-600",
    accent: "text-blue-500",
    bgAccent: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/30",
    features: ["Anında yansır", "7/24", "Günlük limit var"],
  },
  {
    id: "atm",
    title: t("deposit.atm"),
    description: "Size özel barkod/kodu ATM'de okutarak veya MoneyShop Card ile para yatırın.",
    icon: Banknote,
    gradient: "from-amber-500 to-orange-600",
    accent: "text-amber-500",
    bgAccent: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
    features: ["Anında", "Nakit", "7/24"],
  },
];

// ─── Başarılı İşlem Bileşeni ───────────────────────────────────────────────
function SuccessView({ onBack, title, message, onNew, transactionId }: {
  onBack: () => void;
  title: string;
  message: string;
  onNew: () => void;
  transactionId?: string;
}) {
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Geri
      </button>

      <div className="max-w-md mx-auto text-center py-8">
        {/* Success Animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-profit/10 animate-ping opacity-25" style={{ animationDuration: '1.5s' }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-profit to-emerald-500 flex items-center justify-center shadow-lg shadow-profit/20 animate-[scale-in_0.3s_ease-out]">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2 animate-[slide-up_0.3s_ease-out]">
          {title}
        </h2>
        <p className="text-sm text-text-muted mb-8 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.1s' }}>
          {message}
        </p>

        {transactionId && (
          <div className="flex justify-center animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.15s' }}>
            <DekontActions transactionId={transactionId} />
          </div>
        )}
        <div className="flex gap-3 justify-center animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.2s' }}>
          <Button onClick={onNew} className="group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Yeni İşlem
          </Button>
          <Button variant="outline" onClick={onBack}>
            Ana Sayfa
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── IBAN Yatırma ──────────────────────────────────────────────────────────
function IbanDeposit({ onBack }: { onBack: () => void }) {
  const iban = "TR12 0001 2345 6789 0001 2345 67";
  const [copied, setCopied] = useState(false);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch { setError("Hesaplar alınamadı."); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleCopy = () => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!accountId) { setFieldErrors({ accountId: "Lütfen hesap seçin" }); return; }
    if (!amount || parseFloat(amount) <= 0) { setFieldErrors({ amount: "Geçerli bir tutar girin" }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "iban" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccessTxId(data.data?.id || "");
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        transactionId={successTxId}
        onBack={onBack}
        title="Para Yatırma Başarılı!"
        message="IBAN havalesi hesabınıza tanımlandı."
        onNew={() => { setSuccess(false); setAmount(""); setSuccessTxId(""); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Geri
      </button>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Kendi IBAN'ın ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                Aşağıdaki IBAN numarasına havale/EFT yaparak hesabınıza para yatırabilirsiniz.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {/* Alıcı Bilgisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-surface-secondary to-surface border border-border hover:shadow-sm transition-all">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{t("deposit.recipient")}</p>
              <p className="text-sm font-semibold text-text-primary">Mustafa Yılmaz</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-surface-secondary to-surface border border-border">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Banka</p>
              <p className="text-sm font-semibold text-text-primary">Türkiye İş Bankası</p>
            </div>
          </div>

          {/* IBAN */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02] border border-emerald-500/20">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">IBAN</p>
                <p className="text-sm font-mono font-semibold text-text-primary tracking-wider truncate">{iban}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                  copied
                    ? "bg-profit/10 text-profit border border-profit/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-sm"
                }`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Kopyalandı</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Kopyala</>
                )}
              </button>
            </div>
          </div>

          {/* Açıklama */}
          <div className="p-4 rounded-xl bg-surface-secondary border border-border">
            <p className="text-xs text-text-muted mb-1">{t("deposit.description")}</p>
            <p className="text-sm text-text-primary leading-relaxed">
              Gönderilen tutarın doğru şekilde hesabınıza tanımlanması için açıklama kısmına <strong>MoneyShop kullanıcı kodunuzu</strong> yazmanız gerekmektedir.
            </p>
          </div>

          {/* Uyarı */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Önemli Bilgi</p>
              <p className="text-xs text-text-muted leading-relaxed">
                IBAN numarasına yapılan havalelerin hesabınıza yansıması 1-3 iş günü sürebilir.
                50.000 TL ve üzeri işlemlerde bankanızın günlük transfer limitini kontrol ediniz.
              </p>
            </div>
          </div>

          {/* Simüle Et */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              IBAN Havalesini Simüle Et
            </h3>
            <form onSubmit={handleSimulateDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Yatırılacak Hesap</label>
                <select
                  className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.accountId ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border bg-surface text-text-primary focus:ring-emerald-500/30 focus:border-emerald-500/50"}`}
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
              <Input
                label="Tutar"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setFieldErrors({}); }}
                icon={<span className="text-xs font-medium text-text-muted">{accounts.find(a => a.id === accountId)?.currency || "TRY"}</span>}
                error={fieldErrors.amount}
              />
              {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 group" isLoading={isSubmitting}>
                <Landmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Havale Geldi Olarak İşaretle
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Kart ile Yatırma ───────────────────────────────────────────────────────
function CardDeposit({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch { setError("Hesaplar alınamadı."); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!accountId) { setFieldErrors({ accountId: "Lütfen hesap seçin" }); return; }
    if (!amount || parseFloat(amount) <= 0) { setFieldErrors({ amount: "Geçerli bir tutar girin" }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "card" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccessTxId(data.data?.id || "");
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        transactionId={successTxId}
        onBack={onBack}
        title="Kart ile Yatırma Başarılı!"
        message="Tutar hesabınıza tanımlandı."
        onNew={() => { setSuccess(false); setAmount(""); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Geri
      </button>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Banka/Kredi Kartı ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Kredi kartı veya banka kartınızla anında para yatırın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Yatırılacak Hesap</label>
              <select
                className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.accountId ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border bg-surface text-text-primary focus:ring-blue-500/30 focus:border-blue-500/50"}`}
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
            <Input
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setFieldErrors({}); }}
              required
              error={fieldErrors.amount}
            />
            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 group" isLoading={isSubmitting}>
              <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Para Yatır
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ATM ile Yatırma ────────────────────────────────────────────────────────
function AtmDeposit({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch { setError("Hesaplar alınamadı."); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!accountId) { setFieldErrors({ accountId: "Lütfen hesap seçin" }); return; }
    if (!amount || parseFloat(amount) <= 0) { setFieldErrors({ amount: "Geçerli bir tutar girin" }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "atm" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccessTxId(data.data?.id || "");
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        transactionId={successTxId}
        onBack={onBack}
        title="ATM ile Yatırma Başarılı!"
        message="Tutar hesabınıza tanımlandı."
        onNew={() => { setSuccess(false); setAmount(""); setSuccessTxId(""); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Geri
      </button>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">ATM'den MoneyShop Card ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Size özel barkod/kodu ATM'de okutarak veya MoneyShop Card ile para yatırın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Yatırılacak Hesap</label>
              <select
                className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.accountId ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border bg-surface text-text-primary focus:ring-amber-500/30 focus:border-amber-500/50"}`}
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
            <Input
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setFieldErrors({}); }}
              required
              error={fieldErrors.amount}
            />
            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-amber-500/20 group" isLoading={isSubmitting}>
              <Banknote className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Para Yatır
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Seçim Ekranı ───────────────────────────────────────────────────────────
function DepositSelection({ onSelect }: { onSelect: (id: string) => void }) {
  const router = useRouter();
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Page Header */}
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
        <h2 className="text-2xl font-bold text-text-primary">{t("deposit.title")}</h2>
        <p className="text-sm text-text-muted mt-1">{t("deposit.selectMethod")}</p>
      </div>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 gap-4">
        {depositOptions.map((option, idx) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="group relative text-left w-full animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`relative p-5 rounded-2xl bg-surface border-2 border-border ${option.borderHover} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}>
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative flex items-center gap-5">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-secondary transition-colors">{option.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{option.description}</p>
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {option.features.map((f, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-tertiary text-text-muted font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:border-secondary/30 group-hover:bg-secondary/5 transition-all duration-200">
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ana Controller ─────────────────────────────────────────────────────────
function DepositContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (id: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedOption(id);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedOption(null);
      setIsTransitioning(false);
    }, 150);
  };

  if (selectedOption === "iban") return <IbanDeposit onBack={handleBack} />;
  if (selectedOption === "card") return <CardDeposit onBack={handleBack} />;
  if (selectedOption === "atm") return <AtmDeposit onBack={handleBack} />;

  return <DepositSelection onSelect={handleSelect} />;
}

// ─── Page Export ────────────────────────────────────────────────────────────
export default function DepositPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <DepositContent />
      </ErrorBoundary>
    </div>
  );
}
