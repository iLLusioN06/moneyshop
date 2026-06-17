"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  EmptyState,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  ArrowLeft,
  Bolt,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Search,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinancialAccount, Transaction } from "@/types";

export default function FastTransferPage() {
  // Accounts
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Form
  const [senderAccountId, setSenderAccountId] = useState("");
  const [recipientIdentifier, setRecipientIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    message: string;
    recipientName?: string;
    amount: number;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Recent transfers
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setSenderAccountId(data.data[0].id);
      }
    } catch {
      setError("Hesaplar alınamadı.");
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  // Fetch recent FAST transfers
  const fetchRecentTransfers = useCallback(async () => {
    try {
      const res = await fetch("/api/transfers?type=fast&limit=5");
      const data = await res.json();
      if (data.success) setRecentTransfers(data.data);
    } catch {
      // Silently fail
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchAccounts();
      fetchRecentTransfers();
    }, 0);
  }, [fetchAccounts, fetchRecentTransfers]);

  const selectedAccount = accounts.find((a) => a.id === senderAccountId);

  // Open confirmation
  const handlePrepareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!senderAccountId) {
      setError("Lütfen gönderen hesabı seçin.");
      return;
    }
    if (!recipientIdentifier.trim()) {
      setError("Lütfen alıcı e-posta veya kullanıcı adını girin.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Lütfen geçerli bir tutar girin.");
      return;
    }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) {
      setError("Yetersiz bakiye.");
      return;
    }

    setShowConfirm(true);
  };

  // Execute transfer
  const handleConfirmTransfer = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "fast",
          senderAccountId,
          amount: parseFloat(amount),
          recipientIdentifier: recipientIdentifier.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Transfer gerçekleştirilemedi.");
        setIsSubmitting(false);
        return;
      }

      setSuccess({
        message: data.message,
        recipientName: data.data?.recipientName,
        amount: parseFloat(amount),
      });
      setShowConfirm(false);

      // Reset form
      setAmount("");
      setRecipientIdentifier("");
      setDescription("");

      // Refresh accounts (balance changed) and recent transfers
      fetchAccounts();
      fetchRecentTransfers();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => {
    setSuccess(null);
  };

  // Confirmation modal
  if (showConfirm) {
    return (
      <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Transferi Onayla
            </h1>
          </div>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-text-muted mb-1">
                Gönderilecek Tutar
              </p>
              <p className="text-4xl font-bold text-text-primary">
                {formatCurrency(parseFloat(amount), selectedAccount?.currency)}
              </p>
            </div>

            <div className="border-t border-border" />

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Alıcı</span>
                <span className="font-medium text-text-primary">
                  {recipientIdentifier}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Gönderen Hesap</span>
                <span className="font-medium text-text-primary">
                  {selectedAccount?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Kalan Bakiye</span>
                <span className="font-medium text-text-primary">
                  {selectedAccount && formatCurrency(selectedAccount.balance - parseFloat(amount), selectedAccount.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Komisyon</span>
                <span className="font-medium text-emerald-500">Ücretsiz</span>
              </div>
              {description && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Açıklama</span>
                  <span className="font-medium text-text-primary">{description}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                isLoading={isSubmitting}
                onClick={handleConfirmTransfer}
              >
                {isSubmitting ? (
                  <>Gönderiliyor...</>
                ) : (
                  <>
                    <Bolt className="w-4 h-4 mr-2" />
                    FAST Gönder
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-profit" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Transfer Başarılı!
            </h2>
            <p className="text-3xl font-bold text-profit mb-2">
              {formatCurrency(success.amount)}
            </p>
            {success.recipientName && (
              <p className="text-sm text-text-muted mb-6">
                {success.recipientName} adlı kullanıcıya gönderildi
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={resetSuccess}>
                <Bolt className="w-4 h-4 mr-2" />
                Yeni Transfer
              </Button>
              <Link href="/dashboard/transactions">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  İşlemlere Git
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/transfers"
          className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <Bolt className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              FAST Para Transferi
            </h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            7/24 anında para transferi — saniyeler içinde gönderin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePrepareSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Yeni FAST Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sender Account */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Gönderen Hesap
                  </label>
                  {accountsLoading ? (
                    <div className="h-10 bg-surface-tertiary rounded-lg animate-pulse" />
                  ) : accounts.length === 0 ? (
                    <div className="text-sm text-loss p-2">
                      Henüz hesabınız yok. Lütfen önce bir hesap oluşturun.
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      value={senderAccountId}
                      onChange={(e) => setSenderAccountId(e.target.value)}
                      required
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({formatCurrency(a.balance, a.currency)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Alıcı E-posta veya Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      placeholder="ornek@email.com veya kullaniciadi"
                      value={recipientIdentifier}
                      onChange={(e) => setRecipientIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    MoneyShop kullanıcısının e-posta adresi veya kullanıcı adı
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Tutar
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    {selectedAccount && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        {selectedAccount.currency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Açıklama <span className="text-text-muted font-normal">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="Açıklama girin..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {selectedAccount && parseFloat(amount || "0") > selectedAccount.balance && (
                  <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Yetersiz bakiye. Mevcut bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={accounts.length === 0}
                >
                  <Bolt className="w-4 h-4 mr-2" />
                  Devam Et
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Limitler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Minimum</span>
                <span className="font-medium">1 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Maksimum</span>
                <span className="font-medium">50.000 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Komisyon</span>
                <span className="font-medium text-emerald-500">Ücretsiz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">İşlem Süresi</span>
                <span className="font-medium text-emerald-500">Anında</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Transferler</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-surface-tertiary rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentTransfers.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Henüz transfer yok"
                  gradient="from-secondary to-indigo-600"
                />
              ) : (
                <div className="space-y-2">
                  {recentTransfers.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {tx.recipientName || "Transfer"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDate(new Date(tx.date), "relative")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-loss whitespace-nowrap ml-2">
                        -{formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
