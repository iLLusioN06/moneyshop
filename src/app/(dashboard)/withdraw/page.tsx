"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Banknote, Landmark, QrCode, CreditCard, ArrowLeft,
  CheckCircle2, AlertCircle, X, ChevronRight, Sparkles,
  User, FileText,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";
import { formatCurrency } from "@/lib/utils";
import type { FinancialAccount } from "@/types";
import DekontActions from "@/components/dekont-actions";

// ─── Seçenek Konfigürasyonu ────────────────────────────────────────────────
const withdrawOptions = [
  {
    id: "iban",
    title: t("withdraw.iban"),
    description: "Hesabınızdaki parayı istediğiniz IBAN numarasına havale/EFT ile gönderin.",
    icon: Landmark,
    gradient: "from-red-500 to-rose-600",
    accent: "text-red-500",
    bgAccent: "bg-red-500/10",
    borderHover: "hover:border-red-500/30",
    features: ["1-3 iş günü", "Düşük ücret", "Yüksek limit"],
  },
  {
    id: "qr",
    title: t("withdraw.qr"),
    description: "ATM'lerde QR kod okutarak hesabınızdan para çekin.",
    icon: QrCode,
    gradient: "from-blue-500 to-indigo-600",
    accent: "text-blue-500",
    bgAccent: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/30",
    features: ["Anında", "7/24", "Ücretsiz"],
  },
  {
    id: "card",
    title: t("withdraw.card"),
    description: "MoneyShop Card ile anında nakit çekim işlemi yapın.",
    icon: CreditCard,
    gradient: "from-amber-500 to-orange-600",
    accent: "text-amber-500",
    bgAccent: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
    features: ["Anında", "ATM'lerde", "7/24"],
  },
];

// ─── Başarılı İşlem ─────────────────────────────────────────────────────────
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
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-profit/10 animate-ping opacity-25" style={{ animationDuration: '1.5s' }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-profit to-emerald-500 flex items-center justify-center shadow-lg shadow-profit/20 animate-[scale-in_0.3s_ease-out]">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2 animate-[slide-up_0.3s_ease-out]">{title}</h2>
        <p className="text-sm text-text-muted mb-8 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.1s' }}>{message}</p>

        {transactionId && (
          <div className="flex justify-center mb-6 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.15s' }}>
            <DekontActions transactionId={transactionId} />
          </div>
        )}

        <div className="flex gap-3 justify-center animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.2s' }}>
          <Button onClick={onNew} className="group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Yeni İşlem
          </Button>
          <Button variant="outline" onClick={onBack}>Ana Sayfa</Button>
        </div>
      </div>
    </div>
  );
}

// ─── IBAN ile Para Çek ──────────────────────────────────────────────────────
function IbanWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientIban, setRecipientIban] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [description, setDescription] = useState("");
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

  useEffect(() => {
    setTimeout(() => {
      fetchAccounts();
    }, 0);
  }, [fetchAccounts]);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!accountId) { setFieldErrors({ accountId: "Lütfen hesap seçin" }); return; }
    if (!amount || parseFloat(amount) <= 0) { setFieldErrors({ amount: "Geçerli bir tutar girin" }); return; }
    if (!recipientIban.trim()) { setFieldErrors({ recipientIban: "Lütfen IBAN girin" }); return; }
    if (!recipientName.trim()) { setFieldErrors({ recipientName: "Lütfen alıcı adını girin" }); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) { setFieldErrors({ amount: "Yetersiz bakiye" }); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId, amount: parseFloat(amount), method: "iban",
          recipientIban: recipientIban.trim(), recipientName: recipientName.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccessTxId(data.data?.id || "");
      setSuccess(true);
      setAmount(""); setRecipientIban(""); setRecipientName(""); setDescription("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        transactionId={successTxId}
        onBack={onBack}
        title="Para Çekme Başarılı!"
        message="IBAN havalesi gerçekleştirildi."
        onNew={() => { setSuccess(false); setSuccessTxId(""); setAmount(""); setRecipientIban(""); setRecipientName(""); setDescription(""); }}
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
        <CardHeader className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">IBAN ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Hesabınızdaki parayı istediğiniz IBAN numarasına gönderin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Çekilecek Hesap</label>
                <select
                  className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.accountId ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border bg-surface text-text-primary focus:ring-red-500/30 focus:border-red-500/50"}`}
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
            </div>

            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss animate-[fade-in_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Alıcı Bilgileri</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Alıcı Adı"
                  type="text"
                  placeholder="Ad Soyad"
                  value={recipientName}
                  onChange={(e) => { setRecipientName(e.target.value); setFieldErrors({}); }}
                  icon={<User className="w-4 h-4" />}
                  required
                  error={fieldErrors.recipientName}
                />
                <Input
                  label="IBAN"
                  type="text"
                  placeholder="TR12 0001 2345 6789 0001 2345 67"
                  value={recipientIban}
                  onChange={(e) => { setRecipientIban(e.target.value); setFieldErrors({}); }}
                  required
                  error={fieldErrors.recipientIban}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Açıklama (isteğe bağlı)"
                  type="text"
                  placeholder="Açıklama girin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>
            </div>

            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-500/20 group" isLoading={isSubmitting}>
              <Landmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Para Çek
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── QR ile Para Çek ────────────────────────────────────────────────────────
function QrWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    setTimeout(() => {
      fetchAccounts();
    }, 0);
  }, [fetchAccounts]);

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
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "qr" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        onBack={onBack}
        title="Para Çekme Başarılı!"
        message="QR kod ile nakit çekim işlemi gerçekleştirildi."
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
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">QR ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">ATM&apos;lerde QR kod okutarak hesabınızdan para çekin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Çekilecek Hesap</label>
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
            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss animate-[fade-in_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}
            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 group" isLoading={isSubmitting}>
              <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Para Çek
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Card ile Para Çek ──────────────────────────────────────────────────────
function CardWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    setTimeout(() => {
      fetchAccounts();
    }, 0);
  }, [fetchAccounts]);

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
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "card" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <SuccessView
        onBack={onBack}
        title="Para Çekme Başarılı!"
        message="MoneyShop Card ile nakit çekim işlemi gerçekleştirildi."
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
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">MoneyShop Card ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">MoneyShop Card ile anında nakit çekim işlemi yapın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Çekilecek Hesap</label>
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
            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss animate-[fade-in_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}
            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-amber-500/20 group" isLoading={isSubmitting}>
              <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Para Çek
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Seçim Ekranı ───────────────────────────────────────────────────────────
function WithdrawSelection({ onSelect }: { onSelect: (id: string) => void }) {
  const router = useRouter();
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-text-primary">{t("withdraw.title")}</h2>
        <p className="text-sm text-text-muted">{t("withdraw.selectMethod")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {withdrawOptions.map((option, idx) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="group relative text-left w-full animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`relative p-5 rounded-2xl bg-surface border-2 border-border ${option.borderHover} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-secondary transition-colors">{option.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{option.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {option.features.map((f, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-tertiary text-text-muted font-medium">{f}</span>
                      ))}
                    </div>
                  </div>

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
function WithdrawContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleBack = () => setSelectedOption(null);

  if (selectedOption === "iban") return <IbanWithdraw onBack={handleBack} />;
  if (selectedOption === "qr") return <QrWithdraw onBack={handleBack} />;
  if (selectedOption === "card") return <CardWithdraw onBack={handleBack} />;

  return <WithdrawSelection onSelect={setSelectedOption} />;
}

// ─── Page Export ────────────────────────────────────────────────────────────
export default function WithdrawPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <WithdrawContent />
      </ErrorBoundary>
    </div>
  );
}
