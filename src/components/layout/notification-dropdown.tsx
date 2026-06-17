"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, TrendingUp, ArrowUpDown, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";

interface Notification {
  id: string;
  type: "budget" | "transaction" | "system";
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const items: Notification[] = [];

      // 1. Budget alerts — geçen bütçe durumunu kontrol et
      const budgetsRes = await fetch("/api/budgets");
      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        const budgets = budgetsData.data ?? budgetsData ?? [];
        for (const b of Array.isArray(budgets) ? budgets : []) {
          if (b.spent && b.amount && b.spent / b.amount >= 0.8) {
            const pct = Math.round((b.spent / b.amount) * 100);
            items.push({
              id: `budget-${b.id}`,
              type: "budget",
              title: t("budget.alert") || "Bütçe Uyarısı",
              description: `"${b.category?.name || ""}" bütçesinin %${pct}'i kullanıldı (${formatCurrency(b.spent, b.currency)} / ${formatCurrency(b.amount, b.currency)})`,
              href: "/dashboard/budgets",
              icon: <AlertTriangle className="w-4 h-4 text-pending" />,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      // 2. Son büyük işlemleri bildirim olarak göster (25,000+)
      const txRes = await fetch("/api/transactions?limit=20");
      if (txRes.ok) {
        const txData = await txRes.json();
        const txs = txData.data ?? [];
        for (const tx of Array.isArray(txs) ? txs : []) {
          if (tx.amount < 25000) continue;
          items.push({
            id: `tx-${tx.id}`,
            type: "transaction",
            title: tx.type === "INCOME" ? "Büyük Gelir" : "Büyük Gider",
            description: `${formatCurrency(tx.amount, tx.currency)} — ${tx.description || "İşlem"}`,
            href: `/dashboard/transactions?id=${tx.id}`,
            icon: <ArrowUpDown className={`w-4 h-4 ${tx.type === "INCOME" ? "text-profit" : "text-loss"}`} />,
            read: false,
            createdAt: tx.date,
          });
        }
      }

      // 3. Pending işlemler
      const pendingRes = await fetch("/api/transactions?status=PENDING&limit=5");
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const pendings = pendingData.data ?? [];
        for (const tx of Array.isArray(pendings) ? pendings : []) {
          items.push({
            id: `pending-${tx.id}`,
            type: "transaction",
            title: "Bekleyen İşlem",
            description: `${formatCurrency(tx.amount, tx.currency)} — ${tx.description || "İşlem"}`,
            href: `/dashboard/transactions?id=${tx.id}`,
            icon: <TrendingUp className="w-4 h-4 text-info" />,
            read: false,
            createdAt: tx.date,
          });
        }
      }

      // Tarihe göre sırala (en yeni en üstte)
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(items.slice(0, 10));
    } catch {
      // Sessizce başarısız - bildirim yok
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchNotifications();
    }, 0);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-1 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">
            {t("header.notifications") || "Bildirimler"}
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-danger rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-text-muted">
            <Bell className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">{t("header.noNotifications") || "Bildirim bulunmuyor"}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              onClick={onClose}
              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-tertiary ${
                !n.read ? "bg-secondary/5" : ""
              }`}
            >
              <span className="mt-0.5 flex-shrink-0">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.description}</p>
                <p className="text-xs text-text-muted/60 mt-1">
                  {formatDate(n.createdAt, "relative")}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <Link
            href="/dashboard/transactions"
            onClick={onClose}
            className="block text-center text-xs text-secondary hover:underline py-1"
          >
            {t("dash.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
