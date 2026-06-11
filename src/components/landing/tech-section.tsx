"use client";

import type { Language } from "@/lib/landing-i18n";

interface Props {
  lang: Language;
  t: (lang: Language, key: string) => string;
}

export function TechSection({ lang, t }: Props) {
  const techs = [
    { icon: "fas fa-desktop", label: "Frontend", tags: ["React", "Next.js", "TypeScript"] },
    { icon: "fas fa-server", label: "Backend", tags: [".NET Core", "Node.js", "Java Spring"] },
    { icon: "fas fa-database", label: "Database", tags: ["PostgreSQL", "SQL Server", "Redis"] },
    { icon: "fas fa-mobile-alt", label: "Mobile", tags: ["Flutter", "Dart", "Firebase"] },
    { icon: "fas fa-shield-alt", label: "Security", tags: ["OAuth 2.0", "JWT", "2FA"] },
    { icon: "fas fa-cloud", label: "Infrastructure", tags: ["AWS", "Docker", "Kubernetes"] },
    { icon: "fas fa-plug", label: "Integration", tags: ["REST API", "Webhooks", "SDK"] },
    { icon: "fas fa-chart-pie", label: "Analytics", tags: ["Grafana", "ELK Stack", "Prometheus"] },
  ];

  return (
    <section className="section" id="tech">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-label"><i className="fas fa-microchip" />{t(lang, "tech.title")}</div>
          <h2 className="section-title">
            {t(lang, "tech.title")} <span className="highlight">{t(lang, "tech.highlight")}</span>
          </h2>
          <p className="section-subtitle">{t(lang, "tech.subtitle")}</p>
        </div>
        <div className="tech-grid">
          {techs.map((tech, i) => (
            <div key={i} className="tech-card animate-on-scroll">
              <div className="tech-card-icon"><i className={tech.icon} /></div>
              <h4>{tech.label}</h4>
              <div className="tech-tags">
                {tech.tags.map((tag, j) => (
                  <span key={j} className="tech-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
