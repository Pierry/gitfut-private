import { beforeEach, describe, expect, it, vi } from "vitest";

// scoutCard is now a thin, token-required wrapper: fetchProfile (with the viewer's
// token) -> signals -> buildCard. No cache, no single-flight. These pin that the
// token is threaded through and errors propagate.
vi.mock("server-only", () => ({}));

const fetchProfile = vi.fn();
vi.mock("@/lib/github/client", () => ({ fetchProfile: (u: string, t: string) => fetchProfile(u, t) }));
vi.mock("@/lib/github/signals", () => ({ signalsFromPayload: (p: unknown) => p }));
vi.mock("@/lib/scoring/engine", () => ({ buildCard: (s: unknown) => s }));

import { scoutCard } from "@/lib/scout";

const payload = (login: string) => ({ login, name: login });

beforeEach(() => {
  fetchProfile.mockReset();
});

describe("scoutCard", () => {
  it("threads the viewer token to fetchProfile and returns the built card", async () => {
    fetchProfile.mockResolvedValueOnce(payload("torvalds"));
    const card = await scoutCard("Torvalds", "ghp_tok");
    expect(card).toMatchObject({ login: "torvalds" });
    expect(fetchProfile).toHaveBeenCalledWith("Torvalds", "ghp_tok");
  });

  it("propagates the scout error unchanged", async () => {
    fetchProfile.mockRejectedValueOnce({ type: "ratelimit", message: "limited" });
    await expect(scoutCard("torvalds", "ghp_tok")).rejects.toMatchObject({ type: "ratelimit" });
  });

  it("fetches every call — there is no cache", async () => {
    fetchProfile.mockResolvedValue(payload("torvalds"));
    await scoutCard("torvalds", "ghp_tok");
    await scoutCard("torvalds", "ghp_tok");
    expect(fetchProfile).toHaveBeenCalledTimes(2);
  });
});
