import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { sampleBundle, sampleMediaUrl } from "./fixtures/sample-wedding";
import { TEMPLATE_MANIFESTS } from "./registry";
import { InvitationRenderer } from "./renderers";

function render(templateId: string, patch: (b: ReturnType<typeof sampleBundle>) => void = () => {}) {
  const manifest = TEMPLATE_MANIFESTS.find((t) => t.id === templateId)!;
  const bundle = sampleBundle(templateId, new Date("2026-09-30T00:00:00Z"));
  patch(bundle);
  const model = buildInvitationModel(bundle, manifest, { mode: "live", mediaUrl: sampleMediaUrl });
  return renderToString(<InvitationRenderer model={model} />);
}

describe.each(TEMPLATE_MANIFESTS.map((t) => t.id))("%s template", (id) => {
  it("renders only the data it is given (no hard-coded identity)", () => {
    const html = render(id, (b) => {
      b.wedding.partner_one_name = "Zephyrine";
      b.wedding.partner_two_name = "Quillon";
      b.wedding.wedding_date = "2031-02-03";
      b.events[0].venue_name = "Unique Venue Name 42";
      b.events[0].starts_at = "2031-02-03T14:00:00.000Z";
      b.sections = []; // demo story text mentions the demo couple; it's data, not a leak
    });
    expect(html).toContain("Zephyrine");
    expect(html).toContain("Quillon");
    expect(html).toContain("2031");
    expect(html).toContain("Unique Venue Name 42");
    expect(html).not.toContain("Emma"); // fixture names must not leak
    expect(html).not.toContain("James");
  });

  it("applies theme variables, language and direction on the root", () => {
    const html = render(id, (b) => {
      b.settings.locale = "ar";
      b.theme.tokens = { colors: { accent: "#123456" } };
    });
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain("--inv-accent:#123456");
  });

  it("escapes user content (no HTML injection)", () => {
    const html = render(id, (b) => {
      b.wedding.partner_one_name = '<img src=x onerror="alert(1)">';
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});

describe("template source rules", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== "fixtures") walk(path);
      } else if (/\.tsx$/.test(entry) && !entry.endsWith(".test.tsx")) {
        files.push(path);
      }
    }
  };
  walk(join(__dirname));

  it.each(files.map((f) => [f.replace(__dirname, "templates")]))("%s uses theme tokens, not literal colors", (rel) => {
    const source = readFileSync(join(__dirname, rel.replace(/^templates/, "")), "utf8");
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
