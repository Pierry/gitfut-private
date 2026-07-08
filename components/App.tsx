"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ScoutForm from "@/components/ScoutForm";
import CardFan from "@/components/CardFan";
import LoadingScreen from "@/components/LoadingScreen";
import ResultView from "@/components/ResultView";
import NotScouted from "@/components/NotScouted";
import Background from "@/components/Background";
import FooterCredit from "@/components/FooterCredit";
import GithubStar from "@/components/GithubStar";
import Collection from "@/components/Collection";
import { SAMPLE_CARDS } from "@/lib/github/samples";
import { scout } from "@/lib/scout";
import { isExternalProfile } from "@/lib/github/org";
import { getPat } from "@/lib/pat";
import { pickFlag } from "@/lib/flagPriority";
import { writeCardCache } from "@/hooks/useScout";
import { addToCollection, getStoredSignals } from "@/lib/collection";
import { decodeShare } from "@/lib/cardLink";
import type { Card, Signals } from "@/lib/scoring/types";
import type { GithubError } from "@/lib/github/client";

const HowItWorksModal = dynamic(() => import("@/components/HowItWorksModal"), { ssr: false });
const WhatsNew = dynamic(() => import("@/components/WhatsNew"), { ssr: false });

const GITFUT = "https://gitfut.com";
type View = "home" | "loading" | "result" | "error";

// Reads the `?u=<login>` (and optional `?country=`) query from the URL, so a
// scouted card is shareable/bookmarkable on a static host with no server routing.
function readQuery(): { login: string | null; country: string | null } {
  if (typeof window === "undefined") return { login: null, country: null };
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("u");
  return { login: raw ? raw.trim().replace(/^@/, "") : null, country: p.get("country") };
}

// Single-page controller for the private, fully-static fork. All scouting runs
// in the browser through the viewer's own token (see lib/scout). No token → hand
// the visitor to the public gitfut.com. State lives in the `?u=` query param
// instead of a server route, so it deploys as static files (GitHub Pages).
export default function App({ stars }: { stars: number | null }) {
  const [view, setView] = useState<View>("home");
  const [card, setCard] = useState<Card | null>(null);
  const [signals, setSignals] = useState<Signals | null>(null); // the seed, for short share links
  const [error, setError] = useState<GithubError | null>(null);
  const [target, setTarget] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  // Mark this tab as "has visited home" so a scouted card shows BACK vs a "make
  // your own card" CTA on a shared link.
  useEffect(() => {
    try {
      sessionStorage.setItem("gitfut:seen-home", "1");
    } catch {}
  }, []);

  const runScout = useCallback(async (login: string, country: string | null) => {
    const token = getPat();
    const toPublic = () => {
      // Hand the visitor to the public site — where public scoring lives — instead
      // of scoring them on this fork's internal scale.
      const q = country ? `?country=${encodeURIComponent(country)}` : "";
      window.location.href = `${GITFUT}/${encodeURIComponent(login)}${q}`;
    };
    if (!token) {
      // Private fork can't scout without a token → send them to the public site.
      toPublic();
      return;
    }
    setTarget(login);
    setError(null);
    setView("loading");
    // Only score people inside your org here; outsiders go to public gitfut.com so
    // the internal scoring never lands on a public profile.
    if (await isExternalProfile(login, token)) {
      toPublic();
      return;
    }
    try {
      const { card: fresh, signals: sig } = await scout(login, token);
      writeCardCache(fresh, true);
      const withFlag = { ...fresh, country: pickFlag(country, fresh.country) ?? "" };
      addToCollection(withFlag, sig); // browser-saved binder, with the seed for short shares
      setSignals(sig);
      setCard(withFlag);
      setView("result");
    } catch (e) {
      setError(e as GithubError);
      setView("error");
    }
  }, []);

  // Open a shared card packed into `?c=` — decoded and rendered with NO token or
  // GitHub call, so anyone can see the card the sharer generated.
  const openShared = useCallback(async (encoded: string) => {
    setView("loading");
    setError(null);
    const decoded = await decodeShare(encoded);
    if (decoded) {
      addToCollection(decoded.card, decoded.signals); // keep the received card in the recipient's binder
      setSignals(decoded.signals ?? null);
      setTarget(decoded.card.login);
      setCard(decoded.card);
      setView("result");
    } else {
      setError({ type: "network", message: "This shared card link couldn't be read." });
      setView("error");
    }
  }, []);

  // On load and on back/forward, sync the view to the URL. A shared `?c=` wins
  // over `?u=` (it needs no token).
  useEffect(() => {
    const sync = () => {
      const shared = new URLSearchParams(window.location.search).get("c");
      if (shared) {
        openShared(shared);
        return;
      }
      const { login, country } = readQuery();
      if (login) runScout(login, country);
      else {
        setView("home");
        setCard(null);
        setError(null);
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [runScout, openShared]);

  const handleScout = (name: string) => {
    const login = name.trim().replace(/^@/, "");
    if (!login) return;
    if (!getPat()) {
      window.location.href = `${GITFUT}/${encodeURIComponent(login)}`;
      return;
    }
    window.history.pushState(null, "", `?u=${encodeURIComponent(login)}`);
    runScout(login, null);
  };

  const goHome = () => {
    window.history.pushState(null, "", window.location.pathname);
    setView("home");
    setCard(null);
    setSignals(null);
    setError(null);
  };

  // Open a card straight from the saved collection — instant, no refetch.
  const openStored = (c: Card) => {
    setTarget(c.login);
    setError(null);
    setSignals(getStoredSignals(c.login) ?? null);
    setCard(c);
    setView("result");
    window.history.pushState(null, "", `?u=${encodeURIComponent(c.login)}`);
  };

  const onCountryChange = (code: string) => {
    if (!card) return;
    const next = { ...card, country: code };
    setCard(next);
    writeCardCache(next, true);
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("country", code);
    else url.searchParams.delete("country");
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  if (view === "loading") return <LoadingScreen login={target} />;

  if (view === "result" && card)
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <ResultView
          key={card.login}
          card={card}
          signals={signals ?? undefined}
          onBack={goHome}
          onCountryChange={onCountryChange}
          stars={stars}
          canonicalCountry={pickFlag(null, card.country) ?? ""}
        />
      </div>
    );

  if (view === "error" && error)
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <NotScouted username={target} error={error} />
      </div>
    );

  // Home
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <main className="relative z-[2] flex min-h-screen flex-col">
        <div className="absolute right-[clamp(20px,5vw,52px)] top-[clamp(16px,3vh,26px)] z-[3]">
          <GithubStar stars={stars} />
        </div>
        <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-center gap-[clamp(24px,5vw,72px)] px-[clamp(22px,5vw,56px)] max-[860px]:flex-col max-[860px]:gap-[34px] max-[860px]:pb-6 max-[860px]:pt-[clamp(56px,10vh,88px)] max-[860px]:text-center">
          <ScoutForm
            loading={false}
            error={null}
            scoutCount={null}
            onScout={handleScout}
            onOpenModal={() => setModalOpen(true)}
          />
          <CardFan cards={SAMPLE_CARDS} onPick={handleScout} />
        </div>

        {/* your FIFA binder — saved in this browser, click any to reopen */}
        <Collection onOpen={openStored} />

        <footer className="relative z-[2] flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
          <FooterCredit />
        </footer>
      </main>

      {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
      <WhatsNew />
    </div>
  );
}
