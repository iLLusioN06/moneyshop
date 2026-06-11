"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function ComplianceSection({ lang, t }: Props) {
  return (
    <section className="section compliance-section" id="compliance">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-shield-alt" />{t(lang, "compliance.title")}</div>
          <h2 className="section-title">
            {t(lang, "compliance.title")} <span className="highlight">{t(lang, "compliance.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "compliance.subtitle")}</p>
        </div>
        <div className="compliance-grid">
          {[
            { icon: "fas fa-user-shield", iconClass: "shield", title: "kycTitle", desc: "kycDesc" },
            { icon: "fas fa-lock", iconClass: "lock", title: "dataTitle", desc: "dataDesc" },
            { icon: "fas fa-search", iconClass: "eye", title: "monitoringTitle", desc: "monitoringDesc" },
          ].map((c, i) => (
            <div key={i} className="compliance-card animate-on-scroll">
              <div className={`compliance-icon ${c.iconClass}`}><i className={c.icon} /></div>
              <h3>{t(lang, `compliance.${c.title}`)}</h3>
              <p>{t(lang, `compliance.${c.desc}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
