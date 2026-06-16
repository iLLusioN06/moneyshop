"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const contactInfo = [
  { icon: MapPin, title: "Adres", info: "Erbil, Irak Kürdistan Bölgesi", badge: "Ana Ofis" },
  { icon: Phone, title: "Telefon", info: "+964 750 000 0000", href: "tel:+964750000000", badge: "7/24 Destek" },
  { icon: Mail, title: "E-posta", info: "info@moneyshop.iq", href: "mailto:info@moneyshop.iq", badge: "Genel İletişim" },
  { icon: Clock, title: "Çalışma Saatleri", info: "Pazartesi - Cuma", badge: "09:00 - 18:00" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]" style={{ fontFamily: "Inter, sans-serif" }}>
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

      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 tracking-wide uppercase" style={{ background: "#E8F0FE", color: "#0052FF" }}>
            İletişim
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0E27] mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Bizimle <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>İletişime Geçin</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            Sorularınız, önerileriniz veya iş birliği için bize ulaşın. Size yardımcı olmaktan mutluluk duyarız.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {contactInfo.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
                  <Icon className="w-5 h-5 text-[#0052FF]" />
                </div>
                <span className="inline-block text-[10px] font-semibold text-[#0052FF] uppercase tracking-wider mb-1 px-2 py-0.5 rounded" style={{ background: "#E8F0FE" }}>
                  {item.badge}
                </span>
                <h3 className="font-semibold text-[#0A0E27] text-sm mt-1 mb-1">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-sm text-[#6B7280] hover:text-[#0052FF] transition-colors">{item.info}</a>
                ) : (
                  <p className="text-sm text-[#6B7280]">{item.info}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Form + Map */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 className="text-xl font-bold text-[#0A0E27] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Bize Mesaj Gönderin</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Adınız</label>
                  <input type="text" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" placeholder="Adınız" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1.5">E-posta</label>
                  <input type="email" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" placeholder="ornek@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Konu</label>
                <input type="text" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" placeholder="Mesajınızın konusu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Mesaj</label>
                <textarea rows={4} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 resize-none" placeholder="Mesajınız..." />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90 hover:shadow-lg" style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)" }}>
                <Send className="w-4 h-4" /> Mesajı Gönder
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
              <MapPin className="w-8 h-8 text-[#0052FF]" />
            </div>
            <h3 className="font-semibold text-[#0A0E27] mb-2">Ana Ofis</h3>
            <p className="text-sm text-[#6B7280] mb-1">Erbil, Irak Kürdistan Bölgesi</p>
            <p className="text-xs text-[#9CA3BF] mb-5">Business Center, 5. Kat</p>
            <div className="w-full h-40 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
              <div className="text-center">
                <MapPin className="w-6 h-6 text-[#0052FF] mx-auto mb-1" />
                <p className="text-xs text-[#6B7280]">Harita burada görüntülenecek</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
