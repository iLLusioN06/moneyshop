"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "@/components/ui";
import {
  Repeat,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { FinancialAccount, Category, RecurringFrequency } from "@/types";

interface RecurringCreateFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const frequencies: { value: RecurringFrequency; label: string }[] = [
  { value: "DAILY", label: "Her Gün" },
  { value: "WEEKLY", label: "Haftalık" },
  { value: "BIWEEKLY", label: "2 Haftada Bir" },
  { value: "MONTHLY", label: "Aylık" },
  { value: "QUARTERLY", label: "3 Ayda Bir" },
  { value: "YEARLY", label: "Yıllık" },
];

const transactionTypes = [
  { value: "INCOME", label: "Gelir" },
  { value: "EXPENSE", label: "Gider" },
  { value: "TRANSFER", label: "Transfer" },
];

export function RecurringCreateForm({ show, onClose, onSuccess }: RecurringCreateFormProps) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("MONTHLY");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [totalOccurrences, setTotalOccurrences] = useState("");
  // Transfer fields
  const [transferRecipientName, setTransferRecipientName] = useState("");
  const [transferRecipientIban, setTransferRecipientIban] = useState("");
  const [transferRecipientBank, setTransferRecipientBank] = useState("");

  const fetchAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) setAccountId(data.data[0].id);
      }
    } catch {
      // silent
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      // silent
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchAccounts();
      fetchCategories();
      // Reset form
      setType("EXPENSE");
      setAmount("");
      setCategoryId("");
      setFrequency("MONTHLY");
      setDescription("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setTotalOccurrences("");
      setTransferRecipientName("");
      setTransferRecipientIban("");
      setTransferRecipientBank("");
      setError("");
    }
  }, [show, fetchAccounts, fetchCategories]);

  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountId) {
      setError("Lütfen bir hesap seçin.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Lütfen geçerli bir tutar girin.");
      return;
    }
    if (!startDate) {
      setError("Lütfen başlangıç tarihi seçin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        accountId,
        type,
        amount: parseFloat(amount),
        frequency,
        startDate: new Date(startDate).toISOString(),
        description: description.trim() || undefined,
      };

      if (categoryId && type !== "TRANSFER") {
        body.categoryId = categoryId;
      }
      if (endDate) {
        body.endDate = new Date(endDate).toISOString();
      }
      if (totalOccurrences) {
        body.totalOccurrences = parseInt(totalOccurrences, 10);
      }
      if (type === "TRANSFER") {
        if (transferRecipientName) body.transferRecipientName = transferRecipientName;
        if (transferRecipientIban) body.transferRecipientIban = transferRecipientIban;
        if (transferRecipientBank) body.transferRecipientBank = transferRecipientBank;
      }

      const res = await fetch("/api/recurring-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fade-in_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <CardTitle>Yeni Tekrarlanan İşlem</CardTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                İşlem Türü
              </label>
              <div className="flex gap-2">
                {transactionTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      type === t.value
                        ? "bg-secondary text-white"
                        : "bg-surface border border-border text-text-muted hover:bg-surface-tertiary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tutar
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Hesap
              </label>
              {accountsLoading ? (
                <div className="h-10 bg-surface-tertiary rounded-lg animate-pulse" />
              ) : accounts.length === 0 ? (
                <p className="text-sm text-loss">Henüz hesabınız yok.</p>
              ) : (
                <select
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category (only for INCOME/EXPENSE) */}
            {type !== "TRANSFER" && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Kategori <span className="text-text-muted font-normal">(isteğe bağlı)</span>
                </label>
                {categoriesLoading ? (
                  <div className="h-10 bg-surface-tertiary rounded-lg animate-pulse" />
                ) : (
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Kategori seçin</option>
                    {categories
                      .filter((c) => c.type === type)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            )}

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Sıklık
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              >
                {frequencies.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Açıklama <span className="text-text-muted font-normal">(isteğe bağlı)</span>
              </label>
              <Input
                placeholder="Açıklama girin..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Bitiş Tarihi <span className="text-text-muted font-normal">(opsiyonel)</span>
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Total Occurrences */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tekrar Sayısı <span className="text-text-muted font-normal">(boş = sınırsız)</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Örn: 12"
                value={totalOccurrences}
                onChange={(e) => setTotalOccurrences(e.target.value)}
              />
            </div>

            {/* Transfer fields */}
            {type === "TRANSFER" && (
              <div className="space-y-4 p-4 rounded-lg bg-surface-tertiary/30 border border-border">
                <p className="text-sm font-medium text-text-primary">Transfer Bilgileri</p>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Alıcı Adı
                  </label>
                  <Input
                    placeholder="Ad Soyad"
                    value={transferRecipientName}
                    onChange={(e) => setTransferRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    IBAN
                  </label>
                  <Input
                    placeholder="TR00 0000 0000 0000 0000 0000"
                    value={transferRecipientIban}
                    onChange={(e) => setTransferRecipientIban(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Banka
                  </label>
                  <Input
                    placeholder="Banka adı"
                    value={transferRecipientBank}
                    onChange={(e) => setTransferRecipientBank(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary hover:bg-secondary/90"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Repeat className="w-4 h-4 mr-2" />
                    Oluştur
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
