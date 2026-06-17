// =============================================
// MoneyShop - OCR Servisi (Tesseract.js)
// =============================================
// Kimlik belgelerinden bilgi çıkarmak için kullanılır.
// Client-side çalışır, kullanıcı verileri sunucuya gitmez.
// =============================================

import Tesseract from "tesseract.js";

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  data: ExtractedData;
  error?: string;
}

export interface ExtractedData {
  fullName?: string;
  tcKimlik?: string;
  dateOfBirth?: string;
  gender?: string;
  documentNumber?: string;
  expiryDate?: string;
  nationality?: string;
  rawText: string;
}

// Türkçe karakter dönüşümleri
const TURKISH_CHAR_MAP: Record<string, string> = {
  "İ": "I",
  "I": "I",
  "ı": "i",
  "ğ": "g",
  "Ğ": "G",
  "ü": "u",
  "Ü": "U",
  "ş": "s",
  "Ş": "S",
  "ö": "o",
  "Ö": "O",
  "ç": "c",
  "Ç": "C",
};

/**
 * Türkçe karakterleri normalize et
 */
function normalizeTurkish(text: string): string {
  return text;
}

/**
 * T.C. Kimlik No çıkarma (11 haneli)
 */
function extractTCKimlik(text: string): string | undefined {
  // 11 haneli rakam dizisi ara
  const patterns = [
    /T\.?\s*C\.?\s*K\.?\s*İ\.?\s*K\.?\s*İ\.?\s*N\.?\s*O\.?\s*[:\s]*(\d{11})/i,
    /Kimlik\s*(?:No|Numarası)?\.?\s*[:\s]*(\d{11})/i,
    /\b(\d{11})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const tcKimlik = match[1];
      // Basit TC kimlik doğrulama (11 hane ve ilk hane 0 olamaz)
      if (tcKimlik.length === 11 && tcKimlik[0] !== "0") {
        return tcKimlik;
      }
    }
  }

  return undefined;
}

/**
 * İsim çıkarma (T.C. Kimlik vb.后面的satır)
 */
function extractFullName(text: string): string | undefined {
  const patterns = [
    /Ad[ıi]\s*[:\s]*([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*)/i,
    /Ad[ıi]\s*[:\s]*([A-ZÇĞİÖŞÜ\s]+?)(?:\s*Soyad[ıi]|\n|$)/i,
    /Soyad[ıi]\s*[:\s]*([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/i,
  ];

  let name = "";
  let surname = "";

  const nameMatch = text.match(patterns[0]);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  const surnameMatch = text.match(patterns[1]);
  if (surnameMatch) {
    surname = surnameMatch[1].trim();
  }

  if (name && surname) {
    return `${name} ${surname}`;
  }

  // Alternatif: AD SOYAD formatı
  const fullNameMatch = text.match(/(?:AD|Ad)\s*[:\s]*([A-ZÇĞİÖŞÜ\s]+?)(?:\s{2,}|\n)/i);
  if (fullNameMatch) {
    return fullNameMatch[1].trim();
  }

  return undefined;
}

/**
 * Doğum tarihi çıkarma
 */
function extractDateOfBirth(text: string): string | undefined {
  const patterns = [
    /Doğum\s*Tarihi\.?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
    /Dogum\s*Tarihi\.?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
    /(\d{2}[./\-]\d{2}[./\-]\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Cinsiyet çıkarma
 */
function extractGender(text: string): string | undefined {
  const patterns = [
    /Cinsiyet\.?\s*[:\s]*(Erkek|Kadın|E|K)/i,
    /Sex\.?\s*[:\s]*(Male|Female|M|F)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const gender = match[1].toUpperCase();
      if (gender === "ERKEK" || gender === "M") return "Erkek";
      if (gender === "KADIN" || gender === "F") return "Kadın";
    }
  }

  return undefined;
}

/**
 * Belge numarası çıkarma
 */
function extractDocumentNumber(text: string): string | undefined {
  const patterns = [
    /Belge\s*No\.?\s*[:\s]*(\w+)/i,
    /Pasaport\s*No\.?\s*[:\s]*(\w+)/i,
    /Seri\s*No\.?\s*[:\s]*(\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Son kullanma tarihi çıkarma
 */
function extractExpiryDate(text: string): string | undefined {
  const patterns = [
    /Son\s*(?:Kullanma|Geçerlilik)\s*Tarihi\.?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
    /Expiry\s*Date\.?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
    /Valid\s*Until\.?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * OCR ile metin tanı
 */
export async function performOCR(
  imageSource: string | File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    onProgress?.(0);

    const result = await Tesseract.recognize(imageSource, "tur+eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && m.progress) {
          onProgress?.(Math.round(m.progress * 100));
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    // Metinden veri çıkar
    const data: ExtractedData = {
      rawText,
      tcKimlik: extractTCKimlik(rawText),
      fullName: extractFullName(rawText),
      dateOfBirth: extractDateOfBirth(rawText),
      gender: extractGender(rawText),
      documentNumber: extractDocumentNumber(rawText),
      expiryDate: extractExpiryDate(rawText),
    };

    return {
      success: true,
      text: rawText,
      confidence,
      data,
    };
  } catch (error) {
    console.error("OCR error:", error);
    return {
      success: false,
      text: "",
      confidence: 0,
      data: { rawText: "" },
      error: "OCR işlemi sırasında bir hata oluştu.",
    };
  }
}

/**
 * Dosya boyutunu kontrol et (max 5MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Dosya türünü kontrol et
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  return allowedTypes.includes(file.type);
}

/**
 * Dosyayı base64'e çevir
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
