"use client";

import type { Card, Signals } from "@/lib/scoring/types";

// Persistent, browser-only collection of the cards you've scouted — your FIFA
// binder. Unlike the TTL card cache (hooks/useScout), this never expires: it
// keeps the full card so the home page can show your scouted players side by
// side and open any of them straight from storage, no refetch needed.

const KEY = "gitfut:collection";
const MAX = 40; // keep the newest N; a scout binder, not an archive

interface Entry {
  t: number; // last-scouted timestamp, for recency ordering
  card: Card;
  signals?: Signals; // the seed, kept so a re-share from the binder stays short
}

// useSyncExternalStore needs getSnapshot to return a STABLE reference until the
// data actually changes, or it re-renders forever. So we hold the derived list
// in `snapshot` and only rebuild it (new array) on a real mutation.
let snapshot: Card[] | null = null;
const EMPTY: Card[] = [];
const listeners = new Set<() => void>();

function readEntries(): Entry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Entry[]) : [];
  } catch {
    return [];
  }
}

function rebuild(): void {
  snapshot = readEntries()
    .sort((a, b) => b.t - a.t)
    .map((e) => e.card);
}

function emit(): void {
  rebuild();
  listeners.forEach((l) => l());
}

export function addToCollection(card: Card, signals?: Signals, now = Date.now()): void {
  try {
    const entries = readEntries().filter((e) => e.card.login.toLowerCase() !== card.login.toLowerCase());
    entries.unshift({ t: now, card, signals });
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* quota / private mode — the collection is a nicety, never block a scout */
  }
  emit();
}

// The signals a saved card was built from (if kept), so re-sharing from the
// binder produces the same short link a fresh scout would.
export function getStoredSignals(login: string): Signals | undefined {
  return readEntries().find((e) => e.card.login.toLowerCase() === login.toLowerCase())?.signals;
}

export function removeFromCollection(login: string): void {
  try {
    const entries = readEntries().filter((e) => e.card.login.toLowerCase() !== login.toLowerCase());
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
  emit();
}

// --- useSyncExternalStore plumbing ---
export function subscribeCollection(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCollectionSnapshot(): Card[] {
  if (snapshot === null) rebuild();
  return snapshot ?? EMPTY;
}

export function getServerSnapshot(): Card[] {
  return EMPTY; // no localStorage on the server; hydrate on the client
}
