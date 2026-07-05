"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Swords } from "lucide-react";

export default function DuelButton({ login }: { login: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const away = opponent.trim().replace(/^@/, "");
    if (!away || isPending) return;
    startTransition(() =>
      router.push(
        `/${encodeURIComponent(login)}/vs/${encodeURIComponent(away)}`,
      ),
    );
  };

  // Shared strip chrome: pitch-dark panel, brand edge, centre-circle motif.
  const strip =
    "relative w-full overflow-hidden rounded-xl border border-brand/40 bg-[#0a1710] shadow-[inset_0_1px_0_rgba(57,211,83,.18),0_8px_24px_-10px_rgba(57,211,83,.35)]";

  const centreCircle = (
    <svg
      aria-hidden
      viewBox="0 0 200 60"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
    >
      {/* halfway line + centre circle — the fixture happens on a pitch */}
      <line x1="100" y1="0" x2="100" y2="60" stroke="#39d353" strokeWidth="1" />
      <circle
        cx="100"
        cy="30"
        r="22"
        fill="none"
        stroke="#39d353"
        strokeWidth="1"
      />
      <circle cx="100" cy="30" r="2.5" fill="#39d353" />
    </svg>
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Challenge someone to a duel"
        className={`${strip} group flex h-[50px] items-center justify-between px-[16px] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-brand/70 hover:shadow-[inset_0_1px_0_rgba(57,211,83,.25),0_12px_30px_-10px_rgba(57,211,83,.55)] active:translate-y-0 active:scale-[.985]`}
      >
        {centreCircle}
        {/* floodlight sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
        <span className="relative font-mono text-[12.5px] font-semibold text-ink-soft">
          @{login}
        </span>
        <span className="font-display relative flex items-center gap-[8px] text-[19px] tracking-[.08em] text-brand transition-transform duration-300 group-hover:scale-110">
          <Swords size={16} strokeWidth={2.4} />
          VS
        </span>
        <span className="font-display relative text-[15px] tracking-[.08em] text-ink-dim transition-colors group-hover:text-ink">
          PICK A RIVAL
        </span>
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      // Collapse when focus leaves the strip entirely (click-away / tab-out),
      // so a mouse user who opened it by accident isn't stuck with the input.
      // Deferred + activeElement (not relatedTarget): on Safari/iOS blur fires
      // before the submit click with a null relatedTarget, which would unmount
      // the form and swallow KICK OFF. Checking on the next tick lets focus
      // land on the button first; formRef becomes null on unmount, guarding it.
      onBlur={() => {
        if (isPending) return;
        setTimeout(() => {
          if (!formRef.current?.contains(document.activeElement)) setOpen(false);
        }, 0);
      }}
      className={`${strip} flex h-[50px] items-center gap-[10px] px-[12px]`}
    >
      {centreCircle}
      <span className="relative shrink-0 font-mono text-[12.5px] font-semibold text-ink-soft max-[360px]:hidden">
        @{login}
      </span>
      <span className="font-display relative shrink-0 text-[17px] tracking-[.08em] text-brand">
        VS
      </span>
      <input
        ref={inputRef}
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="their username"
        autoComplete="off"
        spellCheck={false}
        aria-label="Opponent's GitHub username"
        className="font-mono relative h-[34px] w-full min-w-0 flex-1 rounded-[8px] border border-line bg-bg/80 px-[10px] text-[13.5px] text-white outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(57,211,83,.15)]"
      />
      <button
        type="submit"
        disabled={isPending}
        aria-label="Kick off the duel"
        className="font-display relative flex h-[34px] shrink-0 items-center gap-[6px] rounded-[8px] bg-gradient-to-b from-brand to-brand-mid px-[13px] text-[14px] tracking-[.06em] text-[#04130a] transition hover:from-brand-hi hover:to-brand disabled:cursor-wait disabled:opacity-75"
      >
        {isPending ? (
          <span className="h-[13px] w-[13px] animate-spin rounded-full border-[1.5px] border-[#04130a]/30 border-t-[#04130a]" />
        ) : (
          <>
            KICK OFF
            <ArrowRight size={14} strokeWidth={2.6} />
          </>
        )}
      </button>
    </form>
  );
}
