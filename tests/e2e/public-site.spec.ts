import { test, expect } from "@playwright/test";

// Smoke coverage for the Apple-HIG-inspired visual pass on globals.css:
// pill-shaped primary actions, blurred/translucent floating nav material,
// generous corner radii, and no console errors across the public pages.

test.describe("Homepage", () => {
  test("loads with no console errors and a pill-shaped primary CTA", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    const cta = page.locator(".btn-hero").first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveCSS("border-radius", "999px");

    expect(errors).toEqual([]);
  });

  test("product quick-view modal backdrop renders as a blurred material", async ({ page }) => {
    await page.goto("/products");
    const card = page.locator(".pl-card").first();
    if ((await card.count()) === 0) test.skip(true, "no products seeded — card not rendered");

    await card.click();
    const backdrop = page.locator(".pd-modal-backdrop");
    await expect(backdrop).toBeVisible();
    await expect(backdrop).toHaveCSS("backdrop-filter", /blur/);
  });

  test("hamburger meets the 44x44 minimum tap target on mobile widths", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto("/");
    const box = await page.locator(".hamburger").boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Products", () => {
  test("list loads and the quick-view modal opens with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/products");
    const firstCard = page.locator(".pl-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    const heroCta = page.locator(".pd-modal .pd-btn-hero").first();
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveCSS("border-radius", "999px");

    expect(errors).toEqual([]);
  });
});

test.describe("Blog", () => {
  test("list page loads with no console errors (empty-state tolerant)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/blog");
    await expect(page.locator(".bl-h1")).toBeVisible();

    expect(errors).toEqual([]);
  });
});
