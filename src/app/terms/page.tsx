"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const sections = [
  { title: "1. Hizmet Şartları", content: "MoneyShop ödeme hizmetleri platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş olursunuz. Bu şartlar, MoneyShop ile kullanıcı arasındaki hak ve yükümlülükleri düzenler." },
  { title: "2. Hesap Kaydı", content: "Hesap oluşturmak için aşağıdaki koşulları kabul etmiş olursunuz:", list: ["Doğru ve güncel bilgi sağlamak", "Hesap bilgilerinizin gizliliğini korumak", "18 yaşından büyük olmak", "Geçerli bir işletmeye sahip olmak", "AML/KYC doğrulama süreçlerini tamamlamak"] },
  { title: "3. Kullanım Kuralları", content: "Platformumuzu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:", list: ["Yasadışı faaliyetlerde bulunmamak", "Kara para aklama veya terör finansmanı amaçlı kullanmamak", "Başka kullanıcıların hesaplarına yetkisiz erişim sağlamamak", "Platformun güvenlik önlemlerini aşmaya çalışmamak"] },
  { title: "4. Ücretler ve Komisyonlar", content: "Tüm işlem ücretleri ve komisyon oranları ilgili sayfalarda belirtilmiştir. MoneyShop, ücret politikasında değişiklik yapma hakkını saklı tutar. Değişiklikler en az 15 gün önceden kullanıcılara bildirilir." },
  { title: "5. Sorumluluk Sınırlamaları", content: "MoneyShop, hizmetlerin kesintisiz veya hatasız çalışacağını garanti etmez. Mücbir sebepler, sistem bakımı veya üçüncü taraf hizmet sağlayıcı kaynaklı kesintilerden sorumlu değildir." },
  { title: "6. Hesap Feshi", content: "MoneyShop, kullanım şartlarının ihlali durumunda hesabınızı askıya alma veya sonlandırma hakkını saklı tutar." },
  { title: "7. Uyuşmazlık Çözümü", content: "İşbu kullanım şartlarından doğan uyuşmazlıklarda Irak Kürdistan Bölgesi mahkemeleri ve icra daireleri yetkilidir." },
];

export default function TermsPage() {
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
            Kullanım <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Şartları</span>
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
