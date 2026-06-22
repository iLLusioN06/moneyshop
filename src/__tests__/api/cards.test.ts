/**
 * API Route Test: /api/cards
 * GET - Kullanıcının kartını getir (yoksa otomatik oluştur)
 */

import { NextRequest } from "next/server";

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockCardFindFirst = jest.fn();
const mockCardCreate = jest.fn();
const mockTransactionFindMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    card: {
      findFirst: (...args: unknown[]) => mockCardFindFirst(...args),
      create: (...args: unknown[]) => mockCardCreate(...args),
    },
    transaction: {
      findMany: (...args: unknown[]) => mockTransactionFindMany(...args),
    },
  },
}));

// Mock card-utils
jest.mock("@/lib/card-utils", () => ({
  generateCardNumber: jest.fn(() => "5200000000000000"),
  generateCvv: jest.fn(() => "123"),
  encryptCardNumber: jest.fn((num: string) => `enc_${num}`),
  decryptCardNumber: jest.fn((enc: string) => enc.replace("enc_", "")),
  encryptCvv: jest.fn((cvv: string) => `enc_${cvv}`),
  maskCardNumber: jest.fn((num: string) => `**** **** **** ${num.slice(-4)}`),
  tryDecryptCardNumber: jest.fn((enc: string) => enc.replace("enc_", "")),
  isEncrypted: jest.fn(() => true),
}));

import { GET } from "@/app/api/cards/route";

describe("GET /api/cards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("returns 200 with existing card data and masked number", async () => {
    const existingCard = {
      id: "card-1",
      userId: "user-1",
      cardType: "STANDARD",
      cardNumber: "enc_5200000000000000",
      cardHolderName: "Test User",
      expiryMonth: 6,
      expiryYear: 2031,
      cvv: "enc_123",
      status: "ACTIVE",
      dailyLimit: 5000,
      monthlyLimit: 50000,
      currency: "IQD",
    };
    const mockTransactions = [
      { id: "tx-1", amount: 250, description: "Market", date: new Date() },
    ];

    mockCardFindFirst.mockResolvedValueOnce(existingCard);
    mockTransactionFindMany.mockResolvedValueOnce(mockTransactions);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.cardNumber).toBe("**** **** **** 0000");
    expect(body.data.cvv).toBe("***");
    expect(body.data.transactions[0].id).toBe("tx-1");
    expect(body.data.transactions[0].amount).toBe(250);
    expect(body.data.transactions[0].description).toBe("Market");
    expect(mockCardFindFirst).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("auto-creates card when none exists and returns 200", async () => {
    mockCardFindFirst.mockResolvedValueOnce(null);

    const newCard = {
      id: "card-2",
      userId: "user-1",
      cardType: "STANDARD",
      cardNumber: "enc_5200000000000000",
      cardHolderName: "Test User",
      expiryMonth: 6,
      expiryYear: 2031,
      cvv: "enc_123",
      status: "ACTIVE",
      dailyLimit: 5000,
      monthlyLimit: 50000,
      currency: "IQD",
    };
    mockCardCreate.mockResolvedValueOnce(newCard);
    mockTransactionFindMany.mockResolvedValueOnce([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const { generateCardNumber, generateCvv } = require("@/lib/card-utils");
    expect(generateCardNumber).toHaveBeenCalled();
    expect(generateCvv).toHaveBeenCalled();

    expect(mockCardCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          cardType: "STANDARD",
          dailyLimit: 5000,
          monthlyLimit: 50000,
          currency: "IQD",
        }),
      })
    );
  });

  it("returns 400 when auto-create fails", async () => {
    mockCardFindFirst.mockResolvedValueOnce(null);
    mockCardCreate.mockRejectedValueOnce(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Kart oluşturulamadı. Lütfen çıkış yapıp tekrar giriş yapın.");
  });
});
