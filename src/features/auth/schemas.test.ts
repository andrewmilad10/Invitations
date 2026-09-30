import { describe, expect, it } from "vitest";
import { safeRedirectPath, signUpSchema } from "./schemas";

describe("safeRedirectPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeRedirectPath("/dashboard/weddings/1")).toBe("/dashboard/weddings/1");
    expect(safeRedirectPath("/dashboard?tab=theme")).toBe("/dashboard?tab=theme");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "dashboard", "", null, undefined, 42])(
    "rejects %s",
    (value) => {
      expect(safeRedirectPath(value)).toBe("/dashboard");
    },
  );
});

describe("signUpSchema", () => {
  it("normalises email and requires 8+ char passwords", () => {
    const ok = signUpSchema.safeParse({ fullName: " Mariam ", email: " M@Example.com ", password: "12345678" });
    expect(ok.success && ok.data).toMatchObject({ fullName: "Mariam", email: "m@example.com" });
    expect(signUpSchema.safeParse({ fullName: "A", email: "a@b.co", password: "short" }).success).toBe(false);
  });
});
