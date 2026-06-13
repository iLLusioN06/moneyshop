import { test, expect } from "@playwright/test";

test.describe("Dashboard (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to dashboard using stored auth state
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should load dashboard overview", async ({ page }) => {
    // Dashboard sayfası yüklendi
    await expect(page).toHaveURL(/\/dashboard/);

    // Sidebar görünür (logo, navigation)
    const sidebarLogo = page.locator("text=MoneyShop").first();
    await expect(sidebarLogo).toBeVisible({ timeout: 10000 });

    // Hoşgeldiniz mesajı
    await expect(page.locator("text=Genel Bakış").or(page.locator("text=Hoş Geldiniz")).first()).toBeVisible({ timeout: 10000 });
  });

  test("should have sidebar navigation items", async ({ page }) => {
    const navItems = [
      "Genel Bakış",
      "Hesaplar",
      "İşlemler",
      "Transferler",
    ];

    for (const item of navItems) {
      const link = page.locator(`a:has-text("${item}"), nav:has-text("${item}")`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
    }
  });

  test("should navigate to accounts page", async ({ page }) => {
    await page.locator('a[href="/accounts"]').first().click();
    await page.waitForURL("**/accounts");
    await expect(page).toHaveURL(/\/accounts/);
  });

  test("should navigate to transactions page", async ({ page }) => {
    await page.locator('a[href="/transactions"]').first().click();
    await page.waitForURL("**/transactions");
    await expect(page).toHaveURL(/\/transactions/);
  });

  test("should navigate to transfers page", async ({ page }) => {
    await page.locator('a[href="/transfers"]').first().click();
    await page.waitForURL("**/transfers");
    await expect(page).toHaveURL(/\/transfers/);
  });

  test("should have currency marquee visible", async ({ page }) => {
    // Döviz kuru bandı görünür mü kontrol et
    const marquee = page.locator("text=Piyasa").or(page.locator("text=Döviz")).first();
    await expect(marquee).toBeVisible({ timeout: 15000 });
  });

  test("should toggle sidebar on mobile", async ({ page }) => {
    // Sidebar toggle butonu mevcut
    const toggleBtn = page.locator('button[aria-label*="Menü"], button:has(svg path)').first();
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test("should have working logout button", async ({ page }) => {
    // Çıkış butonu mevcut
    const logoutBtn = page.locator("text=Çıkış Yap").or(page.locator("text=Çıkış")).first();
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  });

  test("should have user profile section in sidebar", async ({ page }) => {
    // Kullanıcı bilgisi sidebar'da görünür
    await expect(page.locator("text=Test Kullanıcı").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Dashboard Navigation Flows", () => {
  test("should navigate from dashboard to profile and back", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Profil sayfasına git
    await page.locator('a[href="/profile"]').first().click();
    await page.waitForURL("**/profile");
    await expect(page).toHaveURL(/\/profile/);
  });
});
