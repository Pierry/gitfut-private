"use client";

import { useSyncExternalStore } from "react";
import PlayerCard from "./PlayerCard";
import {
  subscribeCollection,
  getCollectionSnapshot,
  getServerSnapshot,
  removeFromCollection,
} from "@/lib/collection";
import type { Card } from "@/lib/scoring/types";

// The FIFA-binder section: every card you've scouted, saved in this browser,
// laid out side by side. Click one to open its detail (straight from storage,
// no refetch). Renders nothing until you've scouted at least one.
export default function Collection({ onOpen }: { onOpen: (card: Card) => void }) {
  const cards = useSyncExternalStore(subscribeCollection, getCollectionSnapshot, getServerSnapshot);
  if (!cards.length) return null;

  return (
    <section className="relative z-[2] mx-auto w-full max-w-[1180px] px-[clamp(22px,5vw,56px)] pb-[64px] pt-[8px]">
      <div className="mb-[20px] flex items-baseline gap-[11px] border-t border-white/[0.08] pt-[26px]">
        <h2 className="font-display text-[clamp(22px,3vw,30px)] tracking-[.03em] text-ink">YOUR SCOUTS</h2>
        <span className="font-mono text-[12.5px] text-ink-mute">
          {cards.length} card{cards.length > 1 ? "s" : ""}, saved in this browser
        </span>
      </div>

      <div className="flex flex-wrap gap-[clamp(14px,1.8vw,22px)] max-[560px]:justify-center">
        {cards.map((card) => (
          <div
            key={card.login}
            onClick={() => onOpen(card)}
            className="group relative w-[clamp(100px,12vw,138px)] cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-[7px]"
          >
            <PlayerCard card={card} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFromCollection(card.login);
              }}
              aria-label={`Remove ${card.login}`}
              className="absolute -right-[7px] -top-[7px] z-[2] flex h-[22px] w-[22px] items-center justify-center rounded-full border border-line bg-bg-deep text-[11px] text-ink-mute opacity-0 shadow-md transition group-hover:opacity-100 hover:border-ink-mute hover:text-ink"
            >
              ✕
            </button>
            <div className="mt-[8px] truncate text-center font-mono text-[11.5px] text-ink-mute transition group-hover:text-ink-soft">
              @{card.login}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
