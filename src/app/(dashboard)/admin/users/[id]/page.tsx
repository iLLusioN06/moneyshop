"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Skeleton,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  UserCog,
  Key,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Building2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  History,
  CreditCard,
  Clock,
  Globe,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: string | null;
  dateOfBirth: string | null;
  tcKimlik: string | null;
  address: string | null;
  identityNumber: string | null;
  image: string | null;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    accounts: number;
    transactions: number;
    categories: number;
    budgets: number;
    investments: number;
    recurringTransactions: number;
    cards: number;
    emailLogs: number;
    auditLogs: number;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    _count: { transactions: number };
  }>;
  cards: Array<{
    id: string;
    cardType: string;
    cardHolderName: string;
    status: string;
    balance: number;
    currency: string;
    dailyLimit: number;
    monthlyLimit: number;
    issuedAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string | null;
    status: string;
    date: string;
    account: { name: string };
    category: { name: string; icon: string; color: string } | null;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: unknown;
    ip: string | null;
    createdAt: string;
  }>;
  emailLogs: Array<{
    id: string;
    to: string;
    subject: string;
    event: string;
    status: string;
    createdAt: string;
  }>;
  stats: {
    monthlyIncome: number;
    monthlyExpense: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-secondary/10 text-secondary border-secondary/20",
  MODERATOR: "bg-accent/10 text-accent border-accent/20",
  USER: "bg-surface-tertiary text-text-secondary border-border",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderatör",
  USER: "Kullanıcı",
};

const cardTypeColors: Record<string, string> = {
  STANDARD: "bg-blue-500/10 text-blue-600",
  SILVER: "bg-gray-500/10 text-gray-600",
  GOLD: "bg-yellow-500/10 text-yellow-600",
};

const cardStatusColors: Record<string, string> = {
  ACTIVE: "bg-profit/10 text-profit",
  BLOCKED: "bg-loss/10 text-loss",
  CANCELLED: "bg-surface-tertiary text-text-muted",
  PENDING: "bg-accent/10 text-accent",
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchUser() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        } else {
          setError(data.error || "Kullanıcı bulunamadı.");
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUser();
  }, [userId]);

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

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-profit bg-profit/10";
      case "PENDING": return "text-accent bg-accent/10";
      case "FAILED": return "text-loss bg-loss/10";
      case "CANCELLED": return "text-text-muted bg-surface-tertiary";
      default: return "text-text-muted bg-surface-tertiary";
    }
  };

  const auditActionColor = (action: string) => {
    switch (action) {
      case "LOGIN": return "text-profit bg-profit/10";
      case "LOGOUT": return "text-text-muted bg-surface-tertiary";
      case "CREATE": return "text-secondary bg-secondary/10";
      case "UPDATE": return "text-accent bg-accent/10";
      case "DELETE": return "text-loss bg-loss/10";
      case "VERIFY": return "text-profit bg-profit/10";
      default: return "text-text-muted bg-surface-tertiary";
    }
  };

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text-primary">
                {loading ? "..." : user?.name || user?.email || "Kullanıcı Detayı"}
              </h2>
              {!loading && user && (
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Aktif" : "Askıda"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-muted mt-1">Kullanıcı detayları ve aktivite geçmişi</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUser} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetchUser} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && !user ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      ) : user ? (
        <>
          {/* Profile + Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 overflow-hidden">
              <div className="bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center text-2xl font-bold text-secondary mx-auto mb-3">
                  {(user.name || user.email)[0]?.toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-text-primary">{user.name || "İsimsiz"}</h3>
                <p className="text-sm text-text-muted">{user.email}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role] || roleColors.USER}`}>
                    {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : user.role === "MODERATOR" ? <ShieldCheck className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
                    {roleLabels[user.role] || user.role}
                  </span>
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Aktif" : "Askıda"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-text-primary">{user.email}</p>
                    <p className="text-xs text-text-muted">
                      {user.emailVerified ? `Doğrulandı: ${formatDate(new Date(user.emailVerified), "short")}` : "E-posta doğrulanmamış"}
                    </p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <p className="text-text-primary">{user.phone}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <p className="text-text-primary">
                    Kayıt: {formatDate(new Date(user.createdAt), "short")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <p className="text-text-primary">
                    Güncelleme: {formatDate(new Date(user.updatedAt), "short")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Key className="w-4 h-4 text-text-muted" />
                  <div className="flex items-center gap-2">
                    <p className="text-text-primary">2FA:</p>
                    {user.twoFactorEnabled ? (
                      <Badge variant="success">
                        <Smartphone className="w-3 h-3 mr-1" />
                        {user.twoFactorMethod === "AUTHENTICATOR" ? "Authenticator" : "SMS"}
                      </Badge>
                    ) : (
                      <Badge variant="default">Kapalı</Badge>
                    )}
                  </div>
                </div>
                {user.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <Globe className="w-4 h-4 text-text-muted mt-0.5" />
                    <p className="text-text-primary">{user.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards + Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Financial Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-profit" />
                      <p className="text-xs text-text-muted">Bu Ay Gelir</p>
                    </div>
                    <p className="text-lg font-bold text-profit">{formatCurrency(user.stats.monthlyIncome)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-loss" />
                      <p className="text-xs text-text-muted">Bu Ay Gider</p>
                    </div>
                    <p className="text-lg font-bold text-loss">{formatCurrency(user.stats.monthlyExpense)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-secondary" />
                      <p className="text-xs text-text-muted">Toplam Bakiye</p>
                    </div>
                    <p className="text-lg font-bold text-secondary">{formatCurrency(user.stats.balance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpDown className="w-4 h-4 text-accent" />
                      <p className="text-xs text-text-muted">Toplam İşlem</p>
                    </div>
                    <p className="text-lg font-bold text-accent">{user._count.transactions}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-border">
                  <Building2 className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-lg font-bold text-text-primary">{user._count.accounts}</p>
                    <p className="text-xs text-text-muted">Hesap</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-border">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-lg font-bold text-text-primary">{user._count.cards}</p>
                    <p className="text-xs text-text-muted">Kart</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-profit/5 border border-border">
                  <TrendingUp className="w-5 h-5 text-profit" />
                  <div>
                    <p className="text-lg font-bold text-text-primary">{user._count.investments}</p>
                    <p className="text-xs text-text-muted">Yatırım</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-border">
                  <History className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold text-text-primary">{user._count.budgets}</p>
                    <p className="text-xs text-text-muted">Bütçe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                <CardTitle className="text-sm">Finansal Hesaplar ({user._count.accounts})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {user.accounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">Henüz hesap bulunmuyor</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tertiary/50">
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Hesap Adı</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Tür</th>
                        <th className="text-right py-3 px-4 text-text-muted font-medium">Bakiye</th>
                        <th className="text-center py-3 px-4 text-text-muted font-medium">İşlem</th>
                        <th className="text-center py-3 px-4 text-text-muted font-medium">Durum</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Oluşturma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.accounts.map((acc) => (
                        <tr key={acc.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-text-primary">{acc.name}</td>
                          <td className="py-3 px-4 text-text-muted">{acc.type}</td>
                          <td className="py-3 px-4 text-right font-medium text-text-primary">{formatCurrency(acc.balance)}</td>
                          <td className="py-3 px-4 text-center text-text-muted">{acc._count.transactions}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={acc.isActive ? "success" : "danger"}>
                              {acc.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-text-muted text-xs">
                            {formatDate(new Date(acc.createdAt), "short")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards */}
          {user.cards.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <CardTitle className="text-sm">Kartlar ({user._count.cards})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.cards.map((card) => (
                    <div key={card.id} className="p-4 rounded-xl border border-border bg-gradient-to-br from-surface-secondary to-surface">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cardTypeColors[card.cardType] || "bg-surface-tertiary text-text-muted"}`}>
                          {card.cardType}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cardStatusColors[card.status] || ""}`}>
                          {card.status === "ACTIVE" ? "Aktif" : card.status === "BLOCKED" ? "Bloke" : card.status === "CANCELLED" ? "İptal" : "Beklemede"}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{formatCurrency(card.balance)} <span className="text-xs text-text-muted">{card.currency}</span></p>
                      <p className="text-xs text-text-muted mt-2">{card.cardHolderName}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                        <span>Günlük limit: {formatCurrency(card.dailyLimit)}</span>
                        <span>Aylık limit: {formatCurrency(card.monthlyLimit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-secondary" />
                <CardTitle className="text-sm">Son İşlemler ({user._count.transactions})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {user.transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">Henüz işlem bulunmuyor</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tertiary/50">
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Tarih</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Açıklama</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Tür</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Kategori</th>
                        <th className="text-right py-3 px-4 text-text-muted font-medium">Tutar</th>
                        <th className="text-center py-3 px-4 text-text-muted font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-text-muted">
                            {formatDate(new Date(tx.date), "short")}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-text-primary">{tx.description || "—"}</p>
                            <p className="text-xs text-text-muted">{tx.account.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${transactionTypeColor(tx.type)}`}>
                              {transactionTypeLabel(tx.type)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {tx.category ? (
                              <span className="text-xs text-text-muted">{tx.category.name}</span>
                            ) : (
                              <span className="text-xs text-text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${tx.type === "INCOME" ? "text-profit" : tx.type === "EXPENSE" ? "text-loss" : "text-secondary"}`}>
                              {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(tx.status)}`}>
                              {tx.status === "COMPLETED" ? "Tamamlandı" : tx.status === "PENDING" ? "Beklemede" : tx.status === "FAILED" ? "Başarısız" : "İptal"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          {user.auditLogs.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-sm">Denetim Günlükleri (son {user.auditLogs.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tertiary/50">
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Tarih</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">İşlem</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Hedef</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-text-muted">
                            {formatDate(new Date(log.createdAt), "short")}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${auditActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-text-primary text-xs">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</p>
                          </td>
                          <td className="py-3 px-4 text-xs text-text-muted font-mono">{log.ip || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Logs */}
          {user.emailLogs.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-profit/10 via-profit/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-profit" />
                  <CardTitle className="text-sm">E-posta Günlükleri (son {user.emailLogs.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tertiary/50">
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Tarih</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Konu</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium">Olay</th>
                        <th className="text-center py-3 px-4 text-text-muted font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.emailLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-text-muted">
                            {formatDate(new Date(log.createdAt), "short")}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-text-primary text-xs">{log.subject}</p>
                            <p className="text-text-muted text-xs">{log.to}</p>
                          </td>
                          <td className="py-3 px-4 text-xs text-text-muted">{log.event}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={log.status === "SENT" ? "success" : "danger"}>
                              {log.status === "SENT" ? "Gönderildi" : "Başarısız"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
    </ErrorBoundary>
  );
}
