// =============================================
// MoneyShop - Utils Tests
// =============================================

import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  getAccountTypeColor,
  getTransactionTypeColor,
  generateColor,
  checkPasswordStrength,
  truncate,
  generateId,
  getCacheHeaders,
} from "../utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", true && "active", false && "hidden");
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("hidden");
  });

  it("handles undefined and null", () => {
    const result = cn("base", undefined, null);
    expect(result).toBe("base");
  });
});

describe("formatCurrency", () => {
  it("formats TRY correctly", () => {
    const result = formatCurrency(1500.5, "TRY");
    expect(result).toContain("1.500");
    expect(result).toContain("50");
  });

  it("formats USD correctly", () => {
    const result = formatCurrency(1500.5, "USD");
    expect(result).toContain("1,500");
    expect(result).toContain("50");
  });

  it("defaults to TRY", () => {
    const result = formatCurrency(100);
    expect(result).toBeDefined();
  });

  it("handles zero", () => {
    const result = formatCurrency(0, "TRY");
    expect(result).toContain("0");
  });

  it("handles negative amounts", () => {
    const result = formatCurrency(-500, "TRY");
    expect(result).toBeDefined();
  });
});

describe("formatNumber", () => {
  it("formats large numbers", () => {
    const result = formatNumber(1500000);
    expect(result).toBe("1.500.000");
  });

  it("formats small numbers", () => {
    const result = formatNumber(42);
    expect(result).toBe("42");
  });

  it("handles zero", () => {
    const result = formatNumber(0);
    expect(result).toBe("0");
  });
});

describe("formatPercentage", () => {
  it("formats percentage", () => {
    const result = formatPercentage(25.5);
    expect(result).toBe("%25,5");
  });

  it("formats zero", () => {
    const result = formatPercentage(0);
    expect(result).toBe("%0,0");
  });

  it("formats whole numbers", () => {
    const result = formatPercentage(100);
    expect(result).toBe("%100,0");
  });
});

describe("formatDate", () => {
  const testDate = new Date("2026-06-15T12:00:00Z");

  it("formats short date", () => {
    const result = formatDate(testDate, "short");
    expect(result).toContain("2026");
  });

  it("formats long date", () => {
    const result = formatDate(testDate, "long");
    expect(result).toContain("2026");
  });

  it("formats relative date - today", () => {
    const result = formatDate(new Date(), "relative");
    expect(result).toBe("Bugün");
  });

  it("formats relative date - yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatDate(yesterday, "relative");
    expect(result).toBe("Dün");
  });

  it("handles string input", () => {
    const result = formatDate("2026-06-15", "short");
    expect(result).toContain("2026");
  });
});

describe("getAccountTypeColor", () => {
  it("returns correct color for CHECKING", () => {
    expect(getAccountTypeColor("CHECKING")).toBe("#3b82f6");
  });

  it("returns correct color for SAVINGS", () => {
    expect(getAccountTypeColor("SAVINGS")).toBe("#10b981");
  });

  it("returns correct color for CREDIT_CARD", () => {
    expect(getAccountTypeColor("CREDIT_CARD")).toBe("#ef4444");
  });

  it("returns default color for unknown type", () => {
    expect(getAccountTypeColor("UNKNOWN")).toBe("#94a3b8");
  });
});

describe("getTransactionTypeColor", () => {
  it("returns correct color for INCOME", () => {
    expect(getTransactionTypeColor("INCOME")).toBe("#10b981");
  });

  it("returns correct color for EXPENSE", () => {
    expect(getTransactionTypeColor("EXPENSE")).toBe("#ef4444");
  });

  it("returns correct color for TRANSFER", () => {
    expect(getTransactionTypeColor("TRANSFER")).toBe("#3b82f6");
  });

  it("returns default color for unknown type", () => {
    expect(getTransactionTypeColor("UNKNOWN")).toBe("#94a3b8");
  });
});

describe("generateColor", () => {
  it("returns a color", () => {
    const color = generateColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns consistent color for same seed", () => {
    const color1 = generateColor("test-seed");
    const color2 = generateColor("test-seed");
    expect(color1).toBe(color2);
  });

  it("returns different colors for different seeds", () => {
    const colors = new Set(
      Array.from({ length: 10 }, (_, i) => generateColor(`seed-${i}`))
    );
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe("checkPasswordStrength", () => {
  it("returns 0 for empty password", () => {
    expect(checkPasswordStrength("")).toBe(0);
  });

  it("returns low score for weak password", () => {
    const score = checkPasswordStrength("abc");
    expect(score).toBeLessThan(50);
  });

  it("returns high score for strong password", () => {
    const score = checkPasswordStrength("MyStr0ng!Pass");
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("gives bonus for length >= 12", () => {
    const short = checkPasswordStrength("Ab1!");
    const long = checkPasswordStrength("Ab1!Ab1!Ab1!Ab");
    expect(long).toBeGreaterThan(short);
  });

  it("gives bonus for special characters", () => {
    const without = checkPasswordStrength("Abcdef12");
    const withSpecial = checkPasswordStrength("Abcdef1!");
    expect(withSpecial).toBeGreaterThan(without);
  });
});

describe("truncate", () => {
  it("returns original string if shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("adds prefix", () => {
    const id = generateId("tx_");
    expect(id).toMatch(/^tx_/);
  });

  it("generates IDs without prefix", () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe("getCacheHeaders", () => {
  it("returns cache control headers", () => {
    const headers = getCacheHeaders();
    expect(headers["Cache-Control"]).toBeDefined();
    expect(headers["Cache-Control"]).toContain("private");
  });

  it("uses custom seconds", () => {
    const headers = getCacheHeaders(60);
    expect(headers["Cache-Control"]).toContain("60");
  });
});
