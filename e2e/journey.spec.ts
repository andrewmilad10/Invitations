import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import pg from "pg";
import { totp } from "./support/totp";

/**
 * The whole business, end to end, against a real local Supabase (database,
 * Auth and API) and the production build of the app:
 *
 *   couple registers → creates an invitation → presses Publish → order is
 *   "Payment pending" and guests can't see it → staff log in, set up
 *   two-step login, find the order and mark it paid → guests see the
 *   invitation, and the couple's dashboard shows how long it's live.
 *
 * Plus the API itself, called directly the way an attacker would: no
 * session, the couple's session against staff functions, writing to
 * protected columns. Runs in CI (.github/workflows/e2e.yml) with:
 *   E2E_BASE_URL, E2E_SUPABASE_URL, E2E_SUPABASE_KEY, E2E_DB_URL
 */

const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set (see .github/workflows/e2e.yml)`);
  return v;
};
const SUPABASE_URL = () => env("E2E_SUPABASE_URL");
const SUPABASE_KEY = () => env("E2E_SUPABASE_KEY");

const run = Date.now().toString(36);
const couple = { name: "Laila Mansour", email: `laila-${run}@example.test`, password: "Laila-wedding-2027!" };
const staff = { name: "Omar Staff", email: `omar-${run}@example.test`, password: "Omar-admin-2027!" };

async function sql<T = Record<string, unknown>>(text: string, values: unknown[] = []): Promise<T[]> {
  const db = new pg.Client({ connectionString: env("E2E_DB_URL") });
  await db.connect();
  try {
    return (await db.query(text, values)).rows as T[];
  } finally {
    await db.end();
  }
}

async function logIn(page: Page, who: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(who.email);
  await page.getByLabel("Password").fill(who.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** The couple's own access token, straight from Supabase Auth (as a script would get it). */
async function token(request: APIRequestContext, who: { email: string; password: string }) {
  const r = await request.post(`${SUPABASE_URL()}/auth/v1/token?grant_type=password`, {
    headers: { apikey: SUPABASE_KEY() },
    data: { email: who.email, password: who.password },
  });
  expect(r.ok()).toBe(true);
  return ((await r.json()) as { access_token: string }).access_token;
}
const api = (request: APIRequestContext, path: string, init: { method?: string; bearer?: string; data?: unknown } = {}) =>
  request.fetch(`${SUPABASE_URL()}${path}`, {
    method: init.method ?? "POST",
    headers: { apikey: SUPABASE_KEY(), Authorization: `Bearer ${init.bearer ?? SUPABASE_KEY()}`, "Content-Type": "application/json", Prefer: "return=representation" },
    data: init.data ?? {},
  });

/** Collects Content-Security-Policy violations on a page (there should be none). */
async function watchCsp(page: Page) {
  const seen: string[] = [];
  page.on("console", (m) => m.text().startsWith("CSP-VIOLATION") && seen.push(m.text()));
  await page.addInitScript(() =>
    document.addEventListener("securitypolicyviolation", (e) => console.error(`CSP-VIOLATION ${e.violatedDirective} ${e.sourceFile}`)),
  );
  return seen;
}

test.describe.serial("Vellum, end to end", () => {
  let editorUrl = "";
  let weddingId = "";
  let slug = "";
  let orderNumber = "";

  test("signed-out visitors are sent to log in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await page.goto("/admin/orders");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Forders/);
  });

  test("health check answers", async ({ request }) => {
    const r = await request.get("/api/health");
    expect(r.status()).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
  });

  test("a couple registers and creates an invitation", async ({ page }) => {
    const csp = await watchCsp(page);
    await page.goto("/register");
    await page.getByLabel("Your name").fill(couple.name);
    await page.getByLabel("Email").fill(couple.email);
    await page.getByLabel("Password").fill(couple.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("button", { name: /Laila/ })).toBeVisible(); // the shared header shows who's signed in

    await page.goto("/dashboard/new");
    await page.getByLabel("First name").fill("Laila");
    await page.getByLabel("Second name").fill("Karim");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Wedding date").fill("2027-06-12");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Create wedding" }).click();
    await expect(page).toHaveURL(/\/dashboard\/weddings\/[0-9a-f-]{36}$/);
    editorUrl = page.url();
    weddingId = editorUrl.split("/").pop()!;
    slug = (await sql<{ slug: string }>("select slug from public.weddings where id = $1", [weddingId]))[0].slug;
    expect(slug).toMatch(/^laila-and-karim-[a-z0-9]{6}$/);
    expect(csp).toEqual([]);
  });

  test("publishing places an order; guests can't see it before payment", async ({ page, request }) => {
    const csp = await watchCsp(page);
    await logIn(page, couple);
    await page.goto(`${editorUrl}?panel=publish`);
    await expect(page.getByRole("heading", { name: "Ready to share?" })).toBeVisible();
    await page.getByLabel("Your WhatsApp number").fill("0100 123 4567");
    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(page.getByRole("heading", { name: "Waiting for payment" })).toBeVisible();
    orderNumber = (await page.getByText(/^Order #\d+ is placed/).textContent())!.match(/#(\d+)/)![1];
    expect(Number(orderNumber)).toBeGreaterThanOrEqual(1001);

    const guest = await request.get(`/w/${slug}`);
    expect(guest.status()).toBe(404);

    await page.goto("/dashboard");
    await expect(page.getByText(`Waiting for payment · Order #${orderNumber}`)).toBeVisible();
    expect(csp).toEqual([]);
  });

  test("the API refuses what the screens don't offer", async ({ request }) => {
    // No session at all.
    expect((await api(request, "/rest/v1/rpc/admin_list_orders", { data: { p_tab: "all", p_search: null, p_limit: 10, p_offset: 0 } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, "/rest/v1/rpc/request_publish", { data: { p_wedding: weddingId, p_phone: "01001234567", p_method: "instapay" } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, "/rest/v1/orders?select=*", { method: "GET" })).status()).toBeGreaterThanOrEqual(400);

    // The couple's own session against staff functions and protected data.
    const bearer = await token(request, couple);
    expect((await api(request, "/rest/v1/rpc/admin_list_orders", { bearer, data: { p_tab: "all", p_search: null, p_limit: 10, p_offset: 0 } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, "/rest/v1/rpc/admin_overview", { bearer, data: { p_days: 30 } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, `/rest/v1/orders?wedding_id=eq.${weddingId}`, { method: "PATCH", bearer, data: { status: "paid" } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, `/rest/v1/weddings?id=eq.${weddingId}`, { method: "PATCH", bearer, data: { status: "published" } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, `/rest/v1/weddings?id=eq.${weddingId}`, { method: "PATCH", bearer, data: { active_until: "2099-01-01T00:00:00Z" } })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, "/rest/v1/order_events?select=*", { method: "GET", bearer })).status()).toBeGreaterThanOrEqual(400);
    expect((await api(request, "/rest/v1/platform_staff?select=*", { method: "GET", bearer })).status()).toBeGreaterThanOrEqual(400);
    // Staff notes and tags on their own order stay hidden.
    expect((await api(request, "/rest/v1/orders?select=note,tags", { method: "GET", bearer })).status()).toBeGreaterThanOrEqual(400);
    // What they may read: their own order's number and status.
    const own = await api(request, "/rest/v1/orders?select=number,status", { method: "GET", bearer });
    expect(own.status()).toBe(200);
    expect(await own.json()).toEqual([{ number: Number(orderNumber), status: "pending" }]);
  });

  test("another couple can't open this invitation", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/register");
    await page.getByLabel("Your name").fill("Someone Else");
    await page.getByLabel("Email").fill(`other-${run}@example.test`);
    await page.getByLabel("Password").fill("Someone-else-2027!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto(editorUrl);
    await expect(page.getByRole("heading", { name: /couldn.t find that wedding/i })).toBeVisible();
    const admin = await page.goto("/admin");
    expect(admin?.status()).toBe(404);
    await ctx.close();
  });

  test("staff set up two-step login and mark the order paid", async ({ browser, request }) => {
    const signup = await request.post(`${SUPABASE_URL()}/auth/v1/signup`, {
      headers: { apikey: SUPABASE_KEY() },
      data: { email: staff.email, password: staff.password, data: { full_name: staff.name } },
    });
    expect(signup.ok()).toBe(true);
    await sql("insert into public.platform_staff (user_id, role) select id, 'owner' from auth.users where email = $1", [staff.email]);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const csp = await watchCsp(page);
    await logIn(page, staff);

    // Admin first asks for the authenticator app.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/verify$/);
    await page.getByRole("button", { name: "Set up two-step login" }).click();
    const secret = (await page.locator("code").filter({ hasText: /^[A-Z2-7]{16,}$/ }).textContent())!.trim();
    await page.getByLabel("6-digit code").fill(totp(secret));
    await page.getByRole("button", { name: "Turn on and continue" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Waiting for payment")).toBeVisible();

    // The order, in Payment pending.
    await page.goto("/admin/orders?tab=pending");
    await page.getByRole("link", { name: new RegExp(`#${orderNumber}`) }).click();
    await expect(page.getByRole("heading", { name: `#${orderNumber}` })).toBeVisible();
    await expect(page.getByText("Payment pending").first()).toBeVisible();

    // A staff comment appears at once.
    await page.getByLabel("Leave a comment").fill("Called Laila, paying by InstaPay today.");
    await page.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText("Called Laila, paying by InstaPay today.")).toBeVisible();

    await page.getByRole("button", { name: "Mark as paid" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Reference/).fill(`IP-E2E-${run}`);
    await dialog.getByRole("button", { name: "Mark as paid" }).click();
    await expect(page.getByText(new RegExp(`Order #${orderNumber} is paid`))).toBeVisible();
    await page.reload();
    await expect(page.getByText("Paid", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/The invitation is live until/)).toBeVisible();
    expect(csp).toEqual([]);
    await ctx.close();
  });

  test("guests see the invitation once it's paid, and the couple sees how long", async ({ page, browser }) => {
    const guestCtx = await browser.newContext();
    const guest = await guestCtx.newPage();
    const res = await guest.goto(`/w/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(guest).toHaveTitle(/Laila & Karim/);
    await guestCtx.close();

    await logIn(page, couple);
    await expect(page.getByText(/Live until .* days left/)).toBeVisible();
  });
});
