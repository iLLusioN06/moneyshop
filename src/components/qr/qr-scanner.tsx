"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui";
import { decodeQrUrl, type QrTransferData } from "@/lib/qr";

interface QrScannerProps {
  /** QR kod okunduğunda çağrılır */
  onScan: (data: QrTransferData) => void;
  /** Tarama iptal edildiğinde çağrılır */
  onClose?: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch((e) => {
          console.warn("[qr-scanner] Cleanup stop failed:", e);
        });
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const startScanning = async () => {
    setError(null);

    try {
      const scanner = new Html5Qrcode("qr-scanner-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR kod başarıyla okundu
          const data = decodeQrUrl(decodedText);
          if (data) {
            scanner.stop().catch((e) => {
              console.warn("[qr-scanner] Stop after scan failed:", e);
            });
            setScanning(false);
            onScan(data);
          } else {
            // Bilinmeyen QR formatı — görmezden gel
          }
        },
        () => {
          // Her frame'de çalışır (opsiyonel)
        }
      );

      setScanning(true);
      setCameraReady(true);
    } catch (err) {
      console.error("[qr-scanner] Failed to start:", err);
      setError(
        "Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin."
      );
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("[qr-scanner] Stop error:", e);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setCameraReady(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose?.();
  };

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div
        ref={containerRef}
        id="qr-scanner-container"
        className="relative w-full max-w-sm mx-auto aspect-square bg-black rounded-xl overflow-hidden"
      >
        {!scanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <ScanLine className="w-12 h-12 opacity-50" />
            <p className="text-sm opacity-70">Kamerayı başlatmak için tara butonuna basın</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
            <CameraOff className="w-10 h-10 text-loss" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scan overlay */}
            <div className="absolute inset-[15%] border-2 border-secondary rounded-xl">
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-secondary rounded-full animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
              <span className="text-xs text-white">QR kod aranıyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Info */}
      {cameraReady && scanning && (
        <p className="text-xs text-text-muted text-center">
          QR kodu kameraya hizalayın. Otomatik olarak algılanacaktır.
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!scanning ? (
          <Button onClick={startScanning} isLoading={scanning}>
            <Camera className="w-4 h-4 mr-2" />
            Tara
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanning}>
            <CameraOff className="w-4 h-4 mr-2" />
            Durdur
          </Button>
        )}

        {onClose && (
          <Button variant="ghost" onClick={handleClose}>
            İptal
          </Button>
        )}
      </div>
    </div>
  );
}
