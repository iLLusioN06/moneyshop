import Link from "next/link";
import { type Language, t } from "@/lib/landing-i18n";

interface Tab {
  key: string;
  label: string;
}

interface VisualCard {
  icon: string;
  title: string;
  subtitle: string;
  gradient: string;
  shadow: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Benefit {
  icon: string;
  title: string;
  desc: string;
}

interface TabbedServiceSectionProps {
  lang: Language;
  title: string;
  highlight: string;
  description: string;
  ctaText?: string;
  visualCards: VisualCard[];
  features: Feature[];
  tabs: Tab[];
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  tabBenefits: Record<string, Benefit[]>;
}

export function TabbedServiceSection({
  lang,
  title,
  highlight,
  description,
  ctaText = "Hemen Başla",
  visualCards,
  features,
  tabs,
  selectedTab,
  onSelectTab,
  tabBenefits,
}: TabbedServiceSectionProps) {
  const selectedVisual = visualCards.find((_, i) => tabs[i]?.key === selectedTab) ?? visualCards[0];
  const benefits = tabBenefits[selectedTab] ?? [];

  return (
    <div className="service-detail">
      <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            <span className="gradient-text">{title}</span>{" "}
            <span className="gradient-text">{highlight}</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--gray-5)", maxWidth: 540, marginBottom: 28 }}>
            {description}
          </p>
          <Link href="/register" className="btn-primary">
            <i className="fas fa-paper-plane" /> {ctaText}
          </Link>
        </div>
        <div style={{ display: "flex", gap: 24, padding: "20px 0" }}>
          {visualCards.map((vc, i) => (
            <div key={i} style={{
              width: 170, height: 240, borderRadius: 16, flexShrink: 0,
              background: vc.gradient,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              boxShadow: vc.shadow, color: "var(--white)", padding: 20,
            }}>
              <i className={vc.icon} style={{ fontSize: 36 }} />
              <div style={{ fontWeight: 700, fontSize: 14, textAlign: "center" }}>{vc.title}</div>
              <div style={{ fontSize: 11, opacity: 0.8, textAlign: "center" }}>{vc.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 40 }}>
        {features.map((f, i) => (
          <div key={i} className="service-feature" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 24px", background: "var(--white)", border: "1px solid var(--gray-3)" }}>
            <i className={f.icon} style={{ fontSize: 32, marginBottom: 12 }} />
            <strong style={{ fontSize: 16 }}>{f.title}</strong>
            <span style={{ fontSize: 13, lineHeight: 1.6 }}>{f.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60 }}>
        <h3 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 30 }}>
          Seçenekler
        </h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 36 }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => onSelectTab(tab.key)} style={{
              padding: "12px 28px", borderRadius: 12,
              border: selectedTab === tab.key ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
              background: selectedTab === tab.key ? "var(--primary)" : "transparent",
              color: selectedTab === tab.key ? "var(--white)" : "var(--gray-5)",
              fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s ease",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 50, alignItems: "flex-start", justifyContent: "center" }}>
          <div style={{
            width: 200, height: 200, borderRadius: 24, flexShrink: 0,
            background: selectedVisual?.gradient,
            display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10,
            boxShadow: selectedVisual?.shadow,
          }}>
            <i className={selectedVisual?.icon ?? ""} style={{ fontSize: 64, color: "rgba(255,255,255,0.9)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}>
            {benefits.map((b, i) => (
              <div key={i} className="service-feature" style={{ gap: 12, padding: "12px 16px", background: "var(--white)", border: "1px solid var(--gray-3)", borderRadius: 14 }}>
                <i className={b.icon} style={{ fontSize: 16, color: "var(--primary)" }} />
                <div>
                  <strong style={{ fontSize: 13 }}>{b.title}</strong>
                  <span style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 2, display: "block" }}>{b.desc}</span>
                </div>
              </div>
            ))}
            <Link href="/register" className="btn-primary" style={{ padding: "12px 28px", fontSize: 14, textAlign: "center" }}>
              <i className="fas fa-plus-circle" /> {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
