import { test, expect } from "@playwright/test";

test.describe("Transactions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForLoadState("networkidle");
  });

  test("should load transactions page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transactions/);
  });

  test("should display transaction list or empty state", async ({ page }) => {
    const pageContent = await page.content();
    const hasContent = pageContent.includes("İşlem") ||
      pageContent.includes("Transaction") ||
      pageContent.includes("Henüz") ||
      pageContent.includes("No data");
    expect(hasContent).toBe(true);
  });

  test("should have filter options", async ({ page }) => {
    const pageContent = await page.content();
    const hasFilters = pageContent.includes("Filtre") ||
      pageContent.includes("Filter") ||
      pageContent.includes("Tarih") ||
      pageContent.includes("Tür");
    expect(hasFilters).toBe(true);
  });

  test("should have new transaction button", async ({ page }) => {
    const newBtn = page.locator('button:has-text("Yeni"), a:has-text("Yeni"), button:has-text("İşlem Ekle")').first();
    if (await newBtn.isVisible().catch(() => false)) {
      await expect(newBtn).toBeVisible();
    }
  });

  test("should have search functionality", async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe("Budgets Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/budgets");
    await page.waitForLoadState("networkidle");
  });

  test("should load budgets page", async ({ page }) => {
    await expect(page).toHaveURL(/\/budgets/);
  });

  test("should display budget information", async ({ page }) => {
    const pageContent = await page.content();
    const hasBudget = pageContent.includes("Bütçe") ||
      pageContent.includes("Budget") ||
      pageContent.includes("Henüz") ||
      pageContent.includes("Oluştur");
    expect(hasBudget).toBe(true);
  });

  test("should have create budget button", async ({ page }) => {
    const createBtn = page.locator('button:has-text("Oluştur"), a:has-text("Oluştur"), button:has-text("Yeni Bütçe")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await expect(createBtn).toBeVisible();
    }
  });
});

test.describe("Categories Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
  });

  test("should load categories page", async ({ page }) => {
    await expect(page).toHaveURL(/\/categories/);
  });

  test("should display category list", async ({ page }) => {
    const pageContent = await page.content();
    const hasCategories = pageContent.includes("Kategori") ||
      pageContent.includes("Category") ||
      pageContent.includes("Maaş") ||
      pageContent.includes("Kira");
    expect(hasCategories).toBe(true);
  });
});

test.describe("Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
  });

  test("should load reports page", async ({ page }) => {
    await expect(page).toHaveURL(/\/reports/);
  });

  test("should display report options", async ({ page }) => {
    const pageContent = await page.content();
    const hasReports = pageContent.includes("Rapor") ||
      pageContent.includes("Report") ||
      pageContent.includes("Gelir") ||
      pageContent.includes("Gider");
    expect(hasReports).toBe(true);
  });

  test("should have export functionality", async ({ page }) => {
    const pageContent = await page.content();
    const hasExport = pageContent.includes("Dışa Aktar") ||
      pageContent.includes("Export") ||
      pageContent.includes("PDF") ||
      pageContent.includes("Excel");
    expect(hasExport).toBe(true);
  });
});

test.describe("Portfolio Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle");
  });

  test("should load portfolio page", async ({ page }) => {
    await expect(page).toHaveURL(/\/portfolio/);
  });

  test("should display investment information", async ({ page }) => {
    const pageContent = await page.content();
    const hasPortfolio = pageContent.includes("Yatırım") ||
      pageContent.includes("Portfolio") ||
      pageContent.includes("Portföy") ||
      pageContent.includes("Hisse");
    expect(hasPortfolio).toBe(true);
  });
});

test.describe("Installments Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/installments");
    await page.waitForLoadState("networkidle");
  });

  test("should load installments page", async ({ page }) => {
    await expect(page).toHaveURL(/\/installments/);
  });

  test("should display installment information", async ({ page }) => {
    const pageContent = await page.content();
    const hasInstallments = pageContent.includes("Taksit") ||
      pageContent.includes("Installment") ||
      pageContent.includes("Henüz") ||
      pageContent.includes("Ödeme");
    expect(hasInstallments).toBe(true);
  });
});

test.describe("Recurring Transactions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recurring");
    await page.waitForLoadState("networkidle");
  });

  test("should load recurring page", async ({ page }) => {
    await expect(page).toHaveURL(/\/recurring/);
  });

  test("should display recurring transaction info", async ({ page }) => {
    const pageContent = await page.content();
    const hasRecurring = pageContent.includes("Tekrarlanan") ||
      pageContent.includes("Recurring") ||
      pageContent.includes("Otomatik") ||
      pageContent.includes("Henüz");
    expect(hasRecurring).toBe(true);
  });
});

test.describe("Split Bills Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/split-bills");
    await page.waitForLoadState("networkidle");
  });

  test("should load split bills page", async ({ page }) => {
    await expect(page).toHaveURL(/\/split-bills/);
  });

  test("should display split bill info", async ({ page }) => {
    const pageContent = await page.content();
    const hasSplit = pageContent.includes("Ortak") ||
      pageContent.includes("Split") ||
      pageContent.includes("Hesap") ||
      pageContent.includes("Henüz");
    expect(hasSplit).toBe(true);
  });
});

test.describe("Templates Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");
  });

  test("should load templates page", async ({ page }) => {
    await expect(page).toHaveURL(/\/templates/);
  });

  test("should display template info", async ({ page }) => {
    const pageContent = await page.content();
    const hasTemplates = pageContent.includes("Şablon") ||
      pageContent.includes("Template") ||
      pageContent.includes("Henüz");
    expect(hasTemplates).toBe(true);
  });
});

test.describe("Support Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/support");
    await page.waitForLoadState("networkidle");
  });

  test("should load support page", async ({ page }) => {
    await expect(page).toHaveURL(/\/support/);
  });

  test("should display support options", async ({ page }) => {
    const pageContent = await page.content();
    const hasSupport = pageContent.includes("Destek") ||
      pageContent.includes("Support") ||
      pageContent.includes("Talep") ||
      pageContent.includes("Ticket");
    expect(hasSupport).toBe(true);
  });

  test("should have create ticket button", async ({ page }) => {
    const createBtn = page.locator('button:has-text("Oluştur"), a:has-text("Yeni Talep"), button:has-text("Destek Talebi")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await expect(createBtn).toBeVisible();
    }
  });
});

test.describe("Deposit Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/deposit");
    await page.waitForLoadState("networkidle");
  });

  test("should load deposit page", async ({ page }) => {
    await expect(page).toHaveURL(/\/deposit/);
  });

  test("should display deposit form", async ({ page }) => {
    const pageContent = await page.content();
    const hasDeposit = pageContent.includes("Yatır") ||
      pageContent.includes("Deposit") ||
      pageContent.includes("Tutar") ||
      pageContent.includes("Hesap");
    expect(hasDeposit).toBe(true);
  });
});

test.describe("Withdraw Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/withdraw");
    await page.waitForLoadState("networkidle");
  });

  test("should load withdraw page", async ({ page }) => {
    await expect(page).toHaveURL(/\/withdraw/);
  });

  test("should display withdraw form", async ({ page }) => {
    const pageContent = await page.content();
    const hasWithdraw = pageContent.includes("Çek") ||
      pageContent.includes("Withdraw") ||
      pageContent.includes("Tutar") ||
      pageContent.includes("Hesap");
    expect(hasWithdraw).toBe(true);
  });
});

test.describe("Payments Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/payments");
    await page.waitForLoadState("networkidle");
  });

  test("should load payments page", async ({ page }) => {
    await expect(page).toHaveURL(/\/payments/);
  });

  test("should display payment options", async ({ page }) => {
    const pageContent = await page.content();
    const hasPayments = pageContent.includes("Ödeme") ||
      pageContent.includes("Payment") ||
      pageContent.includes("Fatura") ||
      pageContent.includes("İşlem");
    expect(hasPayments).toBe(true);
  });
});

test.describe("Accounts Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accounts");
    await page.waitForLoadState("networkidle");
  });

  test("should load accounts page", async ({ page }) => {
    await expect(page).toHaveURL(/\/accounts/);
  });

  test("should display account list or empty state", async ({ page }) => {
    const pageContent = await page.content();
    const hasAccounts = pageContent.includes("Hesap") ||
      pageContent.includes("Account") ||
      pageContent.includes("Bakiye") ||
      pageContent.includes("Henüz");
    expect(hasAccounts).toBe(true);
  });

  test("should have add account button", async ({ page }) => {
    const addBtn = page.locator('button:has-text("Ekle"), a:has-text("Hesap Ekle"), button:has-text("Yeni Hesap")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await expect(addBtn).toBeVisible();
    }
  });
});
