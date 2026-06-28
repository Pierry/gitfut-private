// Top-language → logo resolution. Pure, framework-agnostic (no DOM): given the
// owned-repo list, rank languages by how many repos use each as their primary,
// then resolve a logo from the open `programming-languages-logos` catalog,
// served by jsDelivr.
//
// IMPORTANT: GitHub's `primaryLanguage` is the *byte-largest* language per repo,
// so a TypeScript/Python project with a big bundled/generated CSS or HTML file
// is reported as CSS/HTML. To keep the card's headline language meaningful we
// DEMOTE styling/markup/data/prose languages — the top slot goes to a real
// programming language whenever the dev has one (see NON_HEADLINE / rankLanguages).
//
// The catalog is small — exactly these 18 slugs (from its src/languages.json) —
// so most GitHub languages (Rust, Shell, Dart, Vue, Jupyter Notebook…) have NO
// logo. GitHub also returns DISPLAY names ("C++", "C#") that don't equal slugs,
// hence the explicit name→slug map below; anything not in it has no logo and
// falls through to the next ranked language (see topLanguageLogo).

const CDN_BASE = "https://cdn.jsdelivr.net/npm/programming-languages-logos/src";

// GitHub primaryLanguage.name (lowercased) → catalog slug. ONLY the 18 catalog
// languages appear here (plus the "C++"/"C#" display-name aliases). Keep this
// list in sync with the catalog's src/languages.json.
export const LANGUAGE_SLUGS: Record<string, string> = {
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",
  css: "css",
  go: "go",
  haskell: "haskell",
  html: "html",
  java: "java",
  javascript: "javascript",
  kotlin: "kotlin",
  lua: "lua",
  php: "php",
  python: "python",
  r: "r",
  ruby: "ruby",
  swift: "swift",
  typescript: "typescript",
};

// Styling / markup / prose / data / config languages (lowercased). These inflate
// by bytes but aren't a developer's "headline" language, so they're ranked below
// any real programming language. A dev with ONLY these still shows their top one.
const NON_HEADLINE = new Set([
  // styling
  "css", "scss", "sass", "less", "stylus", "postcss",
  // markup / templates
  "html", "xml", "svg", "pug", "haml", "ejs", "handlebars", "mustache", "liquid",
  // prose
  "markdown", "mdx", "tex",
  // data
  "json", "yaml", "toml", "csv", "ini",
  // build / config
  "dockerfile", "makefile", "cmake",
]);

// A "headline" language is a real programming language (anything not in the
// styling/markup/data/prose demotion set above).
export const isHeadlineLanguage = (name: string): boolean => !NON_HEADLINE.has(name.toLowerCase());

export interface LanguageLogo {
  name: string; // the GitHub language name this logo represents
  slug: string; // catalog slug
}

// Counts non-null primary languages and orders them by repo count (desc) with a
// deterministic name tie-break (asc), THEN floats headline (programming)
// languages above styling/markup/data — so a repo mislabeled "CSS" by GitHub
// can't headline a TypeScript/Python developer's card.
export function rankLanguages(repos: { language: string | null }[]): string[] {
  const counts = new Map<string, number>();
  for (const { language } of repos) {
    if (!language) continue;
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return [
    ...sorted.filter(([name]) => isHeadlineLanguage(name)),
    ...sorted.filter(([name]) => !isHeadlineLanguage(name)),
  ].map(([name]) => name);
}

// Case-insensitive lookup of a catalog slug for a GitHub language name.
export function logoSlugFor(name: string): string | null {
  return LANGUAGE_SLUGS[name.toLowerCase()] ?? null;
}

// Walks the ranked names and returns the first with a catalog logo — so a
// Rust-then-TypeScript dev shows the TypeScript logo rather than nothing. A
// styling/markup language only provides the logo when the dev has NO programming
// language at all (so a Rust+CSS dev shows no logo, not a CSS one).
export function topLanguageLogo(rankedNames: string[]): LanguageLogo | null {
  const hasHeadline = rankedNames.some(isHeadlineLanguage);
  for (const name of rankedNames) {
    if (hasHeadline && !isHeadlineLanguage(name)) continue;
    const slug = logoSlugFor(name);
    if (slug) return { name, slug };
  }
  return null;
}

// jsDelivr URL for a catalog slug. PNG (not SVG): the catalog's PNGs are
// full-colour with transparent backgrounds and a solid logo body, so they read
// on the light card art — the SVGs are light/white fills that vanish on it.
export function languageLogoUrl(slug: string): string {
  return `${CDN_BASE}/${slug}/${slug}.png`;
}
