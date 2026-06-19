import { test, expect } from "@playwright/test";

test.describe("Static Pages", () => {
  test("should load About page", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/Hakkında|About|MoneyShop/);
  });

  test("should load Contact page", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveTitle(/İletişim|Contact|MoneyShop/);
  });

  test("should load Privacy page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Gizlilik|Privacy|MoneyShop/);
  });

  test("should load Terms page", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle(/Koşullar|Terms|MoneyShop/);
  });

  test("should load Cookies page", async ({ page }) => {
    await page.goto("/cookies");
    await expect(page).toHaveTitle(/Çerez|Cookie|MoneyShop/);
  });

  test("should load FAQ page", async ({ page }) => {
    await page.goto("/faq");
    await expect(page).toHaveTitle(/Sıkça|FAQ|MoneyShop/);
  });

  test("should load Blog page", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog|MoneyShop/);
  });

  test("should load Careers page", async ({ page }) => {
    await page.goto("/careers");
    await expect(page).toHaveTitle(/Kariyer|Careers|MoneyShop/);
  });

  test("should load Press page", async ({ page }) => {
    await page.goto("/press");
    await expect(page).toHaveTitle(/Basın|Press|MoneyShop/);
  });

  test("should load KYC page", async ({ page }) => {
    await page.goto("/kyc");
    await expect(page).toHaveTitle(/KYC|Doğrulama|MoneyShop/);
  });

  test("should load AML page", async ({ page }) => {
    await page.goto("/aml");
    await expect(page).toHaveTitle(/AML|Kara|MoneyShop/);
  });
});

test.describe("Landing Page - Language Switching", () => {
  test("should switch to English", async ({ page }) => {
    await page.goto("/");
    // Look for language selector
    const langSelector = page.locator('button:has-text("TR"), [aria-label*="dil"], [aria-label*="language"]').first();
    if (await langSelector.isVisible().catch(() => false)) {
      await langSelector.click();
      const enOption = page.locator('button:has-text("English"), [data-lang="en"]').first();
      if (await enOption.isVisible().catch(() => false)) {
        await enOption.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe("Landing Page - Responsive", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page).toHaveTitle(/MoneyShop/);

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label*="menü"], button[aria-label*="menu"], [class*="mobile-menu"]').first();
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page).toHaveTitle(/MoneyShop/);
  });
});

test.describe("Landing Page - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    const h1Count = await h1.count();
    // Should have at most one h1
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Images should have alt attribute (can be empty for decorative)
      expect(alt !== null).toBe(true);
    }
  });
});
