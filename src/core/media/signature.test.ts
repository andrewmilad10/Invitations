import { describe, expect, it } from "vitest";
import { isAllowedMedia, sniffMediaType } from "./signature";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? p.split("").map((c) => c.charCodeAt(0)) : p)).concat(Array(16).fill(0)));

describe("telling what a file really is", () => {
  it("recognises real images", () => {
    expect(sniffMediaType(bytes([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffMediaType(bytes([0x89], "PNG\r\n\x1a\n"))).toBe("image/png");
    expect(sniffMediaType(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("image/webp");
    expect(sniffMediaType(bytes([0, 0, 0, 0x1c], "ftypavif"))).toBe("image/avif");
  });

  it("recognises real audio", () => {
    expect(sniffMediaType(bytes("ID3", [3, 0]))).toBe("audio/mpeg");
    expect(sniffMediaType(bytes("OggS"))).toBe("audio/ogg");
    expect(sniffMediaType(bytes("RIFF", [0, 0, 0, 0], "WAVEfmt "))).toBe("audio/wav");
    expect(sniffMediaType(bytes([0, 0, 0, 0x20], "ftypM4A "))).toBe("audio/mp4");
  });

  it("refuses programs, web pages and scripts dressed up as photos", () => {
    expect(sniffMediaType(bytes("MZ", [0x90, 0]))).toBeNull(); // Windows program
    expect(sniffMediaType(bytes("<html><script>alert(1)</script>"))).toBeNull();
    expect(sniffMediaType(bytes("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
    expect(sniffMediaType(bytes("%PDF-1.7"))).toBeNull();
    expect(sniffMediaType(bytes("PK", [3, 4]))).toBeNull(); // zip
    expect(sniffMediaType(new Uint8Array([0xff, 0xd8]))).toBeNull(); // too short
  });

  it("only accepts images as photos and audio as music", () => {
    const jpeg = bytes([0xff, 0xd8, 0xff, 0xe0]);
    const mp3 = bytes("ID3", [3, 0]);
    expect(isAllowedMedia(jpeg, "gallery")).toBe(true);
    expect(isAllowedMedia(jpeg, "music")).toBe(false);
    expect(isAllowedMedia(mp3, "music")).toBe(true);
    expect(isAllowedMedia(mp3, "hero")).toBe(false);
  });
});
