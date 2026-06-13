"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import {
  X,
  FileDown,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, FinancialAccount, Category } from "@/types";

// ─── Types ───────────────────────────────────────────────

interface DekontModalProps {
  transactionId: string;
  onClose: () => void;
}

interface DekontData {
  transaction: Transaction & {
    account?: FinancialAccount | null;
    category?: Category | null;
  };
  userName: string;
  referenceNo: string;
}

// ─── Type Helpers ────────────────────────────────────────

const typeLabels: Record<string, string> = {
  INCOME: "Gelir",
  EXPENSE: "Gider",
  TRANSFER: "Para Transferi",
};

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

// ─── Component ───────────────────────────────────────────

export default function DekontModal({ transactionId, onClose }: DekontModalProps) {
  const [data, setData] = useState<DekontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/transactions/${transactionId}/dekont`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "Dekont alınamadı.");
        }
      })
      .catch(() => setError("Dekont alınırken hata oluştu."))
      .finally(() => setLoading(false));
  }, [transactionId]);

  const handleDownload = () => {
    window.open(`/api/transactions/${transactionId}/dekont?format=pdf`, "_blank");
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    setEmailError("");
    try {
      const res = await fetch(`/api/transactions/${transactionId}/dekont`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        setEmailError(data.message || data.error || "Gönderilemedi.");
      }
    } catch {
      setEmailError("E-posta gönderilirken hata oluştu.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyRef = () => {
    if (data?.referenceNo) {
      navigator.clipboard.writeText(data.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg overflow-hidden animate-[fade-in_0.2s_ease-out]">
        <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-secondary" />
              İşlem Dekontu
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            </div>
          ) : data ? (
            <>
              {/* Receipt Content */}
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-lg font-bold text-text-primary">MoneyShop</h3>
                  <p className="text-xs text-text-muted mt-0.5">İşlem Dekontu</p>
                </div>

                {/* Type Badge */}
                <div className="flex justify-center">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${typeBg[data.transaction.type]} ${typeColors[data.transaction.type]}`}
                  >
                    {data.transaction.type === "INCOME" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {typeLabels[data.transaction.type] || data.transaction.type}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p
                    className={`text-3xl font-bold ${typeColors[data.transaction.type]}`}
                  >
                    {data.transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(data.transaction.amount, data.transaction.currency)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3 bg-surface-tertiary/50 rounded-lg p-4">
                  <DetailRow
                    label="Referans No"
                    value={data.referenceNo}
                    onCopy={handleCopyRef}
                    copied={copied}
                  />
                  <DetailRow label="Tarih" value={formatDate(data.transaction.date)} />
                  <DetailRow
                    label="Durum"
                    value={data.transaction.status === "COMPLETED" ? "Başarılı" : data.transaction.status}
                  />
                  {data.transaction.account?.name && (
                    <DetailRow label="Hesap" value={data.transaction.account.name} />
                  )}
                  {data.transaction.category?.name && (
                    <DetailRow label="Kategori" value={data.transaction.category.name} />
                  )}
                  {data.transaction.description && (
                    <DetailRow label="Açıklama" value={data.transaction.description} />
                  )}
                </div>

                {/* Transfer Details */}
                {data.transaction.type === "TRANSFER" && (
                  <div className="space-y-3 bg-surface-tertiary/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Transfer Bilgileri
                    </p>
                    {data.transaction.recipientName && (
                      <DetailRow label="Alıcı" value={data.transaction.recipientName} />
                    )}
                    {data.transaction.recipientIban && (
                      <DetailRow label="IBAN" value={data.transaction.recipientIban} />
                    )}
                    {data.transaction.recipientBank && (
                      <DetailRow label="Banka" value={data.transaction.recipientBank} />
                    )}
                    {data.transaction.transferFee ? (
                      <DetailRow
                        label="Ücret"
                        value={formatCurrency(data.transaction.transferFee, data.transaction.currency)}
                      />
                    ) : null}
                  </div>
                )}

                {/* Email sent message */}
                {emailSent && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Dekont e-posta adresinize gönderildi.
                  </div>
                )}
                {emailError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {emailError}
                  </div>
                )}

                {/* Footer */}
                <p className="text-xs text-center text-text-muted pt-2 border-t border-border">
                  Bu belge MoneyShop tarafından otomatik oluşturulmuştur.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t border-border bg-surface-tertiary/30">
                <Button variant="outline" className="flex-1" onClick={handleDownload}>
                  <FileDown className="w-4 h-4" />
                  PDF İndir
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEmail}
                  isLoading={sendingEmail}
                  disabled={emailSent}
                >
                  <Mail className="w-4 h-4" />
                  {emailSent ? "Gönderildi" : "E-posta ile Gönder"}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Detail Row ──────────────────────────────────────────

function DetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-text-muted flex-shrink-0">{label}</span>
      <span className="text-sm text-text-primary font-medium text-right truncate flex items-center gap-1.5">
        {value}
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-0.5 rounded hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            title="Kopyala"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-profit" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </span>
    </div>
  );
}
