import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const getCurrentUser = vi.fn();
vi.mock("@/features/auth/session", () => ({ getCurrentUser: () => getCurrentUser() }));
const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ rpc }) }));

const { saveDraftAsWedding } = await import("./actions");
import type { DraftToCreate } from "./answers";

const valid: DraftToCreate = {
  templateId: "swan-lake",
  partnerOne: "Mariam",
  partnerTwo: "Andrew",
  weddingDate: "2027-05-20",
  locale: "en",
  timezone: "Africa/Cairo",
  theme: { colors: { accent: "#a45a74" } },
  events: [{ kind: "ceremony", venueName: "St. Mark", address: null, startsAt: "2027-05-20T14:00:00.000Z" }],
  libraryPhotos: [{ purpose: "hero", id: "couple", sort: 0 }],
};

beforeEach(() => {
  rpc.mockReset().mockResolvedValue({ data: "new-wedding-id", error: null });
  getCurrentUser.mockResolvedValue({ id: "u1" });
});

describe("saveDraftAsWedding", () => {
  it("saves a valid draft in one call with a readable slug", async () => {
    expect(await saveDraftAsWedding(valid)).toEqual({ ok: true, data: { id: "new-wedding-id" } });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("create_wedding_from_draft", { p_draft: expect.objectContaining({ slug: "mariam-and-andrew", partnerOne: "Mariam" }) });
  });

  it("requires a signed-in user", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await saveDraftAsWedding(valid)).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["unknown template", { templateId: "nope" }],
    ["missing name", { partnerTwo: " " }],
    ["bad time zone", { timezone: "Mars/Base" }],
    ["CSS in a color", { theme: { colors: { accent: "red;background:url(x)" } } }],
    ["unknown theme key", { theme: { script: "x" } }],
    ["two main photos", { libraryPhotos: [{ purpose: "hero", id: "couple", sort: 0 }, { purpose: "hero", id: "rings", sort: 1 }] }],
    ["unknown library photo", { libraryPhotos: [{ purpose: "hero", id: "https://evil", sort: 0 }] }],
    ["duplicate events", { events: [valid.events[0], valid.events[0]] }],
  ])("rejects %s before touching the database", async (_label, patch) => {
    expect((await saveDraftAsWedding({ ...valid, ...(patch as Partial<DraftToCreate>) })).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("keeps the draft when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    const r = await saveDraftAsWedding(valid);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/draft is still here/);
  });
});
