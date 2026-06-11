"use client";

import Link from "next/link";
import { type Dir, type Language } from "@/lib/landing-i18n";
import { PhoneMockup, PhoneDefaultTopBar } from "./phone-mockup";
import { CreditCard } from "./credit-card";

interface HeroProps {
  lang: Language;
  dir: Dir;
  t: (lang: Language, key: string) => string;
  activeSection: string | null;
}

export function Hero({ lang, dir, t, activeSection }: HeroProps) {
  return (
    <section className={`hero${activeSection ? " hidden" : ""}`}>
      <div className="hero-bg-elements">
        <div className="circle circle-1" />
        <div className="circle circle-2" />
        <div className="circle circle-3" />
      </div>
      <div className="hero-grid" />
      <div className="hero-particles">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      <div className="hero-wrapper">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot" />
              {t(lang, "hero.badge")}
            </div>
            <h1>
              {t(lang, "hero.titleStart")}{" "}
              <span className="gradient-text">{t(lang, "hero.titleHighlight")}</span>{" "}
              {t(lang, "hero.titleEnd")}
            </h1>
            <p className="hero-description">{t(lang, "hero.description")}</p>
            <div className="hero-buttons">
              <Link href="/register" className="btn-primary">
                {t(lang, "hero.cta")}
                <i className="fas fa-arrow-right" />
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <h3>2.4 Milyon+</h3>
                <p>{t(lang, "hero.merchants")}</p>
              </div>
              <div className="hero-stat">
                <h3>
                  <span className="counter" data-target={99.9}>0</span>%
                </h3>
                <p>{t(lang, "hero.uptime")}</p>
              </div>
              <div className="hero-stat">
                <h3>
                  <span className="counter" data-target={7}>0</span>/24
                </h3>
                <p>{t(lang, "hero.support")}</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-inner">
              <PhoneMockup>
                <PhoneDefaultTopBar />
                <div className="phone-balance-card">
                  <div className="phone-balance-label">Hesabım</div>
                  <div className="phone-balance-amount">250.000 TL</div>
                  <div className="phone-iban-row">
                    <span className="phone-iban-label">İBAN</span>
                    <span className="phone-iban-value">IQ12 0001 2345 6789 0123</span>
                  </div>
                </div>
                <div className="phone-actions">
                  <div className="phone-action">
                    <div className="phone-action-icon"><i className="fas fa-qrcode" /></div>
                    <div className="phone-action-label">{t(lang, "features.phoneScan")}</div>
                  </div>
                  <div className="phone-action">
                    <div className="phone-action-icon"><i className="fas fa-paper-plane" /></div>
                    <div className="phone-action-label">{t(lang, "features.phoneTransfer")}</div>
                  </div>
                  <div className="phone-action">
                    <div className="phone-action-icon"><i className="fas fa-chart-bar" /></div>
                    <div className="phone-action-label">{t(lang, "features.phoneReports")}</div>
                  </div>
                  <div className="phone-action">
                    <div className="phone-action-icon"><i className="fas fa-ellipsis-h" /></div>
                    <div className="phone-action-label">{""}</div>
                  </div>
                </div>
                <div className="phone-recent">{t(lang, "features.phoneRecent")}</div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-arrow-down" /></div>
                    <div>
                      <div className="phone-tx-name">Gelen Transfer</div>
                      <div className="phone-tx-date">Ahmet Yılmaz</div>
                    </div>
                  </div>
                  <div className="phone-tx-right">
                    <div className="phone-tx-amount">+120.000 TL</div>
                    <div className="phone-tx-time">Bugün 10:00</div>
                  </div>
                </div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-arrow-up" /></div>
                    <div>
                      <div className="phone-tx-name">Giden Transfer</div>
                      <div className="phone-tx-date">Zeynep Kaya</div>
                    </div>
                  </div>
                  <div className="phone-tx-right">
                    <div className="phone-tx-amount outgoing">-50.000 TL</div>
                    <div className="phone-tx-time">01.06.2026</div>
                  </div>
                </div>
                <div className="phone-transaction">
                  <div className="phone-transaction-left">
                    <div className="phone-tx-icon"><i className="fas fa-shopping-cart" /></div>
                    <div>
                      <div className="phone-tx-name">Alışveriş - Amazon</div>
                      <div className="phone-tx-date">Online</div>
                    </div>
                  </div>
                  <div className="phone-tx-right">
                    <div className="phone-tx-amount outgoing">-5.000 TL</div>
                    <div className="phone-tx-time">31.05.2026</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>

            <div className="hero-visual-right">
              <div className="hero-cards-stack">
                <CreditCard variant="standart" />
                <CreditCard variant="silver" />
                <CreditCard variant="gold" showCrown />
              </div>

              <div className="hero-store-buttons">
                <a href="#" className="store-btn store-apple">
                  <svg className="store-icon" viewBox="0 0 384 512" width="24" height="24">
                    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-111.9-57.2-139.8zM231.2 59c0-25.6-9.5-47.7-28.5-66.2C185.2 6.8 164.7 0 141.8 0c0 28.9 8.1 52.4 24.3 70.6 16.7 18.6 38.8 29.4 63.3 28.5 0-26.2 1.1-43.5 1.8-59.5z" />
                  </svg>
                  <div className="store-btn-text">
                    <span className="store-btn-big">App Store</span>
                  </div>
                </a>
                <a href="#" className="store-btn store-googleplay">
                  <svg className="store-icon" viewBox="0 0 512 512" width="24" height="24">
                    <path fill="#EA4335" d="M127.4 432.8c-2.1 1.2-4.4 1.7-6.7 1.7-3.3 0-6.5-1.2-9-3.5-3.7-3.4-5.5-8.5-5-13.7L117 341.8l47.3-49.1 63.1 63.1-100 77zM58.8 65.3C53.7 70.5 51 78.2 51 87.1v337.8c0 8.9 2.7 16.5 7.6 21.8l248-214.4L58.8 65.3zM347.5 213.7l-55.6-55.5-70.3 70.3 63.1 63.1 62.8-76.9c.2-.2.3-.3.3-.5 1.2-1.4 1.9-3.1 2.1-4.9.1-.4.1-.8.1-1.2 0-1.2-.3-2.4-.8-3.5-.7-1.5-1.8-2.8-3.1-3.6z"/>
                    <path fill="#FBBC04" d="M347.5 213.7 278 278.4l-55.6 55.5 63.1 63.1 62-76.8c.3-.4.6-.8.9-1.3 1.5-2.2 2.4-4.8 2.4-7.6v-87.2c0-1.6-.3-3.1-.8-4.5-.1-.1-.1-.2-.1-.3-.7-1.6-1.7-3-3-4.1z"/>
                    <path fill="#34A853" d="M116.7 347.3 102 472.6c-.1.3-.1.6-.1 1 0 2 .8 3.8 2.1 5.2 1.4 1.5 3.4 2.3 5.5 2.3.8 0 1.5-.1 2.2-.3 1.7-.5 3.2-1.5 4.3-2.8l144.9-119.1-62.6-62.6-78.6 83.8z"/>
                    <path fill="#4285F4" d="M138.3 61.5 380.9 225c2.3 1.6 3.8 4 4.4 6.6.2.7.3 1.4.3 2.2 0 4.5-2.7 8.5-6.8 10.1L145.2 448.1c-2.1 1.2-4.4 1.7-6.7 1.7-3.3 0-6.5-1.2-9-3.5-1.4-1.3-2.4-2.9-3.1-4.6-.7-1.7-1.1-3.6-1-5.5V76.5c0-4.5 2.1-8.6 5.6-11.2 2.4-1.8 5.4-2.9 8.9-3.3 1-.1 2-.1 2.9-.1 2.2 0 4.4.5 6.5 1.6z"/>
                  </svg>
                  <div className="store-btn-text">
                    <span className="store-btn-big">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
