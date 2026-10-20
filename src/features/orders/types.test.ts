import { describe, expect, it } from "vitest";
import { fmtPrice, phoneSchema, placeOrderSchema, waLink } from "./types";

describe("orders/types", () => {
  it("accepts Egyptian and international WhatsApp numbers", () => {
    expect(phoneSchema.parse("0100 123 4567")).toBe("01001234567");
    expect(phoneSchema.parse("+20 100-123-4567")).toBe("+201001234567");
    expect(phoneSchema.safeParse("123").success).toBe(false);
    expect(phoneSchema.safeParse("call me").success).toBe(false);
  });
  it("only allows the couple's payment choices", () => {
    const base = { weddingId: "8f9c1f7e-3c7b-4a8e-9a55-1b2c3d4e5f60", phone: "01001234567" };
    expect(placeOrderSchema.safeParse({ ...base, method: "instapay" }).success).toBe(true);
    expect(placeOrderSchema.safeParse({ ...base, method: "cash" }).success).toBe(false);
  });
  it("formats prices and WhatsApp links", () => {
    expect(fmtPrice(1000)).toBe("EGP 1,000");
    expect(waLink("0100 123 4567", "Hi #1001")).toBe("https://wa.me/201001234567?text=Hi%20%231001");
    expect(waLink("+201001234567", "x")).toBe("https://wa.me/201001234567?text=x");
  });
});
