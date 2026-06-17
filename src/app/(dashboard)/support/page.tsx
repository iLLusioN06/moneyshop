"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Headphones,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

interface SupportMessage {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  _count: { messages: number };
}

const CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "Genel" },
  { value: "ACCOUNT", label: "Hesap" },
  { value: "TRANSACTION", label: "İşlem" },
  { value: "CARD", label: "Kart" },
  { value: "TECHNICAL", label: "Teknik" },
  { value: "OTHER", label: "Diğer" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Düşük" },
  { value: "MEDIUM", label: "Orta" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-secondary/10 text-secondary",
  IN_PROGRESS: "bg-loss/10 text-loss",
  WAITING: "bg-secondary/10 text-secondary",
  RESOLVED: "bg-profit/10 text-profit",
  CLOSED: "bg-text-muted/10 text-text-muted",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-profit/10 text-profit",
  MEDIUM: "bg-secondary/10 text-secondary",
  HIGH: "bg-loss/10 text-loss",
  URGENT: "bg-loss text-white",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Create form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/support-tickets");
      const json = await res.json();
      if (json.success) setTickets(json.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchTickets();
    }, 0);
  }, [fetchTickets]);

  const fetchTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/support-tickets/${id}`);
      const json = await res.json();
      if (json.success) setSelectedTicket(json.data);
    } catch (err) {
      console.error("Failed to fetch ticket", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setCreating(true);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, category, priority }),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        setSubject("");
        setDescription("");
        setCategory("GENERAL");
        setPriority("MEDIUM");
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support-tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      const json = await res.json();
      if (json.success) {
        setNewMessage("");
        fetchTicket(selectedTicket.id);
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: "Açık",
      IN_PROGRESS: "İşleniyor",
      WAITING: "Beklemede",
      RESOLVED: "Çözüldü",
      CLOSED: "Kapalı",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t("support.title")}</h1>
          <p className="text-sm text-text-muted mt-1">{t("support.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("support.new")}
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md p-6 animate-[slide-up_0.3s_ease-out]">
            <h2 className="text-lg font-semibold text-text-primary mb-4">{t("support.createTitle")}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("support.subject")}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  placeholder={t("support.subjectPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("support.description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30 h-24 resize-none"
                  placeholder={t("support.descriptionPlaceholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("support.category")}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t("support.priority")}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  {t("common.back")}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    t("support.create")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {selectedTicket ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t("support.backToList")}
          </button>

          <div className="rounded-xl bg-surface border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTicket.status]}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                    {PRIORITY_OPTIONS.find((p) => p.value === selectedTicket.priority)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${msg.isStaff ? "bg-secondary/5 border border-secondary/20" : "bg-surface-secondary border border-border"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${msg.isStaff ? "bg-secondary text-white" : "bg-surface-tertiary text-text-primary"}`}>
                      {msg.user.name?.[0] || "U"}
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {msg.user.name || msg.user.email}
                    </span>
                    {msg.isStaff && (
                      <span className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                        {t("support.staff")}
                      </span>
                    )}
                    <span className="text-xs text-text-muted ml-auto">
                      {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "RESOLVED" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  placeholder={t("support.messagePlaceholder")}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {tickets.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border p-8 text-center">
              <Headphones className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">{t("support.noTickets")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => fetchTicket(ticket.id)}
                  className="w-full text-left rounded-xl bg-surface border border-border p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{ticket.subject}</h3>
                      <p className="text-sm text-text-muted mt-1 line-clamp-1">{ticket.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                      {PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
                      <MessageSquare className="w-3 h-3" />
                      {ticket._count.messages}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
