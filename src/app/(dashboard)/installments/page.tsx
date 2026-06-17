"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  Store,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/dashboard-i18n";

interface Installment {
  id: string;
  title: string;
  totalAmount: number;
  monthlyAmount: number;
  totalPayments: number;
  paidPayments: number;
  remainingAmount: number;
  progress: number;
  currency: string;
  nextPaymentDate: string;
  status: string;
  merchantName?: string;
  notes?: string;
  account: { id: string; name: string };
  category?: { id: string; name: string; color: string } | null;
}

interface Account {
  id: string;
  name: string;
  balance: number;
}

export default function InstallmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalPayments, setTotalPayments] = useState("");
  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [merchantName, setMerchantName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchInstallments = useCallback(async () => {
    try {
      const res = await fetch("/api/installments");
      const json = await res.json();
      if (json.success) setInstallments(json.data);
    } catch (err) {
      console.error("Failed to fetch installments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      if (json.success) setAccounts(json.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchInstallments();
      fetchAccounts();
    }, 0);
  }, [fetchInstallments, fetchAccounts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmount || !totalPayments || !accountId) return;

    setCreating(true);
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          totalAmount: parseFloat(totalAmount),
          totalPayments: parseInt(totalPayments),
          accountId,
          startDate,
          merchantName: merchantName || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        setTitle("");
        setTotalAmount("");
        setTotalPayments("");
        setMerchantName("");
        fetchInstallments();
      }
    } catch (err) {
      console.error("Failed to create installment", err);
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async (id: string) => {
    setPaying(id);
    try {
      const res = await fetch(`/api/installments/${id}`, {
        method: "POST",
      });

      const json = await res.json();
      if (json.success) {
        fetchInstallments();
      }
    } catch (err) {
      console.error("Failed to pay installment", err);
    } finally {
      setPaying(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu taksidi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/installments/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        fetchInstallments();
      }
    } catch (err) {
      console.error("Failed to delete installment", err);
    }
  };

  const activeInstallments = installments.filter((i) => i.status === "ACTIVE");
  const completedInstallments = installments.filter((i) => i.status === "COMPLETED");

  const totalRemaining = activeInstallments.reduce((sum, i) => sum + i.remainingAmount, 0);
  const totalMonthly = activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("installments.title")}</h1>
          <p className="text-sm text-text-muted mt-1">{t("installments.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("installments.new")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t("installments.active")}</p>
              <p className="text-xl font-bold text-text-primary">{activeInstallments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-surface border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-loss/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-loss" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t("installments.totalRemaining")}</p>
              <p className="text-xl font-bold text-text-primary">
                {totalRemaining.toLocaleString("tr-TR")} {installments[0]?.currency || "TRY"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-surface border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-profit/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-profit" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t("installments.monthlyTotal")}</p>
              <p className="text-xl font-bold text-text-primary">
                {totalMonthly.toLocaleString("tr-TR")} {installments[0]?.currency || "TRY"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md p-6 animate-[slide-up_0.3s_ease-out]">
            <h2 className="text-lg font-semibold text-text-primary mb-4">{t("installments.createTitle")}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("installments.titleLabel")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  placeholder={t("installments.titlePlaceholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("installments.totalAmount")}
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("installments.totalPayments")}
                  </label>
                  <input
                    type="number"
                    value={totalPayments}
                    onChange={(e) => setTotalPayments(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder="12"
                    min="2"
                    max="60"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("installments.account")}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  required
                >
                  <option value="">{t("installments.selectAccount")}</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("installments.startDate")}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("installments.merchantName")}
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder={t("installments.merchantPlaceholder")}
                  />
                </div>
              </div>

              {totalAmount && totalPayments && (
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <p className="text-sm text-text-muted">{t("installments.monthlyAmount")}</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {(parseFloat(totalAmount) / parseInt(totalPayments || "1")).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    TRY
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  {t("common.back")}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    t("installments.create")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Installments */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t("installments.activeInstallments")} ({activeInstallments.length})
        </h2>
        {activeInstallments.length === 0 ? (
          <div className="rounded-xl bg-surface border border-border p-8 text-center">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">{t("installments.noInstallments")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeInstallments.map((inst) => (
              <div
                key={inst.id}
                className="rounded-xl bg-surface border border-border p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{inst.title}</h3>
                    {inst.merchantName && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" />
                        {inst.merchantName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePay(inst.id)}
                      disabled={paying === inst.id}
                      className="p-1.5 rounded-lg hover:bg-profit/10 text-profit transition-colors disabled:opacity-50"
                      title={t("installments.pay")}
                    >
                      {paying === inst.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(inst.id)}
                      className="p-1.5 rounded-lg hover:bg-loss/10 text-loss transition-colors"
                      title={t("installments.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{t("installments.progress")}</span>
                    <span className="font-medium text-text-primary">
                      {inst.paidPayments}/{inst.totalPayments}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: `${inst.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>
                      {t("installments.monthly")}: {inst.monthlyAmount.toLocaleString("tr-TR")} {inst.currency}
                    </span>
                    <span>
                      {t("installments.remaining")}: {inst.remainingAmount.toLocaleString("tr-TR")} {inst.currency}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="w-3 h-3" />
                    {new Date(inst.nextPaymentDate).toLocaleDateString("tr-TR")}
                  </div>
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    {t("installments.nextPayment")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Installments */}
      {completedInstallments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t("installments.completedInstallments")} ({completedInstallments.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedInstallments.map((inst) => (
              <div
                key={inst.id}
                className="rounded-xl bg-surface border border-border p-4 opacity-75"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-profit" />
                  <h3 className="font-semibold text-text-primary truncate">{inst.title}</h3>
                </div>
                <p className="text-sm text-text-muted">
                  {inst.totalAmount.toLocaleString("tr-TR")} {inst.currency} — {inst.totalPayments} {t("installments.payments")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
