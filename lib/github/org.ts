// Org gate for the PRIVATE fork. Its scoring is calibrated for company-internal
// work, so it should only ever score people INSIDE your organization. Anyone
// else is a public profile and belongs on the original public gitfut.com — where
// the public scoring lives — so we don't accidentally rate an outsider on the
// internal scale.
//
// "Internal" = the scouted user is a member of an organization the TOKEN OWNER
// also belongs to (a teammate). No org is hard-coded: we read the viewer's own
// orgs from their token, then check membership. All calls are client-side with
// the viewer's PAT (read:org), same as the scout itself.

const API = "https://api.github.com";

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

// The token owner's organizations (includes private memberships with read:org).
async function viewerOrgs(token: string): Promise<string[]> {
  const res = await fetch(`${API}/user/orgs?per_page=100`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`orgs ${res.status}`);
  const orgs = (await res.json()) as { login: string }[];
  return orgs.map((o) => o.login).filter(Boolean);
}

// Is `username` a member of `org`? 204 = member (incl. private members, since the
// viewer is a member of the org we're asking about); 404 = not. `redirect:manual`
// so the "requester isn't a member" 302 can't be silently followed into a member
// listing — we treat anything but 204 as "not a member".
async function isMemberOf(org: string, username: string, token: string): Promise<boolean> {
  const res = await fetch(`${API}/orgs/${encodeURIComponent(org)}/members/${encodeURIComponent(username)}`, {
    headers: authHeaders(token),
    redirect: "manual",
  });
  return res.status === 204;
}

// True ONLY when we've CONFIRMED the user is outside every org the viewer belongs
// to — the case where they should be handed to public gitfut.com. Anything
// uncertain (viewer has no orgs, or the API errors) returns false so a real
// teammate is never bounced to the public site on a hiccup.
export async function isExternalProfile(username: string, token: string): Promise<boolean> {
  try {
    const orgs = await viewerOrgs(token);
    if (orgs.length === 0) return false; // no org context to judge against
    const memberships = await Promise.all(orgs.map((o) => isMemberOf(o, username, token)));
    return !memberships.some(Boolean);
  } catch {
    return false; // uncertain → let the scout proceed rather than misroute a teammate
  }
}
