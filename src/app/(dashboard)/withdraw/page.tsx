"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Banknote, Landmark, QrCode, CreditCard, ArrowLeft,
  CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { FinancialAccount } from "@/types";

const withdrawOptions = [
  {
    id: "iban",
    title: t("withdraw.iban"),
    description: "Hesabınızdaki parayı istediğiniz IBAN numarasına havale/EFT ile gönderin.",
    icon: Landmark,
    color: "text-loss",
    bgColor: "bg-loss/10",
  },
  {
    id: "qr",
    title: t("withdraw.qr"),
    description: "ATM'lerde QR kod okutarak hesabınızdan para çekin.",
    icon: QrCode,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "card",
    title: t("withdraw.card"),
    description: "MoneyShop Card ile anında nakit çekim işlemi yapın.",
    icon: CreditCard,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

function IbanWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientIban, setRecipientIban] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch {
      setError("Hesaplar alınamadı.");
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }
    if (!recipientIban.trim()) { setError("Lütfen IBAN girin."); return; }
    if (!recipientName.trim()) { setError("Lütfen alıcı adını girin."); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) { setError("Yetersiz bakiye."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(amount),
          method: "iban",
          recipientIban: recipientIban.trim(),
          recipientName: recipientName.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccess(true);
      setAmount(""); setRecipientIban(""); setRecipientName(""); setDescription("");
      fetchAccounts();
    } catch { setError("Bir hata oluştu."); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-profit" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Para Çekme Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">IBAN havalesi gerçekleştirildi.</p>
            <Button onClick={() => setSuccess(false)}>Yeni İşlem</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Geri
      </button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-loss" />
            </div>
            <div>
              <CardTitle>IBAN ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Hesabınızdaki parayı istediğiniz IBAN numarasına gönderin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Çekilecek Hesap</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, a.currency)})</option>
                ))}
              </select>
            </div>
            <Input
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}
            <Input
              label="Alıcı Adı"
              type="text"
              placeholder="Ad Soyad"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
            <Input
              label="IBAN"
              type="text"
              placeholder="TR12 0001 2345 6789 0001 2345 67"
              value={recipientIban}
              onChange={(e) => setRecipientIban(e.target.value)}
              required
            />
            <Input
              label="Açıklama (isteğe bağlı)"
              type="text"
              placeholder="Açıklama girin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-loss hover:bg-loss/90" isLoading={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Para Çek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function QrWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch {
      setError("Hesaplar alınamadı.");
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) { setError("Yetersiz bakiye."); return; }

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
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-profit" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Para Çekme Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">QR kod ile nakit çekim işlemi gerçekleştirildi.</p>
            <Button onClick={() => setSuccess(false)}>Yeni İşlem</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Geri
      </button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <CardTitle>QR ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">ATM'lerde QR kod okutarak hesabınızdan para çekin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Çekilecek Hesap</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, a.currency)})</option>
                ))}
              </select>
            </div>
            <Input
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-loss hover:bg-loss/90" isLoading={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Para Çek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CardWithdraw({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch {
      setError("Hesaplar alınamadı.");
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) { setError("Yetersiz bakiye."); return; }

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
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-profit" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Para Çekme Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">MoneyShop Card ile nakit çekim işlemi gerçekleştirildi.</p>
            <Button onClick={() => setSuccess(false)}>Yeni İşlem</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Geri
      </button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle>MoneyShop Card ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">MoneyShop Card ile anında nakit çekim işlemi yapın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Çekilecek Hesap</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, a.currency)})</option>
                ))}
              </select>
            </div>
            <Input
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full bg-loss hover:bg-loss/90" isLoading={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Para Çek"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function WithdrawSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-loss" />
          </div>
          <div>
            <CardTitle>{t("withdraw.title")}</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">
              {t("withdraw.selectMethod")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {withdrawOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border hover:border-secondary/30 hover:bg-surface-secondary/80 transition-all duration-200 text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary">{option.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{option.description}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function WithdrawContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const handleBack = () => setSelectedOption(null);

  if (selectedOption === "iban") return <IbanWithdraw onBack={handleBack} />;
  if (selectedOption === "qr") return <QrWithdraw onBack={handleBack} />;
  if (selectedOption === "card") return <CardWithdraw onBack={handleBack} />;

  return <WithdrawSelection onSelect={setSelectedOption} />;
}

export default function WithdrawPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <WithdrawContent />
      </ErrorBoundary>
    </div>
  );
}
