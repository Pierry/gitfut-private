import { describe, expect, it } from "vitest";
import { countryFromLocation } from "@/lib/geo";

// The UK home nations are separate football sides, so a Scottish/Welsh/etc.
// profile should fly its own flag instead of being collapsed onto the Union Flag.
describe("countryFromLocation — UK home nations", () => {
  it("resolves each home nation to its own flag code", () => {
    expect(countryFromLocation("Scotland")).toBe("sct");
    expect(countryFromLocation("Wales")).toBe("wls");
    expect(countryFromLocation("England")).toBe("eng");
    expect(countryFromLocation("Northern Ireland")).toBe("nir");
  });

  it("resolves home-nation cities to the right nation", () => {
    expect(countryFromLocation("Edinburgh")).toBe("sct");
    expect(countryFromLocation("Glasgow, Scotland")).toBe("sct");
    expect(countryFromLocation("Cardiff")).toBe("wls");
    expect(countryFromLocation("Belfast")).toBe("nir");
    expect(countryFromLocation("London")).toBe("eng");
    expect(countryFromLocation("Manchester, UK")).toBe("eng"); // city segment wins over the UK segment
  });

  it("keeps UK-wide terms on the Union Flag", () => {
    for (const t of ["United Kingdom", "UK", "Britain", "Great Britain"]) {
      expect(countryFromLocation(t)).toBe("gb");
    }
  });

  it("leaves non-UK locations unchanged", () => {
    expect(countryFromLocation("France")).toBe("fr");
    expect(countryFromLocation("San Francisco")).toBe("us");
    expect(countryFromLocation("Berlin, Germany")).toBe("de");
    expect(countryFromLocation("Texas")).toBe("us");
    expect(countryFromLocation("nowhere-ville")).toBeNull();
  });
});
