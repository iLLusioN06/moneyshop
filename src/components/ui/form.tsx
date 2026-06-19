import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-text-secondary", className)} {...props}>
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

export interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p className={cn("text-xs text-danger animate-[fade-in_0.15s_ease-out]", className)}>
      {message}
    </p>
  );
}

export interface FormHintProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHint({ children, className }: FormHintProps) {
  return (
    <p className={cn("text-xs text-text-muted", className)}>
      {children}
    </p>
  );
}

export interface FormControlProps {
  children: React.ReactNode;
  className?: string;
}

export function FormControl({ children, className }: FormControlProps) {
  return <div className={cn("min-h-[1rem]", className)}>{children}</div>;
}
