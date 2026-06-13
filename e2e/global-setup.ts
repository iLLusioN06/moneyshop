import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = ".auth/user.json";

setup("authenticate as test user", async ({ page }) => {
  await page.goto("/login");

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', "test@test.com");
  await page.fill('input[type="password"]', "123456789");
  await page.click('button[type="submit"]');

  // Wait for redirect to /dashboard
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Save authenticated state
  await page.context().storageState({ path: AUTH_FILE });
});
