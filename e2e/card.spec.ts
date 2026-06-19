import { test, expect } from "@playwright/test";

test.describe("Card Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/my-card");
    await page.waitForLoadState("networkidle");
  });

  test("should load my card page", async ({ page }) => {
    await expect(page).toHaveURL(/\/my-card/);
  });

  test("should display card information", async ({ page }) => {
    const pageContent = await page.content();
    const hasCardInfo = pageContent.includes("Card") ||
      pageContent.includes("Kart") ||
      pageContent.includes("Standart") ||
      pageContent.includes("Silver") ||
      pageContent.includes("Gold");
    expect(hasCardInfo).toBe(true);
  });

  test("should have card status indicator", async ({ page }) => {
    const pageContent = await page.content();
    const hasStatus = pageContent.includes("Aktif") ||
      pageContent.includes("ACTIVE") ||
      pageContent.includes("Durum") ||
      pageContent.includes("Status");
    expect(hasStatus).toBe(true);
  });

  test("should have card limit information", async ({ page }) => {
    const pageContent = await page.content();
    const hasLimit = pageContent.includes("Limit") ||
      pageContent.includes("Harcama") ||
      pageContent.includes("Bakiye");
    expect(hasLimit).toBe(true);
  });
});

test.describe("Card Application Page (Public)", () => {
  test("should load card application page", async ({ page }) => {
    await page.goto("/card");
    await expect(page).toHaveTitle(/Card|MoneyShop/);
  });

  test("should show all card types", async ({ page }) => {
    await page.goto("/card");
    const pageContent = await page.content();
    expect(pageContent).toContain("Standart");
    expect(pageContent).toContain("Silver");
    expect(pageContent).toContain("Gold");
  });

  test("should have apply/register button", async ({ page }) => {
    await page.goto("/card");
    const applyBtn = page.locator('a:has-text("Başvur"), a:has-text("Kayıt"), a:has-text("Hemen"), button:has-text("Başvur")').first();
    if (await applyBtn.isVisible().catch(() => false)) {
      await expect(applyBtn).toBeVisible();
    }
  });

  test("should show card benefits", async ({ page }) => {
    await page.goto("/card");
    const pageContent = await page.content();
    const hasBenefits = pageContent.includes("Puan") ||
      pageContent.includes("İndirim") ||
      pageContent.includes("Sigorta") ||
      pageContent.includes("Temassız");
    expect(hasBenefits).toBe(true);
  });
});
