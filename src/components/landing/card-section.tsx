"use client";

import type { Language } from "@/lib/landing-i18n";
import { CreditCard } from "./credit-card";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
  tArray: (lang: Language, key: string) => string[];
}

const CARD_TYPES = ["standart", "silver", "gold"] as const;

export function CardSection({ lang, t, tArray }: Props) {
  return (
    <section className="section card-section" id="card">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label">
            <i className="fas fa-credit-card" />
            {t(lang, "card.title")}
          </div>
          <h2 className="section-title">
            {t(lang, "card.title")} <span className="highlight">{t(lang, "card.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "card.subtitle")}</p>
        </div>

        <div className="cards-grid">
          {CARD_TYPES.map((type, idx) => (
            <div key={type} className={`card-tier animate-on-scroll${type === "silver" ? " popular" : ""}`}>
              {type === "silver" && <div className="card-tier-badge">{t(lang, "card.popular")}</div>}
              <div className="hero-card-flipper">
                <div className="hero-card-inner">
                  <div className={`hero-card-front card-${type}`}>
                    <div className="card-bg-shine" />
                    <div className="hero-card-top">
                      <div className="hero-card-brand">
                        <i className={type === "gold" ? "fas fa-crown" : "fas fa-wallet"} />
                        <span>MoneyShop</span>
                      </div>
                      <div className="hero-card-chip">
                        <div className="chip-lines"><div /><div /><div /><div /></div>
                      </div>
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
                    <div className="hero-card-network">
                      <i className={type === "standart" ? "fab fa-cc-mastercard" : "fab fa-cc-visa"} />
                    </div>
                  </div>
                  <div className={`hero-card-back card-${type}`}>
                    <div className="card-magnetic-strip" />
                    <div className="card-back-content">
                      <div className="card-cvv-row">
                        <span className="hero-card-label">CVV</span>
                        <span className="hero-card-value">***</span>
                      </div>
                      <div className="card-number-full">**** **** **** {["4582", "6731", "8904"][idx]}</div>
                      <div className="card-back-row">
                        <div className="card-back-field">
                          <span className="hero-card-label">KART SAHİBİ</span>
                          <span className="hero-card-value">MUSTAFA K.</span>
                        </div>
                        <div className="card-back-field">
                          <span className="hero-card-label">SON KULLANMA</span>
                          <span className="hero-card-value">{["12/28", "12/28", "12/30"][idx]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="card-tier-name">{t(lang, `card.${type}.name`)}</h3>
              <div className="card-tier-price">
                <span className="price">{t(lang, `card.${type}.price`)}</span>
                <span className="period">{t(lang, `card.${type}.period`)}</span>
              </div>
              <ul className="card-tier-features">
                {tArray(lang, `card.${type}.features`).map((f, i) => (
                  <li key={i}><i className="fas fa-check" /> {f}</li>
                ))}
              </ul>
              <a href="/register" className={`card-tier-btn${type === "silver" ? " silver-btn" : ""}${type === "gold" ? " gold-btn" : ""}`}>
                {t(lang, `card.${type}.cta`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
