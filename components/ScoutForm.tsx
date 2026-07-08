"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowRight, Lock, Check, ExternalLink } from "lucide-react";
import Mascot from "./Mascot";
import { setPat, clearPat, subscribePat, hasPatSnapshot, hasPatServerSnapshot } from "@/lib/pat";

// GitHub's token page, pre-checked with the scopes needed to read a colleague's
// private contribution counts in a shared org.
const TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=read:user,read:org,repo&description=gitfut%20private%20scouting";

interface Props {
  loading: boolean;
  error: string | null;
  scoutCount: number | null;
  onScout: (name: string) => void;
  onOpenModal: () => void;
}

export default function ScoutForm({
  loading,
  error,
  scoutCount,
  onScout,
  onOpenModal,
}: Props) {
  const [name, setName] = useState("");

  // Private scouting: the viewer's own GitHub PAT, kept only in their browser.
  const [patOpen, setPatOpen] = useState(false);
  const [patInput, setPatInput] = useState("");
  const patSaved = useSyncExternalStore(subscribePat, hasPatSnapshot, hasPatServerSnapshot);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onScout(name);
  };

  const savePat = () => {
    setPat(patInput);
    setPatInput("");
    setPatOpen(false);
  };

  const removePat = () => {
    clearPat();
    setPatInput("");
  };

  return (
    <div className="min-w-0 flex-1">
      {/* mascot — the brand face on the hero */}
      <div className="mb-1 -ml-2 max-[860px]:mx-auto max-[860px]:flex max-[860px]:justify-center">
        <Mascot size={150} />
      </div>

      {/* crossover "fixture" tag — the dev world (mono GITHUB) versus the
          tournament (broadcast WORLD CUP 26), joined by the × the concept implies.
          No status-pill or pulsing dot — the type carries it. */}
      <div className="mb-[18px] inline-flex items-center gap-[9px] rounded-[8px] border border-white/[0.08] bg-white/[0.025] px-[12px] py-[6px] max-[860px]:mx-auto">
        <span className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-ink-soft">
          GITHUB
        </span>
        <span className="font-display text-[15px] mt-[1px] leading-none text-brand">
          ×
        </span>
        <span className="font-display text-[15px] leading-none tracking-[.06em] text-ink">
          WORLD CUP <span className="text-gold-hi">26</span>
        </span>
      </div>

      <h1 className="font-display m-0 mb-3 text-[clamp(52px,7vw,104px)] leading-[.82] tracking-[.005em]">
        GET <span className="text-brand">PRIVATE</span> SCOUTED
        <span className="text-brand">.</span>
      </h1>
      <p className="mb-[26px] max-w-[440px] text-[clamp(15px,1.7vw,18px)] font-medium leading-[1.5] text-ink-dim max-[860px]:mx-auto">
        Your GitHub stats, private contributions you can see included, turned
        into a World-Cup-style player card rated out of 99.
      </p>

      <form
        onSubmit={submit}
        className="m-0 flex max-w-[460px] flex-wrap gap-[10px] max-[860px]:mx-auto"
      >
        <div className="relative min-w-[200px] flex-1">
          <span className="font-mono pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[17px] font-semibold text-brand/70"></span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="github username"
            autoComplete="off"
            spellCheck={false}
            aria-label="GitHub username"
            className="font-mono h-14 w-full rounded-[14px] border-[1.5px] border-line bg-surface/70 pl-[34px] pr-5 text-[16px] font-medium text-white outline-none backdrop-blur-[4px] transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(126,200,242,.16),0_0_42px_rgba(126,200,242,.24)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="font-display group flex h-14 items-center gap-2 rounded-[14px] bg-gradient-to-b from-brand to-brand-mid px-7 text-[20px] tracking-[.06em] text-[#04130a] shadow-[0_0_0_1px_rgba(126,200,242,.4),0_10px_30px_rgba(126,200,242,.3)] transition hover:from-brand-hi hover:to-brand disabled:cursor-wait disabled:opacity-75"
        >
          {loading ? "SCOUTING…" : "SCOUT"}
          {!loading && (
            <ArrowRight
              size={19}
              strokeWidth={2.6}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-[13px] max-w-[460px] rounded-[10px] border border-[#f85149]/30 bg-[#f85149]/10 px-[13px] py-[10px] text-[13.5px] font-medium text-[#ff9d96]"
        >
          {error}
        </div>
      )}

      {/* No token: an explicit two-way choice — paste a token to scout privately
          here, or go public on the original gitfut.com. With a token saved, show
          the status plus a way to replace it. */}
      {!patSaved ? (
        <div className="mt-[18px] flex flex-wrap items-center gap-[10px] max-w-[460px] max-[860px]:justify-center">
          <button
            type="button"
            onClick={() => setPatOpen(true)}
            className="inline-flex items-center gap-[8px] rounded-[12px] border border-brand/45 bg-brand/[0.12] px-[16px] py-[11px] text-[13.5px] font-semibold text-brand transition hover:bg-brand/[0.18]"
          >
            <Lock size={14} strokeWidth={2.4} />
            Use my token for private
          </button>
          <a
            href="https://gitfut.com"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[7px] rounded-[12px] border border-line bg-surface/50 px-[16px] py-[11px] text-[13.5px] font-semibold text-ink-soft transition hover:border-ink-mute hover:text-ink"
          >
            See public on gitfut.com
            <ArrowRight size={14} strokeWidth={2.6} />
          </a>
        </div>
      ) : (
        <div className="mt-[18px] flex flex-wrap items-center gap-[12px] max-w-[460px] max-[860px]:justify-center">
          <span className="inline-flex items-center gap-[7px] text-[13px] font-semibold text-brand">
            <Check size={14} strokeWidth={2.6} /> private scouting on
          </span>
          <button
            type="button"
            onClick={() => setPatOpen((o) => !o)}
            className="text-[12.5px] font-semibold text-ink-mute underline-offset-2 transition hover:text-ink hover:underline"
          >
            replace token
          </button>
        </div>
      )}

      {/* the token paste panel, opened by the button above */}
      <div className="max-w-[460px] max-[860px]:mx-auto">
        {patOpen && (
          <div className="mt-[12px] rounded-[12px] border border-line bg-surface/60 p-[14px] backdrop-blur-[4px]">
            <p className="mb-[10px] text-[12.5px] leading-[1.5] text-ink-dim">
              Paste a GitHub token to count the private contributions you can
              already see (e.g. teammates in a shared org). It&apos;s saved only in
              this browser (localStorage). It never touches our servers.
            </p>
            <ol className="mb-[12px] space-y-[5px] text-[12px] leading-[1.45] text-ink-soft">
              <li>
                <span className="font-mono text-brand">1.</span> Open{" "}
                <a
                  href={TOKEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  github.com/settings/tokens
                </a>{" "}
                (scopes come pre-checked).
              </li>
              <li>
                <span className="font-mono text-brand">2.</span> Keep{" "}
                <code className="font-mono text-ink">read:user</code>,{" "}
                <code className="font-mono text-ink">read:org</code>,{" "}
                <code className="font-mono text-ink">repo</code> ticked →{" "}
                <span className="font-semibold">Generate token</span>.
              </li>
              <li>
                <span className="font-mono text-brand">3.</span> Copy it and paste below → <span className="font-semibold">SAVE</span>.
              </li>
            </ol>
            <div className="flex flex-wrap gap-[8px]">
              <input
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                type="password"
                placeholder={patSaved ? "token saved, paste to replace" : "ghp_… or github_pat_…"}
                autoComplete="off"
                spellCheck={false}
                aria-label="GitHub personal access token"
                className="font-mono h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] border-line bg-surface/70 px-[13px] text-[13px] text-white outline-none transition focus:border-brand"
              />
              <button
                type="button"
                onClick={savePat}
                disabled={!patInput.trim()}
                className="font-display h-[42px] rounded-[10px] bg-gradient-to-b from-brand to-brand-mid px-[18px] text-[14px] tracking-[.04em] text-[#04130a] transition hover:from-brand-hi hover:to-brand disabled:opacity-40"
              >
                SAVE
              </button>
            </div>
            <div className="mt-[10px] flex items-center gap-[14px]">
              <a
                href={TOKEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-ink-soft underline-offset-2 transition hover:text-brand hover:underline"
              >
                create a token
                <ExternalLink size={12} strokeWidth={2.4} />
              </a>
              {patSaved && (
                <button
                  type="button"
                  onClick={removePat}
                  className="text-[12px] font-semibold text-[#ff9d96] underline-offset-2 transition hover:underline"
                >
                  remove token
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* live tally — a broadcast-style scoreboard count; the number is the
          social proof, so it leads in the display face with tabular figures. */}
      <div className="mt-[20px] flex flex-wrap items-center gap-x-[14px] gap-y-[10px] max-[860px]:justify-center">
        {scoutCount != null && (
          <>
            <span className="inline-flex items-baseline gap-[9px]">
              <span className="relative flex h-[7px] w-[7px] translate-y-[-1px] self-center" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-brand" />
              </span>
              <span className="font-display text-[20px] leading-none tabular-nums text-ink">
                {scoutCount.toLocaleString("en-US")}
              </span>
              <span className="text-[12px] text-ink-mute">cards rated</span>
            </span>
            <span aria-hidden className="h-[12px] w-px bg-white/[0.12] max-[860px]:hidden" />
          </>
        )}
        <button
          type="button"
          onClick={onOpenModal}
          className="cursor-pointer text-[12.5px] font-semibold text-ink-soft underline-offset-2 transition hover:text-brand hover:underline"
        >
          how it works ↗
        </button>
      </div>
    </div>
  );
}
