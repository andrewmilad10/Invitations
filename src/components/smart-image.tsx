"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

const UNSPLASH = "https://images.unsplash.com/";

/**
 * Library photos are resized by Unsplash's own image CDN (fast, cached
 * worldwide) instead of going through our server's image optimiser, which
 * has to fetch and resize each photo on first view.
 */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 70));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
};

function tinyPreview(src: string) {
  const url = new URL(src);
  url.searchParams.set("w", "24");
  url.searchParams.set("q", "30");
  url.searchParams.set("auto", "format");
  url.searchParams.set("blur", "60");
  return url.toString();
}

/**
 * next/image with fast delivery for library photos, and an instant soft
 * preview (a 24 px version of the photo) painted behind while the real one
 * loads — so photo areas never flash empty.
 */
export function SmartImage({ style, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  if (!src?.startsWith(UNSPLASH)) return <Image style={style} {...props} />;
  return (
    <Image
      {...props}
      loader={unsplashLoader}
      style={{ backgroundImage: `url(${tinyPreview(src)})`, backgroundSize: "cover", backgroundPosition: "center", ...style }}
    />
  );
}
