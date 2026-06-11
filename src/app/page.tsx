"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { type Language, LANGUAGES, t, tArray, getLangDir } from "@/lib/landing-i18n";
import "./landing.css";
import {
  fastSlidePages, eftSlidePages, internationalSlidePages,
  ibanSlidePages, requestSlidePages, secureSlidePages,
} from "@/components/landing/landing-data";
import { Navbar } from "@/components/landing/navbar";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { Hero } from "@/components/landing/hero";
import { ServiceDetail } from "@/components/landing/service-detail";
import { CreditCard } from "@/components/landing/credit-card";
import { TrustedSection } from "@/components/landing/trusted-section";
import { ServicesSection } from "@/components/landing/services-section";
import { CardSection } from "@/components/landing/card-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ComplianceSection } from "@/components/landing/compliance-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { ImpactSection } from "@/components/landing/impact-section";
import { TechSection } from "@/components/landing/tech-section";
import { CTASection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";

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
  const currentFastSlide = fastSlidePages[fastSlideIndex];
  const currentEftSlide = eftSlidePages[eftSlideIndex];
  const currentInternationalSlide = internationalSlidePages[internationalSlideIndex];
  const currentIbanSlide = ibanSlidePages[ibanSlideIndex];
  const currentRequestSlide = requestSlidePages[requestSlideIndex];
  const currentSecureSlide = secureSlidePages[secureSlideIndex];
  const navbarRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLUListElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const dir = getLangDir(lang);

  // Persist language
  useEffect(() => {
    localStorage.setItem("moneyshop-lang", lang);
  }, [lang]);

  // Close lang menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    setLangMenuOpen(false);
  };

  // Scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (activeService !== "fast") return;

    const interval = window.setInterval(() => {
      setFastSlideIndex((prev) => (prev + 1) % 5);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "eft") return;

    const interval = window.setInterval(() => {
      setEftSlideIndex((prev) => (prev + 1) % eftSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "international") return;

    const interval = window.setInterval(() => {
      setInternationalSlideIndex((prev) => (prev + 1) % internationalSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "iban") return;

    const interval = window.setInterval(() => {
      setIbanSlideIndex((prev) => (prev + 1) % ibanSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "request") return;

    const interval = window.setInterval(() => {
      setRequestSlideIndex((prev) => (prev + 1) % requestSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "secure") return;

    const interval = window.setInterval(() => {
      setSecureSlideIndex((prev) => (prev + 1) % secureSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService === "fast") {
      setFastSlideIndex(0);
    }
    if (activeService === "eft") {
      setEftSlideIndex(0);
    }
    if (activeService === "international") {
      setInternationalSlideIndex(0);
    }
    if (activeService === "iban") {
      setIbanSlideIndex(0);
    }
    if (activeService === "request") {
      setRequestSlideIndex(0);
    }
    if (activeService === "secure") {
      setSecureSlideIndex(0);
    }
  }, [activeService]);

  // Scroll effects: navbar shadow, active nav link, scroll-to-top
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

    // Collect sections for active nav link tracking
    document.querySelectorAll("section[id]").forEach((s) => sectionsRef.push(s));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations + counter animation
  useEffect(() => {
    // activeType veya activeService değişince önceki animated class'ları temizle
    document.querySelectorAll(".animate-on-scroll.animated").forEach((el) => {
      el.classList.remove("animated");
    });

    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("animated");
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    // Counter animation
    const counters = document.querySelectorAll(".counter");
    const counterObserver = new IntersectionObserver(
      (entries) => {
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
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = isDecimal ? target.toFixed(1) : target.toString();
              }
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => counterObserver.observe(counter));

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, [activeType, activeService]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    // push a history state so browser back / custom back button can return to previous view
    try {
      window.history.pushState({ openService: service }, "");
    } catch (err) {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceBack = () => {
    // If we have a pushed history state for an open service, go back in history
    try {
      const state = window.history.state as { openService?: string } | null;
      if (state?.openService) {
        window.history.back();
        return;
      }
    } catch (err) {
      /* ignore */
    }

    // fallback: close the service view
    setActiveService(null);
  };

  // When browser popstate occurs (back button), ensure activeService is cleared
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      setActiveService(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div className="landing-page" dir={dir}>
      <Navbar
        scrolled={scrolled}
        activeType={activeType}
        activeSubmenu={activeSubmenu}
        lang={lang}
        dir={dir}
        currentLang={currentLang}
        langMenuOpen={langMenuOpen}
        menuOpen={menuOpen}
        session={session}
        navbarRef={navbarRef}
        langMenuRef={langMenuRef}
        navLinksRef={navLinksRef}
        t={t}
        scrollToTop={scrollToTop}
        handleTypeNav={handleTypeNav}
        setActiveType={setActiveType}
        setActiveSection={setActiveSection}
        setActiveSubmenu={setActiveSubmenu}
        setActiveService={setActiveService}
        setLangMenuOpen={setLangMenuOpen}
        setMenuOpen={setMenuOpen}
        changeLang={changeLang}
      />

      <MobileMenu
        menuOpen={menuOpen}
        activeType={activeType}
        activeSubmenu={activeSubmenu}
        lang={lang}
        session={session}
        t={t}
        closeMenu={closeMenu}
        handleTypeNav={handleTypeNav}
        setActiveType={setActiveType}
        setActiveSection={setActiveSection}
        setActiveSubmenu={setActiveSubmenu}
        setActiveService={setActiveService}
      />

      <Hero lang={lang} dir={dir} t={t} activeSection={activeSection} />

      {activeSection ? (
        <section className="section-content">
          <div className="section-container">
            {activeSection === "transfer" && (
              <div className="transfer-page">
                {!activeService ? (
                  <>
                    <div className="services-subsection">
                      <h3 className="services-subsection-title">
                        <i className="fas fa-bolt" />
                        {t(lang, "services.transfersTitle")}
                      </h3>
                    </div>

                    <div className="services-grid">
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "fast")}>
                        <div className="service-icon teal">
                          <i className="fas fa-bolt" />
                        </div>
                        <h3>{t(lang, "services.fastTitle")}</h3>
                        <p>{t(lang, "services.fastDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "fast")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "eft")}>
                        <div className="service-icon cyan">
                          <i className="fas fa-right-left" />
                        </div>
                        <h3>{t(lang, "services.eftTitle")}</h3>
                        <p>{t(lang, "services.eftDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "eft")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "international")}>
                        <div className="service-icon sky">
                          <i className="fas fa-globe" />
                        </div>
                        <h3>{t(lang, "services.internationalTitle")}</h3>
                        <p>{t(lang, "services.internationalDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "international")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "iban")}>
                        <div className="service-icon indigo">
                          <i className="fas fa-qrcode" />
                        </div>
                        <h3>{t(lang, "services.ibanTitle")}</h3>
                        <p>{t(lang, "services.ibanDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "iban")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "request")}>
                        <div className="service-icon emerald">
                          <i className="fas fa-hand-holding-dollar" />
                        </div>
                        <h3>{t(lang, "services.requestTitle")}</h3>
                        <p>{t(lang, "services.requestDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "request")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "secure")}>
                        <div className="service-icon pink">
                          <i className="fas fa-shield-alt" />
                        </div>
                        <h3>{t(lang, "services.secureTitle")}</h3>
                        <p>{t(lang, "services.secureDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "secure")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="service-detail">
                      {activeService === "fast" && (
                        <ServiceDetail
                          slide={currentFastSlide}
                          slideIndex={fastSlideIndex}
                          totalSlides={5}
                          onSlideChange={setFastSlideIndex}
                          icon="fas fa-bolt"
                          colorClass="teal"
                          ctaText={t(lang, "hero.cta")}
                        />
                      )}
                      {activeService === "eft" && (
                        <ServiceDetail
                          slide={currentEftSlide}
                          slideIndex={eftSlideIndex}
                          totalSlides={eftSlidePages.length}
                          onSlideChange={setEftSlideIndex}
                          icon="fas fa-right-left"
                          colorClass="cyan"
                        />
                      )}
                      {activeService === "international" && (
                        <ServiceDetail
                          slide={currentInternationalSlide}
                          slideIndex={internationalSlideIndex}
                          totalSlides={internationalSlidePages.length}
                          onSlideChange={setInternationalSlideIndex}
                          icon="fas fa-globe"
                          colorClass="sky"
                        />
                      )}
                      {activeService === "iban" && (
                        <ServiceDetail
                          slide={currentIbanSlide}
                          slideIndex={ibanSlideIndex}
                          totalSlides={ibanSlidePages.length}
                          onSlideChange={setIbanSlideIndex}
                          icon="fas fa-qrcode"
                          colorClass="indigo"
                        />
                      )}
                      {activeService === "request" && (
                        <ServiceDetail
                          slide={currentRequestSlide}
                          slideIndex={requestSlideIndex}
                          totalSlides={requestSlidePages.length}
                          onSlideChange={setRequestSlideIndex}
                          icon="fas fa-hand-holding-dollar"
                          colorClass="emerald"
                        />
                      )}
                      {activeService === "secure" && (
                        <ServiceDetail
                          slide={currentSecureSlide}
                          slideIndex={secureSlideIndex}
                          totalSlides={secureSlidePages.length}
                          onSlideChange={setSecureSlideIndex}
                          icon="fas fa-shield-alt"
                          colorClass="pink"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeSection === "card" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">{t(lang, "card.title")}</span>{" "}
                      <span className="gradient-text">{t(lang, "card.highlight")}</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      {t(lang, "card.subtitle")}
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başvur
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Standart Card */}
                    <div className="hero-stack-card card-standart" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-wallet" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.standart.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>

                    {/* Silver Card */}
                    <div className="hero-stack-card card-silver" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-wallet" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.silver.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>

                    {/* Gold Card */}
                    <div className="hero-stack-card card-gold" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-crown" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.gold.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-mobile-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>MoneyShop Mobil'i İndir</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Uygulamayı ücretsiz indir, hemen hesabını oluştur.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-gem" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Harca &amp; Kazan</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Onlarca üye işyerinde harca, harcadıkça kazan!</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-pie" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Paranı Yönet</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemelerin ve para transferlerin tek bir yerde, güvende.</span>
                  </div>
                </div>

                {/* Card comparison section */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Senin MoneyShop Card'ın Hangisi?
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["standart","silver","gold"] as const).map((card) => (
                      <button key={card} onClick={() => setSelectedCard(card)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedCard === card ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedCard === card ? "var(--primary)" : "transparent",
                        color: selectedCard === card ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {card === "standart" ? "Standart" : card === "silver" ? "Silver" : "Gold"} Card
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"center", justifyContent:"center"}}>
                    {/* Card Visual */}
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:16}}>
                      <div className={`hero-stack-card card-${selectedCard}`} style={{position:"relative", top:0, left:0, transform:"none", width:200, height:290, flexShrink:0}}>
                        <div className="card-bg-shine" />
                        <div className="hero-card-top">
                          <div className="hero-card-brand">
                            <i className={selectedCard === "gold" ? "fas fa-crown" : "fas fa-wallet"} />
                            <span>MoneyShop</span>
                          </div>
                          <div className="hero-card-chip">
                            <div className="chip-lines"><div /><div /><div /><div /></div>
                          </div>
                        </div>
                        <div className="hero-card-type">{t(lang, `card.${selectedCard}.name`)}</div>
                        <div className="hero-card-contactless">
                          <svg viewBox="0 0 32 38">
                            <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                      </div>

                      {session?.user ? (
                        selectedCard === "standart" ? (
                          <div style={{padding:"10px 24px", borderRadius:12, background:"rgba(34,197,94,0.1)", color:"#16a34a", fontWeight:600, fontSize:14, fontFamily:"inherit"}}>
                            <i className="fas fa-check-circle" style={{marginRight:8, color:"#16a34a"}} />Bu karta sahipsin
                          </div>
                        ) : (
                          <Link href="/card" className="btn-primary" style={{padding:"12px 28px", fontSize:14}}>
                            <i className="fas fa-plus-circle" /> Bu karta sahip ol
                          </Link>
                        )
                      ) : (
                        <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14}}>
                          <i className="fas fa-plus-circle" /> Bu karta sahip ol
                        </Link>
                      )}
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10}}>
                      {selectedCard === "standart" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-infinity" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>7/24 Harcama Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Harcamalarını anlık olarak mobil uygulamadan takip et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Anlaşmalı üye işyerlerinde özel indirim fırsatları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCard === "silver" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gift" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>2× Puan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her harcamada 2 kat puan kazanma fırsatı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-plane" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Seyahat Sigortası</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Premium üye işyerlerinde özel indirim fırsatları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yüksek Nakit Avans</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Avantajlı faiz oranlarıyla nakit avans imkanı.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCard === "gold" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-crown" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Premium Lounge Erişimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Havalimanlarında premium lounge ücretsiz giriş.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gem" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>3× Puan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her harcamada 3 kat puan kazanma ayrıcalığı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Elite üye işyerlerinde ayrıcalıklı indirimler.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yüksek Nakit Avans</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>En avantajlı faiz oranlarıyla yüksek nakit avans.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-headset" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>7/24 Öncelikli Destek</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Öncelikli müşteri hattı ile 7/24 destek.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-user-tie" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel Müşteri Temsilcisi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Size özel atanmış müşteri temsilcisi desteği.</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "investment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">MoneyShop</span>{" "}
                      <span className="gradient-text">Yatırım</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Geleceğine yatırım yap. Fon, hisse senedi ve kripto para ile portföyünü büyüt.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fund Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,82,255,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-chart-line" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Yatırım<br />Fonları</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Uzman yönetimli</div>
                    </div>
                    {/* Stock Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,0,0,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-chart-bar" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Hisse<br />Senedi</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Borsa yatırımı</div>
                    </div>
                    {/* Crypto Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1a1a2e 0%, #3d0c11 50%, #6b2020 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(107,32,32,0.3)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-coins" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Kripto<br />Para</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Dijital varlıklar</div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-pie" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Çeşitlendirilmiş Portföy</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Farklı varlık sınıflarına yatırım yap, riskini dağıt.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Piyasa Takibi</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Canlı verilerle piyasaları anlık olarak izle.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli Platform</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Yatırımların lisanslı ve güvenli altyapımızda korunur.</span>
                  </div>
                </div>

                {/* Investment comparison section */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Yatırım Şeklini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["fund","stock","crypto"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedInvest(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedInvest === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedInvest === type ? "var(--primary)" : "transparent",
                        color: selectedInvest === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "fund" ? "Yatırım Fonları" : type === "stock" ? "Hisse Senedi" : "Kripto Para"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    {/* Invest Visual */}
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedInvest === "fund" ? "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)" : selectedInvest === "stock" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #3d0c11 50%, #6b2020 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedInvest === "fund" ? "0 12px 40px rgba(0,82,255,0.3)" : selectedInvest === "stock" ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 40px rgba(107,32,32,0.3)",
                    }}>
                      <i className={selectedInvest === "fund" ? "fas fa-chart-line" : selectedInvest === "stock" ? "fas fa-chart-bar" : "fas fa-coins"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedInvest === "fund" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uzman Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Profesyonel fon yöneticileri tarafından yönetilen portföyler.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-pie" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çeşitlendirme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı sektör ve varlık sınıflarına yayılmış yatırım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Maliyet</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düşük yönetim ücretleri ile avantajlı yatırım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Esnek Vade</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İstediğiniz zaman giriş ve çıkış imkanı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Şeffaf Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli portföy raporları ile tam şeffaflık.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temettü Geliri</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli temettü ödemeleri ile ek gelir.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedInvest === "stock" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>BİST ve diğer borsalarda anlık alım satım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Teknik Analiz</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gelişmiş grafik ve analiz araçları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiyat Alarmı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlediğiniz fiyat seviyelerinde anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-newspaper" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık Haberler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Şirket haberleri ve piyasa gelişmeleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calculator" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kâr/Zarar Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gerçek zamanlı portföy performans takibi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-flag" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Limit Emir</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Otomatik alım satım için limit emir desteği.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedInvest === "crypto" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-lock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Saklama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Soğuk cüzdan ve çok katmanlı güvenlik.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeler içinde kripto para alım satım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-exchange-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Spread</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Rekabetçi alım satım farkları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Geniş Portföy</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>100+ farklı kripto para desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Erişim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>7/24 mobil uygulama üzerinden erişim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Piyasa Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Anlık fiyat ve piyasa verileri.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Ödeme</span>{" "}
                      <span className="gradient-text">İşlemleri</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Hızlı, güvenli ve pratik ödeme çözümleri. İster kartla, ister havale ile dilediğin gibi öde.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fast Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(13,148,136,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-bolt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Hızlı<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tek tıkla öde</div>
                    </div>
                    {/* Recurring Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-sync-alt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Düzenli<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Otomatik tekrarla</div>
                    </div>
                    {/* QR Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(3,105,161,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-qrcode" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>QR ile<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Karekodla öde</div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>3D Secure ve uçtan uca şifreleme ile korunur.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-clock" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Onay</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemelerin saniyeler içinde onaylanır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-mobile-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Mobil Uyumlu</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Her yerden, her cihazdan ödeme yap.</span>
                  </div>
                </div>

                {/* Payment method detail */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Ödeme Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["fast","recurring","qr"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPayment === type ? "var(--primary)" : "transparent",
                        color: selectedPayment === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "fast" ? "Hızlı Ödeme" : type === "recurring" ? "Düzenli Ödeme" : "QR ile Ödeme"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    {/* Payment Visual */}
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPayment === "fast" ? "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)" : selectedPayment === "recurring" ? "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)" : "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPayment === "fast" ? "0 12px 40px rgba(13,148,136,0.3)" : selectedPayment === "recurring" ? "0 12px 40px rgba(109,40,217,0.3)" : "0 12px 40px rgba(3,105,161,0.3)",
                    }}>
                      <i className={selectedPayment === "fast" ? "fas fa-bolt" : selectedPayment === "recurring" ? "fas fa-sync-alt" : "fas fa-qrcode"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPayment === "fast" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Saniyede İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödemelerin anında gerçekleşir, bekleme yok.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kart ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm banka kartları ve kredi kartları ile ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Cep Telefonu ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Telefon numaranla kolayca ödeme yap.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-exchange-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Havale/EFT</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Banka havalesi ve EFT ile ödeme imkanı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-receipt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Dijital Makbuz</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlem sonrası dijital makbuz e-posta ile gönderilir.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İşlem Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm ödeme geçmişine tek ekrandan eriş.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPayment === "recurring" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sync-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Otomatik Tekrarlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlediğin aralıklarla otomatik ödeme talimatı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calendar-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Esnek Zamanlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Günlük, haftalık, aylık tekrarlama seçenekleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hatırlatma Bildirimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme öncesi ve sonrası anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-pause-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Duraklat/Durdur</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İstediğin zaman ödemeyi duraklat veya iptal et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-line" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli ödemelerini bütçene göre planla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fatura Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Faturalarını otomatik öde, gecikme yaşama.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPayment === "qr" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-qrcode" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Karekod ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kodu okut, saniyeler içinde öde.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-store" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mağazada Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Fiziksel mağazalarda temassız QR ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kişiden Kişiye Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kodla arkadaşlarına hızlı para gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çevrimdışı Çalışma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İnternet olmadan bile QR ödeme al.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bakiye Görüntüleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme öncesi bakiye kontrolü ve onay.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-print" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiş Üretimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR ödeme sonrası dijital fiş oluşturma.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "physical-payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Fiziki</span>{" "}
                      <span className="gradient-text">Ödeme Al</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Mağazanda yüz yüze ödemeleri POS terminali ile güvenle al. Tüm kartları destekler, anında onay.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Kartlı POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(220,38,38,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-credit-card" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Kartlı<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tüm kartları kabul et</div>
                    </div>
                    {/* Temassız POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(194,65,12,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-wifi" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Temassız<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Temassız ödeme al</div>
                    </div>
                    {/* Mobil POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(30,64,175,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-mobile-alt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Mobil<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Cep telefonunla ödeme al</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anında Onay</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemeler saniyeler içinde onaylanır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>PCI DSS sertifikalı güvenlik altyapısı.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-line" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Raporlama</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Detaylı satış ve işlem raporları.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    POS Çözümünü Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["pos","contactless","mpos"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPhysicalPayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPhysicalPayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPhysicalPayment === type ? "var(--primary)" : "transparent",
                        color: selectedPhysicalPayment === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "pos" ? "Kartlı POS" : type === "contactless" ? "Temassız POS" : "Mobil POS"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPhysicalPayment === "pos" ? "linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)" : selectedPhysicalPayment === "contactless" ? "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)" : "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPhysicalPayment === "pos" ? "0 12px 40px rgba(220,38,38,0.3)" : selectedPhysicalPayment === "contactless" ? "0 12px 40px rgba(194,65,12,0.3)" : "0 12px 40px rgba(30,64,175,0.3)",
                    }}>
                      <i className={selectedPhysicalPayment === "pos" ? "fas fa-credit-card" : selectedPhysicalPayment === "contactless" ? "fas fa-wifi" : "fas fa-mobile-alt"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPhysicalPayment === "pos" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tüm Kartları Destekler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Visa, Mastercard, Troy ve yerel kartlar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeler içinde ödeme onayı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-print" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiş Çıktısı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Otomatik fiş yazdırma desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Wi-Fi & Kablolu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hem kablolu hem kablosuz bağlantı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-battery-full" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uzun Pil Ömrü</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm gün kesintisiz kullanım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İşlem Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm işlemlerinizi dashboard'dan takip edin.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPhysicalPayment === "contactless" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Teknoloji</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kartı okut, temassız ödeme al.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Cüzdan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Apple Pay, Google Pay desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeden kısa sürede ödeme tamamlanır.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tokenizasyon ile güvenli ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Limit</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız ödemelerde düşük işlem limiti.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kolay İade</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız işlemlerde kolay iade yönetimi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPhysicalPayment === "mpos" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Cep Telefonuna POS</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kendi telefonunu POS cihazına dönüştür.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-download" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı Kurulum</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Uygulamayı indir, hemen kullanmaya başla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Maliyet</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ek donanım gerektirmez, düşük komisyon.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bluetooth" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bluetooth Kart Okuyucu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Mini kart okuyucu ile fiziksel kart kabulü.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık Rapor</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm satışları anlık görüntüle.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-qrcode" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>QR ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kod ile de ödeme kabul et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "online-payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Online</span>{" "}
                      <span className="gradient-text">Ödeme Al</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      E-ticaret sitende veya link ile online ödeme almaya hemen başla. API entegrasyonu ile dakikalar içinde aktif.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Sanal POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(5,150,105,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-globe" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Sanal<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Web sitende ödeme al</div>
                    </div>
                    {/* Linkle Ödeme */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(190,24,93,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-link" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Linkle<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Link gönder, ödeme al</div>
                    </div>
                    {/* API Entegrasyonu */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(55,48,163,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-code" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>API<br />Entegrasyon</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Kendi yazılımına entegre et</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-lock" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli Altyapı</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>3D Secure ile korunan ödemeler.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Hızlı Entegrasyon</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Dakikalar içinde entegrasyon.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Gerçek Zamanlı Takip</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Tüm işlemleri anlık izle.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Online Ödeme Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["virtual","link","api"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedOnlinePayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedOnlinePayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedOnlinePayment === type ? "var(--primary)" : "transparent",
                        color: selectedOnlinePayment === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "virtual" ? "Sanal POS" : type === "link" ? "Linkle Ödeme" : "API Entegrasyon"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedOnlinePayment === "virtual" ? "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)" : selectedOnlinePayment === "link" ? "linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)" : "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedOnlinePayment === "virtual" ? "0 12px 40px rgba(5,150,105,0.3)" : selectedOnlinePayment === "link" ? "0 12px 40px rgba(190,24,93,0.3)" : "0 12px 40px rgba(55,48,163,0.3)",
                    }}>
                      <i className={selectedOnlinePayment === "virtual" ? "fas fa-globe" : selectedOnlinePayment === "link" ? "fas fa-link" : "fas fa-code"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedOnlinePayment === "virtual" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Web Sitesi Entegrasyonu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>E-ticaret sitene kolayca entegre et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Kart Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm kredi ve banka kartları ile ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>3D Secure</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Güvenli ödeme için 3D Secure desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Uyumlu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Responsive ödeme sayfası ile mobil uyumlu.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-language" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Dil/Para Birimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı dil ve para birimlerinde ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-undo" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İade Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kolay iade ve geri ödeme işlemleri.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedOnlinePayment === "link" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-link" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ödeme Linki Oluştur</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bir tıkla ödeme linki oluştur ve gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-whatsapp" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>WhatsApp ile Paylaş</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>WhatsApp, e-posta veya SMS ile link gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Zaman Aşımı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Linklere süre sınırı koy, güvenliği artır.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme alındığında anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-repeat" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tekrarlanabilir Link</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Aynı linki birden çok kez kullan.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Link Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gönderilen linklerin durumunu takip et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedOnlinePayment === "api" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-code" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>REST API</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Modern REST API ile kolay entegrasyon.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-book" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Detaylı Dökümantasyon</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kapsamlı API dökümantasyonu ve örnek kodlar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-flask" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Test Ortamı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Canlıya geçmeden önce test ortamında dene.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-headset" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Teknik Destek</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Uzman ekibimizle 7/24 teknik destek.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-plug" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Eklenti Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>WooCommerce, Shopier ve diğer platformlar için hazır eklenti.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uyumlu ve Güvenli</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>PCI DSS uyumlu API altyapısı.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "payment-distribution" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Ödeme</span>{" "}
                      <span className="gradient-text">Dağıt</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Toplu ödemelerini tek seferde yap. Tedarikçilerine, çalışanlarına ve iş ortaklarına anında ödeme dağıt.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Toplu Ödeme */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(22,163,74,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-users" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Toplu<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Kişilere toplu ödeme yap</div>
                    </div>
                    {/* Tedarikçi Ödemesi */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #422006 0%, #92400e 50%, #d97706 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(146,64,14,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-truck" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Tedarikçi<br />Ödemesi</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tedarikçilerine öde</div>
                    </div>
                    {/* Komisyon Dağıtımı */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-percent" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Komisyon<br />Dağıtımı</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Komisyonları otomatik dağıt</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anında Dağıtım</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemeler saniyeler içinde hesaplara ulaşır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-file-export" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Toplu İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Yüzlerce kişiye tek seferde ödeme.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-history" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>İşlem Geçmişi</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Detaylı raporlama ve işlem takibi.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Dağıtım Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["bulk","supplier","commission"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPaymentDist(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPaymentDist === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPaymentDist === type ? "var(--primary)" : "transparent",
                        color: selectedPaymentDist === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "bulk" ? "Toplu Ödeme" : type === "supplier" ? "Tedarikçi Ödemesi" : "Komisyon Dağıtımı"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPaymentDist === "bulk" ? "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)" : selectedPaymentDist === "supplier" ? "linear-gradient(135deg, #422006 0%, #92400e 50%, #d97706 100%)" : "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPaymentDist === "bulk" ? "0 12px 40px rgba(22,163,74,0.3)" : selectedPaymentDist === "supplier" ? "0 12px 40px rgba(146,64,14,0.3)" : "0 12px 40px rgba(109,40,217,0.3)",
                    }}>
                      <i className={selectedPaymentDist === "bulk" ? "fas fa-users" : selectedPaymentDist === "supplier" ? "fas fa-truck" : "fas fa-percent"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPaymentDist === "bulk" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Toplu Ödeme Gönderimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>CSV yükle veya manuel ekle, tek seferde gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-csv" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>CSV/Excel Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Dosyadan toplu ödeme listesi yükle.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Zamanlanmış Gönderim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödemeleri istediğin tarihte gönderilmek üzere planla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-double" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Onay Süreci</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Çoklu onay ile güvenli gönderim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Alıcılara SMS/e-posta ile ödeme bildirimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Detaylı dağıtım raporları ve dökümler.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPaymentDist === "supplier" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-truck" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tedarikçi Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçilerini ekle, grupla ve yönet.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fatura Eşleştirme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Faturalarla otomatik ödeme eşleştirme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calendar-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düzenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçi ödemelerini otomatikleştir.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ödeme Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm tedarikçi ödemelerinin geçmişi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Para Birimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı para birimlerinde tedarikçi ödemesi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-line" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Analizi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçi bazında harcama analizi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPaymentDist === "commission" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Otomatik Hesaplama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlenen oranlarda otomatik komisyon hesaplama.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bayi/Üye Komisyonu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bayi ve üyelerine otomatik komisyon dağıt.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Periyodik Dağıtım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Günlük, haftalık, aylık otomatik komisyon dağıtımı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Detaylı komisyon raporları ve vergi dökümleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Performans Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bayi/üye bazında performans ve komisyon takibi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-arrow-right" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hesaba Aktarım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Komisyonları doğrudan banka hesaplarına aktar.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "card-solutions" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Kart</span>{" "}
                      <span className="gradient-text">Çözümleri</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      İşletmen için fiziki, sanal veya ön ödemeli kart çözümleri. Tüm kartların yönetimi tek dashboard'da.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fiziki Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,82,255,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-credit-card" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Fiziki<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Fiziksel kurumsal kart</div>
                    </div>
                    {/* Sanal Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-qrcode" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Sanal<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Dijital kurumsal kart</div>
                    </div>
                    {/* Ön Ödemeli Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(194,65,12,0.25)", color:"var(--white)", padding:20
                    }}>
                      <i className="fas fa-gift" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Ön Ödemeli<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Bütçe dostu kart</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>EMV çip teknolojisi ile güvenli kartlar.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-sliders-h" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Limit Kontrolü</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Kart bazında harcama limiti belirle.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"var(--white)", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Yönetim</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Tüm kartları dashboard'dan yönet.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Kart Tipini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["physical","virtual","prepaid"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedCardSolution(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedCardSolution === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedCardSolution === type ? "var(--primary)" : "transparent",
                        color: selectedCardSolution === type ? "var(--white)" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "physical" ? "Fiziki Kart" : type === "virtual" ? "Sanal Kart" : "Ön Ödemeli Kart"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedCardSolution === "physical" ? "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)" : selectedCardSolution === "virtual" ? "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)" : "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedCardSolution === "physical" ? "0 12px 40px rgba(0,82,255,0.3)" : selectedCardSolution === "virtual" ? "0 12px 40px rgba(109,40,217,0.3)" : "0 12px 40px rgba(194,65,12,0.3)",
                    }}>
                      <i className={selectedCardSolution === "physical" ? "fas fa-credit-card" : selectedCardSolution === "virtual" ? "fas fa-qrcode" : "fas fa-gift"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedCardSolution === "physical" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>EMV Çipli Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Güvenli EMV çip teknolojisi ile donatılmış kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız ödeme teknolojisi ile hızlı işlem.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-user-tie" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çalışan Kartı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Çalışanların için bireysel kart çıkar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sliders-h" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Limiti</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kart bazında harcama limiti belirleme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yurt Dışı Kullanım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yurt dışı harcamalarına izin ver/kısıtla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-ban" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Dondurma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kaybolan kartı anında dondur.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCardSolution === "virtual" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Üretim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Sanal kartın saniyeler içinde oluştur.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Online Alışveriş</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İnternet alışverişlerinde güvenle kullan.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sync" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tek Kullanımlık</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tek kullanımlık sanal kart numarası.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wallet" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Dijital Cüzdan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Apple Pay ve Google Wallet ile uyumlu.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Kontrolü</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Sanal kart bazında harcama sınırı koy.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-trash-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kolay İptal</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kullanmadığın kartı tek tıkla iptal et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCardSolution === "prepaid" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gift" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hediye Kartı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Müşterilerine hediye kartı çıkar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ön Yükleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Karta önceden bakiye yükle, harcama kontrolü sende.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ön ödemeli kart harcamalarını anlık takip et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Dostu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yüklediğin kadar harca, borçlanma riski yok.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-repeat" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tekrar Yükleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kartı dilediğin zaman tekrar yükleyebilirsin.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"var(--white)", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Toplu Kart Çıkarma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Toplu ön ödemeli kart siparişi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
      <TechSection lang={lang} t={t} />
      <CTASection lang={lang} t={t} />
      <FooterSection lang={lang} t={t} tArray={tArray} />
      </>
      )}

      {/* ========== SCROLL TO TOP ========== */}
      <button
        className={`scroll-top${scrollTopVisible ? " visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <i className="fas fa-chevron-up" />
      </button>
    </div>
  );
}
