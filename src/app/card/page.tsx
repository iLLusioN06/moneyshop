"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type CardTier = "standart" | "silver" | "gold";

const cardGradients: Record<CardTier, string> = {
  standart: "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
  silver: "linear-gradient(135deg, #4a4a5a 0%, #6e6e82 50%, #8e8ea8 100%)",
  gold: "linear-gradient(135deg, #8a6d1f 0%, #c9a84c 50%, #f7e08a 100%)",
};

const cardData: Record<CardTier, { icon: string; benefits: { icon: string; title: string; desc: string }[] }> = {
  standart: {
    icon: "fa-wallet",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-infinity", title: "7/24 Harcama Takibi", desc: "Harcamalarını anlık olarak mobil uygulamadan takip et." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Anlaşmalı üye işyerlerinde özel indirim fırsatları." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
    ],
  },
  silver: {
    icon: "fa-wallet",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-gift", title: "2× Puan", desc: "Her harcamada 2 kat puan kazanma fırsatı." },
      { icon: "fa-plane", title: "Seyahat Sigortası", desc: "Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Premium üye işyerlerinde özel indirim fırsatları." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
      { icon: "fa-coins", title: "Yüksek Nakit Avans", desc: "Avantajlı faiz oranlarıyla nakit avans imkanı." },
    ],
  },
  gold: {
    icon: "fa-crown",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-crown", title: "Premium Lounge Erişimi", desc: "Havalimanlarında premium lounge ücretsiz giriş." },
      { icon: "fa-gem", title: "3× Puan", desc: "Her harcamada 3 kat puan kazanma ayrıcalığı." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Elite üye işyerlerinde ayrıcalıklı indirimler." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
      { icon: "fa-coins", title: "Yüksek Nakit Avans", desc: "En avantajlı faiz oranlarıyla yüksek nakit avans." },
      { icon: "fa-headset", title: "7/24 Öncelikli Destek", desc: "Öncelikli müşteri hattı ile 7/24 destek." },
      { icon: "fa-user-tie", title: "Özel Müşteri Temsilcisi", desc: "Size özel atanmış müşteri temsilcisi desteği." },
    ],
  },
};

export default function CardApplicationPage() {
  const { data: session } = useSession();
  const [selectedTier, setSelectedTier] = useState<CardTier>("standart");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("default");
  const [lang, setLang] = useState<Language>("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = getLangDir(lang);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLang = (code: string) => {
    setLang(code as Language);
    setLangMenuOpen(false);
  };

  return (
    <div className="landing-page">
      {/* ========== NAVBAR ========== */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-container">
          <div className="nav-row-top">
            <Link href="/" className="logo">
              <div className="logo-icon">
                <i className="fas fa-wallet" />
              </div>
              <span className="logo-text">
                Money<span>Shop</span>
              </span>
            </Link>

            <div className="nav-type-menu">
              <button
                className={`nav-type-link${activeType === "individual" ? " active" : ""}`}
                onClick={() => setActiveType("individual")}
              >
                {currentLang.code === "tr" ? "Bireysel" : "Individual"}
              </button>
              <span className="nav-type-sep">|</span>
              <button
                className={`nav-type-link${activeType === "corporate" ? " active" : ""}`}
                onClick={() => setActiveType("corporate")}
              >
                {currentLang.code === "tr" ? "Kurumsal" : "Corporate"}
              </button>
            </div>

            <div className="nav-actions">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="btn-nav-login">
                    <div className="nav-user-avatar">{(session.user.name || "K")[0]}</div>
                    <span>{session.user.name || "Kullanıcı"}</span>
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-nav-cta" style={{ cursor: "pointer", border: "none" }}>
                    <i className="fas fa-sign-out-alt" /> {currentLang.code === "tr" ? "Çıkış" : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-nav-login">{currentLang.code === "tr" ? "Giriş Yap" : "Login"}</Link>
                  <Link href="/register" className="btn-nav-cta">{currentLang.code === "tr" ? "Kayıt Ol" : "Get Started"}</Link>
                </>
              )}

              <div className="lang-dropdown" ref={langMenuRef}>
                <button className="nav-lang" onClick={() => setLangMenuOpen(!langMenuOpen)} aria-label="Dil seç">
                  <i className="fas fa-globe" />
                  <span>{currentLang.flag}</span>
                  <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                  <i className={`fas fa-chevron-${dir === "rtl" ? "left" : "down"} lang-arrow`} />
                </button>
                {langMenuOpen && (
                  <div className="lang-dropdown-menu">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-dropdown-item${l.code === lang ? " active" : ""}`}
                        onClick={() => changeLang(l.code)}
                      >
                        <span className="lang-flag">{l.flag}</span>
                        <span className="lang-label">{l.label}</span>
                        {l.code === lang && <i className="fas fa-check lang-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className={`menu-toggle${menuOpen ? " active" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

          <ul className={`nav-links${activeType !== "default" ? " type-menu-active" : ""}`}>
            {activeType === "individual" ? (
              <>
                <li><a href="/#transfer">{currentLang.code === "tr" ? "Para Transferi" : "Money Transfer"}</a></li>
                <li><a href="/#card" className="active">{currentLang.code === "tr" ? "MoneyShop Card" : "MoneyShop Card"}</a></li>
                <li><a href="/#investment">{currentLang.code === "tr" ? "Yatırım" : "Investment"}</a></li>
                <li><a href="/#payments">{currentLang.code === "tr" ? "Ödeme İşlemleri" : "Payment Operations"}</a></li>
              </>
            ) : activeType === "corporate" ? (
              <>
                <li><a href="/#physical-payment">{currentLang.code === "tr" ? "Fiziki Ödeme Al" : "Physical Payment"}</a></li>
                <li><a href="/#online-payment">{currentLang.code === "tr" ? "Online Ödeme Al" : "Online Payment"}</a></li>
                <li><a href="/#payment-distribution">{currentLang.code === "tr" ? "Ödeme Dağıt" : "Payment Distribution"}</a></li>
                <li><a href="/#card-solutions">{currentLang.code === "tr" ? "Kart Çözümleri" : "Card Solutions"}</a></li>
              </>
            ) : (
              <>
                <li><a href="/#services">{currentLang.code === "tr" ? "Hizmetler" : "Services"}</a></li>
                <li><a href="/#how-it-works">{currentLang.code === "tr" ? "Nasıl Çalışır" : "How It Works"}</a></li>
                <li><a href="/#card" className="active">{currentLang.code === "tr" ? "MoneyShop Card" : "MoneyShop Card"}</a></li>
                <li><a href="/#features">{currentLang.code === "tr" ? "Özellikler" : "Features"}</a></li>
                <li><a href="/#compliance">{currentLang.code === "tr" ? "Uyumluluk" : "Compliance"}</a></li>
                <li><a href="/#roadmap">{currentLang.code === "tr" ? "Yol Haritası" : "Roadmap"}</a></li>
                <li><a href="/pricing">{currentLang.code === "tr" ? "Ücretler" : "Pricing"}</a></li>
                <li><a href="/faq">{currentLang.code === "tr" ? "SSS" : "FAQ"}</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 900, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">MoneyShop Card</span> Başvurusu
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 44px" }}>
            Size en uygun kartı seçin, avantajlarla dolu dünyaya adım atın.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 48 }}>
            {(["standart", "silver", "gold"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                style={{
                  flex: 1, maxWidth: 260, padding: "20px 24px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  border: selectedTier === tier ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                  background: "var(--white)",
                  transition: "all 0.3s ease", boxShadow: selectedTier === tier ? "0 8px 30px rgba(0,82,255,0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <i className={`fas ${tier === "gold" ? "fa-crown" : "fa-credit-card"}`} style={{ fontSize: 20, color: tier === "standart" ? "#1a5fc7" : tier === "silver" ? "#6e6e82" : "#c9a84c" }} />
                  <span style={{ fontWeight: 700, fontSize: 16, color: selectedTier === tier ? "var(--dark)" : "var(--gray-5)" }}>
                    {tier === "standart" ? "Standart" : tier === "silver" ? "Silver" : "Gold"} Card
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--gray-5)", margin: 0 }}>
                  {tier === "standart" ? "Temel kart ihtiyaçları" : tier === "silver" ? "Avantajlı kart deneyimi" : "Premium ayrıcalıklar"}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0", color: selectedTier === tier ? "var(--primary)" : "var(--gray-5)" }}>
                  {tier === "standart" ? "Ücretsiz" : tier === "silver" ? "₺49/yıl" : "₺149/yıl"}
                </p>
              </button>
            ))}
          </div>

          <div className="service-detail" style={{ border: "none", padding: 0, textAlign: "left" }}>
            <div style={{ display: "flex", gap: 50, alignItems: "flex-start", justifyContent: "center" }}>
              <div style={{ flexShrink: 0, paddingTop: 10 }}>
                <div className={`hero-stack-card card-${selectedTier}`} style={{ position: "relative", top: 0, left: 0, transform: "none", width: 200, height: 290 }}>
                  <div className="card-bg-shine" />
                  <div className="hero-card-top">
                    <div className="hero-card-brand">
                      <i className={`fas ${cardData[selectedTier].icon}`} />
                      <span>MoneyShop</span>
                    </div>
                    <div className="hero-card-chip">
                      <div className="chip-lines"><div /><div /><div /><div /></div>
                    </div>
                  </div>
                  <div className="hero-card-type">{selectedTier === "standart" ? "Standart" : selectedTier === "silver" ? "Silver" : "Gold"} Card</div>
                  <div className="hero-card-contactless">
                    <svg viewBox="0 0 32 38">
                      <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                </div>
              </div>

              <div style={{ maxWidth: 480 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {cardData[selectedTier].benefits.map((b, i) => (
                    <div key={i} className="service-feature" style={{ gap: 14, padding: "12px 16px", background: "#fff", border: "1px solid var(--gray-3)", borderRadius: 14 }}>
                      <i className={`fas ${b.icon}`} style={{ fontSize: 16, color: "var(--primary)", marginTop: 2 }} />
                      <div>
                        <strong style={{ fontSize: 13 }}>{b.title}</strong>
                        <span style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 2, display: "block" }}>{b.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href={session?.user ? "#" : "/register"}
                  className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", textDecoration: "none" }}
                  onClick={session?.user ? (e) => { e.preventDefault(); alert(`${selectedTier === "standart" ? "Standart" : selectedTier === "silver" ? "Silver" : "Gold"} Card başvurunuz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.`); } : undefined}
                >
                  <i className="fas fa-paper-plane" />
                  {session?.user
                    ? `${selectedTier === "standart" ? "Standart" : selectedTier === "silver" ? "Silver" : "Gold"} Card Başvurusunu Tamamla`
                    : "Kayıt Ol ve Başvur"}
                </Link>
                <p style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 12 }}>
                  Başvurunuz 24 saat içinde değerlendirmeye alınacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
