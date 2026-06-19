import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "current";
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

const SIZE_CLASSES = {
  xs: "w-3.5 h-3.5 border-[2px]",
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
  xl: "w-16 h-16 border-4",
};

const COLOR_CLASSES = {
  primary: "border-secondary border-t-transparent",
  secondary: "border-text-muted border-t-transparent",
  white: "border-white/30 border-t-white",
  current: "border-current border-t-transparent",
};

export function LoadingSpinner({
  size = "md",
  color = "primary",
  label,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full",
          SIZE_CLASSES[size],
          COLOR_CLASSES[color]
        )}
        role="status"
        aria-label="Yükleniyor"
      />
      {label && (
        <p className="text-sm text-text-muted animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export interface LoadingOverlayProps {
  loading: boolean;
  label?: string;
  className?: string;
}

export function LoadingOverlay({ loading, label, className }: LoadingOverlayProps) {
  if (!loading) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex items-center justify-center",
        "bg-surface/80 backdrop-blur-sm rounded-xl",
        className
      )}
    >
      <LoadingSpinner size="md" label={label} />
    </div>
  );
}

export interface LoadingBarProps {
  loading: boolean;
  className?: string;
}

export function LoadingBar({ loading, className }: LoadingBarProps) {
  if (!loading) return null;
  return (
    <div className={cn("w-full h-0.5 bg-surface-tertiary overflow-hidden", className)}>
      <div className="h-full bg-secondary animate-[loading-bar_1.5s_ease-in-out_infinite]" />
    </div>
  );
}
