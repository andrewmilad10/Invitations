import { describe, expect, it } from "vitest";
import { sampleBundle } from "@/templates/fixtures/sample-wedding";
import { publishChecklist } from "./publish-checklist";

describe("publish checklist", () => {
  it("only names are required; the rest are suggestions", () => {
    const b = sampleBundle("romantic");
    expect(publishChecklist(b).every((c) => c.done)).toBe(true);
    b.wedding.wedding_date = null;
    b.events = [];
    b.media = [];
    const list = publishChecklist(b);
    expect(list.filter((c) => !c.done).map((c) => c.required ?? false)).toEqual([false, false, false]);
    b.wedding.partner_two_name = " ";
    expect(publishChecklist(b).find((c) => c.required)?.done).toBe(false);
  });
});
