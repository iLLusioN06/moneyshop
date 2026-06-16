"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, GraduationCap, Users as UsersIcon, Clock, Briefcase } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const perks = [
  { icon: Rocket, title: "Yenilikçi Ortam", desc: "Fintech sektörünün en yeni teknolojileriyle çalışma fırsatı." },
  { icon: GraduationCap, title: "Büyüme Odaklı", desc: "Kariyer gelişiminizi destekleyen eğitim ve mentorluk programları." },
  { icon: UsersIcon, title: "Dinamik Ekip", desc: "Tutkulu ve işbirliğine dayalı uluslararası bir ekip." },
  { icon: Clock, title: "Esnek Çalışma", desc: "Uzaktan ve hibrit çalışma imkanları." },
];

export default function CareersPage() {
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
            Kariyer
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0E27] mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Ekibimize <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Katılın</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            Finansın geleceğini birlikte şekillendirelim. MoneyShop ailesinde seni bekleyen fırsatları keşfet.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-10 rounded-full" style={{ background: "linear-gradient(180deg, #0052FF, #00D4AA)" }} />
            <div>
              <h2 className="text-3xl font-bold text-[#0A0E27]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Neden MoneyShop?</h2>
              <p className="text-sm text-[#6B7280]">Fintek sektöründe fark yaratan bir ekibin parçası olun</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {perks.map((item, i) => {
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

      <div className="mb-24">
        <h2 className="text-2xl font-bold text-[#0A0E27] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Aktif Pozisyonlar</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
              <Briefcase className="w-8 h-8 text-[#0052FF]" />
            </div>
            <p className="text-[#6B7280] mb-2">Şu anda aktif bir iş ilanımız bulunmamaktadır.</p>
            <p className="text-sm text-[#9CA3BF]">
              Yeni pozisyonlar için bizi takip edin. Özgeçmişinizi{" "}
              <a href="mailto:kariyer@moneyshop.iq" className="text-[#0052FF] hover:underline font-medium">kariyer@moneyshop.iq</a> adresine gönderebilirsiniz.
            </p>
          </div>
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
