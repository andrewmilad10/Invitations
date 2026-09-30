import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAnswers, type TryAnswers } from "./answers";

let stored: TryAnswers | null = null;
const files = new Map<string, Blob>();
vi.mock("./draft-store", () => ({
  draftStore: { get: () => stored, clear: () => (stored = null) },
  draftFiles: { get: async (k: string) => files.get(k), clear: async () => files.clear() },
}));
const save = vi.fn();
vi.mock("./actions", () => ({ saveDraftAsWedding: (d: unknown) => save(d) }));
const upload = vi.fn();
vi.mock("@/features/editor/upload", () => ({ uploadMedia: (...args: unknown[]) => upload(...args) }));

const { transferDraft } = await import("./transfer");

const draft = (): TryAnswers => ({
  ...emptyAnswers("romantic"),
  partnerOne: "Mariam",
  partnerTwo: "Andrew",
  photos: {
    hero: { source: "local", key: "h", name: "us.jpg", width: 10, height: 10 },
    gallery: [{ source: "library", id: "rings" }, { source: "local", key: "g", name: "g.jpg", width: 10, height: 10 }],
  },
});

beforeEach(() => {
  stored = draft();
  files.clear();
  files.set("h", new Blob(["h"], { type: "image/jpeg" }));
  files.set("g", new Blob(["g"], { type: "image/jpeg" }));
  save.mockReset().mockResolvedValue({ ok: true, data: { id: "w1" } });
  upload.mockReset().mockResolvedValue({ ok: true });
});

describe("transferDraft", () => {
  it("saves the draft, uploads browser photos to the new wedding, then clears the draft", async () => {
    expect(await transferDraft()).toEqual({ ok: true, weddingId: "w1", photosNotSaved: 0 });
    expect(save.mock.calls[0][0]).toMatchObject({ partnerOne: "Mariam", libraryPhotos: [{ purpose: "gallery", id: "rings", sort: 0 }] });
    expect(upload.mock.calls.map((c) => [c[0], c[1], (c[2] as File).name])).toEqual([["w1", "hero", "us.jpg"], ["w1", "gallery", "g.jpg"]]);
    expect(stored).toBeNull();
    expect(files.size).toBe(0);
  });

  it("keeps the draft if saving fails", async () => {
    save.mockResolvedValue({ ok: false, error: "nope" });
    expect(await transferDraft()).toEqual({ ok: false, error: "nope" });
    expect(stored).not.toBeNull();
    expect(files.size).toBe(2);
    expect(upload).not.toHaveBeenCalled();
  });

  it("reports photos that couldn't be uploaded without failing the save", async () => {
    files.delete("g");
    upload.mockResolvedValueOnce({ ok: false, error: "x" });
    expect(await transferDraft()).toEqual({ ok: true, weddingId: "w1", photosNotSaved: 2 });
  });

  it("a double click creates one wedding", async () => {
    const [a, b] = await Promise.all([transferDraft(), transferDraft()]);
    expect(a).toEqual(b);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a draft", async () => {
    stored = null;
    expect((await transferDraft()).ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });
});
