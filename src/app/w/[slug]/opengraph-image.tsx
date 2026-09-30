import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getPublicBundle, toModel } from "@/features/invitations/public";

export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "src/assets/fonts/og");

/** Social preview card generated from the wedding's data and theme. */
export default async function OpenGraphImage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const [bundle, serif, serifItalic, sans, arabic] = await Promise.all([
    getPublicBundle(slug),
    readFile(join(fontDir, "cormorant-garamond-latin-400-normal.woff")),
    readFile(join(fontDir, "cormorant-garamond-latin-400-italic.woff")),
    readFile(join(fontDir, "jost-latin-400-normal.woff")),
    readFile(join(fontDir, "amiri-arabic-400-normal.woff")),
  ]);

  const fonts = [
    { name: "Serif", data: serif, style: "normal" as const, weight: 400 as const },
    { name: "Serif", data: serifItalic, style: "italic" as const, weight: 400 as const },
    { name: "Sans", data: sans, style: "normal" as const, weight: 400 as const },
    // Fallback for Arabic names (Satori falls back across the fonts provided).
    { name: "Arabic", data: arabic, style: "normal" as const, weight: 400 as const },
  ];

  if (!bundle) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f1ea", color: "#2b211d", fontFamily: "Serif", fontSize: 72 }}>
        {siteConfig.name}
      </div>,
      { ...size, fonts },
    );
  }

  const model = toModel(bundle, "live");
  const { colors } = model.theme;
  const hero = model.media.hero?.url;
  const onImage = Boolean(hero);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        color: onImage ? "#ffffff" : colors.foreground,
        position: "relative",
      }}
    >
      {hero ? (
        <img src={hero} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover", width: "100%", height: "100%" }} />
      ) : null}
      {onImage ? <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex" }} /> : null}
      <div
        style={{
          position: "absolute",
          inset: 28,
          border: `1px solid ${onImage ? "rgba(255,255,255,0.5)" : colors.accent}`,
          display: "flex",
        }}
      />
      <div style={{ fontFamily: "Sans", fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: onImage ? "rgba(255,255,255,0.85)" : colors.accent, display: "flex" }}>
        {model.locale === "ar" ? "دعوة زفاف" : "Wedding Invitation"}
      </div>
      <div style={{ fontFamily: "Serif", fontSize: 110, lineHeight: 1.05, marginTop: 28, display: "flex", alignItems: "center", gap: 28 }}>
        <span>{model.wedding.partnerOne}</span>
        <span style={{ fontStyle: "italic", fontSize: 80, opacity: 0.8 }}>&amp;</span>
        <span>{model.wedding.partnerTwo}</span>
      </div>
      {model.wedding.weddingDate ? (
        <div style={{ fontFamily: "Sans", fontSize: 28, letterSpacing: 6, marginTop: 36, textTransform: "uppercase", display: "flex" }}>
          {model.wedding.date?.long}
        </div>
      ) : null}
    </div>,
    { ...size, fonts },
  );
}
