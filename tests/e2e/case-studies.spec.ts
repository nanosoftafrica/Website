import { test, expect } from "@playwright/test";

// Coverage for the new Case Studies content type: dedicated CaseStudy model
// (not the abandoned generic-objects/JSONB system), admin CRUD via the
// existing CrudPanel factory, and public /case-studies + /case-studies/[slug]
// pages backed by the 4 seeded real client deployments.

test.describe("Admin — /admin/case-studies", () => {
  test("Add button opens a modal with the expected fields", async ({ page }) => {
    await page.goto("/admin/case-studies");
    await page.getByRole("button", { name: "+ Add case study" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Add case study")).toBeVisible();
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#slug")).toBeVisible();
    await expect(page.locator("#client")).toBeVisible();
  });

  test("can create and delete a case study end-to-end", async ({ page }) => {
    const title = `E2E Test Case Study ${Date.now()}`;
    const slug = `e2e-test-${Date.now()}`;
    await page.goto("/admin/case-studies");

    await page.getByRole("button", { name: "+ Add case study" }).click();
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();

    await page.locator("#title").fill(title);
    await page.locator("#slug").fill(slug);
    await page.locator("#client").fill("E2E Test Client");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(modal).toBeHidden();

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("E2E Test Client");

    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("tr", { hasText: title })).toHaveCount(0, { timeout: 10000 });
  });
});

test.describe("Public — /case-studies", () => {
  test("list page shows the seeded case studies with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/case-studies");
    await expect(page.locator(".cst-grid .cst-card")).toHaveCount(4);
    await expect(page.getByText("Nairobi International School")).toBeVisible();
    await expect(page.getByText("Vegpro")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("detail page renders the challenge/solution/outcome narrative and services", async ({ page }) => {
    await page.goto("/case-studies/nairobi-international-school");
    await expect(page.locator(".pd-title")).toHaveText("Campus-Wide Smart Infrastructure");
    await expect(page.getByText("The Challenge")).toBeVisible();
    await expect(page.getByText("The Solution")).toBeVisible();
    await expect(page.getByText("The Outcome")).toBeVisible();
    await expect(page.locator(".cst-service-pill")).toHaveCount(5);
  });

  test("unknown slug 404s", async ({ page }) => {
    const response = await page.goto("/case-studies/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Homepage nav", () => {
  test("Case Studies link points at the real page, not the /blog placeholder", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(".nav-links a", { hasText: "Case Studies" }).or(page.locator("a", { hasText: "Case Studies" })).first();
    await expect(link).toHaveAttribute("href", "/case-studies");
  });
});
