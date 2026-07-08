// Org gate for the PRIVATE fork. Its scoring is calibrated for company-internal
// work, so it should only ever score people INSIDE your organization. Anyone
// else is a public profile and belongs on the original public gitfut.com — where
// the public scoring lives — so we don't accidentally rate an outsider on the
// internal scale.
//
// "Internal" = the scouted user shares an organization with the TOKEN OWNER (a
// teammate), or IS the token owner. No org is hard-coded: we read the viewer's
// own orgs and the target's orgs from the same GraphQL endpoint the scout uses
// (CORS-friendly, one request), and intersect them. All client-side, viewer's PAT.

const ENDPOINT = "https://api.github.com/graphql";

interface OrgNode {
  login: string;
  organizations: { nodes: { login: string }[] };
}

const orgs = (n: { organizations: { nodes: { login: string }[] } } | null) =>
  new Set((n?.organizations.nodes ?? []).map((o) => o.login).filter(Boolean));

// True ONLY when we've CONFIRMED the user is outside every org the viewer belongs
// to — the case where they should be handed to public gitfut.com. Anything
// uncertain (viewer has no orgs, user not found, or the API errors) returns false
// so a real teammate is never bounced to the public site on a hiccup.
export async function isExternalProfile(username: string, token: string): Promise<boolean> {
  const login = username.trim().replace(/^@/, "");
  const query = `
    query($login: String!) {
      viewer { login organizations(first: 100) { nodes { login } } }
      user(login: $login) { login organizations(first: 100) { nodes { login } } }
    }`;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login } }),
    });
    if (!res.ok) return false; // uncertain → let the scout proceed
    const body = (await res.json()) as { data?: { viewer: OrgNode; user: OrgNode | null } };
    const viewer = body.data?.viewer;
    const user = body.data?.user;
    if (!viewer || !user) return false; // no data / user not found → don't misroute
    if (user.login.toLowerCase() === viewer.login.toLowerCase()) return false; // scouting yourself

    const mine = orgs(viewer);
    if (mine.size === 0) return false; // no org context to judge against
    const theirs = orgs(user);
    for (const o of theirs) if (mine.has(o)) return false; // shared org → internal
    return true; // confirmed: no org in common
  } catch {
    return false; // uncertain → let the scout proceed rather than misroute a teammate
  }
}
