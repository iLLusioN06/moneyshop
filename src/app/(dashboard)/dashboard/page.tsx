"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardSkeleton,
  Badge,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useDashboard } from "@/hooks";
import { useAccounts } from "@/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Plus,
  AlertCircle,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { FinancialAccount } from "@/types";
import { t, tWithVars } from "@/lib/dashboard-i18n";

function StatCard({
  title,
  value,
  change,
  currency,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  change: number;
  currency: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(value, currency)}
          </p>
          {change !== 0 && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-profit" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-profit" : "text-loss"}`}>
                %{Math.abs(change).toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">{t("dash.vsLastMonth")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: dashData, isLoading: dashLoading, error: dashError, refetch: refetchDash } = useDashboard();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

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

  const isLoading = dashLoading;
  const error = dashError;

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

  const maxChartVal =
    monthlyData.length > 0
      ? Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)))
      : 1;

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t("dash.welcome")}</h2>
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
          <button onClick={() => refetchDash()} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
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
            {/* Monthly Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("dash.monthlyChart")}</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      {t("dash.chartSubtitle")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-text-muted">
                    {t("dash.noData")}
                  </div>
                ) : (
                  <>
                    <div className="h-64 flex items-end gap-2">
                      {monthlyData.map((data) => {
                        const incomeHeight = (data.income / maxChartVal) * 100;
                        const expenseHeight = (data.expense / maxChartVal) * 100;

                        return (
                          <div
                            key={data.month}
                            className="flex-1 flex flex-col items-center gap-1 group"
                          >
                            <div className="w-full flex flex-col items-center gap-0.5 relative h-56 justify-end">
                              {/* Tooltip */}
                              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                                {tWithVars("dash.incomeExpense", { income: formatCurrency(data.income), expense: formatCurrency(data.expense) })}
                              </div>
                              {/* Income Bar */}
                              <div
                                className="w-full max-w-[40px] rounded-t-md bg-profit/80 hover:bg-profit transition-all duration-200 cursor-pointer"
                                style={{ height: `${incomeHeight}%` }}
                              />
                              {/* Expense Bar */}
                              <div
                                className="w-full max-w-[40px] rounded-t-md bg-loss/80 hover:bg-loss transition-all duration-200 cursor-pointer"
                                style={{ height: `${expenseHeight}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted font-medium">{data.month}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-profit" />
                        <span className="text-sm text-text-secondary">{t("dash.income")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-loss" />
                        <span className="text-sm text-text-secondary">{t("dash.expense")}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("dash.recentTransactions")}</CardTitle>
                  <button
                    onClick={() => router.push("/transactions")}
                    className="text-sm text-secondary hover:text-secondary-dark transition-colors flex items-center gap-1"
                  >
                    {t("dash.viewAll")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-text-muted">
                    {t("dash.noTransactions")}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              tx.type === "INCOME" ? "bg-profit/10" : "bg-loss/10"
                            }`}
                          >
                            {tx.type === "INCOME" ? (
                              <ArrowUpRight className="w-4 h-4 text-profit" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-loss" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-text-muted">
                                {tx.category?.name || t("dash.noCategory")}
                              </span>
                              <span className="text-xs text-text-muted">·</span>
                              <span className="text-xs text-text-muted">
                                {formatDate(new Date(tx.date), "relative")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p
                            className={`text-sm font-semibold ${
                              tx.type === "INCOME" ? "text-profit" : "text-loss"
                            }`}
                          >
                            {tx.type === "INCOME" ? "+" : "-"}
                            {formatCurrency(Math.abs(tx.amount))}
                          </p>
                          <Badge
                            variant={tx.status === "COMPLETED" ? "success" : "warning"}
                          >
                            {tx.status === "COMPLETED" ? t("dash.completed") : t("dash.pending")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Accounts Overview */}
          {safeAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("dash.accounts")}</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      {t("dash.accountsSubtitle")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/accounts")}>
                    <Plus className="w-4 h-4" />
                    {t("dash.addAccount")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-secondary/30 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: account.color || "#3b82f6" }}
                        >
                          {account.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{account.name}</p>
                          <p className="text-xs text-text-muted">
                            {account.type === "CREDIT_CARD" ? t("dash.debt") : t("dash.balance")}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          account.balance >= 0 ? "text-text-primary" : "text-loss"
                        }`}
                      >
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                      <p className="text-sm font-semibold text-profit">{t("dash.verifiedAccount")}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-loss/10 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-loss" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-loss">{t("dash.unverifiedAccount")}</p>
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
