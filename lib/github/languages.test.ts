import { describe, expect, it } from "vitest";
import { languageLogoUrl, logoSlugFor, rankLanguages, topLanguageLogo } from "./languages";

// We test the language DECISIONS: deterministic ranking, the GitHub-name→slug
// map (incl. "C++"/"C#" display names and uncovered languages), and the
// fallback walk to the first ranked language that actually has a logo.

const repos = (...langs: (string | null)[]) => langs.map((language) => ({ language }));

describe("rankLanguages", () => {
  it("orders by repo count, descending", () => {
    expect(rankLanguages(repos("Go", "TypeScript", "TypeScript", "TypeScript", "Go"))).toEqual([
      "TypeScript",
      "Go",
    ]);
  });

  it("breaks count ties by name, ascending (deterministic)", () => {
    expect(rankLanguages(repos("Ruby", "Go", "Python"))).toEqual(["Go", "Python", "Ruby"]);
  });

  it("ignores repos with no primary language", () => {
    expect(rankLanguages(repos("Rust", null, "Rust", null))).toEqual(["Rust"]);
  });

  it("demotes styling/markup below real programming languages", () => {
    // GitHub reports a byte-heavy repo as CSS; Python should still headline.
    expect(
      rankLanguages(repos("CSS", "CSS", "CSS", "CSS", "Python", "Python", "Python", "HTML")),
    ).toEqual(["Python", "CSS", "HTML"]);
  });

  it("keeps styling languages when there's no programming language", () => {
    expect(rankLanguages(repos("CSS", "CSS", "HTML"))).toEqual(["CSS", "HTML"]);
  });

  it("returns an empty list when there are no languages", () => {
    expect(rankLanguages(repos(null, null))).toEqual([]);
    expect(rankLanguages([])).toEqual([]);
  });
});

describe("logoSlugFor", () => {
  it("maps catalog languages case-insensitively", () => {
    expect(logoSlugFor("TypeScript")).toBe("typescript");
    expect(logoSlugFor("typescript")).toBe("typescript");
    expect(logoSlugFor("Python")).toBe("python");
  });

  it("maps GitHub display names to slugs", () => {
    expect(logoSlugFor("C++")).toBe("cpp");
    expect(logoSlugFor("C#")).toBe("csharp");
  });

  it("returns null for languages not in the catalog", () => {
    for (const name of ["Rust", "Shell", "Jupyter Notebook", "Dart", "Vue", "Dockerfile"]) {
      expect(logoSlugFor(name)).toBeNull();
    }
  });
});

describe("topLanguageLogo", () => {
  it("returns the top language when it has a logo", () => {
    expect(topLanguageLogo(["TypeScript", "Rust"])).toEqual({ name: "TypeScript", slug: "typescript" });
  });

  it("falls back to the next ranked language with a logo", () => {
    expect(topLanguageLogo(["Rust", "TypeScript"])).toEqual({ name: "TypeScript", slug: "typescript" });
  });

  it("returns null when no ranked language has a logo", () => {
    expect(topLanguageLogo(["Rust", "Shell"])).toBeNull();
  });

  it("never uses a styling/markup logo when a programming language exists", () => {
    expect(topLanguageLogo(["Rust", "CSS"])).toBeNull();
    expect(topLanguageLogo(["Python", "CSS"])).toEqual({ name: "Python", slug: "python" });
  });

  it("uses a styling logo only when there's no programming language", () => {
    expect(topLanguageLogo(["CSS", "HTML"])).toEqual({ name: "CSS", slug: "css" });
  });

  it("returns null for an empty list", () => {
    expect(topLanguageLogo([])).toBeNull();
  });
});

describe("languageLogoUrl", () => {
  it("builds the jsDelivr PNG path for a slug", () => {
    expect(languageLogoUrl("cpp")).toBe(
      "https://cdn.jsdelivr.net/npm/programming-languages-logos/src/cpp/cpp.png",
    );
  });
});
