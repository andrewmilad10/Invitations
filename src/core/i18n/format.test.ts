import { describe, expect, it } from "vitest";
import { dateInZone, formatDateOnly, timeInZone, zonedTimeToIso } from "./format";

describe("date formatting", () => {
  it("never shifts a date-only value across time zones", () => {
    expect(formatDateOnly("2026-10-24", "en").long).toMatch(/^Saturday,? 24 October 2026$/);
    expect(formatDateOnly("2026-10-24", "en").day).toBe("24");
  });

  it("formats Arabic dates", () => {
    expect(formatDateOnly("2026-10-24", "ar").month).toBe("أكتوبر");
  });

  it("converts local wall-clock time to UTC, across DST", () => {
    expect(zonedTimeToIso("2027-06-12", "17:00", "Africa/Cairo")).toBe("2027-06-12T14:00:00.000Z"); // UTC+3
    expect(zonedTimeToIso("2027-01-12", "17:00", "Africa/Cairo")).toBe("2027-01-12T15:00:00.000Z"); // UTC+2
    expect(zonedTimeToIso("2027-03-28", "12:00", "Europe/London")).toBe("2027-03-28T11:00:00.000Z"); // BST starts
  });

  it("round-trips an instant back to local date and time", () => {
    const iso = zonedTimeToIso("2027-06-12", "23:30", "Africa/Cairo");
    expect(dateInZone(iso, "Africa/Cairo")).toBe("2027-06-12");
    expect(timeInZone(iso, "Africa/Cairo")).toBe("23:30");
    expect(dateInZone(iso, "UTC")).toBe("2027-06-12");
  });

  it("treats an invalid time zone as UTC instead of throwing", () => {
    expect(timeInZone("2027-06-12T14:00:00Z", "Not/AZone")).toBe("14:00");
  });
});
