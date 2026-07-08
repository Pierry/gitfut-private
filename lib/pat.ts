"use client";

// Viewer's GitHub Personal Access Token, held ONLY in their browser's
// localStorage — never sent to our storage, never logged. It rides along on the
// scout request in an `X-GitHub-Token` header (see hooks/useScout) so the server
// scouts under the viewer's identity and GitHub reveals the private contribution
// counts that viewer is allowed to see (e.g. a colleague in a shared org).
//
// Keeping it client-side is the whole security model: the private-augmented card
// it produces is cached in the browser too, so it can't leak into the shared
// server cache or to anonymous visitors.

const PAT_KEY = "gitfut:pat";

export function getPat(): string | null {
  try {
    return localStorage.getItem(PAT_KEY) || null;
  } catch {
    return null; // SSR / private mode / disabled storage
  }
}

// Same-tab listeners: the browser's `storage` event only fires in OTHER tabs, so
// setPat/clearPat notify subscribers here directly for the tab that made the change.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setPat(value: string): void {
  try {
    const v = value.trim();
    if (v) localStorage.setItem(PAT_KEY, v);
    else localStorage.removeItem(PAT_KEY);
  } catch {
    /* quota / private mode */
  }
  emit();
}

export function clearPat(): void {
  try {
    localStorage.removeItem(PAT_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

// useSyncExternalStore plumbing for "is a token saved?" — reacts to changes in
// this tab (via emit) and others (via the storage event), with no SSR mismatch
// (the server snapshot is always false).
export function subscribePat(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PAT_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const hasPatSnapshot = (): boolean => !!getPat();
export const hasPatServerSnapshot = (): boolean => false;
