"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Home,
  Wallet,
  ArrowUpDown,
  ArrowLeftRight,
  Repeat,
  Bookmark,
  CalendarCheck,
  Headphones,
  BarChart3,
  HandCoins,
  Banknote,
  Tags,
  PiggyBank,
  Receipt,
  CreditCard,
  FileText,
  Shield,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Command,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { signOut } from "next-auth/react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  category: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command items
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "home", label: "Genel Bakış", description: "Ana sayfa", icon: Home, href: ROUTES.DASHBOARD, category: "Navigasyon" },
    { id: "accounts", label: "Hesaplar", description: "Finansal hesaplarınız", icon: Wallet, href: ROUTES.ACCOUNTS, category: "Navigasyon" },
    { id: "transactions", label: "İşlem Geçmişi", description: "Tüm işlemleriniz", icon: ArrowUpDown, href: ROUTES.TRANSACTIONS, category: "Navigasyon" },
    { id: "transfers", label: "Para Transferi", description: "Para gönderin/alın", icon: ArrowLeftRight, href: ROUTES.TRANSFERS, category: "Navigasyon" },
    { id: "recurring", label: "Tekrarlanan İşlemler", description: "Otomatik ödemeler", icon: Repeat, href: ROUTES.RECURRING, category: "Navigasyon" },
    { id: "templates", label: "Şablonlar", description: "İşlem şablonları", icon: Bookmark, href: ROUTES.TEMPLATES, category: "Navigasyon" },
    { id: "split-bills", label: "Ortak Hesap", description: "Harcama paylaşımı", icon: User, href: ROUTES.SPLIT_BILLS, category: "Navigasyon" },
    { id: "installments", label: "Taksitli Ödemeler", description: "Taksit takibi", icon: CalendarCheck, href: ROUTES.INSTALLMENTS, category: "Navigasyon" },
    { id: "support", label: "Destek", description: "Yardım ve destek", icon: Headphones, href: ROUTES.SUPPORT, category: "Navigasyon" },
    { id: "portfolio", label: "Yatırım Portföyü", description: "Yatırım takibi", icon: BarChart3, href: ROUTES.PORTFOLIO, category: "Navigasyon" },
    { id: "deposit", label: "Para Yatır", description: "Hesaba para yatırın", icon: HandCoins, href: ROUTES.DEPOSIT, category: "İşlemler" },
    { id: "withdraw", label: "Para Çek", description: "Hesaptan para çekin", icon: Banknote, href: ROUTES.WITHDRAW, category: "İşlemler" },
    { id: "categories", label: "Kategoriler", description: "İşlem kategorileri", icon: Tags, href: ROUTES.CATEGORIES, category: "Yönetim" },
    { id: "budgets", label: "Bütçeler", description: "Bütçe planlama", icon: PiggyBank, href: ROUTES.BUDGETS, category: "Yönetim" },
    { id: "payments", label: "Ödemeler", description: "Fatura ödemeleri", icon: Receipt, href: ROUTES.PAYMENTS, category: "İşlemler" },
    { id: "card", label: "MoneyShop Card", description: "Kart yönetimi", icon: CreditCard, href: ROUTES.CARD, category: "Yönetim" },
    { id: "reports", label: "Raporlar", description: "Finansal raporlar", icon: FileText, href: ROUTES.REPORTS, category: "Raporlar" },
    { id: "profile", label: "Profil", description: "Profil ayarları", icon: User, href: ROUTES.PROFILE, category: "Hesap" },
    
    // Admin
    { id: "admin", label: "Admin Paneli", description: "Yönetim paneli", icon: Shield, href: ROUTES.ADMIN, category: "Admin" },
    { id: "announcements", label: "Duyurular", description: "Sistem duyuruları", icon: Bell, href: ROUTES.ANNOUNCEMENTS, category: "Admin" },
    { id: "sms-send", label: "SMS Gönder", description: "Toplu SMS", icon: MessageSquare, href: ROUTES.SMS_SEND, category: "Admin" },
    
    // Actions
    { id: "logout", label: "Çıkış Yap", description: "Hesaptan çıkış", icon: LogOut, action: () => signOut({ callbackUrl: "/login" }), category: "Hesap" },
  ], []);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [query, commands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuery("");
        setSelectedIndex(0);
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle command selection
  const handleSelect = useCallback(
    (command: CommandItem) => {
      setIsOpen(false);
      if (command.href) {
        router.push(command.href);
      } else if (command.action) {
        command.action();
      }
    },
    [router]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    },
    [filteredCommands, selectedIndex, handleSelect]
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to avoid synchronous setState
      const timer = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    
    const selected = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  let flatIndex = -1;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setQuery("");
          setSelectedIndex(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <Command className="w-4 h-4 text-text-muted group-hover:text-secondary transition-colors" />
        <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">
          Komut Paleti
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-tertiary rounded text-xs text-text-muted">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <Card className="relative w-full max-w-xl mx-4 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Komut veya sayfa ara..."
                  className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-muted"
                />
                <kbd className="px-1.5 py-0.5 bg-surface-tertiary rounded text-xs text-text-muted">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-text-muted">
                    Sonuç bulunamadı
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-medium text-text-muted">
                        {category}
                      </p>
                      {items.map((cmd) => {
                        flatIndex++;
                        const isSelected = flatIndex === selectedIndex;
                        const Icon = cmd.icon;
                        
                        return (
                          <button
                            key={cmd.id}
                            data-index={flatIndex}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              isSelected
                                ? "bg-secondary/10 text-secondary"
                                : "text-text-primary hover:bg-surface-tertiary"
                            }`}
                          >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-secondary" : "text-text-muted"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-xs text-text-muted truncate">{cmd.description}</p>
                              )}
                            </div>
                            <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-secondary" : "text-text-muted"}`} />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-tertiary/50">
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-surface rounded">↑↓</kbd>
                    gezin
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-surface rounded">↵</kbd>
                    seç
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-surface rounded">esc</kbd>
                    kapat
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {filteredCommands.length} komut
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
