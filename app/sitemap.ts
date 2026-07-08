import type { MetadataRoute } from "next";

// Single static page (scouting is client-side via ?u=<login>), so only the home
// URL is enumerable. Update if you deploy under a custom domain.
const BASE = "https://pierry.github.io/gitfut-private";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: BASE, changeFrequency: "weekly", priority: 1 }];
}
