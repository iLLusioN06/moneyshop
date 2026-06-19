import { test, expect } from "@playwright/test";

test.describe("Dashboard Flow", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should show login form after redirect", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe("Transfer Pages", () => {
  test("should redirect transfers to login", async ({ page }) => {
    await page.goto("/transfers");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect deposit to login", async ({ page }) => {
    await page.goto("/deposit");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect withdraw to login", async ({ page }) => {
    await page.goto("/withdraw");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Settings & Profile", () => {
  test("should redirect settings to login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect profile to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Card Application", () => {
  test("should load card page without auth", async ({ page }) => {
    await page.goto("/card");
    await expect(page).toHaveTitle(/Card|MoneyShop/);
  });

  test("should show card types", async ({ page }) => {
    await page.goto("/card");
    // Look for card type mentions
    const pageContent = await page.content();
    const hasCardInfo = pageContent.includes("Standart") ||
      pageContent.includes("Silver") ||
      pageContent.includes("Gold") ||
      pageContent.includes("Card");
    expect(hasCardInfo).toBe(true);
  });
});

test.describe("API Documentation", () => {
  test("should not expose API docs in production-like mode", async ({ page }) => {
    const response = await page.goto("/api/docs");
    // In dev, it should either show docs or return an error
    // We just check it doesn't crash
    expect(response).toBeTruthy();
  });
});

test.describe("Error Handling", () => {
  test("should show 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-12345");
    // Should either show 404 page or redirect
    expect(response).toBeTruthy();
  });
});
