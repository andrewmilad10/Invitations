import { expect, test, type Page } from "@playwright/test";

/**
 * The public site's main flows, on desktop and on a phone (no database
 * needed): navigation, the home page's interactive pieces, galleries, design
 * pages, the card studio, the try flow, auth forms and the 404 page.
 */

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 700;

/** Waits until the page is interactive (the motion engine starts after hydration). */
const waitForApp = (page: Page) => page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));

test("header navigation reaches every page", async ({ page }) => {
  await page.goto("/");
  const targets: [string, RegExp][] = [
    ["Invitation cards", /\/invitations$/],
    ["Wedding websites", /\/websites$/],
    ["Features", /\/#features$/],
    ["How it works", /\/#how-it-works$/],
  ];
  for (const [name, url] of targets) {
    if (isPhone(page)) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.locator("#mobile-menu")).toBeVisible();
      await page.locator("#mobile-menu").getByRole("link", { name, exact: true }).click();
      await expect(page.locator("#mobile-menu")).toBeHidden();
    } else {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true }).click();
    }
    await expect(page).toHaveURL(url);
  }
  if (isPhone(page)) {
    // Escape closes the menu.
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-menu")).toBeHidden();
  }
  await page.getByRole("link", { name: "Vellum" }).first().click();
  await expect(page).toHaveURL(/\/$/);
});

test("home: carousel, make-it-yours and the live demo", async ({ page }) => {
  await page.goto("/");
  const caption = page.locator(".carousel-caption");
  const first = await caption.textContent();
  await page.getByRole("button", { name: "Next design" }).click();
  await expect(caption).not.toHaveText(first ?? "");
  await page.getByRole("button", { name: "Previous design" }).click();
  await expect(caption).toHaveText(first ?? "");
  await caption.click();
  await expect(page).toHaveURL(/\/invitations\/[a-z0-9-]+$/);

  await page.goto("/");
  await waitForApp(page);
  await page.getByPlaceholder("Layla").fill("Salma");
  await page.getByPlaceholder("Omar").fill("Youssef");
  await page.getByRole("link", { name: "Continue with these details" }).click();
  await expect(page).toHaveURL(/\/create\/[a-z0-9-]+\?.*one=Salma.*two=Youssef/);
  await expect(page.getByLabel("First name")).toHaveValue("Salma");

  await page.goto("/");
  await page.getByRole("link", { name: "Preview the template" }).click();
  await expect(page).toHaveURL(/\/websites\/cinematic$/);
});

// Paused with the invitation card gallery (coming soon).
test.skip("gallery: quick view, show more and filters survive going back", async ({ page }) => {
  await page.goto("/invitations");
  const count = page.getByText(/^Showing /);
  await expect(count).toHaveText(/1–48 of \d+/);

  // Quick view (a hover action, so not on phones) opens and closes with Escape.
  if (!isPhone(page)) {
    await page.getByRole("button", { name: /Quick view/ }).first().click({ force: true });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }

  // Show more is kept in the URL, so a reload keeps every card.
  await page.getByRole("button", { name: "Show more designs" }).click();
  await expect(page).toHaveURL(/n=96/);
  await page.reload();
  await expect(count).not.toHaveText(/1–48 of/);

  // A filter, then a design, then back: the filter is still applied.
  await page.goto("/invitations?style=floral");
  await expect(page.getByRole("button", { name: "Floral", exact: true })).toHaveAttribute("aria-pressed", "true");
  const filtered = await count.textContent();
  await page.getByRole("link", { name: /^Open / }).first().click();
  await expect(page).toHaveURL(/\/invitations\/[a-z0-9-]+/);
  await page.goBack();
  await expect(page).toHaveURL(/style=floral/);
  await expect(count).toHaveText(filtered ?? "");
});

// Paused with the invitation card gallery (coming soon).
test.skip("a saved design stays saved across pages", async ({ page }) => {
  await page.goto("/invitations/velvet-tulips");
  await page.getByRole("button", { name: "Save Velvet Tulips" }).first().click();
  await expect(page.getByRole("button", { name: "Remove Velvet Tulips from saved designs" }).first()).toBeVisible();
  await page.goto("/invitations?saved=1");
  await expect(page.getByRole("heading", { name: "Velvet Tulips" })).toBeVisible();
});

test("card page: a shared link opens in its colour; views, share and variants work", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/invitations/velvet-tulips?palette=emerald&foil=silver");
  await expect(page.getByRole("radio", { name: "Emerald" }).first()).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("radio", { name: "Silver", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(page).toHaveURL(/palette=emerald/);
  for (const view of ["Back", "Envelope", "Suite", "Close-up", "Front"]) {
    await page.getByRole("tab", { name: view }).click();
    await expect(page.getByRole("tab", { name: view })).toHaveAttribute("aria-selected", "true");
  }
  if (!isPhone(page)) {
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
  }
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/invitations\/velvet-tulips\/customize\?.*palette=emerald/);
});

test("website page: colours and views change the live preview", async ({ page }) => {
  await page.goto("/websites/giza-at-dusk?palette=sunset");
  const frame = page.locator("iframe").first();
  await expect(page.getByRole("radio", { name: "Sunset terracotta" }).first()).toHaveAttribute("aria-checked", "true");
  await expect(frame).toHaveAttribute("src", /\/templates\/giza-at-dusk\/preview\/sunset$/);
  await page.getByRole("radio", { name: "Night & sand" }).first().click();
  await expect(frame).toHaveAttribute("src", /\/preview\/night-sand$/);
  await expect(page).toHaveURL(/palette=night-sand/);
  await page.getByRole("tab", { name: "Phone" }).click();
  await expect(page).toHaveURL(/view=phone/);
  await page.getByRole("link", { name: "Customize", exact: true }).first().click();
  await expect(page).toHaveURL(/\/create\/giza-at-dusk\?palette=night-sand/);
  // The full-screen preview renders the sample wedding.
  const res = await page.request.get("/templates/giza-at-dusk/preview/night-sand");
  expect(res.status()).toBe(200);
  expect((await page.request.get("/templates/giza-at-dusk/preview/not-a-palette")).status()).toBe(404);
});

test("card studio: words, colour, turn over and send", async ({ page }) => {
  await page.goto("/invitations/velvet-tulips/customize");
  const name = page.getByLabel("First name");
  await name.fill("Farida");
  await expect(page.getByText("Farida").first()).toBeVisible();
  await page.getByRole("button", { name: "Colour", exact: true }).click();
  await page.getByRole("button", { name: "Turn over" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("try flow: details reach the preview, and saving asks for an account", async ({ page }) => {
  await page.goto("/create/giza-at-dusk");
  await page.getByLabel("First name").fill("Nour");
  await page.getByLabel("Second name").fill("Karim");
  const preview = page.frameLocator('iframe[title="Invitation preview"]');
  if (!isPhone(page)) await expect(preview.locator("[data-section=hero] h1")).toContainText("Nour");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByLabel("Wedding date")).toBeVisible();
  await page.getByRole("button", { name: "Save invitation" }).first().click();
  await expect(page).toHaveURL(/\/register\?draft=1/);
  await page.getByRole("link", { name: /Exit|Back|Vellum/ }).first().isVisible();
});

test("auth forms validate before sending", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/register");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/register/);
});

test("unknown pages show a helpful 404", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await page.getByRole("link", { name: "See invitation cards" }).click();
  await expect(page).toHaveURL(/\/invitations$/);
});
