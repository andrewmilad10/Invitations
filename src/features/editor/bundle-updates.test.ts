import { describe, expect, it } from "vitest";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { cinematicManifest } from "@/templates/cinematic/manifest";
import { editorialManifest } from "@/templates/editorial/manifest";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import * as u from "./bundle-updates";

const base = () => {
  const b = sampleBundle("cinematic", new Date("2026-09-30T00:00:00Z"));
  b.settings.timezone = "Africa/Cairo";
  return b;
};
const model = (b: ReturnType<typeof base>, t = cinematicManifest) => buildInvitationModel(b, t, { mode: "preview", mediaUrl: sampleMediaUrl });

describe("editor bundle updates", () => {
  it("never mutates the previous bundle", () => {
    const b = base();
    const snapshot = structuredClone(b);
    u.setDetails(b, { partnerOne: "X", partnerTwo: "Y", weddingDate: null });
    u.setSection(b, "story", { content: { heading: "H" } });
    u.setEvent(b, "ceremony", { title: "", date: null, time: null, venueName: "", address: "", mapUrl: "", description: "" });
    expect(b).toEqual(snapshot);
  });

  it("name changes flow straight into the rendered model", () => {
    const b = u.setDetails(base(), { partnerOne: "Andrew", partnerTwo: "Mariam", weddingDate: "2027-06-12" });
    expect(model(b).wedding.coupleName).toBe("Andrew & Mariam");
  });

  it("section edits create sparse rows without a sort order", () => {
    const b = u.setSection(base(), "closing", { content: { heading: "See you!" } });
    expect(b.sections.find((s) => s.type === "closing")).toMatchObject({ enabled: true, sort_order: null });
  });

  it("reordering and resetting the order", () => {
    const rest = cinematicManifest.defaultSectionOrder.filter((t) => t !== "hero" && t !== "gallery");
    const b = u.setSectionOrder(base(), ["hero", "gallery", ...rest]);
    expect(model(b).sections.slice(0, 3).map((s) => s.type)).toEqual(["hero", "gallery", "couple"]);
    const reset = u.setSectionOrder(b, null);
    expect(model(reset).sections.slice(0, 3).map((s) => s.type)).toEqual(["hero", "couple", "date"]);
  });

  it("stores event times in the wedding's time zone", () => {
    const b = u.setEvent(base(), "ceremony", {
      title: "Ceremony", date: "2027-06-12", time: "17:00", venueName: "St. Mark", address: "", mapUrl: "", description: "",
    });
    expect(b.events.find((e) => e.kind === "ceremony")?.starts_at).toBe("2027-06-12T14:00:00.000Z");
  });

  it("clearing an event removes it (and its section disappears)", () => {
    const b = u.setEvent(base(), "reception", { title: "", date: null, time: null, venueName: "", address: "", mapUrl: "", description: "" });
    expect(b.events.some((e) => e.kind === "reception")).toBe(false);
    expect(model(b).sections.some((s) => s.type === "reception")).toBe(false);
  });

  it("hero and music are single-slot; gallery accumulates", () => {
    const media = (id: string, purpose: "hero" | "gallery") => ({ id, kind: "image" as const, purpose, storage_path: `/${id}.jpg`, alt_text: "", width: 1, height: 1, sort_order: 0 });
    let b = u.addMedia(base(), media("h2", "hero"));
    expect(b.media.filter((m) => m.purpose === "hero").map((m) => m.id)).toEqual(["h2"]);
    const galleryBefore = b.media.filter((m) => m.purpose === "gallery").length;
    b = u.addMedia(b, media("g9", "gallery"));
    expect(b.media.filter((m) => m.purpose === "gallery")).toHaveLength(galleryBefore + 1);
  });

  it("switching templates keeps all content", () => {
    const edited = u.setSection(base(), "countdown", { content: { heading: "Soon" } });
    const switched = u.setTemplate(edited, "editorial");
    expect(switched.sections).toEqual(edited.sections);
    expect(model(switched, editorialManifest).sections.some((s) => s.type === "countdown")).toBe(false);
    expect(model(u.setTemplate(switched, "cinematic")).sections.find((s) => s.type === "countdown")?.content).toEqual({ heading: "Soon" });
  });
});
