"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * A link that only prefetches once the visitor shows interest in it (hover,
 * focus or touch), instead of as soon as it scrolls into view. Use it where a
 * page has many links (a gallery of designs), so scrolling doesn't fire a
 * request for every card.
 */
export function IntentLink({ onPointerEnter, onFocus, onTouchStart, ...props }: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [want, setWant] = useState(false);
  return (
    <Link
      {...props}
      prefetch={want ? null : false}
      onPointerEnter={(e) => {
        setWant(true);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        setWant(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setWant(true);
        onTouchStart?.(e);
      }}
    />
  );
}
