"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { Receipt } from "lucide-react";

function PaymentsContent() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <CardTitle>Ödemeler</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">
              Fatura ve ödeme işlemleriniz
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Ödemeler
          </h3>
          <p className="text-sm text-text-muted max-w-sm">
            Bu özellik yakında kullanıma sunulacaktır. Fatura ve ödeme
            işlemlerinizi buradan gerçekleştirebileceksiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <PaymentsContent />
      </ErrorBoundary>
    </div>
  );
}
