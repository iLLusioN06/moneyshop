"use client";

import { type Dir, type Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function TrustedSection({ lang, t }: Props) {
  return (
    <section className="trusted-section">
      <div className="trusted-container">
        <p className="trusted-title">{t(lang, "trusted.title")}</p>
        <div className="trusted-logos">
          <div className="trusted-logo"><i className="fas fa-university" />{t(lang, "trusted.centralBank")}</div>
          <div className="trusted-logo"><i className="fas fa-landmark" />{t(lang, "trusted.krg")}</div>
          <div className="trusted-logo"><i className="fas fa-building" />{t(lang, "trusted.iqBanks")}</div>
          <div className="trusted-logo"><i className="fas fa-store" />{t(lang, "trusted.merchants")}</div>
        </div>
      </div>
    </section>
  );
}
