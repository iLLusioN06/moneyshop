import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full whitespace-nowrap",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-sm",

          // Variants
          variant === "default" &&
            "bg-surface-tertiary text-text-secondary",
          variant === "success" &&
            "bg-profit/10 text-profit",
          variant === "warning" &&
            "bg-pending/10 text-pending",
          variant === "danger" &&
            "bg-loss/10 text-loss",
          variant === "info" &&
            "bg-info/10 text-info",

          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
