"use client";

import { useEffect, useRef } from "react";
import { toCanvas } from "html-to-image";
import { upload } from "@vercel/blob/client";
import { renderCardImage } from "@/lib/capture";

// Generates the shareable card image the same way Download does (the real card
// node, via html-to-image) and uploads it to Vercel Blob once, so embeds and OG
// previews serve the *exact* card. WebP-compressed to keep Blob small. Runs only
// when the server says the image is missing/stale; silent + best-effort.
export default function CardImageSync({
  targetRef,
  login,
  sig,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  login: string;
  sig: string;
}) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // Wait for the reveal animation to settle + fonts/avatar to load before capture.
    const timer = setTimeout(async () => {
      const node = targetRef.current;
      if (!node) return;
      try {
        // Capture the signed off-screen clone so the embedded/OG image carries
        // the gitfut.com signature without flashing it on the live card.
        const canvas = await renderCardImage(node, (n) =>
          toCanvas(n, { pixelRatio: 2, cacheBust: true }),
        );
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/webp", 0.9),
        );
        if (!blob) return;
        await upload(`cards/${login.toLowerCase()}.webp`, blob, {
          access: "public",
          contentType: "image/webp",
          handleUploadUrl: "/api/card-image-upload",
          clientPayload: JSON.stringify({ login, sig }),
        });
      } catch {
        /* best-effort: the embed falls back to the "visit to generate" hint */
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [targetRef, login, sig]);

  return null;
}
