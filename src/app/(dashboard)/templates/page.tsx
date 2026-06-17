"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";
import {
  Search,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ArrowRight,
  Star,
  Repeat,
  Send,
} from "lucide-react";

interface TransactionTemplate {
  id: string;
  name: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  recipientName: string | null;
  recipientIban: string | null;
  recipientBank: string | null;
  recipientUserId: string | null;
  categoryId: string | null;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TransactionTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: "",
    type: "TRANSFER",
    amount: "",
    currency: "IQD",
    description: "",
    recipientName: "",
    recipientIban: "",
    recipientBank: "",
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transaction-templates");
      const result = await res.json();
      if (result.success) {
        setTemplates(result.data);
      } else {
        setError(result.error || "Şablonlar alınamadı.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchTemplates();
    }, 0);
  }, [fetchTemplates]);

  async function handleCreate() {
    if (!form.name.trim() || !form.amount || Number(form.amount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transaction-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchTemplates();
      } else {
        alert(result.error || "Şablon oluşturulamadı.");
      }
    } catch {
      alert("Şablon oluşturulurken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/transaction-templates/${selectedTemplate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowEditModal(false);
        setSelectedTemplate(null);
        resetForm();
        fetchTemplates();
      } else {
        alert(result.error || "Şablon güncellenemedi.");
      }
    } catch {
      alert("Şablon güncellenirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/transaction-templates/${selectedTemplate.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedTemplate(null);
        fetchTemplates();
      } else {
        alert(result.error || "Şablon silinemedi.");
      }
    } catch {
      alert("Şablon silinirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleFavorite(template: TransactionTemplate) {
    try {
      await fetch(`/api/transaction-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !template.isFavorite }),
      });
      fetchTemplates();
    } catch {
      // silent
    }
  }

  function resetForm() {
    setForm({
      name: "",
      type: "TRANSFER",
      amount: "",
      currency: "IQD",
      description: "",
      recipientName: "",
      recipientIban: "",
      recipientBank: "",
    });
  }

  function openEditModal(template: TransactionTemplate) {
    setSelectedTemplate(template);
    setForm({
      name: template.name,
      type: template.type,
      amount: String(template.amount),
      currency: template.currency,
      description: template.description || "",
      recipientName: template.recipientName || "",
      recipientIban: template.recipientIban || "",
      recipientBank: template.recipientBank || "",
    });
    setShowEditModal(true);
  }

  function openDeleteModal(template: TransactionTemplate) {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  }

  function applyTemplate(template: TransactionTemplate) {
    const params = new URLSearchParams({
      template: template.id,
      name: template.recipientName || "",
      amount: String(template.amount),
      currency: template.currency,
      description: template.description || "",
    });
    router.push(`/transfers/fast?${params.toString()}`);
  }

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.recipientName?.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filtered.filter((t) => t.isFavorite);
  const others = filtered.filter((t) => !t.isFavorite);

  const typeLabels: Record<string, string> = {
    TRANSFER: "Transfer",
    INCOME: "Gelir",
    EXPENSE: "Gider",
  };

  const typeColors: Record<string, string> = {
    TRANSFER: "bg-secondary/10 text-secondary border-secondary/20",
    INCOME: "bg-profit/10 text-profit border-profit/20",
    EXPENSE: "bg-loss/10 text-loss border-loss/20",
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col flex-1 min-h-0 gap-4 animate-[fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{t("nav.templates")}</h2>
              <p className="text-sm text-text-muted mt-1">
                {templates.length > 0
                  ? `${templates.length} şablonunuz var`
                  : "Sık kullandığınız işlemleri şablon olarak kaydedin"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTemplates} isLoading={loading}>
              <RefreshCw className="w-4 h-4" />
              Yenile
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              <Plus className="w-4 h-4" />
              Yeni Şablon
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={fetchTemplates} className="ml-auto">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Şablon veya alıcı adı ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card className="overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent px-5 py-3 border-b border-border flex-shrink-0">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-secondary" />
              Şablonlar
            </h3>
          </div>
          <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-muted flex-1 flex flex-col items-center justify-center gap-3">
                <Bookmark className="w-10 h-10 text-text-muted/50" />
                <p>{search ? "Aramanıza uygun şablon bulunamadı." : "Henüz şablonunuz yok."}</p>
                {!search && (
                  <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                    <Plus className="w-4 h-4" />
                    İlk Şablonunuzu Oluşturun
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-auto flex-1 min-h-0 p-4 space-y-4">
                {/* Favorites */}
                {favorites.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Favoriler
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {favorites.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          typeLabels={typeLabels}
                          typeColors={typeColors}
                          onApply={applyTemplate}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Others */}
                {others.length > 0 && (
                  <div>
                    {favorites.length > 0 && (
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Diğer Şablonlar
                      </h4>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {others.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          typeLabels={typeLabels}
                          typeColors={typeColors}
                          onApply={applyTemplate}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <TemplateModal
            title="Yeni Şablon Oluştur"
            form={form}
            setForm={setForm}
            onSubmit={handleCreate}
            onClose={() => { setShowCreateModal(false); resetForm(); }}
            submitting={submitting}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedTemplate && (
          <TemplateModal
            title="Şablonu Düzenle"
            form={form}
            setForm={setForm}
            onSubmit={handleEdit}
            onClose={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }}
            submitting={submitting}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-loss">Şablonu Sil</h2>
                <button onClick={() => { setShowDeleteModal(false); setSelectedTemplate(null); }} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-muted">
                  <strong>{selectedTemplate.name}</strong> şablonunu silmek istediğinize emin misiniz?
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
                <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedTemplate(null); }}>
                  İptal
                </Button>
                <Button variant="danger" onClick={handleDelete} isLoading={submitting}>
                  <Trash2 className="w-4 h-4" />
                  Sil
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// ─── Template Card Component ────────────────────────────────

function TemplateCard({
  template,
  typeLabels,
  typeColors,
  onApply,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  template: TransactionTemplate;
  typeLabels: Record<string, string>;
  typeColors: Record<string, string>;
  onApply: (t: TransactionTemplate) => void;
  onEdit: (t: TransactionTemplate) => void;
  onDelete: (t: TransactionTemplate) => void;
  onToggleFavorite: (t: TransactionTemplate) => void;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-surface hover:shadow-md transition-all duration-200 p-4">
      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(template)}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-surface-tertiary transition-colors"
        title={template.isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {template.isFavorite ? (
          <BookmarkCheck className="w-4 h-4 text-secondary" />
        ) : (
          <Bookmark className="w-4 h-4 text-text-muted" />
        )}
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <Repeat className="w-5 h-5 text-secondary" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-text-primary truncate">{template.name}</h4>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[template.type] || typeColors.TRANSFER}`}>
            {typeLabels[template.type] || template.type}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <p className="text-lg font-bold text-text-primary">
          {formatCurrency(template.amount, template.currency)}
        </p>
        {template.recipientName && (
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Send className="w-3 h-3" />
            {template.recipientName}
          </p>
        )}
        {template.description && (
          <p className="text-xs text-text-muted truncate">{template.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-text-muted">
          {template.usageCount} kez kullanıldı
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApply(template)}
            title="Uygula"
          >
            <ArrowRight className="w-4 h-4 text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(template)}
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template)}
            title="Sil"
          >
            <Trash2 className="w-4 h-4 text-loss" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Template Modal Component ────────────────────────────────

function TemplateModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  submitting,
}: {
  title: string;
  form: {
    name: string;
    type: string;
    amount: string;
    currency: string;
    description: string;
    recipientName: string;
    recipientIban: string;
    recipientBank: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Şablon Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Kira Ödemesi"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tür</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="TRANSFER">Transfer</option>
                <option value="INCOME">Gelir</option>
                <option value="EXPENSE">Gider</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Para Birimi</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="IQD">IQD</option>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tutar *</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Alıcı Adı</label>
            <input
              type="text"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              placeholder="Alıcı adı (opsiyonel)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Açıklama</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="İşlem açıklaması (opsiyonel)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={onSubmit} isLoading={submitting} disabled={!form.name.trim() || !form.amount || Number(form.amount) <= 0}>
            <Bookmark className="w-4 h-4" />
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
