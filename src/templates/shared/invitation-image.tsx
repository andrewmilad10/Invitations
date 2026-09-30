import Image from "next/image";
import type { MediaAsset } from "@/core/invitation/model";

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
        priority={priority}
        unoptimized={unoptimized}
        className={className}
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
      priority={priority}
      unoptimized={unoptimized}
      className={className}
    />
  );
}
