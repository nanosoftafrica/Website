import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("loads CRM and service overview without gateway telemetry", async ({ page }) => {
    await page.goto("/admin/dashboard");

    await expect(page.getByText("Operational Command Center")).toBeVisible();
    await expect(page.getByText("Nanosoft Admin")).toBeVisible();
    await expect(page.getByText("Sales Pipeline")).toBeVisible();
    await expect(page.getByText("ITIL Incident Triage")).toBeVisible();
    await expect(page.getByText("WhatsApp Gateway")).toHaveCount(0);
    await expect(page.getByText("WhatsApp Hub")).toHaveCount(0);
  });

  test("Sales navigation has no WhatsApp gateway page", async ({ page }) => {
    await page.goto("/admin/dashboard");

    const salesGroup = page.locator(".adm-sidebar").getByRole("button", { name: "Sales", exact: true });
    await salesGroup.click();

    await expect(page.locator(".adm-sidebar").getByRole("link", { name: /WhatsApp/i })).toHaveCount(0);
  });
});