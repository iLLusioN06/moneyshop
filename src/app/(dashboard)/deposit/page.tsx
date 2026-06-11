"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  HandCoins, Landmark, CreditCard, Banknote, Copy, Check,
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, X, Loader2,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { FinancialAccount } from "@/types";

const depositOptions = [
  {
    id: "iban",
    title: t("deposit.iban"),
    description: "Kendi adınıza tanımlı IBAN numaranıza havale/EFT yaparak hesabınıza para yatırın.",
    icon: Landmark,
    color: "text-profit",
    bgColor: "bg-profit/10",
  },
  {
    id: "card",
    title: t("deposit.card"),
    description: "Kredi kartı veya banka kartınızla anında para yatırın.",
    icon: CreditCard,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "atm",
    title: t("deposit.atm"),
    description: "Size özel barkod/kodu ATM'de okutarak veya MoneyShop Card ile para yatırın.",
    icon: Banknote,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

function IbanDeposit({ onBack }: { onBack: () => void }) {
  const iban = "TR12 0001 2345 6789 0001 2345 67";
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "iban" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "İşlem başarısız."); setIsSubmitting(false); return; }
      setSuccess(true);
      setAmount("");
      fetchAccounts();
    } catch {
      setError("Bir hata oluştu.");
    } finally { setIsSubmitting(false); }
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
            <h2 className="text-xl font-bold text-text-primary mb-2">Para Yatırma Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">IBAN havalesi hesabınıza tanımlandı.</p>
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
            <div className="w-10 h-10 rounded-xl bg-profit/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-profit" />
            </div>
            <div>
              <CardTitle>Kendi IBAN'ın ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                Aşağıdaki IBAN numarasına havale/EFT yaparak hesabınıza para yatırabilirsiniz.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <p className="text-xs text-text-muted mb-2">{t("deposit.recipient")}</p>
            <p className="text-sm font-medium text-text-primary">Mustafa Yılmaz</p>
          </div>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <p className="text-xs text-text-muted mb-2">IBAN</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono font-medium text-text-primary tracking-wider">{iban}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Kopyalandı</> : <><Copy className="w-3.5 h-3.5" /> Kopyala</>}
              </button>
            </div>
          </div>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <p className="text-xs text-text-muted mb-1">{t("deposit.description")}</p>
            <p className="text-sm font-medium text-text-primary">
              Gönderilen tutarın doğru şekilde hesabınıza tanımlanması için açıklama kısmına MoneyShop kullanıcı kodunuzu yazmanız gerekmektedir.
            </p>
          </div>

          <div className="bg-warning/5 rounded-xl p-4 border border-warning/20">
            <p className="text-xs text-warning font-medium mb-1">⚠ Önemli Bilgi</p>
            <p className="text-xs text-text-muted">
              IBAN numarasına yapılan havalelerin hesabınıza yansıması 1-3 iş günü sürebilir.
              50.000 TL ve üzeri işlemlerde bankanızın günlük transfer limitini kontrol ediniz.
            </p>
          </div>

          {/* Simulate Deposit */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">IBAN Havalesini Simüle Et</h3>
            <form onSubmit={handleSimulateDeposit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Yatırılacak Hesap</label>
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
                icon={<span className="text-xs font-medium text-text-muted">{accounts.find(a => a.id === accountId)?.currency || "TRY"}</span>}
              />
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
              )}
              <Button type="submit" className="w-full bg-profit hover:bg-profit/90" isLoading={isSubmitting}>
                {isSubmitting ? "İşleniyor..." : "Havale Geldi Olarak İşaretle"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CardDeposit({ onBack }: { onBack: () => void }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
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
            <h2 className="text-xl font-bold text-text-primary mb-2">Kart ile Yatırma Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">Tutar hesabınıza tanımlandı.</p>
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
              <CreditCard className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <CardTitle>Banka/Kredi Kartı ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Kredi kartı veya banka kartınızla anında para yatırın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Yatırılacak Hesap</label>
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
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Para Yatır"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AtmDeposit({ onBack }: { onBack: () => void }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!accountId) { setError("Lütfen hesap seçin."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Geçerli bir tutar girin."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), method: "atm" }),
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
            <h2 className="text-xl font-bold text-text-primary mb-2">ATM ile Yatırma Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">Tutar hesabınıza tanımlandı.</p>
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
              <Banknote className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle>ATM'den MoneyShop Card ile Yatır</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Size özel barkod/kodu ATM'de okutarak veya MoneyShop Card ile para yatırın.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Yatırılacak Hesap</label>
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
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? "İşleniyor..." : "Para Yatır"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DepositSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-profit/10 flex items-center justify-center">
            <HandCoins className="w-5 h-5 text-profit" />
          </div>
          <div>
            <CardTitle>{t("deposit.title")}</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">
              {t("deposit.selectMethod")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {depositOptions.map((option) => {
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

function DepositContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const handleBack = () => setSelectedOption(null);

  if (selectedOption === "iban") return <IbanDeposit onBack={handleBack} />;
  if (selectedOption === "card") return <CardDeposit onBack={handleBack} />;
  if (selectedOption === "atm") return <AtmDeposit onBack={handleBack} />;

  return <DepositSelection onSelect={setSelectedOption} />;
}

export default function DepositPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <DepositContent />
      </ErrorBoundary>
    </div>
  );
}
