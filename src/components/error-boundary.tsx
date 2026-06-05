"use client";

import { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-12 h-12 text-loss mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Bir hata oluştu
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md">
            {this.state.error?.message || "Beklenmeyen bir hata oluştu."}
          </p>
          <Button onClick={this.handleRetry}>
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component_: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component_ {...props} />
      </ErrorBoundary>
    );
  };
}
