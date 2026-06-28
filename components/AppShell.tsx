"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ScoutForm from "@/components/ScoutForm";
import CardFan from "@/components/CardFan";
import LoadingScreen from "@/components/LoadingScreen";
import HowItWorksModal from "@/components/HowItWorksModal";
import { SAMPLE_CARDS } from "@/lib/github/samples";
import { formatCount } from "@/lib/format";

// lucide dropped its brand marks, so the GitHub octocat is an inline SVG.
function GithubMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

export default function AppShell({ stars, scoutCount }: { stars: number | null; scoutCount: number | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Mark this tab as "has visited home" so a scouted card shows BACK, while a
  // directly-opened / shared card link (no home visit) shows a "make your card"
  // CTA instead. sessionStorage is per-tab, so a fresh tab from a share is direct.
  useEffect(() => {
    try {
      sessionStorage.setItem("gitfut:seen-home", "1");
    } catch {}
  }, []);

  // Scouting navigates to the canonical /<username> route. The transition keeps
  // the loading screen up (with the mascot + puns) while the report is fetched
  // and server-rendered; the route then plays its own reveal.
  const handleScout = (name: string) => {
    const login = name.trim().replace(/^@/, "");
    if (!login) return;
    setPending(login);
    startTransition(() => router.push(`/${encodeURIComponent(login)}`));
  };

  if (isPending && pending) return <LoadingScreen login={pending} />;

  return (
    <>
      <main className="relative z-[2] flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[1180px] flex-1 items-center gap-[clamp(24px,5vw,72px)] px-[clamp(22px,5vw,56px)] max-[860px]:flex-col max-[860px]:gap-[34px] max-[860px]:pb-6 max-[860px]:pt-[clamp(26px,5vh,40px)] max-[860px]:text-center">
          <ScoutForm
            loading={isPending}
            error={null}
            scoutCount={scoutCount}
            onScout={handleScout}
            onOpenModal={() => setModalOpen(true)}
          />
          <CardFan cards={SAMPLE_CARDS} onPick={handleScout} />
        </div>
        <footer className="relative z-[2] flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
          <a
            href="https://github.com/younesfdj/gitfut"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[9px] rounded-[10px] px-[15px] py-[9px] text-[13.5px] font-semibold text-ink-faint transition hover:bg-white/5 hover:text-ink"
          >
            {/* Real repo stars; the count only shows once it's worth showing
                (>= 50), otherwise it's just a plain GitHub link. */}
            {stars !== null && stars >= 50 ? (
              <>
                Support the project
                <span className="inline-flex items-center gap-[5px]">
                  <Star color="var(--color-gold)" fill="var(--color-gold)" size={13} />
                  <span className="font-mono font-semibold text-ink-dim">{formatCount(stars)}</span>
                </span>
              </>
            ) : (
              <>
                <GithubMark size={15} />
                Support the project
              </>
            )}
          </a>
        </footer>
      </main>

      {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
