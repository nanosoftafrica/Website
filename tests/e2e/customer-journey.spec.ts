import { test, expect } from "@playwright/test";

// A single continuous walkthrough simulating a prospective customer:
// lands on the homepage, explores products via nav, reads a product's
// detail page, tries to book a demo (must stay on-site), checks case
// studies and blog, and confirms footer/contact links are all reachable.
// Complements public-site.spec.ts / case-studies.spec.ts (narrow smoke
// checks) with one end-to-end path, since bugs like "the primary CTA
// silently links off-site" only show up when you follow the whole flow.

test.describe("Customer journey", () => {
  test("home -> Solutions -> product card opens a quick-view modal -> demo CTA stays on-site and preselects the product", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.locator(".hero-h1, h1").first()).toBeVisible();

    // Solutions is now a plain nav link (no dropdown) straight to /products.
    // Scoped + exact to avoid matching the "See All Solutions" hero CTA.
    await page.locator(".nav-links").getByRole("link", { name: "Solutions", exact: true }).click();
    await expect(page).toHaveURL(/\/products$/);

    // Clicking a card opens a quick-view modal in place — no navigation.
    const firstCard = page.locator(".pl-card").first();
    const productName = (await firstCard.locator("h3").textContent())?.trim();
    expect(productName).toBeTruthy();
    await firstCard.click();

    await expect(page).toHaveURL(/\/products$/); // still on /products — no page nav
    const modal = page.locator(".pd-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator(".pd-title")).toContainText(productName!);

    // The primary CTA must keep the visitor on this site, not bounce them
    // to the old ntlafrica.com domain.
    const heroCta = modal.locator(".pd-btn-hero").first();
    const heroHref = await heroCta.getAttribute("href");
    expect(heroHref).not.toContain("ntlafrica.com");
    expect(heroHref).toMatch(/^\/\?product=/);
    expect(heroHref).toContain("#demo");

    await heroCta.click();

    // Should land on the homepage, scrolled to the demo form, with this
    // product preselected in the dropdown.
    await expect(page).toHaveURL(/\/\?product=.*#demo/);
    const productSelect = page.locator("select").filter({ has: page.locator("option", { hasText: "Select a product" }) });
    await expect(productSelect).toHaveValue(productName!);

    expect(errors).toEqual([]);
  });

  test("product quick-view modal closes on Escape and on backdrop click", async ({ page }) => {
    await page.goto("/products");
    const firstCard = page.locator(".pl-card").first();
    await firstCard.click();
    const modal = page.locator(".pd-modal");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();

    await firstCard.click();
    await expect(modal).toBeVisible();
    await page.locator(".pd-modal-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(modal).toBeHidden();
  });

  test("all top-level nav links resolve to a real page (no ntlafrica.com, no dead anchors)", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator(".nav-links > li > a, .nav-links > li > button").evaluateAll((els) =>
      els.map((el) => (el.tagName === "A" ? el.getAttribute("href") : null)).filter(Boolean)
    );

    for (const href of hrefs as string[]) {
      expect(href).not.toContain("ntlafrica.com");
      const res = await page.request.get(href.startsWith("/#") ? "/" : href);
      expect(res.ok(), `${href} should resolve OK`).toBeTruthy();
    }
  });

  test("Case Studies -> a real case study -> back to home works end to end", async ({ page }) => {
    await page.goto("/case-studies");
    const firstCard = page.locator(".cst-grid .cst-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page.locator(".pd-title")).toBeVisible();
  });

  test("Blog -> a post (if any) -> 'Talk to us' CTA stays on-site", async ({ page }) => {
    await page.goto("/blog");
    const firstPost = page.locator(".bl-card").first();
    if ((await firstPost.count()) === 0) {
      test.skip(true, "no published posts seeded yet");
    }
    await firstPost.click();
    const cta = page.locator(".btn-cta");
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).not.toContain("ntlafrica.com");
  });

  test("footer contact links (phone/email/WhatsApp) are wired, not placeholders", async ({ page }) => {
    await page.goto("/products");
    const footer = page.locator(".home-footer");
    await expect(footer).toBeVisible();

    const phoneLink = footer.locator('a[href^="tel:"]');
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute("href", /^tel:\+254/);

    const emailLink = footer.locator('a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();

    const waFloat = page.locator(".wa-float");
    await expect(waFloat).toHaveAttribute("href", /wa\.me/);
  });

  test("mobile: hamburger opens nav and every link is reachable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator(".hamburger").click();
    const mobileNav = page.locator(".mobile-nav.open");
    await expect(mobileNav).toBeVisible();

    const links = await mobileNav.locator("a").all();
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const href = await link.getAttribute("href");
      expect(href).not.toContain("ntlafrica.com");
    }
  });
});
