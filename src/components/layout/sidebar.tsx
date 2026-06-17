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
  Tags,
  Home,
  Bell,
  MessageSquare,
  CalendarCheck,
  Headphones,
  Bookmark,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { t } from "@/lib/dashboard-i18n";

const allNavItems: { href: string; labelKey: string; icon: React.ElementType }[] = [
  { href: ROUTES.DASHBOARD, labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: ROUTES.ACCOUNTS, labelKey: "nav.accounts", icon: Wallet },
  { href: ROUTES.TRANSACTIONS, labelKey: "nav.transactions", icon: ArrowUpDown },
  { href: ROUTES.TRANSFERS, labelKey: "nav.transfers", icon: ArrowLeftRight },
  { href: ROUTES.RECURRING, labelKey: "nav.recurring", icon: Repeat },
  { href: ROUTES.TEMPLATES, labelKey: "nav.templates", icon: Bookmark },
  { href: ROUTES.SPLIT_BILLS, labelKey: "nav.splitBills", icon: Users },
  { href: ROUTES.INSTALLMENTS, labelKey: "nav.installments", icon: CalendarCheck },
  { href: ROUTES.SUPPORT, labelKey: "nav.support", icon: Headphones },
  { href: ROUTES.PORTFOLIO, labelKey: "nav.portfolio", icon: BarChart3 },
  { href: ROUTES.DEPOSIT, labelKey: "nav.deposit", icon: HandCoins },
  { href: ROUTES.WITHDRAW, labelKey: "nav.withdraw", icon: Banknote },
  { href: ROUTES.CATEGORIES, labelKey: "nav.categories", icon: Tags },
  { href: ROUTES.BUDGETS, labelKey: "nav.budgets", icon: PiggyBank },
  { href: ROUTES.PAYMENTS, labelKey: "nav.payments", icon: Receipt },
  { href: ROUTES.CARD, labelKey: "nav.card", icon: CreditCard },
  { href: ROUTES.REPORTS, labelKey: "nav.reports", icon: FileText },
  { href: ROUTES.ADMIN, labelKey: "nav.adminPanel", icon: Shield },
  { href: ROUTES.ANNOUNCEMENTS, labelKey: "nav.announcements", icon: Bell },
  { href: ROUTES.SMS_SEND, labelKey: "nav.smsSend", icon: MessageSquare },
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
          "flex flex-col bg-surface-secondary border-r border-border transition-all duration-300",
          "fixed md:static inset-y-0 left-0 z-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "w-64"
        )}
      >
        {/* Logo & Close */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-text-primary truncate">
              {APP_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.HOME}
              className="flex-shrink-0 p-1.5 rounded-lg border border-border text-text-muted hover:bg-loss/5 hover:text-loss hover:border-loss/20 transition-all duration-200"
              title="Web Sitesi"
            >
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-surface-tertiary text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-secondary/10 text-secondary font-semibold"
                    : "text-text-secondary hover:bg-secondary/5 hover:text-secondary"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-secondary rounded-r" />
                )}
                <Icon className="w-5 h-5 flex-shrink-0 transition-colors duration-200 group-hover:text-secondary" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-secondary/20 rounded-full flex items-center justify-center text-xs font-medium text-secondary">
              {(session?.user?.name || "K")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">
                {session?.user?.name || t("nav.user")}
              </p>
              <p className="text-xs text-text-muted">
                {role === "ADMIN" ? t("nav.admin") : t("nav.user")}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-loss/5 hover:text-loss transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-colors duration-200 group-hover:text-loss" />
            <span className="truncate">{t("nav.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
