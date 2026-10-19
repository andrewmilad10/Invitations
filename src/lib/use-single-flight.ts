"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Runs an action at most once at a time per key. Pressing the same button
 * again while its request is still on the way does nothing, so a double tap
 * never sends two requests. `busy(key)` is for disabling the button meanwhile.
 * If the action throws (no connection), `onError` gets the error and the key
 * is free again.
 */
export function useSingleFlight(onError?: (e: unknown) => void) {
  const running = useRef(new Set<string>());
  const [keys, setKeys] = useState<string[]>([]);

  const run = useCallback(
    async <T>(key: string, fn: () => Promise<T>): Promise<T | undefined> => {
      if (running.current.has(key)) return undefined;
      running.current.add(key);
      setKeys([...running.current]);
      try {
        return await fn();
      } catch (e) {
        onError?.(e);
        return undefined;
      } finally {
        running.current.delete(key);
        setKeys([...running.current]);
      }
    },
    [onError],
  );

  const busy = useCallback((key: string) => keys.includes(key), [keys]);
  return { run, busy };
}
