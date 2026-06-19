"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { type Language, LANGUAGES, t, tArray, getLangDir } from "@/lib/landing-i18n";
import "./landing.css";
import { Navbar } from "@/components/landing/navbar";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { Hero } from "@/components/landing/hero";
import { TrustedSection } from "@/components/landing/trusted-section";
import { ServicesSection } from "@/components/landing/services-section";
import { CardSection } from "@/components/landing/card-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ComplianceSection } from "@/components/landing/compliance-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { ImpactSection } from "@/components/landing/impact-section";
import { CTASection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";
import { TransferSection } from "@/components/landing/transfer-section";
import { CardDetailSection } from "@/components/landing/card-detail-section";
import { TabbedServiceSection } from "@/components/landing/tabbed-service-section";
import {
  INVESTMENT_DATA, PAYMENT_DATA, PHYSICAL_PAYMENT_DATA,
  ONLINE_PAYMENT_DATA, PAYMENT_DISTRIBUTION_DATA, CARD_SOLUTIONS_DATA,
} from "@/components/landing/service-sections-data";

function getInitialLang(): Language {
  if (typeof window === "undefined") return "tr";
  const saved = localStorage.getItem("moneyshop-lang") as Language | null;
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  return "tr";
}

export default function LandingPage() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("default");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [fastSlideIndex, setFastSlideIndex] = useState(0);
  const [eftSlideIndex, setEftSlideIndex] = useState(0);
  const [internationalSlideIndex, setInternationalSlideIndex] = useState(0);
  const [ibanSlideIndex, setIbanSlideIndex] = useState(0);
  const [requestSlideIndex, setRequestSlideIndex] = useState(0);
  const [secureSlideIndex, setSecureSlideIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<"standart" | "silver" | "gold">("standart");
  const [selectedInvest, setSelectedInvest] = useState<"fund" | "stock" | "crypto">("fund");
  const [selectedPayment, setSelectedPayment] = useState<"fast" | "recurring" | "qr">("fast");
  const [selectedPhysicalPayment, setSelectedPhysicalPayment] = useState<"pos" | "contactless" | "mpos">("pos");
  const [selectedOnlinePayment, setSelectedOnlinePayment] = useState<"virtual" | "link" | "api">("virtual");
  const [selectedPaymentDist, setSelectedPaymentDist] = useState<"bulk" | "supplier" | "commission">("bulk");
  const [selectedCardSolution, setSelectedCardSolution] = useState<"physical" | "virtual" | "prepaid">("physical");
  const navbarRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLUListElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const dir = getLangDir(lang);

  useEffect(() => { localStorage.setItem("moneyshop-lang", lang); }, [lang]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const changeLang = (newLang: Language) => { setLang(newLang); setLangMenuOpen(false); };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (activeService !== "fast") return;
    const id = window.setInterval(() => setFastSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "eft") return;
    const id = window.setInterval(() => setEftSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "international") return;
    const id = window.setInterval(() => setInternationalSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "iban") return;
    const id = window.setInterval(() => setIbanSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "request") return;
    const id = window.setInterval(() => setRequestSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "secure") return;
    const id = window.setInterval(() => setSecureSlideIndex((p) => (p + 1) % 5), 5000);
    return () => window.clearInterval(id);
  }, [activeService]);

  useEffect(() => {
    setTimeout(() => {
      if (activeService === "fast") setFastSlideIndex(0);
      if (activeService === "eft") setEftSlideIndex(0);
      if (activeService === "international") setInternationalSlideIndex(0);
      if (activeService === "iban") setIbanSlideIndex(0);
      if (activeService === "request") setRequestSlideIndex(0);
      if (activeService === "secure") setSecureSlideIndex(0);
    }, 0);
  }, [activeService]);

  useEffect(() => {
    const sectionsRef: Element[] = [];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setScrollTopVisible(scrollY > 500);
      if (navLinksRef.current) {
        const links = navLinksRef.current.querySelectorAll("a");
        sectionsRef.forEach((section) => {
          if (!section) return;
          const el = section as HTMLElement;
          const sectionTop = el.offsetTop;
          const sectionHeight = el.offsetHeight;
          const sectionId = section.getAttribute("id");
          links.forEach((link) => {
            if (link.getAttribute("href") === `#${sectionId}`) {
              if (scrollY + 100 >= sectionTop && scrollY + 100 < sectionTop + sectionHeight) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            }
          });
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.querySelectorAll("section[id]").forEach((s) => sectionsRef.push(s));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.querySelectorAll(".animate-on-scroll.animated").forEach((el) => el.classList.remove("animated"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("animated"), index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target as HTMLElement;
          const target = parseFloat(counter.getAttribute("data-target") || "0");
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const startTime = performance.now();
          function updateCounter(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = target * easeOut;
            counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
            if (progress < 1) requestAnimationFrame(updateCounter);
            else counter.textContent = isDecimal ? target.toFixed(1) : target.toString();
          }
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".counter").forEach((counter) => counterObserver.observe(counter));
    return () => { observer.disconnect(); counterObserver.disconnect(); };
  }, [activeType, activeService]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const closeMenu = () => setMenuOpen(false);

  const handleTypeNav = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    closeMenu();
    setActiveSection(section);
    setActiveSubmenu(section);
    setActiveService(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceClick = (e: React.MouseEvent, service: string) => {
    e.preventDefault();
    setActiveService(service);
    try { window.history.pushState({ openService: service }, ""); } catch { /* ignore */ }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPop = () => setActiveService(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div className="landing-page" dir={dir}>
      <Navbar
        scrolled={scrolled} activeType={activeType} activeSubmenu={activeSubmenu}
        lang={lang} dir={dir} currentLang={currentLang} langMenuOpen={langMenuOpen}
        menuOpen={menuOpen} session={session} navbarRef={navbarRef}
        langMenuRef={langMenuRef} navLinksRef={navLinksRef} t={t}
        scrollToTop={scrollToTop} handleTypeNav={handleTypeNav}
        setActiveType={setActiveType} setActiveSection={setActiveSection}
        setActiveSubmenu={setActiveSubmenu} setActiveService={setActiveService}
        setLangMenuOpen={setLangMenuOpen} setMenuOpen={setMenuOpen} changeLang={changeLang}
      />

      <MobileMenu
        menuOpen={menuOpen} activeType={activeType} activeSubmenu={activeSubmenu}
        lang={lang} session={session} t={t} closeMenu={closeMenu}
        handleTypeNav={handleTypeNav} setActiveType={setActiveType}
        setActiveSection={setActiveSection} setActiveSubmenu={setActiveSubmenu}
        setActiveService={setActiveService}
      />

      <Hero lang={lang} dir={dir} t={t} activeSection={activeSection} />

      {activeSection ? (
        <section className="section-content">
          <div className="section-container">
            {activeSection === "transfer" && (
              <TransferSection
                lang={lang} activeService={activeService}
                fastSlideIndex={fastSlideIndex} eftSlideIndex={eftSlideIndex}
                internationalSlideIndex={internationalSlideIndex} ibanSlideIndex={ibanSlideIndex}
                requestSlideIndex={requestSlideIndex} secureSlideIndex={secureSlideIndex}
                onServiceClick={handleServiceClick}
                onSlideChange={{ fast: setFastSlideIndex, eft: setEftSlideIndex, international: setInternationalSlideIndex, iban: setIbanSlideIndex, request: setRequestSlideIndex, secure: setSecureSlideIndex }}
              />
            )}
            {activeSection === "card" && (
              <CardDetailSection lang={lang} selectedCard={selectedCard} onSelectCard={setSelectedCard} hasSession={!!session?.user} />
            )}
            {activeSection === "investment" && (
              <TabbedServiceSection lang={lang} {...INVESTMENT_DATA} selectedTab={selectedInvest} onSelectTab={(v) => setSelectedInvest(v as typeof selectedInvest)} />
            )}
            {activeSection === "payment" && (
              <TabbedServiceSection lang={lang} {...PAYMENT_DATA} selectedTab={selectedPayment} onSelectTab={(v) => setSelectedPayment(v as typeof selectedPayment)} />
            )}
            {activeSection === "physical-payment" && (
              <TabbedServiceSection lang={lang} {...PHYSICAL_PAYMENT_DATA} selectedTab={selectedPhysicalPayment} onSelectTab={(v) => setSelectedPhysicalPayment(v as typeof selectedPhysicalPayment)} />
            )}
            {activeSection === "online-payment" && (
              <TabbedServiceSection lang={lang} {...ONLINE_PAYMENT_DATA} selectedTab={selectedOnlinePayment} onSelectTab={(v) => setSelectedOnlinePayment(v as typeof selectedOnlinePayment)} />
            )}
            {activeSection === "payment-distribution" && (
              <TabbedServiceSection lang={lang} {...PAYMENT_DISTRIBUTION_DATA} selectedTab={selectedPaymentDist} onSelectTab={(v) => setSelectedPaymentDist(v as typeof selectedPaymentDist)} />
            )}
            {activeSection === "card-solutions" && (
              <TabbedServiceSection lang={lang} {...CARD_SOLUTIONS_DATA} selectedTab={selectedCardSolution} onSelectTab={(v) => setSelectedCardSolution(v as typeof selectedCardSolution)} />
            )}
          </div>
        </section>
      ) : (
        <>
          <TrustedSection lang={lang} t={t} />
          <ServicesSection lang={lang} t={t} />
          <CardSection lang={lang} t={t} tArray={tArray} />
          <HowItWorksSection lang={lang} t={t} />
          <FeaturesSection lang={lang} t={t} />
          <ComplianceSection lang={lang} t={t} />
          <RoadmapSection lang={lang} t={t} tArray={tArray} />
          <ImpactSection lang={lang} t={t} />
          <CTASection lang={lang} t={t} />
          <FooterSection lang={lang} t={t} tArray={tArray} />
        </>
      )}

      <button className={`scroll-top${scrollTopVisible ? " visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top">
        <i className="fas fa-chevron-up" />
      </button>
    </div>
  );
}
