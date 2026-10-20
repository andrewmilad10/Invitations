import { describe, expect, it } from "vitest";
import { limitError } from "./limit-error";

describe("limitError", () => {
  it("passes quota and rate-limit messages through", () => {
    expect(limitError({ code: "P0413", message: "A guest list can have up to 1,500 guests." })).toEqual({ ok: false, error: "A guest list can have up to 1,500 guests." });
    expect(limitError({ code: "P0429", message: "Too many attempts." })?.error).toBe("Too many attempts.");
  });
  it("keeps other database errors private", () => {
    expect(limitError({ code: "23505", message: "duplicate key value violates unique constraint" })).toBeNull();
    expect(limitError(null)).toBeNull();
  });
});
