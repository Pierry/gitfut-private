import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Exercises the real fetchProfile against a scripted fetch. This fork scouts only
// through the viewer's own token, so there's no pool/failover — just: the token is
// carried on every request, errors map correctly, and a hung request aborts.
vi.mock("server-only", () => ({}));

import { fetchProfile } from "@/lib/github/client";

const TOKEN = "ghp_viewer_token";
const NOW = new Date("2026-07-03T12:00:00Z");
const LOGIN = "someuser";
const nowSec = () => Math.floor(Date.now() / 1000);

// Minimal-but-complete profile node; createdAt 2023 -> one lifetime batch, so a
// successful scout is exactly 2 requests (profile + lifetime).
const USER = {
  login: LOGIN,
  name: null,
  avatarUrl: "https://example.com/a.png",
  location: null,
  createdAt: "2023-02-01T00:00:00Z",
  followers: { totalCount: 1 },
  repositories: { totalCount: 0, nodes: [] },
  recent: {
    totalCommitContributions: 1,
    totalPullRequestContributions: 0,
    totalPullRequestReviewContributions: 0,
    totalIssueContributions: 0,
    restrictedContributionsCount: 3,
    contributionCalendar: { weeks: [] },
  },
};

const okHeaders = { "x-ratelimit-remaining": "4999", "x-ratelimit-reset": String(nowSec() + 3600) };
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: okHeaders });
const okFor = (reqBody: string) =>
  reqBody.includes("query Profile") ? ok({ data: { user: USER } }) : ok({ data: { user: {} } });

type Call = { token: string; body: string };
let calls: Call[] = [];
function scriptFetch(respond: (token: string, body: string) => Response) {
  const mock = vi.fn(async (_url: unknown, init?: RequestInit) => {
    const token = String((init?.headers as Record<string, string>).Authorization).replace("Bearer ", "");
    const body = String(init?.body);
    calls.push({ token, body });
    return respond(token, body);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchProfile with the viewer token", () => {
  it("carries the viewer's token on every request and returns the parsed profile", async () => {
    scriptFetch((_t, body) => okFor(body));
    const payload = await fetchProfile(LOGIN, TOKEN, NOW);

    expect(payload.login).toBe(LOGIN);
    expect(payload.recentRestricted).toBe(3); // private contribution count survives normalization
    expect(calls.length).toBe(2); // profile + one lifetime batch
    for (const c of calls) expect(c.token).toBe(TOKEN);
  });

  it("maps a 401 to a config error (bad/expired token)", async () => {
    scriptFetch(() => new Response("nope", { status: 401 }));
    await expect(fetchProfile(LOGIN, TOKEN, NOW)).rejects.toMatchObject({ type: "config" });
  });

  it("maps a 403/rate-limit to a ratelimit error", async () => {
    scriptFetch(() => new Response(JSON.stringify({ message: "rate limited" }), { status: 403 }));
    await expect(fetchProfile(LOGIN, TOKEN, NOW)).rejects.toMatchObject({ type: "ratelimit" });
  });

  it("maps a GraphQL-level RATE_LIMIT body (HTTP 200) to a ratelimit error", async () => {
    scriptFetch(() => ok({ errors: [{ type: "RATE_LIMIT", message: "exceeded" }] }));
    await expect(fetchProfile(LOGIN, TOKEN, NOW)).rejects.toMatchObject({ type: "ratelimit" });
  });

  it("maps a null user to notfound", async () => {
    scriptFetch(() => ok({ data: { user: null } }));
    await expect(fetchProfile(LOGIN, TOKEN, NOW)).rejects.toMatchObject({ type: "notfound" });
  });

  it("fails as config when no token is supplied", async () => {
    const mock = scriptFetch((_t, body) => okFor(body));
    await expect(fetchProfile(LOGIN, "", NOW)).rejects.toMatchObject({ type: "config" });
    expect(mock).not.toHaveBeenCalled();
  });
});

describe("fetchProfile username validation", () => {
  it("accepts legacy usernames with a trailing hyphen (real GitHub accounts)", async () => {
    scriptFetch((_t, body) => okFor(body));
    await expect(fetchProfile("gandalf-", TOKEN, NOW)).resolves.toBeTruthy();
    expect(calls.length).toBeGreaterThan(0);
  });

  it("also accepts leading and double hyphens (other legacy edge cases)", async () => {
    scriptFetch((_t, body) => okFor(body));
    await expect(fetchProfile("-gandalf", TOKEN, NOW)).resolves.toBeTruthy();
    await expect(fetchProfile("gan--dalf", TOKEN, NOW)).resolves.toBeTruthy();
  });

  it("still rejects impossible input before any network call", async () => {
    const mock = scriptFetch((_t, body) => okFor(body));
    for (const bad of ["foo bar", "foo@bar", "", "-", "a".repeat(40)]) {
      await expect(fetchProfile(bad, TOKEN, NOW)).rejects.toMatchObject({ type: "invalid" });
    }
    expect(mock).not.toHaveBeenCalled();
  });
});

describe("fetchProfile request timeout", () => {
  it("aborts a hung request at 8s (under Vercel's ~10s cap) and fails as a network error", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = fetchProfile(LOGIN, TOKEN);
    const assertion = expect(result).rejects.toMatchObject({ type: "network" });

    // First attempt aborts at the 8s timeout, one retry after the backoff delay,
    // then the second attempt aborts too -> terminal network failure.
    await vi.advanceTimersByTimeAsync(8_000);
    await vi.advanceTimersByTimeAsync(250);
    await vi.advanceTimersByTimeAsync(8_000);

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
