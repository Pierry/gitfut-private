import Background from "@/components/Background";
import AppShell from "@/components/AppShell";
import { getRepoStars } from "@/lib/github/stars";
import { getScoutCount } from "@/lib/analytics";

// Dynamic so the live scout count is fresh per load (the stars fetch keeps its
// own 1h cache regardless).
export const dynamic = "force-dynamic";

export default async function Home() {
  const [stars, scoutCount] = await Promise.all([getRepoStars(), getScoutCount()]);
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <AppShell stars={stars} scoutCount={scoutCount} />
    </div>
  );
}
