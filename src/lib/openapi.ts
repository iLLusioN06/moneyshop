// =============================================
// MoneyShop - OpenAPI 3.0 Specification
// =============================================
// This file contains the complete OpenAPI specification
// for all MoneyShop API endpoints.
// =============================================

const spec = {
  openapi: "3.0.3",
  info: {
    title: "MoneyShop API",
    description:
      "MoneyShop is a personal finance management platform. This API provides endpoints for managing accounts, transactions, budgets, categories, cards, investments, recurring payments, and more.\n\n## Authentication\n\nMost endpoints require authentication via Bearer token. Obtain a session by logging in through the `/api/auth/callback/credentials` endpoint.\n\n## Base URL\n\n- Development: `http://localhost:3000`\n- Production: As configured on your Vercel deployment",
    version: "1.0.0",
    contact: {
      name: "MoneyShop Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
    {
      url: "https://money-shop.vercel.app",
      description: "Production",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "NextAuth.js session cookie (HTTP-only). Include the session cookie from your browser session.\n\nFor testing, use the Swagger UI \"Authorize\" button with a valid session token.",
      },
    },
    schemas: {
      // ─── Error —────────────────────────────────
      ApiError: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            description: "Hata mesajı (Türkçe)",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
                code: { type: "string" },
              },
            },
            description: "Doğrulama hataları (varsa field-level)",
          },
        },
      },

      // ─── Success —──────────────────────────────
      ApiSuccess: {
        type: "object",
        required: ["success"],
        properties: {
          success: {
            type: "boolean",
            enum: [true],
          },
          message: {
            type: "string",
            description: "Başarılı işlem mesajı",
          },
        },
      },

      // ─── Pagination —───────────────────────────
      PaginationInfo: {
        type: "object",
        properties: {
          total: { type: "integer", description: "Toplam kayıt sayısı" },
          page: { type: "integer", description: "Geçerli sayfa" },
          limit: { type: "integer", description: "Sayfa başına kayıt" },
          totalPages: { type: "integer", description: "Toplam sayfa sayısı" },
        },
      },

      // ─── Auth —─────────────────────────────────
      RegisterInput: {
        type: "object",
        required: ["name", "email", "phone", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100, description: "Ad Soyad" },
          email: { type: "string", format: "email", description: "E-posta adresi" },
          phone: { type: "string", description: "Telefon numarası (başında + ile)" },
          password: { type: "string", minLength: 6, description: "Parola" },
        },
      },
      RegisterResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [true] },
          message: { type: "string" },
          phone: { type: "string", description: "Telefonun son 4 hanesi" },
          pendingToken: { type: "string", description: "Geçici doğrulama token'ı" },
        },
      },

      VerifySmsInput: {
        type: "object",
        required: ["phone", "code"],
        properties: {
          phone: { type: "string", description: "Telefon numarası" },
          code: { type: "string", description: "SMS ile gelen doğrulama kodu" },
          pendingToken: { type: "string", description: "Kayıt sonrası alınan geçici token" },
        },
      },

      SendLoginCodeInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },

      VerifyLoginCodeInput: {
        type: "object",
        required: ["phone", "code"],
        properties: {
          phone: { type: "string" },
          code: { type: "string" },
        },
      },

      ForgotPasswordInput: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },

      ResetPasswordInput: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string", description: "Sıfırlama token'ı" },
          password: { type: "string", minLength: 6 },
        },
      },

      ChangePasswordInput: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 6, description: "Mevcut paroladan farklı olmalı" },
        },
      },

      UpdateProfileInput: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          image: { type: "string", format: "uri", nullable: true },
        },
      },

      VerifyIdentityInput: {
        type: "object",
        required: ["dateOfBirth", "address", "identityNumber"],
        properties: {
          dateOfBirth: { type: "string", format: "date", description: "YYYY-AA-GG" },
          tcKimlik: { type: "string", pattern: "^\\d{11}$", description: "TC Kimlik (opsiyonel)" },
          address: { type: "string", minLength: 10, maxLength: 500 },
          identityNumber: { type: "string", minLength: 5, maxLength: 20 },
        },
      },

      // ─── 2FA —──────────────────────────────────
      TwoFactorSetupInput: {
        type: "object",
        required: ["method"],
        properties: {
          method: { type: "string", enum: ["AUTHENTICATOR", "SMS"] },
        },
      },
      TwoFactorSetupResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              secret: { type: "string", description: "Authenticator secret (AUTHENTICATOR yöntemi için)" },
              otpauthUrl: { type: "string", description: "OTP Auth URL (QR kod için)" },
              qrCode: { type: "string", description: "QR kod base64 (isteğe bağlı)" },
              method: { type: "string" },
            },
          },
        },
      },

      TwoFactorVerifySetupInput: {
        type: "object",
        required: ["method", "code"],
        properties: {
          method: { type: "string", enum: ["AUTHENTICATOR", "SMS"] },
          secret: { type: "string", description: "AUTHENTICATOR için ham secret" },
          code: { type: "string", description: "Doğrulama kodu" },
        },
      },

      TwoFactorToggleInput: {
        type: "object",
        required: ["enabled"],
        properties: {
          enabled: { type: "boolean" },
          method: { type: "string", enum: ["AUTHENTICATOR", "SMS"] },
        },
      },

      TwoFactorInitLoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },

      TwoFactorVerifyLoginInput: {
        type: "object",
        required: ["pendingToken", "code"],
        properties: {
          pendingToken: { type: "string" },
          code: { type: "string" },
          isBackupCode: { type: "boolean", default: false },
        },
      },

      TwoFactorSendSmsInput: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string" },
        },
      },

      // ─── Account —──────────────────────────────
      Account: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          name: { type: "string" },
          type: { type: "string", enum: ["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "CASH", "LOAN"] },
          balance: { type: "number" },
          currency: { type: "string", enum: ["TRY", "USD", "EUR", "GBP", "CHF", "XAU", "BTC", "ETH"] },
          icon: { type: "string", nullable: true },
          color: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      CreateAccountInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", description: "Hesap adı" },
          type: { type: "string", enum: ["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "CASH", "LOAN"], default: "CHECKING" },
          balance: { type: "number", default: 0 },
          currency: { type: "string", enum: ["TRY", "USD", "EUR", "GBP", "CHF", "XAU", "BTC", "ETH"], default: "TRY" },
          icon: { type: "string", nullable: true },
          color: { type: "string", nullable: true },
        },
      },

      UpdateAccountInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "CASH", "LOAN"] },
          balance: { type: "number" },
          currency: { type: "string", enum: ["TRY", "USD", "EUR", "GBP", "CHF", "XAU", "BTC", "ETH"] },
          icon: { type: "string", nullable: true },
          color: { type: "string", nullable: true },
          isActive: { type: "boolean" },
        },
      },

      // ─── Transaction —──────────────────────────
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid", nullable: true },
          type: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] },
          amount: { type: "number" },
          currency: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["COMPLETED", "PENDING", "FAILED", "CANCELLED"] },
          date: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          recipientName: { type: "string", nullable: true },
          recipientIban: { type: "string", nullable: true },
          recipientBank: { type: "string", nullable: true },
          recipientUserId: { type: "string", nullable: true },
          category: { $ref: "#/components/schemas/Category" },
          account: { $ref: "#/components/schemas/Account" },
        },
      },

      CreateTransactionInput: {
        type: "object",
        required: ["accountId", "type", "amount"],
        properties: {
          accountId: { type: "string", description: "Hesap ID" },
          categoryId: { type: "string", nullable: true },
          type: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] },
          amount: { type: "number", exclusiveMinimum: 0 },
          currency: { type: "string", maxLength: 3, description: "3 karakter (örn: IQD, USD)" },
          description: { type: "string", maxLength: 500, nullable: true },
          date: { type: "string", description: "ISO 8601 veya YYYY-AA-GG" },
        },
      },

      UpdateTransactionInput: {
        type: "object",
        properties: {
          categoryId: { type: "string", nullable: true },
          description: { type: "string", maxLength: 500, nullable: true },
          date: { type: "string" },
          status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] },
        },
      },

      ListTransactionsQuery: {
        type: "object",
        properties: {
          page: { type: "integer", default: 1, minimum: 1 },
          limit: { type: "integer", default: 20, minimum: 1, maximum: 100 },
          type: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] },
          accountId: { type: "string" },
          categoryId: { type: "string" },
          status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] },
          startDate: { type: "string" },
          endDate: { type: "string" },
          search: { type: "string" },
        },
      },

      // ─── Category —─────────────────────────────
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          name: { type: "string" },
          icon: { type: "string" },
          color: { type: "string" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          isDefault: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      CreateCategoryInput: {
        type: "object",
        required: ["name", "type"],
        properties: {
          name: { type: "string" },
          icon: { type: "string", default: "circle" },
          color: { type: "string", default: "#94a3b8" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
        },
      },

      UpdateCategoryInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          icon: { type: "string" },
          color: { type: "string" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
        },
      },

      // ─── Budget —───────────────────────────────
      Budget: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          amount: { type: "number" },
          spent: { type: "number", description: "Dönem içi harcanan miktar (hesaplanan)" },
          currency: { type: "string" },
          period: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"] },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          category: { $ref: "#/components/schemas/Category" },
        },
      },

      CreateBudgetInput: {
        type: "object",
        required: ["categoryId", "amount"],
        properties: {
          categoryId: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          currency: { type: "string", default: "TRY" },
          period: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"], default: "MONTHLY" },
          startDate: { type: "string" },
          endDate: { type: "string", nullable: true },
        },
      },

      UpdateBudgetInput: {
        type: "object",
        properties: {
          categoryId: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          period: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"] },
          startDate: { type: "string" },
          endDate: { type: "string", nullable: true },
        },
      },

      // ─── Card —─────────────────────────────────
      Card: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          cardType: { type: "string", enum: ["STANDARD", "SILVER", "GOLD"] },
          cardNumber: { type: "string", description: "Maskelenmiş kart numarası (örn: 4532 **** **** 1234)" },
          cardHolderName: { type: "string" },
          expiryMonth: { type: "integer" },
          expiryYear: { type: "integer" },
          cvv: { type: "string", description: "Her zaman *** olarak döner" },
          status: { type: "string", enum: ["ACTIVE", "BLOCKED", "CANCELLED", "PENDING"] },
          dailyLimit: { type: "number" },
          monthlyLimit: { type: "number" },
          currentDailySpent: { type: "number" },
          currentMonthlySpent: { type: "number" },
          balance: { type: "number" },
          currency: { type: "string" },
          issuedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      CreateCardInput: {
        type: "object",
        required: ["cardType"],
        properties: {
          cardType: { type: "string", enum: ["STANDARD", "SILVER", "GOLD"] },
        },
      },

      UpdateCardInput: {
        type: "object",
        required: ["action"],
        properties: {
          action: { type: "string", enum: ["block", "unblock", "cancel"] },
        },
      },

      CardAnalytics: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              totalSpent: { type: "number" },
              totalTransactions: { type: "integer" },
              monthlySpending: { type: "array", items: { type: "object" } },
              categoryBreakdown: { type: "array", items: { type: "object" } },
            },
          },
        },
      },

      // ─── Investment —───────────────────────────
      Investment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string" },
          accountId: { type: "string" },
          name: { type: "string" },
          symbol: { type: "string" },
          type: { type: "string", enum: ["STOCK", "ETF", "CRYPTO", "COMMODITY", "FOREX", "FUND"] },
          shares: { type: "number" },
          buyPrice: { type: "number" },
          currentPrice: { type: "number" },
          currency: { type: "string" },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          account: { $ref: "#/components/schemas/Account" },
        },
      },

      CreateInvestmentInput: {
        type: "object",
        required: ["accountId", "name", "symbol", "shares", "buyPrice"],
        properties: {
          accountId: { type: "string" },
          name: { type: "string" },
          symbol: { type: "string" },
          type: { type: "string", enum: ["STOCK", "ETF", "CRYPTO", "COMMODITY", "FOREX", "FUND"], default: "STOCK" },
          shares: { type: "number" },
          buyPrice: { type: "number" },
          currentPrice: { type: "number" },
          currency: { type: "string" },
          notes: { type: "string", nullable: true },
        },
      },

      UpdateInvestmentInput: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
          currentPrice: { type: "number" },
          shares: { type: "number" },
          notes: { type: "string", nullable: true },
        },
      },

      // ─── Recurring Transaction —────────────────
      RecurringTransaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string" },
          accountId: { type: "string" },
          categoryId: { type: "string", nullable: true },
          type: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] },
          amount: { type: "number" },
          currency: { type: "string" },
          description: { type: "string", nullable: true },
          frequency: { type: "string", enum: ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] },
          intervalCount: { type: "integer", default: 1 },
          dayOfMonth: { type: "integer", nullable: true },
          dayOfWeek: { type: "integer", nullable: true },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          nextDate: { type: "string", format: "date-time" },
          lastProcessed: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"] },
          totalOccurrences: { type: "integer", nullable: true },
          occurrenceCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          account: { $ref: "#/components/schemas/Account" },
          category: { $ref: "#/components/schemas/Category" },
        },
      },

      CreateRecurringTransactionInput: {
        type: "object",
        required: ["accountId", "type", "amount", "frequency", "startDate"],
        properties: {
          accountId: { type: "string" },
          categoryId: { type: "string", nullable: true },
          type: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] },
          amount: { type: "number", exclusiveMinimum: 0 },
          currency: { type: "string" },
          description: { type: "string", nullable: true },
          frequency: { type: "string", enum: ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] },
          intervalCount: { type: "integer", default: 1 },
          dayOfMonth: { type: "integer", nullable: true },
          dayOfWeek: { type: "integer", nullable: true },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date", nullable: true },
          totalOccurrences: { type: "integer", nullable: true },
          transferRecipientName: { type: "string", nullable: true },
          transferRecipientIban: { type: "string", nullable: true },
          transferRecipientBank: { type: "string", nullable: true },
          recipientUserId: { type: "string", nullable: true },
        },
      },

      UpdateRecurringTransactionInput: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ACTIVE", "PAUSED", "CANCELLED"] },
          description: { type: "string", nullable: true },
          amount: { type: "number" },
          categoryId: { type: "string", nullable: true },
        },
      },

      // ─── Deposit / Withdrawal / Payment / Transfer —─
      DepositInput: {
        type: "object",
        required: ["accountId", "amount", "method"],
        properties: {
          accountId: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          method: { type: "string", enum: ["iban", "card", "atm"] },
        },
      },

      WithdrawalInput: {
        type: "object",
        required: ["accountId", "amount", "method"],
        properties: {
          accountId: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          method: { type: "string", enum: ["iban", "qr", "card"] },
          recipientIban: { type: "string", description: "IBAN çekimlerinde zorunlu" },
          recipientName: { type: "string", description: "IBAN çekimlerinde zorunlu" },
        },
      },

      PaymentInput: {
        type: "object",
        required: ["accountId", "amount", "billType"],
        properties: {
          accountId: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          billType: { type: "string", description: "Fatura türü (electricity, water, gas, internet, phone, etc.)" },
          referenceNumber: { type: "string", description: "Fatura referans numarası" },
        },
      },

      TransferInput: {
        type: "object",
        required: ["senderAccountId", "amount", "type"],
        properties: {
          type: { type: "string", enum: ["fast", "eft"], description: "FAST (MoneyShop içi) veya EFT (harici IBAN)" },
          senderAccountId: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          currency: { type: "string" },
          description: { type: "string" },
          recipientIdentifier: { type: "string", description: "FAST için: alıcı e-posta veya kullanıcı adı" },
          recipientName: { type: "string", description: "EFT için: alıcı adı" },
          recipientIban: { type: "string", description: "EFT için: alıcı IBAN" },
          recipientBank: { type: "string", description: "EFT için: banka adı (opsiyonel)" },
        },
      },

      // ─── Exchange Rates —───────────────────────
      ExchangeRatesResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              base: { type: "string" },
              rates: { type: "object", additionalProperties: { type: "number" } },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },

      // ─── Dashboard —────────────────────────────
      DashboardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              totalBalance: { type: "number" },
              totalIncome: { type: "number" },
              totalExpense: { type: "number" },
              netWorth: { type: "number" },
              currency: { type: "string" },
              incomeChange: { type: "number" },
              expenseChange: { type: "number" },
              balanceChange: { type: "number" },
              accounts: { type: "array", items: { $ref: "#/components/schemas/Account" } },
              exchangeRates: { type: "object" },
              recentTransactions: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
              monthlyData: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string" },
                    income: { type: "number" },
                    expense: { type: "number" },
                  },
                },
              },
              categoryBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    color: { type: "string" },
                    icon: { type: "string" },
                    amount: { type: "number" },
                    percentage: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },

      // ─── Search —───────────────────────────────
      SearchResponse: {
        type: "object",
        properties: {
          results: {
            type: "object",
            properties: {
              transactions: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
              accounts: { type: "array", items: { $ref: "#/components/schemas/Account" } },
              categories: { type: "array", items: { $ref: "#/components/schemas/Category" } },
              users: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string", nullable: true },
                    email: { type: "string" },
                    phone: { type: "string" },
                    role: { type: "string" },
                    isActive: { type: "boolean" },
                  },
                },
                description: "Sadece adminler için",
              },
            },
          },
          total: { type: "integer" },
        },
      },

      // ─── Admin —────────────────────────────────
      AdminStatsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              totalUsers: { type: "integer" },
              activeUsers: { type: "integer" },
              suspendedUsers: { type: "integer" },
              totalAccounts: { type: "integer" },
              totalTransactions: { type: "integer" },
              monthlyTransactions: { type: "integer" },
              monthlyIncome: { type: "number" },
              monthlyExpense: { type: "number" },
              totalVolume: { type: "number" },
              recentTransactions: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
            },
          },
        },
      },

      UpdateUserInput: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string" },
          role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] },
          isActive: { type: "boolean" },
        },
      },

      EmailNotificationSettings: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          email: { type: "string", format: "email" },
          enabled: { type: "boolean" },
          onTransaction: { type: "boolean" },
          onTransfer: { type: "boolean" },
          onBudgetAlert: { type: "boolean" },
          onMonthlyReport: { type: "boolean" },
          onLargeTransaction: { type: "boolean" },
        },
      },

      UpdateEmailNotificationInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          enabled: { type: "boolean" },
          onTransaction: { type: "boolean" },
          onTransfer: { type: "boolean" },
          onBudgetAlert: { type: "boolean" },
          onMonthlyReport: { type: "boolean" },
          onLargeTransaction: { type: "boolean" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ─────────────────────────────────────────────
    //  AUTH ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Kullanıcı kaydı",
        description: "Yeni kullanıcı kaydı oluşturur. SMS doğrulama kodu gönderir.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
        },
        responses: {
          "200": {
            description: "Kayıt başarılı, SMS kodu gönderildi",
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterResponse" } } },
          },
          "400": { description: "Doğrulama hatası", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "409": { description: "E-posta veya telefon zaten kayıtlı", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/verify-sms": {
      post: {
        tags: ["Auth"],
        summary: "SMS doğrulama",
        description: "Kayıt sırasında gönderilen SMS kodunu doğrular.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifySmsInput" } } },
        },
        responses: {
          "200": { description: "Doğrulama başarılı" },
          "400": { description: "Geçersiz kod", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/send-login-code": {
      post: {
        tags: ["Auth"],
        summary: "Giriş SMS kodu gönder",
        description: "E-posta ve parola ile doğrulama yapıp SMS kodu gönderir (2FA).",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SendLoginCodeInput" } } },
        },
        responses: {
          "200": { description: "SMS kodu gönderildi" },
          "400": { description: "Geçersiz kimlik bilgileri", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/verify-login-code": {
      post: {
        tags: ["Auth"],
        summary: "Giriş SMS kodu doğrula",
        description: "Giriş için SMS kodunu doğrular.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyLoginCodeInput" } } },
        },
        responses: {
          "200": { description: "Doğrulama başarılı" },
          "400": { description: "Geçersiz kod", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Profil bilgileri",
        description: "Oturum açmış kullanıcının profil bilgilerini getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profil bilgileri" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Profili güncelle",
        description: "Kullanıcı adı ve profil resmini günceller.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileInput" } } },
        },
        responses: {
          "200": { description: "Profil güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Parola değiştir",
        description: "Mevcut parolayı doğrulayarak yeni parola belirler.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordInput" } } },
        },
        responses: {
          "200": { description: "Parola değiştirildi" },
          "400": { description: "Geçersiz mevcut parola", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Parola sıfırlama talebi",
        description: "E-posta adresine parola sıfırlama bağlantısı gönderir.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordInput" } } },
        },
        responses: {
          "200": { description: "Sıfırlama e-postası gönderildi (varsa)" },
          "400": { description: "Geçersiz e-posta", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Parolayı sıfırla",
        description: "Token ile parolayı sıfırlar.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordInput" } } },
        },
        responses: {
          "200": { description: "Parola sıfırlandı" },
          "400": { description: "Geçersiz veya süresi dolmuş token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/verify": {
      get: {
        tags: ["Auth"],
        summary: "Kimlik doğrulama durumu",
        description: "Kullanıcının kimlik doğrulama durumunu getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Doğrulama durumu" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Kimlik doğrulama gönder",
        description: "Kullanıcının kimlik bilgilerini doğrulama için gönderir.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyIdentityInput" } } },
        },
        responses: {
          "200": { description: "Doğrulama başarılı" },
          "400": { description: "Geçersiz bilgiler", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/[...nextauth]": {
      get: {
        tags: ["Auth"],
        summary: "NextAuth.js handler",
        description: "NextAuth.js tüm auth işlemleri (giriş, callback, oturum, çıkış).",
      },
      post: {
        tags: ["Auth"],
        summary: "NextAuth.js handler",
        description: "NextAuth.js kimlik doğrulama işlemleri.",
      },
    },

    // ─────────────────────────────────────────────
    //  2FA ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/auth/2fa/setup": {
      post: {
        tags: ["2FA"],
        summary: "2FA kurulumu başlat",
        description: "İki faktörlü doğrulama kurulumunu başlatır. Secret ve QR kod döner.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorSetupInput" } } },
        },
        responses: {
          "200": { description: "Kurulum başlatıldı", content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorSetupResponse" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/auth/2fa/verify-setup": {
      post: {
        tags: ["2FA"],
        summary: "2FA kurulumunu doğrula",
        description: "Kullanıcının kodu doğru girdiğini doğrular ve 2FA'yı aktifleştirir.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorVerifySetupInput" } } },
        },
        responses: {
          "200": { description: "2FA aktifleştirildi" },
          "400": { description: "Geçersiz kod", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/auth/2fa/status": {
      get: {
        tags: ["2FA"],
        summary: "2FA durumu",
        description: "Kullanıcının 2FA durumunu döndürür.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "2FA durumu" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/auth/2fa/toggle": {
      post: {
        tags: ["2FA"],
        summary: "2FA aç/kapa",
        description: "İki faktörlü doğrulamayı etkinleştirir veya devre dışı bırakır.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorToggleInput" } } },
        },
        responses: {
          "200": { description: "2FA durumu güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/auth/2fa/send-sms": {
      post: {
        tags: ["2FA"],
        summary: "2FA SMS gönder",
        description: "2FA doğrulama SMS'i gönderir.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorSendSmsInput" } } },
        },
        responses: {
          "200": { description: "SMS gönderildi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/auth/2fa/init-login": {
      post: {
        tags: ["2FA"],
        summary: "2FA giriş başlat",
        description: "E-posta ve parola ile 2FA giriş sürecini başlatır.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorInitLoginInput" } } },
        },
        responses: {
          "200": { description: "2FA giriş başlatıldı" },
          "400": { description: "Geçersiz kimlik bilgileri" },
        },
      },
    },

    "/api/auth/2fa/verify-login": {
      post: {
        tags: ["2FA"],
        summary: "2FA giriş doğrula",
        description: "2FA kodunu doğrulayarak girişi tamamlar.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TwoFactorVerifyLoginInput" } } },
        },
        responses: {
          "200": { description: "Giriş başarılı" },
          "400": { description: "Geçersiz kod", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  ACCOUNT ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/accounts": {
      get: {
        tags: ["Accounts"],
        summary: "Hesapları listele",
        description: "Kullanıcının tüm finansal hesaplarını listeler.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Hesaplar listesi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Accounts"],
        summary: "Yeni hesap oluştur",
        description: "Kullanıcı için yeni bir finansal hesap oluşturur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAccountInput" } } },
        },
        responses: {
          "201": { description: "Hesap oluşturuldu" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/accounts/{id}": {
      get: {
        tags: ["Accounts"],
        summary: "Hesap detayı",
        description: "Belirli bir hesabın detaylarını getirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Hesap ID" },
        ],
        responses: {
          "200": { description: "Hesap detayı" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
      put: {
        tags: ["Accounts"],
        summary: "Hesap güncelle",
        description: "Hesap bilgilerini günceller.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateAccountInput" } } },
        },
        responses: {
          "200": { description: "Hesap güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
      delete: {
        tags: ["Accounts"],
        summary: "Hesabı devre dışı bırak",
        description: "Hesabı soft-delete yapar (isActive = false).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Hesap devre dışı bırakıldı" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  TRANSACTION ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "İşlemleri listele",
        description: "Kullanıcının işlemlerini filtreleme ve sayfalama ile listeler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "type", in: "query", schema: { type: "string", enum: ["INCOME", "EXPENSE", "TRANSFER"] } },
          { name: "accountId", in: "query", schema: { type: "string" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] } },
          { name: "startDate", in: "query", schema: { type: "string" } },
          { name: "endDate", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "İşlem listesi (sayfalı)" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Yeni işlem oluştur",
        description: "Yeni bir finansal işlem oluşturur ve hesap bakiyesini günceller.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTransactionInput" } } },
        },
        responses: {
          "201": { description: "İşlem oluşturuldu" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    "/api/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "İşlem detayı",
        description: "Belirli bir işlemin detaylarını getirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "İşlem detayı" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "İşlem bulunamadı" },
        },
      },
      put: {
        tags: ["Transactions"],
        summary: "İşlem güncelle",
        description: "İşlem metadata bilgilerini günceller (bakiyeyi etkilemez).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTransactionInput" } } },
        },
        responses: {
          "200": { description: "İşlem güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "İşlem bulunamadı" },
        },
      },
      delete: {
        tags: ["Transactions"],
        summary: "İşlemi sil",
        description: "İşlemi siler ve hesap bakiyesini geri alır.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "İşlem silindi, bakiye güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "İşlem bulunamadı" },
        },
      },
    },

    "/api/transactions/{id}/dekont": {
      get: {
        tags: ["Transactions"],
        summary: "İşlem dekontu (PDF)",
        description: "Belirli bir işlem için PDF dekont oluşturur ve indirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "PDF dekont", content: { "application/pdf": {} } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "İşlem bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  CATEGORY ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Kategorileri listele",
        description: "Kullanıcının tüm kategorilerini listeler.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Kategori listesi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Yeni kategori oluştur",
        description: "Kullanıcı için yeni bir kategori oluşturur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryInput" } } },
        },
        responses: {
          "201": { description: "Kategori oluşturuldu" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Kategori detayı",
        description: "Belirli bir kategorinin detaylarını getirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Kategori detayı" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Kategori bulunamadı" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Kategori güncelle",
        description: "Kategori bilgilerini günceller (admin yetkisi gerektirir).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryInput" } } },
        },
        responses: {
          "200": { description: "Kategori güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "403": { description: "Yetkisiz erişim (admin gerekli)" },
          "404": { description: "Kategori bulunamadı" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Kategori sil",
        description: "Kategoriyi siler (admin yetkisi gerektirir, varsayılan kategoriler silinemez).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Kategori silindi" },
          "400": { description: "Varsayılan kategoriler silinemez" },
          "401": { description: "Yetkilendirme gerekli" },
          "403": { description: "Yetkisiz erişim (admin gerekli)" },
          "404": { description: "Kategori bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  BUDGET ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/budgets": {
      get: {
        tags: ["Budgets"],
        summary: "Bütçeleri listele",
        description: "Kullanıcının tüm bütçelerini harcama ilerlemesi ile listeler.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Bütçe listesi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Budgets"],
        summary: "Yeni bütçe oluştur",
        description: "Kullanıcı için yeni bir bütçe oluşturur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBudgetInput" } } },
        },
        responses: {
          "201": { description: "Bütçe oluşturuldu" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Kategori bulunamadı" },
          "409": { description: "Bu kategori için zaten aktif bütçe var" },
        },
      },
    },

    "/api/budgets/{id}": {
      get: {
        tags: ["Budgets"],
        summary: "Bütçe detayı",
        description: "Belirli bir bütçenin detaylarını getirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Bütçe detayı" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Bütçe bulunamadı" },
        },
      },
      put: {
        tags: ["Budgets"],
        summary: "Bütçe güncelle",
        description: "Bütçe bilgilerini günceller.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateBudgetInput" } } },
        },
        responses: {
          "200": { description: "Bütçe güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Bütçe bulunamadı" },
        },
      },
      delete: {
        tags: ["Budgets"],
        summary: "Bütçe sil",
        description: "Bütçeyi siler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Bütçe silindi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Bütçe bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  CARD ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/cards": {
      get: {
        tags: ["Cards"],
        summary: "Kart bilgileri",
        description: "Kullanıcının MoneyShop kartını getirir. Kart yoksa otomatik oluşturur.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Kart bilgileri (maskelenmiş)" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Cards"],
        summary: "Kart oluştur / tipini değiştir",
        description: "Yeni kart oluşturur veya mevcut kartın tipini değiştirir.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCardInput" } } },
        },
        responses: {
          "201": { description: "Kart oluşturuldu" },
          "200": { description: "Kart tipi güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      patch: {
        tags: ["Cards"],
        summary: "Kart işlemleri (bloke/kaldır/iptal)",
        description: "Kartı bloke etme, blokeyi kaldırma veya kartı iptal etme.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCardInput" } } },
        },
        responses: {
          "200": { description: "Kart durumu güncellendi" },
          "400": { description: "Geçersiz işlem", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Kart bulunamadı" },
        },
      },
    },

    "/api/cards/analytics": {
      get: {
        tags: ["Cards"],
        summary: "Kart analitikleri",
        description: "Kart harcama analitiklerini getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Kart analitikleri", content: { "application/json": { schema: { $ref: "#/components/schemas/CardAnalytics" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  INVESTMENT ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/investments": {
      get: {
        tags: ["Investments"],
        summary: "Yatırımları listele",
        description: "Kullanıcının yatırımlarını portföy özeti ile listeler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "accountId", in: "query", schema: { type: "string" }, description: "Hesaba göre filtrele" },
        ],
        responses: {
          "200": { description: "Yatırım listesi ve portföy özeti" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Investments"],
        summary: "Yeni yatırım ekle",
        description: "Kullanıcı için yeni bir yatırım kaydı ekler.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateInvestmentInput" } } },
        },
        responses: {
          "201": { description: "Yatırım eklendi" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
      patch: {
        tags: ["Investments"],
        summary: "Yatırım güncelle",
        description: "Yatırımın güncel fiyatını, miktarını veya notlarını günceller.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateInvestmentInput" } } },
        },
        responses: {
          "200": { description: "Yatırım güncellendi" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Yatırım bulunamadı" },
        },
      },
      delete: {
        tags: ["Investments"],
        summary: "Yatırım sil",
        description: "Yatırım kaydını siler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Yatırım silindi" },
          "400": { description: "Yatırım ID gerekli" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Yatırım bulunamadı" },
        },
      },
    },

    "/api/investments/prices": {
      get: {
        tags: ["Investments"],
        summary: "Güncel fiyatlar",
        description: "Yatırım araçlarının güncel fiyatlarını getirir.",
        responses: {
          "200": { description: "Güncel fiyatlar" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  RECURRING TRANSACTION ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/recurring-transactions": {
      get: {
        tags: ["Recurring Transactions"],
        summary: "Tekrarlanan işlemleri listele",
        description: "Kullanıcının tekrarlanan işlemlerini listeler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": { description: "Tekrarlanan işlem listesi (sayfalı)" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Recurring Transactions"],
        summary: "Tekrarlanan işlem oluştur",
        description: "Yeni bir tekrarlanan işlem oluşturur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateRecurringTransactionInput" } } },
        },
        responses: {
          "201": { description: "Tekrarlanan işlem oluşturuldu" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    "/api/recurring-transactions/{id}": {
      patch: {
        tags: ["Recurring Transactions"],
        summary: "Tekrarlanan işlemi güncelle",
        description: "Tekrarlanan işlemin durumunu, miktarını veya açıklamasını günceller.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRecurringTransactionInput" } } },
        },
        responses: {
          "200": { description: "Tekrarlanan işlem güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Tekrarlanan işlem bulunamadı" },
        },
      },
      delete: {
        tags: ["Recurring Transactions"],
        summary: "Tekrarlanan işlemi iptal et",
        description: "Tekrarlanan işlemi iptal eder (soft delete - CANCELLED).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Tekrarlanan işlem iptal edildi" },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Tekrarlanan işlem bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  DEPOSIT / WITHDRAWAL / PAYMENT / TRANSFER
    // ─────────────────────────────────────────────

    "/api/deposits": {
      post: {
        tags: ["Financial Operations"],
        summary: "Para yatır",
        description: "Hesaba para yatırma işlemi yapar. Bakiye ve işlem kaydı otomatik oluşturulur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/DepositInput" } } },
        },
        responses: {
          "201": { description: "Para yatırma başarılı" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    "/api/withdrawals": {
      post: {
        tags: ["Financial Operations"],
        summary: "Para çek",
        description: "Hesaptan para çekme işlemi yapar. Bakiye ve işlem kaydı otomatik oluşturulur.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/WithdrawalInput" } } },
        },
        responses: {
          "201": { description: "Para çekme başarılı" },
          "400": { description: "Geçersiz giriş veya yetersiz bakiye", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    "/api/payments": {
      post: {
        tags: ["Financial Operations"],
        summary: "Fatura öde",
        description: "Fatura ödemesi yapar. Desteklenen fatura türleri: elektrik, su, doğalgaz, internet, telefon vb.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PaymentInput" } } },
        },
        responses: {
          "201": { description: "Ödeme başarılı" },
          "400": { description: "Geçersiz giriş veya yetersiz bakiye", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Hesap bulunamadı" },
        },
      },
    },

    "/api/transfers": {
      get: {
        tags: ["Financial Operations"],
        summary: "Transferleri listele",
        description: "Kullanıcının son transfer işlemlerini listeler.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["fast", "eft"] }, description: "Transfer türü" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 50 } },
        ],
        responses: {
          "200": { description: "Transfer listesi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      post: {
        tags: ["Financial Operations"],
        summary: "Transfer yap",
        description: "FAST (MoneyShop içi) veya EFT (harici IBAN) transferi yapar.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransferInput" } } },
        },
        responses: {
          "201": { description: "Transfer başarılı" },
          "400": { description: "Geçersiz giriş veya yetersiz bakiye", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Yetkilendirme gerekli" },
          "404": { description: "Gönderen/alıcı hesap bulunamadı" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  EXCHANGE RATES
    // ─────────────────────────────────────────────

    "/api/exchange-rates": {
      get: {
        tags: ["Exchange Rates"],
        summary: "Döviz kurları",
        description: "Güncel döviz kurlarını getirir.",
        parameters: [
          { name: "base", in: "query", schema: { type: "string", default: "TRY" }, description: "Baz para birimi" },
        ],
        responses: {
          "200": { description: "Döviz kurları", content: { "application/json": { schema: { $ref: "#/components/schemas/ExchangeRatesResponse" } } } },
          "400": { description: "Desteklenmeyen para birimi", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  DASHBOARD
    // ─────────────────────────────────────────────

    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard özeti",
        description: "Kullanıcının dashboard verilerini getirir: toplam bakiye, aylık gelir/gider, son işlemler, kategoriler, döviz kurları.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "base", in: "query", schema: { type: "string", default: "TRY" }, description: "Para birimi dönüşüm bazı" },
        ],
        responses: {
          "200": { description: "Dashboard verileri", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardResponse" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  SEARCH
    // ─────────────────────────────────────────────

    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Global arama",
        description: "İşlemler, hesaplar, kategoriler ve kullanıcılar (admin) arasında arama yapar.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 }, description: "Arama sorgusu (en az 2 karakter)" },
        ],
        responses: {
          "200": { description: "Arama sonuçları", content: { "application/json": { schema: { $ref: "#/components/schemas/SearchResponse" } } } },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  NOTIFICATIONS
    // ─────────────────────────────────────────────

    "/api/notifications/email": {
      get: {
        tags: ["Notifications"],
        summary: "E-posta bildirim ayarları",
        description: "Kullanıcının e-posta bildirim ayarlarını getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Bildirim ayarları", content: { "application/json": { schema: { $ref: "#/components/schemas/EmailNotificationSettings" } } } },
          "401": { description: "Oturum açmanız gerekiyor" },
        },
      },
      put: {
        tags: ["Notifications"],
        summary: "E-posta bildirim ayarlarını güncelle",
        description: "Kullanıcının e-posta bildirim ayarlarını günceller.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateEmailNotificationInput" } } },
        },
        responses: {
          "200": { description: "Ayarlar güncellendi" },
          "400": { description: "Geçersiz e-posta", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Oturum açmanız gerekiyor" },
        },
      },
    },

    "/api/notifications/test": {
      post: {
        tags: ["Notifications"],
        summary: "Test bildirimi gönder",
        description: "Test amaçlı e-posta bildirimi gönderir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Test bildirimi gönderildi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/notifications/push/register": {
      post: {
        tags: ["Notifications"],
        summary: "Push bildirim kaydı",
        description: "Tarayıcı push bildirim aboneliğini kaydeder.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Abonelik kaydedildi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/notifications/push/settings": {
      get: {
        tags: ["Notifications"],
        summary: "Push bildirim ayarları",
        description: "Kullanıcının push bildirim ayarlarını getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Push bildirim ayarları" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
      put: {
        tags: ["Notifications"],
        summary: "Push bildirim ayarlarını güncelle",
        description: "Kullanıcının push bildirim ayarlarını günceller.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Ayarlar güncellendi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    "/api/notifications/push/send": {
      post: {
        tags: ["Notifications"],
        summary: "Push bildirim gönder",
        description: "Kullanıcıya push bildirim gönderir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Bildirim gönderildi" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  REPORTS
    // ─────────────────────────────────────────────

    "/api/reports/transactions": {
      get: {
        tags: ["Reports"],
        summary: "İşlem raporu",
        description: "İşlem raporu oluşturur. (Detaylı raporlama)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Rapor verileri" },
          "401": { description: "Yetkilendirme gerekli" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  ADMIN ENDPOINTS
    // ─────────────────────────────────────────────

    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Admin istatistikleri",
        description: "Admin paneli için genel istatistikleri getirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Admin istatistikleri", content: { "application/json": { schema: { $ref: "#/components/schemas/AdminStatsResponse" } } } },
          "403": { description: "Yetkisiz erişim (admin gerekli)" },
        },
      },
    },

    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Kullanıcıları listele (admin)",
        description: "Tüm kullanıcıları listeler. Admin yetkisi gerektirir.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "role", in: "query", schema: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "suspended"] } },
        ],
        responses: {
          "200": { description: "Kullanıcı listesi (sayfalı)" },
          "403": { description: "Yetkisiz erişim" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Kullanıcı güncelle (admin)",
        description: "Kullanıcının rolünü veya aktiflik durumunu günceller.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateUserInput" } } },
        },
        responses: {
          "200": { description: "Kullanıcı güncellendi" },
          "400": { description: "Geçersiz giriş", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Yetkisiz erişim" },
        },
      },
    },

    "/api/admin/transactions": {
      get: {
        tags: ["Admin"],
        summary: "Tüm işlemler (admin)",
        description: "Sistemdeki tüm işlemleri listeler. Admin yetkisi gerektirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Tüm işlemler" },
          "403": { description: "Yetkisiz erişim" },
        },
      },
    },

    "/api/admin/audit-logs": {
      get: {
        tags: ["Admin"],
        summary: "Denetim günlükleri (admin)",
        description: "Sistem denetim günlüklerini getirir. Admin yetkisi gerektirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Denetim günlükleri" },
          "403": { description: "Yetkisiz erişim" },
        },
      },
    },

    "/api/admin/email-logs": {
      get: {
        tags: ["Admin"],
        summary: "E-posta günlükleri (admin)",
        description: "Gönderilen e-postaların günlüklerini getirir. Admin yetkisi gerektirir.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "E-posta günlükleri" },
          "403": { description: "Yetkisiz erişim" },
        },
      },
    },

    // ─────────────────────────────────────────────
    //  CRON
    // ─────────────────────────────────────────────

    "/api/cron/daily": {
      get: {
        tags: ["Cron"],
        summary: "Günlük cron işi",
        description: "Günlük otomatik görevleri çalıştırır (tekrarlanan işlemler, bildirimler).",
        responses: {
          "200": { description: "Cron işi tamamlandı" },
        },
      },
    },

    "/api/cron/monthly-report": {
      get: {
        tags: ["Cron"],
        summary: "Aylık rapor cron işi",
        description: "Aylık raporları oluşturur ve e-posta ile gönderir.",
        responses: {
          "200": { description: "Aylık rapor cron işi tamamlandı" },
        },
      },
    },
  },
} as const;

export default spec;
