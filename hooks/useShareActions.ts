"use client";

import { useEffect, useRef, useState } from "react";

// Client wiring for the share row, shared by CardActions and DuelView. The DATA
// (payload strings, intent URLs) lives in lib/share; this hook owns only the
// gestures: the deferred "is Web Share available" probe, the native-share call
// with its AbortError → intent-window fallback, and copy-to-clipboard with a
// timed "copied" flag. Callers pass lazy getters so a payload can be built at
// gesture time (e.g. CardActions attaching the freshly rendered card image).
export function useShareActions({
  getSharePayload,
  getIntentUrl,
  getCopyUrl,
}: {
  /** What to hand navigator.share — may be async (e.g. render a file first). */
  getSharePayload: () => ShareData | Promise<ShareData>;
  /** Fallback web-intent URL opened when native share is unavailable/fails. */
  getIntentUrl: () => string;
  /** URL written to the clipboard by copyLink. */
  getCopyUrl: () => string;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  // Default true so supported browsers render the CTA with no layout shift; the
  // effect hides it where Web Share is missing so it never degrades into a
  // duplicate X-share.
  const [canNativeShare, setCanNativeShare] = useState(true);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // The set is deferred (not synchronous in the effect) so it can't cascade
    // renders.
    const supported =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    if (supported) return;
    const t = setTimeout(() => setCanNativeShare(false), 0);
    return () => clearTimeout(t);
  }, []);

  const nativeShare = async () => {
    try {
      await navigator.share(await getSharePayload());
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // user dismissed
      window.open(getIntentUrl(), "_blank", "noopener,noreferrer");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCopyUrl());
      setLinkCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      /* clipboard unavailable — silent */
    }
  };

  return { canNativeShare, nativeShare, copyLink, linkCopied };
}
