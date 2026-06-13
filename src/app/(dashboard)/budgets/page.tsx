"use client";

import { useState, useEffect, useCallback } from "react";
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
import { formatCurrency, cn } from "@/lib/utils";
import { BUDGET_PERIODS } from "@/lib/constants";
import Link from "next/link";
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Tags,
} from "lucide-react";
import type { Budget, Category } from "@/types";

interface BudgetWithCategory extends Budget {
  category?: Category;
  spent: number;
  progress: number;
}

interface BudgetForm {
  categoryId: string;
  amount: string;
  currency: string;
  period: string;
}

const emptyForm: BudgetForm = {
  categoryId: "",
  amount: "",
  currency: "TRY",
  period: "MONTHLY",
};

const periodLabels: Record<string, string> = {
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [budgetRes, catRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories"),
      ]);
      const budgetData = await budgetRes.json();
      const catData = await catRes.json();

      if (budgetData.success) {
        const enriched = budgetData.data.map((b: Budget) => {
          const progress = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
          return { ...b, progress };
        });
        setBudgets(enriched);
      } else {
        setError(budgetData.error || "Bütçeler alınamadı.");
      }

      if (catData.success) {
        setCategories(catData.data);
      }
    } catch {
      setError("Veriler alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: expenseCategories[0]?.id || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (budget: BudgetWithCategory) => {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      currency: budget.currency,
      period: budget.period,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.categoryId || !form.amount) {
      setFormError("Kategori ve bütçe tutarı zorunludur.");
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      setFormError("Bütçe tutarı 0'dan büyük olmalıdır.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const url = editingId ? `/api/budgets/${editingId}` : "/api/budgets";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: form.categoryId,
          amount: parseFloat(form.amount),
          currency: form.currency,
          period: form.period,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Bir hata oluştu.");
        return;
      }

      setShowModal(false);
      fetchAll();
    } catch {
      setFormError("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Silinirken bir hata oluştu.");
        return;
      }
      setDeleteId(null);
      fetchAll();
    } catch {
      setError("Silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-loss";
    if (progress >= 80) return "bg-pending";
    return "bg-secondary";
  };

  const getProgressText = (progress: number) => {
    if (progress >= 100) return "text-loss";
    if (progress >= 80) return "text-pending";
    return "text-profit";
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Bütçeler</h2>
          <p className="text-sm text-text-muted mt-1">
            {budgets.length} aktif bütçe
          </p>
        </div>
        <Button onClick={openAddModal} disabled={expenseCategories.length === 0}>
          <Plus className="w-4 h-4" />
          Yeni Bütçe
        </Button>
      </div>

      {!expenseCategories.length && !isLoading && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-pending/10 border border-pending/20 text-sm text-pending">
          <span>Bütçe oluşturmak için önce gider kategorisi eklemelisiniz.</span>
          <Link
            href="/categories"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pending/20 hover:bg-pending/30 text-pending font-medium transition-colors"
          >
            <Tags className="w-3.5 h-3.5" />
            Kategori Ekle
          </Link>
        </div>
      )}

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

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-tertiary rounded w-1/3" />
                  <div className="h-2 bg-surface-tertiary rounded-full" />
                  <div className="h-4 bg-surface-tertiary rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        /* Empty */
        <Card className="overflow-hidden">
          <EmptyState
            icon={PiggyBank}
            title="Henüz bütçe oluşturulmamış"
            description="Harcamalarınızı kontrol altına almak için bütçe oluşturun."
            action={expenseCategories.length > 0 ? { label: "İlk Bütçeyi Oluştur", onClick: openAddModal, icon: Plus } : undefined}
          />
        </Card>
      ) : (
        /* Budget Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const remaining = budget.amount - budget.spent;
            const isOver = remaining < 0;

            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: budget.category?.color || "#94a3b8" }}
                      >
                        {budget.category?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {budget.category?.name || "Kategori"}
                        </h3>
                        <Badge variant="default" size="sm">
                          {periodLabels[budget.period] || budget.period}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(budget)}
                        className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(budget.id)}
                        className="p-1.5 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        {formatCurrency(budget.spent)} harcandı
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          getProgressText(budget.progress)
                        )}
                      >
                        %{Math.round(budget.progress)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getProgressColor(budget.progress)
                        )}
                        style={{ width: `${Math.min(budget.progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        Kalan:{" "}
                        <span className={isOver ? "text-loss font-medium" : "font-medium"}>
                          {isOver
                            ? formatCurrency(Math.abs(remaining)) + " aşım"
                            : formatCurrency(remaining)}
                        </span>
                      </span>
                      <span>Bütçe: {formatCurrency(budget.amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingId ? "Bütçeyi Düzenle" : "Yeni Bütçe"}
                </CardTitle>
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
                    Kategori
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Kategori Seçin</option>
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Bütçe Tutarı"
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
                    Periyot
                  </label>
                  <div className="flex gap-2">
                    {BUDGET_PERIODS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setForm({ ...form, period: p.value })}
                        className={cn(
                          "flex-1 h-10 rounded-lg border text-sm font-medium transition-all",
                          form.period === p.value
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-border bg-surface text-text-secondary hover:border-border"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Para Birimi
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="TRY">₺ Türk Lirası</option>
                    <option value="USD">$ Dolar</option>
                    <option value="EUR">€ Euro</option>
                  </select>
                </div>

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
                    <Check className="w-4 h-4" />
                    {editingId ? "Güncelle" : "Oluştur"}
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
                Bütçeyi Sil
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Bu bütçeyi silmek istediğinize emin misiniz?
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
                  onClick={() => handleDelete(deleteId!)}
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
