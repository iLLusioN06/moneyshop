"use client";

import { useState } from "react";
import { FileText, FileDown, Mail, Loader2, CheckCircle2 } from "lucide-react";
import DekontModal from "@/components/dekont-modal";

// ─── Props ───────────────────────────────────────────────

interface DekontActionsProps {
  transactionId: string;
  /** Hide view button (e.g. when already on detail page) */
  noView?: boolean;
  /** Compact mode for list rows */
  compact?: boolean;
}

// ─── Component ───────────────────────────────────────────

export default function DekontActions({ transactionId, noView, compact }: DekontActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/transactions/${transactionId}/dekont?format=pdf`, "_blank");
  };

  const handleEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSending(true);
    try {
      await fetch(`/api/transactions/${transactionId}/dekont`, { method: "POST" });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1">
          {!noView && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-secondary transition-all"
              title="Dekont Görüntüle"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-secondary transition-all"
            title="PDF İndir"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleEmail}
            disabled={sending || sent}
            className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-secondary transition-all disabled:opacity-50"
            title="E-posta ile Gönder"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : sent ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        {showModal && <DekontModal transactionId={transactionId} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!noView && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Görüntüle
          </button>
        )}
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-all"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </button>
        <button
          onClick={handleEmail}
          disabled={sending || sent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-all disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : sent ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
          ) : (
            <Mail className="w-3.5 h-3.5" />
          )}
          {sent ? "Gönderildi" : "E-posta"}
        </button>
      </div>
      {showModal && <DekontModal transactionId={transactionId} onClose={() => setShowModal(false)} />}
    </>
  );
}
