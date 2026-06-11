"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function ImpactSection({ lang, t }: Props) {
  return (
    <section className="section impact-section" id="impact">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-chart-line" />{t(lang, "impact.title")}</div>
          <h2 className="section-title">
            {t(lang, "impact.title")} <span className="highlight">{t(lang, "impact.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "impact.subtitle")}</p>
        </div>
        <div className="impact-grid">
          {[
            { icon: "fas fa-mobile-alt", title: "digitalTitle", desc: "digitalDesc" },
            { icon: "fas fa-file-invoice-dollar", title: "formalTitle", desc: "formalDesc" },
            { icon: "fas fa-bolt", title: "fastTitle", desc: "fastDesc" },
            { icon: "fas fa-hand-holding-usd", title: "regionalTitle", desc: "regionalDesc" },
          ].map((item, i) => (
            <div key={i} className="impact-card animate-on-scroll">
              <div className="impact-icon"><i className={item.icon} /></div>
              <h3>{t(lang, `impact.${item.title}`)}</h3>
              <p>{t(lang, `impact.${item.desc}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
