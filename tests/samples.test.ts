import { describe, expect, it } from "vitest";
import { SAMPLE_CARDS } from "@/lib/github/samples";

// Locks the showcase invariants: pinned origin countries, and the language logo
// matching the headline language (no fall-through to a different icon).
describe("showcase samples", () => {
  const by = Object.fromEntries(SAMPLE_CARDS.map((c) => [c.login, c]));

  it("pin origin countries (birthplace, not the GitHub location)", () => {
    expect(by["torvalds"].country).toBe("us"); // Finland, not Portland/US
    expect(by["pewdiepie-archdaemon"].country).toBe("se"); // Sweden
    expect(by["ThePrimeagen"].country).toBe("us");
    expect(by["t3dotgg"].country).toBe("us");
  });

  it("language logo matches the top language (Devicon), never a mismatch", () => {
    // ThePrimeagen's #1 is Rust — Devicon has it, so the Rust logo, not a TS icon.
    expect(by["ThePrimeagen"].topLanguage).toBe("Rust");
    expect(by["ThePrimeagen"].languageLogo).toEqual({ name: "Rust", slug: "rust-original" });
    expect(by["torvalds"].languageLogo).toEqual({ name: "C", slug: "c-original" });
    expect(by["t3dotgg"].languageLogo).toEqual({ name: "TypeScript", slug: "typescript-original" });
  });
});
