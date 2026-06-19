// =============================================
// MoneyShop - Constants Tests
// =============================================

import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  ROUTES,
  API_ROUTES,
  ACCOUNT_TYPES,
  CURRENCIES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  BUDGET_PERIODS,
  DEFAULT_CATEGORIES,
  PAGINATION,
  THEME,
} from "../constants";

describe("Constants", () => {
  describe("App Info", () => {
    it("has app name", () => {
      expect(APP_NAME).toBe("MoneyShop");
    });

    it("has app description", () => {
      expect(APP_DESCRIPTION).toBeDefined();
      expect(typeof APP_DESCRIPTION).toBe("string");
    });

    it("has app version", () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("ROUTES", () => {
    it("has all required routes", () => {
      expect(ROUTES.HOME).toBe("/");
      expect(ROUTES.LOGIN).toBe("/login");
      expect(ROUTES.REGISTER).toBe("/register");
      expect(ROUTES.DASHBOARD).toBe("/dashboard");
      expect(ROUTES.ACCOUNTS).toBe("/accounts");
      expect(ROUTES.TRANSACTIONS).toBe("/transactions");
    });

    it("all routes start with /", () => {
      Object.values(ROUTES).forEach((route) => {
        expect(route).toMatch(/^\//);
      });
    });
  });

  describe("API_ROUTES", () => {
    it("has auth routes", () => {
      expect(API_ROUTES.AUTH.LOGIN).toBe("/api/auth/login");
      expect(API_ROUTES.AUTH.REGISTER).toBe("/api/auth/register");
    });

    it("has financial routes", () => {
      expect(API_ROUTES.ACCOUNTS).toBe("/api/accounts");
      expect(API_ROUTES.TRANSACTIONS).toBe("/api/transactions");
      expect(API_ROUTES.BUDGETS).toBe("/api/budgets");
    });
  });

  describe("ACCOUNT_TYPES", () => {
    it("has all account types", () => {
      const types = ACCOUNT_TYPES.map((t) => t.value);
      expect(types).toContain("CHECKING");
      expect(types).toContain("SAVINGS");
      expect(types).toContain("CREDIT_CARD");
      expect(types).toContain("INVESTMENT");
      expect(types).toContain("CASH");
      expect(types).toContain("LOAN");
    });

    it("each type has label and icon", () => {
      ACCOUNT_TYPES.forEach((type) => {
        expect(type.label).toBeDefined();
        expect(type.icon).toBeDefined();
      });
    });
  });

  describe("CURRENCIES", () => {
    it("has major currencies", () => {
      const codes = CURRENCIES.map((c) => c.value);
      expect(codes).toContain("TRY");
      expect(codes).toContain("USD");
      expect(codes).toContain("EUR");
      expect(codes).toContain("GBP");
      expect(codes).toContain("IQD");
    });

    it("each currency has symbol", () => {
      CURRENCIES.forEach((currency) => {
        expect(currency.symbol).toBeDefined();
        expect(currency.label).toBeDefined();
      });
    });
  });

  describe("TRANSACTION_TYPES", () => {
    it("has all transaction types", () => {
      const types = TRANSACTION_TYPES.map((t) => t.value);
      expect(types).toContain("INCOME");
      expect(types).toContain("EXPENSE");
      expect(types).toContain("TRANSFER");
    });

    it("each type has color", () => {
      TRANSACTION_TYPES.forEach((type) => {
        expect(type.color).toMatch(/^#[0-9a-f]{6}$/);
      });
    });
  });

  describe("TRANSACTION_STATUS", () => {
    it("has all statuses", () => {
      const statuses = TRANSACTION_STATUS.map((s) => s.value);
      expect(statuses).toContain("COMPLETED");
      expect(statuses).toContain("PENDING");
      expect(statuses).toContain("FAILED");
      expect(statuses).toContain("CANCELLED");
    });
  });

  describe("BUDGET_PERIODS", () => {
    it("has all periods", () => {
      const periods = BUDGET_PERIODS.map((p) => p.value);
      expect(periods).toContain("WEEKLY");
      expect(periods).toContain("MONTHLY");
      expect(periods).toContain("YEARLY");
    });
  });

  describe("DEFAULT_CATEGORIES", () => {
    it("has income and expense categories", () => {
      const income = DEFAULT_CATEGORIES.filter((c) => c.type === "INCOME");
      const expense = DEFAULT_CATEGORIES.filter((c) => c.type === "EXPENSE");
      expect(income.length).toBeGreaterThan(0);
      expect(expense.length).toBeGreaterThan(0);
    });

    it("each category has required fields", () => {
      DEFAULT_CATEGORIES.forEach((cat) => {
        expect(cat.name).toBeDefined();
        expect(cat.icon).toBeDefined();
        expect(cat.color).toMatch(/^#[0-9a-f]{6}$/);
        expect(["INCOME", "EXPENSE"]).toContain(cat.type);
      });
    });
  });

  describe("PAGINATION", () => {
    it("has valid defaults", () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION.DEFAULT_LIMIT).toBeGreaterThan(0);
      expect(PAGINATION.MAX_LIMIT).toBeGreaterThanOrEqual(PAGINATION.DEFAULT_LIMIT);
    });
  });

  describe("THEME", () => {
    it("has storage key", () => {
      expect(THEME.STORAGE_KEY).toBeDefined();
      expect(typeof THEME.STORAGE_KEY).toBe("string");
    });

    it("has default theme", () => {
      expect(THEME.DEFAULT).toBe("light");
    });
  });
});
