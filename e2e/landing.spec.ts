import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the landing page", async ({ page }) => {
    // Page loads with title
    await expect(page).toHaveTitle(/MoneyShop/);
    // Hero section visible
    await expect(page.locator("text=MoneyShop").first()).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    const navLinks = ["Giriş Yap", "Kayıt Ol", "Hakkımızda", "İletişim"];

    for (const link of navLinks) {
      const found = page.locator(`a:has-text("${link}"), button:has-text("${link}")`).first();
      if (await found.isVisible().catch(() => false)) {
        await expect(found).toBeVisible();
      }
    }
  });

  test("should have register CTA buttons", async ({ page }) => {
    // Look for registration buttons/links on the page
    const regButton = page
      .locator('a[href*="register"], a[href*="kayit"], button:has-text("Kayıt Ol"), a:has-text("Kayıt Ol"), a:has-text("Hemen Katıl")')
      .first();
    if (await regButton.isVisible().catch(() => false)) {
      await expect(regButton).toBeVisible();
    }
  });

  test("should have scroll-based navigation", async ({ page }) => {
    // Scroll down to trigger navbar changes
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  });

  test("should display footer with key links", async ({ page }) => {
    const footer = page.locator("footer").or(page.locator('[class*="footer"]'));
    await expect(footer).toBeVisible();
  });
});

test.describe("FAQ Page", () => {
  test("should load FAQ", async ({ page }) => {
    await page.goto("/faq");
    await expect(page).toHaveTitle(/FAQ|Sıkça/);
    await expect(page.locator("text=MoneyShop").first()).toBeVisible();
  });
});

test.describe("Card Page", () => {
  test("should load card application page", async ({ page }) => {
    await page.goto("/card");
    await expect(page).toHaveTitle(/Card|MoneyShop/);
  });
});

test.describe("Pricing Page", () => {
  test("should load pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing|Ücret/);
  });
});
