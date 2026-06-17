"use client";

import { useState, useRef } from "react";
import {
  Share2,
  Download,
  Image,
  FileText,
  Copy,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  description?: string;
  account?: { name: string } | null;
  category?: { name: string; color: string } | null;
  recipientName?: string;
  recipientIban?: string;
  recipientBank?: string;
  transferFee?: number;
}

interface ReceiptShareProps {
  transaction: Transaction;
  userName: string;
  t: (key: string) => string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeIcon(type: string) {
  switch (type) {
    case "INCOME":
      return <ArrowDownLeft className="w-5 h-5 text-profit" />;
    case "EXPENSE":
      return <ArrowUpRight className="w-5 h-5 text-loss" />;
    case "TRANSFER":
      return <ArrowRightLeft className="w-5 h-5 text-secondary" />;
    default:
      return null;
  }
}

function getTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case "INCOME":
      return t("receipt.income");
    case "EXPENSE":
      return t("receipt.expense");
    case "TRANSFER":
      return t("receipt.transfer");
    default:
      return type;
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case "INCOME":
      return "text-profit";
    case "EXPENSE":
      return "text-loss";
    case "TRANSFER":
      return "text-secondary";
    default:
      return "text-text-primary";
  }
}

export default function ReceiptShare({ transaction, userName, t }: ReceiptShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const referenceNo = `MS-${transaction.id.slice(0, 8).toUpperCase()}`;

  const handleCopyReceipt = () => {
    const receiptText = `
╔══════════════════════════════════════╗
║           MoneyShop Dekont          ║
╚══════════════════════════════════════╝

${t("receipt.transactionType")}: ${getTypeLabel(transaction.type, t)}
${t("receipt.amount")}: ${transaction.type === "INCOME" ? "+" : "-"}${formatCurrency(transaction.amount, transaction.currency)}
${t("receipt.date")}: ${formatDate(transaction.date)}
${t("receipt.status")}: ${transaction.status === "COMPLETED" ? t("receipt.completed") : transaction.status}
${t("receipt.reference")}: ${referenceNo}

${transaction.account?.name ? `${t("receipt.account")}: ${transaction.account.name}` : ""}
${transaction.category?.name ? `${t("receipt.category")}: ${transaction.category.name}` : ""}
${transaction.description ? `${t("receipt.description")}: ${transaction.description}` : ""}

${transaction.type === "TRANSFER" && transaction.recipientName ? `${t("receipt.recipient")}: ${transaction.recipientName}` : ""}
${transaction.type === "TRANSFER" && transaction.recipientIban ? `IBAN: ${transaction.recipientIban}` : ""}
${transaction.type === "TRANSFER" && transaction.recipientBank ? `${t("receipt.bank")}: ${transaction.recipientBank}` : ""}

${t("receipt.generatedBy")}
`.trim();

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;

    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `receipt-${referenceNo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t("receipt.title")} - ${referenceNo}`,
          text: `${getTypeLabel(transaction.type, t)}: ${transaction.type === "INCOME" ? "+" : "-"}${formatCurrency(transaction.amount, transaction.currency)}`,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {t("receipt.share")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md animate-[slide-up_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">{t("receipt.title")}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-tertiary text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="p-4">
              <div
                ref={receiptRef}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">MoneyShop</span>
                  </div>
                  <p className="text-xs text-gray-500">{t("receipt.subtitle")}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 my-4" />

                {/* Type Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    transaction.type === "INCOME" ? "bg-green-100" :
                    transaction.type === "EXPENSE" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    {getTypeIcon(transaction.type)}
                    <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type, t)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center mb-4">
                  <p className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("receipt.date")}</span>
                    <span className="text-gray-900 font-medium">{formatDate(transaction.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("receipt.status")}</span>
                    <span className="text-green-600 font-medium">{t("receipt.completed")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("receipt.reference")}</span>
                    <span className="text-gray-900 font-mono text-xs">{referenceNo}</span>
                  </div>
                  {transaction.account?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("receipt.account")}</span>
                      <span className="text-gray-900">{transaction.account.name}</span>
                    </div>
                  )}
                  {transaction.category?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("receipt.category")}</span>
                      <span className="text-gray-900">{transaction.category.name}</span>
                    </div>
                  )}
                  {transaction.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("receipt.description")}</span>
                      <span className="text-gray-900">{transaction.description}</span>
                    </div>
                  )}

                  {transaction.type === "TRANSFER" && (
                    <>
                      {transaction.recipientName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t("receipt.recipient")}</span>
                          <span className="text-gray-900">{transaction.recipientName}</span>
                        </div>
                      )}
                      {transaction.recipientIban && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">IBAN</span>
                          <span className="text-gray-900 font-mono text-xs">{transaction.recipientIban}</span>
                        </div>
                      )}
                      {transaction.recipientBank && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t("receipt.bank")}</span>
                          <span className="text-gray-900">{transaction.recipientBank}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 my-4" />

                {/* Footer */}
                <div className="text-center">
                  <p className="text-xs text-gray-400">{t("receipt.generatedBy")}</p>
                  <p className="text-xs text-gray-400 mt-1">{userName}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopyReceipt}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-profit" />
                  ) : (
                    <Copy className="w-5 h-5 text-text-muted" />
                  )}
                  <span className="text-xs text-text-muted">
                    {copied ? t("receipt.copied") : t("receipt.copy")}
                  </span>
                </button>

                <button
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                  ) : (
                    <Image className="w-5 h-5 text-text-muted" aria-hidden="true" />
                  )}
                  <span className="text-xs text-text-muted">{t("receipt.image")}</span>
                </button>

                {typeof navigator.share === "function" && (
                  <button
                    onClick={handleShareNative}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-surface-secondary transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-text-muted" />
                    <span className="text-xs text-text-muted">{t("receipt.shareNative")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
