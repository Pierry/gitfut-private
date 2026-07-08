// Prefix a root-relative /public asset path with the deploy basePath (e.g.
// "/gitfut-private" on GitHub Pages, "" in dev). next/image does this for you,
// but raw <img src>, CSS url() and mask-image references don't — use this for
// those so card art, flags and the mascot resolve under a basePath.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return path.startsWith("/") ? BASE + path : path;
}
