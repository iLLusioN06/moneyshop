"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  History,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Oluşturma", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  UPDATE: { label: "Güncelleme", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  DELETE: { label: "Silme", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  LOGIN: { label: "Giriş", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  LOGOUT: { label: "Çıkış", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  VERIFY: { label: "Doğrulama", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  FAILED_LOGIN: { label: "Başarısız Giriş", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

const entityLabels: Record<string, string> = {
  USER: "Kullanıcı",
  ACCOUNT: "Hesap",
  TRANSACTION: "İşlem",
  TRANSFER: "Transfer",
  RECURRING: "Tekrarlanan İşlem",
  INVESTMENT: "Yatırım",
  CATEGORY: "Kategori",
  BUDGET: "Bütçe",
};

function AuditLogContent() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotal(data.pagination?.total ?? 0);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Günlükler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, searchQuery]);

  useEffect(() => {
    setTimeout(() => fetchLogs(), 0);
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Denetim Günlükleri</h2>
          <p className="text-sm text-text-muted mt-1">
            Sistemdeki tüm kullanıcı hareketlerini görüntüleyin
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-secondary" />
            Filtrele
          </h3>
        </div>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">İşlem</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
              >
                <option value="">Tümü</option>
                {Object.entries(actionLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Varlık</label>
              <select
                value={entityFilter}
                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
              >
                <option value="">Tümü</option>
                {Object.entries(entityLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-text-primary mb-1">Ara (isim, e-posta, ID)</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kullanıcı adı, e-posta veya kayıt ID..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
              />
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Ara
            </Button>
            <Button type="button" variant="outline" onClick={fetchLogs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      {!loading && (
        <p className="text-sm text-text-muted">
          Toplam <strong>{total}</strong> kayıt bulundu
        </p>
      )}

      {/* Logs */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="w-12 h-12 text-loss mb-4" />
            <p className="text-text-muted">{error}</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center py-12">
            <History className="w-12 h-12 text-text-muted/40 mb-4" />
            <p className="text-text-muted">Henüz günlük kaydı bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => {
              const actionStyle = actionLabels[log.action] ?? { label: log.action, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
              const isExpanded = expandedId === log.id;

              return (
                <Card
                  key={log.id}
                  className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`border ${actionStyle.color}`}>
                            {actionStyle.label}
                          </Badge>
                          <span className="text-xs font-medium text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
                            {entityLabels[log.entity] || log.entity}
                          </span>
                          {log.entityId && (
                            <span className="text-xs font-mono text-text-muted">
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-primary font-medium">
                          {log.user.name || log.user.email}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span>{formatDate(log.createdAt)}</span>
                          {log.ip && <span>IP: {log.ip}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <pre className="text-xs text-text-muted bg-surface-secondary p-3 rounded-lg overflow-x-auto max-h-48">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-text-muted">
                Sayfa {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <ErrorBoundary>
      <AuditLogContent />
    </ErrorBoundary>
  );
}
