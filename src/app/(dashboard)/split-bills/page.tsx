"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  Check,
  Receipt,
  Filter,
} from "lucide-react";

interface SplitBillParticipant {
  id: string;
  name: string;
  email: string | null;
  userId: string | null;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
}

interface SplitBill {
  id: string;
  title: string;
  description: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  category: string | null;
  date: string;
  participants: SplitBillParticipant[];
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  PARTIAL: { label: "Kısmi", color: "bg-blue-100 text-blue-800", icon: AlertTriangle },
  SETTLED: { label: "Kapandı", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  CANCELLED: { label: "İptal", color: "bg-gray-100 text-gray-800", icon: X },
};

const CATEGORIES = [
  "Yemek", "Ulaşım", "Konaklama", "Alışveriş", "Eğlence", "Fatura", "Diğer",
];

export default function SplitBillsPage() {
  const [bills, setBills] = useState<SplitBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SplitBill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    totalAmount: "",
    currency: "IQD",
    category: "",
    date: new Date().toISOString().split("T")[0],
    participants: [{ name: "", email: "", amount: "" }] as { name: string; email: string; amount: string }[],
  });

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/split-bills");
      const result = await res.json();
      if (result.success) {
        setBills(result.data);
      } else {
        setError(result.error || "Ortak hesaplar alınamadı.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchBills();
    }, 0);
  }, [fetchBills]);

  function resetForm() {
    setForm({
      title: "",
      description: "",
      totalAmount: "",
      currency: "IQD",
      category: "",
      date: new Date().toISOString().split("T")[0],
      participants: [{ name: "", email: "", amount: "" }],
    });
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  function openEditModal(bill: SplitBill) {
    setForm({
      title: bill.title,
      description: bill.description || "",
      totalAmount: String(bill.totalAmount),
      currency: bill.currency,
      category: bill.category || "",
      date: new Date(bill.date).toISOString().split("T")[0],
      participants: bill.participants.map((p) => ({
        name: p.name,
        email: p.email || "",
        amount: String(p.amount),
      })),
    });
    setSelectedBill(bill);
    setShowEditModal(true);
  }

  function openDeleteModal(bill: SplitBill) {
    setSelectedBill(bill);
    setShowDeleteModal(true);
  }

  function addParticipant() {
    setForm((prev) => ({
      ...prev,
      participants: [...prev.participants, { name: "", email: "", amount: "" }],
    }));
  }

  function removeParticipant(index: number) {
    if (form.participants.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index),
    }));
  }

  function updateParticipant(index: number, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.totalAmount || Number(form.totalAmount) <= 0) return;
    if (form.participants.some((p) => !p.name.trim() || !p.amount || Number(p.amount) <= 0)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/split-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          totalAmount: Number(form.totalAmount),
          currency: form.currency,
          category: form.category || null,
          date: form.date,
          participants: form.participants.map((p) => ({
            name: p.name,
            email: p.email || null,
            amount: Number(p.amount),
          })),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowCreateModal(false);
        fetchBills();
      }
    } catch {
      // Hata
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedBill || !form.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/split-bills/${selectedBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          totalAmount: Number(form.totalAmount),
          currency: form.currency,
          category: form.category || null,
          date: form.date,
          participants: form.participants.map((p, i) => ({
            name: p.name,
            email: p.email || null,
            amount: Number(p.amount),
            isPaid: selectedBill.participants[i]?.isPaid || false,
          })),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowEditModal(false);
        setSelectedBill(null);
        fetchBills();
      }
    } catch {
      // Hata
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedBill) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/split-bills/${selectedBill.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedBill(null);
        fetchBills();
      }
    } catch {
      // Hata
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkPaid(billId: string, participantId: string, isPaid: boolean) {
    try {
      const res = await fetch(`/api/split-bills/${billId}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid }),
      });
      const result = await res.json();
      if (result.success) {
        fetchBills();
      }
    } catch {
      // Hata
    }
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.title.toLowerCase().includes(search.toLowerCase()) ||
      bill.description?.toLowerCase().includes(search.toLowerCase()) ||
      bill.participants.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === "PENDING").length,
    settled: bills.filter((b) => b.status === "SETTLED").length,
    totalAmount: bills.reduce((sum, b) => sum + Number(b.totalAmount), 0),
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Ortak Hesap</h1>
            <p className="text-text-muted mt-1">Arkadaşlarınızla harcamalarınızı paylaşın</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Ortak Hesap
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Toplam</p>
                  <p className="text-lg font-semibold text-text-primary">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Bekliyor</p>
                  <p className="text-lg font-semibold text-text-primary">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Kapandı</p>
                  <p className="text-lg font-semibold text-text-primary">{stats.settled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Toplam Tutar</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatCurrency(stats.totalAmount, "IQD")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Ortak hesap ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="ALL">Tüm Durumlar</option>
                  <option value="PENDING">Bekliyor</option>
                  <option value="PARTIAL">Kısmi Ödeme</option>
                  <option value="SETTLED">Kapandı</option>
                  <option value="CANCELLED">İptal</option>
                </select>
              </div>
              <Button variant="outline" onClick={fetchBills}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        {loading ? (
          <Card>
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-text-primary font-medium">{error}</p>
              <Button variant="outline" onClick={fetchBills} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        ) : filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-primary font-medium">Ortak hesap bulunamadı</p>
              <p className="text-text-muted text-sm mt-1">
                {search ? "Arama kriterlerinize uygun sonuç yok" : "Henüz ortak hesap oluşturmamışsınız"}
              </p>
              {!search && (
                <Button onClick={openCreateModal} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Ortak Hesabı Oluştur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => {
              const statusConfig = STATUS_CONFIG[bill.status as keyof typeof STATUS_CONFIG];
              const paidCount = bill.participants.filter((p) => p.isPaid).length;
              const totalCount = bill.participants.length;

              return (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary truncate">
                            {bill.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                            {statusConfig?.label}
                          </span>
                          {bill.category && (
                            <Badge>{bill.category}</Badge>
                          )}
                        </div>
                        {bill.description && (
                          <p className="text-text-muted text-sm mb-3">{bill.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <Receipt className="w-4 h-4" />
                            {formatCurrency(bill.totalAmount, bill.currency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {paidCount}/{totalCount} ödedi
                          </span>
                          <span>{new Date(bill.date).toLocaleDateString("tr-TR")}</span>
                        </div>

                        {/* Participants */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {bill.participants.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                p.isPaid
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-surface-secondary text-text-primary border border-border"
                              }`}
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="text-text-muted">
                                {formatCurrency(p.amount, bill.currency)}
                              </span>
                              {p.isPaid ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <button
                                  onClick={() => handleMarkPaid(bill.id, p.id, true)}
                                  className="text-secondary hover:text-secondary/80"
                                  title="Ödendi olarak işaretle"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(bill)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(bill)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">Yeni Ortak Hesap</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Başlık *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Örn: Akşam Yemeği"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Açıklama</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Opsiyonel açıklama"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Toplam Tutar *</label>
                      <input
                        type="number"
                        value={form.totalAmount}
                        onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Para Birimi</label>
                      <select
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      >
                        <option value="IQD">IQD</option>
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Kategori</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      >
                        <option value="">Kategori Seçin</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Tarih</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-primary">Katılımcılar *</label>
                      <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.participants.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateParticipant(i, "name", e.target.value)}
                            placeholder="İsim *"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          <input
                            type="email"
                            value={p.email}
                            onChange={(e) => updateParticipant(i, "email", e.target.value)}
                            placeholder="E-posta"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          <input
                            type="number"
                            value={p.amount}
                            onChange={(e) => updateParticipant(i, "amount", e.target.value)}
                            placeholder="Tutar *"
                            className="w-28 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          {form.participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(i)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreate} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">Ortak Hesap Düzenle</h2>
                  <button onClick={() => setShowEditModal(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Başlık *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Açıklama</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Toplam Tutar *</label>
                      <input
                        type="number"
                        value={form.totalAmount}
                        onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Para Birimi</label>
                      <select
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      >
                        <option value="IQD">IQD</option>
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Kategori</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      >
                        <option value="">Kategori Seçin</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Tarih</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-primary">Katılımcılar *</label>
                      <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.participants.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateParticipant(i, "name", e.target.value)}
                            placeholder="İsim *"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          <input
                            type="email"
                            value={p.email}
                            onChange={(e) => updateParticipant(i, "email", e.target.value)}
                            placeholder="E-posta"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          <input
                            type="number"
                            value={p.amount}
                            onChange={(e) => updateParticipant(i, "amount", e.target.value)}
                            placeholder="Tutar *"
                            className="w-28 px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          />
                          {form.participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(i)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleEdit} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedBill && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Ortak Hesabı Sil</h3>
                  <p className="text-text-muted mb-6">
                    <strong>{selectedBill.title}</strong> ortak hesabını silmek istediğinize emin misiniz?
                    <br />
                    Bu işlem geri alınamaz.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                      İptal
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
