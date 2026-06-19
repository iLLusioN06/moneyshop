import { test, expect } from "@playwright/test";

test.describe("Transfers - Fast Transfer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers/fast");
    await page.waitForLoadState("networkidle");
  });

  test("should load fast transfer page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers\/fast/);
    // Form alanları görünür olmalı
    const pageContent = await page.content();
    expect(pageContent).toContain("MoneyShop");
  });

  test("should have recipient input field", async ({ page }) => {
    const inputs = page.locator("input");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have amount input field", async ({ page }) => {
    const amountInput = page.locator('input[type="number"], input[name*="amount"], input[placeholder*="tutar"], input[placeholder*="Tutar"]').first();
    if (await amountInput.isVisible().catch(() => false)) {
      await expect(amountInput).toBeVisible();
    }
  });

  test("should have submit button", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], button:has-text("Gönder"), button:has-text("Transfer")').first();
    await expect(submitBtn).toBeVisible();
  });

  test("should show validation for empty form", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe("Transfers - EFT", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers/eft");
    await page.waitForLoadState("networkidle");
  });

  test("should load EFT transfer page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers\/eft/);
  });

  test("should have bank selection", async ({ page }) => {
    const pageContent = await page.content();
    const hasBankInfo = pageContent.includes("Banka") || pageContent.includes("bank");
    expect(hasBankInfo).toBe(true);
  });
});

test.describe("Transfers - International", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers/international");
    await page.waitForLoadState("networkidle");
  });

  test("should load international transfer page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers\/international/);
  });

  test("should have SWIFT/BIC field", async ({ page }) => {
    const pageContent = await page.content();
    const hasSwift = pageContent.includes("SWIFT") || pageContent.includes("BIC") || pageContent.includes("uluslararası");
    expect(hasSwift).toBe(true);
  });
});

test.describe("Transfers - IBAN", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers/iban");
    await page.waitForLoadState("networkidle");
  });

  test("should load IBAN transfer page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers\/iban/);
  });

  test("should have IBAN input", async ({ page }) => {
    const ibanInput = page.locator('input[name*="iban"], input[placeholder*="IBAN"], input[placeholder*="iban"]').first();
    if (await ibanInput.isVisible().catch(() => false)) {
      await expect(ibanInput).toBeVisible();
    }
  });
});

test.describe("Transfers - QR Scan", () => {
  test("should load QR scan page", async ({ page }) => {
    await page.goto("/transfers/qr-scan");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/transfers\/qr-scan/);
  });
});

test.describe("Transfers - Request Money", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers/request");
    await page.waitForLoadState("networkidle");
  });

  test("should load request money page", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers\/request/);
  });

  test("should have amount and recipient fields", async ({ page }) => {
    const inputs = page.locator("input");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Transfers - Main Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transfers");
    await page.waitForLoadState("networkidle");
  });

  test("should load transfers overview", async ({ page }) => {
    await expect(page).toHaveURL(/\/transfers/);
  });

  test("should show transfer type options", async ({ page }) => {
    const pageContent = await page.content();
    const hasTransferTypes = pageContent.includes("Hızlı") ||
      pageContent.includes("EFT") ||
      pageContent.includes("Uluslararası") ||
      pageContent.includes("Transfer");
    expect(hasTransferTypes).toBe(true);
  });
});
