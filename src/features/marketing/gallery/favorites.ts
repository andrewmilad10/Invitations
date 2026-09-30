"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved (hearted) designs, kept in this browser only — no account needed.
 * Synced across tabs.
 */

const KEY = "vellum:favorites:v1";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | undefined;

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string").slice(0, 200) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export const favoritesStore = {
  get: read,
  toggle(id: string) {
    const current = read();
    cache = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      /* storage disabled: favourites last for this visit */
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = undefined;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

export function useFavorites(): string[] {
  return useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get, () => EMPTY);
}
