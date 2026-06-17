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
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface AdminTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  date: string;
  user: { id: string; name: string | null; email: string };
  account: { id: string; name: string };
  category: { id: string; name: string; color: string } | null;
}

interface PaginatedResponse {
  success: boolean;
  data: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TYPE_OPTIONS = [
  { value: "", label: "Tüm Türler" },
  { value: "INCOME", label: "Gelir" },
  { value: "EXPENSE", label: "Gider" },
  { value: "TRANSFER", label: "Transfer" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "PENDING", label: "Beklemede" },
  { value: "FAILED", label: "Başarısız" },
  { value: "CANCELLED", label: "İptal" },
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function fetchTransactions() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/transactions?${params}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "İşlemler alınamadı.");
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setTimeout(() => fetchTransactions(), 0);
  }, [page, typeFilter, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const typeColors: Record<string, string> = {
    INCOME: "text-profit bg-profit/10",
    EXPENSE: "text-loss bg-loss/10",
    TRANSFER: "text-secondary bg-secondary/10",
  };

  const typeLabels: Record<string, string> = {
    INCOME: "Gelir",
    EXPENSE: "Gider",
    TRANSFER: "Transfer",
  };

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    COMPLETED: "success",
    PENDING: "warning",
    FAILED: "danger",
    CANCELLED: "default",
  };

  const statusLabels: Record<string, string> = {
    COMPLETED: "Tamamlandı",
    PENDING: "Beklemede",
    FAILED: "Başarısız",
    CANCELLED: "İptal",
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
            <h2 className="text-2xl font-bold text-text-primary">İşlem İzleme</h2>
            <p className="text-sm text-text-muted mt-1">
              {data ? `Toplam ${data.total} işlem` : "Tüm kullanıcıların işlem geçmişi"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTransactions} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={fetchTransactions} className="ml-auto">
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
                  placeholder="Açıklama ile ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
              </div>
            </form>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-secondary" />
            İşlem Geçmişi
          </h3>
        </div>
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="p-6">
              <TableSkeleton rows={10} />
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              İşlem bulunamadı.
            </div>
          ) : data ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-tertiary/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Hesap</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Tür</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Açıklama</th>
                      <th className="text-right py-3 px-4 text-text-muted font-medium">Tutar</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Durum</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((tx) => (
                      <tr key={tx.id} className="border-b border-border hover:bg-surface-tertiary/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium text-secondary">
                              {(tx.user.name || tx.user.email)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary text-xs">
                                {tx.user.name || "İsimsiz"}
                              </p>
                              <p className="text-xs text-text-muted">{tx.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {tx.account.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[tx.type] || "text-text-muted bg-surface-tertiary"}`}>
                            {typeLabels[tx.type] || tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary max-w-[200px] truncate">
                          {tx.description || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium whitespace-nowrap ${
                            tx.type === "INCOME" ? "text-profit" :
                            tx.type === "EXPENSE" ? "text-loss" :
                            "text-secondary"
                          }`}>
                            {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariant[tx.status] || "default"}>
                            {statusLabels[tx.status] || tx.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-text-muted text-xs whitespace-nowrap">
                          {formatDate(new Date(tx.date), "short")}
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
                    {data.total} işlemden {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} arası
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
