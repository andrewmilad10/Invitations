import { describe, expect, it } from "vitest";
import { canManageTeam, canSeeMoney, daysLeft } from "./types";

describe("admin helpers", () => {
  it("counts whole days left, negative once past", () => {
    const now = Date.parse("2026-10-20T12:00:00Z");
    expect(daysLeft("2026-10-30T12:00:00Z", now)).toBe(10);
    expect(daysLeft("2026-10-20T13:00:00Z", now)).toBe(1);
    expect(daysLeft("2026-10-10T12:00:00Z", now)).toBe(-10);
    expect(daysLeft(null, now)).toBeNull();
  });
  it("keeps money and team management to the right roles", () => {
    expect(canSeeMoney("marketing")).toBe(false);
    expect(canSeeMoney("admin")).toBe(true);
    expect(canManageTeam("admin")).toBe(false);
    expect(canManageTeam("owner")).toBe(true);
  });
});
