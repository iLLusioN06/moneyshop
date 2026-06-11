"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t } from "@/lib/landing-i18n";
import { getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type PricingTab = "fees" | "limits";

interface PricingFeeItem {
  name: string;
  fee: string;
  note: string;
}

interface PricingLimitItem {
  name: string;
  limit: string;
  note: string;
}

type PricingItem = PricingFeeItem | PricingLimitItem;

const feesData = {
  individual: [
    { name: "Hesap Açılış Ücreti", fee: "Ücretsiz", note: "Hiçbir ücret ödemeden hesap açın." },
    { name: "Aylık Hesap İşletim Ücreti", fee: "0 TL", note: "Aylık hesap işletim ücreti yoktur." },
    { name: "Kart Başvuru Ücreti (Standart)", fee: "Ücretsiz", note: "Standart kart başvurusu ücretsizdir." },
    { name: "Kart Başvuru Ücreti (Silver)", fee: "50 TL", note: "Tek seferlik Silver kart başvuru ücreti." },
    { name: "Kart Başvuru Ücreti (Gold)", fee: "150 TL", note: "Tek seferlik Gold kart başvuru ücreti." },
    { name: "Yıllık Kart Ücreti (Standart)", fee: "0 TL", note: "Standart kart yıllık ücretsiz." },
    { name: "Yıllık Kart Ücreti (Silver)", fee: "120 TL", note: "Silver kart yıllık kullanım ücreti." },
    { name: "Yıllık Kart Ücreti (Gold)", fee: "360 TL", note: "Gold kart yıllık kullanım ücreti." },
    { name: "Kart Yenileme Ücreti", fee: "15 TL", note: "Kayıp/çalıntı durumunda kart yenileme." },
    { name: "Para Yatırma (ATM/Şube)", fee: "Ücretsiz", note: "Tüm para yatırma işlemleri ücretsiz." },
    { name: "Para Çekme (Kendi ATM)", fee: "Ücretsiz", note: "Kendi ATM'lerimizden para çekme ücretsiz." },
    { name: "Para Çekme (Farklı ATM)", fee: "5 TL + BSMV", note: "Farklı banka ATM'lerinden para çekme." },
    { name: "EFT/Havale (Diğer Bankalara)", fee: "1,50 TL", note: "Diğer bankalara EFT/havale işlem ücreti." },
    { name: "FAST Transfer", fee: "0,75 TL", note: "FAST sistemi ile anlık para transferi." },
    { name: "Mobile Shop Transfer", fee: "Ücretsiz", note: "MoneyShop kullanıcıları arası transfer ücretsiz." },
    { name: "Yatırım Hesabı Açılış", fee: "Ücretsiz", note: "Yatırım hesabı açılışı ücretsiz." },
    { name: "Hisse Senedi Alım/Satım", fee: "%0,1", note: "İşlem hacmi üzerinden komisyon." },
    { name: "Fon Alım/Satım", fee: "%0,05", note: "Fon işlemlerinde düşük komisyon oranı." },
    { name: "Kripto Para Alım/Satım", fee: "%0,2", note: "Kripto para işlem komisyonu." },
    { name: "QR Ödeme (Satıcı)", fee: "%1,5", note: "QR ile ödeme alım komisyonu." },
    { name: "Sanal POS (İşlem Başına)", fee: "%2,0 + 0,25 TL", note: "Online ödeme işlem komisyonu." },
    { name: "POS Cihazı Kiralama", fee: "49 TL/ay", note: "Fiziki POS cihazı aylık kira ücreti." },
    { name: "Mobil POS Kullanım", fee: "19 TL/ay", note: "Mobil POS yazılım kullanım ücreti." },
    { name: "Toplu Ödeme İşlem", fee: "0,50 TL/işlem", note: "Toplu ödeme başına işlem ücreti." },
    { name: "Komisyon Dağıtımı", fee: "%1", note: "Otomatik komisyon dağıtım hizmet bedeli." },
    { name: "Hesap Özeti (Basılı)", fee: "5 TL", note: "Basılı hesap özeti talep ücreti." },
    { name: "İptal/İade İşlemi", fee: "2 TL", note: "İptal ve iade işlem ücreti." },
    { name: "Masraf Bildirim SMS", fee: "0,20 TL", note: "Her işlem sonrası SMS bildirim ücreti." },
  ],
  corporate: [
    { name: "Kurumsal Hesap Açılış", fee: "Ücretsiz", note: "Kurumsal hesap açılışı ücretsizdir." },
    { name: "Aylık Hesap İşletim Ücreti", fee: "99 TL", note: "Kurumsal hesap aylık işletim ücreti." },
    { name: "POS Cihazı (Kiralama)", fee: "99 TL/ay", note: "Premium POS cihazı aylık kira." },
    { name: "Sanal POS Komisyon", fee: "%1,8", note: "Online ödeme işlem komisyonu (kurumsal)." },
    { name: "Toplu Ödeme (Kurumsal)", fee: "0,35 TL/işlem", note: "Kurumsal toplu ödeme işlem ücreti." },
    { name: "Kurumsal Kart (Yıllık)", fee: "250 TL", note: "Kurumsal kart yıllık ücret." },
    { name: "API Kullanım", fee: "Ücretsiz", note: "API entegrasyonu ve kullanımı ücretsiz." },
    { name: "Teknik Destek (Premium)", fee: "500 TL/ay", note: "7/24 öncelikli teknik destek paketi." },
    { name: "Fiziki POS Kurulum", fee: "250 TL", note: "POS cihazı kurulum ve aktivasyon ücreti." },
    { name: "Ödeme Linki (Kurumsal)", fee: "%1,5", note: "Link ile ödeme komisyonu." },
  ],
};

const limitsData = {
  individual: [
    { name: "Günlük Para Çekme Limiti", limit: "10.000 TL", note: "ATM ve şubelerden günlük para çekme limiti." },
    { name: "Tek Seferlik Para Çekme", limit: "5.000 TL", note: "ATM'den tek seferde çekilebilecek maksimum tutar." },
    { name: "Günlük Harcama Limiti", limit: "25.000 TL", note: "Kart ile günlük toplam harcama limiti." },
    { name: "Tek İşlem Harcama Limiti", limit: "10.000 TL", note: "Tek seferde yapılabilecek maksimum kart harcaması." },
    { name: "Günlük EFT/Havale Limiti", limit: "50.000 TL", note: "Günlük toplam EFT/havale gönderme limiti." },
    { name: "Tek İşlem EFT Limiti", limit: "25.000 TL", note: "Tek EFT/havale işleminde gönderilebilecek maksimum tutar." },
    { name: "Günlük FAST Limiti", limit: "25.000 TL", note: "FAST sistemi ile günlük toplam transfer limiti." },
    { name: "Tek İşlem FAST Limiti", limit: "10.000 TL", note: "Tek FAST işleminde gönderilebilecek maksimum tutar." },
    { name: "Günlük Para Yatırma Limiti", limit: "50.000 TL", note: "ATM/şubeden günlük para yatırma limiti." },
    { name: "Mobil Transfer Limiti", limit: "10.000 TL", note: "Mobil uygulamadan günlük transfer limiti." },
    { name: "Temassız Ödeme Limiti", limit: "1.500 TL", note: "Tek temassız ödeme işlem limiti." },
    { name: "QR Ödeme Limiti", limit: "5.000 TL", note: "Tek QR ödeme işlem limiti." },
    { name: "Günlük QR Ödeme Limiti", limit: "15.000 TL", note: "Günlük toplam QR ödeme limiti." },
    { name: "POS İşlem Limiti", limit: "25.000 TL", note: "Tek POS işleminde maksimum ödeme tutarı." },
    { name: "Minumum Bakiye", limit: "0 TL", note: "Hesapta bulunması gereken minimum bakiye yoktur." },
    { name: "Maksimum Bakiye", limit: "500.000 TL", note: "Bireysel hesaplarda bulunabilecek maksimum bakiye." },
    { name: "Günlük Yatırım İşlem Limiti", limit: "100.000 TL", note: "Günlük toplam alım/satım işlem limiti." },
    { name: "Kripto Para İşlem Limiti", limit: "25.000 TL", note: "Tek kripto para işlem limiti." },
    { name: "Toplu Ödeme Limiti", limit: "100.000 TL/gün", note: "Günlük toplu ödeme gönderme limiti." },
    { name: "Alıcı Sayısı (Toplu Ödeme)", limit: "500 kişi", note: "Tek toplu ödemede maksimum alıcı sayısı." },
    { name: "Kart İşlem Sıklığı", limit: "50 işlem/gün", note: "Kart ile günlük maksimum işlem sayısı." },
  ],
  corporate: [
    { name: "Günlük Para Çekme", limit: "100.000 TL", note: "Kurumsal hesaplar için günlük para çekme limiti." },
    { name: "Günlük EFT/Havale Limiti", limit: "500.000 TL", note: "Kurumsal günlük toplam EFT/havale limiti." },
    { name: "Tek İşlem EFT Limiti", limit: "250.000 TL", note: "Kurumsal tek EFT işlem limiti." },
    { name: "Günlük Harcama Limiti", limit: "250.000 TL", note: "Kurumsal kart günlük harcama limiti." },
    { name: "POS İşlem Limiti", limit: "100.000 TL", note: "Kurumsal POS işlem limiti." },
    { name: "Toplu Ödeme Limiti", limit: "1.000.000 TL/gün", note: "Kurumsal günlük toplu ödeme limiti." },
    { name: "Alıcı Sayısı (Toplu Ödeme)", limit: "2.000 kişi", note: "Kurumsal toplu ödemede maksimum alıcı." },
    { name: "Minumum Bakiye", limit: "10.000 TL", note: "Kurumsal hesaplarda bulunması gereken minimum bakiye." },
    { name: "Maksimum Bakiye", limit: "5.000.000 TL", note: "Kurumsal hesaplarda bulunabilecek maksimum bakiye." },
    { name: "Günlük İşlem Sayısı", limit: "1.000 işlem/gün", note: "Kurumsal günlük maksimum işlem sayısı." },
    { name: "Kart İşlem Sıklığı", limit: "200 işlem/gün", note: "Kurumsal kart ile günlük maksimum işlem." },
    { name: "API İstek Limiti", limit: "10.000 istek/saat", note: "API saatlik maksimum istek limiti." },
  ],
};

export default function PricingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<PricingTab>("fees");
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("individual");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Language>("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = getLangDir(lang);

  const currentFee = (item: PricingItem): string =>
    "fee" in item ? (item as PricingFeeItem).fee : (item as PricingLimitItem).limit;

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

  const typeKey = activeType === "corporate" ? "corporate" : "individual";
  const dataSource: PricingItem[] = activeTab === "fees" ? feesData[typeKey] : limitsData[typeKey];

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

          <ul className="nav-links">
            <li><a href="/#services">{currentLang.code === "tr" ? "Hizmetler" : "Services"}</a></li>
            <li><a href="/#how-it-works">{currentLang.code === "tr" ? "Nasıl Çalışır" : "How It Works"}</a></li>
            <li><a href="/card">{currentLang.code === "tr" ? "MoneyShop Card" : "MoneyShop Card"}</a></li>
            <li><a href="/#features">{currentLang.code === "tr" ? "Özellikler" : "Features"}</a></li>
            <li><a href="/#compliance">{currentLang.code === "tr" ? "Uyumluluk" : "Compliance"}</a></li>
            <li><a href="/#roadmap">{currentLang.code === "tr" ? "Yol Haritası" : "Roadmap"}</a></li>
            <li><a href="/pricing" className="active">{t(lang, "nav.pricing")}</a></li>
            <li><a href="/faq">{currentLang.code === "tr" ? "SSS" : "FAQ"}</a></li>
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 900, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">Ücretler</span> ve Limitler
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 44px" }}>
            Şeffaf ücretlendirme ve limit politikamızla herhangi bir sürprizle karşılaşmazsınız.
          </p>

          {/* Account Type + Tabs */}
          <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Bireysel/Kurumsal tabs */}
            <div style={{ display: "flex", gap: 8, background: "var(--gray-2)", padding: 4, borderRadius: 12 }}>
              <button
                onClick={() => setActiveType("individual")}
                style={{
                  padding: "8px 24px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeType === "individual" ? "#fff" : "transparent",
                  color: activeType === "individual" ? "var(--dark)" : "var(--gray-5)",
                  boxShadow: activeType === "individual" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {currentLang.code === "tr" ? "Bireysel" : "Individual"}
              </button>
              <button
                onClick={() => setActiveType("corporate")}
                style={{
                  padding: "8px 24px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeType === "corporate" ? "#fff" : "transparent",
                  color: activeType === "corporate" ? "var(--dark)" : "var(--gray-5)",
                  boxShadow: activeType === "corporate" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {currentLang.code === "tr" ? "Kurumsal" : "Corporate"}
              </button>
            </div>

            {/* Ücretler / Limitler tabs */}
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--gray-3)", borderRadius: 12, overflow: "hidden" }}>
              <button
                onClick={() => setActiveTab("fees")}
                style={{
                  padding: "14px 36px", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeTab === "fees" ? "var(--primary)" : "#fff",
                  color: activeTab === "fees" ? "#fff" : "var(--gray-5)",
                }}
              >
                <i className="fas fa-tag" style={{ marginRight: 10 }} />
                Ücretler
              </button>
              <button
                onClick={() => setActiveTab("limits")}
                style={{
                  padding: "14px 36px", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeTab === "limits" ? "var(--primary)" : "#fff",
                  color: activeTab === "limits" ? "#fff" : "var(--gray-5)",
                }}
              >
                <i className="fas fa-sliders-h" style={{ marginRight: 10 }} />
                Limitler
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ textAlign: "left", overflow: "hidden", borderRadius: 16, border: "1px solid var(--gray-3)", background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--gradient-1)", borderBottom: "1px solid var(--gray-3)" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff" }}>
                    {activeTab === "fees" ? "Hizmet / İşlem" : "Limit Türü"}
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff", width: 180 }}>
                    {activeTab === "fees" ? "Ücret" : "Limit"}
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff" }}>
                    Açıklama
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataSource.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--dark)" }}>
                      <><i className="fas fa-circle" style={{ fontSize: 6, color: "var(--primary)", marginRight: 12, verticalAlign: "middle" }} />{item.name}</>
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 700, color: "var(--primary)" }}>
                      {currentFee(item)}
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--gray-5)", fontSize: 13 }}>
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 20, textAlign: "center" }}>
            * Tüm ücret ve limitler başvuru anında geçerli olan güncel oranlardır. Değişiklik hakkı saklıdır.
          </p>
        </div>
      </main>
    </div>
  );
}
