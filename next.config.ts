import type { NextConfig } from "next";

// Static export for GitHub Pages: `next build` emits a fully static site to ./out
// (no server). All scouting runs client-side through the viewer's own token, so
// there are no API routes to host.
//
// GitHub Pages project sites are served under /<repo>, so production needs a
// basePath. Dev keeps it empty so http://localhost:3000 works as usual. If you
// deploy to a user/root page or a custom domain, set NEXT_PUBLIC_BASE_PATH="".
const basePath =
  process.env.NODE_ENV === "production" ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/gitfut-private") : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true }, // no Image Optimization server on a static host
  // Exposed to the client so lib/asset can prefix /public assets (card art,
  // flags, mascot) that raw <img>/CSS url() reference — next/image prefixes
  // basePath automatically, but hand-written paths don't.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
