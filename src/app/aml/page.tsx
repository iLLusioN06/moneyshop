"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  { title: "1. Amaç", content: "MoneyShop olarak, kara para aklama (AML) ve terör finansmanının önlenmesi konusunda Irak Merkez Bankası (CBI) düzenlemelerine ve uluslararası standartlara tam uyumluluk sağlamayı taahhüt ediyoruz." },
  { title: "2. Risk Değerlendirmesi", content: "Tüm müşterilerimiz, hizmet almaya başlamadan önce kapsamlı bir risk değerlendirmesine tabi tutulur.", list: ["Müşterinin iş profili ve sektörü", "İşlem hacmi ve sıklığı", "Coğrafi konum ve iş yapılan bölgeler", "Ürün ve hizmetlerin kullanım amacı"] },
  { title: "3. Müşteri Durum Tespiti (CDD)", content: "Tüm müşterilerimiz için müşteri durum tespiti süreçleri uygulanır:", list: ["Kimlik doğrulama ve belgelendirme", "Gerçek faydalanıcı sahibinin tespiti", "İş ilişkisinin amacı ve niteliğinin belirlenmesi", "Risk profiline göre periyodik güncellemeler"] },
  { title: "4. Şüpheli İşlem Bildirimi", content: "Şüpheli işlemlerin tespiti halinde, ilgili yasal mercilere derhal bildirim yapılır.", list: ["Müşterinin profiliyle uyuşmayan işlemler", "Karmaşık veya olağandışı büyük işlemler", "Birden fazla hesap kullanılarak yapılan işlemler", "Kaynağı şüpheli fon transferleri"] },
  { title: "5. Kayıt Saklama", content: "Tüm işlem kayıtları ve müşteri belgeleri, yasal zorunluluklar gereği en az 5 yıl süreyle güvenli bir şekilde saklanır." },
  { title: "6. Eğitim ve Farkındalık", content: "Tüm çalışanlarımız düzenli olarak AML/KYC eğitimlerine tabi tutulur ve kara para aklama konusunda farkındalık seviyeleri sürekli güncellenir." },
];

export default function AmlPage() {
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
            Yasal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A0E27] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            AML <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Politikası</span>
          </h1>
          <p className="text-base text-[#6B7280]">Son güncelleme: 16 Haziran 2026</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 mb-16" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-[#0A0E27] mb-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)" }}>
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-2">{section.content}</p>
                {section.list && (
                  <ul className="space-y-1.5 ml-9">
                    {section.list.map((item, j) => (
                      <li key={j} className="text-sm text-[#6B7280] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#00D4AA" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
