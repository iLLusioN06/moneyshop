"use client";

import { type RefObject } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LANGUAGES, type Dir, type Language } from "@/lib/landing-i18n";

interface NavbarProps {
  scrolled: boolean;
  activeType: string;
  activeSubmenu: string | null;
  lang: Language;
  dir: Dir;
  currentLang: { code: string; flag: string; label: string };
  langMenuOpen: boolean;
  menuOpen: boolean;
  session: { user?: { name?: string | null } } | null;
  navbarRef: RefObject<HTMLDivElement | null>;
  langMenuRef: RefObject<HTMLDivElement | null>;
  navLinksRef: RefObject<HTMLUListElement | null>;
  t: (lang: Language, key: string) => string;
  scrollToTop: () => void;
  handleTypeNav: (e: React.MouseEvent<HTMLAnchorElement>, section: string) => void;
  setActiveType: (v: "default" | "individual" | "corporate") => void;
  setActiveSection: (v: string | null) => void;
  setActiveSubmenu: (v: string | null) => void;
  setActiveService: (v: string | null) => void;
  setLangMenuOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  changeLang: (code: Language) => void;
}

export function Navbar({
  scrolled,
  activeType,
  activeSubmenu,
  lang,
  dir,
  currentLang,
  langMenuOpen,
  menuOpen,
  session,
  navbarRef,
  langMenuRef,
  navLinksRef,
  t,
  scrollToTop,
  handleTypeNav,
  setActiveType,
  setActiveSection,
  setActiveSubmenu,
  setActiveService,
  setLangMenuOpen,
  setMenuOpen,
  changeLang,
}: NavbarProps) {
  return (
    <nav ref={navbarRef} className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        {/* TOP ROW: Logo + Type Menu + Actions + Hamburger */}
        <div className="nav-row-top">
          <Link href="/" className="logo" onClick={() => window.location.reload()}>
            <div className="logo-icon">
              <i className="fas fa-wallet" />
            </div>
            <span className="logo-text">
              Money<span>Shop</span>
            </span>
          </Link>

          <div className="nav-type-menu">
            <button
              className={`nav-type-link${activeType === "individual" ? " active" : ""}`}
              onClick={() => { setActiveType("individual"); setActiveSection(null); setActiveSubmenu(null); setActiveService(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              {t(lang, "nav.individual")}
            </button>
            <span className="nav-type-sep">|</span>
            <button
              className={`nav-type-link${activeType === "corporate" ? " active" : ""}`}
              onClick={() => { setActiveType("corporate"); setActiveSection(null); setActiveSubmenu(null); setActiveService(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              {t(lang, "nav.corporate")}
            </button>
          </div>

          <div className="nav-actions">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="btn-nav-login">
                  <div className="nav-user-avatar">
                    {(session.user.name || "K")[0]}
                  </div>
                  <span>{session.user.name || "Kullanıcı"}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-nav-cta"
                  style={{ cursor: "pointer", border: "none" }}
                >
                  <i className="fas fa-sign-out-alt" />
                  {" "}
                  {t(lang, "nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-nav-login">
                  {t(lang, "nav.login")}
                </Link>
                <Link href="/register" className="btn-nav-cta">
                  {t(lang, "nav.getStarted")}
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <div className="lang-dropdown" ref={langMenuRef}>
              <button className="nav-lang" onClick={() => setLangMenuOpen(!langMenuOpen)} aria-label="Dil seç">
                <i className="fas fa-globe" />
                <span>{currentLang.flag}</span>
                <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                <i className={`fas fa-chevron-${dir === "rtl" ? "left" : "down"} lang-arrow`} />
              </button>
              {langMenuOpen && (
                <div className="lang-dropdown-menu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-dropdown-item${l.code === lang ? " active" : ""}`}
                      onClick={() => changeLang(l.code)}
                    >
                      <span className="lang-flag">{l.flag}</span>
                      <span className="lang-label">{l.label}</span>
                      {l.code === lang && <i className="fas fa-check lang-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            className={`menu-toggle${menuOpen ? " active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* BOTTOM ROW: Nav Links */}
        <ul className={`nav-links${activeType !== "default" ? " type-menu-active" : ""}`} ref={navLinksRef}>
          {activeType === "individual" ? (
            <>
              <li>
                <a href="#transfer" className={activeSubmenu === "transfer" ? "active" : ""} onClick={(e) => handleTypeNav(e, "transfer")}>{t(lang, "nav.moneyTransfer")}</a>
              </li>
              <li>
                <a href="#card" className={activeSubmenu === "card" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card")}>{t(lang, "nav.card")}</a>
              </li>
              <li>
                <a href="#investment" className={activeSubmenu === "investment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "investment")}>{t(lang, "nav.investment")}</a>
              </li>
              <li>
                <a href="#payments" className={activeSubmenu === "payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment")}>{t(lang, "nav.paymentOperations")}</a>
              </li>
            </>
          ) : activeType === "corporate" ? (
            <>
              <li>
                <a href="#physical-payment" className={activeSubmenu === "physical-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "physical-payment")}>{t(lang, "nav.physicalPayment")}</a>
              </li>
              <li>
                <a href="#online-payment" className={activeSubmenu === "online-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "online-payment")}>{t(lang, "nav.onlinePayment")}</a>
              </li>
              <li>
                <a href="#payment-distribution" className={activeSubmenu === "payment-distribution" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment-distribution")}>{t(lang, "nav.paymentDistribution")}</a>
              </li>
              <li>
                <a href="#card-solutions" className={activeSubmenu === "card-solutions" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card-solutions")}>{t(lang, "nav.cardSolutions")}</a>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="#services" className="active">
                  {t(lang, "nav.services")}
                </a>
              </li>
              <li>
                <a href="#how-it-works">{t(lang, "nav.howItWorks")}</a>
              </li>
              <li>
                <a href="#card">{t(lang, "nav.card")}</a>
              </li>
              <li>
                <a href="#features">{t(lang, "nav.features")}</a>
              </li>
              <li>
                <a href="#compliance">{t(lang, "nav.compliance")}</a>
              </li>
              <li>
                <a href="#roadmap">{t(lang, "nav.roadmap")}</a>
              </li>
              <li>
                <a href="/pricing">{t(lang, "nav.pricing")}</a>
              </li>
              <li>
                <a href="/faq">{t(lang, "nav.faq")}</a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
