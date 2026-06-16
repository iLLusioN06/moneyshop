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
    fetchStats();
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-all overflow-hidden" onClick={() => router.push("/admin/users")}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Kullanıcı Yönetimi</h3>
                    <p className="text-sm text-text-muted">Listele, rol değiştir, yönet</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-all overflow-hidden" onClick={() => router.push("/admin/transactions")}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ArrowUpDown className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">İşlem İzleme</h3>
                    <p className="text-sm text-text-muted">Görüntüle ve filtrele</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-all overflow-hidden" onClick={() => router.push("/admin/email-logs")}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-profit/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-profit" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">E-posta Günlükleri</h3>
                    <p className="text-sm text-text-muted">Gönderim durumları</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-all overflow-hidden" onClick={() => router.push("/admin/audit-logs")}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <History className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Denetim Günlükleri</h3>
                    <p className="text-sm text-text-muted">Kullanıcı hareketleri</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
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
