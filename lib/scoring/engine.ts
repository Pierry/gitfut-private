import { countryForLogin } from "../geo";
import { topLanguageLogo } from "../github/languages";
import { deriveMetrics, deriveSkillMoves, deriveStyle, deriveWeakFoot, deriveWorkRate } from "./attributes";
import { FINISH_LABELS, FOUNDER_OVERALL, FOUNDERS, K, STATS, WEIGHTS } from "./constants";
import { derivePlaystyles } from "./playstyles";
import type {
  Archetype,
  Card,
  Family,
  Finish,
  Position,
  Signals,
  StatKey,
  Stats,
} from "./types";

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// A signal mapped 0–99 against a company-scale reference — IDENTICAL to the
// scouting-metric bars (lib/scoring/attributes). So the card's six stats ARE
// those metrics: the card face and the receipts always tell the same story.
const score = (value: number, ref: number): number =>
  value <= 0 ? 0 : clamp(Math.round((99 * Lg(value)) / Lg(ref)), 1, 99);

// §2 — the six stats, each a valued company-internal signal on its own bar.
// Directly, with no z-score/spike transform, so a dev who's elite on the metrics
// is elite on the card. References match the metric bars exactly.
function rawStats(s: Signals): Stats {
  return {
    pac: score(s.active_days_recent, 260), // PACE — days a year they ship
    sho: score(s.recent_commits, 1_500), // SHOOTING — commits (output)
    pas: score(s.prs_to_others, 600), // PASSING — pull requests (collaboration)
    dri: score(Math.min(s.account_age_years, K.ageCap), K.ageCap), // DRIBBLING — seasoning
    def: score(s.reviews, 400), // DEFENDING — code reviews (stewardship)
    phy: score(s.total_contributions_lifetime, 8_000), // PHYSICAL — contributions (volume)
  };
}

const POSITION_FAMILY: Record<Position, Family> = {
  ST: "Forward",
  RW: "Forward",
  CAM: "Playmaker",
  CM: "Playmaker",
  CDM: "Anchor",
  CB: "Anchor",
};

// Position from the three REAL contribution modes — commits (ship / ST), PRs into
// others' code (create / CAM), reviews (guard / CB) — with PRs and reviews mildly
// prized as the higher-signal collaborative work. PAC (active days), DRI
// (seasoning) and PHY (lifetime volume) all track tenure and "showing up" more
// than they describe a style, so they only flavour the edges — they never pick
// the role. This is what stops almost everyone landing on RW (PAC used to win the
// family) and lets heavy reviewers read as CB even on an otherwise strong card.
function positionFromShape(st: Stats): { position: Position; family: Family } {
  const modes = { sho: st.sho, pas: st.pas * 1.1, def: st.def * 1.1 };
  const ranked = (Object.keys(modes) as (keyof typeof modes)[]).sort((a, b) => modes[b] - modes[a]);
  const top = ranked[0];
  const margin = modes[ranked[0]] - modes[ranked[1]];
  const peak = STATS.reduce((m, k) => (st[k] > st[m] ? k : m), "pac" as StatKey);

  let position: Position;
  if (margin <= 6) {
    // No clear specialty — a box-to-box all-rounder, unless raw volume is their
    // single standout (a holding workhorse).
    position = peak === "phy" && st.phy >= 90 ? "CDM" : "CM";
  } else if (top === "sho") {
    // A shipper. RW only for the rare high-tempo roamer (always-on + broad).
    position = st.pac >= 92 && st.dri >= 85 ? "RW" : "ST";
  } else if (top === "pas") {
    // A creator. Reviews nearly as high → a deep-lying playmaker, not a pure CAM.
    position = st.def >= st.pas - 8 ? "CM" : "CAM";
  } else {
    // A reviewer/guard. Big lifetime volume tips it to a holding anchor.
    position = st.phy >= 90 && st.phy >= st.def ? "CDM" : "CB";
  }
  return { position, family: POSITION_FAMILY[position] };
}

// §3.6 — position-weighted, never a flat mean; stats alone cap at 88.
function weightedOVR(stats: Stats, family: Family): number {
  const w = WEIGHTS[family];
  const ovr = STATS.reduce((s, k) => s + stats[k] * w[k], 0);
  return Math.min(Math.round(ovr), K.ovrCap);
}

function pickFinish(overall: number, stats: Stats, s: Signals): Finish {
  const f = K.finish;
  if (K.iconAllowlist.includes(s.login)) return "icon";
  // TOTY — elite across the board: every stat clears the bar.
  if (STATS.every((k) => stats[k] > f.totyStat)) return "toty";
  // ICON — mature + elite: a seasoned account rated at the top.
  if (overall >= f.iconOverall && s.account_age_years >= f.iconAgeYears) return "icon";
  // HERO — high + relentless this year.
  if (overall >= f.heroOverall && s.active_days_recent > f.heroActiveDays) return "hero";
  if (overall >= f.goldMin) return "gold";
  if (overall >= f.silverMin) return "silver";
  return "bronze";
}

function archetypeFromShape(st: Stats, finish: Finish): Archetype {
  if (finish === "icon")
    return { name: "Galáctico", blurb: "hall-of-fame maintainer — high and balanced, earned over years" };
  const top = [...STATS].sort((a, b) => st[b] - st[a]);
  const peak = st[top[0]];
  const top2 = top.slice(0, 2);
  const has = (a: StatKey, b: StatKey) => top2.includes(a) && top2.includes(b);
  if (top[0] === "sho" && st.def < peak - 18 && st.pas < peak - 12)
    return { name: "Poacher", blurb: "one viral repo, clinical — a pure star-magnet finisher" };
  if (top[0] === "pas" && top2.includes("def"))
    return { name: "Regista", blurb: "deep playmaker — coordinates from the back with cross-repo PRs and reviews" };
  if (top[0] === "def" && top2.includes("pas"))
    return { name: "Libero", blurb: "ball-playing sweeper — a reviewer who also builds, keeping the codebase clean" };
  if (top[0] === "dri")
    return { name: "Fantasista", blurb: "the magician — a polyglot working across many stacks" };
  if (has("phy", "sho")) return { name: "Target Man", blurb: "a prolific shipper whose output lands" };
  if (has("phy", "pac") || has("pac", "dri"))
    return { name: "Mezzala", blurb: "the engine — a relentless box-to-box daily-driver" };
  if (top[0] === "def")
    return { name: "Libero", blurb: "ball-playing sweeper — a reviewer who also builds, keeping the codebase clean" };
  if (top[0] === "sho")
    return { name: "Poacher", blurb: "one viral repo, clinical — a pure star-magnet finisher" };
  return { name: "Mezzala", blurb: "the engine — a relentless box-to-box daily-driver" };
}

export function buildCard(s: Signals): Card {
  const stats = rawStats(s);
  const { position, family } = positionFromShape(stats);
  const baseOVR = weightedOVR(stats, family);
  // "Seasoning" — years on the clock, 0–1 (account age caps at K.ageCap). Kept
  // for the report; the overall is now just the position-weighted stat average.
  const L = Math.min(s.account_age_years, K.ageCap) / K.ageCap;

  // Founders get a forced overall (>89) and the bespoke "founder" tier. We drive
  // `finish` directly rather than via pickFinish: any overall >= 90 would
  // otherwise auto-promote to ICON (and flip club/archetype), hijacking the look.
  const founder = FOUNDERS[s.login.toLowerCase()];
  const overall = founder ? FOUNDER_OVERALL[s.login.toLowerCase()] : baseOVR;
  const finish: Finish = founder ? "founder" : pickFinish(overall, stats, s);
  const archetype = founder
    ? { name: "Founder", blurb: "co-founder of GitFut — they built the very scout reading this card" }
    : archetypeFromShape(stats, finish);
  const skill = deriveSkillMoves(s);
  const weak = deriveWeakFoot(stats);
  const work = deriveWorkRate(stats);
  const style = deriveStyle(s);
  // Headline language's own catalog logo (null when it has none) — never a
  // different language's icon, so the logo always matches `topLanguage`.
  const languageLogo = topLanguageLogo(s.rankedLanguages ?? []);
  return {
    login: s.login,
    name: s.name,
    avatarUrl: s.avatarUrl,
    country: countryForLogin(s.login, s.location) ?? "",
    club: finish === "icon" ? "legends" : "neutral",
    stats,
    position,
    family,
    baseOVR,
    overall,
    finish,
    finishLabel: FINISH_LABELS[finish],
    archetype: archetype.name,
    archetypeBlurb: archetype.blurb,
    topLanguage: s.topLanguage ?? null,
    languageLogo,
    ...(founder ? { founder } : null),
    legacy: { L },
    report: {
      skillMoves: skill.value,
      weakFoot: weak.value,
      workRate: { attack: work.attack, defense: work.defense },
      style: style.value,
      reasons: {
        skillMoves: skill.reason,
        weakFoot: weak.reason,
        workRate: work.reason,
        style: style.reason,
      },
      playstyles: derivePlaystyles(s),
      metrics: deriveMetrics(s),
    },
  };
}
