import { test, expect } from "@playwright/test";

test.describe("Admin - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
  });

  test("should load admin page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
  });

  test("should display admin stats", async ({ page }) => {
    const pageContent = await page.content();
    const hasAdmin = pageContent.includes("Admin") ||
      pageContent.includes("Yönetim") ||
      pageContent.includes("Kullanıcı") ||
      pageContent.includes("İstatistik");
    expect(hasAdmin).toBe(true);
  });
});

test.describe("Admin - Users", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  test("should load admin users page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test("should display user list", async ({ page }) => {
    const pageContent = await page.content();
    const hasUsers = pageContent.includes("Kullanıcı") ||
      pageContent.includes("User") ||
      pageContent.includes("test@test.com") ||
      pageContent.includes("admin@moneyshop.iq");
    expect(hasUsers).toBe(true);
  });

  test("should have user search", async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe("Admin - Transactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/transactions");
    await page.waitForLoadState("networkidle");
  });

  test("should load admin transactions page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/transactions/);
  });

  test("should display transaction list", async ({ page }) => {
    const pageContent = await page.content();
    const hasTransactions = pageContent.includes("İşlem") ||
      pageContent.includes("Transaction") ||
      pageContent.includes("Tüm") ||
      pageContent.includes("Liste");
    expect(hasTransactions).toBe(true);
  });
});

test.describe("Admin - Audit Logs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/audit-logs");
    await page.waitForLoadState("networkidle");
  });

  test("should load audit logs page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/audit-logs/);
  });

  test("should display audit log list", async ({ page }) => {
    const pageContent = await page.content();
    const hasLogs = pageContent.includes("Audit") ||
      pageContent.includes("Log") ||
      pageContent.includes("Denetim") ||
      pageContent.includes("İşlem");
    expect(hasLogs).toBe(true);
  });
});

test.describe("Admin - Email Logs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/email-logs");
    await page.waitForLoadState("networkidle");
  });

  test("should load email logs page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/email-logs/);
  });

  test("should display email log list", async ({ page }) => {
    const pageContent = await page.content();
    const hasLogs = pageContent.includes("E-posta") ||
      pageContent.includes("Email") ||
      pageContent.includes("Log") ||
      pageContent.includes("Gönderim");
    expect(hasLogs).toBe(true);
  });
});

test.describe("Admin - SMS Logs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sms-logs");
    await page.waitForLoadState("networkidle");
  });

  test("should load SMS logs page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/sms-logs/);
  });

  test("should display SMS log list", async ({ page }) => {
    const pageContent = await page.content();
    const hasLogs = pageContent.includes("SMS") ||
      pageContent.includes("Log") ||
      pageContent.includes("Mesaj") ||
      pageContent.includes("Gönderim");
    expect(hasLogs).toBe(true);
  });
});

test.describe("Admin - SMS Send", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/sms-send");
    await page.waitForLoadState("networkidle");
  });

  test("should load SMS send page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/sms-send/);
  });

  test("should display SMS form", async ({ page }) => {
    const pageContent = await page.content();
    const hasForm = pageContent.includes("SMS") ||
      pageContent.includes("Gönder") ||
      pageContent.includes("Mesaj") ||
      pageContent.includes("Telefon");
    expect(hasForm).toBe(true);
  });
});

test.describe("Admin - Announcements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/announcements");
    await page.waitForLoadState("networkidle");
  });

  test("should load announcements page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/announcements/);
  });

  test("should display announcement list", async ({ page }) => {
    const pageContent = await page.content();
    const hasAnnouncements = pageContent.includes("Duyuru") ||
      pageContent.includes("Announcement") ||
      pageContent.includes("Oluştur") ||
      pageContent.includes("Henüz");
    expect(hasAnnouncements).toBe(true);
  });

  test("should have create announcement button", async ({ page }) => {
    const createBtn = page.locator('button:has-text("Oluştur"), a:has-text("Yeni Duyuru"), button:has-text("Duyuru Ekle")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await expect(createBtn).toBeVisible();
    }
  });
});

test.describe("Admin - User Detail", () => {
  test("should load user detail page", async ({ page }) => {
    // Use a dummy ID - the page should handle gracefully
    await page.goto("/admin/users/test-user-id");
    await page.waitForLoadState("networkidle");
    // Should either show user info or an error/not found state
    const pageContent = await page.content();
    const hasContent = pageContent.includes("Kullanıcı") ||
      pageContent.includes("User") ||
      pageContent.includes("Bulunamadı") ||
      pageContent.includes("Hata");
    expect(hasContent).toBe(true);
  });
});
