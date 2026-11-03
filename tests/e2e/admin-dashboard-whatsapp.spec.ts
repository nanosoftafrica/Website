import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Overhaul (React Bits) — /admin/dashboard", () => {
  test("loads redesigned Bento dashboard with React Bits cards and telemetry", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Top hero telemetry banner
    await expect(page.getByText("Operational Command Center")).toBeVisible();
    await expect(page.getByText("Nanosoft Admin")).toBeVisible();

    // Bento spotlight cards
    await expect(page.getByText("Sales Pipeline")).toBeVisible();
    await expect(page.getByText("ITIL Incident Triage")).toBeVisible();
    await expect(page.getByText("WhatsApp Hub (WAHA)")).toBeVisible();

    // QuickActionsDock (React Bits)
    const dock = page.locator(".rb-dock-container");
    await expect(dock).toBeVisible();

    // WhatsApp Gateway status indicator
    await expect(page.getByText("WhatsApp Gateway")).toBeVisible();
  });

  test("can open and close the Quick WhatsApp modal from dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");

    const quickWaBtn = page.getByRole("button", { name: /Quick WhatsApp/i });
    await expect(quickWaBtn).toBeVisible();
    await quickWaBtn.click();

    // Modal opens
    const modal = page.locator(".adm-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Quick WhatsApp Message")).toBeVisible();

    // Fill in form and test template selection
    await modal.locator('input[placeholder*="0734818350"]').fill("0712345678");
    await modal.getByRole("button", { name: /Intro Greeting/i }).click();

    const textarea = modal.locator("textarea");
    const val = await textarea.inputValue();
    expect(val).toContain("Nanosoft Technology");

    // Close modal
    await modal.getByRole("button", { name: "Cancel" }).click();
    await expect(modal).toBeHidden();
  });
});

test.describe("WhatsApp Hub (WAHA) — /admin/whatsapp", () => {
  test("renders WhatsApp Hub with gateway status and composer", async ({ page }) => {
    await page.goto("/admin/whatsapp");

    await expect(page.getByRole("heading", { name: "WhatsApp Hub (WAHA)" })).toBeVisible();
    await expect(page.getByText("Compose WhatsApp Message")).toBeVisible();
    await expect(page.getByText("Message Log & History")).toBeVisible();

    // Fill and submit a WhatsApp message in the hub
    const phoneInput = page.locator('input[placeholder*="0734818350"]');
    await phoneInput.fill("0799887766");

    // Click demo template
    await page.getByRole("button", { name: /Demo Intro/i }).click();

    const submitBtn = page.getByRole("button", { name: "Send WhatsApp Message" });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify confirmation feedback
    await expect(page.locator("text=/dispatched|logged/i").first()).toBeVisible({ timeout: 8000 });
  });

  test("accessible via sidebar Engagement navigation", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Expand Engagement accordion in sidebar if collapsed
    const engagementGroup = page.locator(".adm-sidebar").getByRole("button", { name: /Engagement/i });
    await engagementGroup.click();

    const waLink = page.locator(".adm-sidebar").getByRole("link", { name: /WhatsApp/i });
    await expect(waLink).toBeVisible();
    await waLink.click();

    await expect(page).toHaveURL(/\/admin\/whatsapp$/);
  });
});
