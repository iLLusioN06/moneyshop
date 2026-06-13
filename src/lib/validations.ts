// =============================================
// MoneyShop - Zod Doğrulama Şemaları
// =============================================
// Tüm auth ve transaction API route'ları için
// merkezi validasyon tanımları.
// =============================================

import { z } from "zod";
import { NextResponse } from "next/server";

// ─── Yardımcı: response döndüren safeParse ─────────────

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Request body'sini Zod schema ile doğrula.
 * Başarısız → 400 + field-level hata detayları.
 * Başarılı → tip güvenli data.
 */
export function validateRequest<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      // Zod v4'te code varsa ekle (opsiyonel)
      ...("code" in issue ? { code: issue.code } : {}),
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Doğrulama hatası.",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: result.data };
}

// ─── Ortak Alt Şemalar ───────────────────────────────────

const phoneSchema = z
  .string()
  .min(10, "Telefon numarası en az 10 karakter olmalıdır.")
  .regex(/^\+?\d+$/, "Telefon numarası yalnızca rakam ve başında + içerebilir.");

const emailSchema = z
  .string()
  .email("Geçerli bir e-posta adresi giriniz.");

const passwordSchema = z
  .string()
  .min(6, "Parola en az 6 karakter olmalıdır.");

// ─── Auth Şemaları ───────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ad Soyad en az 2 karakter olmalıdır.")
      .max(100, "Ad Soyad en fazla 100 karakter olabilir.")
      .transform((v) => v.trim()),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

// ───

export const verifySmsSchema = z
  .object({
    phone: phoneSchema,
    code: z
      .string()
      .min(1, "SMS kodu zorunludur.")
      .max(10, "SMS kodu en fazla 10 karakter olabilir."),
    pendingToken: z.string().optional(),
  })
  .strict();

export type VerifySmsInput = z.infer<typeof verifySmsSchema>;

// ───

export const sendLoginCodeSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Parola zorunludur."),
  })
  .strict();

export type SendLoginCodeInput = z.infer<typeof sendLoginCodeSchema>;

// ───

export const verifyLoginCodeSchema = z
  .object({
    phone: phoneSchema,
    code: z
      .string()
      .min(1, "SMS kodu zorunludur.")
      .max(10, "SMS kodu en fazla 10 karakter olabilir."),
  })
  .strict();

export type VerifyLoginCodeInput = z.infer<typeof verifyLoginCodeSchema>;

// ───

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut parola zorunludur."),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni parola, mevcut paroladan farklı olmalıdır.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ───

export const verifyIdentitySchema = z
  .object({
    dateOfBirth: z
      .string()
      .min(1, "Doğum tarihi zorunludur.")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Doğum tarihi YYYY-AA-GG formatında olmalıdır."
      ),
    tcKimlik: z
      .string()
      .regex(/^\d{11}$/, "TC Kimlik numarası 11 haneli olmalıdır.")
      .optional()
      .or(z.literal("")),
  })
  .strict();

export type VerifyIdentityInput = z.infer<typeof verifyIdentitySchema>;

// ───

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ad Soyad en az 2 karakter olmalıdır.")
      .max(100, "Ad Soyad en fazla 100 karakter olabilir.")
      .transform((v) => v.trim()),
    image: z
      .string()
      .url("Geçerli bir URL giriniz.")
      .nullable()
      .optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Transaction Şemaları ────────────────────────────────

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"], {
  message: "Geçersiz işlem türü. INCOME, EXPENSE veya TRANSFER olmalıdır.",
});

const transactionStatusSchema = z
  .enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"], {
    message: "Geçersiz durum.",
  })
  .optional();

export const createTransactionSchema = z
  .object({
    accountId: z.string().min(1, "Hesap ID zorunludur."),
    categoryId: z.string().optional().nullable(),
    type: transactionTypeSchema,
    amount: z
      .number()
      .positive("Tutar 0'dan büyük olmalıdır.")
      .finite("Geçersiz tutar."),
    currency: z
      .string()
      .length(3, "Para birimi 3 karakter olmalıdır (örn: IQD, USD).")
      .optional(),
    description: z
      .string()
      .max(500, "Açıklama en fazla 500 karakter olabilir.")
      .optional()
      .nullable(),
    date: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Geçersiz tarih formatı."))
      .optional(),
  })
  .strict();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// ───

export const updateTransactionSchema = z
  .object({
    categoryId: z.string().nullable().optional(),
    description: z
      .string()
      .max(500, "Açıklama en fazla 500 karakter olabilir.")
      .optional()
      .nullable(),
    date: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Geçersiz tarih formatı."))
      .optional(),
    status: transactionStatusSchema,
  })
  .strict();

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

// ─── Query Param Şemaları ───────────────────────────────

export const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: transactionTypeSchema.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  status: transactionStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
