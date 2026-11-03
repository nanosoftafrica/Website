import { test, expect } from "@playwright/test";

// The admin menu has four areas (Website, Sales, Support, Settings) plus Start.
test.describe("Admin sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/dashboard");
  });

  const sidebar = (page: import("@playwright/test").Page) => page.locator(".adm-sidebar");

  test("shows Start, Website, Sales, Support and Settings for a super admin", async ({ page }) => {
    for (const name of ["Start", "Website", "Sales", "Support", "Settings"]) {
      await expect(sidebar(page).getByRole("button", { name, exact: true })).toBeVisible();
    }
    for (const old of ["CRM", "Service Management", "Engagement", "Administration", "Insights"]) {
      await expect(sidebar(page).getByRole("button", { name: old, exact: true })).toHaveCount(0);
    }
  });

  test("Deals link in Sales goes to the working board route", async ({ page }) => {
    await sidebar(page).getByRole("button", { name: "Sales", exact: true }).click();
    await expect(sidebar(page).getByRole("link", { name: "Deals and product inquiries" })).toHaveAttribute("href", "/admin/deals");
  });

  test("clicking Deals in the sidebar actually navigates to the working page", async ({ page }) => {
    await sidebar(page).getByRole("button", { name: "Sales", exact: true }).click();
    await sidebar(page).getByRole("link", { name: "Deals and product inquiries" }).click();
    await expect(page).toHaveURL(/\/admin\/deals$/);
    await expect(page.getByRole("button", { name: "New Opportunity" })).toBeVisible();
  });

  test("Incidents, Service requests, Technicians and Suppliers live in Support", async ({ page }) => {
    await sidebar(page).getByRole("button", { name: "Support", exact: true }).click();
    await expect(sidebar(page).getByRole("link", { name: "Incidents", exact: true })).toHaveAttribute("href", "/admin/incidents");
    await expect(sidebar(page).getByRole("link", { name: "Service requests", exact: true })).toHaveAttribute("href", "/admin/service-requests");
    await expect(sidebar(page).getByRole("link", { name: "Technicians", exact: true })).toHaveAttribute("href", "/admin/technicians");
    await expect(sidebar(page).getByRole("link", { name: "Suppliers", exact: true })).toHaveAttribute("href", "/admin/suppliers");
  });

  test("Analytics sits under Settings", async ({ page }) => {
    await sidebar(page).getByRole("button", { name: "Settings", exact: true }).click();
    await expect(sidebar(page).getByRole("link", { name: "Analytics", exact: true })).toHaveAttribute("href", "/admin/insights");
  });

  test("sidebar groups expand and persist across reload", async ({ page }) => {
    await sidebar(page).getByRole("button", { name: "Sales", exact: true }).click();
    await expect(sidebar(page).getByRole("link", { name: "Companies", exact: true })).toBeVisible();
    await page.reload();
    await expect(sidebar(page).getByRole("link", { name: "Companies", exact: true })).toBeVisible();
  });
});
