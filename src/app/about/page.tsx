"use client";

import Link from "next/link";
import { ArrowLeft, Target, Eye, Shield, Zap, Heart, Users } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const values = [
  { icon: Shield, title: "Güven", desc: "Müşterilerimizin verilerini ve işlemlerini en üst düzeyde güvenlikle koruyoruz." },
  { icon: Zap, title: "Yenilikçilik", desc: "Sürekli gelişen teknolojiyi takip ederek en iyi çözümleri sunuyoruz." },
  { icon: Heart, title: "Uyumluluk", desc: "CBI düzenlemeleri ve uluslararası standartlara tam uyumluluk." },
  { icon: Users, title: "Müşteri Odaklılık", desc: "Her işletmenin ihtiyacına özel çözümler geliştiriyoruz." },
];

const reasons = [
  "Tam AML/KYC uyumluluğu ve CBI düzenlemelerine tam uyum",
  "Kurumsal düzeyde 256-bit SSL şifreleme ve tokenizasyon",
  "7/24 kesintisiz hizmet ve teknik destek",
  "Bölgesel pazar deneyimi ve yerel uzmanlık",
  "Hızlı onboarding ve 1-3 iş gününde hesap aktivasyonu",
  "Esnek API entegrasyonu ile kolay bağlantı",
];

export default function AboutPage() {
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
            Hakkımızda
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0E27] mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Dijital Ödemenin Geleceğini <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Şekillendiriyoruz</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            MoneyShop, Irak ve Kürdistan Bölgesi&apos;ndeki işletmelere modern, güvenli ve uyumlu dijital ödeme çözümleri sunan lider bir finansal teknoloji şirketidir.
          </p>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {[
            { icon: Target, title: "Misyonumuz", desc: "Irak'taki işletmelere, bölgenin benzersiz ihtiyaçlarına uygun, güvenli, hızlı ve uyumlu ödeme altyapısı sağlayarak dijital dönüşümlerinde liderlik etmek." },
            { icon: Eye, title: "Vizyonumuz", desc: "Irak ve bölgesinde dijital ödemelerin standart haline geldiği, her işletmenin teknolojinin gücünden eşit şekilde yararlanabildiği bir finansal ekosistem oluşturmak." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
                  <Icon className="w-6 h-6 text-[#0052FF]" />
                </div>
                <h2 className="text-xl font-bold text-[#0A0E27] mb-3">{item.title}</h2>
                <p className="text-[#6B7280] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Değerlerimiz */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0A0E27] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Değerlerimiz</h2>
            <p className="text-[#6B7280]">Bizi başarıya taşıyan temel prensipler</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: "#E8F0FE" }}>
                    <Icon className="w-5 h-5 text-[#0052FF]" />
                  </div>
                  <h3 className="font-semibold text-[#0A0E27] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Neden MoneyShop */}
        <div className="mb-24">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #0052FF, #00D4AA)" }} />
              <h2 className="text-2xl font-bold text-[#0A0E27]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Neden MoneyShop?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {reasons.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#D1FAF5" }}>
                    <svg className="w-3.5 h-3.5 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-[#6B7280]">{item}</span>
                </div>
              ))}
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
