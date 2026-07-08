import type { Family, Finish, FounderMeta, StatKey, Stats } from "./types";

export const STATS: StatKey[] = ["pac", "sho", "pas", "dri", "def", "phy"];

// Canonical stat → display abbreviation: the single source for any surface that
// labels the six stats (the Duel's shootout rows read these).
export const STAT_LABELS: Record<StatKey, string> = {
  pac: "PAC",
  sho: "SHO",
  pas: "PAS",
  dri: "DRI",
  def: "DEF",
  phy: "PHY",
};

// The attacking/technical four share sub-skills in real FUT cards (dribbling and
// pace pull from the same agility/balance traits, etc.), so they're kept cohesive
// — pulled toward their own group mean after the spike. DEF/PHY stay free: role
// explains those (attackers are simply poor defenders), so they may break away.
export const ATTACK_STATS: StatKey[] = ["pac", "sho", "pas", "dri"];

// Calibrated for PRIVATE, company-internal work: stars, followers and issues are
// meaningless there (nobody stars internal repos, nobody follows colleagues, few
// teams use GitHub issues), so they're dropped from scoring entirely. What counts
// is real contribution: pull requests (the highest signal), commits, code
// reviews, lifetime contributions, account age and active days.
export const K = {
  // §3.1 magnitude → where the card's stats gravitate. Internal signals only.
  magnitude: { contrib: 0.5, pr: 0.5, review: 0.34, commit: 0.34, age: 0.08, activeDays: 0.004, b: -3.7, lo: 50, hi: 86 },
  tension: {
    alpha: 0.7,
    pairs: [
      ["sho", "def"],
      ["dri", "phy"],
      ["pac", "def"],
    ] as [StatKey, StatKey][],
  },
  spike: { base: 8, cohesion: 0.6 },
  // §4 the 88→99 range, bought with tenure + sustained real output (no stars/followers).
  legacy: { age: 0.85, activeYears: 0.5, contrib: 0.55, activeDays: 1.4, b: -5.6, activeCap: 12, bonusMax: 12 },
  ovrCap: 90,
  // Account age counts, but tops out fast: 4 years is already a maxed bar —
  // anything beyond that is noise, so it's capped in the scoring.
  ageCap: 4,
  finish: {
    // ICON: mature + elite. HERO: high + very active this year. TOTY: elite across
    // the board. (bronze/silver/gold/in-form are overall-threshold tiers.)
    iconOverall: 90,
    iconAgeYears: 4,
    heroOverall: 88,
    heroActiveDays: 200,
    totyStat: 90, // every stat must clear this
    goldMin: 72,
    silverMin: 60,
  },
  iconAllowlist: ["torvalds"],
};

export const WEIGHTS: Record<Family, Stats> = {
  Forward: { pac: 0.2, sho: 0.3, pas: 0.1, dri: 0.2, def: 0.05, phy: 0.15 },
  Playmaker: { pac: 0.1, sho: 0.15, pas: 0.3, dri: 0.25, def: 0.1, phy: 0.1 },
  Anchor: { pac: 0.1, sho: 0.05, pas: 0.15, dri: 0.1, def: 0.4, phy: 0.2 },
};

export const FINISH_LABELS: Record<Finish, string> = {
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  totw: "IN-FORM",
  hero: "HERO",
  toty: "TOTY",
  icon: "ICON",
  founder: "FOUNDER",
};

// The people who built gitfut. Keyed by LOWERCASE GitHub login; matched
// case-insensitively in buildCard. Each gets a forced overall (>89), bespoke
// card art (public/cards), and an accent that tints their card + scout report.
export const FOUNDERS: Record<string, FounderMeta> = {
  younesfdj: {
    art: "/cards/founder-red.png",
    accent: "#ff2f45",
    label: "FOUNDER",
    tagline: "Co-founder of gitfut",
  },
  mawsis: {
    art: "/cards/founder-chrome.png",
    accent: "#d8dde3",
    label: "FOUNDER",
    tagline: "Co-founder of gitfut",
  },
};

// Forced overalls (kept beside FOUNDERS but separate so the FounderMeta shape
// stays presentation-only). Both are >89 by design.
export const FOUNDER_OVERALL: Record<string, number> = {
  younesfdj: 93,
  mawsis: 91,
};
