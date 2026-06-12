"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  CardSkeleton,
  EmptyState,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { useCategories } from "@/hooks";
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Circle,
  RefreshCw,
} from "lucide-react";
import type { Category } from "@/types";

const COLORS = [
  { value: "#10b981", label: "Yeşil" },
  { value: "#3b82f6", label: "Mavi" },
  { value: "#f59e0b", label: "Sarı" },
  { value: "#ef4444", label: "Kırmızı" },
  { value: "#8b5cf6", label: "Mor" },
  { value: "#ec4899", label: "Pembe" },
  { value: "#06b6d4", label: "Turkuaz" },
  { value: "#84cc16", label: "Limon" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Turuncu" },
  { value: "#6366f1", label: "İndigo" },
  { value: "#94a3b8", label: "Gri" },
];

const ICONS = [
  "circle", "wallet", "home", "shopping-cart", "car",
  "heart", "book", "gamepad", "chart-line", "credit-card",
  "piggy-bank", "file-invoice", "plus-circle", "minus-circle",
];

const typeLabels: Record<string, string> = {
  INCOME: "Gelir",
  EXPENSE: "Gider",
};

interface CategoryForm {
  name: string;
  type: string;
  color: string;
  icon: string;
}

const emptyForm: CategoryForm = {
  name: "",
  type: "EXPENSE",
  color: "#94a3b8",
  icon: "circle",
};

export default function CategoriesPage() {
  const { data: categories, isLoading, error: fetchError, refetch } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const safeCategories = categories || [];
  const incomeCategories = safeCategories.filter((c) => c.type === "INCOME");
  const expenseCategories = safeCategories.filter((c) => c.type === "EXPENSE");

  const openAddModal = (type: string = "EXPENSE") => {
    setEditingId(null);
    setForm({ ...emptyForm, type });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Kategori adı zorunludur.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Bir hata oluştu.");
        return;
      }

      setShowModal(false);
      refetch();
    } catch {
      setFormError("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setDeleteError(data.error || "Silinirken bir hata oluştu.");
        return;
      }
      setDeleteId(null);
      refetch();
    } catch {
      setDeleteError("Silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const CategoryCard = ({
    category,
    onEdit,
    onDelete,
  }: {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-secondary/30 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: category.color }}
        >
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{category.name}</p>
          <Badge
            variant={category.type === "INCOME" ? "success" : "default"}
            size="sm"
          >
            {typeLabels[category.type]}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!category.isDefault && (
          <>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
              title="Düzenle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        {category.isDefault && (
          <Badge variant="info" size="sm">Varsayılan</Badge>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Kategoriler</h2>
          <p className="text-sm text-text-muted mt-1">
            {safeCategories.length} kategori
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openAddModal("INCOME")}>
            <Plus className="w-4 h-4" />
            Gelir Kategorisi
          </Button>
          <Button onClick={() => openAddModal("EXPENSE")}>
            <Plus className="w-4 h-4" />
            Gider Kategorisi
          </Button>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
          <button onClick={() => refetch()} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Categories */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
              <CardTitle>Gelir Kategorileri</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeCategories.length === 0 ? (
                <div className="py-4">
                  <EmptyState
                    icon={Plus}
                    title="Henüz gelir kategorisi yok"
                    description="Gelirlerinizi kategorize etmek için ekleyin."
                    action={{ label: "Ekle", onClick: () => openAddModal("INCOME"), icon: Plus }}
                    gradient="from-profit to-emerald-600"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {incomeCategories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onEdit={() => openEditModal(cat)}
                      onDelete={() => setDeleteId(cat.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
              <CardTitle>Gider Kategorileri</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length === 0 ? (
                <div className="py-4">
                  <EmptyState
                    icon={Plus}
                    title="Henüz gider kategorisi yok"
                    description="Giderlerinizi kategorize etmek için ekleyin."
                    action={{ label: "Ekle", onClick: () => openAddModal("EXPENSE"), icon: Plus }}
                    gradient="from-loss to-rose-600"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {expenseCategories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onEdit={() => openEditModal(cat)}
                      onDelete={() => setDeleteId(cat.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingId ? "Kategori Düzenle" : "Yeni Kategori"}
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

                <Input
                  label="Kategori Adı"
                  placeholder="Kategori adı"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Tür
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="INCOME">Gelir</option>
                    <option value="EXPENSE">Gider</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Renk
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setForm({ ...form, color: c.value })}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          form.color === c.value
                            ? "ring-2 ring-offset-2 ring-secondary scale-110"
                            : "hover:scale-110"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
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
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-loss mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                Kategoriyi Sil
              </h3>
              {deleteError && (
                <div className="shake-alert mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                  {deleteError}
                </div>
              )}
              <p className="text-sm text-text-muted mb-6">
                Bu kategoriyi silmek istediğinize emin misiniz? Kategoriye bağlı
                işlemler silinmez, kategorisiz kalır.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setDeleteId(null); setDeleteError(""); }}
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
    </ErrorBoundary>
  );
}
