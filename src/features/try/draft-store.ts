"use client";

import { useSyncExternalStore } from "react";
import { parseAnswers, type TryAnswers } from "./answers";

/**
 * Browser-only persistence for the no-account draft.
 *
 * - Answers: localStorage (small JSON), validated on every read, synced
 *   across tabs.
 * - Photos: IndexedDB (binary files), keyed by random ids referenced from
 *   the answers. Nothing is sent to the server until the visitor saves.
 */

const KEY = "vellum:try-draft:v1";
const listeners = new Set<() => void>();
let cache: TryAnswers | null | undefined;

function read(): TryAnswers | null {
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? parseAnswers(JSON.parse(raw)) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export const draftStore = {
  get: read,
  set(answers: TryAnswers) {
    cache = { ...answers, updatedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      // Storage full or disabled (private mode): the draft still works for this visit.
    }
    emit();
  },
  clear() {
    cache = null;
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    emit();
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

/** The stored draft (null on the server and before anything is saved). */
export function useStoredDraft(): TryAnswers | null {
  return useSyncExternalStore(draftStore.subscribe, draftStore.get, () => null);
}

/** Whether we're past hydration (the draft has been read from the browser). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ── Photos (IndexedDB) ──────────────────────────────────────────────────────

const DB_NAME = "vellum";
const STORE = "draft-files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = run(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export const draftFiles = {
  put: (key: string, file: Blob) => tx("readwrite", (s) => s.put(file, key)),
  get: (key: string) => tx<Blob | undefined>("readonly", (s) => s.get(key)),
  delete: (key: string) => tx("readwrite", (s) => s.delete(key)),
  clear: () => tx("readwrite", (s) => s.clear()),
};
