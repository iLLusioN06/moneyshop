"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  { title: "1. Giriş", content: "MoneyShop olarak, kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz. Bu Gizlilik Politikası, platformumuzu kullanırken hangi bilgileri topladığımızı, bu bilgileri nasıl kullandığımızı, sakladığımızı ve koruduğumuzu açıklamaktadır." },
  { title: "2. Toplanan Bilgiler", content: "Hizmetlerimizi sağlamak amacıyla aşağıdaki bilgileri toplayabiliriz:", list: ["Kimlik Bilgileri: Ad, soyad, kimlik numarası veya pasaport", "İletişim Bilgileri: E-posta adresi, telefon numarası, adres", "Finansal Bilgiler: Banka hesap bilgileri, işlem geçmişi", "Teknik Bilgiler: IP adresi, cihaz bilgileri, tarayıcı türü", "KYC Belgeleri: Kimlik fotokopisi, ikametgah, işletme belgeleri"] },
  { title: "3. Bilgilerin Kullanımı", content: "Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:", list: ["Hesap oluşturma ve doğrulama", "İşlemlerin işlenmesi ve yönetilmesi", "Yasal düzenlemelere uyum (AML/KYC)", "Dolandırıcılık tespiti ve önlenmesi", "Müşteri hizmetleri ve destek"] },
  { title: "4. Veri Paylaşımı", content: "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.", list: ["Yasal mercilerin talebi üzerine", "Ödeme işlemcileri ve bankalarla (işlemlerin gerçekleştirilmesi için)", "Denetim ve uyumluluk hizmet sağlayıcılarıyla"] },
  { title: "5. Veri Güvenliği", content: "Kişisel verilerinizi korumak için 256-bit SSL şifreleme, tokenizasyon ve çok katmanlı güvenlik önlemleri kullanıyoruz. Tüm veriler güvenli sunucularda saklanmakta ve yalnızca yetkili personel tarafından erişilebilmektedir." },
  { title: "6. Haklarınız", content: "KVKK kapsamında aşağıdaki haklara sahipsiniz:", list: ["Verilerinize erişim talebi", "Verilerinizin düzeltilmesi talebi", "Verilerinizin silinmesi talebi", "İşleme itiraz hakkı", "Veri taşınabilirliği hakkı"] },
  { title: "7. İletişim", content: "", email: "gizlilik@moneyshop.iq" },
];

export default function PrivacyPage() {
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
            Gizlilik <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Politikası</span>
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
                {section.content && <p className="text-sm text-[#6B7280] leading-relaxed mb-2">{section.content}</p>}
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
                {section.email && (
                  <p className="text-sm text-[#6B7280] ml-9">
                    <a href={`mailto:${section.email}`} className="text-[#0052FF] hover:underline font-medium">{section.email}</a>
                  </p>
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
