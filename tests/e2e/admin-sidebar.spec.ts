import { test, expect } from "@playwright/test";

test.describe("Admin sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/dashboard");
  });

  test("Opportunities links to the working board route, not the deleted stub", async ({ page }) => {
    await page.getByRole("button", { name: "Sales", exact: true }).click();
    await expect(page.getByRole("link", { name: "Opportunities" })).toHaveAttribute("href", "/admin/deals");
  });

  test("Incidents and Service Requests live in the Service Management group", async ({ page }) => {
    await page.getByRole("button", { name: "Service Management", exact: true }).click();
    await expect(page.getByRole("link", { name: "Incidents" })).toHaveAttribute("href", "/admin/incidents");
    await expect(page.getByRole("link", { name: "Service Requests" })).toHaveAttribute("href", "/admin/service-requests");
    await expect(page.getByRole("link", { name: "Technicians" })).toHaveAttribute("href", "/admin/technicians");
    await expect(page.getByRole("link", { name: "Suppliers" })).toHaveAttribute("href", "/admin/suppliers");
  });

  test("clicking Opportunities in the sidebar actually navigates to the working page", async ({ page }) => {
    await page.getByRole("button", { name: "Sales", exact: true }).click();
    await page.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/admin\/deals$/);
    await expect(page.getByRole("button", { name: "New Opportunity" })).toBeVisible();
  });

  test("Dashboard-only group is labeled \"Dashboard\", not the former \"Insights\" (which collided with the Analytics/insights route)", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Dashboard", exact: true }).first()).toBeVisible();
    // The old label would have produced two sidebar entries containing "Insights"
    // (the group header and the Analytics link's target route) — assert only one insights-labeled surface exists.
    await page.getByRole("button", { name: "Administration", exact: true }).click();
    await expect(page.getByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/admin/insights");
    await expect(page.getByRole("button", { name: "Insights", exact: true })).toHaveCount(0);
  });

  test("sidebar groups expand and persist across reload", async ({ page }) => {
    await page.getByRole("button", { name: "CRM", exact: true }).click();
    await expect(page.getByRole("link", { name: "Companies" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("link", { name: "Companies" })).toBeVisible();
  });
});
