"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t } from "@/lib/landing-i18n";
import { getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

interface FaqItem {
  q: string;
  a: string;
}

const faqData: { category: string; icon: string; items: FaqItem[] }[] = [
  {
    category: "Hesap ve Başvuru",
    icon: "fas fa-user-plus",
    items: [
      { q: "MoneyShop hesabı nasıl açarım?", a: "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak veya doğrudan /register sayfasına giderek birkaç adımda ücretsiz hesap açabilirsiniz. Kimlik bilgilerinizi girip SMS ile doğrulama yaptıktan sonra hesabınız anında aktif olur." },
      { q: "Hesap açmak için herhangi bir ücret ödemem gerekiyor mu?", a: "Hayır, bireysel hesap açılışı tamamen ücretsizdir. Herhangi bir başvuru veya aktivasyon ücreti alınmaz." },
      { q: "Hesabımı nasıl kapatabilirim?", a: "Hesabınızı kapatmak için müşteri hizmetlerimizi arayabilir veya destek talebi oluşturabilirsiniz. Kapatma işlemi öncesinde hesabınızda kalan bakiyeyi başka bir hesaba aktarmanız gerekmektedir." },
      { q: "Birden fazla hesabım olabilir mi?", a: "Evet, hem bireysel hem de kurumsal hesap açabilirsiniz. Aynı türden birden fazla hesap açmak için müşteri hizmetlerimizle iletişime geçebilirsiniz." },
      { q: "Kurumsal hesap için hangi belgeler gerekli?", a: "Kurumsal hesap için şirket tescil belgesi, imza sirküleri, vergi levhası ve yetkili kişilerin kimlik belgeleri gereklidir. Başvurunuz 1-2 iş günü içerisinde değerlendirilir." },
    ],
  },
  {
    category: "Para Transferi ve Ödemeler",
    icon: "fas fa-exchange-alt",
    items: [
      { q: "Para transferi ne kadar sürer?", a: "MoneyShop kullanıcıları arası transferler anlık ve ücretsizdir. FAST ile yapılan transferler saniyeler içinde gerçekleşir. EFT/havale işlemleri ise bankalar arası işlem saatlerine bağlı olarak genellikle aynı gün içinde tamamlanır." },
      { q: "FAST limiti nedir?", a: "Günlük FAST transfer limitiniz 25.000 TL, tek işlem limitiniz ise 10.000 TL'dir. Kurumsal hesaplar için bu limitler daha yüksektir." },
      { q: "Hangi bankalara para gönderebilirim?", a: "Tüm Türkiye'deki bankalara EFT/havale ve FAST ile para gönderebilirsiniz. Ayrıca tüm MoneyShop kullanıcılarına anında ücretsiz transfer yapabilirsiniz." },
      { q: "Uluslararası para transferi yapabiliyor musunuz?", a: "Evet, uluslararası para transferi hizmetimiz mevcuttur. Döviz kurları ve işlem ücretleri hakkında detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz." },
      { q: "Fatura ödemesi yapabilir miyim?", a: "Evet, mobil uygulama ve web sitemiz üzerinden elektrik, su, doğalgaz, telefon, internet gibi tüm fatura ödemelerinizi gerçekleştirebilirsiniz." },
    ],
  },
  {
    category: "Kart İşlemleri",
    icon: "fas fa-credit-card",
    items: [
      { q: "MoneyShop Card'a nasıl başvururum?", a: "MoneyShop Card sayfasından veya /card adresinden başvuru yapabilirsiniz. Standart kart ücretsiz, Silver kart 50 TL, Gold kart ise 150 TL başvuru ücretine sahiptir." },
      { q: "Kartımı kaybettim/çaldırdım ne yapmalıyım?", a: "Hemen müşteri hizmetlerimizi arayarak kartınızı dondurun. Ardından mobil uygulama veya web sitemiz üzerinden kart yenileme talebi oluşturabilirsiniz. Yenileme ücreti 15 TL'dir." },
      { q: "Kart limitimi nasıl artırabilirim?", a: "Kart limit artış talebinizi mobil uygulama üzerinden veya müşteri hizmetlerimizi arayarak yapabilirsiniz. Limit artışı gelir durumunuza göre değerlendirilir." },
      { q: "Kartıma bloke koyabilir miyim?", a: "Evet, mobil uygulama üzerinden kartınızı geçici olarak bloke edebilir veya kalıcı olarak iptal ettirebilirsiniz." },
      { q: "Kart şifremi unuttum, ne yapmalıyım?", a: "Mobil uygulama üzerinden 'Şifremi Unuttum' seçeneğini kullanarak veya müşteri hizmetlerimizi arayarak yeni şifre oluşturabilirsiniz." },
    ],
  },
  {
    category: "Güvenlik ve Gizlilik",
    icon: "fas fa-shield-alt",
    items: [
      { q: "Kişisel bilgilerim güvende mi?", a: "Evet, tüm kişisel ve finansal verileriniz 256-bit SSL şifreleme ile korunur. Ayrıca KVKK ve uluslararası veri güvenliği standartlarına tam uyumluyuz." },
      { q: "İki faktörlü doğrulama (2FA) var mı?", a: "Evet, hesap güvenliğiniz için SMS doğrulama ve e-posta doğrulama gibi iki faktörlü doğrulama yöntemlerini aktif olarak kullanıyoruz." },
      { q: "Yetkisiz işlem durumunda ne yapmalıyım?", a: "Hesabınızda fark ettiğiniz yetkisiz bir işlemi derhal müşteri hizmetlerimize bildirin. 7/24 destek hattımız üzerinden anında müdahale sağlanır." },
      { q: "MoneyShop hangi düzenlemelere tabidir?", a: "MoneyShop, Irak Merkez Bankası (CBI) tarafından lisanslandırılmış bir ödeme hizmet sağlayıcısıdır. Tüm faaliyetlerimiz ilgili yasal düzenlemelere ve denetimlere tabidir." },
    ],
  },
  {
    category: "Teknik Destek",
    icon: "fas fa-headset",
    items: [
      { q: "Mobil uygulamayı nereden indirebilirim?", a: "MoneyShop mobil uygulamasını App Store (iOS) ve Google Play Store (Android) üzerinden ücretsiz olarak indirebilirsiniz." },
      { q: "API entegrasyonu nasıl yapılır?", a: "Kurumsal müşterilerimiz için REST API dokümantasyonu ve teknik destek sağlıyoruz. API kullanımı ücretsizdir. Detaylı bilgi için teknik ekibimizle iletişime geçebilirsiniz." },
      { q: "Müşteri hizmetlerine nasıl ulaşırım?", a: "7/24 müşteri hizmetleri hattımızı arayabilir, e-posta gönderebilir veya web sitemiz üzerinden canlı destek talebi oluşturabilirsiniz. Premium destek paketimizle öncelikli destek alabilirsiniz." },
      { q: "İşlem geçmişimi nasıl görüntülerim?", a: "Tüm işlem geçmişinize mobil uygulama ve web sitemiz üzerinden anlık olarak erişebilir, hesap özeti ve raporları görüntüleyebilirsiniz." },
    ],
  },
];

export default function FaqPage() {
  const { data: session } = useSession();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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

          <ul className="nav-links">
            <li><a href="/#services">{currentLang.code === "tr" ? "Hizmetler" : "Services"}</a></li>
            <li><a href="/#how-it-works">{currentLang.code === "tr" ? "Nasıl Çalışır" : "How It Works"}</a></li>
            <li><a href="/card">{currentLang.code === "tr" ? "MoneyShop Card" : "MoneyShop Card"}</a></li>
            <li><a href="/#features">{currentLang.code === "tr" ? "Özellikler" : "Features"}</a></li>
            <li><a href="/#compliance">{currentLang.code === "tr" ? "Uyumluluk" : "Compliance"}</a></li>
            <li><a href="/#roadmap">{currentLang.code === "tr" ? "Yol Haritası" : "Roadmap"}</a></li>
            <li><a href="/pricing">{t(lang, "nav.pricing")}</a></li>
            <li><a href="/faq" className="active">{currentLang.code === "tr" ? "SSS" : "FAQ"}</a></li>
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 800, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">SSS</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 48px" }}>
            Sıkça Sorulan Sorular — aradığınız cevabı bulamazsanız bizimle iletişime geçmekten çekinmeyin.
          </p>

          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 24 }}>
            {faqData.map((group) => (
              <div key={group.category} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--gray-3)", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", background: "var(--gradient-1)", borderBottom: "1px solid var(--gray-3)", display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={group.icon} style={{ color: "#fff", fontSize: 18, width: 24, textAlign: "center" }} />
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>{group.category}</h2>
                </div>
                <div>
                  {group.items.map((item, idx) => {
                    const key = `${group.category}-${idx}`;
                    const isOpen = openItems.has(key);
                    return (
                      <div key={key} style={{ borderBottom: idx < group.items.length - 1 ? "1px solid var(--gray-2)" : "none" }}>
                        <button
                          onClick={() => toggleItem(key)}
                          style={{
                            width: "100%", padding: "16px 24px", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                            cursor: "pointer", border: "none", background: "none", textAlign: "left",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 12, color: "var(--dark)", transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <span>{item.q}</span>
                          <i
                            className={`fas fa-chevron-${dir === "rtl" ? "left" : "down"}`}
                            style={{
                              fontSize: 12, color: "var(--gray-5)", flexShrink: 0,
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.3s",
                            }}
                          />
                        </button>
                        <div
                          style={{
                            maxHeight: isOpen ? 500 : 0,
                            overflow: "hidden",
                            transition: "max-height 0.4s ease, padding 0.3s ease",
                            padding: isOpen ? "0 24px 18px" : "0 24px",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 14, color: "var(--gray-5)", lineHeight: 1.7 }}>
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: 32, background: "#fff", borderRadius: 16, border: "1px solid var(--gray-3)" }}>
            <i className="fas fa-headset" style={{ fontSize: 32, color: "var(--primary)", marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Cevabınızı bulamadınız mı?</h3>
            <p style={{ fontSize: 14, color: "var(--gray-5)", margin: "0 0 20px" }}>
              Müşteri hizmetleri ekibimiz 7/24 size yardımcı olmaya hazır.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-phone" style={{ color: "var(--primary)" }} /> 444 0 123
              </span>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-envelope" style={{ color: "var(--primary)" }} /> destek@moneyshop.com
              </span>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-comment-dots" style={{ color: "var(--primary)" }} /> Canlı Destek
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
