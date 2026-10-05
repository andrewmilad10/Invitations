import { expect, test } from "@playwright/test";

/** The design gallery and design pages (no database needed). */

// The invitation card gallery is paused (coming soon); re-enable with it.
test.skip("filters, colours and saved designs in the gallery", async ({ page }) => {
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
  await expect(count).toHaveText(/of 1 result$/);
});

test("card page: colour and finish carry into Customize", async ({ page }) => {
  await page.goto("/templates/laurel-crest"); // old address → the card's own page
  await expect(page).toHaveURL(/\/invitations\/laurel-crest/);
  await page.getByRole("radiogroup", { name: "Colour" }).first().getByRole("radio", { name: "Navy & gold" }).click();
  await expect(page).toHaveURL(/palette=navy/);
  await page.getByRole("radiogroup", { name: "Foil colour" }).getByRole("radio", { name: "Gold", exact: true }).click();
  await page.getByRole("radiogroup", { name: "Silhouette" }).getByRole("radio", { name: "Scalloped" }).click();
  await expect(page).toHaveURL(/foil=gold/);
  await expect(page).toHaveURL(/silhouette=scalloped/);
  for (const view of ["Back", "Envelope", "Suite", "Close-up"]) await page.getByRole("tab", { name: view }).click();
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/invitations\/laurel-crest\/customize\?.*foil=gold/);
  // The studio opens with the chosen finish.
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Gold", exact: true })).toHaveAttribute("aria-checked", "true");
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
  // Only websites here — card designs live in their own collection.
  await expect(page.getByRole("link", { name: "Marlowe", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "The Gate", exact: true }).click();
  await expect(page).toHaveURL(/\/websites\/the-gate/);
  await expect(page.frameLocator("iframe").first().locator("[data-section=hero]")).toBeAttached();
});

test("card studio: the desk, Arabic, and sending — no RSVP, similar designs stay cards", async ({ page }) => {
  await page.goto("/invitations/rose-arch");
  // Similar designs open card pages, never the website builder.
  const similar = page.locator("section", { hasText: "similar" }).getByRole("link", { name: "Customize" }).first();
  await expect(similar).toHaveAttribute("href", /^\/invitations\/[a-z0-9-]+\/customize/);
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/invitations\/rose-arch\/customize/);
  await expect(page.getByRole("button", { name: "RSVP" })).toHaveCount(0);
  await page.getByLabel("First name").fill("Nour");
  await page.getByRole("button", { name: "Turn over" }).click();
  await expect(page.getByRole("button", { name: "Turn back" })).toBeVisible();
  await page.getByRole("button", { name: "Details card" }).click();
  await page.getByRole("button", { name: "Envelope", exact: true }).click();
  await page.getByRole("button", { name: "Undo" }).click();
  // Arabic: the card turns right to left with Arabic wording.
  await page.getByRole("radio", { name: "عربي" }).click();
  await expect(page.locator('[lang="ar"][dir="rtl"]').first()).toBeAttached();
  await page.getByRole("button", { name: "أرسل" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "تنزيل كل القطع" })).toBeVisible();
});

test("the invitation card gallery says coming soon", async ({ page }) => {
  await page.goto("/invitations");
  await expect(page.getByRole("heading", { name: "Coming soon" })).toBeVisible();
  await page.getByRole("link", { name: "Browse wedding websites" }).click();
  await expect(page).toHaveURL(/\/websites$/);
});
