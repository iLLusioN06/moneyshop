"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-center">
      <AlertCircle className="w-16 h-16 text-loss mb-6" />
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Bir hata oluştu
      </h2>
      <p className="text-text-muted mb-2 max-w-md">
        {error.message || "Dashboard yüklenirken beklenmeyen bir hata oluştu."}
      </p>
      {error.digest && (
        <p className="text-xs text-text-muted/60 mb-6 font-mono">
          Hata kodu: {error.digest}
        </p>
      )}
      <Button onClick={reset}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Tekrar Dene
      </Button>
    </div>
  );
}
