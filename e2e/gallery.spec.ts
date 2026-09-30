import { expect, test } from "@playwright/test";

/** The design gallery and design pages (no database needed). */

test("filters, colours and saved designs in the gallery", async ({ page }) => {
  await page.goto("/templates"); // old address → invitation cards
  await expect(page).toHaveURL(/\/invitations/);
  const count = page.getByText(/^Showing /);
  await expect(count).toBeVisible();
  const total = Number((await count.textContent())!.match(/of (\d+)/)![1]);
  expect(total).toBeGreaterThan(30);

  // Style tile narrows the list and lands in the URL.
  await page.getByRole("button", { name: "Floral", exact: true }).click();
  await expect(page).toHaveURL(/style=floral/);
  // Filtering is a (cross-faded) transition, so wait for the new count.
  await expect.poll(async () => Number((await count.textContent())!.match(/of (\d+)/)![1])).toBeLessThan(total);

  // Colour filter.
  await page.getByRole("button", { name: /^Colour/ }).click();
  await page.getByRole("option", { name: "Blue" }).click();
  await expect(page).toHaveURL(/color=blue/);

  // Save a design, then show only saved ones.
  await page.getByRole("button", { name: /Clear all/ }).click();
  await page.getByRole("button", { name: /^Save Moonlit$/ }).click();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.getByRole("heading", { name: "Moonlit" })).toBeVisible();
  await expect(count).toHaveText(/of 1 design$/);
});

test("design page: colour carries into Customize", async ({ page }) => {
  await page.goto("/templates/laurel-crest");
  await page.getByRole("radiogroup", { name: "Colour" }).first().getByRole("radio", { name: "Navy & gold" }).click();
  await expect(page).toHaveURL(/palette=navy/);
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/create\/laurel-crest/);
});

test("an earlier draft is offered back", async ({ context }) => {
  const first = await context.newPage();
  await first.goto("/create/delft-garland");
  await first.getByLabel("First name").fill("Nour");
  await first.getByLabel("Second name").fill("Karim");
  await expect.poll(() => first.evaluate(() => localStorage.getItem("vellum:try-draft:v1") ?? "")).toContain("Karim");

  const second = await context.newPage();
  await second.goto("/create/moonlit");
  await expect(second.getByRole("heading", { name: "You already have a draft" })).toBeVisible();
  await expect(second.getByText("Nour & Karim · Delft Garland")).toBeVisible();
  await second.getByRole("button", { name: "Edit draft" }).click();
  await expect(second).toHaveURL(/\/create\/delft-garland/);
});

test("wedding websites gallery and a design opened as a website", async ({ page }) => {
  await page.goto("/websites");
  await expect(page.getByRole("heading", { name: "Wedding websites", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Cinematic", exact: true }).click();
  await expect(page).toHaveURL(/\/templates\/cinematic\?view=website/);
  await expect(page.frameLocator("iframe").first().locator("[data-section=hero]")).toBeAttached();
});
