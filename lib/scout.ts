import { buildCard } from "./scoring/engine";
import { fetchProfile, type GithubError } from "./github/client";
import { signalsFromPayload } from "./github/signals";
import type { Card, Signals } from "./scoring/types";

// Username -> Card, scouted in the browser through the VIEWER's own GitHub token.
//
// This is the PRIVATE fork: no server, no shared token, no cache. The scout runs
// client-side and calls GitHub directly with the token the viewer saved in their
// browser, so the resulting card — which may carry private contribution counts
// only that viewer may see — never leaves their machine. Public scouting lives
// on the original gitfut.com.
//
// Throws the same GithubError as fetchProfile when the scout fails.
export async function scoutCard(username: string, token: string): Promise<Card> {
  return (await scout(username, token)).card;
}

// Returns the built card AND the raw signals it was built from. Signals are the
// tiny seed (~20 numbers) buildCard is a pure function of, so a share link can
// carry the signals instead of the whole computed card and rebuild it on open —
// a much shorter URL. See lib/cardLink.
export async function scout(username: string, token: string): Promise<{ card: Card; signals: Signals }> {
  const signals = signalsFromPayload(await fetchProfile(username, token));
  return { card: buildCard(signals), signals };
}

export type { GithubError };
