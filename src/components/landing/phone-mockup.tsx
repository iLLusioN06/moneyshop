"use client";

import { type ReactNode } from "react";

interface PhoneMockupProps {
  topBar?: ReactNode;
  header?: ReactNode;
  sub?: ReactNode;
  menuItems?: Array<{ icon: string; label: string }>;
  children?: ReactNode;
  className?: string;
}

export function PhoneMockup({
  topBar,
  header,
  sub,
  menuItems,
  children,
  className = "",
}: PhoneMockupProps) {
  return (
    <div className={`features-phone phone-16pro ${className}`}>
      <div className="phone-side-buttons">
        <div className="phone-btn phone-btn-vol-up" />
        <div className="phone-btn phone-btn-vol-down" />
        <div className="phone-btn phone-btn-action" />
        <div className="phone-btn phone-btn-power" />
      </div>
      <div className="phone-screen">
        <div className="phone-dynamic-island" />
        {topBar && <div className="phone-content">{topBar}</div>}
        {children ? (
          <div className="phone-content">{children}</div>
        ) : (
          <div className="phone-content">
            {header && <div className="phone-fast-header">{header}</div>}
            {sub && <div className="phone-fast-sub">{sub}</div>}
            {menuItems && menuItems.length > 0 && (
              <div className="phone-fast-menu">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="phone-fast-menu-item">
                    <i className={item.icon} />
                    <span>{item.label}</span>
                    <i className="fas fa-chevron-right" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface PhoneTopBarProps {
  showAvatar?: boolean;
}

export function PhoneDefaultTopBar() {
  return (
    <div className="phone-topbar">
      <div className="phone-topbar-logo">
        <i className="fas fa-wallet" />
        <span>MoneyShop</span>
      </div>
      <div className="phone-topbar-greeting">
        Hoş Geldiniz 👋
      </div>
    </div>
  );
}

export function PhoneServiceTopBar({ showAvatar = true }: PhoneTopBarProps) {
  return (
    <div className="phone-fast-topbar">
      <div className="phone-fast-logo">
        <i className="fas fa-wallet" />
        <span>MoneyShop</span>
      </div>
      {showAvatar && (
        <div className="phone-fast-avatar">
          <i className="fas fa-user-circle" />
          <div className="phone-fast-account text-right text-[10px]">
            <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
            <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
          </div>
        </div>
      )}
    </div>
  );
}
