import { test as setup, expect } from "@playwright/test";
import path from "path";

// Mirrors the fallback in server/seed.js so this works against a freshly
// seeded dev database without extra config.
const USERNAME = process.env.ADMIN_USERNAME || "admin";
const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("Set ADMIN_PASSWORD (same value as in .env.local) before running the e2e tests.");

const authFile = path.join(__dirname, ".auth", "admin.json");

setup("authenticate as admin", async ({ page }) => {
  setup.setTimeout(90000);
  await page.goto("/admin/login");
  await page.fill("#username", USERNAME);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/start", { waitUntil: "commit", timeout: 60000 });
  await expect(page.getByRole("link", { name: "Start here", exact: true })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
