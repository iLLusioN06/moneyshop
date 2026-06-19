import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Public pages (no auth needed)
    {
      name: "landing",
      testMatch: "landing.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "static-pages",
      testMatch: "static-pages.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "flows",
      testMatch: "flows.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "auth",
      testMatch: "auth.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    // Auth setup
    {
      name: "setup",
      testMatch: "global-setup.ts",
    },
    // Authenticated pages (need login state)
    {
      name: "dashboard",
      testMatch: "dashboard.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "dashboard-pages",
      testMatch: "dashboard-pages.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "transfers",
      testMatch: "transfers.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "card",
      testMatch: "card.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "profile-settings",
      testMatch: "profile-settings.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "admin",
      testMatch: "admin.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
