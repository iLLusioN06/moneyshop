"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function HowItWorksSection({ lang, t }: Props) {
  return (
    <section className="section how-it-works" id="how-it-works">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-route" />{t(lang, "how.title")}</div>
          <h2 className="section-title">
            {t(lang, "how.title")} <span className="highlight">{t(lang, "how.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "how.subtitle")}</p>
        </div>
        <div className="steps-container">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="step-card animate-on-scroll">
              <div className="step-number">{step}</div>
              <h3>{t(lang, `how.step${step}Title`)}</h3>
              <p>{t(lang, `how.step${step}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
