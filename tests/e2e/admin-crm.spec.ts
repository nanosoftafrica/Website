import { test, expect } from "@playwright/test";

// Regression coverage for the bug fixed in this change: DealsBoardClient /
// ServiceRequestBoardClient (formerly WorkOrdersBoardClient) passed a
// `baseUrl` prop to CrmListView that silently overrode their own working
// Add/Edit modal with a Link into the abandoned generic-objects system
// (RecordDetailClient), whose "new record" form always rendered "No fields
// available". The fix removed that prop so the local modal (already wired to
// /api/admin/deals) is reachable. These tests fail loudly if that regresses.
// See admin-itil.spec.ts for the equivalent Service Request / Incident coverage.

test.describe("Deals (Opportunities) — /admin/deals", () => {
  test("Add button is a real button wired to the local modal, not a Link to a deleted route", async ({ page }) => {
    await page.goto("/admin/deals");
    const addButton = page.getByRole("button", { name: "New Opportunity" });
    await expect(addButton).toBeVisible();
    // The bug manifested as this being an <a href="/admin/opportunities/new">
    // instead of a <button>. Assert there is no such link on the page.
    await expect(page.getByRole("link", { name: "New Opportunity" })).toHaveCount(0);
  });

  test("can create and delete an opportunity end-to-end through the modal", async ({ page }) => {
    const title = `E2E Test Deal ${Date.now()}`;
    await page.goto("/admin/deals");

    await page.getByRole("button", { name: "New Opportunity" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();

    await modal.locator('input[placeholder*="Implementation"]').fill(title);
    const contactSelect = modal.locator("select").first();
    await expect(contactSelect.locator("option")).not.toHaveCount(1); // more than just the placeholder
    await contactSelect.selectOption({ index: 1 });

    await modal.getByRole("button", { name: "Save" }).click();
    await expect(modal).toBeHidden();

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();

    try {
      await expect(row).toContainText("new"); // default stage value, rendered as-is by CrmListView
    } finally {
      // Clean up regardless of assertion outcome above, so re-runs stay idempotent.
      page.once("dialog", (d) => d.accept());
      await row.locator(".crm-action-delete").click();
      await expect(page.locator("tr", { hasText: title })).toHaveCount(0);
    }
  });
});

test.describe("Abandoned generic-objects system is fully removed", () => {
  const removedPaths = [
    "/admin/opportunities", // stub list view (DealsListClient)
    "/admin/projects", // stub list view (ProjectsListClient)
    "/admin/opportunities/new", // generic-objects "new record" form
    "/admin/projects/123", // generic-objects record detail
    "/admin/some-other-entity/123", // the catch-all [entity]/[id] route itself
  ];

  for (const removedPath of removedPaths) {
    test(`${removedPath} no longer resolves`, async ({ page }) => {
      const response = await page.goto(removedPath);
      expect(response?.status()).toBe(404);
    });
  }
});
