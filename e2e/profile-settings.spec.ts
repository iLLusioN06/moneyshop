import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("should load profile page", async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/);
  });

  test("should display user information", async ({ page }) => {
    const pageContent = await page.content();
    const hasUserInfo = pageContent.includes("Test Kullanıcı") ||
      pageContent.includes("test@test.com") ||
      pageContent.includes("Profil") ||
      pageContent.includes("Kişisel");
    expect(hasUserInfo).toBe(true);
  });

  test("should have profile form fields", async ({ page }) => {
    const inputs = page.locator("input");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have save button", async ({ page }) => {
    const saveBtn = page.locator('button:has-text("Kaydet"), button[type="submit"]').first();
    await expect(saveBtn).toBeVisible();
  });

  test("should show member since date", async ({ page }) => {
    const pageContent = await page.content();
    const hasDate = pageContent.includes("Kayıt") ||
      pageContent.includes("Üyelik") ||
      pageContent.includes("Tarih");
    expect(hasDate).toBe(true);
  });

  test("should have password change section", async ({ page }) => {
    const pageContent = await page.content();
    const hasPassword = pageContent.includes("Şifre") ||
      pageContent.includes("Password");
    expect(hasPassword).toBe(true);
  });
});

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
  });

  test("should load settings page", async ({ page }) => {
    await expect(page).toHaveURL(/\/settings/);
  });

  test("should display settings sections", async ({ page }) => {
    const pageContent = await page.content();
    const hasSettings = pageContent.includes("Ayarlar") ||
      pageContent.includes("Settings") ||
      pageContent.includes("Bildirim") ||
      pageContent.includes("Tema");
    expect(hasSettings).toBe(true);
  });

  test("should have notification settings", async ({ page }) => {
    const pageContent = await page.content();
    const hasNotifications = pageContent.includes("Bildirim") ||
      pageContent.includes("Notification") ||
      pageContent.includes("E-posta") ||
      pageContent.includes("SMS");
    expect(hasNotifications).toBe(true);
  });

  test("should have theme settings", async ({ page }) => {
    const pageContent = await page.content();
    const hasTheme = pageContent.includes("Tema") ||
      pageContent.includes("Theme") ||
      pageContent.includes("Görünüm") ||
      pageContent.includes("Dark") ||
      pageContent.includes("Light");
    expect(hasTheme).toBe(true);
  });
});
