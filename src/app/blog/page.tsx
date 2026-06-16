"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Tag, ArrowRight } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { t, tArray, type Language } from "@/lib/landing-i18n";
import "../landing.css";

const posts = [
  { date: "2024-11-28", title: "Irak'ta Dijital Ödemenin Geleceği", category: "Sektör", excerpt: "Irak'ın dijital ödeme ekosistemi hızla büyüyor. Geleneksel bankacılıktan mobil ödemelere geçişteki trendleri inceliyoruz.", color: "#0052FF" },
  { date: "2024-11-15", title: "İşletmeniz için Doğru POS Sistemi Nasıl Seçilir?", category: "Rehber", excerpt: "İşletmenizin ihtiyaçlarına uygun POS sistemi seçerken dikkat etmeniz gereken 5 önemli faktör.", color: "#00D4AA" },
  { date: "2024-10-30", title: "AML ve KYC Uyumluluğu: İşletmeler için Kılavuz", category: "Rehber", excerpt: "Anti-Para Aklama (AML) ve Müşterini Tanı (KYC) düzenlemeleri hakkında bilmeniz gereken her şey.", color: "#FF6B35" },
  { date: "2024-10-10", title: "E-ticarette Ödeme Güvenliği için En İyi Uygulamalar", category: "Güvenlik", excerpt: "Çevrimiçi mağazanızda ödeme güvenliğini artırmak için uygulayabileceğiniz pratik adımlar.", color: "#8B5CF6" },
  { date: "2024-09-22", title: "Fintech Sektöründe 2025 Trendleri", category: "Sektör", excerpt: "Gelecek yıl finansal teknoloji sektörüne yön verecek trendleri ve beklentileri sizler için derledik.", color: "#0052FF" },
];

export default function BlogPage() {
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
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0E27] mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1px" }}>
            Fintech <span style={{ background: "linear-gradient(135deg, #0052FF, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            Fintech, dijital ödemeler ve iş dünyası hakkında güncel yazılar, rehberler ve sektör analizleri.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid gap-6 mb-16">
          {posts.map((post, i) => (
            <article key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: `${post.color}12`, color: post.color }}>
                  <Tag className="w-3 h-3 inline mr-1" />
                  {post.category}
                </span>
                <span className="text-xs text-[#9CA3BF] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[#0A0E27] mb-2 group-hover:text-[#0052FF] transition-colors">{post.title}</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity">
                Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </article>
          ))}
        </div>
      </main>

      <div className="footer-scope">
        <FooterSection lang={"tr" as Language} t={t} tArray={tArray} />
      </div>
    </div>
  );
}
