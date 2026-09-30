import { expect, test } from "@playwright/test";

test("sample invitation opens on a phone without horizontal scroll", async ({ page }) => {
  await page.goto("/templates/cinematic/preview");
  await page.getByRole("button", { name: "Open invitation" }).click();
  await expect(page.locator("[data-opening]")).toHaveCount(0, { timeout: 10_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
