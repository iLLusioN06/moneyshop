"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState } from "@/components/ui";
import { FileCheck, Upload, X, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycDocument {
  id: string;
  type: string;
  status: string;
  fileUrl?: string;
  fileName: string;
  rejectionReason?: string;
  reviewedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const docTypeLabels: Record<string, string> = {
  ID_CARD: "Kimlik Kartı", PASSPORT: "Pasaport", DRIVERS_LICENSE: "Ehliyet",
  UTILITY_BILL: "Fatura", BANK_STATEMENT: "Banka Hesap Özeti", SELFIE: "Selfie", OTHER: "Diğer",
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PENDING: { icon: Clock, color: "bg-warning/10 text-warning", label: "İnceleniyor" },
  APPROVED: { icon: CheckCircle, color: "bg-profit/10 text-profit", label: "Onaylandı" },
  REJECTED: { icon: XCircle, color: "bg-loss/10 text-loss", label: "Reddedildi" },
  EXPIRED: { icon: Clock, color: "bg-surface-tertiary text-text-muted", label: "Süresi Doldu" },
};

export default function KycDocumentsPage() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("ID_CARD");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kyc");
      const data = await res.json();
      if (data.success) setDocuments(data.data);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setError("");
    try {
      const fileUrl = URL.createObjectURL(uploadFile);
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: uploadType, fileUrl, fileName: uploadFile.name, fileSize: uploadFile.size, mimeType: uploadFile.type }),
      });
      const data = await res.json();
      if (data.success) { setShowUpload(false); setUploadFile(null); fetchDocuments(); }
      else { setError(data.error); }
    } catch { setError("Yükleme sırasında hata oluştu."); } finally { setIsUploading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR");

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">KYC Belgelerim</h2>
          <p className="text-sm text-text-muted mt-1">Kimlik doğrulama belgelerinizi yönetin</p>
        </div>
        <Button onClick={() => setShowUpload(true)}><Upload className="w-4 h-4" />Belge Yükle</Button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <Card key={i}><CardContent className="p-5"><div className="animate-pulse space-y-3"><div className="h-4 bg-surface-tertiary rounded w-1/3" /><div className="h-8 bg-surface-tertiary rounded w-1/2" /></div></CardContent></Card>)}
        </div>
      ) : documents.length === 0 ? (
        <Card><EmptyState icon={FileCheck} title="Belge yok" description="Kimlik doğrulaması için belge yükleyin." action={{ label: "Belge Yükle", onClick: () => setShowUpload(true), icon: Upload }} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const cfg = statusConfig[doc.status] || statusConfig.PENDING;
            const Icon = cfg.icon;
            return (
              <Card key={doc.id} className="hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary">{docTypeLabels[doc.type] || doc.type}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{doc.fileName}</p>
                    </div>
                    <Badge className={cn("text-xs", cfg.color)} size="sm"><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                  </div>
                  <div className="text-xs text-text-muted space-y-1">
                    <p>Yüklenme: {formatDate(doc.createdAt)}</p>
                    {doc.reviewedAt && <p>İnceleme: {formatDate(doc.reviewedAt)}</p>}
                    {doc.rejectionReason && <p className="text-loss">Red nedeni: {doc.rejectionReason}</p>}
                    {doc.expiresAt && <p>Geçerlilik: {formatDate(doc.expiresAt)}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Belge Yükle</h3>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-surface-tertiary"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Belge Türü</label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                    {Object.entries(docTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Dosya Seç</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>İptal</Button>
                  <Button className="flex-1" isLoading={isUploading} onClick={handleUpload} disabled={!uploadFile}>
                    <Upload className="w-4 h-4" />Yükle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
