"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
  tArray: (lang: Language, key: string) => string[];
}

export function RoadmapSection({ lang, t, tArray }: Props) {
  const phases = [
    { phase: "phase1", label: "phase1", title: "phase1Title", items: "phase1Items" },
    { phase: "phase2", label: "phase2", title: "phase2Title", items: "phase2Items" },
    { phase: "phase3", label: "phase3", title: "phase3Title", items: "phase3Items" },
  ];

  return (
    <section className="section" id="roadmap">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-road" />{t(lang, "roadmap.title")}</div>
          <h2 className="section-title">
            {t(lang, "roadmap.title")} <span className="highlight">{t(lang, "roadmap.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "roadmap.subtitle")}</p>
        </div>
        <div className="roadmap-container">
          <div className="roadmap-line" />
          {phases.map((phase, i) => (
            <div key={i} className="roadmap-item animate-on-scroll">
              <div className="roadmap-content">
                <span className={`roadmap-phase phase-${i + 1}`}>{t(lang, `roadmap.${phase.label}`)}</span>
                <h3>{t(lang, `roadmap.${phase.title}`)}</h3>
                <ul className="roadmap-list">
                  {tArray(lang, `roadmap.${phase.items}`).map((item, j) => (
                    <li key={j}><i className="fas fa-check-circle" /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="roadmap-dot" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
