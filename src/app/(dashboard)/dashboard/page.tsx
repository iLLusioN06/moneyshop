"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  StatCard,
  MonthlyChart,
  RecentTransactions,
  AccountsOverview,
} from "@/components/dashboard";
import { useDashboard } from "@/hooks";
import { useAccounts } from "@/hooks";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  AlertCircle,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import type { FinancialAccount } from "@/types";
import { t } from "@/lib/dashboard-i18n";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: dashData, isLoading, error, refetch } = useDashboard();
  const { data: accounts } = useAccounts();

  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        setIsVerified(!!data.data?.emailVerified);
      })
      .catch(() => {})
      .finally(() => setIsCheckingVerification(false));
  }, [session?.user?.id]);

  const stats = dashData
    ? [
        {
          title: t("dash.totalBalance"),
          value: dashData.totalBalance,
          change: dashData.balanceChange,
          currency: dashData.currency,
          icon: Wallet,
          color: "text-secondary",
          bgColor: "bg-secondary/10",
        },
        {
          title: t("dash.totalIncome"),
          value: dashData.totalIncome,
          change: dashData.incomeChange,
          currency: dashData.currency,
          icon: TrendingUp,
          color: "text-profit",
          bgColor: "bg-profit/10",
        },
        {
          title: t("dash.totalExpense"),
          value: dashData.totalExpense,
          change: -dashData.expenseChange,
          currency: dashData.currency,
          icon: TrendingDown,
          color: "text-loss",
          bgColor: "bg-loss/10",
        },
        {
          title: t("dash.netWorth"),
          value: dashData.netWorth,
          change: dashData.balanceChange,
          currency: dashData.currency,
          icon: PiggyBank,
          color: "text-accent",
          bgColor: "bg-accent/10",
        },
      ]
    : [];

  const monthlyData = dashData?.monthlyData || [];
  const recentTransactions = dashData?.recentTransactions || [];
  const safeAccounts = (accounts || []) as FinancialAccount[];

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {t("dash.welcome")}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {t("dash.subtitle")}
            </p>
          </div>
          <Button onClick={() => router.push("/transactions")}>
            <Plus className="w-4 h-4" />
            {t("dash.newTransaction")}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => refetch()} className="ml-auto">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-surface border border-border p-4 space-y-3 animate-pulse"
              >
                <div className="h-3 w-24 bg-surface-tertiary rounded" />
                <div className="h-8 w-32 bg-surface-tertiary rounded" />
                <div className="h-3 w-20 bg-surface-tertiary rounded" />
              </div>
            ))}
          </div>
        ) : dashData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Charts & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MonthlyChart data={monthlyData} />
              <RecentTransactions transactions={recentTransactions} />
            </div>

            {/* Accounts Overview */}
            {safeAccounts.length > 0 && (
              <AccountsOverview accounts={safeAccounts} />
            )}

            {/* Verification Status */}
            {!isCheckingVerification && (
              <div className="flex justify-center">
                <div
                  className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border ${
                    isVerified
                      ? "border-profit/20 bg-profit/5"
                      : "border-loss/20 bg-loss/5"
                  }`}
                >
                  {isVerified ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-profit/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-profit" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-profit">
                          {t("dash.verifiedAccount")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-loss/10 flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-loss" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-loss">
                          {t("dash.unverifiedAccount")}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {t("dash.verifyPrompt")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
