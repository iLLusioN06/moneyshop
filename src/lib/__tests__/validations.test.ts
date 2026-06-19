// =============================================
// MoneyShop - Validations Tests
// =============================================

import {
  validateRequest,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createTransactionSchema,
  listTransactionsSchema,
} from "../validations";

describe("validateRequest", () => {
  it("returns success with valid data", () => {
    const result = validateRequest(
      registerSchema,
      {
        name: "Test User",
        email: "test@example.com",
        phone: "+905551234567",
        password: "Password123",
      }
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test User");
    }
  });

  it("returns error response with invalid data", () => {
    const result = validateRequest(registerSchema, {
      name: "",
      email: "invalid-email",
      phone: "123",
      password: "weak",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
    }
  });

  it("trims whitespace from name", () => {
    const result = validateRequest(
      registerSchema,
      {
        name: "  Test User  ",
        email: "test@example.com",
        phone: "+905551234567",
        password: "Password123",
      }
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test User");
    }
  });
});

describe("registerSchema", () => {
  const validData = {
    name: "Test User",
    email: "test@example.com",
    phone: "+905551234567",
    password: "Password123",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short phone", () => {
    const result = registerSchema.safeParse({ ...validData, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...validData, password: "lowercase123" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({ ...validData, password: "NoNumberHere" });
    expect(result.success).toBe(false);
  });

  it("rejects extra fields", () => {
    const result = registerSchema.safeParse({ ...validData, extra: "field" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid password change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass123",
      newPassword: "NewPass456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects same password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "SamePass123",
      newPassword: "SamePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass123",
      newPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid reset data", () => {
    const result = resetPasswordSchema.safeParse({
      token: "valid-token",
      password: "NewPass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "NewPass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTransactionSchema", () => {
  const validTransaction = {
    accountId: "acc-123",
    type: "EXPENSE",
    amount: 100.50,
  };

  it("accepts valid transaction", () => {
    const result = createTransactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it("accepts all transaction types", () => {
    for (const type of ["INCOME", "EXPENSE", "TRANSFER"]) {
      const result = createTransactionSchema.safeParse({ ...validTransaction, type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing accountId", () => {
    const result = createTransactionSchema.safeParse({
      type: "EXPENSE",
      amount: 100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      categoryId: "cat-123",
      description: "Test transaction",
      currency: "TRY",
      date: "2026-06-15",
    });
    expect(result.success).toBe(true);
  });
});

describe("listTransactionsSchema", () => {
  it("applies defaults", () => {
    const result = listTransactionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("coerces query params", () => {
    const result = listTransactionsSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit > 100", () => {
    const result = listTransactionsSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("accepts valid filters", () => {
    const result = listTransactionsSchema.safeParse({
      page: "1",
      limit: "20",
      type: "INCOME",
      accountId: "acc-123",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      search: "test",
    });
    expect(result.success).toBe(true);
  });
});
