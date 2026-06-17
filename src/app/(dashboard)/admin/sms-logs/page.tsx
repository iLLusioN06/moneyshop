"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { Mail, Search, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react";

interface SmsLogEntry {
  id: string;
  phone: string;
  message: string;
  event: string;
  status: string;
  sid: string | null;
  error: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

export default function AdminSmsLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SmsLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ event: "", status: "", search: "" });

  function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter.event) params.set("event", filter.event);
    if (filter.status) params.set("status", filter.status);
    if (filter.search) params.set("search", filter.search);

    fetch(`/api/admin/sms-logs?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setTimeout(() => fetchLogs(), 0);
  }, [page, filter]);

  const eventBadge = (event: string) => {
    const map: Record<string, string> = {
      VERIFICATION: "text-secondary bg-secondary/10",
      TRANSACTION: "text-profit bg-profit/10",
      TRANSFER: "text-accent bg-accent/10",
      ALERT: "text-loss bg-loss/10",
      TEST: "text-text-muted bg-surface-tertiary",
    };
    return map[event] || "text-text-muted bg-surface-tertiary";
  };

  const statusBadge = (status: string) => {
    return status === "SENT" ? "text-profit bg-profit/10" : "text-loss bg-loss/10";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">SMS Logları</h1>
            <p className="text-text-muted text-sm">{total} kayıt bulundu</p>
          </div>
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Telefon veya mesaj ara..."
                value={filter.search}
                onChange={(e) => { setFilter({ ...filter, search: e.target.value }); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm"
              />
            </div>
            <select
              value={filter.event}
              onChange={(e) => { setFilter({ ...filter, event: e.target.value }); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm"
            >
              <option value="">Tüm Olaylar</option>
              <option value="VERIFICATION">Doğrulama</option>
              <option value="TRANSACTION">İşlem</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ALERT">Uyarı</option>
              <option value="TEST">Test</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm"
            >
              <option value="">Tüm Durumlar</option>
              <option value="SENT">Gönderildi</option>
              <option value="FAILED">Başarısız</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Yükleniyor...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-text-muted">SMS logu bulunamadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-text-secondary">Tarih</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Kullanıcı</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Telefon</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Olay</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Durum</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Mesaj</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-surface-secondary/50">
                      <td className="p-3">{new Date(log.createdAt).toLocaleString("tr-TR")}</td>
                      <td className="p-3">
                        <div>{log.user.name || "-"}</div>
                        <div className="text-xs text-text-muted">{log.user.email}</div>
                      </td>
                      <td className="p-3 font-mono text-xs">{log.phone}</td>
                      <td className="p-3"><Badge className={eventBadge(log.event)}>{log.event}</Badge></td>
                      <td className="p-3"><Badge className={statusBadge(log.status)}>{log.status}</Badge></td>
                      <td className="p-3 max-w-xs truncate text-text-muted">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-sm text-text-muted">Sayfa {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-border hover:bg-surface-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-surface-secondary disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
