import { describe, expect, it } from "vitest";
import { guestLines, guestsCsv, parsePastedGuests, questionTotals, totals, type GuestLike, type ReplyLike } from "./summary";

const g = (id: string, name: string, extra: Partial<GuestLike> = {}): GuestLike => ({ id, name, groups: [], max_party: null, token: id.padEnd(32, "0"), open_count: 0, last_opened_at: null, created_at: "2026-10-01T10:00:00Z", ...extra });
const r = (id: string, guest_id: string | null, name: string, attending: boolean, party_size: number, answers: unknown = {}): ReplyLike => ({ id, guest_id, name, attending, party_size, note: null, answers, updated_at: "2026-10-02T10:00:00Z" });

describe("guest list totals", () => {
  const lines = guestLines(
    [g("a", "Mariam & family", { open_count: 3 }), g("b", "Uncle Hossam"), g("c", "Nour")],
    [r("r1", "a", "Mariam & family", true, 4, { bus: "Yes" }), r("r2", "b", "Uncle Hossam", false, 0), r("r3", null, "Karim", true, 2, { bus: "No" })],
  );

  it("joins replies to listed guests and keeps general-link replies", () => {
    expect(lines.map((l) => [l.name, l.status, l.people])).toEqual([
      ["Mariam & family", "yes", 4],
      ["Uncle Hossam", "no", 0],
      ["Nour", "wait", 0],
      ["Karim", "yes", 2],
    ]);
    expect(lines.find((l) => l.name === "Karim")?.general).toBe(true);
  });

  it("counts invitations, replies and people", () => {
    expect(totals(lines)).toEqual({ invitations: 4, replied: 3, coming: 2, people: 6, cantCome: 1, waiting: 1, percent: 75 });
    expect(totals([])).toMatchObject({ invitations: 0, percent: 0 });
  });

  it("adds up yes/no questions among those coming", () => {
    expect(questionTotals(lines, [{ id: "bus", text: "Transport?", kind: "yesno" }, { id: "food", text: "Food?", kind: "text" }])).toEqual([{ id: "bus", text: "Transport?", yes: 1, of: 2 }]);
  });

  it("exports a spreadsheet that can't run formulas", () => {
    const csv = guestsCsv([...lines, { ...lines[2], key: "x", name: "=HYPERLINK(1)" }], [{ id: "bus", text: "Transport?" }], (t) => `https://v.test/w/x?g=${t}`);
    expect(csv.startsWith("﻿Name,Groups,Reply")).toBe(true);
    expect(csv).toContain('Mariam & family,,Coming,4,,Yes,2026-10-02 10:00,3,https://v.test/w/x?g=a');
    expect(csv).toContain("Karim,,Coming,2,,No,2026-10-02 10:00,0,General link");
    expect(csv).toContain("'=HYPERLINK(1)");
  });
});

describe("pasting a list of names", () => {
  it("skips blank lines and names already listed, with groups after a comma", () => {
    const res = parsePastedGuests("Mariam & family\n\n  uncle   HOSSAM \nNour Adel, University\nNour Adel\nKarim; Work", ["Uncle Hossam"]);
    expect(res.add).toEqual([
      { name: "Mariam & family", groups: [] },
      { name: "Nour Adel", groups: ["University"] },
      { name: "Karim", groups: ["Work"] },
    ]);
    expect(res.duplicates).toBe(2);
    expect(res.lines).toBe(5);
  });

  it("works with Arabic names", () => {
    expect(parsePastedGuests("مريم وعائلتها\nخالتو هدى، العائلة", []).add.map((x) => x.name)).toEqual(["مريم وعائلتها", "خالتو هدى، العائلة"]);
  });

  it("stops at the limit", () => {
    const res = parsePastedGuests(Array.from({ length: 12 }, (_, i) => `Guest ${i}`).join("\n"), [], 10);
    expect(res.add).toHaveLength(10);
    expect(res.overLimit).toBe(2);
  });
});
