"use client";

import { type Dir, type Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function ServicesSection({ lang, t }: Props) {
  return (
    <section className="section" id="services">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label">
            <i className="fas fa-cogs" />
            {t(lang, "services.title")}
          </div>
          <h2 className="section-title">
            {t(lang, "services.title")} <span className="highlight">{t(lang, "services.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "services.subtitle")}</p>
        </div>

        <div className="services-grid">
          {[
            { icon: "fas fa-cash-register", color: "blue", title: "posTitle", desc: "posDesc" },
            { icon: "fas fa-globe", color: "green", title: "gatewayTitle", desc: "gatewayDesc" },
            { icon: "fas fa-store", color: "orange", title: "merchantTitle", desc: "merchantDesc" },
            { icon: "fas fa-sync-alt", color: "purple", title: "settlementTitle", desc: "settlementDesc" },
            { icon: "fas fa-university", color: "red", title: "bankTitle", desc: "bankDesc" },
            { icon: "fas fa-link", color: "yellow", title: "linksTitle", desc: "linksDesc" },
          ].map((svc, i) => (
            <div key={i} className="service-card animate-on-scroll">
              <div className={`service-icon ${svc.color}`}><i className={svc.icon} /></div>
              <h3>{t(lang, `services.${svc.title}`)}</h3>
              <p>{t(lang, `services.${svc.desc}`)}</p>
              <a href="#" className="service-link"><i className="fas fa-arrow-right" /></a>
            </div>
          ))}
        </div>

        <div className="services-subsection">
          <h3 className="services-subsection-title">
            <i className="fas fa-bolt" />
            {t(lang, "services.transfersTitle")}
          </h3>
        </div>

        <div className="services-grid">
          {[
            { icon: "fas fa-bolt", color: "teal", title: "fastTitle", desc: "fastDesc" },
            { icon: "fas fa-right-left", color: "cyan", title: "eftTitle", desc: "eftDesc" },
            { icon: "fas fa-globe", color: "sky", title: "internationalTitle", desc: "internationalDesc" },
            { icon: "fas fa-qrcode", color: "indigo", title: "ibanTitle", desc: "ibanDesc" },
            { icon: "fas fa-hand-holding-dollar", color: "emerald", title: "requestTitle", desc: "requestDesc" },
            { icon: "fas fa-shield-alt", color: "pink", title: "secureTitle", desc: "secureDesc" },
          ].map((svc, i) => (
            <div key={i} className="service-card animate-on-scroll">
              <div className={`service-icon ${svc.color}`}><i className={svc.icon} /></div>
              <h3>{t(lang, `services.${svc.title}`)}</h3>
              <p>{t(lang, `services.${svc.desc}`)}</p>
              <a href="#" className="service-link"><i className="fas fa-arrow-right" /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
