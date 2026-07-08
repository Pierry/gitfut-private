import { buildCard } from "./scoring/engine";
import type { Card, Signals } from "./scoring/types";

// Self-contained share links: the card travels INSIDE the URL, so a link opens
// the exact card the sharer generated even for someone with no GitHub token —
// there's no server to look it up on.
//
// To keep the URL short we encode the tiny raw SIGNALS (~20 numbers) rather than
// the full computed card, and rebuild the card with buildCard() on open (it's a
// pure function of the signals). A crafted card with no signals falls back to
// packing the whole card. Payload is gzip-compressed (native CompressionStream,
// no dependency) and base64url-encoded. A 2-char tag records kind + compression:
//   [s|c][g|r]  — s=signals / c=card, g=gzip / r=raw.

function toB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  const buf = await new Response(out).arrayBuffer();
  return new Uint8Array(buf);
}

async function pack(obj: unknown, kind: "s" | "c"): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream !== "undefined") {
    return kind + "g" + toB64url(await pipe(bytes, new CompressionStream("gzip")));
  }
  return kind + "r" + toB64url(bytes);
}

export async function encodeShare(card: Card, signals?: Signals): Promise<string> {
  return signals ? pack(signals, "s") : pack(card, "c");
}

// Only display data is trusted here — never anything executable. We still
// sanitize the two fields that become resource URLs (avatar <img>, flag path)
// so a hand-crafted link can't point them at anything weird.
function sanitize(card: Card): Card | null {
  if (!card || typeof card.login !== "string" || !card.stats || typeof card.overall !== "number") return null;
  const avatarUrl = typeof card.avatarUrl === "string" && /^https?:\/\//.test(card.avatarUrl) ? card.avatarUrl : "";
  const country = typeof card.country === "string" && /^[a-z]{2}$/.test(card.country) ? card.country : "";
  return { ...card, avatarUrl, country };
}

export async function decodeShare(s: string): Promise<{ card: Card; signals?: Signals } | null> {
  try {
    const kind = s[0];
    const comp = s[1];
    const bytes = fromB64url(s.slice(2));
    const json =
      comp === "g" && typeof DecompressionStream !== "undefined"
        ? new TextDecoder().decode(await pipe(bytes, new DecompressionStream("gzip")))
        : new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (kind === "s") {
      const signals = parsed as Signals;
      const card = sanitize(buildCard(signals));
      return card ? { card, signals } : null;
    }
    const card = sanitize(parsed as Card);
    return card ? { card } : null;
  } catch {
    return null;
  }
}
