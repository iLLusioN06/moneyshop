import { type Language, t } from "@/lib/landing-i18n";
import { ServiceDetail } from "./service-detail";
import {
  fastSlidePages, eftSlidePages, internationalSlidePages,
  ibanSlidePages, requestSlidePages, secureSlidePages,
} from "./landing-data";

interface TransferSectionProps {
  lang: Language;
  activeService: string | null;
  fastSlideIndex: number;
  eftSlideIndex: number;
  internationalSlideIndex: number;
  ibanSlideIndex: number;
  requestSlideIndex: number;
  secureSlideIndex: number;
  onServiceClick: (e: React.MouseEvent, service: string) => void;
  onSlideChange: {
    fast: React.Dispatch<React.SetStateAction<number>>;
    eft: React.Dispatch<React.SetStateAction<number>>;
    international: React.Dispatch<React.SetStateAction<number>>;
    iban: React.Dispatch<React.SetStateAction<number>>;
    request: React.Dispatch<React.SetStateAction<number>>;
    secure: React.Dispatch<React.SetStateAction<number>>;
  };
}

const SERVICES = [
  { key: "fast", icon: "fas fa-bolt", color: "teal", titleKey: "services.fastTitle", descKey: "services.fastDesc" },
  { key: "eft", icon: "fas fa-right-left", color: "cyan", titleKey: "services.eftTitle", descKey: "services.eftDesc" },
  { key: "international", icon: "fas fa-globe", color: "sky", titleKey: "services.internationalTitle", descKey: "services.internationalDesc" },
  { key: "iban", icon: "fas fa-qrcode", color: "indigo", titleKey: "services.ibanTitle", descKey: "services.ibanDesc" },
  { key: "request", icon: "fas fa-hand-holding-dollar", color: "emerald", titleKey: "services.requestTitle", descKey: "services.requestDesc" },
  { key: "secure", icon: "fas fa-shield-alt", color: "pink", titleKey: "services.secureTitle", descKey: "services.secureDesc" },
] as const;

const SLIDE_CONFIG = {
  fast: { pages: fastSlidePages, total: 5, icon: "fas fa-bolt", color: "teal" },
  eft: { pages: eftSlidePages, total: eftSlidePages.length, icon: "fas fa-right-left", color: "cyan" },
  international: { pages: internationalSlidePages, total: internationalSlidePages.length, icon: "fas fa-globe", color: "sky" },
  iban: { pages: ibanSlidePages, total: ibanSlidePages.length, icon: "fas fa-qrcode", color: "indigo" },
  request: { pages: requestSlidePages, total: requestSlidePages.length, icon: "fas fa-hand-holding-dollar", color: "emerald" },
  secure: { pages: secureSlidePages, total: secureSlidePages.length, icon: "fas fa-shield-alt", color: "pink" },
} as const;

export function TransferSection({
  lang,
  activeService,
  fastSlideIndex,
  eftSlideIndex,
  internationalSlideIndex,
  ibanSlideIndex,
  requestSlideIndex,
  secureSlideIndex,
  onServiceClick,
  onSlideChange,
}: TransferSectionProps) {
  const slideIndices = { fast: fastSlideIndex, eft: eftSlideIndex, international: internationalSlideIndex, iban: ibanSlideIndex, request: requestSlideIndex, secure: secureSlideIndex };

  return (
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
            {SERVICES.map((svc) => (
              <div key={svc.key} className="service-card" onClick={(e) => onServiceClick(e, svc.key)}>
                <div className={`service-icon ${svc.color}`}>
                  <i className={svc.icon} />
                </div>
                <h3>{t(lang, svc.titleKey)}</h3>
                <p>{t(lang, svc.descKey)}</p>
                <button type="button" className="service-link" onClick={(e) => onServiceClick(e, svc.key)}>
                  <i className="fas fa-arrow-right" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="service-detail">
          {activeService in SLIDE_CONFIG && (
            <ServiceDetail
              slide={SLIDE_CONFIG[activeService as keyof typeof SLIDE_CONFIG].pages[slideIndices[activeService as keyof typeof slideIndices]]
                ?? SLIDE_CONFIG[activeService as keyof typeof SLIDE_CONFIG].pages[0]}
              slideIndex={slideIndices[activeService as keyof typeof slideIndices] ?? 0}
              totalSlides={SLIDE_CONFIG[activeService as keyof typeof SLIDE_CONFIG].total}
              onSlideChange={onSlideChange[activeService as keyof typeof onSlideChange]}
              icon={SLIDE_CONFIG[activeService as keyof typeof SLIDE_CONFIG].icon}
              colorClass={SLIDE_CONFIG[activeService as keyof typeof SLIDE_CONFIG].color}
              ctaText={activeService === "fast" ? t(lang, "hero.cta") : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
