"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  StatCard,
  MonthlyChart,
  RecentTransactions,
  CurrencyMarquee,
} from "@/components/dashboard";
import { CURRENCIES } from "@/lib/constants";
import { useDashboard } from "@/hooks";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWebSocketContext } from "@/components/websocket-provider";
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
  Globe,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

const BASE_CURRENCIES = CURRENCIES.map((c) => c.value);

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [baseCurrency, setBaseCurrency] = useState("TRY");
  const { data: dashData, isLoading, error, refetch } = useDashboard(baseCurrency);
  const { connected: wsConnected, eventVersion } = useWebSocketContext();

  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  // WebSocket olayı geldiğinde dashboard verilerini tazele
  useEffect(() => {
    if (eventVersion > 0) {
      refetch();
    }
  }, [eventVersion, refetch]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        setIsVerified(!!data.data?.emailVerified);
      })
      .catch(() => {})
      .finally(() => setIsCheckingVerification(false));
  }, [session?.user?.id, session?.user?.role, router]);

  const handleBaseCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBaseCurrency(e.target.value);
    },
    []
  );

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
          <div className="flex items-center gap-3">
            {/* WebSocket Bağlantı Göstergesi */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-surface/50"
              title={wsConnected ? "Gerçek zamanlı bağlantı aktif" : "Bağlantı kurulamadı"}>
              {wsConnected ? (
                <Wifi className="w-3 h-3 text-profit" />
              ) : (
                <WifiOff className="w-3 h-3 text-text-muted" />
              )}
              <span className={wsConnected ? "text-profit" : "text-text-muted"}>
                {wsConnected ? "CANLI" : "BAĞLI DEĞİL"}
              </span>
            </div>
            {/* Base Currency Selector */}
            <div className="relative">
              <select
                value={baseCurrency}
                onChange={handleBaseCurrencyChange}
                className="appearance-none flex items-center gap-2 h-10 pl-9 pr-8 rounded-lg border border-border bg-surface text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all duration-200 cursor-pointer"
              >
                {BASE_CURRENCIES.map((cur) => {
                  const c = CURRENCIES.find((c) => c.value === cur);
                  return (
                    <option key={cur} value={cur}>
                      {c?.symbol || cur} {cur}
                    </option>
                  );
                })}
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
            <Button onClick={() => router.push("/transactions")} className="group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              {t("dash.newTransaction")}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
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
                className="rounded-xl bg-surface border border-border p-4 space-y-3 overflow-hidden relative"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <div className="h-3 w-24 bg-surface-tertiary rounded" />
                  <div className="h-8 w-32 bg-surface-tertiary rounded mt-3" />
                  <div className="h-3 w-20 bg-surface-tertiary rounded mt-2" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface/50 to-transparent bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        ) : dashData ? (
          <>
            {/* Stats Cards - Staggered Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={stat.title}
                  className="animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <StatCard {...stat} />
                </div>
              ))}
            </div>

            {/* Charts & Transactions - Staggered Entry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.35s' }}>
                <MonthlyChart data={monthlyData} />
              </div>
              <div className="animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.45s' }}>
                <RecentTransactions transactions={recentTransactions} />
              </div>
            </div>

            {/* Verification Status */}
            {!isCheckingVerification && (
              <div className="flex justify-center animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.65s' }}>
                <div
                  className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    isVerified
                      ? "border-profit/20 bg-profit/5 hover:border-profit/40"
                      : "border-loss/20 bg-loss/5 hover:border-loss/40"
                  }`}
                >
                  {isVerified ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-profit/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                      <div className="w-8 h-8 rounded-full bg-loss/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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

            {/* Currency Ticker */}
            <div className="animate-[slide-up_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.75s' }}>
              <CurrencyMarquee />
            </div>
          </>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
