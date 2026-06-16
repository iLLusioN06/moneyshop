"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
  tArray: (lang: Language, key: string) => string[];
}

export function FooterSection({ lang, t, tArray }: Props) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <div className="logo-icon"><i className="fas fa-wallet" /></div>
              <span className="logo-text">Money<span>Shop</span></span>
            </a>
            <p>{t(lang, "footer.description")}</p>
            <div className="footer-social">
              {[
                { id: "linkedin-in", url: "https://www.linkedin.com/company/moneyshop" },
                { id: "twitter", url: "https://twitter.com/moneyshop" },
                { id: "instagram", url: "https://instagram.com/moneyshop" },
                { id: "facebook-f", url: "https://facebook.com/moneyshop" },
                { id: "telegram-plane", url: "https://t.me/moneyshop" },
              ].map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"><i className={`fab fa-${s.id}`} /></a>
              ))}
            </div>
          </div>
          {(["services", "company", "legal"] as const).map((col) => {
            const colLinks: Record<string, string[]> = {
              services: ["/pricing", "/pricing", "/pricing", "/register"],
              company: ["/about", "/careers", "/press", "/blog", "/contact"],
              legal: ["/privacy", "/terms", "/aml", "/kyc", "/cookies"],
            };
            return (
              <div key={col} className="footer-column">
                <h4>{t(lang, `footer.${col}`)}</h4>
                <ul>
                  {tArray(lang, `footer.${col}List`).map((item, i) => (
                    <li key={i}><a href={colLinks[col]?.[i] ?? "#"}>{item}</a></li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="footer-column">
            <h4>{t(lang, "footer.contact")}</h4>
            <ul>
              {[
                { icon: "fas fa-map-marker-alt", key: "address", href: null },
                { icon: "fas fa-phone", key: "phone", href: "tel:+964750000000" },
                { icon: "fas fa-envelope", key: "email", href: "mailto:info@moneyshop.iq" },
                { icon: "fas fa-clock", key: "hours", href: null },
              ].map((c, i) => (
                <li key={i}>
                  {c.href ? (
                    <a href={c.href}><i className={c.icon} /> {t(lang, `footer.${c.key}`)}</a>
                  ) : (
                    <span><i className={c.icon} /> {t(lang, `footer.${c.key}`)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t(lang, "footer.copyright")}</p>
          <div className="footer-bottom-links">
            {[
              { key: "privacy", href: "/privacy" },
              { key: "terms", href: "/terms" },
              { key: "sitemap", href: "/sitemap" },
            ].map((link) => (
              <a key={link.key} href={link.href}>{t(lang, `footer.${link.key}`)}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
