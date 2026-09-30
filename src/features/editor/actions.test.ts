import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const getCurrentUser = vi.fn();
vi.mock("@/features/auth/session", () => ({ getCurrentUser: () => getCurrentUser() }));

// Any database access in these tests is a failure: they cover the guards that
// must reject input before it reaches Postgres.
const dbCalls: string[] = [];
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () =>
    new Proxy({}, { get: (_t, prop) => { if (prop === "then") return undefined; dbCalls.push(String(prop)); throw new Error(`unexpected db access: ${String(prop)}`); } }),
}));

const actions = await import("./actions");
const W = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  dbCalls.length = 0;
  getCurrentUser.mockResolvedValue({ id: "u1" });
});

describe("editor action guards", () => {
  it("reject signed-out users and malformed ids", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await actions.updateDetails(W, { partnerOne: "A", partnerTwo: "B", weddingDate: null })).ok).toBe(false);
    getCurrentUser.mockResolvedValue({ id: "u1" });
    expect((await actions.updateDetails("not-a-uuid", { partnerOne: "A", partnerTwo: "B", weddingDate: null })).ok).toBe(false);
  });

  it("reject empty names", async () => {
    const r = await actions.updateDetails(W, { partnerOne: "  ", partnerTwo: "B", weddingDate: null });
    expect(r.ok).toBe(false);
  });

  it("reject unknown sections, disabling the hero, and invalid content", async () => {
    expect((await actions.saveSection(W, "not-a-section", { enabled: true })).ok).toBe(false);
    expect((await actions.saveSection(W, "hero", { enabled: false })).ok).toBe(false);
    expect((await actions.saveSection(W, "story", { content: { body: 123 } })).ok).toBe(false);
    expect((await actions.saveSection(W, "story", { content: { body: "x".repeat(5000) } })).ok).toBe(false);
    expect((await actions.saveSection(W, "story", { style: { tone: "neon" } })).ok).toBe(false);
    expect((await actions.saveSection(W, "story", { style: { tone: "dark", css: "x" } })).ok).toBe(false);
  });

  it("reject invalid theme overrides (including CSS injection)", async () => {
    expect((await actions.updateTheme(W, { colors: { accent: "red;background:url(x)" } })).ok).toBe(false);
    expect((await actions.updateTheme(W, { unknownKey: 1 })).ok).toBe(false);
  });

  it("reject unknown templates and invalid slugs", async () => {
    expect((await actions.updateTemplate(W, "nope")).ok).toBe(false);
    expect((await actions.updateSlug(W, "admin")).ok).toBe(false);
    expect((await actions.updateSlug(W, "Has Spaces")).ok).toBe(false);
  });

  it("reject media paths outside the wedding's folder for that purpose", async () => {
    const base = { width: 10, height: 10, altText: "" };
    for (const storagePath of [
      `weddings/22222222-2222-4222-8222-222222222222/hero/a.jpg`,
      `weddings/${W}/gallery/a.jpg`,
      `weddings/${W}/hero/nested/a.jpg`,
      `../weddings/${W}/hero/a.jpg`,
    ]) {
      expect((await actions.registerMedia(W, { purpose: "hero", storagePath, ...base })).ok).toBe(false);
    }
  });

  it("reject non-https map links and bad times", async () => {
    const e = { kind: "ceremony" as const, title: "", date: "2027-06-12", venueName: "", address: "", description: "" };
    expect((await actions.saveEvent(W, { ...e, time: "17:00", mapUrl: "javascript:alert(1)" })).ok).toBe(false);
    expect((await actions.saveEvent(W, { ...e, time: "25:00", mapUrl: "" })).ok).toBe(false);
  });

  it("reject invalid settings", async () => {
    expect((await actions.updateSettings(W, { locale: "fr" as "en", timezone: "Africa/Cairo", visibility: "public", musicEnabled: false })).ok).toBe(false);
    expect((await actions.updateSettings(W, { locale: "en", timezone: "Mars/Olympus", visibility: "public", musicEnabled: false })).ok).toBe(false);
  });

  it("none of the above touched the database", () => {
    expect(dbCalls).toEqual([]);
  });
});
