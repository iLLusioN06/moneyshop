"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { downloadQrCode, shareQrCode } from "@/lib/qr";

interface QrDisplayProps {
  /** QR kod içine gömülecek veri (URL) */
  value: string;
  /** QR boyutu (px) */
  size?: number;
  /** İndirilen dosya adı */
  filename?: string;
  /** Paylaşım başlığı */
  shareTitle?: string;
  /** Paylaşım metni */
  shareText?: string;
}

export function QrDisplay({
  value,
  size = 200,
  filename = "moneyshop-qr.png",
  shareTitle = "MoneyShop QR Kod",
  shareText = "MoneyShop hesabıma para göndermek için QR kodu okutun.",
}: QrDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    setLoading(true);
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("[qr] Failed to generate:", err);
        setLoading(false);
      });
  }, [value, size]);

  const handleDownload = () => {
    downloadQrCode(canvasRef.current, filename);
  };

  const handleShare = async () => {
    await shareQrCode(canvasRef.current, shareTitle, shareText);
    setShareStatus("success");
    setTimeout(() => setShareStatus("idle"), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Canvas */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-xl border-2 border-border flex items-center justify-center"
        style={{ width: size + 8, height: size + 8 }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg"
          style={{ display: loading ? "none" : "block" }}
        />
        {loading && (
          <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-1.5" />
          İndir
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1.5" />
          Paylaş
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
          {copied ? (
            <><Check className="w-4 h-4 mr-1.5" /> Kopyalandı</>
          ) : (
            <><Share2 className="w-4 h-4 mr-1.5" /> Kopyala</>
          )}
        </Button>
      </div>

      {/* Status */}
      {shareStatus === "success" && (
        <p className="text-xs text-profit">QR kod paylaşıldı!</p>
      )}
    </div>
  );
}
