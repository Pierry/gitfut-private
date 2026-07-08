import { Layers } from "lucide-react";

export type WhatsNewItem = {
  /** Unique, stable slug — forms the "already seen" key in sessionStorage. */
  id: string;
  /** Headline, rendered in the Bebas display face — write it in CAPS. */
  title: string;
  /** One–two sentences of plain info: what it does, where to find it. */
  body: string;
  /** Flip to false to retire the item without deleting it. */
  show: boolean;
  /** Optional icon name to show in the header. */
  icon?: React.ComponentType<{ size: number }>;
};

export const WHATS_NEW: WhatsNewItem[] = [
  {
    id: "collection",
    title: "YOUR COLLECTION",
    body: 'Every card you scout is saved in this browser. Find them under "Your Scouts" on the home page, and click any to reopen it.',
    show: true,
    icon: Layers,
  },
];
