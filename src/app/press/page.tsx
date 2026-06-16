"use client";

import Link from "next/link";
import { ArrowLeft, Newspaper, Calendar, ExternalLink } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const releases = [
  { date: "2024-12-01", title: "MoneyShop, Irak'ta 10.000 işletme sınırını geçti", summary: "MoneyShop'un ödeme platformu Irak genelinde 10.000'den fazla işletme tarafından kullanılmaya başlandı." },
  { date: "2024-10-15", title: "Yeni API Entegrasyonu ile E-ticaret Çözümleri", summary: "MoneyShop, e-ticaret işletmeleri için yeni REST API entegrasyonunu kullanıma sundu." },
  { date: "2024-08-20", title: "Mobil POS Çözümü ile Küçük İşletmelere Destek", summary: "Yeni mobil POS uygulaması ile küçük işletmeler akıllı telefonlarından ödeme kabul edebilecek." },
  { date: "2024-06-10", title: "MoneyShop'tan Yeni Nesil Ödeme Bağlantıları", summary: "İşletmeler için sosyal medyada paylaşılabilir ödeme bağlantıları ile tahsilat süreci hızlanıyor." },
];

export default function PressPage() {
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
            Basın
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0E27] mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Basın <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Bültenleri</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            MoneyShop hakkında en güncel haberler, basın bültenleri ve medya bildirimleri.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
        <div className="space-y-5 mb-16">
          {releases.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #E8F0FE, #D1FAF5)" }}>
                  <Newspaper className="w-6 h-6 text-[#0052FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#9CA3BF] mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0A0E27] mb-1.5">{item.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{item.summary}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-[#9CA3BF]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-all duration-300 mb-16" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm text-[#6B7280]">
            Basın iletişimi için:{" "}
            <a href="mailto:basin@moneyshop.iq" className="text-[#0052FF] hover:underline font-medium">basin@moneyshop.iq</a>
          </p>
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
