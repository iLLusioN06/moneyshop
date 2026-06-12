"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t } from "@/lib/landing-i18n";
import { getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type FaqItem = { q: string; a: string };

const copy = {
  tr: {
    title: "SSS",
    subtitle: "Sıkça Sorulan Sorular — aradığınız cevabı bulamazsanız bizimle iletişime geçmekten çekinmeyin.",
    notFoundTitle: "Cevabınızı bulamadınız mı?",
    notFoundDesc: "Müşteri hizmetleri ekibimiz 7/24 size yardımcı olmaya hazır.",
    categories: {
      account: "Hesap ve Başvuru",
      transfer: "Para Transferi ve Ödemeler",
      card: "Kart İşlemleri",
      security: "Güvenlik ve Gizlilik",
      support: "Teknik Destek",
    },
    items: {
      accountOpen: {
        q: "MoneyShop hesabı nasıl açarım?",
        a: "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak veya doğrudan /register sayfasına giderek birkaç adımda ücretsiz hesap açabilirsiniz. Kimlik bilgilerinizi girip SMS ile doğrulama yaptıktan sonra hesabınız anında aktif olur.",
      },
      feeOpen: {
        q: "Hesap açmak için herhangi bir ücret ödemem gerekiyor mu?",
        a: "Hayır, bireysel hesap açılışı tamamen ücretsizdir. Herhangi bir başvuru veya aktivasyon ücreti alınmaz.",
      },
      close: {
        q: "Hesabımı nasıl kapatabilirim?",
        a: "Hesabınızı kapatmak için müşteri hizmetlerimizi arayabilir veya destek talebi oluşturabilirsiniz. Kapatma işlemi öncesinde hesabınızda kalan bakiyeyi başka bir hesaba aktarmanız gerekmektedir.",
      },
      multi: {
        q: "Birden fazla hesabım olabilir mi?",
        a: "Evet, hem bireysel hem de kurumsal hesap açabilirsiniz. Aynı türden birden fazla hesap açmak için müşteri hizmetlerimizle iletişime geçebilirsiniz.",
      },
      docs: {
        q: "Kurumsal hesap için hangi belgeler gerekli?",
        a: "Kurumsal hesap için şirket tescil belgesi, imza sirküleri, vergi levhası ve yetkili kişilerin kimlik belgeleri gereklidir. Başvurunuz 1-2 iş günü içerisinde değerlendirilir.",
      },
      transferTime: {
        q: "Para transferi ne kadar sürer?",
        a: "MoneyShop kullanıcıları arası transferler anlık ve ücretsizdir. FAST ile yapılan transferler saniyeler içinde gerçekleşir. EFT/havale işlemleri ise bankalar arası işlem saatlerine bağlı olarak genellikle aynı gün içinde tamamlanır.",
      },
      fastLimit: {
        q: "FAST limiti nedir?",
        a: "Günlük FAST transfer limitiniz 25.000 TL, tek işlem limitiniz ise 10.000 TL'dir. Kurumsal hesaplar için bu limitler daha yüksektir.",
      },
      bankTransfer: {
        q: "Hangi bankalara para gönderebilirim?",
        a: "Tüm Türkiye'deki bankalara EFT/havale ve FAST ile para gönderebilirsiniz. Ayrıca tüm MoneyShop kullanıcılarına anında ücretsiz transfer yapabilirsiniz.",
      },
      international: {
        q: "Uluslararası para transferi yapabiliyor musunuz?",
        a: "Evet, uluslararası para transferi hizmetimiz mevcuttur. Döviz kurları ve işlem ücretleri hakkında detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.",
      },
      billPayment: {
        q: "Fatura ödemesi yapabilir miyim?",
        a: "Evet, mobil uygulama ve web sitemiz üzerinden elektrik, su, doğalgaz, telefon, internet gibi tüm fatura ödemelerinizi gerçekleştirebilirsiniz.",
      },
      cardApply: {
        q: "MoneyShop Card'a nasıl başvururum?",
        a: "MoneyShop Card sayfasından veya /card adresinden başvuru yapabilirsiniz. Standart kart ücretsiz, Silver kart 50 TL, Gold kart ise 150 TL başvuru ücretine sahiptir.",
      },
      lostCard: {
        q: "Kartımı kaybettim/çaldırdım ne yapmalıyım?",
        a: "Hemen müşteri hizmetlerimizi arayarak kartınızı dondurun. Ardından mobil uygulama veya web sitemiz üzerinden kart yenileme talebi oluşturabilirsiniz. Yenileme ücreti 15 TL'dir.",
      },
      limitIncrease: {
        q: "Kart limitimi nasıl artırabilirim?",
        a: "Kart limit artış talebinizi mobil uygulama üzerinden veya müşteri hizmetlerimizi arayarak yapabilirsiniz. Limit artışı gelir durumunuza göre değerlendirilir.",
      },
      block: {
        q: "Kartıma bloke koyabilir miyim?",
        a: "Evet, mobil uygulama üzerinden kartınızı geçici olarak bloke edebilir veya kalıcı olarak iptal ettirebilirsiniz.",
      },
      forgotPin: {
        q: "Kart şifremi unuttum, ne yapmalıyım?",
        a: "Mobil uygulama üzerinden 'Şifremi Unuttum' seçeneğini kullanarak veya müşteri hizmetlerimizi arayarak yeni şifre oluşturabilirsiniz.",
      },
      safe: {
        q: "Kişisel bilgilerim güvende mi?",
        a: "Evet, tüm kişisel ve finansal verileriniz 256-bit SSL şifreleme ile korunur. Ayrıca KVKK ve uluslararası veri güvenliği standartlarına tam uyumluyuz.",
      },
      twoFA: {
        q: "İki faktörlü doğrulama (2FA) var mı?",
        a: "Evet, hesap güvenliğiniz için SMS doğrulama ve e-posta doğrulama gibi iki faktörlü doğrulama yöntemlerini aktif olarak kullanıyoruz.",
      },
      unauthorized: {
        q: "Yetkisiz işlem durumunda ne yapmalıyım?",
        a: "Hesabınızda fark ettiğiniz yetkisiz bir işlemi derhal müşteri hizmetlerimize bildirin. 7/24 destek hattımız üzerinden anında müdahale sağlanır.",
      },
      regulation: {
        q: "MoneyShop hangi düzenlemelere tabidir?",
        a: "MoneyShop, Irak Merkez Bankası (CBI) tarafından lisanslandırılmış bir ödeme hizmet sağlayıcısıdır. Tüm faaliyetlerimiz ilgili yasal düzenlemelere ve denetimlere tabidir.",
      },
      app: {
        q: "Mobil uygulamayı nereden indirebilirim?",
        a: "MoneyShop mobil uygulamasını App Store (iOS) ve Google Play Store (Android) üzerinden ücretsiz olarak indirebilirsiniz.",
      },
      api: {
        q: "API entegrasyonu nasıl yapılır?",
        a: "Kurumsal müşterilerimiz için REST API dokümantasyonu ve teknik destek sağlıyoruz. API kullanımı ücretsizdir. Detaylı bilgi için teknik ekibimizle iletişime geçebilirsiniz.",
      },
      support: {
        q: "Müşteri hizmetlerine nasıl ulaşırım?",
        a: "7/24 müşteri hizmetleri hattımızı arayabilir, e-posta gönderebilir veya web sitemiz üzerinden canlı destek talebi oluşturabilirsiniz. Premium destek paketimizle öncelikli destek alabilirsiniz.",
      },
      history: {
        q: "İşlem geçmişimi nasıl görüntülerim?",
        a: "Tüm işlem geçmişinize mobil uygulama ve web sitemiz üzerinden anlık olarak erişebilir, hesap özeti ve raporları görüntüleyebilirsiniz.",
      },
    },
  },
  en: {
    title: "FAQ",
    subtitle: "Frequently Asked Questions — if you cannot find the answer you are looking for, contact us.",
    notFoundTitle: "Could not find your answer?",
    notFoundDesc: "Our customer service team is ready to help 24/7.",
    categories: {
      account: "Account & Application",
      transfer: "Transfers & Payments",
      card: "Card Operations",
      security: "Security & Privacy",
      support: "Technical Support",
    },
    items: {
      accountOpen: {
        q: "How do I open a MoneyShop account?",
        a: "You can open a free account in a few steps by clicking the 'Register' button on the homepage or by going directly to /register. After entering your identity details and completing SMS verification, your account becomes active immediately.",
      },
      feeOpen: {
        q: "Do I need to pay any fee to open an account?",
        a: "No, opening an individual account is completely free. No application or activation fee is charged.",
      },
      close: {
        q: "How can I close my account?",
        a: "You can call our customer service or create a support request to close your account. Before the closure, you need to transfer any remaining balance to another account.",
      },
      multi: {
        q: "Can I have more than one account?",
        a: "Yes, you can open both individual and corporate accounts. To open more than one account of the same type, please contact customer service.",
      },
      docs: {
        q: "Which documents are required for a corporate account?",
        a: "For a corporate account, company registration certificate, signature circular, tax certificate, and identity documents of authorized persons are required. Your application is reviewed within 1–2 business days.",
      },
      transferTime: {
        q: "How long do transfers take?",
        a: "Transfers between MoneyShop users are instant and free. FAST transfers are completed within seconds. EFT/bank transfers are usually completed on the same day depending on interbank processing hours.",
      },
      fastLimit: {
        q: "What is the FAST limit?",
        a: "Your daily FAST transfer limit is 25,000 TL and your single transaction limit is 10,000 TL. These limits are higher for corporate accounts.",
      },
      bankTransfer: {
        q: "Which banks can I send money to?",
        a: "You can send money to all banks in Turkey via EFT/bank transfer and FAST. You can also make instant free transfers to all MoneyShop users.",
      },
      international: {
        q: "Can you make international transfers?",
        a: "Yes, our international money transfer service is available. For exchange rates and transaction fees, please contact customer service.",
      },
      billPayment: {
        q: "Can I pay bills?",
        a: "Yes, you can pay electricity, water, gas, phone, internet, and all other bills through our mobile app and website.",
      },
      cardApply: {
        q: "How do I apply for a MoneyShop Card?",
        a: "You can apply from the MoneyShop Card page or by visiting /card. The Standard card is free, Silver card costs 50 TL, and Gold card has a 150 TL application fee.",
      },
      lostCard: {
        q: "I lost my card / it was stolen. What should I do?",
        a: "Immediately call customer service to freeze your card. Then create a replacement request through the mobile app or website. The replacement fee is 15 TL.",
      },
      limitIncrease: {
        q: "How can I increase my card limit?",
        a: "You can request a limit increase through the mobile app or by calling customer service. Limit increases are reviewed based on your income status.",
      },
      block: {
        q: "Can I block my card?",
        a: "Yes, you can temporarily block your card or permanently cancel it through the mobile app.",
      },
      forgotPin: {
        q: "I forgot my card PIN. What should I do?",
        a: "You can create a new PIN using the 'Forgot PIN' option in the mobile app or by calling customer service.",
      },
      safe: {
        q: "Is my personal information secure?",
        a: "Yes, all your personal and financial data is protected with 256-bit SSL encryption. We are also fully compliant with KVKK and international data security standards.",
      },
      twoFA: {
        q: "Is two-factor authentication (2FA) available?",
        a: "Yes, we actively use two-factor authentication methods such as SMS verification and email verification for account security.",
      },
      unauthorized: {
        q: "What should I do in case of unauthorized activity?",
        a: "Report any unauthorized transaction you notice immediately to customer service. Our 24/7 support line provides instant response.",
      },
      regulation: {
        q: "Which regulations is MoneyShop subject to?",
        a: "MoneyShop is a payment service provider licensed by the Central Bank of Iraq (CBI). All our activities are subject to relevant legal regulations and supervision.",
      },
      app: {
        q: "Where can I download the mobile app?",
        a: "You can download the MoneyShop mobile app for free from the App Store (iOS) and Google Play Store (Android).",
      },
      api: {
        q: "How do I integrate the API?",
        a: "We provide REST API documentation and technical support for our corporate customers. API usage is free. Please contact our technical team for details.",
      },
      support: {
        q: "How can I reach customer service?",
        a: "You can call our 24/7 customer service line, send an email, or create a live support request on our website. With our premium support package, you get priority assistance.",
      },
      history: {
        q: "How can I view my transaction history?",
        a: "You can access your entire transaction history instantly via the mobile app and website, and view statements and reports.",
      },
    },
  },
} as const;

const faqData = [
  { categoryKey: "account", icon: "fas fa-user-plus", items: ["accountOpen", "feeOpen", "close", "multi", "docs"] },
  { categoryKey: "transfer", icon: "fas fa-exchange-alt", items: ["transferTime", "fastLimit", "bankTransfer", "international", "billPayment"] },
  { categoryKey: "card", icon: "fas fa-credit-card", items: ["cardApply", "lostCard", "limitIncrease", "block", "forgotPin"] },
  { categoryKey: "security", icon: "fas fa-shield-alt", items: ["safe", "twoFA", "unauthorized", "regulation"] },
  { categoryKey: "support", icon: "fas fa-headset", items: ["app", "api", "support", "history"] },
] as const;

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

  const c = lang === "tr" ? copy.tr : copy.en;

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
            <span className="gradient-text">{c.title}</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 48px" }}>
            {c.subtitle}
          </p>

          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 24 }}>
            {faqData.map((group) => (
              <div key={group.categoryKey} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--gray-3)", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", background: "var(--gradient-1)", borderBottom: "1px solid var(--gray-3)", display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={group.icon} style={{ color: "#fff", fontSize: 18, width: 24, textAlign: "center" }} />
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>{c.categories[group.categoryKey]}</h2>
                </div>
                <div>
                  {group.items.map((itemKey, idx) => {
                    const key = `${group.categoryKey}-${idx}`;
                    const item = c.items[itemKey];
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
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{c.notFoundTitle}</h3>
            <p style={{ fontSize: 14, color: "var(--gray-5)", margin: "0 0 20px" }}>
              {c.notFoundDesc}
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
