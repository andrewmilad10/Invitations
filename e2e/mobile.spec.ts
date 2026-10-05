import { expect, test } from "@playwright/test";

test("sample invitation opens on a phone without horizontal scroll", async ({ page }) => {
  await page.goto("/templates/the-gate/preview");
  await page.getByRole("button", { name: "Open invitation" }).first().click({ force: true });
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
