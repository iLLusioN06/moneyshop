import Link from "next/link";
import { type Language, t } from "@/lib/landing-i18n";

interface CardDetailSectionProps {
  lang: Language;
  selectedCard: "standart" | "silver" | "gold";
  onSelectCard: (card: "standart" | "silver" | "gold") => void;
  hasSession: boolean;
}

const CARD_BENEFITS: Record<string, { icon: string; title: string; desc: string; color?: string }[]> = {
  standart: [
    { icon: "fas fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
    { icon: "fas fa-infinity", title: "7/24 Harcama Takibi", desc: "Harcamalarını anlık olarak mobil uygulamadan takip et." },
    { icon: "fas fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
    { icon: "fas fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
    { icon: "fas fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
    { icon: "fas fa-percent", title: "Özel İndirimler", desc: "Anlaşmalı üye işyerlerinde özel indirim fırsatları." },
    { icon: "fas fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
  ],
  silver: [
    { icon: "fas fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
    { icon: "fas fa-gift", title: "2× Puan", desc: "Her harcamada 2 kat puan kazanma fırsatı." },
    { icon: "fas fa-plane", title: "Seyahat Sigortası", desc: "Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta." },
    { icon: "fas fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
    { icon: "fas fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
    { icon: "fas fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
    { icon: "fas fa-percent", title: "Özel İndirimler", desc: "Premium üye işyerlerinde özel indirim fırsatları." },
    { icon: "fas fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
    { icon: "fas fa-coins", title: "Yüksek Nakit Avans", desc: "Avantajlı faiz oranlarıyla nakit avans imkanı." },
  ],
  gold: [
    { icon: "fas fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla.", color: "var(--accent)" },
    { icon: "fas fa-crown", title: "Premium Lounge Erişimi", desc: "Havalimanlarında premium lounge ücretsiz giriş.", color: "var(--accent)" },
    { icon: "fas fa-gem", title: "3× Puan", desc: "Her harcamada 3 kat puan kazanma ayrıcalığı.", color: "var(--accent)" },
    { icon: "fas fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme.", color: "var(--accent)" },
    { icon: "fas fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim.", color: "var(--accent)" },
    { icon: "fas fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi.", color: "var(--accent)" },
    { icon: "fas fa-percent", title: "Özel İndirimler", desc: "Elite üye işyerlerinde ayrıcalıklı indirimler.", color: "var(--accent)" },
    { icon: "fas fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart.", color: "var(--accent)" },
    { icon: "fas fa-coins", title: "Yüksek Nakit Avans", desc: "En avantajlı faiz oranlarıyla yüksek nakit avans.", color: "var(--accent)" },
    { icon: "fas fa-headset", title: "7/24 Öncelikli Destek", desc: "Öncelikli müşteri hattı ile 7/24 destek.", color: "var(--accent)" },
    { icon: "fas fa-user-tie", title: "Özel Müşteri Temsilcisi", desc: "Size özel atanmış müşteri temsilcisi desteği.", color: "var(--accent)" },
  ],
};

function CardVisual({ type, lang }: { type: "standart" | "silver" | "gold"; lang: Language }) {
  return (
    <div className={`hero-stack-card card-${type}`} style={{ position: "relative", top: 0, left: 0, transform: "none", width: 190, height: 280, flexShrink: 0 }}>
      <div className="card-bg-shine" />
      <div className="hero-card-top">
        <div className="hero-card-brand">
          <i className={type === "gold" ? "fas fa-crown" : "fas fa-wallet"} />
          <span>MoneyShop</span>
        </div>
        <div className="hero-card-chip"><div className="chip-lines"><div /><div /><div /><div /></div></div>
      </div>
      <div className="hero-card-type">{t(lang, `card.${type}.name`)}</div>
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
  );
}

export function CardDetailSection({ lang, selectedCard, onSelectCard, hasSession }: CardDetailSectionProps) {
  const benefits = CARD_BENEFITS[selectedCard] ?? [];
  const accentColor = selectedCard === "gold" ? "var(--accent)" : "var(--primary)";

  return (
    <div className="service-detail">
      <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            <span className="gradient-text">{t(lang, "card.title")}</span>{" "}
            <span className="gradient-text">{t(lang, "card.highlight")}</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--gray-5)", maxWidth: 540, marginBottom: 28 }}>
            {t(lang, "card.subtitle")}
          </p>
          <Link href="/register" className="btn-primary">
            <i className="fas fa-paper-plane" /> Hemen Başvur
          </Link>
        </div>
        <div style={{ display: "flex", gap: 24, padding: "20px 0" }}>
          <CardVisual type="standart" lang={lang} />
          <CardVisual type="silver" lang={lang} />
          <CardVisual type="gold" lang={lang} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 40 }}>
        <div className="service-feature" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 24px", background: "var(--white)", border: "1px solid var(--gray-3)" }}>
          <i className="fas fa-mobile-alt" style={{ fontSize: 32, marginBottom: 12 }} />
          <strong style={{ fontSize: 16 }}>MoneyShop Mobil&apos;i İndir</strong>
          <span style={{ fontSize: 13, lineHeight: 1.6 }}>Uygulamayı ücretsiz indir, hemen hesabını oluştur.</span>
        </div>
        <div className="service-feature" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 24px", background: "var(--white)", border: "1px solid var(--gray-3)" }}>
          <i className="fas fa-gem" style={{ fontSize: 32, marginBottom: 12 }} />
          <strong style={{ fontSize: 16 }}>Harca &amp; Kazan</strong>
          <span style={{ fontSize: 13, lineHeight: 1.6 }}>Onlarca üye işyerinde harca, harcadıkça kazan!</span>
        </div>
        <div className="service-feature" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 24px", background: "var(--white)", border: "1px solid var(--gray-3)" }}>
          <i className="fas fa-chart-pie" style={{ fontSize: 32, marginBottom: 12 }} />
          <strong style={{ fontSize: 16 }}>Paranı Yönet</strong>
          <span style={{ fontSize: 13, lineHeight: 1.6 }}>Ödemelerin ve para transferlerin tek bir yerde, güvende.</span>
        </div>
      </div>

      <div style={{ marginTop: 60 }}>
        <h3 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 30 }}>
          Senin MoneyShop Card&apos;ın Hangisi?
        </h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 36 }}>
          {(["standart", "silver", "gold"] as const).map((card) => (
            <button key={card} onClick={() => onSelectCard(card)} style={{
              padding: "12px 28px", borderRadius: 12,
              border: selectedCard === card ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
              background: selectedCard === card ? "var(--primary)" : "transparent",
              color: selectedCard === card ? "var(--white)" : "var(--gray-5)",
              fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s ease",
            }}>
              {card === "standart" ? "Standart" : card === "silver" ? "Silver" : "Gold"} Card
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 50, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <CardVisual type={selectedCard} lang={lang} />
            {hasSession ? (
              selectedCard === "standart" ? (
                <div style={{ padding: "10px 24px", borderRadius: 12, background: "rgba(16,185,129,0.1)", color: "var(--success)", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>
                  <i className="fas fa-check-circle" style={{ marginRight: 8, color: "var(--success)" }} />Bu karta sahipsin
                </div>
              ) : (
                <Link href="/card" className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>
                  <i className="fas fa-plus-circle" /> Bu karta sahip ol
                </Link>
              )
            ) : (
              <Link href="/register" className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>
                <i className="fas fa-plus-circle" /> Bu karta sahip ol
              </Link>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {benefits.map((b, i) => (
              <div key={i} className="service-feature" style={{ gap: 12, padding: "12px 16px", background: "var(--white)", border: "1px solid var(--gray-3)", borderRadius: 14 }}>
                <i className={b.icon} style={{ fontSize: 16, color: b.color ?? accentColor }} />
                <div>
                  <strong style={{ fontSize: 13 }}>{b.title}</strong>
                  <span style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 2, display: "block" }}>{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
