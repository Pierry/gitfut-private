"use client";

import { useEffect, useRef, useState } from "react";
import PlayerCard from "./PlayerCard";
import { SAMPLE_CARDS } from "@/lib/github/samples";
import type { Card, Finish } from "@/lib/scoring/types";

// Neutral silhouette so every tier preview reads as a template (one frame per
// finish), not six copies of the same person.
const SILHOUETTE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><circle cx="160" cy="122" r="60" fill="%23ffffff" fill-opacity="0.22"/><rect x="58" y="198" width="204" height="150" rx="80" fill="%23ffffff" fill-opacity="0.22"/></svg>',
  );

// One preview card per finish tier, low to legend, so the ladder shows every
// frame's actual layout. Built off a real sample (for the full Card shape), with
// the finish/overall/name overridden and the identity blanked to a silhouette.
const TIERS: { finish: Finish; label: string; overall: number }[] = [
  { finish: "bronze", label: "BRONZE", overall: 55 },
  { finish: "silver", label: "SILVER", overall: 66 },
  { finish: "gold", label: "GOLD", overall: 78 },
  { finish: "totw", label: "IN-FORM", overall: 85 },
  { finish: "hero", label: "HERO", overall: 89 },
  { finish: "icon", label: "ICON", overall: 93 },
  { finish: "toty", label: "TOTY", overall: 97 },
];

const TIER_PREVIEWS: { card: Card; label: string }[] = TIERS.map((t) => ({
  label: t.label,
  card: {
    ...SAMPLE_CARDS[0],
    finish: t.finish,
    finishLabel: t.label,
    overall: t.overall,
    club: t.finish === "icon" ? "legends" : "neutral",
    position: "CM",
    name: t.label,
    login: t.label.toLowerCase(),
    avatarUrl: SILHOUETTE,
    country: "",
    languageLogo: null,
    founder: undefined,
  },
}));

// The six GitHub signals behind each stat — accurate to the engine (PACE is a
// year of ALL contribution types, not just commits).
const READS = [
  { abbr: "PAC", gloss: "This year's activity: contributions and days you showed up" },
  { abbr: "SHO", gloss: "Commits shipped" },
  { abbr: "PAS", gloss: "Pull requests into your team's code, the signal that counts most" },
  { abbr: "DRI", gloss: "Your language range: broad helps, but the 10th counts for less" },
  { abbr: "DEF", gloss: "Code reviews" },
  { abbr: "PHY", gloss: "A lifetime of contributions over your years on the clock" },
];

// How the scout reads you — the three things that make a card a fingerprint
// rather than a score. These are independent truths, not steps, so no 01/02/03.
const LAWS = [
  {
    kicker: "MEASURED AGAINST YOU",
    lead: "Your own curve, not the world's.",
    body: "Each stat is weighed against the rest of your profile, so a high one marks where you stand out and a low one where you don't. That's why your weakest area can read lower than the raw number suggests. The card grades you on you.",
  },
  {
    kicker: "EVERY CARD HAS A SHAPE",
    lead: "Nobody's elite at everything.",
    body: "Your strongest signals get pushed up and your weakest pulled down, so the card leans instead of sitting flat. That lean is what decides your position and archetype, read off your stats, never picked.",
  },
  {
    kicker: "THE 90s ARE EARNED",
    lead: "One big year won't crown you.",
    body: "Stats top out at 88 on their own. The 90s take years on the clock and influence that lasts, so a legend rating is a track record, not a hot streak.",
    gold: true,
  },
];

export default function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // Close on Escape, move focus into the dialog, and play a subtle entrance
  // (the global reduced-motion reset makes the transition instant when asked).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    const t = setTimeout(() => setShown(true), 10);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-deep/80 p-[22px] backdrop-blur-[6px]"
      style={{ opacity: shown ? 1 : 0, transition: "opacity .25s ease" }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hiw-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-[min(780px,100%)] overflow-auto rounded-[22px] border border-line bg-[linear-gradient(180deg,var(--color-surface-2),var(--color-panel))] p-[clamp(28px,4.5vw,48px)] shadow-[0_40px_120px_rgba(0,0,0,.6)] outline-none"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0) scale(1)" : "translateY(14px) scale(.985)",
          transition: "opacity .4s ease, transform .45s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* brand wash bleeding in along the top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(126,200,242,.55), transparent)" }}
        />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[15px] text-ink-faint transition hover:bg-white/10 hover:text-ink"
        >
          ✕
        </button>

        {/* hero — the thesis: we read you, we don't rate you */}
        <div className="font-mono mb-[14px] text-[11px] font-semibold tracking-[.32em] text-brand">
          THE SCOUT&apos;S EYE
        </div>
        <h3
          id="hiw-title"
          className="font-display m-0 text-[clamp(30px,5.4vw,44px)] font-black leading-[.95] tracking-[-.01em]"
        >
          We don&apos;t rate you.
          <br />
          We read you<span className="text-brand">.</span>
        </h3>
        <p className="m-0 mt-[15px] max-w-[52ch] text-[16px] leading-[1.6] text-ink-dim">
          Six signals off your live GitHub, weighed against each other to find your shape. That shape is your card, so
          two devs with the same numbers still walk out different. Here&apos;s how to read yours.
        </p>

        {/* the three laws — hairline-separated, scout-vocab kickers */}
        <div className="mt-[26px] flex flex-col">
          {LAWS.map((law) => {
            const accent = law.gold ? "var(--color-gold-hi)" : "var(--color-brand)";
            return (
              <div key={law.kicker} className="border-t border-white/[0.08] py-[18px] first:border-t-0 first:pt-0">
                <div className="mb-[9px] flex items-center gap-[10px]">
                  <span className="h-[2px] w-[18px] flex-none rounded-full" style={{ background: accent }} />
                  <span className="font-mono text-[10.5px] font-bold tracking-[.2em]" style={{ color: accent }}>
                    {law.kicker}
                  </span>
                </div>
                <p className="font-display m-0 text-[20px] font-extrabold leading-tight text-ink">{law.lead}</p>
                <p className="m-0 mt-[7px] text-[15px] leading-[1.6] text-ink-faint">{law.body}</p>
              </div>
            );
          })}
        </div>

        {/* what feeds the six — a compact readout that echoes the card's stat block */}
        <div className="mt-[26px] border-t border-white/[0.08] pt-[22px]">
          <div className="font-mono mb-[16px] text-[11px] font-bold tracking-[.2em] text-ink-faint">
            WHAT FEEDS THE SIX
          </div>
          <div className="grid grid-cols-2 gap-x-[18px] gap-y-[15px] max-[440px]:grid-cols-1">
            {READS.map((r) => (
              <div key={r.abbr} className="flex items-start gap-[12px]">
                <span className="font-display mt-[1px] w-[46px] flex-none rounded-[7px] bg-brand/15 py-[6px] text-center text-[14px] font-extrabold tracking-[.04em] text-brand">
                  {r.abbr}
                </span>
                <span className="text-[14px] leading-[1.45] text-ink-faint">{r.gloss}</span>
              </div>
            ))}
          </div>
        </div>

        {/* the ladder — every finish tier as a real card, low to legend, so the
            frame of each rung is obvious at a glance */}
        <div className="mt-[26px] border-t border-white/[0.08] pt-[22px]">
          <div className="font-mono mb-[10px] text-[11px] font-bold tracking-[.2em] text-ink-faint">
            THE LADDER
          </div>
          <p className="m-0 mb-[18px] text-[14px] leading-[1.6] text-ink-faint">
            The finish tiers, bronze to legend. GOLD and up is where it gets fun: HERO is 88+ and 200+ active days,
            ICON is 90+ on a 4-year account, TOTY is every stat past 90.
          </p>
          <div className="grid grid-cols-7 gap-[clamp(6px,1.1vw,12px)] max-[720px]:grid-cols-4 max-[420px]:grid-cols-3">
            {TIER_PREVIEWS.map(({ card, label }) => (
              <div key={label} className="flex flex-col items-center gap-[8px]">
                <PlayerCard card={card} />
                <span className="font-mono text-[10px] font-bold tracking-[.12em] text-ink-mute">{label}</span>
              </div>
            ))}
          </div>
          <p className="m-0 mt-[18px] text-[13px] leading-[1.55] text-ink-mute">
            The top ones take years on the clock and influence that lasts, not one hot streak. No inputs, no edits,
            just the tape.
          </p>
        </div>
      </div>
    </div>
  );
}
