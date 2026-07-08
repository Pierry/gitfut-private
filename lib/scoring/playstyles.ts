import { formatCount } from "../format";
import type { Playstyle, Signals } from "./types";

// A predefined catalog of GitHub "playstyles". Each fires when its real signal
// crosses `base`; `plus` marks the elite "PlayStyle+" tier. A weak/empty profile
// crosses none, so it shows few or no playstyles — strength drives the count.
// `noun` builds the tooltip reason, e.g. "248k stars earned".
interface PlaystyleDef {
  name: string;
  icon: string; // lucide icon key, resolved in the UI
  noun: string;
  value: (s: Signals) => number;
  base: number;
  plus: number;
}

// Internal-work catalog: no stars/followers (meaningless on private repos). The
// signals that count — PRs, commits, reviews, contributions, activity, tenure.
const CATALOG: PlaystyleDef[] = [
  { name: "Connector", icon: "git-pull-request", noun: "pull requests", value: (s) => s.prs_to_others, base: 40, plus: 400 },
  { name: "Shipper", icon: "flame", noun: "commits this year", value: (s) => s.recent_commits, base: 200, plus: 1_500 },
  { name: "Reviewer", icon: "shield", noun: "code reviews", value: (s) => s.reviews, base: 30, plus: 300 },
  { name: "Workhorse", icon: "zap", noun: "active days this year", value: (s) => s.active_days_recent, base: 120, plus: 250 },
  { name: "Rapid Fire", icon: "fast-forward", noun: "contributions this year", value: (s) => s.recent_contributions, base: 500, plus: 2_500 },
  { name: "Marathoner", icon: "infinity", noun: "lifetime contributions", value: (s) => s.total_contributions_lifetime, base: 2_000, plus: 15_000 },
  { name: "Polyglot", icon: "languages", noun: "languages", value: (s) => s.languages, base: 5, plus: 9 },
  { name: "Prolific", icon: "folder-git", noun: "repositories", value: (s) => s.public_repos, base: 20, plus: 100 },
  { name: "Veteran", icon: "clock", noun: "years on GitHub", value: (s) => s.account_age_years, base: 4, plus: 10 },
];

const MAX_SHOWN = 8;

// Returns the qualifying playstyles, PlayStyle+ first, then by how strongly the
// profile clears each base threshold; capped so the list stays readable.
export function derivePlaystyles(s: Signals): Playstyle[] {
  return CATALOG.map((def) => ({ def, val: def.value(s) }))
    .filter(({ def, val }) => val >= def.base)
    .sort((a, b) => {
      const ap = a.val >= a.def.plus;
      const bp = b.val >= b.def.plus;
      if (ap !== bp) return ap ? -1 : 1;
      return b.val / b.def.base - a.val / a.def.base;
    })
    .slice(0, MAX_SHOWN)
    .map(({ def, val }) => ({
      name: def.name,
      icon: def.icon,
      plus: val >= def.plus,
      reason: `${formatCount(val)} ${def.noun}${val >= def.plus ? ", elite tier" : ""}.`,
    }));
}
