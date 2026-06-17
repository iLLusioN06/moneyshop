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
  Mail,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowLeft,
} from "lucide-react";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  event: string;
  status: string;
  error: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalRecent: number;
  failureRate: number;
  since: string;
}

const eventLabels: Record<string, string> = {
  TRANSACTION: "İşlem",
  TRANSFER: "Transfer",
  BUDGET_ALERT: "Bütçe Uyarısı",
  MONTHLY_REPORT: "Aylık Rapor",
  TEST: "Test",
};

const eventColors: Record<string, string> = {
  TRANSACTION: "bg-blue-500/10 text-blue-500",
  TRANSFER: "bg-purple-500/10 text-purple-500",
  BUDGET_ALERT: "bg-orange-500/10 text-orange-500",
  MONTHLY_REPORT: "bg-green-500/10 text-green-500",
  TEST: "bg-gray-500/10 text-gray-500",
};

function EmailLogsContent() {
  const router = useRouter();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (statusFilter) params.set("status", statusFilter);
      if (eventFilter) params.set("event", eventFilter);

      const res = await fetch(`/api/admin/email-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data?.logs ?? []);
        setStats(data.data?.stats ?? null);
        setTotalPages(data.data?.pagination?.totalPages ?? 1);
        setTotal(data.data?.pagination?.total ?? 0);
      } else {
        setError(data.error);
      }
    } catch {
      setError("E-posta logları alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, eventFilter]);

  useEffect(() => {
    setTimeout(() => fetchLogs(), 0);
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">E-posta Günlükleri</h2>
            <p className="text-sm text-text-muted mt-1">
              Gönderilen e-postaların durumunu görüntüleyin
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-profit/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-profit" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Başarılı</p>
                  <p className="text-xl font-bold text-text-primary">{stats.totalSent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-loss/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-loss" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Başarısız</p>
                  <p className="text-xl font-bold text-text-primary">{stats.totalFailed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Toplam (7 gün)</p>
                  <p className="text-xl font-bold text-text-primary">{stats.totalRecent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Başarısızlık Oranı</p>
                  <p className={`text-xl font-bold ${stats.failureRate > 10 ? 'text-loss' : 'text-profit'}`}>
                    %{stats.failureRate.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetchLogs} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-secondary" />
            Filtrele
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
            >
              <option value="">Tüm Durumlar</option>
              <option value="SENT">Başarılı</option>
              <option value="FAILED">Başarısız</option>
            </select>
            <select
              value={eventFilter}
              onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm"
            >
              <option value="">Tüm Olaylar</option>
              {Object.entries(eventLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
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
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Mail className="w-12 h-12 text-text-muted/40 mb-4" />
            <p className="text-text-muted">Henüz e-posta kaydı bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => {
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
                          <Badge variant={log.status === "SENT" ? "success" : "danger"}>
                            {log.status === "SENT" ? "Başarılı" : "Başarısız"}
                          </Badge>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${eventColors[log.event] || "bg-gray-500/10 text-gray-500"}`}>
                            {eventLabels[log.event] || log.event}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary font-medium truncate">
                          {log.subject}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span>{log.to}</span>
                          {log.user && <span>— {log.user.name || log.user.email}</span>}
                          <span>• {formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && log.error && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-loss font-medium mb-1">Hata:</p>
                        <pre className="text-xs text-text-muted bg-surface-secondary p-3 rounded-lg overflow-x-auto">
                          {log.error}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-text-muted">Sayfa {page} / {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
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

export default function EmailLogsPage() {
  return (
    <ErrorBoundary>
      <EmailLogsContent />
    </ErrorBoundary>
  );
}
