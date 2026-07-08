"use client";

import type { Card } from "@/lib/scoring/types";

// Client-side card cache in localStorage. In this private fork the scout itself
// runs in the browser (see lib/scout + components/App); this just persists the
// built card so a flag edit or a re-open within the TTL is instant. Private cards
// (scouted with the viewer's token) are namespaced so they never mix with any
// public card for the same login.
const cacheKey = (login: string, priv: boolean) =>
  `gitfut:card:${priv ? "priv:" : ""}${login.toLowerCase()}`;

export function writeCardCache(card: Card, priv = false): void {
  try {
    localStorage.setItem(cacheKey(card.login, priv), JSON.stringify({ t: Date.now(), card }));
  } catch {
    /* quota / private mode */
  }
}
