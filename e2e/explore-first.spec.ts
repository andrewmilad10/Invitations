import { expect, test } from "@playwright/test";
import path from "node:path";

/**
 * The explore-first journey against local Supabase:
 * browse → preview → try without an account → create account at the end →
 * the editor opens with everything the visitor entered, including photos.
 */
const photo = path.join(__dirname, "../public/samples/gallery-2.jpg");

test("a visitor builds an invitation before creating an account, and nothing is lost", async ({ page }) => {
  // Explore — no login anywhere.
  await page.goto("/");
  await page.getByRole("link", { name: /explore templates/i }).first().click();
  await expect(page).toHaveURL(/\/templates/);
  await page.goto("/templates/romantic");
  await page.getByRole("tab", { name: "Website" }).click();
  await expect(page.frameLocator("iframe").first().locator("[data-section=hero] h1")).toContainText("Emma");

  // Try it.
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/create\/romantic/);
  await page.getByLabel("First name").fill("Mariam");
  await page.getByLabel("Second name").fill("Andrew");
  const preview = page.frameLocator('iframe[title="Invitation preview"]');
  await expect(preview.locator("[data-section=hero] h1")).toContainText("Mariam");

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Wedding date").fill("2027-05-20");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Venue").fill("St. Mark's Cathedral");
  await page.getByLabel("Time", { exact: true }).fill("17:00");

  await page.getByRole("button", { name: "7. Photos" }).click();
  await page.getByRole("button", { name: "A couple embracing at their wedding" }).click();
  await page.getByRole("tab", { name: /Gallery/ }).click();
  await page.locator('input[type="file"]').setInputFiles(photo);

  // Save → account creation, with the invitation shown.
  await page.getByRole("button", { name: "Save my invitation" }).click();
  await expect(page).toHaveURL(/\/register\?draft=1/);
  await expect(page.getByText("Almost there")).toBeVisible();
  await page.getByLabel("Your name").fill("Mariam");
  await page.getByLabel("Email").fill(`try-${Date.now()}@example.test`);
  await page.getByLabel("Password").fill("correct-horse-42");
  await page.getByRole("button", { name: "Create invitation" }).click();

  // The editor opens with everything carried over.
  await expect(page).toHaveURL(/\/dashboard\/weddings\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Mariam & Andrew" })).toBeVisible();
  const editorPreview = page.frameLocator('iframe[title="Invitation preview"]');
  await expect(editorPreview.locator("#ceremony")).toContainText("St. Mark's Cathedral");
  await expect(editorPreview.locator("#ceremony")).toContainText(/5:00\s?pm/i);
  await page.getByRole("button", { name: "Gallery" }).click();
  await expect(page.getByText("(1/30)")).toBeVisible();

  // The browser draft is gone (saved exactly once).
  expect(await page.evaluate(() => localStorage.getItem("vellum:try-draft:v1"))).toBeNull();
});
