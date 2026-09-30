import { describe, expect, it } from "vitest";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { cinematicManifest } from "@/templates/cinematic/manifest";
import { editorialManifest } from "@/templates/editorial/manifest";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { buildInvitationModel } from "./build-model";
import { getSection } from "./model";

const NOW = new Date("2026-09-30T12:00:00Z");
const opts = { mode: "live" as const, mediaUrl: sampleMediaUrl };
const types = (b: WeddingBundle, t = cinematicManifest) => buildInvitationModel(b, t, opts).sections.map((s) => s.type);

function bundle(patch: (b: WeddingBundle) => void = () => {}): WeddingBundle {
  const b = structuredClone(sampleBundle("cinematic", NOW));
  patch(b);
  return b;
}

describe("buildInvitationModel", () => {
  it("derives the couple name and initials from partner names", () => {
    const m = buildInvitationModel(bundle((b) => {
      b.wedding.partner_one_name = " Andrew ";
      b.wedding.partner_two_name = "Mariam";
    }), cinematicManifest, opts);
    expect(m.wedding.coupleName).toBe("Andrew & Mariam");
    expect(m.wedding.initials).toEqual(["A", "M"]);
  });

  it("renders the same wedding with any template without changing the data", () => {
    const b = bundle();
    const snapshot = structuredClone(b);
    const cinematic = buildInvitationModel(b, cinematicManifest, opts);
    const editorial = buildInvitationModel(b, editorialManifest, opts);

    expect(b).toEqual(snapshot); // input untouched
    expect(cinematic.wedding).toEqual(editorial.wedding);
    expect(getSection(cinematic, "story")?.content).toEqual(getSection(editorial, "story")?.content);
    // Editorial doesn't support countdown/venue: hidden there, but still in the data.
    expect(types(b)).toContain("countdown");
    expect(types(b, editorialManifest)).not.toContain("countdown");
    expect(types(b, editorialManifest)).not.toContain("venue");
  });

  it("keeps content for unsupported sections so switching back restores it", () => {
    const b = bundle((x) => x.sections.push({ type: "countdown", enabled: true, sort_order: 30, content: { heading: "Soon!" } }));
    expect(getSection(buildInvitationModel(b, editorialManifest, opts), "countdown")).toBeUndefined();
    expect(getSection(buildInvitationModel(b, cinematicManifest, opts), "countdown")?.content.heading).toBe("Soon!");
  });

  it("applies template theme defaults, then the couple's overrides", () => {
    const b = bundle((x) => (x.theme.tokens = { colors: { accent: "#123456" }, fonts: { heading: "italiana" } }));
    const m = buildInvitationModel(b, cinematicManifest, opts);
    expect(m.theme.colors.accent).toBe("#123456");
    expect(m.theme.colors.background).toBe(cinematicManifest.themeDefaults.colors.background);
    expect(m.theme.fonts.heading).toBe("italiana");
    expect(m.cssVars["--inv-accent"]).toBe("#123456");
  });

  it("ignores invalid theme values instead of failing", () => {
    const b = bundle((x) => (x.theme.tokens = { colors: { accent: "red; background:url(evil)" }, fonts: { heading: "comic-sans" }, radius: 999 }));
    const m = buildInvitationModel(b, cinematicManifest, opts);
    expect(m.theme).toEqual({ ...cinematicManifest.themeDefaults, photoTone: "natural" });
  });

  it("orders sections by template default, overridden by a saved custom order", () => {
    expect(types(bundle()).slice(0, 3)).toEqual(["hero", "couple", "date"]);
    const custom = ["hero", "gallery", ...cinematicManifest.defaultSectionOrder.filter((t) => t !== "hero" && t !== "gallery")];
    const moved = bundle((x) => {
      x.sections = custom.map((type, i) => ({ type, enabled: true, sort_order: (i + 1) * 10, content: x.sections.find((s) => s.type === type)?.content ?? {} }));
    });
    expect(types(moved).slice(0, 3)).toEqual(["hero", "gallery", "couple"]);
  });

  it("places a section with no saved position after its default predecessor", () => {
    // Simulates a section type released after the couple saved a custom order.
    const custom = cinematicManifest.defaultSectionOrder.filter((t) => t !== "countdown").slice().reverse();
    const b = bundle((x) => {
      x.sections = custom.map((type, i) => ({ type, enabled: true, sort_order: (i + 1) * 10, content: x.sections.find((s) => s.type === type)?.content ?? {} }));
    });
    const t = types(b);
    expect(t.indexOf("countdown")).toBe(t.indexOf("date") + 1);
  });

  it("editing a section's content (no sort_order) never moves it", () => {
    const before = types(bundle());
    const edited = bundle((x) => x.sections.push({ type: "closing", enabled: true, sort_order: null, content: { heading: "Edited" } }));
    expect(types(edited)).toEqual(before);
  });

  it("hides disabled sections but never the hero or footer", () => {
    const b = bundle((x) => {
      x.sections.push({ type: "couple", enabled: false, sort_order: 10, content: {} });
      x.sections.push({ type: "hero", enabled: false, sort_order: 0, content: {} });
    });
    expect(types(b)).not.toContain("couple");
    expect(types(b)).toContain("hero");
    expect(types(b)).toContain("footer");
  });

  it("skips sections with nothing to show", () => {
    const b = bundle((x) => {
      x.events = [];
      x.media = [];
      x.wedding.wedding_date = null;
      x.sections = [];
    });
    const t = types(b);
    for (const empty of ["ceremony", "reception", "venue", "gallery", "date", "countdown", "story", "schedule", "faq"]) {
      expect(t).not.toContain(empty);
    }
    expect(t).toEqual(["hero", "couple", "rsvp", "closing", "footer"]);
  });

  it("falls back to defaults field-by-field for invalid stored content", () => {
    const b = bundle((x) => x.sections.push({ type: "couple", enabled: true, sort_order: 10, content: { heading: 42, message: "Custom" } }));
    const couple = getSection(buildInvitationModel(b, cinematicManifest, opts), "couple")!;
    expect(couple.content.heading).toBe("Two hearts, one beginning");
    expect(couple.content.message).toBe("Custom");
  });

  it("formats event times in the wedding's time zone", () => {
    const b = bundle((x) => {
      x.settings.timezone = "Africa/Cairo";
      x.wedding.wedding_date = "2027-06-12";
      x.events[0].starts_at = "2027-06-12T14:00:00.000Z"; // 17:00 in Cairo (EEST, UTC+3)
    });
    const m = buildInvitationModel(b, cinematicManifest, opts);
    expect(m.events.ceremony?.timeLabel).toMatch(/^5:00\s?pm$/i);
    expect(m.events.ceremony?.dateLabel).toBeNull(); // same day as the wedding
    expect(m.countdownTarget).toBe("2027-06-12T14:00:00.000Z");
    expect(m.wedding.date?.long).toMatch(/^Saturday,? 12 June 2027$/);
  });

  it("targets local midnight of the wedding day when there are no timed events", () => {
    const b = bundle((x) => {
      x.settings.timezone = "Africa/Cairo";
      x.wedding.wedding_date = "2027-01-10";
      x.events = [];
    });
    // Cairo is UTC+2 in January.
    expect(buildInvitationModel(b, cinematicManifest, opts).countdownTarget).toBe("2027-01-09T22:00:00.000Z");
  });

  it("supports Arabic: RTL, Arabic defaults and Arabic fonts", () => {
    const m = buildInvitationModel(bundle((x) => (x.settings.locale = "ar")), cinematicManifest, opts);
    expect(m.dir).toBe("rtl");
    expect(getSection(m, "couple")?.content.heading).toBe("قلبان وبداية واحدة");
    expect(m.cssVars["--inv-font-heading"]).toContain("--font-amiri");
    expect(m.strings.days).toBe("أيام");
  });

  it("exposes music only when enabled, a file exists and the template supports it", () => {
    const withMusic = bundle((x) => {
      x.settings.music_enabled = true;
      x.media.push({ id: "m", kind: "audio", purpose: "music", storage_path: "/song.mp3", alt_text: "", width: null, height: null, sort_order: 0 });
    });
    expect(buildInvitationModel(withMusic, cinematicManifest, opts).music).toEqual({ enabled: true, src: "/song.mp3" });
    expect(buildInvitationModel(withMusic, editorialManifest, opts).music.enabled).toBe(false);
    withMusic.settings.music_enabled = false;
    expect(buildInvitationModel(withMusic, cinematicManifest, opts).music).toEqual({ enabled: false, src: null });
  });

  it("builds map links from the address when no coordinates are given", () => {
    const m = buildInvitationModel(bundle(), cinematicManifest, opts);
    expect(m.events.ceremony?.mapUrl).toContain(encodeURIComponent("St. Mary's Church, 12 Church Lane, Kensington, London"));
    expect(m.events.ceremony?.mapEmbedUrl).toContain("output=embed");
  });
});
