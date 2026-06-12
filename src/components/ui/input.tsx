import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const [shaking, setShaking] = React.useState(false);
    const prevErrorRef = React.useRef(error);

    // Error değiştiğinde shake tetikle
    React.useEffect(() => {
      if (error && error !== prevErrorRef.current) {
        setShaking(true);
        const timer = setTimeout(() => setShaking(false), 400);
        prevErrorRef.current = error;
        return () => clearTimeout(timer);
      }
      prevErrorRef.current = error;
    }, [error]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm",
              "placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-tertiary",
              "transition-all duration-200",
              error && "border-danger focus:ring-danger/30 focus:border-danger",
              shaking && "shake",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger animate-[fade-in_0.15s_ease-out]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
