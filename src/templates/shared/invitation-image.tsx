import { SmartImage as Image } from "@/components/smart-image";
import type { MediaAsset } from "@/core/invitation/model";

/** Colour or black & white, from the theme (--inv-photo-filter). */
const PHOTO_TONE = { filter: "var(--inv-photo-filter, none)" } as const;

/**
 * Image for invitation templates. Uses next/image for Supabase media; sample
 * and export renders use the file as-is.
 */
export function InvitationImage({
  asset,
  alt,
  fill,
  sizes,
  priority,
  className,
}: {
  asset: MediaAsset;
  alt?: string;
  fill?: boolean;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const unoptimized = asset.url.startsWith("/");
  if (fill) {
    return (
      <Image
        src={asset.url}
        alt={alt ?? asset.alt}
        fill
        sizes={sizes}
        preload={priority}
        unoptimized={unoptimized}
        className={className}
        style={PHOTO_TONE}
      />
    );
  }
  return (
    <Image
      src={asset.url}
      alt={alt ?? asset.alt}
      width={asset.width ?? 1200}
      height={asset.height ?? 800}
      sizes={sizes}
      preload={priority}
      unoptimized={unoptimized}
      className={className}
      style={PHOTO_TONE}
    />
  );
}
