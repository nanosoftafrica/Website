import { test, expect } from "@playwright/test";

// The short demo form: only name, email OR phone, company and product are
// required; industry, date, time and message sit in an optional block.
// These checks never submit a real request, so they leave no test data.
test.describe("Short demo form", () => {
  test("shows the four required things and hides the optional details", async ({ page }) => {
    await page.goto("/#demo");
    const form = page.locator("#demo form");
    await expect(form.getByText("Full Name *")).toBeVisible();
    await expect(form.getByText("Company *")).toBeVisible();
    await expect(form.getByText("Which product interests you? *")).toBeVisible();
    await expect(form.getByText("Give us an email or a phone number")).toBeVisible();
    // Optional fields are collapsed until the visitor opens them.
    await expect(form.getByText("Preferred date")).toBeHidden();
    await form.getByText("Add more details (optional)").click();
    await expect(form.getByText("Preferred date")).toBeVisible();
  });

  test("asks for what is missing instead of sending", async ({ page }) => {
    let posted = false;
    await page.route("**/api/contact", (route) => {
      posted = true;
      return route.abort();
    });
    await page.goto("/#demo");
    const form = page.locator("#demo form");
    await form.getByPlaceholder("Your name").fill("Test Visitor");
    await form.locator('button[type="submit"]').click();
    await expect(form.locator(".form-msg.err")).toContainText("an email or phone number");
    await expect(form.locator(".form-msg.err")).toContainText("your company");
    await expect(form.locator(".form-msg.err")).toContainText("a product");
    expect(posted).toBe(false);
  });

  test("a phone number alone is enough, and the product comes from the link", async ({ page }) => {
    let body: Record<string, string> | null = null;
    await page.route("**/api/contact", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true,"id":0}' });
    });
    await page.goto("/products");
    const productName = (await page.locator(".pl-card h3").first().textContent())?.trim() || "";
    await page.goto(`/?product=${encodeURIComponent(productName)}#demo`);
    const form = page.locator("#demo form");
    const productSelect = form.locator("select").filter({ has: page.locator("option", { hasText: "Select a product" }) });
    await expect(productSelect).toHaveValue(productName);
    await form.getByPlaceholder("Your name").fill("Test Visitor");
    await form.getByPlaceholder("+254 700 000 000").fill("0700000000");
    await form.getByPlaceholder("Company name").fill("Test Co");
    await form.locator('button[type="submit"]').click();
    await expect(form.locator(".form-msg.ok")).toBeVisible();
    expect(body).not.toBeNull();
    expect(body!.email).toBe("");
    expect(body!.phone).toBe("0700000000");
    expect(body!.interest).toContain(productName);
  });

  test("the contact API rejects a request with no email or phone", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { name: "No Contact Details" } });
    expect(res.status()).toBe(400);
  });
});
