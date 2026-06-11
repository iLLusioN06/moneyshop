"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Language } from "@/lib/landing-i18n";

interface MobileMenuProps {
  menuOpen: boolean;
  activeType: "default" | "individual" | "corporate";
  activeSubmenu: string | null;
  lang: Language;
  session: { user?: { name?: string | null } } | null;
  t: (lang: Language, key: string) => string;
  closeMenu: () => void;
  handleTypeNav: (e: React.MouseEvent<HTMLAnchorElement>, section: string) => void;
  setActiveType: (v: "default" | "individual" | "corporate") => void;
  setActiveSection: (v: string | null) => void;
  setActiveSubmenu: (v: string | null) => void;
  setActiveService: (v: string | null) => void;
}

export function MobileMenu({
  menuOpen,
  activeType,
  activeSubmenu,
  lang,
  session,
  t,
  closeMenu,
  handleTypeNav,
  setActiveType,
  setActiveSection,
  setActiveSubmenu,
  setActiveService,
}: MobileMenuProps) {
  return (
    <div className={`mobile-menu${menuOpen ? " active" : ""}`} id="mobileMenu">
      <div className="mobile-type-menu">
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
      {activeType === "individual" ? (
        <>
          <a href="#transfer" className={activeSubmenu === "transfer" ? "active" : ""} onClick={(e) => handleTypeNav(e, "transfer")}>
            {t(lang, "nav.moneyTransfer")}
          </a>
          <a href="#card" className={activeSubmenu === "card" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card")}>
            {t(lang, "nav.card")}
          </a>
          <a href="#investment" className={activeSubmenu === "investment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "investment")}>
            {t(lang, "nav.investment")}
          </a>
          <a href="#payments" className={activeSubmenu === "payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment")}>
            {t(lang, "nav.paymentOperations")}
          </a>
        </>
      ) : activeType === "corporate" ? (
        <>
          <a href="#physical-payment" className={activeSubmenu === "physical-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "physical-payment")}>
            {t(lang, "nav.physicalPayment")}
          </a>
          <a href="#online-payment" className={activeSubmenu === "online-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "online-payment")}>
            {t(lang, "nav.onlinePayment")}
          </a>
          <a href="#payment-distribution" className={activeSubmenu === "payment-distribution" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment-distribution")}>
            {t(lang, "nav.paymentDistribution")}
          </a>
          <a href="#card-solutions" className={activeSubmenu === "card-solutions" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card-solutions")}>
            {t(lang, "nav.cardSolutions")}
          </a>
        </>
      ) : (
        <>
          <a href="#services" onClick={closeMenu}>
            {t(lang, "nav.services")}
          </a>
          <a href="#how-it-works" onClick={closeMenu}>
            {t(lang, "nav.howItWorks")}
          </a>
          <a href="#card" onClick={closeMenu}>
            {t(lang, "nav.card")}
          </a>
          <a href="#features" onClick={closeMenu}>
            {t(lang, "nav.features")}
          </a>
          <a href="#compliance" onClick={closeMenu}>
            {t(lang, "nav.compliance")}
          </a>
          <a href="#roadmap" onClick={closeMenu}>
            {t(lang, "nav.roadmap")}
          </a>
          <a href="/pricing" onClick={closeMenu}>
            {t(lang, "nav.pricing")}
          </a>
          <a href="/faq" onClick={closeMenu}>
            {t(lang, "nav.faq")}
          </a>
        </>
      )}
      {session?.user ? (
        <>
          <Link href="/dashboard" onClick={closeMenu} style={{ color: "var(--secondary)" }}>
            <i className="fas fa-tachometer-alt" /> Dashboard
          </Link>
          <button
            onClick={() => { closeMenu(); signOut({ callbackUrl: "/" }); }}
            style={{ color: "var(--loss)", cursor: "pointer", border: "none", background: "none", padding: 0 }}
          >
            <i className="fas fa-sign-out-alt" /> Çıkış Yap
          </button>
        </>
      ) : (
        <Link href="/register" onClick={closeMenu} style={{ color: "var(--secondary)" }}>
          {t(lang, "nav.getStarted")}
        </Link>
      )}
    </div>
  );
}
