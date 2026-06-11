"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Receipt, ArrowLeft, CheckCircle2, AlertCircle, X,
  Zap, Droplets, Flame, Wifi, Phone, Shield, Repeat, CreditCard,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { FinancialAccount, Transaction } from "@/types";

const billTypes = [
  { id: "electric", label: "Elektrik", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "water", label: "Su", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "gas", label: "Doğalgaz", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "internet", label: "İnternet", icon: Wifi, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "phone", label: "Telefon", icon: Phone, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "insurance", label: "Sigorta", icon: Shield, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "subscription", label: "Abonelik", icon: Repeat, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "other", label: "Diğer", icon: Receipt, color: "text-gray-500", bg: "bg-gray-500/10" },
];

function PaymentForm({
  billType,
  billLabel,
  billIcon: Icon,
  billColor,
  onBack,
}: {
  billType: string;
  billLabel: string;
  billIcon: React.ElementType;
  billColor: string;
  onBack: () => void;
}) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
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
    } catch { setError("Hesaplar alınamadı."); }
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
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(amount),
          billType,
          referenceNumber: referenceNumber.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Ödeme başarısız."); setIsSubmitting(false); return; }
      setSuccess(true);
      setAmount(""); setReferenceNumber("");
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
            <h2 className="text-xl font-bold text-text-primary mb-2">Ödeme Başarılı!</h2>
            <p className="text-sm text-text-muted mb-6">{billLabel} ödendi.</p>
            <Button onClick={() => setSuccess(false)}>Yeni Ödeme</Button>
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
            <div className={`w-10 h-10 rounded-xl ${billColor.replace("text-", "bg-")}/10 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${billColor}`} />
            </div>
            <div>
              <CardTitle>{billLabel} Ödemesi</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">Fatura ödemenizi gerçekleştirin.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Ödeme Hesabı</label>
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
              label="Abone/Referans No (isteğe bağlı)"
              type="text"
              placeholder="Müşteri numarası veya referans kodu"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? "Ödeniyor..." : `${billLabel} Öde`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <CardTitle>Ödemeler</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">
              Fatura ve ödeme işlemlerinizi gerçekleştirin
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {billTypes.map((bt) => {
            const Icon = bt.icon;
            return (
              <button
                key={bt.id}
                onClick={() => onSelect(bt.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-secondary border border-border hover:border-secondary/30 hover:bg-surface-secondary/80 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${bt.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${bt.color}`} />
                </div>
                <span className="text-sm font-medium text-text-primary">{bt.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentsContent() {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [recentPayments, setRecentPayments] = useState<Transaction[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const fetchRecentPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?limit=5");
      const data = await res.json();
      if (data.success) {
        // Filter to expense-type payments only
        setRecentPayments(data.data.filter((t: Transaction) => t.type === "EXPENSE"));
      }
    } catch { /* ignore */ }
    finally { setPaymentsLoading(false); }
  }, []);

  useEffect(() => { fetchRecentPayments(); }, [fetchRecentPayments]);

  const handleBack = () => setSelectedBill(null);

  if (selectedBill) {
    const bill = billTypes.find((b) => b.id === selectedBill);
    if (bill) {
      return (
        <PaymentForm
          billType={bill.id}
          billLabel={bill.label}
          billIcon={bill.icon}
          billColor={bill.color}
          onBack={handleBack}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <PaymentSelection onSelect={setSelectedBill} />

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Son Ödemeler</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-text-muted">
              <Clock className="w-8 h-8 mb-2" />
              <p className="text-sm">Henüz ödeme yapılmamış</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {tx.description || "Ödeme"}
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
  );
}

export default function PaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <PaymentsContent />
      </ErrorBoundary>
    </div>
  );
}
