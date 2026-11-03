import { test, expect } from "@playwright/test";

// Coverage for the ITIL V5 rebuild: WorkOrder renamed in place to
// ServiceRequest (its stage lifecycle is a procurement/fulfillment flow, i.e.
// ITIL Service Request Management), and the new, greenfield Incident model
// (ITIL Incident Management — unplanned disruption, severity/impact/urgency
// feeding a server-derived priority). See admin-crm.spec.ts for why the
// "real button, not a Link" assertions matter (guards the baseUrl regression).

test.describe("Service Requests — /admin/service-requests", () => {
  test("Add button is a real button wired to the local modal, not a Link", async ({ page }) => {
    await page.goto("/admin/service-requests");
    const addButton = page.getByRole("button", { name: "New Service Request" });
    await expect(addButton).toBeVisible();
    await expect(page.getByRole("link", { name: "New Service Request" })).toHaveCount(0);
  });

  test("can create and delete a service request end-to-end through the modal", async ({ page }) => {
    const title = `E2E Test Service Request ${Date.now()}`;
    await page.goto("/admin/service-requests");

    await page.getByRole("button", { name: "New Service Request" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Add service request")).toBeVisible();

    await modal.locator(".adm-field", { hasText: "Title" }).locator("input").fill(title);
    const contactSelect = modal.locator("select").first();
    await expect(contactSelect.locator("option")).not.toHaveCount(1);
    await contactSelect.selectOption({ index: 1 });

    await modal.getByRole("button", { name: "Save" }).click();
    await expect(modal).toBeHidden();

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();

    try {
      await expect(row).toContainText("new"); // default stage
    } finally {
      page.once("dialog", (d) => d.accept());
      await row.locator(".crm-action-delete").click();
      await expect(page.locator("tr", { hasText: title })).toHaveCount(0);
    }
  });
});

test.describe("Incidents — /admin/incidents", () => {
  test("Add button is a real button wired to the local modal, not a Link", async ({ page }) => {
    await page.goto("/admin/incidents");
    const addButton = page.getByRole("button", { name: "New Incident" });
    await expect(addButton).toBeVisible();
    await expect(page.getByRole("link", { name: "New Incident" })).toHaveCount(0);
  });

  test("priority is displayed read-only and derived, not an editable input", async ({ page }) => {
    await page.goto("/admin/incidents");
    await page.getByRole("button", { name: "New Incident" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();
    const priorityField = modal.locator(".adm-field", { hasText: "Priority" }).locator("input");
    await expect(priorityField).toBeDisabled();
    await expect(priorityField).toHaveValue("P3"); // default impact=medium, urgency=medium
    await modal.getByRole("button", { name: "Cancel" }).click();
  });

  test("impact=high + urgency=high derives priority P1, end-to-end through create", async ({ page }) => {
    const title = `E2E Test Incident ${Date.now()}`;
    await page.goto("/admin/incidents");

    await page.getByRole("button", { name: "New Incident" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();

    await modal.locator(".adm-field", { hasText: "Title" }).locator("input").fill(title);
    const contactSelect = modal.locator("select").first();
    await expect(contactSelect.locator("option")).not.toHaveCount(1);
    await contactSelect.selectOption({ index: 1 });

    await modal.locator(".adm-field", { hasText: "Impact" }).locator("select").selectOption("high");
    await modal.locator(".adm-field", { hasText: "Urgency" }).locator("select").selectOption("high");
    await expect(modal.locator(".adm-field", { hasText: "Priority" }).locator("input")).toHaveValue("P1");

    await modal.getByRole("button", { name: "Save" }).click();
    await expect(modal).toBeHidden();

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();

    try {
      await expect(row).toContainText("P1");
    } finally {
      page.once("dialog", (d) => d.accept());
      await row.locator(".crm-action-delete").click();
      await expect(page.locator("tr", { hasText: title })).toHaveCount(0);
    }
  });
});

test.describe("Renamed-away route is fully gone", () => {
  test("/admin/work-orders no longer resolves", async ({ page }) => {
    const response = await page.goto("/admin/work-orders");
    expect(response?.status()).toBe(404);
  });
});
