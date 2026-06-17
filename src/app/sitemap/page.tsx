"use client";

import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Shield, Building2, HelpCircle, Send, ChevronRight } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  {
    title: "Hizmetler",
    icon: Send,
    links: [
      { href: "/#services", label: "POS Terminalleri" },
      { href: "/pricing", label: "Çevrimiçi Ödemeler" },
      { href: "/pricing", label: "Ödeme Bağlantıları" },
      { href: "/register", label: "Tüccar Portalı" },
    ],
  },
  {
    title: "Şirket",
    icon: Building2,
    links: [
      { href: "/about", label: "Hakkımızda" },
      { href: "/careers", label: "Kariyer" },
      { href: "/press", label: "Basın" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "İletişim" },
    ],
  },
  {
    title: "Yasal",
    icon: Shield,
    links: [
      { href: "/privacy", label: "Gizlilik Politikası" },
      { href: "/terms", label: "Kullanım Şartları" },
      { href: "/aml", label: "AML Politikası" },
      { href: "/kyc", label: "KYC Politikası" },
      { href: "/cookies", label: "Çerez Politikası" },
    ],
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    links: [
      { href: "/dashboard", label: "Genel Bakış" },
      { href: "/accounts", label: "Hesaplar" },
      { href: "/transactions", label: "İşlemler" },
      { href: "/transfers", label: "Para Transferi" },
      { href: "/card", label: "Kart İşlemleri" },
    ],
  },
  {
    title: "Destek",
    icon: HelpCircle,
    links: [
      { href: "/faq", label: "SSS" },
      { href: "/contact", label: "İletişim" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ background: "linear-gradient(135deg, #0052FF 0%, #00D4AA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Money<span>Shop</span>
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-[#6B7280] hover:text-[#0052FF] transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Anasayfa
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 tracking-wide uppercase" style={{ background: "#E8F0FE", color: "#0052FF" }}>
            Site Haritası
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A0E27] mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Tüm Sayfalar
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            MoneyShop web sitesindeki tüm sayfalara hızlı erişim.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-10 relative z-10 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
                    <Icon className="w-5 h-5 text-[#0052FF]" />
                  </div>
                  <h2 className="font-bold text-[#0A0E27]">{section.title}</h2>
                </div>
                <ul className="space-y-1">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0052FF] transition-colors py-1.5 rounded-lg hover:bg-gray-50 px-2 -mx-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-[#9CA3BF]" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
