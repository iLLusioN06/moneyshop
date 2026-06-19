"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  error?: string;
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, size = "md", error, label, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-surface border text-text-primary",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200",
              error
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-border focus:ring-secondary/50 focus:border-secondary",
              size === "sm" && "h-8 px-3 text-xs rounded-md pr-8",
              size === "md" && "h-10 px-3 text-sm rounded-lg pr-10",
              size === "lg" && "h-12 px-4 text-base rounded-xl pr-12",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className={cn("text-text-muted", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
