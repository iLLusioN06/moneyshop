"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, Wallet, Tag, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";

interface TransactionResult {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  date: string;
  recipientName: string | null;
}

interface AccountResult {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface CategoryResult {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface UserResult {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

interface SearchResults {
  transactions: TransactionResult[];
  accounts: AccountResult[];
  categories: CategoryResult[];
  users?: UserResult[];
}

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchDropdown({ query, onClose, inputRef }: SearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch results
  useEffect(() => {
    if (query.length < 2) {
      setTimeout(() => {
        setResults(null);
      }, 0);
      return;
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 200); // debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, inputRef]);

  // Keyboard navigation
  const totalItems =
    (results?.transactions.length ?? 0) +
    (results?.accounts.length ?? 0) +
    (results?.categories.length ?? 0) +
    (results?.users?.length ?? 0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        // Build flat list of items
        const items: { href: string }[] = [];
        if (results) {
          items.push(
            ...results.transactions.map(
              (t) => ({ href: `/dashboard/transactions?id=${t.id}` }) as const
            ),
            ...results.accounts.map(
              (a) => ({ href: `/dashboard/accounts?id=${a.id}` }) as const
            ),
            ...results.categories.map(
              (c) => ({ href: `/dashboard/categories?id=${c.id}` }) as const
            ),
            ...(results.users?.map(
              (u) => ({ href: `/dashboard/admin/users?id=${u.id}` }) as const
            ) ?? [])
          );
        }
        if (items[activeIndex]) {
          router.push(items[activeIndex].href);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, activeIndex, totalItems, router, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (query.length < 2) return null;

  const flatIndex = (() => {
    let idx = -1;
    return {
      next: () => {
        idx++;
        return idx;
      },
    };
  })();

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          <span className="ml-2 text-sm text-text-muted">{t("common.loading")}</span>
        </div>
      ) : results && totalItems === 0 ? (
        <div className="flex flex-col items-center py-8 text-text-muted">
          <Search className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">{t("common.noResults") || "Sonuç bulunamadı"}</p>
        </div>
      ) : results ? (
        <div className="py-2">
          {/* Transactions */}
          {results.transactions.length > 0 && (
            <Section label={t("nav.transactions")}>
              {results.transactions.map((tx, i) => (
                <ResultItem
                  key={tx.id}
                  href={`/dashboard/transactions?id=${tx.id}`}
                  icon={<ArrowUpDown className="w-4 h-4" />}
                  active={flatIndex.next() === activeIndex}
                  onSelect={onClose}
                >
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate text-sm">
                      {tx.description || tx.recipientName || t("dash.noCategory")}
                    </span>
                    <span
                      className={`text-sm font-medium ml-2 flex-shrink-0 ${
                        tx.type === "INCOME"
                          ? "text-profit"
                          : tx.type === "EXPENSE"
                            ? "text-loss"
                            : "text-info"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </div>
                </ResultItem>
              ))}
            </Section>
          )}

          {/* Accounts */}
          {results.accounts.length > 0 && (
            <Section label={t("nav.accounts")}>
              {results.accounts.map((acc, i) => (
                <ResultItem
                  key={acc.id}
                  href={`/dashboard/accounts?id=${acc.id}`}
                  icon={<Wallet className="w-4 h-4" />}
                  active={flatIndex.next() === activeIndex}
                  onSelect={onClose}
                >
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate text-sm">{acc.name}</span>
                    <span className="text-sm font-medium ml-2 flex-shrink-0">
                      {formatCurrency(acc.balance, acc.currency)}
                    </span>
                  </div>
                </ResultItem>
              ))}
            </Section>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <Section label={t("header.categories")}>
              {results.categories.map((cat, i) => (
                <ResultItem
                  key={cat.id}
                  href={`/dashboard/categories?id=${cat.id}`}
                  icon={<Tag className="w-4 h-4" />}
                  active={flatIndex.next() === activeIndex}
                  onSelect={onClose}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-sm">{cat.name}</span>
                    <Badge variant={cat.type === "INCOME" ? "success" : "default"}>
                      {cat.type === "INCOME" ? t("dash.income") : t("dash.expense")}
                    </Badge>
                  </div>
                </ResultItem>
              ))}
            </Section>
          )}

          {/* Users (admin only) */}
          {results.users && results.users.length > 0 && (
            <Section label={t("nav.adminUsers")}>
              {results.users.map((u, i) => (
                <ResultItem
                  key={u.id}
                  href={`/dashboard/admin/users?id=${u.id}`}
                  icon={<Users className="w-4 h-4" />}
                  active={flatIndex.next() === activeIndex}
                  onSelect={onClose}
                >
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-medium">
                        {u.name || "İsimsiz"}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        {u.email}
                      </span>
                    </div>
                    <Badge
                      variant={u.isActive ? "success" : "danger"}
                      size="sm"
                    >
                      {u.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </ResultItem>
              ))}
            </Section>
          )}
        </div>
      ) : null}
    </div>
  );
}

// --- Helpers ---

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  );
}

function ResultItem({
  href,
  icon,
  children,
  active,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-secondary/10 text-secondary"
          : "text-text-primary hover:bg-surface-tertiary"
      }`}
    >
      <span className="flex-shrink-0 text-text-muted">{icon}</span>
      {children}
    </Link>
  );
}
