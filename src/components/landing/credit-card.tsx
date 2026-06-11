"use client";

interface CreditCardProps {
  variant: "standart" | "silver" | "gold";
  showCrown?: boolean;
  style?: React.CSSProperties;
}

export function CreditCard({ variant, showCrown, style }: CreditCardProps) {
  const brandIcon = variant === "gold" || showCrown ? "fas fa-crown" : "fas fa-wallet";

  return (
    <div className={`hero-stack-card card-${variant}`} style={style}>
      <div className="card-bg-shine" />
      <div className="hero-card-top">
        <div className="hero-card-brand">
          <i className={brandIcon} />
          <span>MoneyShop</span>
        </div>
        <div className="hero-card-chip">
          <div className="chip-lines">
            <div /><div /><div /><div />
          </div>
        </div>
      </div>
      <div className="hero-card-type">
        {variant === "standart" ? "Standart" : variant === "silver" ? "Silver" : "Gold"}
      </div>
      <div className="hero-card-contactless">
        <svg viewBox="0 0 32 38">
          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="hero-card-network">
        <i className="fab fa-cc-visa" />
      </div>
    </div>
  );
}
