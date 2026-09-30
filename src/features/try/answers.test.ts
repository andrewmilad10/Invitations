import { describe, expect, it } from "vitest";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { publicMediaUrl } from "@/features/media/urls";
import { getTemplateManifest } from "@/templates/registry";
import { draftToCreate, emptyAnswers, hasProgress, localPhotos, parseAnswers, previewBundle, withTemplate, type TryAnswers } from "./answers";

const romantic = getTemplateManifest("romantic")!;
const NOW = new Date("2026-09-30T12:00:00Z");
const model = (a: TryAnswers) =>
  buildInvitationModel(previewBundle(a, getTemplateManifest(a.templateId)!, NOW), getTemplateManifest(a.templateId)!, { mode: "preview", mediaUrl: publicMediaUrl });

describe("try-flow answers", () => {
  it("an untouched draft previews as the finished demo wedding", () => {
    const m = model(emptyAnswers("romantic"));
    expect(m.wedding.coupleName).toBe("Emma & James");
    expect(m.events.ceremony?.venueName).toBe("St. Mary's Church");
    expect(m.media.hero?.url).toContain("images.unsplash.com");
    expect(m.media.gallery.length).toBeGreaterThan(0);
  });

  it("answers replace the demo live, field by field", () => {
    const a: TryAnswers = {
      ...emptyAnswers("romantic"),
      partnerOne: "Mariam",
      partnerTwo: "Andrew",
      date: "2027-05-20",
      ceremony: { venue: "St. Mark's Cathedral", address: "Abbassia, Cairo", time: "17:00" },
    };
    const m = model(a);
    expect(m.wedding.coupleName).toBe("Mariam & Andrew");
    expect(m.wedding.weddingDate).toBe("2027-05-20");
    expect(m.events.ceremony?.venueName).toBe("St. Mark's Cathedral");
    expect(m.events.ceremony?.timeLabel).toMatch(/^5:00\s?pm$/i); // Cairo time
    expect(m.events.ceremony?.description).toBeNull(); // demo notes don't leak onto their venue
  });

  it("saving uses only the visitor's own answers — never demo content", () => {
    const a: TryAnswers = { ...emptyAnswers("romantic"), partnerOne: "Mariam", partnerTwo: "Andrew" };
    const d = draftToCreate(a, romantic);
    expect(d).toMatchObject({ partnerOne: "Mariam", partnerTwo: "Andrew", weddingDate: null, events: [], libraryPhotos: [] });
    expect(JSON.stringify(d)).not.toMatch(/Emma|James|St\. Mary|Garden Estate/);
  });

  it("stores event times in the chosen time zone", () => {
    const a: TryAnswers = { ...emptyAnswers("romantic", "Africa/Cairo"), date: "2027-06-12", reception: { venue: "Nile Ritz", address: "", time: "19:30" } };
    expect(draftToCreate(a, romantic).events).toEqual([{ kind: "reception", venueName: "Nile Ritz", address: null, startsAt: "2027-06-12T16:30:00.000Z" }]);
  });

  it("switching template keeps every answer and resets only the palette", () => {
    const a: TryAnswers = { ...emptyAnswers("romantic"), partnerOne: "Nour", palette: "peony" };
    const b = withTemplate(a, "modern");
    expect(b).toMatchObject({ templateId: "modern", partnerOne: "Nour", palette: null });
  });

  it("palettes apply only if they belong to the template", () => {
    expect(draftToCreate({ ...emptyAnswers("romantic"), palette: "peony" }, romantic).theme.colors?.accent).toBe("#a45a74");
    expect(draftToCreate({ ...emptyAnswers("romantic"), palette: "midnight" }, romantic).theme).toEqual({});
  });

  it("separates library photos (saved directly) from local files (uploaded after signup)", () => {
    const a: TryAnswers = {
      ...emptyAnswers("romantic"),
      photos: {
        hero: { source: "local", key: "k1", name: "us.jpg", width: 100, height: 80 },
        gallery: [{ source: "library", id: "rings" }, { source: "local", key: "k2", name: "b.jpg", width: 10, height: 10 }],
      },
    };
    expect(draftToCreate(a, romantic).libraryPhotos).toEqual([{ purpose: "gallery", id: "rings", sort: 0 }]);
    expect(localPhotos(a).map((p) => [p.purpose, p.ref.key, p.sort])).toEqual([["hero", "k1", 0], ["gallery", "k2", 1]]);
    // The browser resolves local files to blob: URLs; unresolvable ones are simply not shown.
    const resolve = (p: string) => (p === "local:k1" ? "blob:http://localhost/abc" : publicMediaUrl(p));
    const withBlob = buildInvitationModel(previewBundle(a, romantic, NOW), romantic, { mode: "preview", mediaUrl: resolve });
    expect(withBlob.media.hero?.url).toBe("blob:http://localhost/abc");
    expect(withBlob.media.gallery).toHaveLength(1);
    expect(model(a).media.hero).toBeNull();
  });

  it("rejects tampered or outdated stored drafts", () => {
    expect(parseAnswers({ ...emptyAnswers("romantic"), v: 0 })).toBeNull();
    expect(parseAnswers({ ...emptyAnswers("romantic"), photos: { hero: { source: "library", id: "evil" }, gallery: [] } })).toBeNull();
    expect(parseAnswers(emptyAnswers("romantic"))).not.toBeNull();
  });

  it("knows when there is something worth saving", () => {
    expect(hasProgress(emptyAnswers("romantic"))).toBe(false);
    expect(hasProgress({ ...emptyAnswers("romantic"), partnerTwo: "Omar" })).toBe(true);
  });
});
