"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  { title: "1. KYC Nedir?", content: "Müşterini Tanı (Know Your Customer - KYC), finansal kuruluşların müşterilerinin kimliklerini doğrulamasını ve risk profillerini değerlendirmesini gerektiren bir süreçtir. MoneyShop olarak, KYC süreçlerini CBI düzenlemeleri ve FATF tavsiyelerine uygun şekilde yürütüyoruz." },
  { title: "2. Gerekli Belgeler", content: "", subsections: [
    { title: "Bireysel Müşteriler İçin:", list: ["Geçerli kimlik belgesi (pasaport, kimlik kartı)", "İkametgah belgesi (son 3 ay)", "Vergi kimlik numarası"] },
    { title: "Kurumsal Müşteriler İçin:", list: ["Şirket tescil belgesi ve ana sözleşme", "Ticaret sicil gazetesi", "Vergi levhası", "İmza sirküleri", "Ortaklık yapısı ve gerçek faydalanıcı bilgileri"] },
  ]},
  { title: "3. Doğrulama Süreci", content: "", process: [
    { step: "Başvuru", desc: "Gerekli belgeler online portal üzerinden yüklenir." },
    { step: "İnceleme", desc: "Belgeler uzman ekibimiz tarafından incelenir." },
    { step: "Doğrulama", desc: "Ek kontroller ve gerekirse ek belge talebi." },
    { step: "Onay", desc: "KYC süreci tamamlanır ve hesap aktifleştirilir." },
  ]},
  { title: "4. Periyodik Güncelleme", content: "KYC bilgileriniz düzenli aralıklarla güncellenir. Herhangi bir bilgi değişikliğinde (adres, iletişim bilgileri, ortaklık yapısı vb.) güncel bilgileri tarafımıza bildirmeniz zorunludur." },
  { title: "5. Veri Güvenliği", content: "KYC sürecinde sağladığınız tüm belgeler 256-bit SSL şifreleme ile korunur ve yalnızca yetkili personel tarafından erişilebilir." },
];

export default function KycPage() {
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
            KYC <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Politikası</span>
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
                
                {section.subsections?.map((sub, j) => (
                  <div key={j} className="ml-9 mb-3">
                    <h3 className="text-sm font-semibold text-[#0A0E27] mb-2">{sub.title}</h3>
                    <ul className="space-y-1.5">
                      {sub.list.map((item, k) => (
                        <li key={k} className="text-sm text-[#6B7280] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#00D4AA" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {section.process && (
                  <div className="ml-9 grid gap-3">
                    {section.process.map((step, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)" }}>
                          {j + 1}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-[#0A0E27]">{step.step}:</span>
                          <span className="text-sm text-[#6B7280] ml-1">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-[#6B7280] mt-2">Tüm süreç genellikle 1-3 iş günü içinde tamamlanır.</p>
                  </div>
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
