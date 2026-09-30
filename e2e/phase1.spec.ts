import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

/**
 * Phase 1 success criteria, end to end, against local Supabase:
 * register → log in → create wedding (names, date, template) → upload hero
 * and gallery images → edit → preview → publish → open /w/{slug} → cinematic
 * opening → change names → refresh → updated names. Plus access control.
 */

const unique = Date.now().toString(36);
const email = `couple-${unique}@example.test`;
const password = "correct-horse-42";
const image = path.join(__dirname, "../public/samples/gallery-1.jpg");

async function register(page: Page, userEmail: string) {
  await page.goto("/register");
  await page.getByLabel("Your name").fill("E2E Couple");
  await page.getByLabel("Email").fill(userEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe.serial("Phase 1", () => {
  let editorUrl = "";
  let slug = "";

  test("1–2: register, log out and log in", async ({ page }) => {
    await register(page, email);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("3–6: create a wedding with names, date and template", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();

    await page.goto("/dashboard/new");
    await page.getByLabel("First name").fill("Andrew");
    await page.getByLabel("Second name").fill("Mariam");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Wedding date").fill("2027-06-12");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: /Cinematic/ }).check({ force: true });
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Create wedding" }).click();

    await expect(page).toHaveURL(/\/dashboard\/weddings\/[0-9a-f-]{36}$/);
    editorUrl = page.url();
    await expect(page.getByRole("heading", { name: "Andrew & Mariam" })).toBeVisible();
  });

  test("7–10: upload images, edit, preview and publish", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.goto(editorUrl);

    // Hero photo
    await page.getByRole("button", { name: "Hero", exact: true }).click();
    await page.locator('input[type="file"]').first().setInputFiles(image);
    await expect(page.getByAltText("gallery-1")).toBeVisible({ timeout: 20_000 });

    // Gallery photos
    await page.getByRole("button", { name: "Gallery" }).click();
    await page.locator('input[type="file"]').first().setInputFiles([image, image]);
    await expect(page.getByText("(2/30)")).toBeVisible({ timeout: 20_000 });

    // Ceremony
    await page.getByRole("button", { name: "Ceremony" }).click();
    await page.getByLabel("Time", { exact: true }).fill("17:00");
    await page.getByLabel("Venue name").fill("St. Mark's Cathedral");
    await expect(page.getByText("All changes saved")).toBeVisible({ timeout: 10_000 });

    // Live preview reflects edits
    const preview = page.frameLocator('iframe[title="Invitation preview"]');
    await expect(preview.locator("#ceremony")).toContainText("St. Mark's Cathedral");

    // Slug for later
    await page.getByRole("button", { name: "Settings & sharing" }).click();
    slug = await page.locator("#slug").inputValue();

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published", { exact: true })).toBeVisible();
  });

  test("11–15: public invitation, cinematic opening, live name changes", async ({ page, browser }) => {
    // A guest (no session) opens the link.
    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`/w/${slug}`);
    await expect(guestPage).toHaveTitle("Andrew & Mariam — Wedding Invitation");
    const opening = guestPage.locator("[data-opening]");
    await expect(opening).toBeVisible();
    await guestPage.getByRole("button", { name: "Open invitation" }).click();
    await expect(opening).toHaveCount(0, { timeout: 10_000 });
    await expect(guestPage.locator("[data-section=hero] h1")).toContainText("Andrew");
    expect(await guestPage.evaluate(() => document.querySelector("[data-section=hero]")!.getBoundingClientRect().top)).toBe(0);

    // The couple renames in the editor…
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.goto(editorUrl);
    await page.getByLabel("First name").fill("Andy");
    await expect(page.getByText("All changes saved")).toBeVisible({ timeout: 10_000 });

    // …and the guest sees it after a refresh.
    await guestPage.reload();
    await expect(guestPage).toHaveTitle("Andy & Mariam — Wedding Invitation");
    await expect(guestPage.locator("[data-section=hero] h1")).toContainText("Andy");
    await guest.close();
  });

  test("security: other users and guests can't reach private data", async ({ browser }) => {
    const other = await browser.newContext();
    const page = await other.newPage();
    await register(page, `intruder-${unique}@example.test`);
    await page.goto(editorUrl);
    await expect(page.getByRole("heading", { name: /couldn.t find that wedding/i })).toBeVisible();
    await page.goto(editorUrl.replace("/dashboard/weddings/", "/preview/"));
    await expect(page.getByRole("heading", { name: /couldn.t find that wedding|not found/i })).toBeVisible();
    await other.close();

    const anon = await browser.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto(editorUrl);
    await expect(anonPage).toHaveURL(/\/login\?next=/);
    await anon.close();
  });
});
