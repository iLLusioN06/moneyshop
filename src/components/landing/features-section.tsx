"use client";

import type { Language } from "@/lib/landing-i18n";
import { PhoneMockup, PhoneDefaultTopBar } from "./phone-mockup";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function FeaturesSection({ lang, t }: Props) {
  return (
    <section className="section" id="features">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-star" />{t(lang, "features.title")}</div>
          <h2 className="section-title">
            {t(lang, "features.title")} <span className="highlight">{t(lang, "features.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "features.subtitle")}</p>
        </div>

        <div className="features-grid">
          <div className="features-visual animate-on-scroll">
            <div className="hero-visual-inner">
              <PhoneMockup>
                <PhoneDefaultTopBar />
                <div className="phone-balance-card">
                  <div className="phone-balance-label">Hesabım</div>
                  <div className="phone-balance-amount">250.000 TL</div>
                  <div className="phone-iban-row">
                    <span className="phone-iban-label">İBAN</span>
                    <span className="phone-iban-value">IQ12 0001 2345 6789 0123</span>
                  </div>
                </div>
                <div className="phone-actions">
                  <div className="phone-action"><div className="phone-action-icon"><i className="fas fa-qrcode" /></div><div className="phone-action-label">{t(lang, "features.phoneScan")}</div></div>
                  <div className="phone-action"><div className="phone-action-icon"><i className="fas fa-paper-plane" /></div><div className="phone-action-label">{t(lang, "features.phoneTransfer")}</div></div>
                  <div className="phone-action"><div className="phone-action-icon"><i className="fas fa-chart-bar" /></div><div className="phone-action-label">{t(lang, "features.phoneReports")}</div></div>
                  <div className="phone-action"><div className="phone-action-icon"><i className="fas fa-ellipsis-h" /></div><div className="phone-action-label">{""}</div></div>
                </div>
                <div className="phone-recent">{t(lang, "features.phoneRecent")}</div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-arrow-down" /></div>
                    <div><div className="phone-tx-name">Gelen Transfer</div><div className="phone-tx-date">Ahmet Yılmaz</div></div>
                  </div>
                  <div className="phone-tx-right"><div className="phone-tx-amount">+120.000 TL</div><div className="phone-tx-time">Bugün 10:00</div></div>
                </div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-arrow-up" /></div>
                    <div><div className="phone-tx-name">Giden Transfer</div><div className="phone-tx-date">Zeynep Kaya</div></div>
                  </div>
                  <div className="phone-tx-right"><div className="phone-tx-amount outgoing">-50.000 TL</div><div className="phone-tx-time">01.06.2026</div></div>
                </div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-shopping-cart" /></div>
                    <div><div className="phone-tx-name">Alışveriş - Amazon</div><div className="phone-tx-date">Online</div></div>
                  </div>
                  <div className="phone-tx-right"><div className="phone-tx-amount outgoing">-5.000 TL</div><div className="phone-tx-time">31.05.2026</div></div>
                </div>
              </PhoneMockup>
            </div>
          </div>
          <div className="features-list animate-on-scroll">
            {[
              { icon: "fas fa-tachometer-alt", color: "blue", title: "dashboardTitle", desc: "dashboardDesc" },
              { icon: "fas fa-shield-alt", color: "green", title: "securityTitle", desc: "securityDesc" },
              { icon: "fas fa-coins", color: "orange", title: "iqdTitle", desc: "iqdDesc" },
              { icon: "fas fa-code", color: "purple", title: "apiTitle", desc: "apiDesc" },
            ].map((f, i) => (
              <div key={i} className="feature-item">
                <div className={`feature-item-icon ${f.color}`}><i className={f.icon} /></div>
                <div>
                  <h4>{t(lang, `features.${f.title}`)}</h4>
                  <p>{t(lang, `features.${f.desc}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
