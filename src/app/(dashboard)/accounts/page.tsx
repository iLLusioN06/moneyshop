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
import { formatCurrency, getAccountTypeColor, cn } from "@/lib/utils";
import { ACCOUNT_TYPES, CURRENCIES } from "@/lib/constants";
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Building2,
  PiggyBank,
  CreditCard,
  ChartLine,
  Banknote,
  HandCoins,
  ArrowLeft,
} from "lucide-react";
import type { FinancialAccount } from "@/types";

const typeIcons: Record<string, React.ElementType> = {
  CHECKING: Building2,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  INVESTMENT: ChartLine,
  CASH: Banknote,
  LOAN: HandCoins,
};

const typeLabels: Record<string, string> = {
  CHECKING: "Vadesiz Hesap",
  SAVINGS: "Vadeli Hesap",
  CREDIT_CARD: "Kredi Kartı",
  INVESTMENT: "Yatırım",
  CASH: "Nakit",
  LOAN: "Kredi",
};

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  "#14b8a6", "#f97316", "#6366f1", "#d946ef",
];

interface AccountForm {
  name: string;
  type: string;
  balance: string;
  currency: string;
  color: string;
}

const emptyForm: AccountForm = {
  name: "",
  type: "CHECKING",
  balance: "0",
  currency: "TRY",
  color: "#3b82f6",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      } else {
        setError(data.error || "Hesaplar alınamadı.");
      }
    } catch {
      setError("Hesaplar alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (account: FinancialAccount) => {
    setEditingId(account.id);
    setForm({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      color: account.color || "#3b82f6",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Hesap adı zorunludur.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const url = editingId ? `/api/accounts/${editingId}` : "/api/accounts";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          balance: parseFloat(form.balance) || 0,
          currency: form.currency,
          color: form.color,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Bir hata oluştu.");
        return;
      }

      setShowModal(false);
      fetchAccounts();
    } catch {
      setFormError("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Silinirken bir hata oluştu.");
        return;
      }
      setDeleteId(null);
      fetchAccounts();
    } catch {
      setError("Silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const router = useRouter();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
          <h2 className="text-2xl font-bold text-text-primary">Hesaplar</h2>
          <p className="text-sm text-text-muted mt-1">
            Toplam bakiye:{" "}
            <span className="font-semibold text-text-primary">
              {formatCurrency(totalBalance)}
            </span>
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Hesap Ekle
        </Button>
        </div>
      </div>

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

      {/* Loading */}            {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-tertiary rounded w-1/3" />
                  <div className="h-8 bg-surface-tertiary rounded w-1/2" />
                  <div className="h-3 bg-surface-tertiary rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        /* Empty */
        <Card className="overflow-hidden">
          <EmptyState
            icon={Wallet}
            title="Henüz hesap eklenmemiş"
            description="Finansal durumunuzu takip etmek için ilk hesabınızı ekleyin."
            action={{ label: "Hesap Ekle", onClick: openAddModal, icon: Plus }}
          />
        </Card>
      ) : (
        /* Account Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const Icon = typeIcons[account.type] || Wallet;
            const isNegative = account.balance < 0;
            const creditCardType = account.type === "CREDIT_CARD";

            return (
              <Card
                key={account.id}
                className={cn(
                  "hover:shadow-lg transition-all duration-200 overflow-hidden",
                  !account.isActive && "opacity-60"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: account.color || getAccountTypeColor(account.type) }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {account.name}
                        </h3>
                        <Badge variant="default" size="sm">
                          {typeLabels[account.type] || account.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(account)}
                        className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(account.id)}
                        className="p-1.5 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        isNegative ? "text-loss" : "text-text-primary"
                      )}
                    >
                      {creditCardType
                        ? formatCurrency(Math.abs(account.balance), account.currency)
                        : formatCurrency(account.balance, account.currency)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {creditCardType ? "Borç" : "Bakiye"} · {account.currency}
                    </p>
                  </div>

                  {!account.isActive && (
                    <Badge variant="warning" size="sm" className="mt-2">
                      Pasif
                    </Badge>
                  )}
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
                  {editingId ? "Hesabı Düzenle" : "Yeni Hesap"}
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
                  label="Hesap Adı"
                  placeholder="Vadesiz Hesap"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Hesap Türü
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Bakiye"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Para Birimi
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    Renk
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          form.color === color
                            ? "ring-2 ring-offset-2 ring-secondary scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
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
          <Card className="w-full max-w-sm overflow-hidden">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-loss mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                Hesabı Sil
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Bu hesabı devre dışı bırakmak istediğinize emin misiniz?
                İşlemler silinmez, sadece hesap pasifleştirilir.
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
                  Devre Dışı Bırak
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
