import * as React from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, size = "md", className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-border", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          disabled={tab.disabled}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "inline-flex items-center gap-2 font-medium transition-colors duration-200",
            "border-b-2 -mb-px focus:outline-none",
            activeTab === tab.key
              ? "border-secondary text-secondary"
              : "border-transparent text-text-muted hover:text-text-primary hover:border-border",
            tab.disabled && "opacity-50 cursor-not-allowed",
            size === "sm" && "px-3 py-1.5 text-xs",
            size === "md" && "px-4 py-2.5 text-sm",
            size === "lg" && "px-5 py-3 text-base"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps {
  activeKey: string;
  tabKey: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ activeKey, tabKey, children, className }: TabPanelProps) {
  if (activeKey !== tabKey) return null;
  return (
    <div role="tabpanel" className={cn("py-4", className)}>
      {children}
    </div>
  );
}
