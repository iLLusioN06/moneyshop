"use client";

import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  { title: "1. Çerez Nedir?", content: "Çerezler (cookies), bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını sağlar ve size daha iyi bir kullanıcı deneyimi sunar." },
  { title: "2. Kullandığımız Çerez Türleri", subsections: [
    { title: "Zorunlu Çerezler", desc: "Bu çerezler, web sitemizin düzgün çalışması için gereklidir. Oturum yönetimi, güvenlik ve erişilebilirlik gibi temel işlevleri sağlarlar." },
    { title: "Analitik Çerezler", desc: "Ziyaretçilerin web sitemizi nasıl kullandığını anlamamıza yardımcı olur. Toplanan veriler anonimdir." },
    { title: "İşlevsellik Çerezleri", desc: "Dil tercihleri, oturum bilgileri gibi kullanıcı tercihlerini hatırlayarak kişiselleştirilmiş bir deneyim sunar." },
    { title: "Pazarlama Çerezleri", desc: "İlgi alanlarınıza uygun reklam ve içerikleri göstermek için kullanılır. Yalnızca açık izninizle etkinleştirilir." },
  ]},
  { title: "3. Çerez Yönetimi", content: "Tarayıcı ayarlarınızı değiştirerek çerezleri kabul etmeyebilir, belirli türdeki çerezleri engelleyebilir veya çerezleri silebilirsiniz. Zorunlu çerezlerin devre dışı bırakılması web sitemizin bazı özelliklerinin çalışmamasına neden olabilir.", browsers: ["Google Chrome", "Mozilla Firefox", "Safari", "Microsoft Edge"] },
  { title: "4. Üçüncü Taraf Çerezler", content: "Web sitemizde analitik ve pazarlama amaçlı üçüncü taraf hizmet sağlayıcıların çerezleri kullanılabilir. Bu çerezler ilgili üçüncü tarafların gizlilik politikalarına tabidir." },
  { title: "5. İletişim", content: "", email: "gizlilik@moneyshop.iq" },
];

export default function CookiesPage() {
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
            Çerez <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Politikası</span>
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
                    <h3 className="text-sm font-semibold text-[#0A0E27] mb-1">{sub.title}</h3>
                    <p className="text-sm text-[#6B7280]">{sub.desc}</p>
                  </div>
                ))}

                {section.browsers && (
                  <ul className="space-y-1.5 ml-9 mt-2">
                    {section.browsers.map((browser, j) => (
                      <li key={j} className="text-sm text-[#6B7280] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#00D4AA" }} />
                        {browser}
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
