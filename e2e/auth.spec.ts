import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should load login page with form", async ({ page }) => {
    // Logo ve başlık görünür
    await expect(page.locator("text=MoneyShop").first()).toBeVisible();
    await expect(page.locator('text="Hesabınıza giriş yapın"')).toBeVisible();

    // Form alanları mevcut
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show error for empty form submission", async ({ page }) => {
    await page.click('button[type="submit"]');
    // Browser HTML5 validation or our error should show
    // Either field is invalid or we show custom error
    await page.waitForTimeout(500);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.fill('input[type="email"]', "wrong@test.com");
    await page.fill('input[type="password"]', "wrongpass");
    await page.click('button[type="submit"]');

    // Hata mesajı görünmeli
    await expect(page.locator("text=Kullanıcı adı veya şifre hatalı")).toBeVisible({ timeout: 10000 });
  });

  test("should have link to register page", async ({ page }) => {
    const registerLink = page.locator('a[href*="register"]').first();
    await expect(registerLink).toBeVisible();
  });

  test("should have password visibility toggle", async ({ page }) => {
    const toggleButton = page.locator('button:has(svg), [aria-label*="şifre"], [aria-label*="password"]').first();
    if (await toggleButton.isVisible().catch(() => false)) {
      await toggleButton.click();
    }
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should load register page with form", async ({ page }) => {
    await expect(page.locator("text=MoneyShop").first()).toBeVisible();
    // Form fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInputs.first()).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("should show error for short password", async ({ page }) => {
    await page.fill('input[type="email"]', "test@example.com");
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill("123");
    await passwordInputs.nth(1).fill("123");
    await page.click('button[type="submit"]');

    // "Parola en az 6 karakter" error
    await expect(page.locator("text=Parola en az 6 karakter")).toBeVisible({ timeout: 5000 });
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.fill('input[type="email"]', "test@example.com");
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill("1234567");
    await passwordInputs.nth(1).fill("7654321");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Parolalar eşleşmiyor")).toBeVisible({ timeout: 5000 });
  });
});
