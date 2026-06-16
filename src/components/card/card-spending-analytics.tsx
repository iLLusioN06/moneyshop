"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  TrendingDown,
  Receipt,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { CardAnalytics } from "@/app/api/cards/analytics/route";

interface CardSpendingAnalyticsProps {
  /** Card ID to fetch analytics for */
  cardId?: string;
}

// ─── Stat Card ───────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}/10`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-lg font-bold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Category Pie Chart ─────────────────────────────────

function CategoryPieChart({ data }: { data: CardAnalytics["categoryBreakdown"] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-text-muted gap-2">
        <PieChartIcon className="w-8 h-8" />
        <p className="text-sm">Kategori verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.categoryName} fill={entry.categoryColor} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value) || 0, "IQD")}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 min-w-[160px]">
        {data.slice(0, 8).map((item) => (
          <div key={item.categoryName} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.categoryColor }}
              />
              <span className="text-xs text-text-secondary truncate max-w-[100px]">
                {item.categoryName}
              </span>
            </div>
            <span className="text-xs font-medium text-text-primary">
              %{item.percentage}
            </span>
          </div>
        ))}
        {data.length > 8 && (
          <p className="text-xs text-text-muted pt-1">+{data.length - 8} diğer</p>
        )}
      </div>
    </div>
  );
}

// ─── Monthly Bar Chart ───────────────────────────────────

function MonthlyBarChart({ data }: { data: CardAnalytics["monthlyTrend"] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-text-muted gap-2">
        <BarChart3 className="w-8 h-8" />
        <p className="text-sm">Aylık veri bulunamadı</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value) || 0, "IQD"),
            name === "income" ? "Gelir" : "Gider",
          ]}
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Legend
          formatter={(value: string) => (value === "income" ? "Gelir" : "Gider")}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
        <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Daily Spending Chart ────────────────────────────────

function DailySpendingChart({ data }: { data: CardAnalytics["dailySpending"] }) {
  if (data.length === 0) {
    return null;
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="h-32 flex items-end gap-[2px]">
      {data.map((d) => {
        const height = (d.amount / maxAmount) * 100;
        const isToday = d.date === new Date().toISOString().split("T")[0];
        return (
          <div
            key={d.date}
            className="flex-1 relative group"
            title={`${d.date}: ${formatCurrency(d.amount, "IQD")}`}
          >
            <div
              className={`w-full rounded-t-sm transition-all duration-200 hover:opacity-80 ${
                d.amount > 0 ? "bg-loss/70 hover:bg-loss" : "bg-surface-tertiary"
              } ${isToday ? "ring-1 ring-secondary" : ""}`}
              style={{ height: `${Math.max(height, d.amount > 0 ? 4 : 0)}%` }}
            />
            {/* Tooltip on hover */}
            {d.amount > 0 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10 transition-opacity pointer-events-none">
                {formatCurrency(d.amount, "IQD")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export function CardSpendingAnalytics() {
  const [data, setData] = useState<CardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cards/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Veri alınamadı.");
        }
      })
      .catch(() => setError("Bir hata oluştu."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    );
  }

  if (!data || data.summary.totalTransactions === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm text-text-muted">Henüz kart işlemi bulunmuyor</p>
        <p className="text-xs text-text-muted mt-1">
          Kartınızı kullanmaya başladığınızda analizler burada görünecek
        </p>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrend, dailySpending } = data;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-text-muted" />
          Harcama Analizi
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Kart harcamalarınızın kategori bazlı detaylı analizi
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingDown}
          label="Toplam Harcama"
          value={formatCurrency(summary.totalSpent, summary.currency)}
          sub={`${summary.totalTransactions} işlem`}
          color="text-loss"
        />
        <StatCard
          icon={Receipt}
          label="Ortalama İşlem"
          value={formatCurrency(summary.avgTransaction, summary.currency)}
          color="text-secondary"
        />
        <StatCard
          icon={ArrowUpDown}
          label="İşlem Sayısı"
          value={String(summary.totalTransactions)}
          sub={
            summary.biggestExpense
              ? `En yüksek: ${formatCurrency(summary.biggestExpense.amount, summary.currency)}`
              : undefined
          }
          color="text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="En Büyük Harcama"
          value={
            summary.biggestExpense
              ? formatCurrency(summary.biggestExpense.amount, summary.currency)
              : "-"
          }
          sub={summary.biggestExpense?.description || undefined}
          color="text-warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
            <CardTitle>
              <span className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Kategori Dağılımı
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CategoryPieChart data={categoryBreakdown} />
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
            <CardTitle>
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Aylık Trend
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MonthlyBarChart data={monthlyTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending (full width) */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
          <CardTitle>
            <span className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Son 30 Günlük Harcama
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailySpendingChart data={dailySpending} />
          <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
            <span>{dailySpending[0]?.date || ""}</span>
            <span>{dailySpending[dailySpending.length - 1]?.date || ""}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
