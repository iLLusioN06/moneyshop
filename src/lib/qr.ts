// =============================================
// MoneyShop - QR Kod İşlemleri
// =============================================

/**
 * QR kod içinde kodlanacak transfer bilgileri.
 */
export interface QrTransferData {
  iban: string;
  name: string;
  bank?: string;
  amount?: number;
  currency?: string;
  description?: string;
}

/**
 * QR kod içinde saklanacak URL'nin scheme'i.
 * Tarayıcıda açıldığında MoneyShop uygulamasına yönlendirir.
 */
const QR_BASE_URL = "https://moneyshop.iq/transfer";

/**
 * Transfer bilgilerini QR kod içine gömülecek URL'e dönüştürür.
 */
export function encodeQrData(data: QrTransferData): string {
  const params = new URLSearchParams({
    iban: data.iban.replace(/\s+/g, ""),
    name: data.name,
  });

  if (data.bank) params.set("bank", data.bank);
  if (data.amount) params.set("amount", String(data.amount));
  if (data.currency) params.set("currency", data.currency);
  if (data.description) params.set("description", data.description);

  return `${QR_BASE_URL}?${params.toString()}`;
}

/**
 * QR kod URL'ini çözümleyip transfer verisine dönüştürür.
 */
export function decodeQrUrl(url: string): QrTransferData | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.includes("/transfer")) return null;

    const iban = parsed.searchParams.get("iban");
    const name = parsed.searchParams.get("name");
    if (!iban || !name) return null;

    return {
      iban,
      name,
      bank: parsed.searchParams.get("bank") || undefined,
      amount: parsed.searchParams.get("amount")
        ? Number(parsed.searchParams.get("amount"))
        : undefined,
      currency: parsed.searchParams.get("currency") || undefined,
      description: parsed.searchParams.get("description") || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * QR kod'u PNG olarak indirilebilir URL'e dönüştürür.
 */
export function downloadQrCode(
  canvas: HTMLCanvasElement | null,
  filename = "moneyshop-qr.png"
) {
  if (!canvas) return;
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * QR kod'u paylaş (Web Share API).
 */
export async function shareQrCode(
  canvas: HTMLCanvasElement | null,
  title = "MoneyShop QR Kod",
  text = "MoneyShop hesabıma para göndermek için QR kodu okutun."
) {
  if (!canvas) return;

  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );
    if (!blob) return;

    const file = new File([blob], "moneyshop-qr.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ title, text, files: [file] });
    } else {
      // Web Share desteklenmiyorsa kopyala
      await navigator.clipboard.writeText(text);
    }
  } catch {
    // Paylaşım iptal edildi veya başarısız
  }
}
