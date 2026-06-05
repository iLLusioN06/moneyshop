"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/dashboard-i18n";

const pageTitleKeys: Record<string, string> = {
  "/dashboard": "header.dashboard",
  "/accounts": "header.accounts",
  "/transactions": "header.transactions",
  "/categories": "header.categories",
  "/budgets": "header.budgets",
  "/settings": "header.settings",
  "/profile": "header.profile",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = t(pageTitleKeys[pathname] ?? "") || "MoneyShop";
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const userName = session?.user?.name || t("nav.user");
  const userRole = session?.user?.role;
  const roleLabel = userRole === "ADMIN" ? t("nav.admin") : t("nav.user");
  const initial = userName[0]?.toUpperCase() || "K";

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={t("header.search")}
            className="h-9 w-48 lg:w-56 rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </Button>

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
    </header>
  );
}
