"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Skeleton,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAccounts } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  FileDown,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#14b8a6", "#f97316",
];

async function generatePDF(
  reportType: string,
  startDate: string,
  endDate: string,
  accountId: string
) {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const params = new URLSearchParams({ format: "json" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (accountId) params.set("accountId", accountId);
  if (reportType !== "all") params.set("type", reportType.toUpperCase());

  const res = await fetch(`/api/reports/transactions?${params}`);
  const data = await res.json();

  if (!data.success || !data.data?.length) {
    throw new Error("Rapor için veri bulunamadı.");
  }

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("MoneyShop - İşlem Raporu", 14, 20);
  doc.setFontSize(10);
  doc.text(`Oluşturma: ${new Date().toLocaleDateString("tr-TR")}`, 14, 28);
  if (startDate && endDate) {
    doc.text(`Dönem: ${startDate} - ${endDate}`, 14, 34);
  }

  const typeLabels: Record<string, string> = {
    INCOME: "Gelir",
    EXPENSE: "Gider",
    TRANSFER: "Transfer",
  };

  const body = data.data.map((tx: Record<string, unknown>) => [
    new Date(tx.date as string).toLocaleDateString("tr-TR"),
    typeLabels[tx.type as string] || tx.type,
    (tx as { amount: number }).amount.toLocaleString("tr-TR", {
      style: "currency",
      currency: (tx as { currency: string }).currency,
    }),
    (tx.description as string) || "-",
    tx.status as string,
  ]);

  autoTable.default(doc, {
    startY: startDate && endDate ? 40 : 34,
    head: [["Tarih", "Tür", "Tutar", "Açıklama", "Durum"]],
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`moneyshop-rapor-${new Date().toISOString().split("T")[0]}.pdf`);
}

type ReportType = "all" | "income" | "expense" | "transfer";

interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

interface CategorySummary {
  name: string;
  total: number;
  count: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: ChartTooltipProps) {
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

function ReportsContent() {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const [reportType, setReportType] = useState<ReportType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    // Fetch dashboard summary data
    async function fetchSummary() {
      setLoadingSummary(true);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString().split("T")[0];
        const monthEnd = now.toISOString().split("T")[0];

        // Fetch this month's data for summary
        const params = new URLSearchParams({
          format: "json",
          startDate: monthStart,
          endDate: monthEnd,
        });
        const res = await fetch(`/api/reports/transactions?${params}`);
        const data = await res.json();

        if (data.success && data.data?.length) {
          const income = data.data
            .filter((tx: { type: string; status: string }) => tx.type === "INCOME" && tx.status === "COMPLETED")
            .reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);
          const expense = data.data
            .filter((tx: { type: string; status: string }) => tx.type === "EXPENSE" && tx.status === "COMPLETED")
            .reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);

          setSummary({
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            monthlyIncome: income,
            monthlyExpense: expense,
          });

              interface TxWithCategory {
                type: string;
                status: string;
                amount: number;
                category: { id: string; name: string; color: string } | null;
              }
              const catMap = new Map<string, CategorySummary>();
              const expenses = data.data.filter(
                (tx: TxWithCategory) =>
                  tx.type === "EXPENSE" && tx.status === "COMPLETED" && tx.category
              );
              for (const tx of expenses) {
                const cat = tx.category!;
            const existing = catMap.get(cat.id);
            if (existing) {
              existing.total += tx.amount;
              existing.count += 1;
            } else {
              catMap.set(cat.id, {
                name: cat.name,
                total: tx.amount,
                count: 1,
                color: cat.color || "#94a3b8",
              });
            }
          }
          setCategories(Array.from(catMap.values()).sort((a, b) => b.total - a.total));
        } else {
          setSummary({ totalIncome: 0, totalExpense: 0, balance: 0, monthlyIncome: 0, monthlyExpense: 0 });
        }
      } catch {
        // Silently fail for summary
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, []);

  const handleExportCSV = async () => {
    setExporting("csv");
    setError(null);
    setSuccess(null);
    try {
      const params = new URLSearchParams({ format: "csv" });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (accountId) params.set("accountId", accountId);
      if (reportType !== "all") params.set("type", reportType.toUpperCase());

      const res = await fetch(`/api/reports/transactions?${params}`);
      if (!res.ok) throw new Error("Rapor oluşturulamadı.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `islem-raporu-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess("CSV raporu indiriliyor...");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting("pdf");
    setError(null);
    setSuccess(null);
    try {
      await generatePDF(reportType, startDate, endDate, accountId);
      setSuccess("PDF raporu indiriliyor...");
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF oluşturulurken hata oluştu.");
    } finally {
      setExporting(null);
    }
  };

  const reportTypes: { value: ReportType; label: string }[] = [
    { value: "all", label: "Tüm İşlemler" },
    { value: "income", label: "Gelirler" },
    { value: "expense", label: "Giderler" },
    { value: "transfer", label: "Transferler" },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
        <h2 className="text-2xl font-bold text-text-primary">Finansal Raporlar</h2>
        <p className="text-sm text-text-muted mt-1">
          İşlem geçmişinizi görüntüleyin, CSV veya PDF olarak dışa aktarın
        </p>
      </div>
      </div>

      {/* Summary Cards - This Month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            {loadingSummary ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-profit" />
                  <p className="text-xs text-text-muted">Bu Ay Gelir</p>
                </div>
                <p className="text-xl font-bold text-profit">
                  {formatCurrency(summary?.monthlyIncome || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            {loadingSummary ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-loss" />
                  <p className="text-xs text-text-muted">Bu Ay Gider</p>
                </div>
                <p className="text-xl font-bold text-loss">
                  {formatCurrency(summary?.monthlyExpense || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            {loadingSummary ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-secondary" />
                  <p className="text-xs text-text-muted">Net Durum</p>
                </div>
                <p className={`text-xl font-bold ${(summary?.balance || 0) >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(summary?.balance || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {!loadingSummary && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                <CardTitle className="text-sm">Bu Ay Gelir/Gider</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: "Gelir", value: summary.monthlyIncome, fill: "#10b981" },
                    { name: "Gider", value: summary.monthlyExpense, fill: "#ef4444" },
                  ]}
                  barSize={80}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-b border-border">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Harcama Kategorileri</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {categories.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-sm text-text-muted">
                  Bu ay için harcama verisi bulunamadı
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={categories.slice(0, 6)}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categories.slice(0, 6).map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-text-muted">{value}</span>
                      )}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
          <CardTitle>
            <FileText className="w-5 h-5 inline mr-2" />
            Rapor Dışa Aktar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Rapor Türü
              </label>
              <div className="flex gap-2 flex-wrap">
                {reportTypes.map((rt) => (
                  <button
                    key={rt.value}
                    onClick={() => setReportType(rt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reportType === rt.value
                        ? "bg-secondary text-white"
                        : "bg-surface border border-border text-text-muted hover:bg-surface-tertiary"
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Hesap (Opsiyonel)
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">Tüm Hesaplar</option>
                {accounts?.map((acc: { id: string; name: string }) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleExportCSV}
                disabled={exporting !== null}
              >
                {exporting === "csv" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                CSV Olarak İndir
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exporting !== null}
                variant="outline"
              >
                {exporting === "pdf" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                PDF Olarak İndir
              </Button>
            </div>

            {/* Status Messages */}
            {success && (
              <div className="flex items-center gap-2 text-sm text-profit">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-loss">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ErrorBoundary>
      <ReportsContent />
    </ErrorBoundary>
  );
}
