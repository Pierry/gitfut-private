import { ImageResponse } from "next/og";
import { after } from "next/server";
import { scoutCard } from "@/lib/scout";
import { pickFlag } from "@/lib/flagPriority";
import { recordScout } from "@/lib/analytics";
import { loadCardAssets, cardTree } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";
import { resolveResultTheme } from "@/components/finishTheme";
import VsBurst from "@/components/VsBurst";
import type { Card } from "@/lib/scoring/types";

// The Fixture poster, served as an explicit image route (/<a>/vs/<b>/poster.png)
// and wired into the duel page's metadata by generateMetadata. It is NOT a
// file-convention opengraph-image on purpose: Turbopack dev doesn't register
// metadata-image conventions under two dynamic segments (the single-segment
// card OGs register fine), so the poster 404'd in dev. An explicit route +
// explicit openGraph.images works identically everywhere — same pattern as
// /api/card-image.

export const runtime = "nodejs";

const POSTER_SIZE = { width: 1200, height: 630 };

const CARD_W = 300;
const TILT = 7; // degrees each card leans toward the centre line

const CACHE = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

async function tryCard(username: string): Promise<Card | null> {
  try {
    const card = await scoutCard(username);
    return { ...card, country: pickFlag(null, card.country) ?? "" };
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string; opponent: string }> },
) {
  const { username, opponent } = await params;
  const [a, b] = await Promise.all([tryCard(username), tryCard(opponent)]);

  // A side missing -> a text-only fixture card, still spoiler-free.
  if (!a || !b) {
    const fonts = await loadCardFonts();
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#02001e",
          backgroundImage:
            "radial-gradient(900px 500px at 50% -10%, rgba(57,211,83,0.16), transparent 60%)",
          color: "#e6edf3",
          fontFamily: "DINPro",
          textAlign: "center",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#39d353",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          SCOUT DUEL
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            marginTop: 22,
          }}
        >
          @{username} vs @{opponent}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a8b3bd",
            marginTop: 18,
          }}
        >
          watch the duel at
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#39d353",
            fontWeight: 700,
            marginTop: 10,
          }}
        >
          gitfut.com
        </div>
      </div>,
      { ...POSTER_SIZE, fonts, headers: CACHE },
    );
  }

  after(() => Promise.all([recordScout(), recordScout()])); // count unfurls like the card OG does

  const aGlow = resolveResultTheme(a).glow;
  const bGlow = resolveResultTheme(b).glow;
  // Only aAssets.fonts is passed to ImageResponse; both cards use the same
  // static font set, so skip re-reading it for B (withFonts=false).
  const [aAssets, bAssets] = await Promise.all([
    loadCardAssets(a, CARD_W),
    loadCardAssets(b, CARD_W, false),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#02001e",
        // each corner's tier light floods its half of the poster
        backgroundImage: `radial-gradient(720px 560px at 12% 40%, ${aGlow}, transparent 62%), radial-gradient(720px 560px at 88% 40%, ${bGlow}, transparent 62%)`,
        fontFamily: "DINPro",
        position: "relative",
      }}
    >
      {/* halfway line under the VS */}
      <div
        style={{
          position: "absolute",
          left: 599,
          top: 0,
          width: 2,
          height: 630,
          background: "rgba(255,255,255,.05)",
          display: "flex",
        }}
      />

      {/* challenger corner — leaning into the centre line */}
      <div
        style={{
          display: "flex",
          transform: `rotate(${TILT}deg)`,
          marginRight: -34,
          marginTop: 8,
        }}
      >
        {cardTree(a, aAssets, CARD_W)}
      </div>

      {/* spacer holding the centre gap; the VS overlay below paints over it
            (Satori has no z-index — paint order is document order, so the
            centre line is rendered LAST to sit above both leaning cards) */}
      <div style={{ display: "flex", width: 300 }} />

      {/* opponent corner — mirrored lean */}
      <div
        style={{
          display: "flex",
          transform: `rotate(-${TILT}deg)`,
          marginLeft: -34,
          marginTop: 8,
        }}
      >
        {cardTree(b, bAssets, CARD_W)}
      </div>

      {/* the centre line: eyebrow, VS, the address — painted last, on top */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#39d353",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 6,
          }}
        >
          SCOUT DUEL
        </div>
        {/* the VS burst — same component as the page header (Satori-safe) */}
        <div style={{ display: "flex", marginTop: 8 }}>
          <VsBurst size={264} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a8b3bd",
            marginTop: 10,
          }}
        >
          who takes it?
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#39d353",
            fontWeight: 700,
            marginTop: 6,
          }}
        >
          gitfut.com
        </div>
      </div>
    </div>,
    { ...POSTER_SIZE, fonts: aAssets.fonts, headers: CACHE },
  );
}
