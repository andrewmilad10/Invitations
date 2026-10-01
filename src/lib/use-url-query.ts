"use client";

import { useMemo, useSyncExternalStore } from "react";

const noSubscription = () => () => {};

/**
 * The page's query string, read in the browser after hydration (null on the
 * server and during hydration). Lets a statically rendered page pick up
 * links like `?palette=…` without making the whole page render per request.
 * It re-reads on every render, so it also follows our own replaceState calls.
 */
export function useUrlQuery(): URLSearchParams | null {
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => null);
  return useMemo(() => (search === null ? null : new URLSearchParams(search)), [search]);
}

/** A query string as the record shape our parsers take. */
export const queryRecord = (q: URLSearchParams): Record<string, string> => Object.fromEntries(q.entries());
