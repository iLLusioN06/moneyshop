"use client";

import { useState, useEffect, useCallback } from "react";
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
import { t } from "@/lib/dashboard-i18n";
import {
  Search,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserCog,
  UserX,
  UserCheck,
  Shield,
  ShieldCheck,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Key,
  X,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Activity,
  Wallet,
  ArrowUpDown,
  Download,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  _count: {
    accounts: number;
    transactions: number;
    cards: number;
    beneficiaries: number;
  };
  accounts?: { id: string; name: string; balance: number; currency: string }[];
}

interface UserActivity {
  type: string;
  description: string;
  date: string;
  ip?: string;
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

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    isActive: true,
  });

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "Kullanıcılar alınamadı.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    setTimeout(() => fetchUsers(), 0);
  }, [fetchUsers]);

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
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, ...updates } as AdminUser);
        }
      } else {
        alert(result.error || "Güncelleme başarısız.");
      }
    } catch {
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(userId: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(result.error || "Silme başarısız.");
      }
    } catch {
      alert("Silme sırasında hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function resetPassword(userId: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        setShowResetPasswordModal(false);
        alert("Sıfırlama e-postası gönderildi.");
      } else {
        alert(result.error || "Sıfırlama başarısız.");
      }
    } catch {
      alert("Sıfırlama sırasında hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  }

  function openDetailModal(user: AdminUser) {
    setSelectedUser(user);
    setShowDetailModal(true);
  }

  function openEditModal(user: AdminUser) {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  }

  function openDeleteModal(user: AdminUser) {
    setSelectedUser(user);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  }

  function openResetPasswordModal(user: AdminUser) {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  }

  async function handleEditSubmit() {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, editForm);
    setShowEditModal(false);
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
    <div className="flex flex-col flex-1 min-h-0 gap-4 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{t("admin.users.title")}</h2>
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
      <Card className="overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <UserCog className="w-4 h-4 text-secondary" />
            Kullanıcılar
          </h3>
        </div>
        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
          {loading && !data ? (
            <div className="p-6 flex-1">
              <TableSkeleton rows={8} />
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted flex-1 flex items-center justify-center">
              Kullanıcı bulunamadı.
            </div>
          ) : data ? (
            <>
              <div className="overflow-auto flex-1 min-h-0">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-[1]">
                    <tr className="border-b border-border bg-surface-tertiary/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">İletişim</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Rol</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Durum</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Güvenlik</th>
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
                          <div className="flex items-center gap-2">
                            {user.emailVerified && (
                              <span className="text-profit" title="E-posta doğrulanmış">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                            {user.twoFactorEnabled && (
                              <span className="text-secondary" title="2FA aktif">
                                <Shield className="w-4 h-4" />
                              </span>
                            )}
                          </div>
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
                            {/* View Detail */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailModal(user)}
                              title="Detay Görüntüle"
                            >
                              <Eye className="w-4 h-4 text-text-muted" />
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4 text-secondary" />
                            </Button>

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

                            {/* More Actions */}
                            <div className="relative group">
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4 text-text-muted" />
                              </Button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg opacity- invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button
                                  onClick={() => openResetPasswordModal(user)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors rounded-t-lg"
                                >
                                  <Key className="w-4 h-4 text-secondary" />
                                  Şifre Sıfırla
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-loss hover:bg-loss/5 transition-colors rounded-b-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Kullanıcıyı Sil
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border flex-shrink-0">
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

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[slide-up_0.3s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Kullanıcı Detayı</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* User Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-bold text-secondary">
                  {(selectedUser.name || selectedUser.email)[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedUser.name || "İsimsiz"}</h3>
                  <p className="text-text-muted">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[selectedUser.role]}`}>
                      {roleLabels[selectedUser.role]}
                    </span>
                    <Badge variant={selectedUser.isActive ? "success" : "danger"}>
                      {selectedUser.isActive ? "Aktif" : "Askıda"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">E-posta</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{selectedUser.email}</p>
                  {selectedUser.emailVerified && (
                    <p className="text-xs text-profit mt-1">✓ Doğrulanmış</p>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Telefon</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{selectedUser.phone || "—"}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Kayıt Tarihi</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{formatDate(new Date(selectedUser.createdAt))}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs">2FA Durumu</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedUser.twoFactorEnabled ? "Aktif" : "Pasif"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20 text-center">
                  <Wallet className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold text-text-primary">{selectedUser._count.accounts}</p>
                  <p className="text-xs text-text-muted">Hesap</p>
                </div>
                <div className="p-3 rounded-lg bg-profit/5 border border-profit/20 text-center">
                  <ArrowUpDown className="w-5 h-5 text-profit mx-auto mb-1" />
                  <p className="text-lg font-bold text-text-primary">{selectedUser._count.transactions}</p>
                  <p className="text-xs text-text-muted">İşlem</p>
                </div>
                <div className="p-3 rounded-lg bg-info/5 border border-info/20 text-center">
                  <Activity className="w-5 h-5 text-info mx-auto mb-1" />
                  <p className="text-lg font-bold text-text-primary">{selectedUser._count.cards}</p>
                  <p className="text-xs text-text-muted">Kart</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
                  <UserCheck className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold text-text-primary">{selectedUser._count.beneficiaries}</p>
                  <p className="text-xs text-text-muted">Alıcı</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDetailModal(false); openEditModal(selectedUser); }}
                >
                  <Edit2 className="w-4 h-4" />
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateUser(selectedUser.id, { isActive: !selectedUser.isActive })}
                >
                  {selectedUser.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {selectedUser.isActive ? "Askıya Al" : "Aktifleştir"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDetailModal(false); openResetPasswordModal(selectedUser); }}
                >
                  <Key className="w-4 h-4" />
                  Şifre Sıfırla
                </Button>
                {selectedUser.role !== "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowDetailModal(false); openDeleteModal(selectedUser); }}
                    className="text-loss hover:bg-loss/10 hover:border-loss/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Kullanıcıyı Düzenle</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">E-posta</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Telefon</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="MODERATOR">Moderatör</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary/30"
                />
                <label htmlFor="isActive" className="text-sm text-text-primary">Aktif</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                İptal
              </Button>
              <Button onClick={handleEditSubmit} isLoading={updatingId === selectedUser.id}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-loss">Kullanıcıyı Sil</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-loss/10 border border-loss/20 mb-4">
                <AlertTriangle className="w-5 h-5 text-loss flex-shrink-0" />
                <p className="text-sm text-loss">
                  Bu işlem geri alınamaz! Kullanıcının tüm verileri silinecektir.
                </p>
              </div>
              <p className="text-sm text-text-muted mb-4">
                <strong>{selectedUser.name || selectedUser.email}</strong> kullanıcısını silmek istediğinize emin misiniz?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Onaylamak için <span className="text-loss font-bold">SİL</span> yazın
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="SİL"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-loss/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteUser(selectedUser.id)}
                disabled={deleteConfirmText !== "SİL"}
                isLoading={updatingId === selectedUser.id}
              >
                <Trash2 className="w-4 h-4" />
                Kalıcı Olarak Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Şifre Sıfırla</h2>
              <button onClick={() => setShowResetPasswordModal(false)} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/20 mb-4">
                <Key className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-sm text-text-muted">
                  Kullanıcıya şifre sıfırlama e-postası gönderilecektir.
                </p>
              </div>
              <p className="text-sm text-text-muted">
                <strong>{selectedUser.name || selectedUser.email}</strong> kullanıcısının şifresini sıfırlamak istediğinize emin misiniz?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowResetPasswordModal(false)}>
                İptal
              </Button>
              <Button onClick={() => resetPassword(selectedUser.id)} isLoading={updatingId === selectedUser.id}>
                <Mail className="w-4 h-4" />
                Sıfırlama E-postası Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
