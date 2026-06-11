"use client";

import type { Language } from "@/lib/landing-i18n";
import Link from "next/link";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function CTASection({ lang, t }: Props) {
  return (
    <section className="cta-section" id="contact">
      <div className="hero-grid" />
      <div className="cta-container animate-on-scroll">
        <h2 dangerouslySetInnerHTML={{ __html: t(lang, "cta.title") }} />
        <p>{t(lang, "cta.description")}</p>
        <div className="cta-buttons">
          <Link href="/register" className="btn-cta-primary">
            <i className="fas fa-rocket" />
            {t(lang, "cta.primary")}
          </Link>
          <a href="#contact" className="btn-cta-secondary">
            <i className="fas fa-phone" />
            {t(lang, "cta.secondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
