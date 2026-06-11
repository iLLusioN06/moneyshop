"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";
import { getAccessibleNavItems } from "@/lib/permissions";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  ArrowLeftRight,
  HandCoins,
  Banknote,
  Repeat,
  BarChart3,
  FileText,
  PiggyBank,
  Receipt,
  CreditCard,
  LogOut,
  User,
  X,
  Shield,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { t } from "@/lib/dashboard-i18n";

const allNavItems: { href: string; labelKey: string; icon: React.ElementType }[] = [
  { href: ROUTES.DASHBOARD, labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: ROUTES.ACCOUNTS, labelKey: "nav.accounts", icon: Wallet },
  { href: ROUTES.TRANSACTIONS, labelKey: "nav.transactions", icon: ArrowUpDown },
  { href: ROUTES.TRANSFERS, labelKey: "nav.transfers", icon: ArrowLeftRight },
  { href: ROUTES.RECURRING, labelKey: "nav.recurring", icon: Repeat },
  { href: ROUTES.PORTFOLIO, labelKey: "nav.portfolio", icon: BarChart3 },
  { href: ROUTES.DEPOSIT, labelKey: "nav.deposit", icon: HandCoins },
  { href: ROUTES.WITHDRAW, labelKey: "nav.withdraw", icon: Banknote },
  { href: ROUTES.BUDGETS, labelKey: "nav.budgets", icon: PiggyBank },
  { href: ROUTES.PAYMENTS, labelKey: "nav.payments", icon: Receipt },
  { href: ROUTES.CARD, labelKey: "nav.card", icon: CreditCard },
  { href: ROUTES.REPORTS, labelKey: "nav.reports", icon: FileText },
  { href: ROUTES.ADMIN, labelKey: "nav.adminPanel", icon: Shield },
  { href: ROUTES.PROFILE, labelKey: "nav.profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const role = session?.user?.role;
  const navItems = getAccessibleNavItems(role, allNavItems);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-surface-dark border-r border-border-dark transition-all duration-300",
          "fixed md:static inset-y-0 left-0 z-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "w-64"
        )}
      >
        {/* Logo & Close */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-dark">
          <Link href={ROUTES.HOME} className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-text-dark-primary truncate">
              {APP_NAME}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-surface-dark-secondary text-text-dark-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item: (typeof allNavItems)[0]) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-secondary/10 text-secondary"
                    : "text-text-dark-secondary hover:bg-surface-dark-secondary hover:text-text-dark-primary"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-3 border-t border-border-dark space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-secondary/20 rounded-full flex items-center justify-center text-xs font-medium text-secondary">
              {(session?.user?.name || "K")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-dark-primary truncate">
                {session?.user?.name || t("nav.user")}
              </p>
              <p className="text-xs text-text-dark-muted">
                {role === "ADMIN" ? t("nav.admin") : t("nav.user")}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-dark-muted hover:bg-surface-dark-secondary hover:text-loss transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{t("nav.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
