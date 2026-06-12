"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Shield, AlertCircle, RefreshCw, Lock, Unlock, XCircle, ArrowUpDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { t } from "@/lib/dashboard-i18n";
import type { Card, CardTransaction } from "@/types";

const cardGradients: Record<string, string> = {
  STANDARD: "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
  SILVER: "linear-gradient(135deg, #4a4a5a 0%, #6e6e82 50%, #8e8ea8 100%)",
  GOLD: "linear-gradient(135deg, #8a6d1f 0%, #c9a84c 50%, #f7e08a 100%)",
};

const cardTypeColors: Record<string, string> = {
  STANDARD: "text-blue-400",
  SILVER: "text-gray-400",
  GOLD: "text-yellow-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "text-profit bg-profit/10",
  BLOCKED: "text-loss bg-loss/10",
  CANCELLED: "text-text-muted bg-surface-tertiary",
  PENDING: "text-pending bg-pending/10",
};

const statusIcons: Record<string, React.ElementType> = {
  ACTIVE: Shield,
  BLOCKED: Lock,
  CANCELLED: XCircle,
  PENDING: AlertCircle,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

function getCardTypeLabel(cardType: string): string {
  const key = `card.${cardType.toLowerCase()}`;
  const label = t(key);
  return label !== key ? label : cardType;
}

function getStatusLabel(status: string): string {
  const key = `card.${status.toLowerCase()}`;
  const label = t(key);
  return label !== key ? label : status;
}

export default function MyCardPage() {
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cards");
      const json = await res.json();
      if (json.success) {
        setCard(json.data);
      } else {
        setError(json.error || "Kart bilgileri alınamadı.");
      }
    } catch {
      setError("Kart bilgileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  const handleCardAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setCard(json.data);
      } else {
        setError(json.error);
      }
    } catch {
      setError("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (cardType: string) => {
    setActionLoading("upgrade");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardType }),
      });
      const json = await res.json();
      if (json.success) {
        setCard(json.data);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Kart yükseltme sırasında bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const gradient = card ? cardGradients[card.cardType] || cardGradients.STANDARD : cardGradients.STANDARD;
  const StatusIcon = card ? statusIcons[card.status] || Shield : Shield;
  const statusColor = card ? statusColors[card.status] || statusColors.ACTIVE : statusColors.ACTIVE;

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-48 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-4 w-64 bg-surface-tertiary rounded mt-2 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-48 rounded-xl bg-surface-tertiary animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-surface-tertiary animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{t("card.title")}</h2>
            <p className="text-sm text-text-muted mt-1">{t("card.subtitle")}</p>
          </div>
          {card?.status === "ACTIVE" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCardAction("block")}
                disabled={actionLoading === "block"}
              >
                <Lock className="w-4 h-4" />
                {actionLoading === "block" ? t("common.loading") : t("card.blockCard")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCardAction("cancel")}
                disabled={actionLoading === "cancel"}
                className="text-loss border-loss/30 hover:bg-loss/10"
              >
                <XCircle className="w-4 h-4" />
                {actionLoading === "cancel" ? t("common.loading") : t("card.cancelCard")}
              </Button>
            </div>
          )}
          {card?.status === "BLOCKED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCardAction("unblock")}
              disabled={actionLoading === "unblock"}
            >
              <Unlock className="w-4 h-4" />
              {actionLoading === "unblock" ? t("common.loading") : t("card.unblockCard")}
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {card ? (
          <>
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card Visual + Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card Front */}
                <div
                  className="relative rounded-2xl p-6 text-white overflow-hidden shadow-xl"
                  style={{ background: gradient }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  {/* Chip & Type */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-7 bg-yellow-300/80 rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {getCardTypeLabel(card.cardType)}
                    </span>
                  </div>

                  {/* Card Number */}
                  <div className="mb-6">
                    <p className="text-lg md:text-xl tracking-[6px] font-mono font-medium">
                      {card.cardNumber}
                    </p>
                  </div>

                  {/* Card Details */}
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider opacity-60">{t("card.cardHolder")}</p>
                      <p className="text-sm font-medium">{card.cardHolderName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider opacity-60">{t("card.expiryDate")}</p>
                      <p className="text-sm font-medium">
                        {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider opacity-60">{t("card.cvv")}</p>
                      <p className="text-sm font-medium">{card.cvv}</p>
                    </div>
                  </div>
                </div>

                {/* Card Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Daily Limit */}
                  <div className="rounded-xl bg-surface border border-border overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-4 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.dailyLimit")}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-text-muted">{t("card.dailyLimit")}</span>
                        <span className="text-xs text-text-muted">
                          {t("card.remaining")}: {formatCurrency(card.dailyLimit - card.currentDailySpent)} IQD
                        </span>
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-lg font-bold text-text-primary">
                          {formatCurrency(card.dailyLimit)} <span className="text-sm font-normal text-text-muted">IQD</span>
                        </span>
                        <span className="text-sm text-text-muted">
                          {t("card.dailySpent")}: {formatCurrency(card.currentDailySpent)} IQD
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{
                            width: `${Math.min((card.currentDailySpent / card.dailyLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Limit */}
                  <div className="rounded-xl bg-surface border border-border overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-4 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.monthlyLimit")}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-text-muted">{t("card.monthlyLimit")}</span>
                        <span className="text-xs text-text-muted">
                          {t("card.remaining")}: {formatCurrency(card.monthlyLimit - card.currentMonthlySpent)} IQD
                        </span>
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-lg font-bold text-text-primary">
                          {formatCurrency(card.monthlyLimit)} <span className="text-sm font-normal text-text-muted">IQD</span>
                        </span>
                        <span className="text-sm text-text-muted">
                          {t("card.monthlySpent")}: {formatCurrency(card.currentMonthlySpent)} IQD
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{
                            width: `${Math.min((card.currentMonthlySpent / card.monthlyLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Card Info + Upgrade */}
              <div className="space-y-4">
                {/* Status */}
                <div className={`rounded-xl border overflow-hidden ${card.status === "ACTIVE" ? "border-profit/20 bg-profit/5" : card.status === "BLOCKED" ? "border-loss/20 bg-loss/5" : "border-border bg-surface"}`}>
                  <div className="bg-gradient-to-r from-current/5 via-current/5 to-transparent px-4 py-2 border-b border-current/10">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{t("card.status")}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColor}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">{t("card.status")}</p>
                        <p className="font-semibold text-text-primary">{getStatusLabel(card.status)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Type */}
                <div className="rounded-xl bg-surface border border-border overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.cardType")}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-text-muted mb-1">{t("card.cardType")}</p>
                    <p className={`text-lg font-bold ${cardTypeColors[card.cardType] || "text-text-primary"}`}>
                      {getCardTypeLabel(card.cardType)}
                    </p>
                  </div>
                </div>

                {/* Balance */}
                <div className="rounded-xl bg-surface border border-border overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.balance")}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">{t("card.balance")}</p>
                        <p className="text-lg font-bold text-text-primary">
                          {formatCurrency(card.balance)} <span className="text-sm font-normal text-text-muted">IQD</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="rounded-xl bg-surface border border-border overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.issueDate")}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-text-muted">{t("card.issueDate")}</p>
                    <p className="font-semibold text-text-primary">{formatDate(card.issuedAt)}</p>
                  </div>
                </div>

                {/* Upgrade Option */}
                {card.cardType !== "GOLD" && card.status === "ACTIVE" && (
                  <div className="rounded-xl bg-surface border border-border overflow-hidden">
                    <div className="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent px-4 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t("card.upgrade")}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-text-primary mb-1">{t("card.upgrade")}</p>
                      <p className="text-xs text-text-muted mb-3">{t("card.upgradeDesc")}</p>
                      <div className="space-y-2">
                        {card.cardType === "STANDARD" && (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => handleUpgrade("SILVER")}
                            disabled={actionLoading === "upgrade"}
                          >
                            {actionLoading === "upgrade" ? t("common.loading") : `${t("card.silver")} → 50,000 IQD/gün`}
                          </Button>
                        )}
                        {(card.cardType === "STANDARD" || card.cardType === "SILVER") && (
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpgrade("GOLD")}
                            disabled={actionLoading === "upgrade"}
                          >
                            {actionLoading === "upgrade" ? t("common.loading") : `${t("card.gold")} → 250,000 IQD/gün`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-text-muted" />
                {t("card.recentTransactions")}
              </h3>
              {card.transactions && card.transactions.length > 0 ? (
                <div className="rounded-xl bg-surface border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {(card.transactions as CardTransaction[]).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-surface-tertiary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            tx.type === "INCOME" ? "bg-profit/10" : "bg-loss/10"
                          }`}>
                            <ArrowUpDown className={`w-4 h-4 ${
                              tx.type === "INCOME" ? "text-profit" : "text-loss"
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{tx.description || "-"}</p>
                            <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            (tx.type === "INCOME") ? "text-profit" : "text-loss"
                          }`}>
                            {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)} IQD
                          </p>
                          <p className="text-xs text-text-muted">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-surface border border-border p-8 text-center">
                  <CreditCard className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-muted">{t("card.noTransactions")}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-surface border border-border p-8 text-center">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">{t("common.noResults")}</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
