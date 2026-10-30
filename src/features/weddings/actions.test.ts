import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const getCurrentUser = vi.fn();
vi.mock("@/features/auth/session", () => ({ getCurrentUser: () => getCurrentUser() }));

type InsertResult = { data: { id: string } | null; error: { code: string; message: string } | null };
const insertResults: InsertResult[] = [];
const inserted: Record<string, unknown>[] = [];
let weddingCount = 0;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        inserted.push(row);
        const result = insertResults.shift() ?? { data: { id: "new-id" }, error: null };
        return { select: () => ({ single: async () => result }) };
      },
      // count query (draft cap, chained .eq().eq().is().is()) and the settings
      // lookup used while seeding — a chainable builder that resolves to a count.
      select: () => {
        const q: Record<string, unknown> = { count: weddingCount, error: null, single: async () => ({ data: null, error: null }) };
        q.eq = () => q;
        q.is = () => q;
        return q;
      },
    }),
  }),
}));

const { createWedding } = await import("./actions");

const valid = { partnerOne: "Andrew", partnerTwo: "Mariam", weddingDate: "2027-06-12", templateId: "swan-lake" };

beforeEach(() => {
  getCurrentUser.mockResolvedValue({ id: "user-1" });
  insertResults.length = 0;
  inserted.length = 0;
  weddingCount = 0;
});

describe("createWedding", () => {
  it("creates a wedding with a readable but unguessable slug owned by the current user", async () => {
    const result = await createWedding(valid);
    expect(result).toEqual({ ok: true, data: { id: "new-id" } });
    expect(inserted[0]).toMatchObject({
      owner_id: "user-1",
      slug: expect.stringMatching(/^andrew-and-mariam-[a-z0-9]{6}$/),
      partner_one_name: "Andrew",
      partner_two_name: "Mariam",
      wedding_date: "2027-06-12",
      template_id: "swan-lake",
    });
    // status/published_at are never sent by the client (DB also forbids it)
    expect(inserted[0]).not.toHaveProperty("status");
  });

  it("retries with a new random suffix when the slug is taken", async () => {
    insertResults.push({ data: null, error: { code: "23505", message: "duplicate" } });
    const result = await createWedding(valid);
    expect(result.ok).toBe(true);
    // Only the wedding-row inserts (the starter sections/events are also inserted on success).
    const weddingRows = inserted.filter((r): r is Record<string, unknown> => !Array.isArray(r) && typeof r === "object" && r !== null && "owner_id" in r);
    expect(weddingRows).toHaveLength(2);
    expect(weddingRows[1].slug).toMatch(/^andrew-and-mariam-[a-z0-9]{6}$/);
    expect(weddingRows[1].slug).not.toBe(weddingRows[0].slug);
  });

  it("gives up after repeated collisions", async () => {
    for (let i = 0; i < 5; i++) insertResults.push({ data: null, error: { code: "23505", message: "duplicate" } });
    const result = await createWedding(valid);
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(5);
  });

  it("does not retry on other database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    insertResults.push({ data: null, error: { code: "42501", message: "rls" } });
    const result = await createWedding(valid);
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(1);
  });

  it("uses a generated slug for names without a Latin form", async () => {
    await createWedding({ ...valid, partnerOne: "أندرو", partnerTwo: "مريم" });
    expect(inserted[0].slug).toMatch(/^wedding-[a-z0-9]{6}$/);
    expect(inserted[0].partner_one_name).toBe("أندرو");
  });

  it("allows an undecided date", async () => {
    await createWedding({ ...valid, weddingDate: null });
    expect(inserted[0].wedding_date).toBeNull();
  });

  it("rejects invalid input without touching the database", async () => {
    const result = await createWedding({ ...valid, partnerOne: "  ", weddingDate: "12/06/2027" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.partnerOne).toBeDefined();
      expect(result.fieldErrors?.weddingDate).toBeDefined();
    }
    expect(inserted).toHaveLength(0);
  });

  it("rejects unknown templates", async () => {
    const result = await createWedding({ ...valid, templateId: "does-not-exist" });
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(0);
  });

  it("requires a signed-in user", async () => {
    getCurrentUser.mockResolvedValue(null);
    const result = await createWedding(valid);
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(0);
  });

  it("caps drafts in progress per account", async () => {
    weddingCount = 1;
    const result = await createWedding(valid);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/one invitation in progress/i);
    expect(inserted).toHaveLength(0);
  });
});
