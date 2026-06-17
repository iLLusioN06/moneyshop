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
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Users,
  Building2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  UserCheck,
  UserX,
  History,
  BarChart3,
  Activity,
  Mail,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  monthlyTransactions: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalVolume: number;
  incomeGrowth: number;
  weeklyVolume: number;
  weeklyTransactionCount: number;
  failedTransactions: number;
  avgTransactionAmount: number;
  topUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    transactionCount: number;
    totalVolume: number;
  }>;
  transactionsByDay: Array<{
    day: string;
    count: number;
    volume: number;
  }>;
  transactionsByType: Array<{
    type: string;
    count: number;
    volume: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    status: string;
    date: string;
    user: { id: string; name: string | null; email: string };
    account: { name: string };
  }>;
  monthlyRevenue: Array<{ month: string; income: number; expense: number }>;
  userGrowth: Array<{ month: string; count: number }>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {subtitle && (
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-text-primary mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchStats() {
    setLoading(true);
    setError(null);
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Veriler alınamadı.");
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setTimeout(() => fetchStats(), 0);
  }, []);

  const transactionTypeColor = (type: string) => {
    switch (type) {
      case "INCOME": return "text-profit bg-profit/10";
      case "EXPENSE": return "text-loss bg-loss/10";
      case "TRANSFER": return "text-secondary bg-secondary/10";
      default: return "text-text-muted bg-surface-tertiary";
    }
  };

  const transactionTypeLabel = (type: string) => {
    switch (type) {
      case "INCOME": return "Gelir";
      case "EXPENSE": return "Gider";
      case "TRANSFER": return "Transfer";
      default: return type;
    }
  };

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Admin Paneli</h2>
          <p className="text-sm text-text-muted mt-1">
            Sistem genelindeki istatistikler ve yönetim araçları
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetchStats} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Toplam Kullanıcı"
              value={formatNumber(stats.totalUsers)}
              subtitle={`${stats.activeUsers} aktif, ${stats.suspendedUsers} askıda`}
              icon={Users}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatCard
              title="Aktif Kullanıcı"
              value={formatNumber(stats.activeUsers)}
              subtitle={`%${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0} katılım`}
              icon={UserCheck}
              color="text-profit"
              bgColor="bg-profit/10"
            />
            <StatCard
              title="Askıdaki Kullanıcı"
              value={formatNumber(stats.suspendedUsers)}
              icon={UserX}
              color="text-loss"
              bgColor="bg-loss/10"
            />
            <StatCard
              title="Toplam Hesap"
              value={formatNumber(stats.totalAccounts)}
              subtitle="Tüm finansal hesaplar"
              icon={Building2}
              color="text-accent"
              bgColor="bg-accent/10"
            />
            <StatCard
              title="Toplam İşlem"
              value={formatNumber(stats.totalTransactions)}
              subtitle={`Bu ay ${stats.monthlyTransactions} işlem`}
              icon={ArrowUpDown}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatCard
              title="Bu Ay Gelir"
              value={formatCurrency(stats.monthlyIncome)}
              subtitle={stats.incomeGrowth !== 0 ? `Geçen aya göre %${stats.incomeGrowth > 0 ? '+' : ''}${stats.incomeGrowth}` : undefined}
              icon={TrendingUp}
              color="text-profit"
              bgColor="bg-profit/10"
            />
            <StatCard
              title="Bu Ay Gider"
              value={formatCurrency(stats.monthlyExpense)}
              icon={TrendingDown}
              color="text-loss"
              bgColor="bg-loss/10"
            />
            <StatCard
              title="Toplam Hacim"
              value={formatCurrency(stats.totalVolume)}
              subtitle={`Son 7 gün: ${formatCurrency(stats.weeklyVolume)} (${stats.weeklyTransactionCount} işlem)`}
              icon={Wallet}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatCard
              title="Ortalama İşlem"
              value={formatCurrency(stats.avgTransactionAmount)}
              subtitle="İşlem başına ortalama tutar"
              icon={BarChart3}
              color="text-accent"
              bgColor="bg-accent/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <CardTitle className="text-sm">Aylık Gelir/Gider Trendi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {stats.monthlyRevenue.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-text-muted">
                    Grafik için veri bulunamadı
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.monthlyRevenue} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" name="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  <CardTitle className="text-sm">Kullanıcı Büyümesi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {stats.userGrowth.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-text-muted">
                    Grafik için veri bulunamadı
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={stats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} allowDecimals={false} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-sm">
                              <p className="font-medium text-text-primary">{label}</p>
                              <p className="font-medium text-accent">{payload[0].value} yeni kullanıcı</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Line type="monotone" dataKey="count" name="Yeni Kullanıcı" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Distribution by Type */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <CardTitle className="text-sm">İşlem Dağılımı</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {(stats.transactionsByType?.length ?? 0) === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-text-muted">
                    Veri bulunamadı
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(stats.transactionsByType ?? []).map((item) => {
                      const total = (stats.transactionsByType ?? []).reduce((sum, t) => sum + t.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      const typeColor = item.type === "INCOME" ? "bg-profit" : item.type === "EXPENSE" ? "bg-loss" : "bg-secondary";
                      return (
                        <div key={item.type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-primary font-medium">
                              {item.type === "INCOME" ? "Gelir" : item.type === "EXPENSE" ? "Gider" : "Transfer"}
                            </span>
                            <span className="text-text-muted">{item.count} işlem</span>
                          </div>
                          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${typeColor} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-text-muted">
                            <span>%{percentage.toFixed(1)}</span>
                            <span>{formatCurrency(item.volume)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Users by Volume */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <CardTitle className="text-sm">En Çok İşlem Yapan Kullanıcılar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {(stats.topUsers?.length ?? 0) === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-text-muted">
                    Veri bulunamadı
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(stats.topUsers ?? []).slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-sm font-bold text-secondary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-text-muted">
                            {user.transactionCount} işlem
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">
                            {formatCurrency(user.totalVolume)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions by Day of Week */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-profit/10 via-profit/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-profit" />
                  <CardTitle className="text-sm">Haftalık İşlem Dağılımı</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {(stats.transactionsByDay?.length ?? 0) === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-text-muted">
                    Veri bulunamadı
                  </div>
                ) : (
                  <div className="space-y-2">
                      {(stats.transactionsByDay ?? []).map((item) => {
                      const maxCount = Math.max(...stats.transactionsByDay.map((d) => d.count));
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item.day} className="flex items-center gap-3">
                          <span className="w-12 text-xs text-text-muted font-medium">{item.day}</span>
                          <div className="flex-1 h-4 bg-surface-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-16 text-xs text-text-muted text-right">{item.count} işlem</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-secondary/30 transition-all duration-200 overflow-hidden flex-1 min-w-0" onClick={() => router.push("/admin/users")}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Users className="w-4 h-4 text-secondary" />
                </div>
                <span className="font-medium text-xs truncate">Kullanıcı Yönetimi</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-accent/30 transition-all duration-200 overflow-hidden flex-1 min-w-0" onClick={() => router.push("/admin/transactions")}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <ArrowUpDown className="w-4 h-4 text-accent" />
                </div>
                <span className="font-medium text-xs truncate">İşlem İzleme</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-secondary/30 transition-all duration-200 overflow-hidden flex-1 min-w-0" onClick={() => router.push("/admin/sms-logs")}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <span className="font-medium text-xs truncate">SMS Logları</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-profit/30 transition-all duration-200 overflow-hidden flex-1 min-w-0" onClick={() => router.push("/admin/email-logs")}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-profit/10 group-hover:bg-profit/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail className="w-4 h-4 text-profit" />
                </div>
                <span className="font-medium text-xs truncate">E-posta Günlükleri</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-500/30 transition-all duration-200 overflow-hidden flex-1 min-w-0" onClick={() => router.push("/admin/audit-logs")}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <History className="w-4 h-4 text-purple-500" />
                </div>
                <span className="font-medium text-xs truncate">Denetim Günlükleri</span>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Son İşlemler</CardTitle>
                  <p className="text-sm text-text-muted mt-1">Sistemdeki son 10 işlem</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/transactions")}>
                  Tümü
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">
                  Henüz işlem bulunmuyor
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Kullanıcı</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Hesap</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Tür</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Tutar</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border hover:bg-surface-tertiary/50 transition-colors">
                          <td className="py-2 px-3">
                            <p className="font-medium text-text-primary">{tx.user.name || tx.user.email}</p>
                          </td>
                          <td className="py-2 px-3 text-text-secondary">{tx.account.name}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${transactionTypeColor(tx.type)}`}>
                              {transactionTypeLabel(tx.type)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`font-medium ${tx.type === "INCOME" ? "text-profit" : tx.type === "EXPENSE" ? "text-loss" : "text-secondary"}`}>
                              {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-text-muted">
                            {formatDate(new Date(tx.date), "short")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
    </ErrorBoundary>
  );
}
