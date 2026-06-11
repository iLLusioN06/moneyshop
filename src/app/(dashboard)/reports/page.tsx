"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAccounts } from "@/hooks";
import { t } from "@/lib/dashboard-i18n";
import {
  FileDown,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

  // Title
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

function ReportsContent() {
  const { data: accounts } = useAccounts();
  const [reportType, setReportType] = useState<ReportType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Finansal Raporlar</h2>
        <p className="text-sm text-text-muted mt-1">
          İşlem geçmişinizi CSV veya PDF olarak dışa aktarın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="w-5 h-5 inline mr-2" />
            Rapor Oluştur
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
