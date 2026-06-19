// =============================================
// MoneyShop - Dashboard i18n Tests
// =============================================

import { t, tWithVars, getDashboardLang } from "../dashboard-i18n";

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

describe("getDashboardLang", () => {
  it("returns 'tr' by default", () => {
    expect(getDashboardLang()).toBe("tr");
  });

  it("returns saved language", () => {
    localStorage.setItem("moneyshop-lang", "en");
    expect(getDashboardLang()).toBe("en");
  });

  it("returns 'tr' for invalid language", () => {
    localStorage.setItem("moneyshop-lang", "invalid");
    expect(getDashboardLang()).toBe("tr");
  });
});

describe("t", () => {
  it("returns Turkish translation by default", () => {
    const result = t("dash.welcome");
    expect(result).toBe("Hoş Geldiniz");
  });

  it("returns key as fallback for unknown key", () => {
    const result = t("unknown.key");
    expect(result).toBe("unknown.key");
  });

  it("returns fallback for unknown key", () => {
    const result = t("unknown.key", "Fallback");
    expect(result).toBe("Fallback");
  });

  it("translates to English when set", () => {
    localStorage.setItem("moneyshop-lang", "en");
    const result = t("dash.welcome");
    expect(result).toBe("Welcome");
  });

  it("translates to Arabic when set", () => {
    localStorage.setItem("moneyshop-lang", "ar");
    const result = t("dash.welcome");
    expect(result).toBe("مرحباً");
  });

  it("translates to Kurdish when set", () => {
    localStorage.setItem("moneyshop-lang", "ku");
    const result = t("dash.welcome");
    expect(result).toBe("Bi xêr hatî");
  });

  it("translates to French when set", () => {
    localStorage.setItem("moneyshop-lang", "fr");
    const result = t("dash.welcome");
    expect(result).toBe("Bienvenue");
  });

  it("translates to Russian when set", () => {
    localStorage.setItem("moneyshop-lang", "ru");
    const result = t("dash.welcome");
    expect(result).toBe("Добро пожаловать");
  });

  it("handles nested keys", () => {
    const result = t("nav.dashboard");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});

describe("tWithVars", () => {
  it("replaces variables in translation", () => {
    const result = tWithVars("dash.incomeExpense", {
      income: "₺10,000",
      expense: "₺5,000",
    });
    expect(result).toContain("₺10,000");
    expect(result).toContain("₺5,000");
  });

  it("handles missing variables gracefully", () => {
    const result = tWithVars("dash.incomeExpense", {});
    expect(result).toContain("{{income}}");
    expect(result).toContain("{{expense}}");
  });
});
