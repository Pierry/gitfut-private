"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Card } from "@/lib/scoring/types";
import PlayerCard from "./PlayerCard";
import CardActions from "./CardActions";
import CardImageSync from "./CardImageSync";
import FlagPicker from "./FlagPicker";
import Mascot from "./Mascot";
import { AttributesPanel, MetricsPanel, ReportHeader } from "./ScoutReport";
import { RESULT_THEME } from "./finishTheme";
import { useReveal } from "@/hooks/useReveal";
import { burstConfetti } from "@/lib/confetti";

interface Props {
  card: Card;
  onBack: () => void;
  /** Edit the card's flag from the report (click-the-flag picker). */
  onCountryChange: (code: string) => void;
  /** HMAC that authorises this browser to upload the card's share image. */
  shareSig?: string;
  /** When true (image missing/stale), render + upload the share image to Blob. */
  generateShare?: boolean;
}

// Card width scales with the viewport but is bounded by BOTH width and height
// (and a hard min/max) so it never overflows a narrow phone or a short laptop.
const CARD_WIDTH = "clamp(220px, min(80vw, 40vh), 332px)";

// Confetti palette per tier — gold for prestige, green always woven in (brand).
const CONFETTI: Record<string, string[]> = {
  toty: ["#e9cc74", "#d4af37", "#7fa8ff", "#ffffff", "#39d353"],
  icon: ["#e9cc74", "#d4af37", "#f5f0e1", "#ffffff", "#39d353"],
  totw: ["#39d353", "#e9cc74", "#ffffff", "#7fa8ff"],
};

export default function ResultView({ card, onBack, onCountryChange, shareSig, generateShare }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const theme = RESULT_THEME[card.finish];
  const phase = useReveal(card.finish);

  // BACK when the visitor came from home this tab; otherwise (direct / shared
  // link) a CTA to make their own card. Default to the CTA so share-link
  // visitors — the growth case — see it without a flash.
  const [seenHome, setSeenHome] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("gitfut:seen-home") === "1";
    } catch {}
    // Deferred (not a synchronous set-in-effect) so it can't cascade a render.
    const t = setTimeout(() => setSeenHome(seen), 0);
    return () => clearTimeout(t);
  }, []);

  // Fire confetti when the rare-tier reveal hits its burst.
  useEffect(() => {
    if (phase === "burst") {
      burstConfetti(CONFETTI[card.finish] ?? ["#39d353", "#e9cc74", "#ffffff"]);
    }
  }, [phase, card.finish]);

  const ignited = phase === "ignite" || phase === "burst" || phase === "freeze";

  return (
    <main className="relative z-[2] mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col px-[clamp(16px,4vw,22px)] pb-[clamp(28px,5vh,52px)]">
      {/* Tier-reactive backdrop: dims the global green wash and lets the card's
          own tier color own the result screen (green is the action, the card is
          the prize — they shouldn't fight here). Fades in with the reveal. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 80% at 50% -10%, ${theme.glow}, transparent 55%), #0d1117`,
          opacity: ignited ? 0.9 : 0.4,
          transition: "opacity 1s ease",
        }}
      />

      {/* top-left: BACK button with the mascot alongside it */}
      <div className="mb-[8px] mt-[clamp(8px,2vh,18px)] flex shrink-0 items-center gap-[10px] self-start">
        <button
          onClick={onBack}
          className={
            seenHome
              ? "group inline-flex items-center gap-[6px] text-[13px] font-medium tracking-wide text-ink-faint transition hover:text-ink"
              : "group inline-flex items-center gap-[6px] text-[13px] font-semibold tracking-wide text-brand transition hover:text-brand-hi"
          }
        >
          {seenHome ? (
            <>
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
              BACK
            </>
          ) : (
            <>
              <ArrowLeft size={16} className="transition-transform group-hover:translate-x-0.5" />
              GET SCOUTED
            </>
          )}
        </button>
        <Mascot size={40} kick={false} ball={false} animate={false} />
      </div>

      <div className="shrink-0">
        <ReportHeader card={card} />
      </div>

      <div className="mt-[clamp(14px,2.4vh,26px)] grid grid-cols-[1fr_auto_1fr] items-start gap-[clamp(16px,2.4vw,40px)] max-[980px]:mt-6 max-[980px]:flex max-[980px]:flex-col max-[980px]:items-center">
        {/* left — attributes + playstyles */}
        <div className="flex justify-end max-[980px]:order-2 max-[980px]:w-full max-[980px]:max-w-[420px] max-[980px]:justify-center">
          <div className="w-full max-w-[360px]">
            <AttributesPanel card={card} />
          </div>
        </div>

        {/* center — the card + actions (the walkout happens here) */}
        <div className="relative flex flex-col items-center gap-[clamp(12px,2vh,18px)] max-[980px]:order-1">
          {/* spotlight wash — a soft, diffuse glow from above as the card rises.
              Reduced + blurred so it reads as ambient light, not a hard beam. */}
          <div
            className="animate-spotlight pointer-events-none absolute left-1/2 top-[-10%] z-0 h-[70%] w-[120%] blur-[40px]"
            style={{
              background: `radial-gradient(60% 70% at 50% 0%, ${theme.glow}, transparent 72%)`,
              opacity: ignited ? 0.4 : 0,
              transition: "opacity .5s ease",
            }}
          />
          {/* card stage — holds the captured card AND the flag editor as siblings.
              The editor overlays the flag slot but lives OUTSIDE captureRef, so the
              downloaded/copied PNG never includes the picker UI. */}
          <div className="animate-walkout relative" style={{ width: CARD_WIDTH }}>
            <div ref={captureRef} className="relative">
              {/* tier glow that ignites on reveal */}
              <div
                className="animate-glow pointer-events-none absolute -inset-[12%] z-0 rounded-full blur-[20px]"
                style={{
                  background: `radial-gradient(closest-side, ${theme.glow}, transparent 72%)`,
                  opacity: ignited ? 1 : 0,
                  transition: "opacity .6s ease",
                }}
              />
              <div className="relative z-[1]">
                <PlayerCard card={card} />
              </div>
            </div>
            <FlagPicker value={card.country} onChange={onCountryChange} />
          </div>
          <div style={{ width: CARD_WIDTH }}>
            <CardActions card={card} targetRef={captureRef} />
          </div>
        </div>

        {/* right — scouting metrics */}
        <div className="flex max-[980px]:order-3 max-[980px]:w-full max-[980px]:max-w-[420px] max-[980px]:justify-center">
          <div className="w-full max-w-[360px]">
            <MetricsPanel card={card} />
          </div>
        </div>
      </div>

      {generateShare && shareSig && (
        <CardImageSync targetRef={captureRef} login={card.login} sig={shareSig} />
      )}
    </main>
  );
}
