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
              {["linkedin-in", "twitter", "instagram", "facebook-f", "telegram-plane"].map((s) => (
                <a key={s} href="#"><i className={`fab fa-${s}`} /></a>
              ))}
            </div>
          </div>
          {["services", "company", "legal"].map((col) => (
            <div key={col} className="footer-column">
              <h4>{t(lang, `footer.${col}`)}</h4>
              <ul>
                {tArray(lang, `footer.${col}List`).map((item, i) => (
                  <li key={i}><a href="#">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-column">
            <h4>{t(lang, "footer.contact")}</h4>
            <ul>
              {[
                { icon: "fas fa-map-marker-alt", key: "address" },
                { icon: "fas fa-phone", key: "phone" },
                { icon: "fas fa-envelope", key: "email" },
                { icon: "fas fa-clock", key: "hours" },
              ].map((c, i) => (
                <li key={i}>
                  <a href="#"><i className={c.icon} /> {t(lang, `footer.${c.key}`)}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t(lang, "footer.copyright")}</p>
          <div className="footer-bottom-links">
            {["privacy", "terms", "sitemap"].map((link) => (
              <a key={link} href="#">{t(lang, `footer.${link}`)}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
