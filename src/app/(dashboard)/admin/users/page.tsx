"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  TableSkeleton,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  AlertCircle,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldBan,
  UserCog,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowLeft,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
  _count: {
    accounts: number;
    transactions: number;
  };
}

interface PaginatedResponse {
  success: boolean;
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function fetchUsers() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "Kullanıcılar alınamadı.");
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function updateUser(userId: string, updates: Record<string, unknown>) {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      const result = await res.json();
      if (result.success) {
        fetchUsers();
      } else {
        alert(result.error || "Güncelleme başarısız.");
      }
    } catch {
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
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

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Kullanıcı Yönetimi</h2>
            <p className="text-sm text-text-muted mt-1">
              {data ? `${data.total} kullanıcı bulundu` : "Tüm kullanıcıları yönetin"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetchUsers} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-secondary" />
            Filtrele
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı, e-posta veya telefon ile ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
              </div>
            </form>

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <option value="">Tüm Roller</option>
              <option value="USER">Kullanıcı</option>
              <option value="MODERATOR">Moderatör</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıda</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <UserCog className="w-4 h-4 text-secondary" />
            Kullanıcılar
          </h3>
        </div>
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="p-6">
              <TableSkeleton rows={8} />
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              Kullanıcı bulunamadı.
            </div>
          ) : data ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-tertiary/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">İletişim</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Rol</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Durum</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">İstatistik</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Kayıt</th>
                      <th className="text-right py-3 px-4 text-text-muted font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium text-secondary">
                              {(user.name || user.email)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{user.name || "İsimsiz"}</p>
                              <p className="text-xs text-text-muted">{user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-text-primary">{user.email}</p>
                          <p className="text-xs text-text-muted">{user.phone || "—"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role] || roleColors.USER}`}>
                            {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : user.role === "MODERATOR" ? <ShieldCheck className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.isActive ? "success" : "danger"}>
                            {user.isActive ? "Aktif" : "Askıda"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span title="Hesap">{user._count.accounts} hesap</span>
                            <span>·</span>
                            <span title="İşlem">{user._count.transactions} işlem</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-text-muted">
                          {formatDate(new Date(user.createdAt), "short")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Role Change */}
                            {user.role !== "ADMIN" && (
                              <select
                                value={user.role}
                                onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                disabled={updatingId === user.id}
                                className="h-8 text-xs rounded-lg border border-border bg-surface-secondary px-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-50"
                              >
                                <option value="USER">Kullanıcı</option>
                                <option value="MODERATOR">Moderatör</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            )}
                            {user.role === "ADMIN" && (
                              <span className="text-xs text-text-muted px-2">—</span>
                            )}

                            {/* Suspend/Activate */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                              isLoading={updatingId === user.id}
                              title={user.isActive ? "Askıya Al" : "Aktifleştir"}
                            >
                              {user.isActive ? (
                                <UserX className="w-4 h-4 text-loss" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-profit" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-text-muted">
                    {data.total} kullanıcıdan {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} arası
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-text-muted px-2">
                      {data.page} / {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  );
}
