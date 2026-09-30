import { describe, expect, it } from "vitest";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { publicMediaUrl } from "@/features/media/urls";
import { sampleBundle } from "@/templates/fixtures/sample-wedding";
import { getTemplateManifest } from "@/templates/registry";
import { resolveSectionStyle, sectionStyleSchema, sectionToneVars } from "./style";

const romantic = getTemplateManifest("romantic")!;

describe("section style hints", () => {
  it("defaults to the template's own design", () => {
    expect(resolveSectionStyle(undefined)).toEqual({ tone: "default", spacing: "normal", align: "center" });
    expect(resolveSectionStyle({ tone: "neon", spacing: "airy" })).toEqual({ tone: "default", spacing: "airy", align: "center" });
  });

  it("only accepts known values on write", () => {
    expect(sectionStyleSchema.safeParse({ tone: "dark" }).success).toBe(true);
    expect(sectionStyleSchema.safeParse({ tone: "dark", background: "red" }).success).toBe(false);
  });

  it("tones re-map the theme's own colors (no new colors)", () => {
    const c = romantic.themeDefaults.colors;
    expect(sectionToneVars(romantic.themeDefaults, "default")).toEqual({});
    expect(sectionToneVars(romantic.themeDefaults, "dark")).toMatchObject({ "--inv-bg": c.foreground, "--inv-fg": c.background });
    expect(sectionToneVars(romantic.themeDefaults, "accent")).toMatchObject({ "--inv-bg": c.accent, "--inv-fg": c.accentForeground });
  });

  it("reaches the model with the section, and style never changes content", () => {
    const b = sampleBundle("romantic");
    b.sections.push({ type: "closing", enabled: true, sort_order: null, content: {}, style: { tone: "dark", spacing: "airy" } });
    const m = buildInvitationModel(b, romantic, { mode: "live", mediaUrl: publicMediaUrl });
    const closing = m.sections.find((s) => s.type === "closing")!;
    expect(closing.style).toEqual({ tone: "dark", spacing: "airy", align: "center" });
    expect(closing.toneVars["--inv-bg"]).toBe(romantic.themeDefaults.colors.foreground);
    expect(closing.content.heading).toBe("We hope to see you there");
  });
});
