import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none",

          // Variants
          variant === "primary" &&
            "bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark focus:ring-secondary/50",
          variant === "secondary" &&
            "bg-surface-tertiary text-text-primary hover:bg-border active:bg-border focus:ring-border",
          variant === "outline" &&
            "border border-border bg-transparent text-text-primary hover:bg-surface-tertiary active:bg-surface-tertiary focus:ring-border",
          variant === "ghost" &&
            "bg-transparent text-text-secondary hover:bg-surface-tertiary hover:text-text-primary active:bg-surface-tertiary",
          variant === "danger" &&
            "bg-danger text-white hover:opacity-90 active:opacity-80 focus:ring-danger/50",

          // Sizes
          size === "sm" && "h-8 px-3 text-xs gap-1.5 rounded-md",
          size === "md" && "h-10 px-4 text-sm gap-2 rounded-lg",
          size === "lg" && "h-12 px-6 text-base gap-2.5 rounded-xl",

          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
