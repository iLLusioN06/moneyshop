"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Bell, Search, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/dashboard-i18n";
import { SearchDropdown } from "@/components/layout/search-dropdown";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

const pageTitleKeys: Record<string, string> = {
  "/dashboard": "header.dashboard",
  "/accounts": "header.accounts",
  "/transactions": "header.transactions",
  "/categories": "header.categories",
  "/budgets": "header.budgets",
  "/settings": "header.settings",
  "/profile": "header.profile",
  "/admin": "header.admin",
  "/recurring": "header.recurring",
  "/portfolio": "header.portfolio",
  "/reports": "header.reports",
  "/my-card": "header.card",
  "/templates": "header.templates",
  "/split-bills": "header.splitBills",
  "/installments": "header.installments",
  "/support": "header.support",
  "/deposit": "header.deposit",
  "/withdraw": "header.withdraw",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = t(pageTitleKeys[pathname] ?? "") || "MoneyShop";
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useAppStore();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const userName = session?.user?.name || t("nav.user");
  const userRole = session?.user?.role;
  const roleLabel = userRole === "ADMIN" ? t("nav.admin") : t("nav.user");
  const initial = userName[0]?.toUpperCase() || "K";

  const handleSearchClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        searchInputRef.current?.blur();
      }
    },
    []
  );

  const openMobileSearch = useCallback(() => {
    setMobileSearchOpen(true);
    // Focus input after render
    setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
    setQuery("");
    setShowDropdown(false);
  }, []);

  // Lock body scroll when mobile search open
  useEffect(() => {
    if (mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSearchOpen]);

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-surface border-b border-border">
      {/* Left: Title + Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
          aria-label="Menüyü aç/kapat"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          <p className="text-xs text-text-muted mt-0.5 hidden sm:block">
            {t("header.subtitle")}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.length >= 2) setShowDropdown(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("header.search")}
            className="h-9 w-48 lg:w-56 rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
          {showDropdown && query.length >= 2 && (
            <SearchDropdown
              query={query}
              onClose={handleSearchClose}
              inputRef={searchInputRef}
            />
          )}
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={openMobileSearch}
          className="md:hidden p-2 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
          aria-label={t("header.search")}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
          aria-label="Tema değiştir"
          title="Koyu/Açık tema"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-pending" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </Button>
          {notificationOpen && (
            <NotificationDropdown onClose={() => setNotificationOpen(false)} />
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <p className="text-xs text-text-muted">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileSearch}
          />
          {/* Search Panel */}
          <div className="relative bg-surface shadow-xl">
            <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length >= 2) setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (query.length >= 2) setShowDropdown(true);
                  }}
                  placeholder={t("header.search")}
                  className="w-full h-10 rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
              </div>
              <button
                onClick={closeMobileSearch}
                className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Results */}
            {showDropdown && query.length >= 2 && (
              <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
                <SearchDropdown
                  query={query}
                  onClose={() => {
                    setShowDropdown(false);
                    closeMobileSearch();
                  }}
                  inputRef={mobileSearchInputRef}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
