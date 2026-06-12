"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  EmptyState,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { RecurringCreateForm } from "@/components/recurring/recurring-create-form";
import { useAccounts } from "@/hooks";
import { useCategories } from "@/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";
import {
  Repeat,
  Plus,
  Pause,
  Play,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import type { RecurringTransaction } from "@/types";

type TabType = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-profit/10 text-profit border-profit/20",
  PAUSED: "bg-pending/10 text-pending border-pending/20",
  COMPLETED: "bg-secondary/10 text-secondary border-secondary/20",
  CANCELLED: "bg-loss/10 text-loss border-loss/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  PAUSED: "Duraklatıldı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const frequencyLabels: Record<string, string> = {
  DAILY: "Her Gün",
  WEEKLY: "Haftalık",
  BIWEEKLY: "2 Haftada Bir",
  MONTHLY: "Aylık",
  QUARTERLY: "3 Ayda Bir",
  YEARLY: "Yıllık",
};

function RecurringList() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = async (status?: string) => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const res = await fetch(`/api/recurring-transactions${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data ?? []);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Veri alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab === "ACTIVE" ? undefined : activeTab);
  }, [activeTab]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/recurring-transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchItems(activeTab === "ACTIVE" ? undefined : activeTab);
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: TabType[] = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t("header.recurring") || "Tekrarlanan İşlemler"}</h2>
        <p className="text-sm text-text-muted mt-1">
          Otomatik tekrarlanan işlemlerinizi yönetin
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-secondary text-white"
                : "bg-surface border border-border text-text-muted hover:bg-surface-tertiary"
            }`}
          >
            {statusLabels[tab]}
          </button>
        ))}
      </div>

      {/* Create Button */}
      <Button onClick={() => setShowCreateForm(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Yeni Tekrarlanan İşlem
      </Button>

      {/* Create Form Modal */}
      <RecurringCreateForm
        show={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => fetchItems(activeTab === "ACTIVE" ? undefined : activeTab)}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="w-12 h-12 text-loss mb-4" />
            <p className="text-text-muted">{error}</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="overflow-hidden">
          <EmptyState
            icon={Repeat}
            title={activeTab === "ACTIVE"
              ? "Henüz tekrarlanan işlem bulunmuyor"
              : `"${statusLabels[activeTab]}" durumunda işlem bulunmuyor`}
            description={activeTab === "ACTIVE"
              ? "Düzenli gelir/giderlerinizi otomatikleştirmek için bir tekrarlanan işlem oluşturun."
              : undefined}
            action={activeTab === "ACTIVE" ? { label: "Yeni İşlem", onClick: () => setShowCreateForm(true), icon: Plus } : undefined}
            gradient="from-secondary to-indigo-600"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {item.description || `${frequencyLabels[item.frequency]} İşlem`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className={item.type === "INCOME" ? "text-profit font-medium" : "text-loss font-medium"}>
                        {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount, item.currency)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {frequencyLabels[item.frequency]}
                      </span>
                      {item.account && (
                        <span className="truncate max-w-[150px]">{item.account.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted/70">
                      <span>Sonraki: {formatDate(item.nextDate, "long")}</span>
                      {item.occurrenceCount > 0 && (
                        <span>{item.occurrenceCount} kez gerçekleşti</span>
                      )}
                      {item.totalOccurrences && (
                        <span>/ {item.totalOccurrences} tekrar</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.status === "ACTIVE" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "PAUSED")}
                        disabled={actionLoading === item.id}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-pending transition-colors"
                        title="Duraklat"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {item.status === "PAUSED" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "ACTIVE")}
                        disabled={actionLoading === item.id}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-profit transition-colors"
                        title="Devam Ettir"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {(item.status === "ACTIVE" || item.status === "PAUSED") && (
                      <button
                        onClick={() => handleStatusChange(item.id, "CANCELLED")}
                        disabled={actionLoading === item.id}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-loss transition-colors"
                        title="İptal Et"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecurringPage() {
  return (
    <ErrorBoundary>
      <RecurringList />
    </ErrorBoundary>
  );
}
