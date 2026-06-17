"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  EmptyState,
} from "@/components/ui";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from "@/lib/constants";
import DekontActions from "@/components/dekont-actions";
import {
  ArrowUpDown,
  Plus,
  Filter,
  Search,
  X,
  Trash2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import type { Transaction, FinancialAccount, Category } from "@/types";

const typeColors: Record<string, string> = {
  INCOME: "text-profit",
  EXPENSE: "text-loss",
  TRANSFER: "text-info",
};

const typeBg: Record<string, string> = {
  INCOME: "bg-profit/10",
  EXPENSE: "bg-loss/10",
  TRANSFER: "bg-info/10",
};

interface TransactionForm {
  accountId: string;
  type: string;
  categoryId: string;
  amount: string;
  description: string;
  date: string;
}

interface BulkTransaction {
  accountId: string;
  type: string;
  amount: number;
  description?: string;
  date?: string;
  categoryId?: string;
}

const emptyForm: TransactionForm = {
  accountId: "",
  type: "EXPENSE",
  categoryId: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Dropdown data
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Export
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<BulkTransaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const buildExportUrl = (format: string) => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (filterType) params.set("type", filterType);
    if (filterAccount) params.set("accountId", filterAccount);
    if (filterStart) params.set("startDate", filterStart);
    if (filterEnd) params.set("endDate", filterEnd);
    return `/api/reports/transactions?${params}`;
  };

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    const url = buildExportUrl(format);
    window.open(url, "_blank");
  };

  const limit = 15;

  const fetchDropdowns = useCallback(async () => {
    const [accRes, catRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/categories"),
    ]);
    const accData = await accRes.json();
    const catData = await catRes.json();
    if (accData.success) setAccounts(accData.data);
    if (catData.success) setCategories(catData.data);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchDropdowns();
    }, 0);
  }, [fetchDropdowns]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (filterType) params.set("type", filterType);
      if (filterAccount) params.set("accountId", filterAccount);
      if (filterStart) params.set("startDate", filterStart);
      if (filterEnd) params.set("endDate", filterEnd);
      if (filterSearch) params.set("search", filterSearch);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        setError(data.error || "İşlemler alınamadı.");
      }
    } catch {
      setError("İşlemler alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterType, filterAccount, filterStart, filterEnd, filterSearch]);

  useEffect(() => {
    setTimeout(() => {
      fetchTransactions();
    }, 0);
  }, [fetchTransactions]);

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      accountId: accounts[0]?.id || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.accountId || !form.type || !form.amount) {
      setFormError("Hesap, tür ve tutar zorunludur.");
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      setFormError("Tutar 0'dan büyük olmalıdır.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: form.accountId,
          type: form.type,
          categoryId: form.categoryId || undefined,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          date: form.date || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Bir hata oluştu.");
        return;
      }

      setShowModal(false);
      fetchTransactions();
    } catch {
      setFormError("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Silinirken bir hata oluştu.");
        return;
      }
      setDeleteId(null);
      fetchTransactions();
    } catch {
      setError("Silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        setShowBulkActions(false);
        setBulkAction("");
        fetchTransactions();
      } else {
        setError(data.error || "Toplu silme sırasında hata oluştu.");
      }
    } catch {
      setError("Toplu silme sırasında hata oluştu.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), updates: { status } }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        setShowBulkActions(false);
        setBulkAction("");
        fetchTransactions();
      } else {
        setError(data.error || "Toplu güncelleme sırasında hata oluştu.");
      }
    } catch {
      setError("Toplu güncelleme sırasında hata oluştu.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Import handlers
  const parseCSV = (text: string): BulkTransaction[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(";").map((h) => h.trim().replace(/"/g, "").toLowerCase());
    const transactions: BulkTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";").map((v) => v.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      // Map Turkish headers to English
      const typeMap: Record<string, string> = { "gelir": "INCOME", "gider": "EXPENSE", "transfer": "TRANSFER" };
      const statusMap: Record<string, string> = { "tamamlandı": "COMPLETED", "bekliyor": "PENDING", "başarısız": "FAILED", "iptal": "CANCELLED" };

      const amount = parseFloat(row["tutar"] || "0");
      if (amount <= 0 || !accounts.length) continue;

      // Find account by name
      const accountName = row["hesap"] || "";
      const account = accounts.find((a) => a.name.toLowerCase() === accountName.toLowerCase()) || accounts[0];

      transactions.push({
        accountId: account?.id || "",
        type: typeMap[row["tür"]?.toLowerCase() || ""] || "EXPENSE",
        amount,
        description: row["açıklama"] || "",
        date: row["tarih"] || new Date().toISOString().split("T")[0],
      });
    }

    return transactions;
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setImportError("CSV dosyasında geçerli işlem bulunamadı. Format: Tarih;Tür;Tutar;Para Birimi;Açıklama;Kategori;Hesap;Durum");
          return;
        }
        setImportPreview(parsed);
      } catch {
        setImportError("CSV dosyası ayrıştırılamadı.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (importPreview.length === 0) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: importPreview }),
      });
      const data = await res.json();
      if (data.success) {
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        fetchTransactions();
      } else {
        setImportError(data.error || "İçe aktarma sırasında hata oluştu.");
      }
    } catch {
      setImportError("İçe aktarma sırasında hata oluştu.");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => !form.type || c.type === form.type
  );

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">İşlemler</h2>
          <p className="text-sm text-text-muted mt-1">
            Toplam {total} işlem
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface-tertiary transition-colors"
                  onMouseDown={() => handleExport("csv")}
                >
                  <FileText className="w-4 h-4 text-secondary" />
                  CSV olarak indir
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface-tertiary transition-colors"
                  onMouseDown={() => handleExport("xlsx")}
                >
                  <FileSpreadsheet className="w-4 h-4 text-profit" />
                  Excel olarak indir
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <FileSpreadsheet className="w-4 h-4" />
            İçe Aktar
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            Yeni İşlem
          </Button>
        </div>
      </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary" />
            Filtrele
          </h3>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-text-muted mb-1">
                Tür
              </label>
              <select
                className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              >
                <option value="">Tümü</option>
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-text-muted mb-1">
                Hesap
              </label>
              <select
                className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={filterAccount}
                onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }}
              >
                <option value="">Tüm Hesaplar</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="w-[140px]">
              <label className="block text-xs font-medium text-text-muted mb-1">
                Başlangıç
              </label>
              <input
                type="date"
                className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={filterStart}
                onChange={(e) => { setFilterStart(e.target.value); setPage(1); }}
              />
            </div>

            <div className="w-[140px]">
              <label className="block text-xs font-medium text-text-muted mb-1">
                Bitiş
              </label>
              <input
                type="date"
                className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={filterEnd}
                onChange={(e) => { setFilterEnd(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-text-muted mb-1">
                Ara
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Açıklama ara..."
                  className="flex h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  value={filterSearch}
                  onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterType("");
                setFilterAccount("");
                setFilterStart("");
                setFilterEnd("");
                setFilterSearch("");
                setPage(1);
              }}
              className="mb-0"
            >
              <RefreshCw className="w-4 h-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-secondary">
                  {selectedIds.size} işlem seçildi
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Seçimi Kaldır
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="h-8 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                >
                  <option value="">İşlem Seçin</option>
                  <option value="status-completed">Tamamlandı Olarak İşaretle</option>
                  <option value="status-pending">Bekliyor Olarak İşaretle</option>
                  <option value="delete">Sil</option>
                </select>
                <Button
                  size="sm"
                  disabled={!bulkAction || isBulkProcessing}
                  onClick={() => {
                    if (bulkAction === "delete") {
                      handleBulkDelete();
                    } else if (bulkAction === "status-completed") {
                      handleBulkStatusChange("COMPLETED");
                    } else if (bulkAction === "status-pending") {
                      handleBulkStatusChange("PENDING");
                    }
                  }}
                >
                  {isBulkProcessing ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    "Uygula"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-secondary" />
              İşlem Geçmişi
            </h3>
            {transactions.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === transactions.length && transactions.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary/30"
                />
                Tümünü Seç
              </label>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-tertiary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-tertiary rounded w-1/3" />
                    <div className="h-3 bg-surface-tertiary rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-surface-tertiary rounded w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={filterType || filterAccount || filterSearch
                ? "İşlem bulunamadı"
                : "Henüz işlem eklenmemiş"}
              description={filterType || filterAccount || filterSearch
                ? "Filtrelere uygun işlem bulunamadı."
                : "İlk işleminizi ekleyerek finansal takibinize başlayın."}
              action={(!filterType && !filterAccount && !filterSearch) ? { label: "İlk İşlemi Ekle", onClick: openAddModal, icon: Plus } : undefined}
            />
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-surface-tertiary/50 transition-colors group",
                    selectedIds.has(t.id) && "bg-secondary/5"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary/30 flex-shrink-0"
                    />
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        typeBg[t.type]
                      )}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight className="w-4 h-4 text-profit" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-loss" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {t.description || "Açıklama yok"}
                        </p>
                        {t.category && (
                          <Badge variant="default" size="sm">
                            {t.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                        <span>{t.account?.name || "Bilinmeyen"}</span>
                        <span>·</span>
                        <span>{formatDate(t.date, "relative")}</span>
                        <span>·</span>
                        <Badge
                          variant={
                            t.status === "COMPLETED"
                              ? "success"
                              : t.status === "PENDING"
                                ? "warning"
                                : t.status === "FAILED"
                                  ? "danger"
                                  : "default"
                          }
                          size="sm"
                        >
                          {TRANSACTION_STATUS.find((s) => s.value === t.status)?.label || t.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <p
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap",
                        typeColors[t.type]
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount, t.currency)}
                    </p>
                    {/* Dekont Actions - compact, shows on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <DekontActions transactionId={t.id} compact />
                    </div>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-loss/10 text-text-muted hover:text-loss transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Sayfa {page} / {totalPages} (toplam {total} işlem)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sonraki
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle>Yeni İşlem</CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formError && (
                  <div className="shake-alert p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    İşlem Türü
                  </label>
                  <div className="flex gap-2">
                    {TRANSACTION_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setForm({ ...form, type: t.value, categoryId: "" })}
                        className={cn(
                          "flex-1 h-10 rounded-lg border text-sm font-medium transition-all",
                          form.type === t.value
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-border bg-surface text-text-secondary hover:border-border"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Hesap
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={form.accountId}
                    onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  >
                    <option value="">Hesap Seçin</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, a.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Tutar"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Kategori
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Kategori Seçin</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Açıklama"
                  placeholder="İşlem açıklaması"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <Input
                  label="Tarih"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    className="flex-1"
                    isLoading={isSaving}
                    onClick={handleSave}
                  >
                    <Plus className="w-4 h-4" />
                    Ekle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm overflow-hidden">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-loss mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                İşlemi Sil
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Bu işlemi silmek istediğinize emin misiniz? İşlem silindiğinde
                hesap bakiyesi otomatik olarak düzeltilecektir.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteId(null)}
                >
                  İptal
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  isLoading={isDeleting}
                  onClick={() => handleDelete(deleteId)}
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle>İşlem İçe Aktar</CardTitle>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                    setImportError(null);
                  }}
                  className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {importError && (
                  <div className="shake-alert p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    {importError}
                  </div>
                )}

                {!importFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileSpreadsheet className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-primary font-medium mb-2">
                      CSV dosyası seçin
                    </p>
                    <p className="text-text-muted text-sm mb-4">
                      Format: Tarih;Tür;Tutar;Para Birimi;Açıklama;Kategori;Hesap;Durum
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary-dark transition-colors">
                      <FileSpreadsheet className="w-4 h-4" />
                      Dosya Seç
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-surface-tertiary rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{importFile.name}</p>
                          <p className="text-xs text-text-muted">{importPreview.length} işlem bulundu</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setImportFile(null);
                          setImportPreview([]);
                        }}
                        className="p-1 hover:bg-surface rounded-lg text-text-muted"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {importPreview.length > 0 && (
                      <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-surface-tertiary sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Tarih</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Tür</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-text-muted">Tutar</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Açıklama</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {importPreview.slice(0, 10).map((t, i) => (
                              <tr key={i} className="hover:bg-surface-tertiary/50">
                                <td className="px-3 py-2 text-text-primary">{t.date || "-"}</td>
                                <td className="px-3 py-2">
                                  <Badge variant={t.type === "INCOME" ? "success" : t.type === "EXPENSE" ? "danger" : "info"} size="sm">
                                    {t.type === "INCOME" ? "Gelir" : t.type === "EXPENSE" ? "Gider" : "Transfer"}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-right text-text-primary">{formatCurrency(t.amount, "IQD")}</td>
                                <td className="px-3 py-2 text-text-muted truncate max-w-[200px]">{t.description || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {importPreview.length > 10 && (
                          <p className="text-center text-xs text-text-muted py-2">
                            ...ve {importPreview.length - 10} işlem daha
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowImportModal(false);
                          setImportFile(null);
                          setImportPreview([]);
                          setImportError(null);
                        }}
                      >
                        İptal
                      </Button>
                      <Button
                        className="flex-1"
                        isLoading={isImporting}
                        disabled={importPreview.length === 0}
                        onClick={handleImportConfirm}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        {importPreview.length} İşlemi İçe Aktar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
