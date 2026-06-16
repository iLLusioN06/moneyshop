"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-background">
      <AlertCircle className="w-16 h-16 text-loss mb-6" />
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Bir hata oluştu
      </h2>
      <p className="text-text-muted mb-2 max-w-md">
        {error.message || "Sayfa yüklenirken beklenmeyen bir hata oluştu."}
      </p>
      {error.digest && (
        <p className="text-xs text-text-muted/60 mb-6 font-mono">
          Hata kodu: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Tekrar Dene
      </button>
    </div>
  );
}
