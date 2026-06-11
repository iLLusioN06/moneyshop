"use client";

import Link from "next/link";
import { type SlidePage } from "./landing-data";
import { PhoneMockup, PhoneServiceTopBar } from "./phone-mockup";

interface ServiceDetailProps {
  slide: SlidePage;
  slideIndex: number;
  totalSlides: number;
  onSlideChange: (index: number) => void;
  icon: string;
  colorClass: string;
  ctaText?: string;
  ctaHref?: string;
}

export function ServiceDetail({
  slide,
  slideIndex,
  totalSlides,
  onSlideChange,
  icon,
  colorClass,
  ctaText,
  ctaHref = "/register",
}: ServiceDetailProps) {
  return (
    <div className="service-detail-content">
      <div className="service-detail-fast-layout">
        <div className="service-detail-fast-info">
          <div className="service-detail-header">
            <div className={`service-icon ${colorClass} large-icon`}>
              <i className={icon} />
            </div>
            <h2>{slide.panelTitle}</h2>
          </div>
          <p className="service-detail-desc">{slide.panelDescription}</p>
          {slideIndex === 0 && (
            <Link href={ctaHref} className="btn-primary service-fast-cta">
              {ctaText || "Hemen Başvur"} <i className="fas fa-arrow-right" />
            </Link>
          )}
        </div>
        <div className="service-detail-fast-phone">
          <PhoneMockup>
            <PhoneServiceTopBar />
            <div className="phone-fast-header">
              {typeof icon === "string" && icon.length > 0 && <i className={icon} />}
              {slide.phoneTitle}
            </div>
            <div className="phone-fast-sub">{slide.phoneDescription}</div>
            <div className="phone-fast-menu">
              {slide.items.map((item, idx) => (
                <div key={idx} className="phone-fast-menu-item">
                  <i className={item.icon} />
                  <span>{item.label}</span>
                  <i className="fas fa-chevron-right" />
                </div>
              ))}
            </div>
          </PhoneMockup>
        </div>
      </div>
      <div className="phone-fast-slider phone-fast-slider-dots-only">
        <div className="phone-fast-slider-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <span
              key={index}
              className={index === slideIndex ? "active" : ""}
              onClick={() => onSlideChange(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
